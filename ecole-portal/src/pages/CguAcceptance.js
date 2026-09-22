import React, { useState } from "react";
import { getSchoolId } from "../school";
import { createApiUrlFor } from "../utils/apiClient";

const CGU_VERSION = "1.0";

const resolveUserId = (token) => {
  const storedUserId = sessionStorage.getItem("cgu_pending_user_id")
    || localStorage.getItem("userId");
  if (storedUserId) {
    return storedUserId;
  }

  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    const candidate = decoded.userId ?? decoded.user_id ?? decoded.id;
    return candidate ? String(candidate) : "";
  } catch {
    return "";
  }
};

const CguAcceptance = () => {
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!accepted) {
      setError("Vous devez accepter les CGU pour continuer.");
      return;
    }
    const token = sessionStorage.getItem("jwt_token");
    const userId = token ? resolveUserId(token) : "";
    if (!userId || !token) {
      setError("Votre session est invalide. Veuillez vous reconnecter.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const apiUrlFor = createApiUrlFor("http://localhost:8085");
      const response = await fetch(apiUrlFor(`/users/${encodeURIComponent(userId)}/cgu-acceptance`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-School-Id": getSchoolId(),
        },
        body: JSON.stringify({ version: CGU_VERSION }),
      });
      if (!response.ok) {
        throw new Error("Impossible d'enregistrer votre acceptation des CGU.");
      }
      localStorage.removeItem("cgu_pending");
      sessionStorage.removeItem("cgu_pending_user_id");
      window.location.href = "/";
    } catch (submissionError) {
      setError(submissionError.message);
      setSaving(false);
    }
  };

  return (
    <article className="legal-page">
      <h1>Acceptation des CGU requise</h1>
      <p>Veuillez lire les <a href="/cgu" target="_blank" rel="noopener noreferrer">Conditions générales d'utilisation</a> avant de continuer.</p>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={submit}>
        <label className="cgu-acceptance">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
          {" "}J'accepte les CGU (version {CGU_VERSION})
        </label>
        <br />
        <button className="buttonStyle" type="submit" disabled={saving}>
          {saving ? "Enregistrement..." : "Continuer"}
        </button>
      </form>
    </article>
  );
};

export default CguAcceptance;
