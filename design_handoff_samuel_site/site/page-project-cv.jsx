// Project detail + CV pages

const PageProject = ({ id, onNav }) => {
  const p = PROJECTS.find((x) => x.id === id) || PROJECTS[0];
  return (
    <div style={prStyles.wrap}>
      <button onClick={() => onNav('work')} style={prStyles.back}>← back to ~/projects</button>
      <header style={prStyles.head}>
        <div style={prStyles.metaRow}>
          <span style={prStyles.tag}>{p.tag}</span>
          <span style={prStyles.dot}>·</span>
          <span style={prStyles.year}>{p.year}</span>
          <span style={prStyles.dot}>·</span>
          <span style={prStyles.status}>{p.status}</span>
        </div>
        <h1 style={prStyles.h1}>{p.name}</h1>
        <p style={prStyles.summary}>{p.summary}</p>
      </header>

      <div style={prStyles.layout}>
        <article style={prStyles.body}>
          <h2 style={prStyles.h2}><span style={prStyles.hash}>#</span> Overview</h2>
          <p style={prStyles.p}>{p.body}</p>
          <h2 style={prStyles.h2}><span style={prStyles.hash}>#</span> What I learned</h2>
          <p style={prStyles.p}>The interesting bits weren&apos;t in the parts I planned — they came from the unexpected places where the system pushed back. Notes here, in the order I learned them.</p>
          <ul style={prStyles.ul}>
            <li>Constraint-first design beats clever-first design when the budget is tight.</li>
            <li>Determinism is worth more than throughput for any debug-heavy system.</li>
            <li>Tooling that prints when something is wrong is more valuable than tooling that prevents it.</li>
          </ul>
        </article>
        <aside style={prStyles.side}>
          <div style={prStyles.facts}>
            <FactRow label="STATUS" value={p.status} />
            <FactRow label="STACK" value={p.tag} />
            <FactRow label="STARTED" value={p.year.split(' ')[0]} />
            <FactRow label="REPO" value={<a href="#" style={prStyles.link}>github.com/itzcopiouz</a>} />
          </div>
        </aside>
      </div>
    </div>);

};

const FactRow = ({ label, value }) =>
<div style={prStyles.fact}>
    <span style={prStyles.factLabel}>{label}</span>
    <span style={prStyles.factVal}>{value}</span>
  </div>;


