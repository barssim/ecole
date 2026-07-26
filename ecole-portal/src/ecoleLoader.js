import { getTenantId } from "./tenant";

const customizationMap = {
  gardinia: () => require("./customizations/gardinia").default,
  qods: () => require("./customizations/qods").default,
};

const resolveCustomizationLoader = (tenantId) => customizationMap[tenantId] || customizationMap.qods;

export const getFallbackCustomization = (tenantId = getTenantId()) => {
  const loadCustomization = resolveCustomizationLoader(tenantId);
  return loadCustomization();
};

const mergeCustomization = (fallback, remote) => {
  if (!remote || typeof remote !== "object") {
    return fallback;
  }

  return {
    ...fallback,
    ...remote,
    name: { ...(fallback.name || {}), ...(remote.name || {}) },
    adresse: { ...(fallback.adresse || {}), ...(remote.adresse || {}) },
    about: {
      ...(fallback.about || {}),
      ...(remote.about || {}),
      title: { ...(fallback.about?.title || {}), ...(remote.about?.title || {}) },
      description: { ...(fallback.about?.description || {}), ...(remote.about?.description || {}) },
    },
  };
};

export const fetchTenantCustomization = async () => {
  const tenantId = getTenantId();
  const fallback = getFallbackCustomization(tenantId);
  const token = sessionStorage.getItem("jwt_token");
  const baseUrl = (process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:8085").replace(/\/$/, "");

  try {
    const response = await fetch(`${baseUrl}/api/tenant-customization`, {
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": tenantId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      return fallback;
    }

    const remoteCustomization = await response.json();
    return mergeCustomization(fallback, remoteCustomization);
  } catch {
    return fallback;
  }
};

export default getFallbackCustomization();

