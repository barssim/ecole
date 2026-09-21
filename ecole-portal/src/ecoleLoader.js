import { getSchoolId } from "./school";

const customizationMap = {
  gardinia: () => require("./customizations/gardinia").default,
  qods: () => require("./customizations/qods").default,
};

const resolveCustomizationLoader = (schoolId) => customizationMap[schoolId] || customizationMap.qods;

export const getFallbackCustomization = (schoolId = getSchoolId()) => {
  const loadCustomization = resolveCustomizationLoader(schoolId);
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

export const fetchSchoolCustomization = async () => {
  const schoolId = getSchoolId();
  const fallback = getFallbackCustomization(schoolId);
  const token = sessionStorage.getItem("jwt_token");
  const requestUrl = '/api/school-customization';

  try {
    const response = await fetch(requestUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-School-Id": schoolId,
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
