import React, { useEffect, useMemo, useState } from "react";
import "../cssFiles/Inscription.css";
import fr from "../locales/header/fr.json";
import ar from "../locales/header/ar.json";
import en from "../locales/header/en.json";
import { getTenantId } from "../tenant";
import { resolveApiBaseUrl } from "../utils/apiBaseUrl";
import { hasAnyRole, normalizeRoles } from "../utils/roles";

const roleOptions = [
  { value: "student", labelKey: "roleStudent", fallback: "Student" },
  { value: "parent", labelKey: "roleParent", fallback: "Parent" },
  { value: "teacher", labelKey: "roleTeacher", fallback: "Teacher" },
  { value: "admin", labelKey: "roleAdmin", fallback: "Admin" },
  { value: "manager", labelKey: "roleManager", fallback: "Manager" },
  { value: "secretary", labelKey: "roleSecretary", fallback: "Secretary" },
  { value: "finance", labelKey: "roleFinance", fallback: "Finance" },
];

const Inscription = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;

  const [formData, setFormData] = useState({
    surname: "",
    firstname: "",
    email: "",
    adresse: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState({
    surname: "",
    firstname: "",
    email: "",
    adresse: "",
    role: "student",
  });
  const [savingManagedUser, setSavingManagedUser] = useState(false);
  const [deletingManagedUser, setDeletingManagedUser] = useState(false);

  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem("user_roles") || "[]"));
  const canManageTenantUsers = hasAnyRole(userRoles, ["manager"]);

  const configuredBase = resolveApiBaseUrl("http://localhost:8082");
  const browserIsLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const localhostApiTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBase);
  const inferredRemoteBase = `${window.location.protocol}//${window.location.hostname}:8082`;
  const effectiveBase = localhostApiTarget && !browserIsLocal ? inferredRemoteBase : configuredBase;
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === "true";

  const apiUrlFor = (path) => {
    if (useRelativeApi) {
      return `/api${path}`;
    }
    return `${effectiveBase}/api${path}`;
  };

  const buildHeaders = (includeJson = false) => {
    const token = sessionStorage.getItem("jwt_token");
    const roleHeader = userRoles.join(",");
    const headers = {
      "X-Tenant-Id": getTenantId(),
      ...(roleHeader ? { "X-User-Roles": roleHeader } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  };

  const parseErrorMessage = async (response) => {
    try {
      const payload = await response.json();
      const message = payload?.message || payload?.error || "";
      if (message) {
        return String(message);
      }
    } catch {
      // ignore and try plain text below
    }

    try {
      return await response.text();
    } catch {
      return "";
    }
  };

  const roleLabelMap = useMemo(
    () =>
      roleOptions.reduce((acc, item) => {
        acc[item.value] = content[item.labelKey] || item.fallback;
        return acc;
      }, {}),
    [content]
  );

  const fetchUsers = async () => {
    if (!canManageTenantUsers) {
      return;
    }
    setUsersLoading(true);
    setUsersError("");
    try {
      const response = await fetch(apiUrlFor("/users"), { headers: buildHeaders() });
      if (!response.ok) {
        let backendMessage = "";
        try {
          const payload = await response.json();
          backendMessage = payload?.message || payload?.error || "";
        } catch {
          try {
            backendMessage = await response.text();
          } catch {
            backendMessage = "";
          }
        }
        throw new Error(backendMessage || `HTTP ${response.status}`);
      }
      const payload = await response.json();
      setUsers(Array.isArray(payload) ? payload : []);
    } catch {
      setUsers([]);
      setUsersError(content.registrationError || "Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (canManageTenantUsers) {
      fetchUsers();
    }
  }, [canManageTenantUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError((current) => ({ ...current, [name]: "" }));
  };

  const validateInputs = () => {
    const { surname, firstname, email, adresse, password, confirmPassword, role } = formData;
    const errors = {};

    if (!surname.trim()) errors.surname = content.surnameRequired;
    if (!firstname.trim()) errors.firstname = content.firstnameRequired;
    if (!email.trim()) errors.email = content.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = content.invalidEmail;

    if (!adresse.trim()) errors.adresse = content.adresseRequired;
    if (!password) errors.password = content.passwordRequired;
    if (!confirmPassword) errors.confirmPassword = content.confirmPasswordRequired;
    else if (password !== confirmPassword) errors.confirmPassword = content.passwordMismatch;
    if (!role) errors.role = content.roleRequired;

    return errors;
  };

  const resetForm = () => {
    setFormData({
      surname: "",
      firstname: "",
      email: "",
      adresse: "",
      password: "",
      confirmPassword: "",
      role: "student",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const errors = validateInputs();
    if (Object.keys(errors).length > 0) {
      setError(errors);
      setLoading(false);
      return;
    }

    try {
      const { surname, firstname, email, adresse, password, role } = formData;
      const response = await fetch(apiUrlFor("/auth/register"), {
        method: "POST",
        headers: buildHeaders(true),
        body: JSON.stringify({
          surname,
          firstname,
          email,
          adresse,
          password,
          roles: [role],
        }),
      });

      if (!response.ok) {
        const backendMessage = await parseErrorMessage(response);
        const normalized = String(backendMessage || "").toLowerCase();

        if (response.status === 409 && normalized.includes("maximum users reached")) {
          throw new Error("User limit reached for your current plan. Please upgrade your version or remove a user first.");
        }

        throw new Error(backendMessage || `HTTP ${response.status}`);
      }

      const successMessage = (content.registrationSuccess || "User created.").replace("{surname}", surname);
      setSuccess(successMessage);
      setError({});
      resetForm();
      await fetchUsers();
      if (canManageTenantUsers) {
        setShowAddUserForm(false);
      }
    } catch (err) {
      console.error("Error:", err);
      setError({ general: err?.message || content.registrationError });
    } finally {
      setLoading(false);
    }
  };

  const startManageUser = (user) => {
    const firstRole = Array.isArray(user.roles) && user.roles.length > 0 ? String(user.roles[0]).trim().toLowerCase() : "student";
    setSelectedUserId(user.id);
    setEditingUser({
      surname: user.username || "",
      firstname: user.firstname || "",
      email: user.email || "",
      adresse: user.adresse || "",
      role: firstRole || "student",
    });
  };

  const cancelManageUser = () => {
    setSelectedUserId(null);
    setEditingUser({ surname: "", firstname: "", email: "", adresse: "", role: "student" });
  };

  const saveManagedUser = async () => {
    if (!selectedUserId) {
      return;
    }
    setSavingManagedUser(true);
    setUsersError("");
    try {
      const response = await fetch(apiUrlFor(`/users/${selectedUserId}`), {
        method: "PUT",
        headers: buildHeaders(true),
        body: JSON.stringify(editingUser),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const updated = await response.json();
      setUsers((current) => current.map((user) => (user.id === selectedUserId ? updated : user)));
      startManageUser(updated);
    } catch {
      setUsersError(content.registrationError || "Failed to update user.");
    } finally {
      setSavingManagedUser(false);
    }
  };

  const deleteManagedUser = async () => {
    if (!selectedUserId) {
      return;
    }
    const selectedUser = users.find((user) => user.id === selectedUserId);
    const username = selectedUser?.username || "";
    if (!window.confirm(`${content.deleteUserConfirm || "Delete user"} \"${username}\"?`)) {
      return;
    }

    setDeletingManagedUser(true);
    setUsersError("");
    try {
      const response = await fetch(apiUrlFor(`/users/${selectedUserId}`), {
        method: "DELETE",
        headers: buildHeaders(),
      });
      if (!response.ok && response.status !== 204) {
        throw new Error(`HTTP ${response.status}`);
      }
      setUsers((current) => current.filter((user) => user.id !== selectedUserId));
      cancelManageUser();
    } catch {
      setUsersError(content.registrationError || "Failed to delete user.");
    } finally {
      setDeletingManagedUser(false);
    }
  };

  const addUserForm = (
    <form className="signup-form" onSubmit={handleSubmit}>
        <h2>{content.userManagementTitle || "User management"}</h2>
        {error.general && <p className="error-message">{error.general}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
          <label htmlFor="surname">{content.surname}:</label>
          <input type="text" id="surname" name="surname" value={formData.surname} onChange={handleChange} placeholder="Enter last name" />
          {error.surname && <p className="field-error">{error.surname}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="firstname">{content.firstname}:</label>
          <input type="text" id="firstname" name="firstname" value={formData.firstname} onChange={handleChange} placeholder="Enter first name" />
          {error.firstname && <p className="field-error">{error.firstname}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">{content.email}:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" />
          {error.email && <p className="field-error">{error.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="adresse">{content.adresse}:</label>
          <input type="text" id="adresse" name="adresse" value={formData.adresse} onChange={handleChange} placeholder="Enter address" />
          {error.adresse && <p className="field-error">{error.adresse}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="role">{content.role}:</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {content[option.labelKey] || option.fallback}
              </option>
            ))}
          </select>
          {error.role && <p className="field-error">{error.role}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">{content.password}:</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" />
          {error.password && <p className="field-error">{error.password}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">{content.confirmPassword}:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
          />
          {error.confirmPassword && <p className="field-error">{error.confirmPassword}</p>}
        </div>

        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? content.loading : (content.addUserLabel || "Add user")}
        </button>
      </form>
  );

  return (
    <div className="signup-container">
      {!canManageTenantUsers && addUserForm}

      {canManageTenantUsers && (
        <div className="signup-form" style={{ marginTop: 24, width: "100%", maxWidth: "1200px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <h2>{content.usersTitle || "Users"}</h2>
            <button
              type="button"
              className="signup-button"
              style={{ width: "auto", padding: "8px 14px" }}
              onClick={() => {
                setShowAddUserForm((prev) => !prev);
                setError({});
                setSuccess("");
              }}
            >
              {showAddUserForm ? (content.cancelLabel || "Cancel") : (content.addUserLabel || "Add user")}
            </button>
          </div>
          <p style={{ marginBottom: 10 }}>{content.usersHint || "You can manage all users in your tenant."}</p>
          {usersError && <p className="error-message">{usersError}</p>}

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>{content.surname || "Last name"}</th>
                  <th style={th}>{content.firstname || "First name"}</th>
                  <th style={th}>{content.email || "Email"}</th>
                  <th style={th}>{content.adresse || "Address"}</th>
                  <th style={th}>{content.role || "Role"}</th>
                  <th style={th}>{content.actionsLabel || "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td style={td} colSpan={6}>{content.loading || "Loading..."}</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td style={td} colSpan={6}>{content.noUsersLabel || "No users found."}</td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const currentRole = Array.isArray(user.roles) && user.roles.length > 0 ? String(user.roles[0]).trim().toLowerCase() : "student";
                    return (
                      <tr key={user.id}>
                        <td style={td}>{user.username}</td>
                        <td style={td}>{user.firstname}</td>
                        <td style={td}>{user.email}</td>
                        <td style={td}>{user.adresse}</td>
                        <td style={td}>{roleLabelMap[currentRole] || currentRole}</td>
                        <td style={td}>
                          <button type="button" onClick={() => startManageUser(user)}>
                            {content.manageLabel || "Manage"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {selectedUserId && (
            <div style={{ marginTop: 16, borderTop: "1px solid #ddd", paddingTop: 16 }}>
              <h3 style={{ marginBottom: 10 }}>{content.manageSelectedUserTitle || "Manage selected user"}</h3>
              <div className="form-group">
                <label>{content.surname}:</label>
                <input value={editingUser.surname} onChange={(e) => setEditingUser((c) => ({ ...c, surname: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>{content.firstname}:</label>
                <input value={editingUser.firstname} onChange={(e) => setEditingUser((c) => ({ ...c, firstname: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>{content.email}:</label>
                <input value={editingUser.email} onChange={(e) => setEditingUser((c) => ({ ...c, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>{content.adresse}:</label>
                <input value={editingUser.adresse} onChange={(e) => setEditingUser((c) => ({ ...c, adresse: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>{content.role}:</label>
                <select value={editingUser.role} onChange={(e) => setEditingUser((c) => ({ ...c, role: e.target.value }))}>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {content[option.labelKey] || option.fallback}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={saveManagedUser} disabled={savingManagedUser}>
                  {savingManagedUser ? "..." : (content.saveLabel || "Save")}
                </button>
                <button type="button" onClick={cancelManageUser}>
                  {content.cancelLabel || "Cancel"}
                </button>
                <button type="button" onClick={deleteManagedUser} disabled={deletingManagedUser}>
                  {deletingManagedUser ? "..." : (content.deleteLabel || "Delete")}
                </button>
              </div>
            </div>
          )}

          {showAddUserForm && (
            <div style={{ marginTop: 16, borderTop: "1px solid #ddd", paddingTop: 16 }}>
              {addUserForm}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const th = { textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" };
const td = { borderBottom: "1px solid #f0f0f0", padding: "8px" };

export default Inscription;
