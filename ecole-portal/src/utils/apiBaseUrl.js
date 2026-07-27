const fixMissingPortColon = (url) => {
  const match = String(url || '').match(/^(https?:\/\/[^/:]+\.[a-zA-Z]{2,})(\d{2,5})(\/?[^?]*)?(\?.*)?$/);
  if (!match) {
    return url;
  }

  const [, host, port, path = '', query = ''] = match;
  return `${host}:${port}${path}${query}`;
};

const ensureProtocol = (url) => {
  const str = String(url || '').trim();
  if (!str) return str;
  // Already has a protocol
  if (/^https?:\/\//i.test(str)) return str;
  // Protocol-relative (e.g. //example.com)
  if (str.startsWith('//')) return `http:${str}`;
  // No protocol at all – prepend http://
  return `http://${str}`;
};

export const resolveApiBaseUrl = (fallback = 'http://localhost:8085') => {
  const configured = (process.env.REACT_APP_API_GATEWAY_URL || fallback).trim();
  const withProtocol = ensureProtocol(configured);
  const normalized = fixMissingPortColon(withProtocol);
  return normalized.replace(/\/$/, '');
};

