import React, { useEffect, useState } from "react";
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

const StudentCoursesPage = ({ language }) => {
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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [readingFile, setReadingFile] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setNotice("");
      setError("");
      setClassName("");
      try {
        const headers = buildHeaders();
        const classesResponse = await fetch(apiUrlFor("/classes"), { headers });
        const classes = await readJsonResponse(
          classesResponse,
          content.courses_noData || "Impossible de charger les cours."
        );
        const studentClass = Array.isArray(classes)
          ? classes.find((schoolClass) =>
              (schoolClass.students || []).some(
                (student) => isStudentMatch(student, currentUserName)
              )
            )
          : null;

        if (!studentClass) {
          setCourses([]);
          setNotice(content.courses_noClass || "Aucune classe ne vous est assignée.");
          return;
        }

        setClassName(studentClass.name || "");
        const coursesResponse = await fetch(
          apiUrlFor(`/teachercourses?classId=${encodeURIComponent(studentClass.id)}`),
          { headers }
        );
        const data = await readJsonResponse(
          coursesResponse,
          content.courses_noData || "Impossible de charger les cours."
        );
        setCourses(Array.isArray(data) ? data : []);
        if (!Array.isArray(data) || data.length === 0) {
          setNotice(content.courses_empty || "Aucun cours disponible pour votre classe.");
        }
      } catch (err) {
        setError(err.message || content.courses_noData || "Impossible de charger les cours.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentUserName]);

  const handleReadFile = async (file) => {
    if (!file?.url) return;

    const fileWindow = window.open("", "_blank");
    if (!fileWindow) {
      setError("Autorisez les fenêtres contextuelles pour lire le PDF.");
      return;
    }

    setReadingFile(file.url);
    setError("");
    try {
      const response = await fetch(
        file.url.startsWith("http") ? file.url : apiUrlFor(file.url.replace(/^\/api/, "")),
        { headers: buildHeaders() }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      fileWindow.location.href = pdfUrl;
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
    } catch {
      fileWindow.close();
      setError("Impossible d'ouvrir le PDF. Veuillez réessayer.");
    } finally {
      setReadingFile("");
    }
  };

  const renderFiles = (course) => {
    const files = Array.isArray(course.files) ? course.files : [];
    if (files.length === 0) return null;

    return (
      <ul className="tc-file-list">
        {files.map((file, index) => (
          <li key={file.url || file.filename || index}>
            📄{" "}
            <span>{file.filename || file.name || `Fichier ${index + 1}`}</span>{" "}
            <button
              type="button"
              className="tc-btn tc-btn-primary tc-btn-read"
              onClick={() => handleReadFile(file)}
              disabled={readingFile === file.url}
            >
              {readingFile === file.url ? "Ouverture..." : "Lire"}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="tc-container">
      <div className="tc-header">
        <h2 className="tc-title">📚 {content.courses_title || "Mes cours"}</h2>
        {className && (
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            {content.schedule_classLabel || "Classe"}: <strong>{className}</strong>
          </div>
        )}
      </div>

      {error && <div className="tc-alert tc-alert-error">{error}</div>}

      {loading ? (
        <p className="tc-loading">Chargement des cours...</p>
      ) : courses.length === 0 ? (
        <div className="tc-empty">
          <p>📭 {notice || "Aucun cours disponible."}</p>
        </div>
      ) : (
        <div className="tc-course-list">
          {courses.map((course) => (
            <div className="tc-course-card" key={course.id}>
              <div className="tc-course-card-header">
                <div>
                  <h3 className="tc-course-name">{course.name}</h3>
                  {course.description && <p className="tc-course-desc">{course.description}</p>}
                  {course.uploadedAt && (
                    <span style={{ background: "#f3f4f6", color: "#374151", borderRadius: 999, padding: "2px 10px", fontSize: 12 }}>
                      {new Date(course.uploadedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              {renderFiles(course)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;
