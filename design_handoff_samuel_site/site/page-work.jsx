// Work index — interactive card grid with tags

const PageWork = ({ onNav }) => {
  const [hover, setHover] = React.useState(null);
  return (
    <div style={wStyles.wrap}>
      <header style={wStyles.head}>
        <h1 style={wStyles.h1}>projects</h1>
        <p style={wStyles.lede}>
          <span style={wStyles.bodyPrompt}>›</span>
          <span>What I&apos;ve built when I should have been doing homework. Click in for the long version.</span>
        </p>
      </header>

      <div style={wStyles.cmdLine}>
        <span style={wStyles.cmd}>$ ls --tree ~/projects</span>
        <span style={wStyles.cmdMeta}>{PROJECTS.length} entries</span>
      </div>

      <div style={wStyles.grid}>
        {PROJECTS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onNav('project', { id: p.id })}
            onMouseEnter={() => setHover(p.id)}
            onMouseLeave={() => setHover(null)}
            style={{
              ...wStyles.card,
              ...(hover === p.id ? wStyles.cardHover : {}),
            }}
          >
            <div style={wStyles.cardHead}>
              <div style={wStyles.cardStatus} data-status={p.status}>
                {p.status}
              </div>
            </div>
            <h3 style={wStyles.cardTitle}>{p.name}</h3>
            <div style={wStyles.cardTag}>{p.tag}</div>
            <p style={wStyles.cardDesc}>{p.summary}</p>
            <div style={wStyles.cardFoot}>
              <span style={wStyles.cardOpen}>open →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const wStyles = {
  wrap: { maxWidth: 920, margin: '0 auto', padding: '40px 0 24px' },
  head: { marginBottom: 40 },
  h1: {
    fontFamily: '"Montserrat", sans-serif', fontSize: 56, fontWeight: 700,
    letterSpacing: '-0.03em', color: 'var(--fg-strong)',
    margin: '0 0 12px', lineHeight: 1,
  },
  lede: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    fontSize: 14.5, lineHeight: 1.55, color: 'var(--fg-dim)',
    margin: 0, maxWidth: 580, textWrap: 'pretty',
  },
  bodyPrompt: { color: ACCENT, fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 14, marginTop: 1 },
  cmdLine: {
    display: 'flex', justifyContent: 'space-between',
    padding: '10px 14px',
    background: 'var(--surface)',
    border: '1px solid rgba(120,40,35,0.12)',
    borderRadius: 6, marginBottom: 24,
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 12,
  },
  cmd: { color: 'var(--fg-mid)' },
  cmdMeta: { color: 'var(--fg-faint)' },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  card: {
    display: 'flex', flexDirection: 'column', gap: 8,
    padding: '20px 22px',
    textAlign: 'left',
    background: 'var(--surface)',
    border: '1px solid rgba(120,40,35,0.10)',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'border-color .15s, transform .15s, background .15s',
    fontFamily: 'inherit', color: 'inherit',
    minHeight: 180,
    outline: 'none',
    WebkitAppearance: 'none',
  },
  cardHover: {
    borderColor: 'var(--accent-line-strong)',
    background: 'rgba(28,16,14,0.55)',
    transform: 'translateY(-1px)',
  },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardId: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 10, color: 'var(--fg-faint)',
  },
  cardStatus: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 10, color: 'var(--accent-bright)',
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '3px 8px',
    border: '1px solid rgba(212,132,126,0.20)',
    borderRadius: 4,
    letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  cardStatusDot: { width: 5, height: 5, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 6px ${ACCENT}` },
  cardTitle: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: 24, fontWeight: 600,
    color: 'var(--fg-strong)', margin: '6px 0 0',
    letterSpacing: '-0.015em',
  },
  cardTag: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 11, color: 'var(--accent-dim)',
  },
  cardDesc: { fontSize: 13.5, color: 'var(--fg-dim)', margin: '4px 0 auto', lineHeight: 1.55, textWrap: 'pretty' },
  cardFoot: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 10, borderTop: '1px dashed rgba(120,40,35,0.10)',
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 11,
    color: 'var(--fg-faint)', marginTop: 12,
  },
  cardYear: {},
  cardOpen: { color: 'var(--accent-bright)' },
};

window.PageWork = PageWork;
