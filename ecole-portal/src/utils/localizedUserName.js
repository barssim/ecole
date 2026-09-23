const SUPPORTED_LANGUAGES = ['fr', 'en', 'ar'];

const normalizeLanguage = (language) => (
  SUPPORTED_LANGUAGES.includes(language) ? language : 'fr'
);

export const getLocalizedFirstName = (user, language) => {
  if (!user || typeof user !== 'object') return '';
  const lang = normalizeLanguage(language);
  return user.firstnames?.[lang]
    || user.firstnames?.fr
    || user.firstnames?.en
    || user.firstnames?.ar
    || user.firstname
    || '';
};

export const getLocalizedUserName = (user, language) => {
  if (!user || typeof user !== 'object') return '';
  const lang = normalizeLanguage(language);
  return user.names?.[lang]
    || user.names?.fr
    || user.names?.en
    || user.names?.ar
    || user.name
    || user.username
    || [getLocalizedFirstName(user, lang), user.surname].filter(Boolean).join(' ');
};

const normalizeName = (value) => String(value || '').trim().toLocaleLowerCase();

export const localizeStoredUserName = (storedName, users, language) => {
  const canonicalName = String(storedName || '').trim();
  if (!canonicalName || !Array.isArray(users)) return canonicalName;

  const normalizedCanonical = normalizeName(canonicalName);
  const matchingUser = users.find((user) => {
    const aliases = [
      user?.name,
      user?.username,
      user?.firstname,
      ...Object.values(user?.names || {}),
      ...Object.values(user?.firstnames || {}),
    ];
    return aliases.some((alias) => normalizeName(alias) === normalizedCanonical);
  });

  return matchingUser ? getLocalizedUserName(matchingUser, language) : canonicalName;
};
