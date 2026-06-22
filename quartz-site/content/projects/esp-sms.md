---
title: ESP-SMS
description: A hardware pipeline that takes a photo with an ESP32-CAM, sends it to an OpenAI vision model, and pushes the result to a phone via Pushover.
tags: [embedded, esp32, c, fastapi, vision]
date: 2025-12-01
---

This project was mostly a learning exercise. I came in already comfortable with FastAPI, so the Python backend was familiar ground with room to sharpen the edges. The real reason to build it was to learn C from scratch and to push my Python a little further than the usual web-app comfort zone. ESP-SMS is what came out the other end.

ESP-SMS is a hardware-and-software pipeline that takes a photo, sends it to an OpenAI vision model, and pushes the result to a phone. The repo splits cleanly into two halves: firmware in C for an ESP32-CAM board, and a Python (FastAPI) backend that talks to OpenAI and a notification service.

## What it does

The flow is short. The device sleeps to save battery. You press a button, it wakes, joins WiFi, snaps a JPEG, and POSTs the raw bytes to `/api/v1/capture` with an `X-Device-Id` header. The backend writes the image to disk, drops a `queued` row into SQLite, and hands back a job ID. A separate worker loop claims the next queued job, calls the vision API, saves the output, and fires a notification to the phone. The board then sends a heartbeat (battery voltage, WiFi signal, free memory, uptime) and goes back to sleep.

## The build

Most of the interesting work was not the happy path. It was the long tail of parts that almost worked.

Learning C while building this was its own kind of pain, and a useful one. Coming from Python, where a variable just holds whatever you put in it and memory is somebody else's problem, C does not let you look away. Pointers, manual buffer sizing, and remembering to free what you allocated all became real on hardware where a mistake does not throw a clean traceback, it just reboots the board or quietly corrupts a frame. Half the early bugs were not logic errors at all, they were me forgetting how the language actually treats memory. By the end the firmware felt readable to me, which earlier on it absolutely did not.

The camera was the first thing to fight back. At the time, the OCR on the model side was not great, and a blurry frame from a cheap sensor turned into garbage text. So the sensor kept getting upgraded: an OV2640 to start, then an OV3660 for more detail, and finally an autofocusing OV5640, which is what actually made close-up text readable instead of a guess.

The board followed the same path. It started on a base ESP32-CAM, moved to an ESP32-S3-N16R8 for the extra memory and headroom, and ended on the compact Seeed Studio XIAO ESP32-S3 (N8R8) once the goal became something small enough to live in a real enclosure. I designed and printed a case to make the whole thing read as an actual smart device rather than a dev board with wires hanging off it.

Notifications were their own small adventure. I tried something like eighteen different messaging services before landing on Pushover. Twilio, the obvious choice, wanted what felt like my SSN and my mother's maiden name to verify the account, so it lost. Pushover was the one that let me send a message to a phone without an interrogation, and that is why it is in the code.

One field note for anyone following along: ESP32-S3 chips get genuinely hot. Do not attach the heatsink to your hand with a rubber band.

## The code

**The firmware** is the stronger half. `main.c` reads as a clean state machine: power init, WiFi, camera, capture, upload, heartbeat, sleep, with a real fallback at each step. If the camera fails to init, it still sends a heartbeat so the device does not just go silent on you. The HTTP client (`http_client.c`) does exponential backoff with sensible rules: retry on 5xx and transport errors, give up immediately on 4xx because a rejected request will stay rejected. Battery reading in `power.c` calibrates the ADC when it can and falls back to raw math when it cannot, and it says in the logs which one it used.

**The backend** is small and readable. The part that earns its complexity is the SQLite handling in `db.py`. SQLite under one writer and several readers is a classic source of "database is locked" errors, and the code meets that head-on: WAL mode, a busy timeout, and retry-with-backoff on every write. Job claiming uses a single `UPDATE ... WHERE job_id = (SELECT ... LIMIT 1) RETURNING *`, which claims and reads the oldest queued job in one atomic statement so two workers cannot grab the same one.

## Related

- [[ciscoscraper]] — another FastAPI + hardware build
- [[cv]]
