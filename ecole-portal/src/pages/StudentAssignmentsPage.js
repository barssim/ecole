import React, { useEffect, useState } from "react";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import { getTenantId } from "../tenant";
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

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
};

const StudentAssignmentsPage = ({ language }) => {
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
    "X-Tenant-Id": getTenantId(),
    ...(token ? { Authorization: "Bearer " + token } : {}),
  });

  const [className, setClassName] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [readingFile, setReadingFile] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      setNotice("");
      setError("");
      setClassName("");
      try {
        const headers = buildHeaders();
        const classesResponse = await fetch(apiUrlFor("/classes"), { headers });
        const classes = await readJsonResponse(
          classesResponse,
          content.assignment_noAssignments || "Impossible de charger les devoirs."
        );
        const studentClass = Array.isArray(classes)
          ? classes.find((schoolClass) =>
              (schoolClass.students || []).some(
                (student) => isStudentMatch(student, currentUserName)
              )
            )
          : null;

        if (!studentClass) {
          setAssignments([]);
          setNotice(content.assignment_selectClassHint || "Aucune classe ne vous est assignée.");
          return;
        }

        setClassName(studentClass.name || "");
        const assignmentsResponse = await fetch(
          apiUrlFor(`/teacher/assignments?classId=${encodeURIComponent(studentClass.id)}`),
          { headers }
        );
        const data = await readJsonResponse(
          assignmentsResponse,
          content.assignment_noAssignments || "Impossible de charger les devoirs."
        );
        setAssignments(Array.isArray(data) ? data : []);
        if (!Array.isArray(data) || data.length === 0) {
          setNotice(content.assignment_noAssignments || "Aucun devoir pour le moment.");
        }
      } catch (err) {
        setError(err.message || content.assignment_noAssignments || "Impossible de charger les devoirs.");
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [currentUserName]);

  const handleReadFile = async (assignment) => {
    if (!assignment?.attachmentUrl) return;

    const fileWindow = window.open("", "_blank");
    if (!fileWindow) {
      setError("Autorisez les fenêtres contextuelles pour lire le fichier.");
      return;
    }

    setReadingFile(assignment.attachmentUrl);
    setError("");
    try {
      const response = await fetch(
        assignment.attachmentUrl.startsWith("http")
          ? assignment.attachmentUrl
          : apiUrlFor(assignment.attachmentUrl.replace(/^\/api/, "")),
        { headers: buildHeaders() }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      fileWindow.location.href = blobUrl;
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      fileWindow.close();
      setError("Impossible d'ouvrir le fichier. Veuillez réessayer.");
    } finally {
      setReadingFile("");
    }
  };

  return (
    <div className="tc-container">
      <div className="tc-header">
        <h2 className="tc-title">📝 {content.assignment_title || "Devoirs et Tâches"}</h2>
        {className && (
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            {content.schedule_classLabel || "Classe"}: <strong>{className}</strong>
          </div>
        )}
      </div>

      {error && <div className="tc-alert tc-alert-error">{error}</div>}

      {loading ? (
        <p className="tc-loading">Chargement des devoirs...</p>
      ) : assignments.length === 0 ? (
        <div className="tc-empty">
          <p>📭 {notice || content.assignment_noAssignments || "Aucun devoir disponible."}</p>
        </div>
      ) : (
        <div className="tc-course-list">
          {assignments.map((assignment) => (
            <div className="tc-course-card" key={assignment.id}>
              <div className="tc-course-card-header">
                <div>
                  <h3 className="tc-course-name">{assignment.title}</h3>
                  {assignment.description && <p className="tc-course-desc">{assignment.description}</p>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <span
                      style={{
                        background: isOverdue(assignment.dueDate) ? "#fee2e2" : "#f3f4f6",
                        color: isOverdue(assignment.dueDate) ? "#991b1b" : "#374151",
                        borderRadius: 999,
                        padding: "2px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      📅 {assignment.dueDate}
                      {isOverdue(assignment.dueDate) ? ` · ${content.assignment_overdue || "En retard"}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {assignment.attachmentUrl && (
                <ul className="tc-file-list">
                  <li>
                    📄{" "}
                    <span>{assignment.attachmentName || "Pièce jointe"}</span>{" "}
                    <button
                      type="button"
                      className="tc-btn tc-btn-primary tc-btn-read"
                      onClick={() => handleReadFile(assignment)}
                      disabled={readingFile === assignment.attachmentUrl}
                    >
                      {readingFile === assignment.attachmentUrl ? "Ouverture..." : "Lire"}
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentsPage;
