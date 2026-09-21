import React, { useEffect, useMemo, useState } from "react";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import { getSchoolId } from "../school";
import { createApiUrlFor, readJsonResponse } from "../utils/apiClient";
import "../cssFiles/TeacherCourses.css";

const normalizeText = (value) => String(value || "")
  .trim()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

const normalizeKey = (value) => normalizeText(value).replace(/[^a-z0-9]/g, "");

// Class rosters store the student's full display name (e.g. "jannat Jennat"),
// while the logged-in identity is often just the username/surname (e.g. "Jennat").
// Match if either normalized form fully matches, or one is contained in the other.
const isStudentMatch = (storedName, loginName) => {
  const stored = normalizeKey(storedName);
  const login = normalizeKey(loginName);
  if (!stored || !login) return false;
  if (stored === login) return true;
  if (login.length >= 3 && (stored.includes(login) || login.includes(stored))) return true;
  return false;
};

const StudentGradesPage = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;

  const currentUserName = (
    localStorage.getItem("LoggedIn")
    || localStorage.getItem("userName")
    || localStorage.getItem("username")
    || ""
  );

  const apiUrlFor = createApiUrlFor("http://localhost:8085");
  const token = sessionStorage.getItem("jwt_token");

  const buildHeaders = () => ({
    "X-School-Id": getSchoolId(),
    ...(token ? { Authorization: "Bearer " + token } : {}),
  });

  const [className, setClassName] = useState("");
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      setNotice("");
      setError("");
      setClassName("");
      try {
        const headers = buildHeaders();
        const classesResponse = await fetch(apiUrlFor("/classes"), { headers });
        const classes = await readJsonResponse(
          classesResponse,
          content.grades_noGrades || "Impossible de charger les notes."
        );
        const studentClass = Array.isArray(classes)
          ? classes.find((schoolClass) =>
              (schoolClass.students || []).some(
                (student) => isStudentMatch(student, currentUserName)
              )
            )
          : null;

        if (!studentClass) {
          setGrades([]);
          setNotice(content.assignment_selectClassHint || "Aucune classe ne vous est assignée.");
          return;
        }

        setClassName(studentClass.name || "");
        const gradesResponse = await fetch(
          apiUrlFor(`/teacher/notes?classId=${encodeURIComponent(studentClass.id)}`),
          { headers }
        );
        const data = await readJsonResponse(
          gradesResponse,
          content.grades_noGrades || "Impossible de charger les notes."
        );
        const allEntries = Array.isArray(data) ? data : [];
        const myGrades = allEntries.filter((entry) =>
          isStudentMatch(entry.studentName, currentUserName)
        );
        setGrades(myGrades);
        if (myGrades.length === 0) {
          setNotice(content.grades_noGrades || "Aucune note disponible pour le moment.");
        }
      } catch (err) {
        setError(err.message || content.grades_noGrades || "Impossible de charger les notes.");
        setGrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [currentUserName]);

  const average = useMemo(() => {
    if (grades.length === 0) return null;
    const total = grades.reduce((sum, entry) => sum + Number(entry.grade || 0), 0);
    return (total / grades.length).toFixed(2);
  }, [grades]);

  return (
    <div className="tc-container">
      <div className="tc-header">
        <h2 className="tc-title">📊 {content.grades_myTitle || "Mes notes"}</h2>
        {className && (
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            {content.grades_class || content.schedule_classLabel || "Classe"}: <strong>{className}</strong>
          </div>
        )}
      </div>

      {error && <div className="tc-alert tc-alert-error">{error}</div>}

      {loading ? (
        <p className="tc-loading">Chargement des notes...</p>
      ) : grades.length === 0 ? (
        <div className="tc-empty">
          <p>📭 {notice || content.grades_noGrades || "Aucune note disponible."}</p>
        </div>
      ) : (
        <>
          {average !== null && (
            <div style={{ marginBottom: 16, fontWeight: 600 }}>
              {content.grades_average || "Moyenne"}: {average} / 20
            </div>
          )}
          <div className="tc-course-list">
            {grades.map((entry) => (
              <div className="tc-course-card" key={entry.id}>
                <div className="tc-course-card-header">
                  <div>
                    <h3 className="tc-course-name">{entry.subject}</h3>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                      <span
                        style={{
                          background: "#f3f4f6",
                          color: "#374151",
                          borderRadius: 999,
                          padding: "2px 10px",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {content.grades_date || "Date"}: {entry.date}
                      </span>
                      <span
                        style={{
                          background: "#dbeafe",
                          color: "#1e3a8a",
                          borderRadius: 999,
                          padding: "2px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {entry.grade} {content.grades_outOf || "sur"} 20
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentGradesPage;
