import { useState, useEffect } from 'react';
import { toggleTheme, getTheme } from '../../scripts/theme';

const NAV = [
  { id: 'home', href: '/', label: '~/' },
  { id: 'work', href: '/work', label: '~/work' },
  { id: 'cv', href: '/cv', label: '~/cv' },
];

function TerminalIcon() {
  return (
    <svg className="top-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 7 5 5-5 5" />
      <path d="M11 17h9" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="top-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="top-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

export default function TopBar({ page }: { page: string }) {
  const [time, setTime] = useState(() => new Date());
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') return getTheme();
    return 'dark';
  });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  useEffect(() => {
    const handler = () => {
      setThemeState(toggleTheme());
    };
    window.addEventListener('toggle-theme', handler);
    return () => window.removeEventListener('toggle-theme', handler);
  }, []);

  const ts = time.toLocaleString('sv-SE', { timeZone: 'America/Los_Angeles' });

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setThemeState(next);
  };

  const toggleZsh = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggle-zsh'));
    }
  };

  return (
    <header className="topbar">
      <div className="tabs">
        {NAV.map((n) => (
          <a
            key={n.id}
            href={n.href}
            className={`tab ${page === n.id ? 'tab-active' : ''}`}
          >
            {n.label}
          </a>
        ))}
      </div>
      <div className="top-right">
        <button onClick={toggleZsh} className="cmd-btn" title="Press / or click to open zsh">
          <TerminalIcon />
          zsh
        </button>
        <button onClick={handleToggleTheme} className="theme-btn" title={`switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <span className="clock">{ts}</span>
      </div>

      <style>{`
        .topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 24px;
          background: transparent;
          border-bottom: none;
          font-family: "0xProto Nerd Font Mono", "0xProto", monospace;
          font-size: 12px;
        }
        .tabs { display: flex; gap: 2px; }
        .tab {
          background: transparent;
          border: none;
          color: var(--fg-dim);
          padding: 8px 8px;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          border-radius: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: color .12s;
          text-decoration: none;
        }
        .tab:hover { color: var(--fg-strong); }
        .tab-active {
          color: var(--fg-strong) !important;
          background: transparent;
        }
        .top-right { display: flex; align-items: center; gap: 12px; }
        .cmd-btn {
          background: transparent;
          border: none;
          color: var(--fg-dim);
          padding: 5px 6px;
          border-radius: 0;
          font-family: inherit;
          font-size: 11px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .kbd { color: var(--accent); font-weight: 600; }
        .theme-btn {
          background: transparent;
          border: none;
          color: var(--fg-dim);
          width: 26px;
          height: 26px;
          border-radius: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: color .15s;
        }
        .theme-btn:hover { color: var(--fg-strong); }
        .top-icon {
          width: 14px;
          height: 14px;
          display: block;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex: 0 0 auto;
        }
        .clock { color: var(--fg-faint); font-size: 11px; }
      `}</style>
    </header>
  );
}
