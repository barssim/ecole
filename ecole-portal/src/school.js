const SCHOOL_STORAGE_KEY = 'school_id';
const DEFAULT_SCHOOL_ID = String(process.env.REACT_APP_DEFAULT_SCHOOL_ID || 'gardinia').trim().toLowerCase() || 'gardinia';

const normalizeSchoolId = (schoolId) => String(schoolId || '').trim().toLowerCase();

const isPlaceholderSchool = (schoolId) => normalizeSchoolId(schoolId) === 'default';

export const resolveSchoolFromHost = (host = window.location.hostname) => {
  const normalizedHost = normalizeSchoolId(host);
  if (!normalizedHost || normalizedHost === 'localhost' || normalizedHost.startsWith('127.')) {
    return DEFAULT_SCHOOL_ID;
  }

  if (normalizedHost.endsWith('.localhost')) {
    const candidate = normalizedHost.replace(/\.localhost$/, '');
    return candidate && candidate !== 'www' ? candidate : DEFAULT_SCHOOL_ID;
  }

  const parts = normalizedHost.split('.');
  const candidate = parts.length >= 3 ? parts[0] : DEFAULT_SCHOOL_ID;
  return candidate && candidate !== 'www' ? candidate : DEFAULT_SCHOOL_ID;
};

export const getSchoolId = () => {
  const stored = normalizeSchoolId(localStorage.getItem(SCHOOL_STORAGE_KEY));
  const resolved = resolveSchoolFromHost();

  if (resolved) {
    if (stored !== resolved) {
      localStorage.setItem(SCHOOL_STORAGE_KEY, resolved);
      localStorage.removeItem('user_roles');
      localStorage.removeItem('LoggedIn');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
    }
    return resolved;
  }

  if (stored && !isPlaceholderSchool(stored)) {
    return stored;
  }

  if (!stored || isPlaceholderSchool(stored)) {
    localStorage.setItem(SCHOOL_STORAGE_KEY, DEFAULT_SCHOOL_ID);
  }
  return DEFAULT_SCHOOL_ID;
};

export const setSchoolId = (schoolId) => {
  const normalizedSchool = normalizeSchoolId(schoolId);
  if (!normalizedSchool) {
    return;
  }

  // `default` is only a historical placeholder; persist a usable school value instead.
  localStorage.setItem(
    SCHOOL_STORAGE_KEY,
    isPlaceholderSchool(normalizedSchool) ? resolveSchoolFromHost() : normalizedSchool
  );
};

export const clearSchoolId = () => {
  localStorage.removeItem(SCHOOL_STORAGE_KEY);
};
