const TENANT_STORAGE_KEY = 'tenant_id';
const DEFAULT_TENANT_ID = String(process.env.REACT_APP_DEFAULT_TENANT_ID || 'gardinia').trim().toLowerCase() || 'gardinia';

const normalizeTenantId = (tenantId) => String(tenantId || '').trim().toLowerCase();

const isPlaceholderTenant = (tenantId) => normalizeTenantId(tenantId) === 'default';

export const resolveTenantFromHost = (host = window.location.hostname) => {
  const normalizedHost = normalizeTenantId(host);
  if (!normalizedHost || normalizedHost === 'localhost' || normalizedHost.startsWith('127.')) {
    return DEFAULT_TENANT_ID;
  }

  const parts = normalizedHost.split('.');
  const candidate = parts.length >= 3 ? parts[0] : DEFAULT_TENANT_ID;
  return candidate && candidate !== 'www' ? candidate : DEFAULT_TENANT_ID;
};

export const getTenantId = () => {
  const stored = normalizeTenantId(localStorage.getItem(TENANT_STORAGE_KEY));
  if (stored && !isPlaceholderTenant(stored)) {
    return stored;
  }

  const resolved = resolveTenantFromHost();
  if (!stored || isPlaceholderTenant(stored)) {
    localStorage.setItem(TENANT_STORAGE_KEY, resolved);
  }
  return resolved;
};

export const setTenantId = (tenantId) => {
  const normalizedTenant = normalizeTenantId(tenantId);
  if (!normalizedTenant) {
    return;
  }

  // `default` is only a historical placeholder; persist a usable tenant value instead.
  localStorage.setItem(
    TENANT_STORAGE_KEY,
    isPlaceholderTenant(normalizedTenant) ? resolveTenantFromHost() : normalizedTenant
  );
};

export const clearTenantId = () => {
  localStorage.removeItem(TENANT_STORAGE_KEY);
};

