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
    ...(token ? { Authorization: `****** } : {}),
  };
};

const isPdfFile = (file) => {
  if (!file) return false;
  if (file.type === "application/pdf") return true;
  return String(file.name || "").toLowerCase().endsWith(".pdf");
};

const TeacherCourses = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const userId = localStorage.getItem("userId") || "";
  const teacherName = (
    localStorage.getItem("LoggedIn") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    ""
  ).trim().toLowerCase();
  const fileInputRef = useRef(null);

  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseFile, setCourseFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAttachmentName, setEditAttachmentName] = useState("");
  const [editAttachmentUrl, setEditAttachmentUrl] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [removeExistingAttachment, setRemoveExistingAttachment] = useState(false);
  const [editFileInputKey, setEditFileInputKey] = useState(0);

  const [deletingCourseId, setDeletingCourseId] = useState(null);

  const flashSuccess = (msg) => {
    setSuccess(msg);
    window.setTimeout(() => setSuccess(""), 3000);
  };

  const selectedClassName = useMemo(
    () => classes.find((item) => String(item.id) === String(selectedClassId))?.name || "",
    [classes, selectedClassId]
  );

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === String(editingId)) || null,
    [courses, editingId]
  );

  useEffect(() => {
    if (!selectedCourse) {
      setEditTitle("");
      setEditDescription("");
      setEditAttachmentName("");
      setEditAttachmentUrl("");
      setEditFile(null);
      setRemoveExistingAttachment(false);
      setEditFileInputKey((value) => value + 1);
      return;
    }

    setEditTitle(selectedCourse.name || "");
    setEditDescription(selectedCourse.description || "");
    const firstFile = Array.isArray(selectedCourse.files) ? selectedCourse.files[0] : null;
    setEditAttachmentName(firstFile?.filename || "");
    setEditAttachmentUrl(firstFile?.url || "");
    setEditFile(null);
    setRemoveExistingAttachment(false);
    setEditFileInputKey((value) => value + 1);
  }, [selectedCourse]);

  const fetchClasses = async () => {
    setClassesLoading(true);
    if (!teacherName) {
      setClasses([]);
      setSelectedClassId("");
      setClassesLoading(false);
      return;
    }

    try {
      const query = `?teacherName=${encodeURIComponent(teacherName)}`;
      const response = await fetch(`${API_BASE}/api/teacher/classes${query}`, {
        headers: buildHeaders(false),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const nextClasses = Array.isArray(data) ? data : [];
      setClasses(nextClasses);
      if (nextClasses.length === 0) {
        setSelectedClassId("");
      }
    } catch {
      setClasses([]);
      setSelectedClassId("");
    } finally {
      setClassesLoading(false);
    }
  };

  const fetchCourses = async () => {
    if (!userId || !teacherName || !selectedClassId) {
      setCourses([]);
      setEditingId("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        teacher: userId,
        teacherName,
        classId: selectedClassId,
      });
      const res = await fetch(`${API_BASE}/api/teachercourses?${query.toString()}`, {
        headers: buildHeaders(false),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const nextCourses = Array.isArray(data) ? data : [];
      setCourses(nextCourses);
      if (nextCourses.every((course) => String(course.id) !== String(editingId))) {
        setEditingId("");
      }
    } catch {
      setError(content.course_error || "Erreur lors du chargement des cours.");
      setCourses([]);
      setEditingId("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [teacherName]);

  useEffect(() => {
    fetchCourses();
  }, [userId, teacherName, selectedClassId]);

  const uploadCourseFile = async (file, fallbackName) => {
    if (!file) {
      return null;
    }
    if (!isPdfFile(file)) {
      throw new Error("Seuls les fichiers PDF sont autorisés.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", fallbackName || file.name);

    const token = sessionStorage.getItem("jwt_token");
    const uploadRes = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: {
        "X-Tenant-Id": getTenantId(),
        ...(token ? { Authorization: `****** } : {}),
      },
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error(`HTTP ${uploadRes.status}`);
    }

    return uploadRes.json();
  };

  const buildCoursePayload = ({ name, description, fileMeta }) => ({
    name,
    description,
    teacherId: userId,
    teacherName,
    classId: String(selectedClassId),
    className: selectedClassName,
    files: fileMeta?.url && fileMeta?.filename ? [fileMeta] : [],
  });

  const handleUploadCourse = async (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      setError("Veuillez sélectionner une classe.");
      return;
    }
    if (!courseTitle.trim()) {
      setError("Le titre du cours est obligatoire.");
      return;
    }
    if (!courseFile) {
      setError("Veuillez choisir un fichier de cours.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadedFile = await uploadCourseFile(courseFile, courseTitle.trim() || courseFile.name);
      const payload = buildCoursePayload({
        name: courseTitle.trim(),
        description: courseDescription.trim(),
        fileMeta: uploadedFile,
      });

      const saveRes = await fetch(`${API_BASE}/api/teachercourses`, {
        method: "POST",
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
      });
      if (!saveRes.ok) throw new Error(`HTTP ${saveRes.status}`);

      await fetchCourses();
      setCourseTitle("");
      setCourseDescription("");
      setCourseFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      flashSuccess(content.course_success || "Cours ajouté avec succès.");
    } catch (err) {
      setError(err.message || content.course_error || "Erreur lors de l'envoi du cours.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateCourse = async (event) => {
    event.preventDefault();
    if (!selectedCourse) {
      setError("Sélectionnez un cours à modifier.");
      return;
    }
    if (!editTitle.trim()) {
      setError("Le titre du cours est obligatoire.");
      return;
    }

    setError("");

    try {
      let fileMeta = null;
      if (editFile) {
        fileMeta = await uploadCourseFile(editFile, editTitle.trim() || editFile.name);
      } else if (!removeExistingAttachment && editAttachmentUrl) {
        fileMeta = {
          filename: editAttachmentName || "course.pdf",
          url: editAttachmentUrl,
        };
      }

      const payload = buildCoursePayload({
        name: editTitle.trim(),
        description: editDescription.trim(),
        fileMeta,
      });

      const response = await fetch(`${API_BASE}/api/teachercourses/${selectedCourse.id}`, {
        method: "PUT",
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await fetchCourses();
      setEditFile(null);
      setRemoveExistingAttachment(false);
      setEditFileInputKey((value) => value + 1);
      flashSuccess("Cours modifié avec succès.");
    } catch (err) {
      setError(err.message || "Erreur lors de la modification du cours.");
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm("Supprimer ce cours ?")) return;

    setDeletingCourseId(course.id);
    setError("");

    try {
      const query = new URLSearchParams({
        teacher: userId,
        teacherName,
      });
      const res = await fetch(`${API_BASE}/api/teachercourses/${course.id}?${query.toString()}`, {
        method: "DELETE",
        headers: buildHeaders(false),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      await fetchCourses();
      if (String(editingId) === String(course.id)) {
        setEditingId("");
      }
      flashSuccess("Cours supprimé.");
    } catch {
      setError("Erreur lors de la suppression.");
    } finally {
      setDeletingCourseId(null);
    }
  };

  const renderFiles = (course) => {
    const files = Array.isArray(course.files) ? course.files : [];
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
        <div style={{ color: "#6b7280", fontSize: 14 }}>{courses.length} cours</div>
      </div>

      {error && <div className="tc-alert tc-alert-error">{error}</div>}
      {success && <div className="tc-alert tc-alert-success">{success}</div>}

      <form className="tc-add-form" onSubmit={handleUploadCourse}>
        <h3>{content.course_upload_title || "➕ Ajouter un cours"}</h3>
        <div className="tc-form-group">
          <label>Classe *</label>
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} disabled={classesLoading} required>
            <option value="">Sélectionner une classe</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        <div className="tc-form-group">
          <label>Titre du cours *</label>
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            disabled={!selectedClassId || uploading}
            placeholder="Ex: Mathématiques - Chapitre 1"
            required
          />
        </div>
        <div className="tc-form-group">
          <label>Description</label>
          <textarea
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
            disabled={!selectedClassId || uploading}
            placeholder="Description du cours"
          />
        </div>
        <div className="tc-form-group">
          <label>Fichier du cours (PDF) *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setCourseFile(e.target.files?.[0] || null)}
            disabled={!selectedClassId || uploading}
            required
          />
        </div>
        <div className="tc-form-actions">
          <button type="submit" className="tc-btn tc-btn-success" disabled={uploading || !selectedClassId}>
            {uploading ? (content.course_uploading || "Envoi...") : (content.course_upload_action || "📤 Ajouter le cours")}
          </button>
        </div>
      </form>

      {!selectedClassId ? (
        <div className="tc-empty">
          <p>Choisissez une classe pour afficher vos cours.</p>
        </div>
      ) : loading ? (
        <p className="tc-loading">Chargement des cours...</p>
      ) : courses.length === 0 ? (
        <div className="tc-empty">
          <p>📭 Aucun cours pour cette classe.</p>
          <p>Ajoutez votre premier cours ci-dessus.</p>
        </div>
      ) : (
        <div className="tc-course-list">
          {courses.map((course) => (
            <div className="tc-course-card" key={course.id}>
              <div className="tc-course-card-header">
                <div>
                  <h3 className="tc-course-name">{course.name}</h3>
                  {course.description && <p className="tc-course-desc">{course.description}</p>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <span style={{ background: "#e0f2fe", color: "#075985", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                      {course.className || selectedClassName || "Classe"}
                    </span>
                    {course.uploadedAt && (
                      <span style={{ background: "#f3f4f6", color: "#374151", borderRadius: 999, padding: "2px 10px", fontSize: 12 }}>
                        {new Date(course.uploadedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="tc-course-actions">
                  <button className="tc-btn tc-btn-primary" onClick={() => setEditingId(String(course.id))}>
                    ✏️ Modifier
                  </button>
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

      {courses.length > 0 && (
        <form className="tc-add-form" onSubmit={handleUpdateCourse}>
          <h3>Modifier un cours</h3>
          <div className="tc-form-group">
            <label>Cours</label>
            <select value={editingId} onChange={(e) => setEditingId(e.target.value)}>
              <option value="">Sélectionner un cours</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <>
              <div className="tc-form-group">
                <label>Titre du cours *</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
              </div>
              <div className="tc-form-group">
                <label>Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div className="tc-form-group">
                <label>Nouveau fichier (PDF)</label>
                <input
                  key={editFileInputKey}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                />
              </div>
              {editAttachmentUrl && !removeExistingAttachment && (
                <div className="tc-form-group">
                  <label>Fichier actuel</label>
                  <div>
                    <a href={editAttachmentUrl} target="_blank" rel="noopener noreferrer">
                      {editAttachmentName || "Fichier du cours"}
                    </a>
                  </div>
                  <button
                    type="button"
                    className="tc-btn tc-btn-ghost"
                    style={{ marginTop: 8 }}
                    onClick={() => setRemoveExistingAttachment(true)}
                  >
                    Retirer le fichier actuel
                  </button>
                </div>
              )}
              <div className="tc-form-actions">
                <button type="submit" className="tc-btn tc-btn-primary">Enregistrer</button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default TeacherCourses;