const prStyles = {
  wrap: { maxWidth: 1080, margin: '0 auto', padding: '32px 0 24px' },
  back: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 12, color: 'var(--fg-dim)',
    padding: 0, marginBottom: 32
  },
  head: { marginBottom: 40, maxWidth: 720 },
  metaRow: { display: 'flex', gap: 10, fontSize: 11, color: 'var(--fg-dim)', marginBottom: 14, fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace' },
  tag: { color: 'var(--accent-dim)' },
  dot: { color: 'var(--fg-ghost)' },
  year: {},
  status: { color: 'var(--accent-bright)', textTransform: 'uppercase', letterSpacing: '0.1em' },
  h1: {
    fontFamily: '"Montserrat", sans-serif', fontSize: 56, fontWeight: 700,
    letterSpacing: '-0.03em', color: 'var(--fg-strong)',
    margin: '0 0 14px', lineHeight: 1
  },
  summary: { fontSize: 16, color: 'var(--fg-mid)', lineHeight: 1.55, margin: 0, textWrap: 'pretty' },
  layout: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 240px', gap: 56, alignItems: 'flex-start' },
  body: { fontFamily: '"Avenir Next", Avenir, "Montserrat", sans-serif', fontSize: 15.5, lineHeight: 1.7, color: 'var(--fg)' },
  h2: {
    fontFamily: '"Montserrat", sans-serif', fontSize: 26, fontWeight: 600,
    color: 'var(--fg-strong)', margin: '32px 0 12px',
    display: 'flex', alignItems: 'baseline', gap: 8
  },
  hash: { color: ACCENT, fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 22 },
  p: { margin: '0 0 18px', textWrap: 'pretty' },
  ul: { paddingLeft: 20, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 },
  side: {},
  facts: {
    background: 'var(--surface)',
    border: '1px solid rgba(120,40,35,0.10)',
    borderRadius: 8, padding: '16px 18px',
    position: 'sticky', top: 100,
    display: 'flex', flexDirection: 'column', gap: 10
  },
  fact: { display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: 8, borderBottom: '1px solid rgba(120,40,35,0.06)' },
  factLabel: { fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.12em' },
  factVal: { fontSize: 13, color: 'var(--fg-strong)' },
  link: { color: 'var(--accent-bright)', textDecoration: 'none' }
};

const PageCV = () =>
<div style={cvStyles.wrap}>
    <header style={cvStyles.head}>
      <h1 style={cvStyles.h1}>cv</h1>
      <p style={cvStyles.lede}>
        <span style={cvStyles.bodyPrompt}>›</span>
        <span>The short version below; full PDF is one click away.</span>
      </p>
    </header>

    <div style={cvStyles.actions}>
      <a href="#" style={cvStyles.primary}>
        <span>↓ download cv.pdf</span>
        <span style={cvStyles.size}>183 kb</span>
      </a>
      <a href="#" style={cvStyles.secondary}>open in tab ↗</a>
    </div>

    <div style={cvStyles.preview}>
      <div style={cvStyles.previewHead}>
        <div style={cvStyles.previewDots}>
          <span /><span /><span />
        </div>
        <span style={cvStyles.previewName}>cv.pdf — preview</span>
      </div>
      <div style={cvStyles.previewBody}>
        <h2 style={cvStyles.cvH2}>Samuel L. McClanahan</h2>
        <p style={{ ...cvStyles.cvSub, fontFamily: '"Avenir Next", Avenir, Montserrat, sans-serif' }}>san francisco, ca · 415-529-0294 · porkbuns1964@gmail.com · github.com/ItzCopiouz</p>

        <CVSection title="EDUCATION">
          <CVRow primary="Lowell High School" secondary="GPA: 3.86 UW · 1480 PSAT · AP Physics 1 & 2, AP Calculus BC, Multivariable Calculus (West Valley College)" right="expected '27" />
        </CVSection>

        <CVSection title="PROFESSIONAL EXPERIENCE">
          <CVRow primary="DoseNet Radwatch, UC Berkeley — Engineering Intern" secondary="Designed custom 3D-printed enclosures for air-quality and radiation monitoring systems using SolidWorks." right="Summer 2023–24" />
          <CVRow primary="YuppAI — Intern" secondary="GTM and market analyses; built a Discord bot for an a16z-backed AI startup; supported operations and logistics." right="Summer 2024–25" />
          <CVRow primary="Math & SAT Tutor" secondary="Individual math and SAT/PSAT 10/9 tutoring for middle and high school students." right="2024 —" />
        </CVSection>

        <CVSection title="PROJECTS">
          <CVRow primary="RAG-Based Cisco Semantic Search API" secondary="Python/FastAPI + local embeddings for natural-language search across 900+ Cisco CLI commands. Deployed on OpenWebUI." right="2025" />
          <CVRow primary="ESP32-CAM Portable Vision Device" secondary="Firmware in C, custom 3D-printed enclosure, hand-soldered wiring. Streams to Python backend for LLM vision + SMS alerts." right="2025" />
          <CVRow primary="Self-Hosted Ubuntu SBC Server" secondary="AdGuard DNS filtering, NAS storage, multiple local AI inference backends (Ollama, OpenWebUI)." right="2025" />
        </CVSection>

        <CVSection title="ROBOTICS">
          <CVRow primary="Captain — Highlander Robotics (FRC)" secondary="Top ~50 worldwide. Lead mechanical design of 150-lb competition robots in PTC Onshape; manage ~$100k budget and full-team integration." right="2024 —" />
          <CVRow primary="Mentor — FRC Team 10221" secondary="Teach CAD, mechanical design, and electrical fundamentals; support design reviews and build cycles." right="2024–26" />
        </CVSection>

        <CVSection title="CYBERSECURITY">
          <CVRow primary="Co-Founder — AFA CyberPatriot Team" secondary="Ranked 3/4787 nationally. Cisco Packet Tracer, network hardening, agentic search tooling." right="2025–26" />
          <CVRow primary="SuperDiceCodeLovers — DEF CON CTF" secondary="1st overall in qualifiers; highest LiveCTF score on team." right="2026" />
          <CVRow primary="Cosmic Bit Flip — CMU PicoCTF" secondary="5th nationally; 17/1551 internationally in UofTCTF." right="2026" />
          <CVRow primary="Team 10221 — VanderbiltU SquirrelCTF" secondary="1st place overall." right="2026" />
        </CVSection>

        <CVSection title="SKILLS">
          <CVRow primary="CAD & Mechanical" secondary="PTC Onshape, SolidWorks, Autodesk Fusion 360, CAM, manual machining, 3D printing" />
          <CVRow primary="Programming" secondary="C, C++, Python" />
          <CVRow primary="Networking & Security" secondary="Cisco (EIGRP, OSPF, VLANs, ACLs, NAT, DHCP/DNS), Packet Tracer, Windows hardening" />
          <CVRow primary="Embedded" secondary="ESP32, soldering & wiring" />
          <CVRow primary="Languages" secondary="Spanish (Seal of Biliteracy)" />
        </CVSection>

        <CVSection title="AWARDS">
          <CVRow primary="AP Scholar" secondary="" />
          <CVRow primary="MTAC State Honors (Piano, 4×) · Branch Honors (3×)" secondary="" />
          <CVRow primary="SF All-City Jazz Band, 1st Trumpet (2×)" secondary="" />
        </CVSection>

        <p style={cvStyles.cvFoot}>full references & transcripts available on request</p>
      </div>
    </div>
  </div>;


const CVSection = ({ title, children }) =>
<section style={cvStyles.cvSection}>
    <h3 style={{ ...cvStyles.cvH3, fontFamily: "\"Montserrat\"" }}>{title}</h3>
    <div style={cvStyles.cvList}>{children}</div>
  </section>;

const CVRow = ({ primary, secondary, right }) =>
<div style={cvStyles.cvRow}>
    <div style={cvStyles.cvRowMain}>
      <div style={cvStyles.cvPrimary}>{primary}</div>
      <div style={cvStyles.cvSecondary}>{secondary}</div>
    </div>
    {right && <div style={cvStyles.cvRight}>{right}</div>}
  </div>;


const cvStyles = {
  wrap: { maxWidth: 820, margin: '0 auto', padding: '40px 0 24px' },
  head: { marginBottom: 32 },
  h1: {
    fontFamily: '"Montserrat", sans-serif', fontSize: 56, fontWeight: 700,
    letterSpacing: '-0.03em', color: 'var(--fg-strong)',
    margin: '0 0 12px', lineHeight: 1
  },
  lede: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    fontSize: 14.5, color: 'var(--fg-dim)', margin: 0, maxWidth: 600
  },
  bodyPrompt: { color: ACCENT, fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 14, marginTop: 1 },
  actions: { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 32 },
  primary: {
    display: 'inline-flex', alignItems: 'center', gap: 14,
    padding: '11px 18px',
    background: 'linear-gradient(180deg, rgba(157,58,53,0.20) 0%, rgba(120,40,35,0.10) 100%)',
    border: '1px solid rgba(200,80,70,0.30)',
    borderRadius: 6,
    color: 'var(--accent-bright)', textDecoration: 'none',
    fontSize: 13, fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace'
  },
  size: { color: 'var(--accent-dim)', fontSize: 11 },
  secondary: {
    color: 'var(--fg-dim)', fontSize: 12, textDecoration: 'none',
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace'
  },
  preview: {
    background: 'var(--surface)',
    border: '1px solid rgba(120,40,35,0.12)',
    borderRadius: 8, overflow: 'hidden'
  },
  previewHead: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 14px', borderBottom: '1px solid rgba(120,40,35,0.10)',
    background: 'var(--surface-2)'
  },
  previewDots: { display: 'flex', gap: 6 },
  previewName: { fontFamily: '"Montserrat", sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--fg-faint)' },
  previewBody: { padding: '40px 48px', background: 'var(--paper)' },
  cvH2: { fontFamily: '"Montserrat", sans-serif', fontSize: 28, fontWeight: 700, color: 'var(--fg-strong)', margin: '0 0 4px' },
  cvSub: { fontSize: 12, color: 'var(--fg-dim)', fontFamily: '"Montserrat", sans-serif', fontWeight: 600, margin: '0 0 28px' },
  cvSection: { marginBottom: 24 },
  cvH3: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 600,
    fontSize: 11, color: ACCENT, letterSpacing: '0.15em',
    margin: '0 0 10px', paddingBottom: 6,
    borderBottom: '1px solid rgba(120,40,35,0.10)'
  },
  cvList: { display: 'flex', flexDirection: 'column', gap: 10 },
  cvRow: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'baseline' },
  cvRowMain: { display: 'flex', flexDirection: 'column', gap: 2 },
  cvPrimary: { fontSize: 14, color: 'var(--fg-strong)', fontFamily: '"Avenir Next", Avenir, "Montserrat", sans-serif', fontWeight: 500 },
  cvSecondary: { fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1.5 },
  cvRight: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600, fontSize: 11, color: 'var(--fg-faint)' },
  cvFoot: { fontSize: 11, color: 'var(--fg-faint)', textAlign: 'center', margin: '24px 0 0', fontStyle: 'italic' }
};

window.PageProject = PageProject;
window.PageCV = PageCV;