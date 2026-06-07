// Shared shell for samuel.m site — terminal feel × elegant serif.
// Now theme-aware (dark / light) via CSS variables.

const NAV = [
  { id: 'home', path: '~/',         label: '~/' },
  { id: 'work', path: '~/projects', label: '~/projects' },
  { id: 'blog', path: '~/blog',     label: '~/blog' },
  { id: 'cv',   path: '~/cv',       label: '~/cv' },
];

const THEMES = {
  dark: {
    '--bg':           '#0a0807',
    '--fg':           '#bdb6ad',
    '--fg-strong':    '#f0ebe2',
    '--fg-mid':       '#a8a098',
    '--fg-dim':       '#7a7268',
    '--fg-faint':     '#5d564e',
    '--fg-ghost':     '#3a342e',
    '--accent':       '#c8413a',
    '--accent-bright':'#e8a59f',
    '--accent-dim':   '#7a4a45',
    '--accent-soft':  'rgba(120,40,35,0.10)',
    '--accent-line':  'rgba(120,40,35,0.12)',
    '--accent-line-strong': 'rgba(120,40,35,0.18)',
    '--surface':      'rgba(16,13,11,0.5)',
    '--surface-2':    'rgba(10,8,7,0.4)',
    '--topbar-bg':    'rgba(10,8,7,0.7)',
    '--green':        '#7ec07e',
    '--host':         '#d4847e',
    '--info':         '#7ec0d4',
    '--warn':         '#d4a07e',
    '--note':         '#d4847e',
    '--paper':        'rgba(245,240,232,0.02)',
    '--wash-1':       'rgba(157, 58, 53, 0.18)',
    '--wash-2':       'rgba(120, 40, 35, 0.10)',
    '--wash-3':       'rgba(120, 40, 35, 0.14)',
  },
  light: {
    '--bg':           '#f4f0ea',
    '--fg':           '#3d3530',
    '--fg-strong':    '#1a1410',
    '--fg-mid':       '#5d5048',
    '--fg-dim':       '#8a7a6e',
    '--fg-faint':     '#a89a8e',
    '--fg-ghost':     '#d4cabe',
    '--accent':       '#9a2a24',
    '--accent-bright':'#c8413a',
    '--accent-dim':   '#7a2a26',
    '--accent-soft':  'rgba(154,42,36,0.08)',
    '--accent-line':  'rgba(154,42,36,0.14)',
    '--accent-line-strong': 'rgba(154,42,36,0.22)',
    '--surface':      'rgba(255,250,242,0.6)',
    '--surface-2':    'rgba(245,240,232,0.7)',
    '--topbar-bg':    'rgba(244,240,234,0.75)',
    '--green':        '#3a7a4a',
    '--host':         '#9a2a24',
    '--info':         '#3a6a85',
    '--warn':         '#8a5a2a',
    '--note':         '#9a2a24',
    '--paper':        'rgba(255,252,246,0.85)',
    '--wash-1':       'rgba(200, 80, 70, 0.10)',
    '--wash-2':       'rgba(180, 70, 60, 0.06)',
    '--wash-3':       'rgba(180, 70, 60, 0.08)',
  },
};

