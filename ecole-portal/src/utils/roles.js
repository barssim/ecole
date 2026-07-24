export const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .flatMap((role) => String(role || "").split(","))
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean);
};

const hasSingleRole = (normalizedRole, expectedRole) => {
  const expected = String(expectedRole || "").trim().toLowerCase();
  if (!expected) {
    return false;
  }

  return (
    normalizedRole === expected ||
    normalizedRole === `role_${expected}` ||
    normalizedRole.endsWith(`_${expected}`)
  );
};

export const hasAnyRole = (roles, expectedRoles) => {
  const normalizedRoles = normalizeRoles(roles);
  const targets = Array.isArray(expectedRoles) ? expectedRoles : [expectedRoles];
  return normalizedRoles.some((role) => targets.some((target) => hasSingleRole(role, target)));
};

