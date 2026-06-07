// Blog post page — TOC sidebar + serif body + info/note callouts + meta panel

const SAMPLE_POST = {
  slug: 'picoctf-2026-paper2',
  title: 'picoCTF 2026: Paper-2 Writeup + Reflections',
  date: 'March 19, 2026',
  tags: ['web', 'ctf', 'writeup', 'picoctf'],
  toc: [
    { id: 'foreword', label: 'Foreword' },
    { id: 'paper-2', label: 'Paper-2', children: [
      { id: 'understanding', label: 'Understanding index.ts', children: [
        { id: 'csp', label: 'Content Security Policy (CSP)' },
        { id: 'bot-exec', label: 'Bot Execution' },
        { id: 'file-upload', label: 'File Uploading' },
        { id: 'file-serv', label: 'File Serving' },
        { id: 'secret-exp', label: 'Secret Exposure' },
        { id: 'flag-sub', label: 'Flag Submission' },
        { id: 'bot-trigger', label: 'Bot Trigger' },
      ]},
      { id: 'constraint', label: 'The Constraint Landscape' },
      { id: 'detour', label: 'Quick Detour' },
      { id: 'realization', label: 'The Realization' },
      { id: 'css-oracle', label: 'CSS as an Oracle' },
      { id: 'cache-evict', label: 'Cache Eviction as a Side-Channel' },
    ]},
  ],
};

