---
title: "ciscoscraper: RAG for Cisco CLI"
date: 2025-12-01
tags: [rag, fastapi, cisco, cyberpatriot, embeddings]
category: project
excerpt: "A RAG service that turns a 16 MB Cisco command-reference PDF into searchable, summarized, embedded knowledge, exposed as OpenAI-style tools for an agent."
---

This one started as a competition tool and ended up being the project I learned the most retrieval engineering from. It was built for CyberPatriot, the national high school cyber defense competition, specifically the Cisco Networking Challenge. That challenge has two parts: you configure networks in Packet Tracer, and you take a multiple-choice exam on specific Cisco networking topics. The trouble is that Cisco command syntax is niche, especially for older legacy routers, and the models of the time were pretty bad at it. So I built a way to hand a model that knowledge on demand. It worked: it helped land a top-five Cisco score in the country that season.

## What RAG and embeddings actually are

RAG stands for retrieval-augmented generation. The idea is simple once you see it: instead of hoping a model already knows something, you retrieve the exact relevant text first and hand it to the model alongside the question. The model reasons over real reference material instead of its own fuzzy memory. That's the whole trick, and it's why a cheaper model with good retrieval can beat a smarter model working from memory alone.

The retrieval half is where embeddings come in. An embedding is a list of numbers, a vector, that represents the meaning of a piece of text. A model is trained so that texts with similar meaning end up as vectors that point in similar directions in a high-dimensional space. In this project each command summary becomes a 768-dimension vector. When you search, your plain-English query gets turned into a vector the same way, and the server measures cosine similarity, the angle between your query vector and every stored command vector. A small angle means the meanings are close. The key advantage over keyword search is that this works even when no words overlap: "command for port authentication" can land right next to a command whose summary never uses the word "authentication," because the meanings sit near each other in the space.

## What it does

ciscoscraper is two things in one repo. The first is a data pipeline that turns a giant Cisco command-reference PDF into searchable, summarized, embedded knowledge. The second is a FastAPI server that exposes that knowledge as OpenAI-style tools, so an agent can call `search_commands` to find the right command and `get_command_details` to pull the full documentation body.

In practice, during the competition, the workflow was direct. You start each Packet Tracer scenario with a readme describing the network you have to build. I would paste that readme into the agent, and the agent, now backed by accurate Cisco knowledge through these tools, would search the reference and summarize the exact commands needed for that scenario, every time. The model never had to guess at syntax, because the real reference text was one tool call away.

The server loads its dataset into memory at startup and builds a single embedding matrix. A query comes in as plain English, gets embedded, and runs cosine similarity against every stored command vector in one matrix multiply. If the embedding endpoint is down or returns nothing useful, it quietly falls back to keyword search over names, summaries, and bodies. You always get an answer; the only thing that changes is how smart the ranking is.

## The build

The big challenge here was extracting clean data out of some ancient Cisco PDF. My first attempts at creating a RAG database were weird amalgamations of getting a model to OCR or trying pdf text extraction tools.

The source is the Catalyst 9600 IOS XE command reference, hundreds of pages of densely formatted text. The first script walks the table of contents to collect command names, then concatenates the rest of the document into one long string and slices it into per-command bodies by finding where each command starts and the next begins. That sounds simple and wasn't. PDF text extraction is messy: spacing is inconsistent, headers and footers bleed into the body, and a command name in the table of contents doesn't always match its spelling in the body. The extractor ended up with layered fallbacks, trying an exact match, then a stripped match, then a lowercase match, before giving up.

Plain text extraction also wasn't enough on its own. Some sections of the PDF came out as garbage, tables and oddly rendered pages that the text layer mangled. For those I fell back to OCR, running the pages through the vision capabilities of Qwen3-VL-8B-Thinking to read the text out of the image directly.

With bodies extracted, a second script summarizes each command with a chat model, asking for an under-100-word explanation of what it does, its preconditions and postconditions, and why you'd use it. These summaries, not the raw bodies, are what get embedded, because a clean summary produces a more useful vector than a wall of reference text. A third script generates those embeddings. Both scripts run concurrently with a semaphore to cap requests in flight, and both wrap every call in exponential backoff so a rate limit slows things down instead of killing the run.

I ran the local pieces through LM Studio rather than paying per call to a hosted API. The whole stack is written against an OpenAI-compatible interface, so the same code points at a local model or at hosted OpenAI just by changing a base URL and key. That portability let me iterate on the dataset for free and spend money only where a bigger model actually helped.

## Choosing the model

For the agent that actually consumed the tools during competition, I chose Minimax M2.0. At the time, the benchmarks pointed to it as the most balanced option for cost against agentic and RAG performance. GPT-5 was smarter in the abstract, but it was much more expensive, and the entire point of RAG is that you don't need the smartest possible model if you feed it the right context. A well-retrieved command summary closes most of the gap, so paying several times more per call for raw intelligence made little sense here.

## Looking back

A model today is probably knowledgeable enough to handle a lot of this on its own, either because it has absorbed more Cisco material or because it can reason its way to the right command empirically. But at the time, RAG was the important lever. It's what let a cheap model like Minimax M2.0 outperform something as capable as GPT-5 on this specific task, simply by making sure the model was always reading the real answer instead of recalling a guess. That's the lesson I took from the project: raw model intelligence is one input, and often not the cheapest one. Getting the right information in front of the model is the other, and for a long stretch it mattered more.
