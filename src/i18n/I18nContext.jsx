import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTIONS,
  LANGUAGE_STORAGE_KEY,
  LOCALE_BY_LANGUAGE,
  translations,
} from "./translations";

const I18nContext = createContext(null);

const getByPath = (source, path) => {
  return path.split(".").reduce((current, key) => {
    if (current && Object.prototype.hasOwnProperty.call(current, key)) {
      return current[key];
    }
    return undefined;
  }, source);
};

const interpolate = (template, params = {}) => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      return String(params[key]);
    }
    return match;
  });
};

const resolveInitialLanguage = () => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && translations[stored]) {
    return stored;
  }
  return DEFAULT_LANGUAGE;
};

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(resolveInitialLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    const safeLanguage = translations[nextLanguage] ? nextLanguage : DEFAULT_LANGUAGE;
    setLanguageState(safeLanguage);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, safeLanguage);
    }
  }, []);

  const t = useCallback((key, params) => {
    const languagePack = translations[language] || translations[DEFAULT_LANGUAGE];
    const fallbackPack = translations[DEFAULT_LANGUAGE];
    const resolved = getByPath(languagePack, key) ?? getByPath(fallbackPack, key);
    if (typeof resolved !== "string") {
      return key;
    }
    return interpolate(resolved, params);
  }, [language]);

  const formatDateTime = useCallback((value, options) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    const locale = LOCALE_BY_LANGUAGE[language] || LOCALE_BY_LANGUAGE[DEFAULT_LANGUAGE];
    return date.toLocaleString(locale, options);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    formatDateTime,
    languageOptions: LANGUAGE_OPTIONS,
  }), [language, setLanguage, t, formatDateTime]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

