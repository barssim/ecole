const fixMissingPortColon = (url) => {
  const match = String(url || '').match(/^(https?:\/\/[^/:]+\.[a-zA-Z]{2,})(\d{2,5})(\/?[^?]*)?(\?.*)?$/);
  if (!match) {
    return url;
  }

  const [, host, port, path = '', query = ''] = match;
  return `${host}:${port}${path}${query}`;
};

export const resolveApiBaseUrl = (fallback = 'http://localhost:8085') => {
  const configured = (process.env.REACT_APP_API_GATEWAY_URL || fallback).trim();
  const normalized = fixMissingPortColon(configured);
  return normalized.replace(/\/$/, '');
};

