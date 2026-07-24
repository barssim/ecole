import React, { useEffect, useState } from "react";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import { getTenantId } from "../tenant";

const EMPTY_FORM = {
  subject: "",
  className: "",
  date: "",
  startTime: "",
  endTime: "",
  room: "",
  notes: "",
};

const ExamProgram = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const baseUrl = (process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:8085").replace(/\/$/, "");
  const token = sessionStorage.getItem("jwt_token");
  const userRoles = JSON.parse(localStorage.getItem("user_roles") || "[]");
  const canManage = ["secretary", "admin", "manager"].some((r) => userRoles.includes(r));

  const buildHeaders = (includeJson = false) => {
    const headers = {
      "X-Tenant-Id": getTenantId(),
      "X-User-Roles": userRoles.join(","),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${baseUrl}/api/exams`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(content.exam_error || "Erreur de chargement");
      setExams(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setShowForm(true);
  };

  const openEdit = (exam) => {
    setEditId(exam.id);
    setForm({
      subject: exam.subject || "",
      className: exam.className || "",
      date: exam.date || "",
      startTime: exam.startTime || "",
      endTime: exam.endTime || "",
      room: exam.room || "",
      notes: exam.notes || "",
    });
    setMessage("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError(null);
    try {
      const url = editId ? `${baseUrl}/api/exams/${editId}` : `${baseUrl}/api/exams`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: buildHeaders(true), body: JSON.stringify(form) });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || content.exam_saveError || "Erreur d'enregistrement");
      }
      setMessage(
        editId
          ? (content.exam_updateSuccess || "Examen mis à jour avec succès.")
          : (content.exam_createSuccess || "Examen créé avec succès.")
      );
      setShowForm(false);
      fetchExams();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/api/exams/${id}`, { method: "DELETE", headers: buildHeaders() });
      if (!res.ok) throw new Error(content.exam_deleteError || "Erreur de suppression");
      setDeleteConfirm(null);
      setMessage(content.exam_deleteSuccess || "Examen supprimé.");
      fetchExams();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatTime = (t) => (t ? t.substring(0, 5) : "—");

  return (
    <div
      style={{ maxWidth: 900, margin: "0 auto", width: "100%", display: "grid", gap: 16 }}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: 0 }}>{content.exam_program_title}</h2>
        {canManage && (
          <button className="buttonStyle" onClick={openCreate}>
            {content.exam_add || "+ Ajouter un examen"}
          </button>
        )}
      </div>

      {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
      {message && <div style={{ color: "#15803d" }}>{message}</div>}

      {/* ─── Form (create / edit) ─── */}
      {showForm && canManage && (
        <form
          onSubmit={handleSubmit}
          style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.08)", display: "grid", gap: 12 }}
        >
          <h3 style={{ margin: 0 }}>
            {editId ? (content.exam_editTitle || "Modifier l'examen") : (content.exam_createTitle || "Nouvel examen")}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span>{content.exam_subject} *</span>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required style={{ width: "100%" }} placeholder={content.exam_subjectPlaceholder || "Ex. Mathématiques"} />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span>{content.exam_class} *</span>
              <input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} required style={{ width: "100%" }} placeholder="Ex. 3e A" />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span>{content.exam_date} *</span>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required style={{ width: "100%" }} />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span>{content.exam_room} *</span>
              <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} required style={{ width: "100%" }} placeholder="Ex. Salle 101" />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span>{content.exam_start_time} *</span>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required style={{ width: "100%" }} />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span>{content.exam_end_time} *</span>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required style={{ width: "100%" }} />
            </label>
          </div>

          <label style={{ display: "grid", gap: 4 }}>
            <span>{content.exam_notes || "Notes"}</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              style={{ width: "100%" }}
              placeholder={content.exam_notesPlaceholder || "Informations supplémentaires..."} />
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="buttonStyle" type="submit" disabled={saving}>
              {saving ? (content.loading || "Enregistrement...") : (editId ? (content.exam_saveButton || "Enregistrer") : (content.exam_createButton || "Créer"))}
            </button>
            <button type="button" className="buttonStyle" onClick={() => setShowForm(false)} style={{ background: "#6b7280" }}>
              {content.exam_cancelButton || "Annuler"}
            </button>
          </div>
        </form>
      )}

      {/* ─── Exam list ─── */}
      {loading ? (
        <p>{content.loading}</p>
      ) : exams.length === 0 ? (
        <p style={{ color: "#6b7280" }}>{content.exam_program_empty}</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead style={{ background: "#dbeafe", color: "#1e3a8a" }}>
              <tr>
                <th style={th}>{content.exam_subject}</th>
                <th style={th}>{content.exam_class}</th>
                <th style={th}>{content.exam_date}</th>
                <th style={th}>{content.exam_start_time}</th>
                <th style={th}>{content.exam_end_time}</th>
                <th style={th}>{content.exam_room}</th>
                {canManage && <th style={th}></th>}
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, i) => (
                <tr key={exam.id} style={{ background: i % 2 === 0 ? "#f0f9ff" : "#fff" }}>
                  <td style={td}>{exam.subject}</td>
                  <td style={td}>{exam.className}</td>
                  <td style={td}>{exam.date}</td>
                  <td style={td}>{formatTime(exam.startTime)}</td>
                  <td style={td}>{formatTime(exam.endTime)}</td>
                  <td style={td}>{exam.room}</td>
                  {canManage && (
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      <button onClick={() => openEdit(exam)} style={{ marginRight: 6, background: "none", border: "none", cursor: "pointer", color: "#1d4ed8" }} title={content.exam_editTitle || "Modifier"}>✏️</button>
                      {deleteConfirm === exam.id ? (
                        <>
                          <button onClick={() => handleDelete(exam.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>✔ {content.exam_confirmDelete || "Confirmer"}</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ marginLeft: 4, background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>✕</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(exam.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }} title={content.exam_delete || "Supprimer"}>🗑</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const th = { padding: "8px 12px", textAlign: "left", fontWeight: 600 };
const td = { padding: "8px 12px" };

export default ExamProgram;
