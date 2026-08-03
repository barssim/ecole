import React, { useState, useEffect } from "react";
import { getTenantId } from "../tenant";
import { resolveApiBaseUrl } from "../utils/apiBaseUrl";
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

const TeacherCourses = ({ language }) => {
  const userId = localStorage.getItem("userId");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add course form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  // Per-course file upload
  const [uploadingForCourse, setUploadingForCourse] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch courses on load
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/teachercourses?teacher=${userId}`, {
          headers: buildHeaders(false),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Impossible de charger les cours. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchCourses();
  }, [userId]);

  const flashSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  // Add course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/teachercourses`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ ...newCourse, teacherId: userId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      setCourses((prev) => [...prev, created]);
      setNewCourse({ name: "", description: "" });
      setShowAddForm(false);
      flashSuccess("Cours ajouté avec succès !");
    } catch {
      setError("Erreur lors de l'ajout du cours.");
    } finally {
      setSaving(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Supprimer ce cours ?")) return;
    try {
      await fetch(`${API_BASE}/api/teachercourses/${courseId}`, {
        method: "DELETE",
        headers: buildHeaders(false),
      });
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      flashSuccess("Cours supprimé.");
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  // Upload file for a course
  const handleUpload = async (courseId) => {
    if (!uploadFile) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("courseId", courseId);
    try {
      const token = sessionStorage.getItem("jwt_token");
      const res = await fetch(`${API_BASE}/api/teachercourses/${courseId}/upload`, {
        method: "POST",
        headers: {
          "X-Tenant-Id": getTenantId(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updatedCourse = await res.json();
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? updatedCourse : c))
      );
      setUploadFile(null);
      setUploadingForCourse(null);
      flashSuccess("Fichier uploadé avec succès !");
    } catch {
      setError("Erreur lors de l'upload du fichier.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="tc-container">
      {/* Header */}
      <div className="tc-header">
        <h2 className="tc-title">📚 Mes Cours</h2>
        <button
          className="tc-btn tc-btn-primary"
          onClick={() => { setShowAddForm((v) => !v); setError(""); }}
        >
          {showAddForm ? "✕ Annuler" : "＋ Ajouter un cours"}
        </button>
      </div>

      {/* Feedback */}
      {error && <div className="tc-alert tc-alert-error">{error}</div>}
      {success && <div className="tc-alert tc-alert-success">{success}</div>}

      {/* Add Course Form */}
      {showAddForm && (
        <form className="tc-add-form" onSubmit={handleAddCourse}>
          <h3>Nouveau cours</h3>
          <div className="tc-form-group">
            <label>Nom du cours *</label>
            <input
              type="text"
              placeholder="Ex: Mathématiques – Terminale"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              required
            />
          </div>
          <div className="tc-form-group">
            <label>Description</label>
            <textarea
              placeholder="Brève description du cours..."
              rows={3}
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            />
          </div>
          <div className="tc-form-actions">
            <button type="submit" className="tc-btn tc-btn-success" disabled={saving}>
              {saving ? "Enregistrement..." : "💾 Enregistrer le cours"}
            </button>
            <button
              type="button"
              className="tc-btn tc-btn-ghost"
              onClick={() => { setShowAddForm(false); setNewCourse({ name: "", description: "" }); }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Course List */}
      {loading ? (
        <p className="tc-loading">Chargement des cours...</p>
      ) : courses.length === 0 ? (
        <div className="tc-empty">
          <p>📭 Aucun cours trouvé.</p>
          <p>Cliquez sur <strong>«&nbsp;Ajouter un cours&nbsp;»</strong> pour commencer.</p>
        </div>
      ) : (
        <div className="tc-course-list">
          {courses.map((course) => (
            <div className="tc-course-card" key={course.id}>
              <div className="tc-course-card-header">
                <div>
                  <h3 className="tc-course-name">{course.name}</h3>
                  {course.description && (
                    <p className="tc-course-desc">{course.description}</p>
                  )}
                </div>
                <div className="tc-course-actions">
                  <button
                    className="tc-btn tc-btn-upload"
                    onClick={() =>
                      setUploadingForCourse(
                        uploadingForCourse === course.id ? null : course.id
                      )
                    }
                  >
                    📤 Upload fichier
                  </button>
                  <button
                    className="tc-btn tc-btn-danger"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* File list */}
              {Array.isArray(course.files) && course.files.length > 0 && (
                <ul className="tc-file-list">
                  {course.files.map((f, i) => (
                    <li key={i}>
                      📄{" "}
                      <a href={f.url} target="_blank" rel="noopener noreferrer">
                        {f.name || f.filename || `Fichier ${i + 1}`}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {/* Upload panel */}
              {uploadingForCourse === course.id && (
                <div className="tc-upload-panel">
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                  />
                  <button
                    className="tc-btn tc-btn-primary"
                    disabled={!uploadFile || uploading}
                    onClick={() => handleUpload(course.id)}
                  >
                    {uploading ? "Upload en cours..." : "📤 Envoyer"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;
