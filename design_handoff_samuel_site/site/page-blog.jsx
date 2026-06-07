// Blog index — header, small text, filter chips by category & tag, list

const PageBlog = ({ onNav }) => {
  const [filter, setFilter] = React.useState('all');
  const [sort, setSort] = React.useState('date-desc');

  const cats = ['all', 'writeup', 'project'];
  const filtered = POSTS.filter(p => filter === 'all' || p.category === filter);
  const sorted = [...filtered].sort((a,b) => {
    if (sort === 'date-asc') return a.date.localeCompare(b.date);
    if (sort === 'title') return a.title.localeCompare(b.title);
    return b.date.localeCompare(a.date);
  });

  const fmtDate = (d) => {
    const [y, m, day] = d.split('-');
    const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m,10)-1];
    return `${mon} ${parseInt(day,10)}, ${y}`;
  };

  return (
    <div style={bStyles.wrap}>
      <header style={bStyles.head}>
        <h1 style={bStyles.h1}>blog</h1>
        <p style={bStyles.lede}>
          <span style={bStyles.bodyPrompt}>›</span>
          <span>Writeups, project logs, and notes I want to remember. Most of these started as scratch files in <code style={bStyles.code}>~/notes</code>.</span>
        </p>
      </header>

      <div style={bStyles.filterBar}>
        <div style={bStyles.filterGroup}>
          <span style={bStyles.filterLabel}>--filter</span>
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{...bStyles.chip, ...(filter === c ? bStyles.chipActive : {})}}
            >
              {c}
            </button>
          ))}
        </div>
        <div style={bStyles.filterGroup}>
          <span style={bStyles.filterLabel}>--sort</span>
          <button onClick={() => setSort('date-desc')} style={{...bStyles.chip, ...(sort === 'date-desc' ? bStyles.chipActive : {})}}>newest</button>
          <button onClick={() => setSort('date-asc')} style={{...bStyles.chip, ...(sort === 'date-asc' ? bStyles.chipActive : {})}}>oldest</button>
          <button onClick={() => setSort('title')} style={{...bStyles.chip, ...(sort === 'title' ? bStyles.chipActive : {})}}>a-z</button>
        </div>
      </div>

      <div style={bStyles.results}>
        <span style={bStyles.resultsCount}>{sorted.length} entries</span>
      </div>

      <section style={bStyles.list}>
        {sorted.map(p => (
          <button key={p.slug} onClick={() => onNav('post', { slug: p.slug })} style={bStyles.row}>
            <span style={bStyles.rowDate}>{fmtDate(p.date)}</span>
            <div style={bStyles.rowMain}>
              <span style={bStyles.rowTitle}>{p.title}</span>
              <span style={bStyles.rowExcerpt}>{p.excerpt}</span>
              <div style={bStyles.rowTags}>
                {p.tags.map(t => <span key={t} style={bStyles.tag}>#{t}</span>)}
              </div>
            </div>
            <span style={bStyles.rowArrow}>→</span>
          </button>
        ))}
      </section>
    </div>
  );
};

const bStyles = {
  wrap: { maxWidth: 820, margin: '0 auto', padding: '40px 0 24px' },
  head: { marginBottom: 56 },
  h1: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: 56, fontWeight: 700,
    letterSpacing: '-0.03em', color: 'var(--fg-strong)',
    margin: '0 0 12px', lineHeight: 1,
  },
  lede: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    fontSize: 14.5, lineHeight: 1.55, color: 'var(--fg-dim)',
    margin: 0, maxWidth: 600, textWrap: 'pretty',
  },
  bodyPrompt: { color: ACCENT, fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 14, marginTop: 1 },
  code: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace', fontSize: 12,
    background: 'var(--accent-line)', padding: '1px 6px', borderRadius: 3,
    color: 'var(--accent-bright)',
  },

  filterBar: {
    display: 'flex', flexWrap: 'wrap', gap: 24,
    padding: '12px 16px',
    background: 'var(--surface)',
    border: '1px solid rgba(120,40,35,0.12)',
    borderRadius: 6,
    marginBottom: 8,
  },
  filterGroup: { display: 'flex', alignItems: 'center', gap: 6 },
  filterLabel: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 11, color: 'var(--fg-faint)', marginRight: 4,
  },
  chip: {
    background: 'transparent',
    border: '1px solid rgba(120,40,35,0.15)',
    color: 'var(--fg-dim)',
    padding: '4px 10px',
    borderRadius: 4,
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 11,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  chipActive: {
    background: 'var(--accent-line)',
    color: 'var(--accent-bright)',
    border: '1px solid rgba(200,80,70,0.30)',
  },
  chipDot: { width: 5, height: 5, borderRadius: '50%', background: ACCENT },
  results: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 11, color: 'var(--fg-faint)',
    padding: '6px 4px', marginBottom: 32,
  },
  resultsCount: {},

  list: { display: 'flex', flexDirection: 'column' },
  row: {
    display: 'grid',
    gridTemplateColumns: '110px 1fr 24px',
    gap: 16,
    width: '100%', textAlign: 'left',
    padding: '16px 8px',
    background: 'transparent', border: 'none',
    borderBottom: '1px solid rgba(120,40,35,0.06)',
    cursor: 'pointer',
    alignItems: 'flex-start',
  },
  rowDate: {
    fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace',
    fontSize: 11, color: 'var(--fg-faint)', paddingTop: 5,
  },
  rowMain: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 },
  rowTitle: {
    fontSize: 16, color: 'var(--fg-strong)',
    fontFamily: '"Avenir Next", Avenir, "Montserrat", sans-serif', letterSpacing: '-0.005em',
  },
  rowExcerpt: { fontSize: 13.5, color: 'var(--fg-dim)', lineHeight: 1.5 },
  rowTags: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 },
  tag: { fontSize: 10, color: 'var(--accent-dim)', fontFamily: '"0xProto Nerd Font Mono", "0xProto", monospace' },
  rowArrow: { color: 'var(--fg-faint)', fontSize: 14, paddingTop: 6 },
};

window.PageBlog = PageBlog;
