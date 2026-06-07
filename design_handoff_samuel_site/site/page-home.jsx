// Home page — minimal. Header (handle), > body intro, latest posts, footer.

const PageHome = ({ onNav }) => {
  return (
    <div style={hStyles.wrap}>
      <section style={hStyles.hero}>
        <div style={hStyles.markRow}>
          <span style={hStyles.mark}>slm</span>
          <div style={hStyles.markMeta}>
            <span style={hStyles.markName}>lorem ipsum</span>
            <span style={{ ...hStyles.markLoc, fontFamily: "\"Avenir Next\"" }}>dolor sit, am</span>
          </div>
        </div>
        <h1 style={hStyles.h1}>
          Lorem ipsum dolor sit amet, <span style={hStyles.gradient}>consectetur&nbsp;adipiscing,</span> &amp; elit&nbsp;sed.
        </h1>
        <div style={hStyles.bodyBlock}>
          <span style={hStyles.bodyPrompt}>›</span>
          <p style={hStyles.body}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
        </div>
      </section>

      <section style={hStyles.posts}>
        <div style={hStyles.postsHead}>
          <span style={hStyles.cmd}>$ ls -lt ~/blog | head</span>
          <button onClick={() => onNav('blog')} style={hStyles.allLink}>view all ↗</button>
        </div>
        <div style={hStyles.postList}>
          {POSTS.slice(0, 4).map((p) =>
          <button key={p.slug} onClick={() => onNav('post', { slug: p.slug })} style={hStyles.postRow}>
              <span style={hStyles.postDate}>{p.date}</span>
              <span style={hStyles.postTitle}>{p.title}</span>
              <span style={hStyles.postTags}>
                {p.tags.slice(0, 2).map((t) => <span key={t} style={hStyles.tag}>#{t}</span>)}
              </span>
            </button>
          )}
        </div>
      </section>

      <div style={hStyles.gradientFooterBlock} />
    </div>);

};

const hStyles = {
  wrap: { maxWidth: 760, margin: '0 auto', padding: '40px 0 24px' },
  hero: { marginBottom: 88 },
  markRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
  mark: {
    width: 36, height: 36, borderRadius: 6,
    background: 'linear-gradient(135deg, #2a1614 0%, #160c0a 100%)',
    border: '1px solid rgba(200, 80, 70, 0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Montserrat", sans-serif',
    fontSize: 14, fontWeight: 700,
    color: 'var(--accent-bright)'
  },
  markMeta: { display: 'flex', flexDirection: 'column', gap: 2 },
  markName: { fontSize: 13, color: 'var(--fg-strong)', letterSpacing: '-0.01em' },
  markLoc: { fontSize: 11, color: 'var(--fg-faint)', fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace' },
  h1: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.025em',
    color: 'var(--fg-strong)',
    margin: '0 0 24px',
    textWrap: 'balance'
  },
  gradient: {
    background: 'linear-gradient(110deg, #e8a59f 0%, #c8413a 40%, #7a2520 80%, #4a1a18 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  bodyBlock: { display: 'flex', gap: 12, alignItems: 'flex-start', maxWidth: 600 },
  bodyPrompt: {
    color: ACCENT, fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 16, lineHeight: 1.55, marginTop: 1
  },
  body: {
    fontSize: 15.5, lineHeight: 1.65, color: 'var(--fg-mid)',
    margin: 0, textWrap: 'pretty'
  },
  posts: { marginBottom: 64 },
  postsHead: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    marginBottom: 16, paddingBottom: 12,
    borderBottom: '1px solid rgba(120,40,35,0.10)'
  },
  cmd: { fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 12, color: 'var(--fg-mid)' },
  allLink: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 11, color: 'var(--accent-dim)'
  },
  postList: { display: 'flex', flexDirection: 'column' },
  postRow: {
    display: 'grid',
    gridTemplateColumns: '90px 1fr auto',
    gap: 16,
    padding: '12px 0',
    alignItems: 'baseline',
    background: 'transparent', border: 'none', borderBottom: '1px solid rgba(120,40,35,0.06)',
    cursor: 'pointer', textAlign: 'left', width: '100%'
  },
  postDate: { fontSize: 11, color: 'var(--fg-faint)', fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace' },
  postTitle: { fontSize: 15, color: 'var(--fg-strong)', letterSpacing: '-0.005em', fontFamily: '"Avenir Next", Avenir, "Montserrat", sans-serif' },
  postTags: { display: 'flex', gap: 8 },
  tag: { fontSize: 10, color: 'var(--accent-dim)', fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace' },
  gradientFooterBlock: {
    height: 80,
    background: 'radial-gradient(ellipse at center, rgba(200,65,58,0.08) 0%, transparent 70%)'
  }
};

window.PageHome = PageHome;