const PagePost = ({ slug, onNav }) => {
  const post = SAMPLE_POST;
  return (
    <div style={ppStyles.wrap}>
      <button onClick={() => onNav('blog')} style={ppStyles.back}>← back to ~/blog</button>

      <header style={ppStyles.header}>
        <h1 style={ppStyles.h1}>{post.title}</h1>
        <div style={ppStyles.meta}>
          <span style={ppStyles.date}>{post.date}</span>
          <span style={ppStyles.dot}>·</span>
          <div style={ppStyles.tagRow}>
            {post.tags.map(t => <span key={t} style={ppStyles.tag}>#{t}</span>)}
          </div>
        </div>
      </header>

      <div style={ppStyles.layout}>
        <article style={ppStyles.article}>
          <h2 id="foreword" style={ppStyles.h2}><span style={ppStyles.hash}>#</span> Foreword</h2>
          <p style={ppStyles.p}>PicoCTF is one of the largest CTFs that takes place every year in March. It&apos;s run by Carnegie Mellon University and caters to all difficulty levels. Pico was one of the first large CTFs I ever played, and being able to place top 3 in the US HS/MS bracket is a dream come true.</p>
          <p style={ppStyles.p}>However, this year was one of the weakest years of PicoCTF, as everything was &quot;sloppable&quot; or easily solved by AI. If you&apos;d like to skip straight to my thoughts on the competition, check out <a href="#realization" style={ppStyles.link}>Addressing the slop</a> below.</p>
          <p style={ppStyles.p}>Despite everything being AI-solvable, ehhthing managed to make another extremely difficult challenge. If you&apos;re not familiar, ehhthing is the creator of two notoriously hard challenges from previous years of PicoCTF:</p>

          <Callout kind="info">
            <p style={ppStyles.cp}><strong style={ppStyles.strong}>secure-email-service (2025)</strong>: Inject headers to get the admin to sign and send your XSS payload, then steal the flag.</p>
            <p style={ppStyles.cp}><strong style={ppStyles.strong}>elements (2024)</strong>: Craft a valid XSS element chain in the game to execute JS, then bypass the strict CSP and leak the flag via a side-channel/timing-based exfiltration.</p>
          </Callout>

          <p style={ppStyles.p}>Below is my writeup on how my team (me, Mr-MPH, JT314, S3af, Programmer_user) solved the hardest challenge in the event.</p>

          <h2 id="paper-2" style={ppStyles.h2}>Paper-2</h2>

          <ChalCard title="paper-2" status="INSANE" author="ehhthing" category="Web Exploitation" points="500" solves="98" flag="picoCTF{i_l1ke_frames_on_my_canvas_[REDACTED]}"/>

          <h3 id="understanding" style={ppStyles.h3}>Understanding index.ts</h3>
          <p style={ppStyles.p}>The challenge ships a single TypeScript entrypoint that wires up a static-site renderer, a tiny bot, and a flag-submission endpoint behind a strict CSP. Most of the surface looks airtight at first glance — the interesting holes are in the seams between these features.</p>

          <Callout kind="warn">
            <p style={ppStyles.cp}>This challenge spent ~3 hours of CPU time before anyone solved it. Don&apos;t be discouraged — read the source twice before touching the network.</p>
          </Callout>

          <h3 id="csp" style={ppStyles.h3}>Content Security Policy (CSP)</h3>
          <p style={ppStyles.p}>The CSP is set with a nonce on every response, and there&apos;s no <code style={ppStyles.code}>unsafe-inline</code>. Script execution requires either matching the nonce or being served from a same-origin path that the CSP allows.</p>

          <Callout kind="note">
            <p style={ppStyles.cp}>The CSP allows <code style={ppStyles.code}>style-src &apos;unsafe-inline&apos;</code>, which becomes important later when we use CSS as an oracle.</p>
          </Callout>

          <h3 id="realization" style={ppStyles.h3}>The Realization</h3>
          <p style={ppStyles.p}>Around hour 5, we noticed the bot serializes the cache state between requests. That meant we could observe a measurable timing difference between &quot;flag character is X&quot; and &quot;flag character is anything else.&quot; A side channel.</p>

          <pre style={ppStyles.pre}>
{`# rough sketch of the oracle
for c in CHARSET:
    payload = build_eviction_payload(prefix + c)
    t0 = time.time()
    bot.visit(challenge_url, payload)
    dt = time.time() - t0
    if dt > THRESHOLD:
        return c  # we leaked one byte`}
          </pre>

          <p style={ppStyles.p}>The rest was bookkeeping — repeat per byte, batch the requests, and pray the network stays cooperative. Full write-up of the timing model is in the followup post.</p>
        </article>

        <aside style={ppStyles.toc}>
          <div style={ppStyles.tocSticky}>
            <div style={ppStyles.tocTitle}>Table of Contents</div>
            <ToC items={post.toc} active="paper-2"/>
          </div>
        </aside>
      </div>
    </div>
  );
};

const ToC = ({ items, active, depth = 0 }) => (
  <ul style={{...ppStyles.tocList, paddingLeft: depth ? 14 : 0}}>
    {items.map(it => (
      <li key={it.id} style={ppStyles.tocItem}>
        <a href={`#${it.id}`} style={{
          ...ppStyles.tocLink,
          ...(it.id === active ? ppStyles.tocActive : {}),
          ...(depth >= 2 ? { color: 'var(--fg-faint)' } : {}),
        }}>
          {it.id === active && <span style={ppStyles.tocBar}/>}
          {it.label}
        </a>
        {it.children && <ToC items={it.children} active={active} depth={depth+1}/>}
      </li>
    ))}
  </ul>
);

const Callout = ({ kind, children }) => {
  const cfg = {
    info: { c: 'var(--info)', l: 'INFO', icon: 'i' },
    warn: { c: 'var(--warn)', l: 'WARN', icon: '!' },
    note: { c: 'var(--accent-bright)', l: 'NOTE', icon: '✱' },
  }[kind];
  return (
    <div style={{...ppStyles.callout, borderLeftColor: cfg.c}}>
      <div style={ppStyles.calloutHead}>
        <span style={{...ppStyles.calloutIcon, color: cfg.c, borderColor: `${cfg.c}55`}}>{cfg.icon}</span>
        <span style={{...ppStyles.calloutLabel, color: cfg.c}}>{cfg.l}</span>
      </div>
      <div style={ppStyles.calloutBody}>{children}</div>
    </div>
  );
};

const ChalCard = ({ title, status, author, category, points, solves, flag }) => (
  <div style={ppStyles.chalCard}>
    <div style={ppStyles.chalHead}>
      <span style={ppStyles.chalTitle}>{title}</span>
      <span style={ppStyles.chalStatus}>{status}</span>
    </div>
    <div style={ppStyles.chalGrid}>
      <ChalRow icon="◯" label="AUTHOR" value={author}/>
      <ChalRow icon="◇" label="CATEGORY" value={category}/>
      <ChalRow icon="◎" label="POINTS" value={points}/>
      <ChalRow icon="△" label="SOLVES" value={solves}/>
      <ChalRow icon="⌘" label="FILE" value={<a href="#" style={ppStyles.link}>Download</a>}/>
    </div>
    <div style={ppStyles.chalFlag}>
      <div style={ppStyles.chalFlagLabel}>⚑ FLAG</div>
      <div style={ppStyles.chalFlagBox}>{flag}</div>
    </div>
  </div>
);

const ChalRow = ({ icon, label, value }) => (
  <div style={ppStyles.chalRow}>
    <span style={ppStyles.chalIcon}>{icon}</span>
    <span style={ppStyles.chalLabel}>{label}</span>
    <span style={ppStyles.chalVal}>{value}</span>
  </div>
);

const ppStyles = {
  wrap: { maxWidth: 1180, margin: '0 auto', padding: '32px 0 24px' },
  back: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 12, color: 'var(--fg-dim)',
    padding: 0, marginBottom: 32,
  },
  header: { marginBottom: 40, maxWidth: 760 },
  h1: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: 44, fontWeight: 700,
    letterSpacing: '-0.025em', color: 'var(--fg-strong)',
    margin: '0 0 14px', lineHeight: 1.1, textWrap: 'balance',
  },
  meta: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  date: { fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 12, color: 'var(--fg-faint)' },
  dot: { color: 'var(--fg-ghost)' },
  tagRow: { display: 'flex', gap: 10 },
  tag: { fontSize: 11, color: 'var(--accent-dim)', fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace' },

  layout: {
    display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 240px',
    gap: 56, alignItems: 'flex-start',
  },
  article: { fontFamily: '"Avenir Next", Avenir, "Montserrat", sans-serif', fontSize: 15.5, lineHeight: 1.7, color: 'var(--fg)', minWidth: 0 },
  h2: {
    fontFamily: '"Montserrat", sans-serif', fontSize: 30, fontWeight: 600,
    letterSpacing: '-0.02em', color: 'var(--fg-strong)',
    margin: '48px 0 16px', display: 'flex', alignItems: 'baseline', gap: 8,
  },
  hash: { color: ACCENT, fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 24 },
  h3: {
    fontFamily: '"Montserrat", sans-serif', fontSize: 22, fontWeight: 600,
    color: 'var(--fg-strong)',
    margin: '32px 0 12px',
  },
  p: { margin: '0 0 18px', textWrap: 'pretty' },
  cp: { margin: '0 0 10px', fontSize: 14, lineHeight: 1.6, color: 'var(--fg)' },
  strong: { color: 'var(--fg-strong)', fontWeight: 600 },
  link: { color: 'var(--accent-bright)', textDecoration: 'underline', textDecorationColor: 'var(--accent-line-strong)', textUnderlineOffset: 3 },
  code: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 12.5,
    background: 'var(--accent-line)', padding: '1px 6px', borderRadius: 3,
    color: 'var(--accent-bright)',
  },
  pre: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 12.5,
    background: 'var(--surface)', border: '1px solid rgba(120,40,35,0.12)',
    borderRadius: 6, padding: '14px 16px', color: 'var(--fg-mid)',
    overflow: 'auto', lineHeight: 1.5, margin: '8px 0 24px',
  },

  callout: {
    background: 'var(--surface)',
    border: '1px solid rgba(120,40,35,0.10)',
    borderLeft: '2px solid #7ec0d4',
    borderRadius: 6,
    padding: '14px 18px',
    margin: '20px 0 24px',
  },
  calloutHead: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  calloutIcon: {
    width: 18, height: 18, borderRadius: '50%',
    border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
  },
  calloutLabel: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 11,
    letterSpacing: '0.1em',
  },
  calloutBody: { fontFamily: '"Avenir Next", Avenir, "Montserrat", sans-serif' },

  chalCard: {
    background: 'var(--surface)',
    border: '1px solid rgba(120,40,35,0.12)',
    borderRadius: 8,
    padding: '22px 24px',
    margin: '8px 0 32px',
  },
  chalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  chalTitle: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 16, color: 'var(--fg-strong)', fontWeight: 500,
  },
  chalStatus: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 10, color: 'var(--accent-bright)',
    border: '1px solid rgba(212,132,126,0.3)',
    padding: '4px 10px', borderRadius: 4, letterSpacing: '0.15em',
  },
  chalGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px',
    marginBottom: 18,
  },
  chalRow: { display: 'grid', gridTemplateColumns: '20px 80px 1fr', gap: 10, alignItems: 'baseline', fontSize: 13 },
  chalIcon: { color: 'var(--fg-dim)', textAlign: 'center', fontSize: 11 },
  chalLabel: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.12em',
  },
  chalVal: { color: 'var(--fg-strong)', fontFamily: '"Avenir Next", Avenir, "Montserrat", sans-serif' },
  chalFlag: {
    paddingTop: 14, borderTop: '1px solid rgba(120,40,35,0.08)',
  },
  chalFlagLabel: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.12em', marginBottom: 8,
  },
  chalFlagBox: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 12.5, color: 'var(--accent-bright)',
    background: 'var(--surface-2)',
    border: '1px solid rgba(120,40,35,0.10)',
    padding: '10px 14px', borderRadius: 4,
  },

  toc: { fontFamily: '"Avenir Next", Avenir, "Montserrat", sans-serif' },
  tocSticky: { position: 'sticky', top: 100 },
  tocTitle: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: 14, color: 'var(--fg-mid)',
    margin: '0 0 12px',
    paddingBottom: 8,
  },
  tocList: { listStyle: 'none', margin: 0, padding: 0, borderLeft: '1px solid rgba(120,40,35,0.10)' },
  tocItem: { fontSize: 12.5, lineHeight: 1.5 },
  tocLink: {
    display: 'block', position: 'relative',
    padding: '5px 12px', textDecoration: 'none',
    color: 'var(--fg-dim)',
  },
  tocActive: { color: 'var(--fg-strong)' },
  tocBar: {
    position: 'absolute', left: -1, top: 4, bottom: 4, width: 1.5,
    background: ACCENT,
  },
};

window.PagePost = PagePost;
