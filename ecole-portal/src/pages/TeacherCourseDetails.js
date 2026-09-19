import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getTenantId } from "../tenant";
import { resolveApiBaseUrl } from "../utils/apiBaseUrl";
import "../cssFiles/TeacherCourses.css";

const API_BASE = resolveApiBaseUrl();

const TeacherCourseDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(location.state?.course || null);
  const [loading, setLoading] = useState(!course);
  const [error, setError] = useState("");

  useEffect(() => {
    if (course) return undefined;

    const teacherId = localStorage.getItem("userId");
    fetch(`${API_BASE}/api/teachercourses?teacher=${encodeURIComponent(teacherId || "")}`, {
      headers: {
        "X-Tenant-Id": getTenantId(),
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((courses) => {
        const found = (Array.isArray(courses) ? courses : []).find(
          (item) => String(item.id) === String(id)
        );
        if (!found) throw new Error("Course not found");
        setCourse(found);
      })
      .catch(() => setError("Impossible de charger ce cours."))
      .finally(() => setLoading(false));
  }, [course, id]);

  if (loading) return <div className="tc-container"><p className="tc-loading">Chargement du cours...</p></div>;
  if (error || !course) {
    return (
      <div className="tc-container">
        <div className="tc-alert tc-alert-error">{error || "Cours introuvable."}</div>
        <button className="tc-btn tc-btn-primary" onClick={() => navigate("/enseignant/cours")}>
          Retour aux cours
        </button>
      </div>
    );
  }

  const files = Array.isArray(course.files) && course.files.length
    ? course.files
    : course.uploadedFile ? [course.uploadedFile] : [];

  return (
    <div className="tc-container">
      <button className="tc-btn tc-btn-ghost" onClick={() => navigate("/enseignant/cours")}>
        ← Retour aux cours
      </button>
      <article className="tc-course-detail">
        {location.state?.created && (
          <div className="tc-alert tc-alert-success">Cours créé avec succès.</div>
        )}
        <h2 className="tc-title">{course.name}</h2>
        {course.description && <p className="tc-course-desc">{course.description}</p>}
        <p className="tc-course-meta">
          Créé le {new Date(course.uploadedAt || course.createdAt).toLocaleString()}
        </p>
        {files.length > 0 && (
          <ul className="tc-file-list">
            {files.map((file, index) => (
              <li key={file.url || file.filename || index}>
                📄 <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.filename || file.name || `Fichier ${index + 1}`}
                </a>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
};

export default TeacherCourseDetails;
