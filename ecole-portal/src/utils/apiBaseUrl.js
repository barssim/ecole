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
  if (/^https?:\/\//i.test(str)) return str;
  if (str.startsWith('//')) return `http:${str}`;
  return `http://${str}`;
};

const isContainerLocalHost = (hostname) => {
  const host = String(hostname || '').trim().toLowerCase();
  if (!host) return false;

  return host === 'localhost'
    || host === '127.0.0.1'
    || host === '0.0.0.0'
    || host === 'api-gateway'
    || host === 'solide-api-gateway'
    || host.endsWith('-gateway')
    || host.endsWith('.internal')
    || host.includes('docker')
    || host.includes('service')
    || host.includes('internal');
};

const isRelativeApiMode = () => String(process.env.REACT_APP_USE_RELATIVE_API || '').trim().toLowerCase() === 'true';

export const resolveApiBaseUrl = (fallback = 'http://localhost:8085') => {
  if (isRelativeApiMode()) {
    return '';
  }

  const configured = (process.env.REACT_APP_API_GATEWAY_URL || fallback).trim();
  const withProtocol = ensureProtocol(configured);
  const normalized = fixMissingPortColon(withProtocol);

  try {
    const url = new URL(normalized);
    if (typeof window !== 'undefined' && isContainerLocalHost(url.hostname)) {
      return window.location.origin.replace(/\/$/, '');
    }
  } catch {
    // ignore invalid config and fall back to the normalized value below
  }

  return normalized.replace(/\/$/, '');
};
