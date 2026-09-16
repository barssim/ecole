import { getTenantId } from "./tenant";
import { resolveApiBaseUrl } from "./utils/apiBaseUrl";

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
  const baseUrl = resolveApiBaseUrl("http://localhost:8085");
  const requestBase = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const requestUrl = requestBase ? `${requestBase}/api/tenant-customization` : '/api/tenant-customization';

  try {
    const response = await fetch(requestUrl, {
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
