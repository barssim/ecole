import React, { useEffect, useMemo, useState } from "react";
import "../cssFiles/Inscription.css";
import fr from "../locales/header/fr.json";
import ar from "../locales/header/ar.json";
import en from "../locales/header/en.json";
import { getSchoolId } from "../school";
import { resolveApiBaseUrl } from "../utils/apiBaseUrl";
import { hasAnyRole, normalizeRoles } from "../utils/roles";
import { getLocalizedFirstName } from "../utils/localizedUserName";

const roleOptions = [
  { value: "student", labelKey: "roleStudent", fallback: "Student" },
  { value: "parent", labelKey: "roleParent", fallback: "Parent" },
  { value: "teacher", labelKey: "roleTeacher", fallback: "Teacher" },
  { value: "admin", labelKey: "roleAdmin", fallback: "Admin" },
  { value: "manager", labelKey: "roleManager", fallback: "Manager" },
  { value: "secretary", labelKey: "roleSecretary", fallback: "Secretary" },
  { value: "finance", labelKey: "roleFinance", fallback: "Finance" },
];
const CGU_VERSION = "1.0";

const Inscription = ({ language, schoolCustomization }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;

  const [formData, setFormData] = useState({
    civilite: "Monsieur",
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
  const [cguAccepted, setCguAccepted] = useState(false);
  const [cguDeliveredByAdmin, setCguDeliveredByAdmin] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState({
    civilite: "Monsieur",
    surname: "",
    firstname: "",
    email: "",
    adresse: "",
    role: "student",
  });
  const [savingManagedUser, setSavingManagedUser] = useState(false);
  const [deletingManagedUser, setDeletingManagedUser] = useState(false);

  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem("user_roles") || "[]"));
  const canManageSchoolUsers = hasAnyRole(userRoles, ["manager"]);

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
      "X-School-Id": getSchoolId(),
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
    if (!canManageSchoolUsers) {
      return;
    }
    setUsersLoading(true);
    setUsersError("");
    try {
      const response = await fetch(apiUrlFor("/users"), {
        cache: "no-store",
        headers: { ...buildHeaders(), "Cache-Control": "no-cache" },
      });
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
      const sorted = Array.isArray(payload)
        ? [...payload].sort((a, b) =>
            String(a.username || "").localeCompare(String(b.username || ""), undefined, { sensitivity: "base" })
          )
        : [];
      setUsers(sorted);
    } catch {
      setUsers([]);
      setUsersError(content.registrationError || "Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (canManageSchoolUsers) {
      fetchUsers();
    }
  }, [canManageSchoolUsers]);

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
    if (!canManageSchoolUsers && !cguAccepted) {
      errors.cguAccepted = "Vous devez accepter les CGU pour créer votre compte.";
    }
    if (canManageSchoolUsers && !cguDeliveredByAdmin) {
      errors.cguDeliveredByAdmin = "Vous devez confirmer la remise des CGU au nouvel utilisateur.";
    }

    return errors;
  };

  const resetForm = () => {
    setFormData({
      civilite: "Monsieur",
      surname: "",
      firstname: "",
      email: "",
      adresse: "",
      password: "",
      confirmPassword: "",
      role: "student",
    });
    setCguAccepted(false);
    setCguDeliveredByAdmin(false);
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
      const { civilite, surname, firstname, email, adresse, password, role } = formData;
      const response = await fetch(apiUrlFor("/auth/register"), {
        method: "POST",
        headers: buildHeaders(true),
        body: JSON.stringify({
          civilite,
          surname,
          firstname,
          email,
          adresse,
          password,
          roles: [role],
          cguAccepted: !canManageSchoolUsers,
          cguVersion: !canManageSchoolUsers ? CGU_VERSION : undefined,
          cguAcceptedAt: !canManageSchoolUsers ? new Date().toISOString() : undefined,
          cguDeliveredByAdmin: canManageSchoolUsers,
          cguDeliveredAt: canManageSchoolUsers ? new Date().toISOString() : undefined,
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
      if (canManageSchoolUsers) {
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
      civilite: user.civilite || "Monsieur",
      surname: user.username || "",
      firstname: getLocalizedFirstName(user, language),
      email: user.email || "",
      adresse: user.adresse || "",
      role: firstRole || "student",
    });
  };

  const cancelManageUser = () => {
    setSelectedUserId(null);
    setEditingUser({ civilite: "Monsieur", surname: "", firstname: "", email: "", adresse: "", role: "student" });
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
    <form onSubmit={handleSubmit} className={canManageSchoolUsers ? "activity-form inscription-edit-form inscription-add-form" : "signup-form"}>
        {!canManageSchoolUsers && <h2>{content.userManagementTitle || "User management"}</h2>}
        {error.general && <p className={canManageSchoolUsers ? "activity-message activity-message-error" : "error-message"}>{error.general}</p>}
        {success && <p className={canManageSchoolUsers ? "activity-message activity-message-success" : "success-message"}>{success}</p>}

        <div className="form-group">
          <label htmlFor="civilite">{content.civilite || "Civilité"}:</label>
          <select id="civilite" name="civilite" value={formData.civilite} onChange={handleChange}>
            <option value="Monsieur">{content.civiliteMonsieur || "Monsieur"}</option>
            <option value="Madame">{content.civiliteMadame || "Madame"}</option>
          </select>
        </div>

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

        {!canManageSchoolUsers && (
          <div className="form-group cgu-acceptance">
            <label htmlFor="cguAccepted">
              <input
                type="checkbox"
                id="cguAccepted"
                name="cguAccepted"
                checked={cguAccepted}
                onChange={(event) => {
                  setCguAccepted(event.target.checked);
                  setError((current) => ({ ...current, cguAccepted: "" }));
                }}
                required
              />{" "}
              J'accepte les{" "}
              <a href="/cgu" target="_blank" rel="noopener noreferrer">
                Conditions générales d'utilisation (CGU)
              </a>
            </label>
            {error.cguAccepted && <p className="field-error">{error.cguAccepted}</p>}
          </div>
        )}
        {canManageSchoolUsers && (
          <div className="form-group cgu-acceptance">
            <label htmlFor="cguDeliveredByAdmin">
              <input
                type="checkbox"
                id="cguDeliveredByAdmin"
                name="cguDeliveredByAdmin"
                checked={cguDeliveredByAdmin}
                onChange={(event) => {
                  setCguDeliveredByAdmin(event.target.checked);
                  setError((current) => ({ ...current, cguDeliveredByAdmin: "" }));
                }}
                required
              />{" "}
              Je confirme avoir remis les{" "}
              <a href="/cgu" target="_blank" rel="noopener noreferrer">
                CGU
              </a>{" "}
              au nouvel utilisateur. Cette case ne vaut pas acceptation des CGU
              par celui-ci.
            </label>
            {error.cguDeliveredByAdmin && <p className="field-error">{error.cguDeliveredByAdmin}</p>}
          </div>
        )}

        <button type="submit" className={canManageSchoolUsers ? "activity-form-submit" : "signup-button"} disabled={loading}>
          {loading ? content.loading : (content.addUserLabel || "Add user")}
        </button>
      </form>
  );

  if (!canManageSchoolUsers) {
    return (
      <div className="signup-container">
        {addUserForm}
      </div>
    );
  }

  return (
    <div className="activity-page inscription-page">
      <div className="activity-header">
        <div>
          <span className="activity-title-badge">{content.userManagementTitle || "User management"}</span>
          <h1 className="activity-title">{content.usersTitle || "Users"}</h1>
        </div>
        <div className="activity-toolbar">
          <button
            type="button"
            className="activity-btn activity-btn-primary"
            onClick={() => {
              setShowAddUserForm((prev) => !prev);
              setError({});
              setSuccess("");
            }}
          >
            {showAddUserForm ? (content.cancelLabel || "Cancel") : `+ ${content.addUserLabel || "Add user"}`}
          </button>
        </div>
      </div>

      {showAddUserForm && (
        <div className="activity-card inscription-edit-card inscription-add-card">
          <h3>{content.addUserLabel || "Add user"}</h3>
          {addUserForm}
        </div>
      )}

      {selectedUserId && (
        <div className="activity-card inscription-edit-card">
          <h3>{content.manageSelectedUserTitle || "Manage selected user"}</h3>
          <div className="activity-form inscription-edit-form">
            <div className="form-group">
              <label>{content.civilite || "Civilité"}:</label>
              <select value={editingUser.civilite} onChange={(e) => setEditingUser((c) => ({ ...c, civilite: e.target.value }))}>
                <option value="Monsieur">{content.civiliteMonsieur || "Monsieur"}</option>
                <option value="Madame">{content.civiliteMadame || "Madame"}</option>
              </select>
            </div>
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
          </div>
          <div className="inscription-edit-actions">
            <button type="button" className="activity-btn activity-btn-primary" onClick={saveManagedUser} disabled={savingManagedUser}>
              {savingManagedUser ? "..." : (content.saveLabel || "Save")}
            </button>
            <button type="button" className="activity-btn" onClick={cancelManageUser}>
              {content.cancelLabel || "Cancel"}
            </button>
            <button type="button" className="activity-btn activity-btn-danger" onClick={deleteManagedUser} disabled={deletingManagedUser}>
              {deletingManagedUser ? "..." : (content.deleteLabel || "Delete")}
            </button>
          </div>
        </div>
      )}

      <div className="activity-card inscription-users-card">
        <p className="inscription-users-hint">{content.usersHint || "You can manage all users in your school."}</p>
        <p className="inscription-users-count">
          {(content.usersCountSummary || "Users: {count}. Maximum for the {version} plan: {max}.")
            .replace("{count}", String(users.length))
            .replace("{version}", schoolCustomization?.customerVersion || "")
            .replace("{max}", String(schoolCustomization?.maxUsers || ""))}
        </p>
        {usersError && <p className="activity-message activity-message-error">{usersError}</p>}

        {usersLoading ? (
          <p className="activity-loading">{content.loading || "Loading..."}</p>
        ) : users.length === 0 ? (
          <div className="activity-empty">{content.noUsersLabel || "No users found."}</div>
        ) : (
          <div className="inscription-table-wrapper">
            <table className="inscription-table">
              <thead>
                <tr>
                  <th>{content.civilite || "Civilité"}</th>
                  <th>{content.surname || "Last name"}</th>
                  <th>{content.firstname || "First name"}</th>
                  <th>{content.email || "Email"}</th>
                  <th>{content.role || "Role"}</th>
                  <th>{content.actionsLabel || "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const currentRole = Array.isArray(user.roles) && user.roles.length > 0 ? String(user.roles[0]).trim().toLowerCase() : "student";
                  const civiliteAbbrev = user.civilite === "Madame" ? "Mme" : user.civilite === "Monsieur" ? "M." : (user.civilite || "");
                  return (
                    <tr key={user.id} className={selectedUserId === user.id ? "is-selected" : ""}>
                      <td>{civiliteAbbrev}</td>
                      <td>{user.username}</td>
                      <td>{getLocalizedFirstName(user, language)}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`inscription-role-badge inscription-role-${currentRole}`}>
                          {roleLabelMap[currentRole] || currentRole}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="activity-icon-btn activity-icon-edit"
                          onClick={() => startManageUser(user)}
                          title={content.manageLabel || "Modifier"}
                        >
                          ✏️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inscription;
