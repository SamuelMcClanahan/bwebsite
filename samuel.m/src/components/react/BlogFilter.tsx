import { useState, useEffect } from 'react';

interface Post {
  slug: string;
  date: string;
  title: string;
  tags: string[];
  category: string;
  excerpt: string;
}

export default function BlogFilter({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date-desc');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cats = ['all', 'writeup', 'project'];

  const filtered = posts.filter((p) => filter === 'all' || p.category === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'date-asc') return a.date.localeCompare(b.date);
    if (sort === 'title') return a.title.localeCompare(b.title);
    return b.date.localeCompare(a.date);
  });

  const fmtDate = (d: string) => {
    const [y, m, day] = d.split('-');
    const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m, 10) - 1];
    return `${mon} ${parseInt(day, 10)}, ${y}`;
  };

  const displayPosts = mounted ? sorted : posts.slice(0, 6);

  return (
    <div>
      <div className="filter-bar">
        <div className="filter-group">
          <span className="filter-label">--filter</span>
          {cats.map((c) =>
            mounted ? (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`chip ${filter === c ? 'chip-active' : ''}`}
              >
                {c}
              </button>
            ) : (
              <span key={c} className="chip">{c}</span>
            )
          )}
        </div>
        <div className="filter-group">
          <span className="filter-label">--sort</span>
          {mounted ? (
            <>
              <button onClick={() => setSort('date-desc')} className={`chip ${sort === 'date-desc' ? 'chip-active' : ''}`}>newest</button>
              <button onClick={() => setSort('date-asc')} className={`chip ${sort === 'date-asc' ? 'chip-active' : ''}`}>oldest</button>
              <button onClick={() => setSort('title')} className={`chip ${sort === 'title' ? 'chip-active' : ''}`}>a-z</button>
            </>
          ) : (
            <>
              <span className="chip">newest</span>
              <span className="chip">oldest</span>
              <span className="chip">a-z</span>
            </>
          )}
        </div>
      </div>
      <div className="list">
        {displayPosts.map((p) => (
          <a key={p.slug} href={`/work/${p.slug}`} className="row">
            <span className="row-date">{fmtDate(p.date)}</span>
            <div className="row-main">
              <span className="row-title">{p.title}</span>
              <span className="row-excerpt">{p.excerpt}</span>
            </div>
            <span className="row-arrow">→</span>
          </a>
        ))}
      </div>
      <style>{`
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          padding: 0 0 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--accent-line);
          border-radius: 0;
          margin-bottom: 32px;
        }
        .filter-group { display: flex; align-items: center; gap: 6px; }
        .filter-label {
          font-family: "0xProto Nerd Font Mono", "0xProto", monospace;
          font-size: 11px;
          color: var(--fg-faint);
          margin-right: 4px;
        }
        .chip {
          background: transparent;
          border: none;
          color: var(--fg-dim);
          padding: 4px 6px;
          border-radius: 0;
          font-family: "0xProto Nerd Font Mono", "0xProto", monospace;
          font-size: 11px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color .12s;
        }
        .chip:hover { color: var(--fg-strong); }
        .chip-active {
          background: transparent !important;
          color: var(--accent-bright) !important;
        }
        .list { display: flex; flex-direction: column; }
        .row {
          display: grid;
          grid-template-columns: 110px 1fr 24px;
          gap: 16px;
          width: 100%;
          text-align: left;
          padding: 16px 8px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--accent-line);
          cursor: pointer;
          align-items: flex-start;
          text-decoration: none;
          transition: background .12s;
        }
        .row:hover .row-title { color: var(--accent-bright); }
        .row-date {
          font-family: "0xProto Nerd Font Mono", "0xProto", monospace;
          font-size: 11px;
          color: var(--fg-faint);
          padding-top: 5px;
        }
        .row-main { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
        .row-title {
          font-size: 16px;
          color: var(--fg-strong);
          font-family: "Avenir Next", Avenir, "Montserrat", sans-serif;
          letter-spacing: -0.005em;
        }
        .row-excerpt { font-size: 13.5px; color: var(--fg-dim); line-height: 1.5; }
        .row-arrow { color: var(--fg-faint); font-size: 14; padding-top: 6px; }
      `}</style>
    </div>
  );
}
