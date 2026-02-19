const STORAGE_KEY = "rechargeData";
const DEFAULT_LIMIT = 25;

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export const readRechargeHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isObject);
  } catch {
    return [];
  }
};

export const writeRechargeHistory = (entries) => {
  const safeEntries = Array.isArray(entries) ? entries.filter(isObject) : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeEntries));
};

export const appendRechargeEntry = (entry, limit = DEFAULT_LIMIT) => {
  const existing = readRechargeHistory();
  const next = [entry, ...existing].slice(0, limit);
  writeRechargeHistory(next);
};

export const maskRechargeCode = (code, visibleChars = 4) => {
  const source = String(code ?? "");
  const totalAlphaNum = (source.match(/[a-zA-Z0-9]/g) || []).length;
  const threshold = Math.max(totalAlphaNum - visibleChars, 0);
  let seen = 0;

  return source.replace(/[a-zA-Z0-9]/g, (char) => {
    seen += 1;
    return seen <= threshold ? "*" : char;
  });
};

export const createVerificationId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `RC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  }
  return `RC-${Date.now().toString(36).toUpperCase()}`;
};

