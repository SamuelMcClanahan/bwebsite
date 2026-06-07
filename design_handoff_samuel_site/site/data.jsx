// Site data

const POSTS = [
  { slug: 'lorem-ipsum-1', date: '2026-04-12', title: 'Lorem ipsum dolor sit amet consectetur', tags: ['agents','ctf'], category: 'writeup', excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.' },
  { slug: 'lorem-ipsum-2', date: '2026-03-19', title: 'Ut enim ad minim veniam quis nostrud', tags: ['web','ctf','writeup'], category: 'writeup', excerpt: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.' },
  { slug: 'lorem-ipsum-3', date: '2026-02-04', title: 'Excepteur sint occaecat cupidatat non proident', tags: ['hardware'], category: 'project', excerpt: 'Sunt in culpa qui officia deserunt mollit anim id est laborum consectetur.' },
  { slug: 'lorem-ipsum-4', date: '2026-01-22', title: 'Duis aute irure dolor in reprehenderit', tags: ['ml'], category: 'writeup', excerpt: 'Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia.' },
  { slug: 'lorem-ipsum-5', date: '2025-12-30', title: 'Sed ut perspiciatis unde omnis iste natus', tags: ['ctf'], category: 'writeup', excerpt: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.' },
  { slug: 'lorem-ipsum-6', date: '2025-11-14', title: 'Nemo enim ipsam voluptatem quia voluptas', tags: ['agents'], category: 'project', excerpt: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.' },
];

const PROJECTS = [
  {
    id: 'lorem-alpha',
    name: 'Lorem Alpha',
    tag: 'python · ml · networking',
    status: 'shipped',
    year: '2025',
    summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    id: 'lorem-beta',
    name: 'Lorem Beta',
    tag: 'c · embedded · hardware',
    status: 'shipped',
    year: '2025',
    summary: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    body: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    id: 'lorem-gamma',
    name: 'Lorem Gamma',
    tag: 'linux · networking · infra',
    status: 'active',
    year: '2025',
    summary: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    body: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  },
  {
    id: 'lorem-delta',
    name: 'Lorem Delta',
    tag: 'cad · mechanical · leadership',
    status: 'active',
    year: '2024 — present',
    summary: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
    body: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.',
  },
];

Object.assign(window, { POSTS, PROJECTS });
