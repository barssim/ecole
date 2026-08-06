import React, { useEffect, useMemo, useState } from "react";
import { getTenantId } from "../tenant";
import { hasAnyRole, normalizeRoles } from "../utils/roles";
import { createApiUrlFor, readJsonResponse } from "../utils/apiClient";

const TenantCustomizationPage = () => {
  const tenantId = getTenantId();
  const token = sessionStorage.getItem("jwt_token");
  const userRoles = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user_roles") || "[]");
    } catch {
      return [];
    }
  }, []);

  const normalizedRoles = useMemo(() => normalizeRoles(userRoles), [userRoles]);
  const isManager = hasAnyRole(normalizedRoles, ["manager"]);

  const [form, setForm] = useState({
    nameFr: "",
    nameEn: "",
    nameAr: "",
    primaryColor: "",
    accentColor: "",
    softColor: "",
    phone: "",
    mail: "",
    footerText: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const apiUrlFor = createApiUrlFor('http://localhost:8085');

  const requestHeaders = {
    "Content-Type": "application/json",
    "X-Tenant-Id": tenantId,
    "X-User-Roles": normalizedRoles.join(","),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    const loadCustomization = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(apiUrlFor('/tenant-customization'), {
          headers: requestHeaders,
        });

        const data = await readJsonResponse(response, "Unable to load customization");
        setForm({
          nameFr: data?.name?.fr || "",
          nameEn: data?.name?.en || "",
          nameAr: data?.name?.ar || "",
          primaryColor: data?.primaryColor || "",
          accentColor: data?.accentColor || "",
          softColor: data?.softColor || "",
          phone: data?.phone || "",
          mail: data?.mail || "",
          footerText: data?.footerText || "",
        });
      } catch (err) {
        setError(err.message || "Unable to load customization");
      } finally {
        setLoading(false);
      }
    };

    loadCustomization();
  }, []);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!isManager) {
      setError("Only managers can update tenant customization.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: {
          fr: form.nameFr,
          en: form.nameEn,
          ar: form.nameAr,
        },
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        softColor: form.softColor,
        phone: form.phone,
        mail: form.mail,
        footerText: form.footerText,
      };

      const response = await fetch(apiUrlFor('/tenant-customization'), {
        method: "PUT",
        headers: requestHeaders,
        body: JSON.stringify(payload),
      });

      await readJsonResponse(response, "Unable to save customization");

      setMessage("Customization saved. Refresh the page to see updated tenant theme/text.");
    } catch (err) {
      setError(err.message || "Unable to save customization");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading tenant customization...</div>;
  }

  if (!isManager) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Tenant customization</h2>
        <p style={{ color: "#c00" }}>Only manager role can manage customization for this tenant.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 760 }}>
      <h2>Tenant customization ({tenantId})</h2>
      {error && <p style={{ color: "#c00" }}>{error}</p>}
      {message && <p style={{ color: "#0a7a2f" }}>{message}</p>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>School name (FR)</label>
          <input type="text" value={form.nameFr} onChange={(e) => onChange("nameFr", e.target.value)} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>School name (EN)</label>
          <input type="text" value={form.nameEn} onChange={(e) => onChange("nameEn", e.target.value)} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>School name (AR)</label>
          <input type="text" value={form.nameAr} onChange={(e) => onChange("nameAr", e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Primary color (hex)</label>
          <input type="text" placeholder="#007bff" value={form.primaryColor} onChange={(e) => onChange("primaryColor", e.target.value)} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Accent color (hex)</label>
          <input type="text" placeholder="#33a1ff" value={form.accentColor} onChange={(e) => onChange("accentColor", e.target.value)} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Soft color (hex)</label>
          <input type="text" placeholder="#d6ecff" value={form.softColor} onChange={(e) => onChange("softColor", e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Phone</label>
          <input type="text" value={form.phone} onChange={(e) => onChange("phone", e.target.value)} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input type="email" value={form.mail} onChange={(e) => onChange("mail", e.target.value)} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Footer text</label>
          <input type="text" value={form.footerText} onChange={(e) => onChange("footerText", e.target.value)} style={{ width: "100%" }} />
        </div>

        <button className="buttonStyle" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save customization"}
        </button>
      </form>
    </div>
  );
};

export default TenantCustomizationPage;

