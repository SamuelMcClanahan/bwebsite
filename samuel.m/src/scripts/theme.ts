const STORAGE_KEY = 'slm-theme';

function getStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function getTheme(): 'dark' | 'light' {
  let stored: string | null | undefined;
  try {
    stored = getStorage()?.getItem(STORAGE_KEY);
  } catch {
    stored = undefined;
  }
  if (stored === 'light' || stored === 'dark') return stored;
  if (typeof document !== 'undefined' && document.body.classList.contains('light')) return 'light';
  return 'dark';
}

export function setTheme(theme: 'dark' | 'light') {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('light', theme === 'light');
  try {
    getStorage()?.setItem(STORAGE_KEY, theme);
  } catch {}
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function initTheme() {
  setTheme(getTheme());
}
