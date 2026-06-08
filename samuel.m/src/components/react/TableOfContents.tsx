import { useState, useEffect } from 'react';

interface Heading {
  slug: string;
  text: string;
  depth: number;
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const renderList = (items: Heading[], depth = 0) => (
    <ul className="toc-list" style={{ paddingLeft: depth ? 14 : 0 }}>
      {items.map((it) => (
        <li key={it.slug} className="toc-item" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
          <a
            href={`#${it.slug}`}
            className={`toc-link ${it.slug === activeId ? 'toc-active' : ''} ${depth >= 2 ? 'toc-dim' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(it.slug);
              if (el) {
                const top = el.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
              }
            }}
          >
            {it.slug === activeId && <span className="toc-bar" />}
            {it.text}
          </a>
          {it.children && it.children.length > 0 && renderList(it.children, depth + 1)}
        </li>
      ))}
    </ul>
  );

  // Flatten nested structure from the heading array passed in
  // The headings prop might be flat or nested. For simplicity, we assume flat with depth.
  const nested = buildNested(headings);

  return (
    <div className="toc">
      <div className="toc-sticky">
        <div className="toc-title">Table of Contents</div>
        {renderList(nested)}
      </div>
      <style>{`
        .toc { font-family: "Avenir Next", Avenir, "Montserrat", sans-serif; }
        .toc-sticky { position: sticky; top: 100px; }
        .toc-title {
          font-family: "Montserrat", sans-serif;
          font-size: 14px;
          color: var(--fg-mid);
          margin: 0 0 12px;
          padding-bottom: 8px;
        }
        .toc-list { list-style: none; margin: 0; padding: 0; border-left: 1px solid var(--accent-line); }
        .toc-item { font-size: 12.5px; line-height: 1.5; }
        .toc-link {
          display: block;
          position: relative;
          padding: 5px 12px;
          text-decoration: none;
          color: var(--fg-dim);
          transition: color .12s;
        }
        .toc-link:hover { color: var(--fg-strong); }
        .toc-active { color: var(--fg-strong) !important; }
        .toc-dim { color: var(--fg-faint); }
        .toc-bar {
          position: absolute;
          left: -1px;
          top: 4px;
          bottom: 4px;
          width: 1.5px;
          background: var(--accent);
          border-radius: 1px;
        }
      `}</style>
    </div>
  );
}

function buildNested(headings: Heading[]): Heading[] {
  // Simple builder: if depth increases, nest under previous
  const stack: Heading[] = [];
  const root: Heading[] = [];
  for (const h of headings) {
    const node = { ...h, children: [] as Heading[] };
    while (stack.length > 0 && stack[stack.length - 1].depth >= h.depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    }
    stack.push(node);
  }
  return root;
}
