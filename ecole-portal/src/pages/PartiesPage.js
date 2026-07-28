import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";
import { getTenantId } from "../tenant";
import { hasAnyRole, normalizeRoles } from "../utils/roles";

const PartiesPage = ({ language }) => {
  const activityType = "fetes";
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const location = useLocation();
  const userRoles = JSON.parse(localStorage.getItem("user_roles") || "[]");
  const normalizedRoles = normalizeRoles(userRoles);
  const rolesHeader = normalizedRoles.join(",");
  const isAdministrationPath = (location.pathname || "").toLowerCase().startsWith("/administration/");
  const isSecretaryAuthorized = hasAnyRole(normalizedRoles, ["secretary"]);
  const isAdminAuthorized = hasAnyRole(normalizedRoles, ["admin", "manager"]);
  const isTeacherAuthorized = hasAnyRole(normalizedRoles, ["teacher"]);
  const isTeacherOnly = isTeacherAuthorized && !isSecretaryAuthorized && !isAdminAuthorized;
  const canManageActivities = isAdministrationPath
    ? (isSecretaryAuthorized || isAdminAuthorized)
    : (isSecretaryAuthorized || isTeacherAuthorized);
  const userName = localStorage.getItem("LoggedIn") || "";
  const token = sessionStorage.getItem("jwt_token");
  const baseUrl = (process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:8085").replace(/\/$/, "");

  const [activities, setActivities] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPlanner, setShowPlanner] = useState(false);

  const [form, setForm] = useState({
    title: "",
    date: "",
    className: "",
    destination: "",
    description: "",
  });
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const pageTitle = content.fetes || "Parties";

  useEffect(() => {
    fetchActivities();
    if (canManageActivities) {
      fetchClasses();
    }
  }, [canManageActivities]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${baseUrl}/api/activities?type=${encodeURIComponent(activityType)}`, { headers });
      if (!response.ok) {
        throw new Error(content.presence_error || "Failed to load activities");
      }
      const data = await response.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error while loading activities");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const classesUrl = isTeacherOnly
        ? `${baseUrl}/api/classes?teacherName=${encodeURIComponent(userName)}`
        : `${baseUrl}/api/classes`;
      const response = await fetch(classesUrl, { headers });
      if (!response.ok) {
        throw new Error("Failed to load classes");
      }
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setForm((prev) => ({ ...prev, className: prev.className || data[0].name }));
      }
    } catch {
      // Keep page usable even when classes are not available.
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      title: "",
      date: "",
      className: classes[0]?.name || "",
      destination: "",
      description: "",
    });
    setSelectedActivity(null);
    setIsEditing(false);
    setShowPlanner(false);
  };

  const openPlanner = () => {
    setError("");
    setMessage("");
    setSelectedActivity(null);
    setIsEditing(false);
    setShowPlanner(true);
    setForm((prev) => ({
      ...prev,
      title: "",
      date: "",
      className: prev.className || classes[0]?.name || "",
      destination: "",
      description: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManageActivities) {
      return;
    }

    try {
      setError("");
      setMessage("");
      const url = isEditing && selectedActivity
        ? `${baseUrl}/api/activities/${selectedActivity.id}`
        : `${baseUrl}/api/activities`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          type: activityType,
          title: form.title,
          date: form.date,
          className: form.className,
          destination: form.destination,
          description: form.description,
        }),
      });

      if (!response.ok) {
        const backendMessage = await response.text();
        throw new Error(backendMessage || "Unable to save activity");
      }

      setMessage(
        isEditing
          ? `${content.fetes} updated successfully`
          : `${content.fetes} created successfully`
      );
      resetForm();
      fetchActivities();
    } catch (err) {
      setError(err.message || "Unable to save activity");
    }
  };

  const handleSelect = (activity) => {
    if (!canManageActivities) {
      return;
    }
    setSelectedActivity(activity);
    setForm({
      title: activity.title,
      date: activity.date,
      className: activity.className,
      destination: activity.destination,
      description: activity.description || "",
    });
    setIsEditing(true);
    setShowPlanner(true);
    setMessage("");
    setError("");
  };

  const handleRemove = async (id) => {
    if (!canManageActivities) {
      return;
    }

    const shouldDelete = window.confirm(
      content.activity_delete_confirm || "Are you sure you want to remove this activity?"
    );
    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");
      const response = await fetch(`${baseUrl}/api/activities/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error("Unable to delete activity");
      }

      if (selectedActivity && selectedActivity.id === id) {
        resetForm();
      }
      setMessage(`${content.fetes} deleted successfully`);
      fetchActivities();
    } catch (err) {
      setError(err.message || "Unable to delete activity");
    }
  };

  const isArabic = language === "ar";

  return (
    <div
      style={{
        padding: "2rem",
        direction: isArabic ? "rtl" : "ltr",
        textAlign: isArabic ? "right" : "left"
      }}
    >
      <h1>{pageTitle}</h1>

      {message && <p style={{ color: "#15803d" }}>{message}</p>}
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      {canManageActivities && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <button type="button" onClick={openPlanner}>
              {isEditing ? `Update ${content.fetes}` : `Add ${content.fetes}`}
            </button>
            {showPlanner && (
              <button type="button" onClick={resetForm}>
                {content.activity_cancel_button || "Cancel"}
              </button>
            )}
          </div>

          {showPlanner && (
            <>
              <h3>{isEditing ? `Update ${content.fetes}` : `Add ${content.fetes}`}</h3>
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 500 }}>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Party Title"
                  required
                />
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
                <select name="className" value={form.className} onChange={handleChange} required>
                  {classes.map((schoolClass) => (
                    <option key={schoolClass.id} value={schoolClass.name}>
                      {schoolClass.name}
                    </option>
                  ))}
                </select>
                <input
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  placeholder="Location"
                  required
                />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                />
                <button type="submit">
                  {isEditing ? `Update ${content.fetes}` : `Add ${content.fetes}`}
                </button>
              </form>
            </>
          )}
        </>
      )}

      <hr />

      {loading ? (
        <p>{content.loading || "Loading..."}</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {activities.map((activity) => (
            <li
              key={activity.id}
              style={{
                border: selectedActivity?.id === activity.id ? "2px solid blue" : "1px solid #ccc",
                borderRadius: "8px",
                marginBottom: "10px",
                padding: "10px"
              }}
            >
              <strong>{activity.title}</strong> — {activity.date} — {activity.className} — {activity.destination}
              <p>{activity.description}</p>
              {canManageActivities && (
                <button type="button" onClick={() => handleSelect(activity)}>
                  {content.activity_edit_button || "Edit"}
                </button>
              )}
              {canManageActivities && (
                <button
                  type="button"
                  onClick={() => handleRemove(activity.id)}
                  style={{ marginLeft: "10px", color: "red" }}
                >
                  {content.activity_remove_button || "Remove"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManageActivities && selectedActivity && showPlanner && (
        <div style={{ borderTop: "2px solid #ddd", paddingTop: "10px" }}>
          <h3>Selected {content.fetes}:</h3>
          <p><b>Title:</b> {selectedActivity.title}</p>
          <p><b>Date:</b> {selectedActivity.date}</p>
          <p><b>{content.class || "Class"}:</b> {selectedActivity.className}</p>
          <p><b>Location:</b> {selectedActivity.destination}</p>
          <p><b>Description:</b> {selectedActivity.description}</p>
        </div>
      )}
    </div>
  );
};

export default PartiesPage;

