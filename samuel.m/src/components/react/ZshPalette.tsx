import { useState, useEffect, useRef } from 'react';

const COMMANDS: Record<string, string | ((arg: string) => string)> = {
  ls: 'projects/  work/  cv/  about',
  'ls ~/': 'projects/  work/  cv/  about',
  'ls ~': 'projects/  work/  cv/  about',
  pwd: '', // filled at runtime
  whoami: 'samuel',
  help: 'commands: ls · cd <dir> · pwd · whoami · theme · clear',
};

const CD_MAP: Record<string, string> = {
  '': '/',
  '~': '/',
  '~/': '/',
  'projects': '/projects',
  '~/projects': '/projects',
  'work': '/work',
  '~/work': '/work',
  'cv': '/cv',
  '~/cv': '/cv',
};

export default function ZshPalette({ breadcrumb }: { breadcrumb: string }) {
  const [open, setOpen] = useState(false);
  const [cmd, setCmd] = useState('');
  const [hist, setHist] = useState<{ cmd: string; resp: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setOpen((o) => !o);
    window.addEventListener('toggle-zsh', handler);
    return () => window.removeEventListener('toggle-zsh', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === '/' && !open && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleCmd = (c: string) => {
    let resp = '';
    if (c === 'theme' || c === 'theme toggle') {
      window.dispatchEvent(new CustomEvent('toggle-theme'));
      resp = 'theme toggled';
    } else if (c.startsWith('cd ')) {
      const dest = c.slice(3).trim().replace(/^\.\//, '').replace(/^~\/?/, '');
      const target = CD_MAP[dest] ?? CD_MAP['~/' + dest];
      if (target) {
        window.location.href = target;
        return;
      }
      resp = `cd: no such directory: ${dest}`;
    } else if (c === 'pwd') {
      resp = breadcrumb || '~/';
    } else if (c === 'clear') {
      setHist([]);
      return;
    } else if (COMMANDS[c]) {
      resp = COMMANDS[c] as string;
    } else {
      const base = c.split(' ')[0];
      resp = `zsh: command not found: ${base}`;
    }
    setHist((h) => [...h, { cmd: c, resp }].slice(-20));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const c = cmd.trim();
      if (c) handleCmd(c);
      setCmd('');
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="cmd-palette">
      {hist.map((h, i) => (
        <div key={i} className="hist-line">
          <div className="hist-cmd">
            <span className="user">samuel</span>
            <span className="at">@</span>
            <span className="host">build</span>
            <span className="dollar">$ </span>
            <span style={{ color: 'var(--fg-strong)' }}>{h.cmd}</span>
          </div>
          {h.resp && <div className="hist-resp">{h.resp}</div>}
        </div>
      ))}
      <div className="cmd-row">
        <span className="user">samuel</span>
        <span className="at">@</span>
        <span className="host">build</span>
        <span className="dollar">$ </span>
        <input
          ref={inputRef}
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={onKeyDown}
          className="cmd-input"
          placeholder="cd ~/work · ls · whoami · theme · help"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
        />
      </div>
      <style>{`
        .cmd-palette {
          position: sticky;
          top: 49px;
          z-index: 9;
          background: var(--topbar-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--accent-line-strong);
          padding: 14px 24px;
          font-family: "0xProto Nerd Font Mono", "0xProto", monospace;
          font-size: 13px;
        }
        .hist-line { margin-bottom: 6px; }
        .hist-cmd { display: flex; align-items: baseline; flex-wrap: wrap; }
        .hist-resp { color: var(--fg-mid); margin-left: 0; padding-left: 0; font-size: 12.5px; }
        .cmd-row { display: flex; align-items: center; gap: 0; }
        .cmd-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--fg-strong);
          font-family: inherit;
          font-size: 13px;
          margin-left: 4px;
          caret-color: var(--accent);
        }
        .cmd-input:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }
        .user { color: var(--green); }
        .at { color: var(--fg-faint); }
        .host { color: var(--host); }
        .dollar { color: var(--accent); margin-left: 4px; }
      `}</style>
    </div>
  );
}
