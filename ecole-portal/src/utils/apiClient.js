import { resolveApiBaseUrl } from './apiBaseUrl';

export const createApiUrlFor = (fallback = 'http://localhost:8085') => {
  const configuredBase = resolveApiBaseUrl(fallback);
  const browserIsLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const localhostApiTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBase);
  const inferredRemoteBase = `${window.location.protocol}//${window.location.hostname}:8085`;
  const effectiveBase = localhostApiTarget && !browserIsLocal ? inferredRemoteBase : configuredBase;
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === 'true';

  return (path) => (useRelativeApi ? `/api${path}` : `${effectiveBase}/api${path}`);
};

export const isHtmlResponse = (response, bodyText = '') => {
  const contentType = String(response?.headers?.get('content-type') || '').toLowerCase();
  const normalizedBody = String(bodyText || '').trim().toLowerCase();
  return contentType.includes('text/html')
    || normalizedBody.startsWith('<!doctype html')
    || normalizedBody.startsWith('<html');
};

const extractErrorMessage = (response, bodyText, fallbackMessage) => {
  if (!bodyText || isHtmlResponse(response, bodyText)) {
    return fallbackMessage;
  }

  try {
    const parsed = JSON.parse(bodyText);
    if (parsed && typeof parsed === 'object') {
      return parsed.message || parsed.error || fallbackMessage;
    }
  } catch {
    // ignore JSON parse errors and fall back to raw body text
  }

  return bodyText;
};

export const readJsonResponse = async (response, fallbackMessage) => {
  const bodyText = await response.text();

  if (!response.ok) {
    throw new Error(extractErrorMessage(response, bodyText, fallbackMessage));
  }

  if (isHtmlResponse(response, bodyText)) {
    throw new Error(fallbackMessage);
  }

  if (!bodyText) {
    return null;
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    throw new Error(fallbackMessage);
  }
};

