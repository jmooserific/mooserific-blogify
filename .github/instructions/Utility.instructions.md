---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.---
mode: ask
---
Create a command‑line utility in **TypeScript** (matching my **Ghostify2** tool, https://github.com/jmooserific/ghostify2) that exports Tumblr posts into the directory layout required by the **Mooserific Blog**, https://github.com/jmooserific/mooserific-blog.

Use Ghostify2 (which exports Tumblr posts to Ghost format) as a structural and stylistic reference — including its use of async/await, Tumblr API calls to retrieve posts, tidy folder layout, and config-driven CLI approach.

## Target output repository (Mooserific Blog)
- Each Tumblr post becomes a folder named `/YYYY‑MM‑DDTHH‑MM/` based on its timestamp.
- Inside each folder:
  - A `post.json` with fields:
    ```json
    {
      "date": "2025‑07‑26T14:42:00",
      "author": "vemoose",
      "caption": "…text…",
      "photos": [
        { "filename": "01.jpg", "width": 800, "height": 600 },
        { "filename": "02.jpg", "width": 1200, "height": 900 }
      ],
      "videos": ["clip1.mp4", "clip2.mp4"]
    }
    ```
  - Media files (photos/videos) copied locally.

## Requirements
- Follow Ghostify2’s coding pattern: use TypeScript, module-based design, async functions, Tumblr API calls, optional CLI config (e.g. config file or flags), error handling, and clear logging.
- Make a call via the Tumblr API to fetch posts, breaking requests into batches as required by the API.
- Extract **date**, **author**, **caption**, **photos**, and **videos**.
  - For photos: select highest quality, copy to post folder with zero‑padded names (`01.jpg`, `02.jpg`, …), include dimensions in `photos`.
  - For videos: pick best resolution, copy file, list filenames in `videos`.
  - If no media, still output `post.json` with empty arrays.
- Directory creation: automatically create output base folder and individual post subfolders.
- Behavior: skip duplicates, graceful on missing fields, log summary of posts processed.
- Maintain clean project structure (e.g. `src/`, `lib/`, `cli.ts`, util modules, type definitions), unit‑testable components, and optionally a `bin` entry in `package.json`.

## Suggested outline
1. CLI entry (e.g. `tumblr2moose export --out ./posts`)
2. Parser module: read Tumblr JSON, extract relevant data.
3. Media downloader/copy module: fetch media URLs, save locally.
4. JSON writer: build `post.json` with correct fields.
5. Utilities for formatting date into folder name, zero‑padding filenames, checking dimensions.
6. Error and edge case handling: missing caption/media, existing media, rate limits.

---

Produce TypeScript code following Ghostify2 (async‑heavy, typed, modular). Let me know if you want me to specify language frameworks (`node-fetch`, `axios`, file copying library, etc.), or include configuration schema.
