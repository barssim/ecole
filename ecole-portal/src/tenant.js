const TENANT_STORAGE_KEY = 'tenant_id';

export const resolveTenantFromHost = (host = window.location.hostname) => {
  const normalizedHost = String(host || '').toLowerCase();
  if (!normalizedHost || normalizedHost === 'localhost' || normalizedHost.startsWith('127.')) {
    return 'default';
  }

  const parts = normalizedHost.split('.');
  return parts.length >= 3 ? parts[0] : 'default';
};

export const getTenantId = () => {
  return localStorage.getItem(TENANT_STORAGE_KEY) || resolveTenantFromHost();
};

export const setTenantId = (tenantId) => {
  const normalizedTenant = String(tenantId || '').trim().toLowerCase();
  if (!normalizedTenant) {
    return;
  }
  localStorage.setItem(TENANT_STORAGE_KEY, normalizedTenant);
};

export const clearTenantId = () => {
  localStorage.removeItem(TENANT_STORAGE_KEY);
};

