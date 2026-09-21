import axios from 'axios';
import { getSchoolId } from './school';

const readRoleHeader = () => {
  try {
    const raw = localStorage.getItem('user_roles');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    const roles = Array.isArray(parsed)
      ? parsed
      : String(parsed).split(',');
    return roles
      .flatMap((r) => String(r || '').split(','))
      .map((r) => r.trim().toLowerCase().replace(/^role_/, ''))
      .filter(Boolean)
      .join(',');
  } catch {
    return '';
  }
};

axios.interceptors.request.use((config) => {
  const schoolId = getSchoolId();
  if (schoolId) {
    config.headers = config.headers || {};
    config.headers['X-School-Id'] = schoolId;
  }

  const roleHeader = readRoleHeader();
  if (roleHeader) {
    config.headers = config.headers || {};
    // Only set if not already set by the caller (explicit header wins)
    if (!config.headers['X-User-Roles']) {
      config.headers['X-User-Roles'] = roleHeader;
    }
  }

  return config;
});