const Shell = ({ page, breadcrumb, onNav, children, theme = 'dark', onToggleTheme }) => {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const ts = time.toISOString().replace('T', ' ').slice(0, 19);

  // Apply theme variables to <body>
  React.useEffect(() => {
    const vars = THEMES[theme];
    Object.entries(vars).forEach(([k, v]) => document.body.style.setProperty(k, v));
    document.body.style.background = vars['--bg'];
    document.body.style.color = vars['--fg'];
  }, [theme]);

  // Command input
  const [cmd, setCmd] = React.useState('');
  const [hist, setHist] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const onKey = (e) => {
    if (e.key === 'Enter') {
      const c = cmd.trim();
      if (c) handleCmd(c);
      setCmd('');
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };
  const handleCmd = (c) => {
    let resp = '';
    if (c === 'ls' || c === 'ls ~/' || c === 'ls ~') {
      resp = 'projects/  blog/  cv/  about';
    } else if (c.startsWith('cd ')) {
      const dest = c.slice(3).trim().replace(/^\.\//,'').replace(/^~\/?/,'');
      const map = { '': 'home', 'projects': 'work', 'blog': 'blog', 'cv': 'cv', 'work': 'work' };
      const target = map[dest];
      if (target) { onNav(target); resp = ''; }
      else resp = `cd: no such directory: ${dest}`;
    } else if (c === 'pwd') {
      resp = breadcrumb || '~/';
    } else if (c === 'whoami') {
      resp = 'samuel';
    } else if (c === 'theme' || c === 'theme toggle') {
      onToggleTheme && onToggleTheme();
      resp = `theme → ${theme === 'dark' ? 'light' : 'dark'}`;
    } else if (c === 'help') {
      resp = 'commands: ls · cd <dir> · pwd · whoami · theme · clear';
    } else if (c === 'clear') {
      setHist([]); return;
    } else {
      resp = `zsh: command not found: ${c.split(' ')[0]}`;
    }
    setHist(h => [...h, { cmd: c, resp }].slice(-6));
  };

  return (
    <div style={shellStyles.root}>
      {/* Full-bleed background gradients */}
      <div style={shellStyles.bgWash}>
        <div style={shellStyles.bgWashTop}/>
        <div style={shellStyles.bgWashRight}/>
        <div style={shellStyles.bgWashBot}/>
      </div>

      {/* Top kitty-style tab bar */}
      <header style={shellStyles.topbar}>
        <div style={shellStyles.tabs}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              data-tab="1"
              style={{
                ...shellStyles.tab,
                ...(page === n.id ? shellStyles.tabActive : {}),
              }}
            >
              {n.label}
            </button>
          ))}
        </div>
        <div style={shellStyles.topRight}>
          <button onClick={() => setOpen(o => !o)} style={shellStyles.cmdBtn} title="Press / or click to open zsh">
            <span style={shellStyles.kbd}>:</span> zsh
          </button>
          <button onClick={onToggleTheme} style={shellStyles.themeBtn} title={`switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? (
              /* sun */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
              </svg>
            ) : (
              /* moon */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
              </svg>
            )}
          </button>
          <span style={shellStyles.clock}>{ts}</span>
        </div>
      </header>

      {/* Persistent prompt / breadcrumb */}
      <div style={shellStyles.prompt}>
        <span style={shellStyles.user}>samuel</span>
        <span style={shellStyles.at}>@</span>
        <span style={shellStyles.host}>build</span>
        <span style={shellStyles.colon}>:</span>
        <span style={shellStyles.path}>{breadcrumb || '~/'}</span>
        <span style={shellStyles.dollar}>$</span>
        <span style={shellStyles.cursor}>_</span>
      </div>

      {/* zsh palette */}
      {open && (
        <div style={shellStyles.cmdPalette}>
          {hist.map((h, i) => (
            <div key={i} style={shellStyles.histLine}>
              <div style={shellStyles.histCmd}>
                <span style={shellStyles.user}>samuel</span>
                <span style={shellStyles.at}>@</span>
                <span style={shellStyles.host}>build</span>
                <span style={shellStyles.dollar}>$ </span>
                <span style={{color: 'var(--fg-strong)'}}>{h.cmd}</span>
              </div>
              {h.resp && <div style={shellStyles.histResp}>{h.resp}</div>}
            </div>
          ))}
          <div style={shellStyles.cmdRow}>
            <span style={shellStyles.user}>samuel</span>
            <span style={shellStyles.at}>@</span>
            <span style={shellStyles.host}>build</span>
            <span style={shellStyles.dollar}>$ </span>
            <input
              autoFocus
              value={cmd}
              onChange={e => setCmd(e.target.value)}
              onKeyDown={onKey}
              style={shellStyles.cmdInput}
              placeholder="cd ~/blog · ls · whoami · theme · help"
            />
          </div>
        </div>
      )}

      {/* Page content */}
      <main style={shellStyles.main}>
        {children}
      </main>

      {/* Footer gradient + socials */}
      <footer style={shellStyles.footer}>
        <div style={shellStyles.gradientBar}/>
        <div style={shellStyles.footerInner}>
          <div style={shellStyles.socials}>
            <SocialIcon kind="github" href="https://github.com/ItzCopiouz"/>
            <SocialIcon kind="linkedin" href="https://www.linkedin.com/in/samuel-mcclanahan-1054b7334/"/>
            <SocialIcon kind="email" href="mailto:porkbuns1964@gmail.com"/>
            <SocialIcon kind="discord" href="#"/>
            <SocialIcon kind="rss" href="#"/>
          </div>
          <div style={shellStyles.copy}>
            <span>© 2026 samuel m</span>
            <span style={shellStyles.copySep}>·</span>
            <span>built with astro</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const SocialIcon = ({ kind, href }) => {
  const paths = {
    github: <path d="M12 0a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.87.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 0z"/>,
    linkedin: <path d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5zM8 19H5V8h3v11zM6.5 6.7a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zM20 19h-3v-5.6c0-1.4-.5-2.4-1.7-2.4-1 0-1.5.6-1.8 1.3-.1.2-.1.5-.1.8V19h-3V8h3v1.3c.4-.6 1.1-1.5 2.7-1.5 2 0 3.5 1.3 3.5 4.1V19z"/>,
    email: <><rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="m2 7 10 7 10-7" fill="none" stroke="currentColor" strokeWidth="1.8"/></>,
    discord: <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.4a14 14 0 0 0-6.4 0L8.6 3a19.8 19.8 0 0 0-4.9 1.4A20.6 20.6 0 0 0 .3 17.7a20 20 0 0 0 6 3l1.2-1.7a13 13 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12 0l.5.4a13 13 0 0 1-2 1l1.2 1.7a20 20 0 0 0 6-3 20.6 20.6 0 0 0-3.4-13.3zM8 14.4c-1.2 0-2.1-1-2.1-2.4s.9-2.4 2-2.4c1.3 0 2.2 1 2.2 2.4 0 1.3-1 2.4-2.2 2.4zm8 0c-1.2 0-2.1-1-2.1-2.4s.9-2.4 2.1-2.4c1.2 0 2.2 1 2.1 2.4 0 1.3-.9 2.4-2.1 2.4z"/>,
    rss: <path d="M4 11a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6v-3zm0-7a16 16 0 0 1 16 16h-3A13 13 0 0 0 4 7V4zm2.5 13a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>,
  };
  return (
    <a href={href} style={shellStyles.social} title={kind}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        {paths[kind]}
      </svg>
    </a>
  );
};

const ACCENT = 'var(--accent)';
const ACCENT_DIM = 'var(--accent-dim)';
const ACCENT_BRIGHT = 'var(--accent-bright)';

const shellStyles = {
  root: {
    background: 'var(--bg)',
    color: 'var(--fg)',
    fontFamily: '"Avenir Next", Avenir, "Montserrat", sans-serif',
    minHeight: '100vh',
    width: '100%',
    fontSize: 14,
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
    transition: 'background .25s ease, color .25s ease',
  },
  bgWash: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgWashTop: {
    position: 'absolute',
    top: '-15%', right: '-10%',
    width: '70%', height: '60%',
    background: 'radial-gradient(circle at center, var(--wash-1) 0%, transparent 70%)',
    filter: 'blur(40px)',
  },
  bgWashRight: {
    position: 'absolute',
    top: '30%', right: '-20%',
    width: '50%', height: '50%',
    background: 'radial-gradient(circle at center, var(--wash-2) 0%, transparent 70%)',
    filter: 'blur(50px)',
  },
  bgWashBot: {
    position: 'absolute',
    bottom: '-10%', left: '-15%',
    width: '70%', height: '60%',
    background: 'radial-gradient(circle at center, var(--wash-3) 0%, transparent 70%)',
    filter: 'blur(40px)',
  },

  topbar: {
    position: 'sticky', top: 0, zIndex: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 24px',
    background: 'var(--topbar-bg)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--accent-line)',
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 12,
  },
  tabs: { display: 'flex', gap: 2 },
  tab: {
    background: 'transparent',
    border: 'none',
    color: 'var(--fg-dim)',
    padding: '8px 14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 12,
    borderRadius: 4,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    transition: 'background .12s, color .12s',
  },
  tabActive: {
    color: 'var(--fg-strong)',
    background: 'var(--accent-soft)',
  },
  tabDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: '0 0 6px var(--accent)',
  },
  topRight: { display: 'flex', alignItems: 'center', gap: 12 },
  cmdBtn: {
    background: 'transparent',
    border: '1px solid var(--accent-line-strong)',
    color: 'var(--fg-dim)',
    padding: '5px 10px',
    borderRadius: 4,
    fontFamily: 'inherit',
    fontSize: 11,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  kbd: { color: 'var(--accent)', fontWeight: 600 },
  themeBtn: {
    background: 'transparent',
    border: '1px solid var(--accent-line-strong)',
    color: 'var(--fg-dim)',
    width: 26, height: 26,
    borderRadius: 4,
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: 0,
    transition: 'color .15s, border-color .15s',
  },
  clock: { color: 'var(--fg-faint)', fontSize: 11 },

  prompt: {
    padding: '14px 24px 12px',
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 12,
    background: 'transparent',
    position: 'relative',
    zIndex: 1,
  },
  user: { color: 'var(--green)' },
  at: { color: 'var(--fg-faint)' },
  host: { color: 'var(--host)' },
  colon: { color: 'var(--fg-faint)' },
  path: { color: 'var(--fg-mid)' },
  dollar: { color: 'var(--accent)', marginLeft: 4 },
  cursor: { color: 'var(--accent)', animation: 'blink 1.2s steps(2) infinite', marginLeft: 4 },

  cmdPalette: {
    position: 'sticky', top: 49, zIndex: 9,
    background: 'var(--topbar-bg)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--accent-line-strong)',
    padding: '14px 24px',
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 13,
  },
  histLine: { marginBottom: 6 },
  histCmd: { display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' },
  histResp: { color: 'var(--fg-mid)', marginLeft: 0, paddingLeft: 0, fontSize: 12.5 },
  cmdRow: { display: 'flex', alignItems: 'center', gap: 0 },
  cmdInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--fg-strong)',
    fontFamily: 'inherit',
    fontSize: 13,
    marginLeft: 4,
  },

  main: { position: 'relative', zIndex: 1, padding: '24px 24px 80px' },

  footer: { position: 'relative', zIndex: 1 },
  gradientBar: {
    height: 1,
    background: 'linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)',
    opacity: 0.5,
    marginBottom: 24,
  },
  footerInner: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 24px 24px',
    maxWidth: 920, margin: '0 auto',
  },
  socials: { display: 'flex', gap: 14 },
  social: { color: 'var(--fg-faint)', display: 'flex', transition: 'color .15s' },
  copy: {
    fontSize: 11, color: 'var(--fg-faint)',
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    display: 'flex', gap: 8, alignItems: 'center',
  },
  copySep: { color: 'var(--fg-ghost)' },
};

Object.assign(window, { Shell, NAV, ACCENT, ACCENT_DIM, ACCENT_BRIGHT });
