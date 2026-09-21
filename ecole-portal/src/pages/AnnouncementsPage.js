import React, { useEffect, useMemo, useState } from "react";
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";
import en from "../locales/en.json";
import { getTenantId } from "../tenant";
import { hasAnyRole, normalizeRoles } from "../utils/roles";
import { createApiUrlFor, readJsonResponse } from "../utils/apiClient";

const AnnouncementsPage = ({ language }) => {
  const activityType = "announcements";
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const isArabic = language === "ar";

  const userRoles = JSON.parse(localStorage.getItem("user_roles") || "[]");
  const normalizedRoles = normalizeRoles(userRoles);
  const rolesHeader = normalizedRoles.join(",");
  const canManageAnnouncements = hasAnyRole(normalizedRoles, ["secretary", "admin", "manager"]);
  const userName = localStorage.getItem("LoggedIn") || "";
  const token = sessionStorage.getItem("jwt_token");
  const apiUrlFor = createApiUrlFor("http://localhost:8085");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "X-Tenant-Id": getTenantId(),
      "X-User-Roles": rolesHeader,
      "X-User-Name": userName,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token, userName, rolesHeader]
  );

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPlanner, setShowPlanner] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", description: "" });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(apiUrlFor(`/activities?type=${activityType}`), { headers });
      const data = await readJsonResponse(response, content.presence_error || "Failed to load announcements");
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error while loading announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ title: "", date: "", description: "" });
    setSelectedAnnouncement(null);
    setIsEditing(false);
    setShowPlanner(false);
  };

  const openPlanner = () => {
    setError("");
    setMessage("");
    setSelectedAnnouncement(null);
    setIsEditing(false);
    setShowPlanner(true);
    setForm({ title: "", date: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManageAnnouncements) {
      return;
    }
    try {
      setError("");
      setMessage("");
      const url = isEditing && selectedAnnouncement
        ? apiUrlFor(`/activities/${selectedAnnouncement.id}`)
        : apiUrlFor("/activities");
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          type: activityType,
          title: form.title,
          date: form.date,
          description: form.description,
        }),
      });

      if (!response.ok) {
        const backendMessage = await (async () => {
          try {
            await readJsonResponse(response, "Unable to save announcement");
            return "Unable to save announcement";
          } catch (err) {
            return err.message;
          }
        })();
        throw new Error(backendMessage || "Unable to save announcement");
      }

      setMessage(
        isEditing
          ? (content.outing_update_button || "Announcement updated successfully")
          : (content.announcement_add_button || "Announcement created successfully")
      );
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      setError(err.message || "Unable to save announcement");
    }
  };

  const handleSelect = (announcement) => {
    if (!canManageAnnouncements) {
      return;
    }
    setSelectedAnnouncement(announcement);
    setForm({
      title: announcement.title,
      date: announcement.date,
      description: announcement.description || "",
    });
    setIsEditing(true);
    setShowPlanner(true);
    setMessage("");
    setError("");
  };

  const handleRemove = async (id) => {
    if (!canManageAnnouncements) {
      return;
    }
    try {
      setError("");
      setMessage("");
      const response = await fetch(apiUrlFor(`/activities/${id}`), {
        method: "DELETE",
        headers,
      });
      if (!response.ok) {
        throw new Error("Unable to delete announcement");
      }
      if (selectedAnnouncement && selectedAnnouncement.id === id) {
        resetForm();
      }
      setDeleteConfirm(null);
      setMessage(content.outing_remove_button || "Announcement deleted successfully");
      fetchAnnouncements();
    } catch (err) {
      setError(err.message || "Unable to delete announcement");
    }
  };

  return (
    <div className="activity-page" dir={isArabic ? "rtl" : "ltr"} style={{ textAlign: isArabic ? "right" : "left" }}>
      <div className="activity-header">
        <div>
          <span className="activity-title-badge">{content.annonces_activites || "Annonces"}</span>
          <h1 className="activity-title">{content.annonces || "Announcements"}</h1>
        </div>
        {canManageAnnouncements && (
          <div className="activity-toolbar">
            <button type="button" className="activity-btn activity-btn-primary" onClick={openPlanner}>
              {isEditing
                ? (content.activity_edit_button || content.outing_update_button)
                : content.announcement_add_button}
            </button>
            {showPlanner && (
              <button type="button" className="activity-btn" onClick={resetForm}>
                {content.activity_cancel_button || "Cancel"}
              </button>
            )}
          </div>
        )}
      </div>

      {message && <p className="activity-message activity-message-success">{message}</p>}
      {error && <p className="activity-message activity-message-error">{error}</p>}

      {canManageAnnouncements && showPlanner && (
        <div className="activity-card">
          <h3>{isEditing ? (content.activity_edit_button || content.outing_update_button) : content.announcement_add_button}</h3>
          <form onSubmit={handleSubmit} className="activity-form">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder={content.outing_title || "Title"}
              required
            />
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={content.outing_description || "Description"}
            />
            <button type="submit" className="activity-form-submit">
              {isEditing ? content.outing_update_button : content.announcement_add_button}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="activity-loading">{content.loading || "Loading..."}</p>
      ) : announcements.length === 0 ? (
        <div className="activity-empty">{content.no_data || "No announcements yet."}</div>
      ) : (
        <ul className="activity-list">
          {announcements.map((announcement) => (
            <li
              key={announcement.id}
              className={`activity-item${selectedAnnouncement?.id === announcement.id ? " is-selected" : ""}`}
            >
              <div className="activity-item-header">
                <h3 className="activity-item-title">{announcement.title}</h3>
                <span className="activity-item-date">{announcement.date}</span>
              </div>
              {announcement.description && (
                <p className="activity-item-description">{announcement.description}</p>
              )}
              {canManageAnnouncements && (
                <div className="activity-item-actions">
                  <button
                    type="button"
                    className="activity-icon-btn activity-icon-edit"
                    onClick={() => handleSelect(announcement)}
                    title={content.activity_edit_button || content.outing_update_button || "Edit"}
                  >
                    ✏️
                  </button>
                  {deleteConfirm === announcement.id ? (
                    <>
                      <button
                        type="button"
                        className="activity-icon-btn activity-icon-confirm"
                        onClick={() => handleRemove(announcement.id)}
                        title={content.exam_confirmDelete || "Confirmer"}
                      >
                        ✔
                      </button>
                      <button
                        type="button"
                        className="activity-icon-btn activity-icon-cancel"
                        onClick={() => setDeleteConfirm(null)}
                        title={content.activity_cancel_button || "Annuler"}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="activity-icon-btn activity-icon-delete"
                      onClick={() => setDeleteConfirm(announcement.id)}
                      title={content.outing_remove_button || "Remove"}
                    >
                      🗑
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AnnouncementsPage;
