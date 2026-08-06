import React, { useEffect, useMemo, useRef, useState } from "react";
import { getTenantId } from "../tenant";
import { resolveApiBaseUrl } from "../utils/apiBaseUrl";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import "../cssFiles/TeacherCourses.css";

const API_BASE = resolveApiBaseUrl();

const buildHeaders = (isJson = true) => {
  const token = sessionStorage.getItem("jwt_token");
  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    "X-Tenant-Id": getTenantId(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getLocalUploadsKey = (userId) => `teachercourses_uploaded_${userId || "anonymous"}`;

const isPdfFile = (file) => {
  if (!file) return false;
  if (file.type === "application/pdf") return true;
  return String(file.name || "").toLowerCase().endsWith(".pdf");
};

const safeReadLocalUploads = (userId) => {
  try {
    const raw = localStorage.getItem(getLocalUploadsKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const TeacherCourses = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const userId = localStorage.getItem("userId");
  const fileInputRef = useRef(null);

  const [backendCourses, setBackendCourses] = useState([]);
  const [localUploads, setLocalUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [courseTitle, setCourseTitle] = useState("");
  const [courseFile, setCourseFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState(null);

  const persistLocalUploads = (items) => {
    if (!userId) return;
    try {
      localStorage.setItem(getLocalUploadsKey(userId), JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  };

  const flashSuccess = (msg) => {
    setSuccess(msg);
    window.setTimeout(() => setSuccess(""), 3000);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/api/teachercourses?teacher=${userId}`, {
          headers: buildHeaders(false),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBackendCourses(Array.isArray(data) ? data : []);
      } catch {
        setError("Impossible de charger les cours. Veuillez réessayer.");
        setBackendCourses([]);
      } finally {
        setLoading(false);
      }
    };

    const local = safeReadLocalUploads(userId);
    setLocalUploads(local);
    fetchCourses();
  }, [userId]);

  const mergedCourses = useMemo(() => {
    const combined = [...localUploads, ...backendCourses];
    const seen = new Set();

    return combined
      .filter((course) => {
        const key = String(course.id ?? course.localId ?? course.name ?? course.fileName ?? "");
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const aDate = new Date(a.uploadedAt || a.createdAt || 0).getTime();
        const bDate = new Date(b.uploadedAt || b.createdAt || 0).getTime();
        if (aDate !== bDate) return bDate - aDate;
        return String(a.name || a.fileName || "").localeCompare(String(b.name || b.fileName || ""));
      });
  }, [backendCourses, localUploads]);

  const handleUploadCourse = async (e) => {
    e.preventDefault();
    if (!courseFile) {
      setError("Veuillez choisir un fichier de cours.");
      return;
    }
    if (!isPdfFile(courseFile)) {
      setError("Seuls les fichiers PDF sont autorises.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", courseFile);
      formData.append("filename", courseTitle.trim() || courseFile.name);

      const token = sessionStorage.getItem("jwt_token");
      const uploadRes = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: {
          "X-Tenant-Id": getTenantId(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error(`HTTP ${uploadRes.status}`);
      }

      const uploadedFile = await uploadRes.json();
      const finalCourseName = courseTitle.trim() || uploadedFile.filename || courseFile.name;
      const payload = {
        name: finalCourseName,
        description: `Uploaded course file: ${uploadedFile.filename || courseFile.name}`,
        teacherId: userId,
        files: [uploadedFile],
      };

      let savedCourse = null;
      try {
        const saveRes = await fetch(`${API_BASE}/api/teachercourses`, {
          method: "POST",
          headers: buildHeaders(true),
          body: JSON.stringify(payload),
        });
        if (saveRes.ok) {
          savedCourse = await saveRes.json();
        }
      } catch {
        // If the backend doesn't support persisting uploaded course metadata,
        // we keep a local copy so the uploaded course remains visible in this view.
      }

      if (savedCourse) {
        setBackendCourses((prev) => [
          {
            ...savedCourse,
            uploadedFile,
            uploadedAt: savedCourse.uploadedAt || new Date().toISOString(),
          },
          ...prev,
        ]);
        flashSuccess(content.course_success || "Action réussie !");
      } else {
        const localCourse = {
          id: `local-${Date.now()}`,
          localOnly: true,
          name: finalCourseName,
          description: `Uploaded course file: ${uploadedFile.filename || courseFile.name}`,
          teacherId: userId,
          uploadedFile,
          uploadedAt: new Date().toISOString(),
        };
        setLocalUploads((prev) => {
          const next = [localCourse, ...prev];
          persistLocalUploads(next);
          return next;
        });
        flashSuccess(content.course_success || "Action réussie !");
      }

      setCourseTitle("");
      setCourseFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
        setError(content.course_error || "Erreur lors de l'envoi du fichier de cours.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    const courseId = course.id;
    if (!window.confirm("Supprimer ce cours ?")) return;

    setDeletingCourseId(courseId);
    setError("");

    try {
      if (course.localOnly || String(courseId).startsWith("local-")) {
        setLocalUploads((prev) => {
          const next = prev.filter((c) => c.id !== courseId);
          persistLocalUploads(next);
          return next;
        });
        flashSuccess("Cours supprimé.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/teachercourses/${courseId}`, {
        method: "DELETE",
        headers: buildHeaders(false),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setBackendCourses((prev) => prev.filter((c) => String(c.id) !== String(courseId)));
      flashSuccess("Cours supprimé.");
    } catch {
      setError("Erreur lors de la suppression.");
    } finally {
      setDeletingCourseId(null);
    }
  };

  const renderFiles = (course) => {
    const files = Array.isArray(course.files) && course.files.length > 0
      ? course.files
      : course.uploadedFile
        ? [course.uploadedFile]
        : [];

    if (files.length === 0) {
      return null;
    }

    return (
      <ul className="tc-file-list">
        {files.map((file, index) => (
          <li key={file.url || file.filename || index}>
            📄{" "}
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              {file.filename || file.name || `Fichier ${index + 1}`}
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="tc-container">
      <div className="tc-header">
        <h2 className="tc-title">📚 Mes cours</h2>
        <div style={{ color: "#6b7280", fontSize: 14 }}>
          {mergedCourses.length} {mergedCourses.length > 1 ? "cours" : "cours"}
        </div>
      </div>

      {error && <div className="tc-alert tc-alert-error">{error}</div>}
      {success && <div className="tc-alert tc-alert-success">{success}</div>}

      <form className="tc-add-form" onSubmit={handleUploadCourse}>
        <h3>{content.course_upload_title || "➕ Envoyer un fichier de cours"}</h3>
        <div className="tc-form-group">
          <label>Titre du cours</label>
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="Ex: Mathématiques - Chapitre 1"
          />
        </div>
        <div className="tc-form-group">
          <label>Fichier du cours *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setCourseFile(e.target.files?.[0] || null)}
            required
          />
        </div>
        <p style={{ marginTop: -4, marginBottom: 0, color: "#6b7280", fontSize: 13 }}>
          {content.course_uploaded_hint || "Le fichier téléchargé apparaîtra immédiatement dans la liste ci-dessous."}
        </p>
        <div className="tc-form-actions">
          <button type="submit" className="tc-btn tc-btn-success" disabled={uploading}>
            {uploading
              ? (content.course_uploading || "Envoi...")
              : (content.course_upload_action || "📤 Envoyer le cours")}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="tc-loading">Chargement des cours...</p>
      ) : mergedCourses.length === 0 ? (
        <div className="tc-empty">
          <p>📭 Aucun cours téléversé.</p>
          <p>Ajoutez votre premier fichier de cours ci-dessus.</p>
        </div>
      ) : (
        <div className="tc-course-list">
          {mergedCourses.map((course) => (
            <div className="tc-course-card" key={course.id}>
              <div className="tc-course-card-header">
                <div>
                  <h3 className="tc-course-name">{course.name}</h3>
                  {course.description && <p className="tc-course-desc">{course.description}</p>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <span style={{ background: "#e0f2fe", color: "#075985", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                      {course.localOnly || String(course.id).startsWith("local-")
                        ? (content.course_uploaded_badge || "Téléchargé")
                        : (content.course_synced_badge || "Synchronisé")}
                    </span>
                    {course.uploadedAt && (
                      <span style={{ background: "#f3f4f6", color: "#374151", borderRadius: 999, padding: "2px 10px", fontSize: 12 }}>
                        {new Date(course.uploadedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="tc-course-actions">
                  <button
                    className="tc-btn tc-btn-danger"
                    onClick={() => handleDeleteCourse(course)}
                    disabled={deletingCourseId === course.id}
                  >
                    {deletingCourseId === course.id ? "..." : "🗑️ Supprimer"}
                  </button>
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

export default TeacherCourses;
