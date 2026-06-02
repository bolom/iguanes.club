# History Gallery Media Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the 21 retained club images for web delivery and integrate only the History and Gallery sections into the existing static site without redesigning other sections.

**Architecture:** Keep original selected images in `public/images/final-candidates/`, generate derived display and thumbnail assets into dedicated subfolders, maintain a markdown media index for editorial review, and update the existing static HTML/CSS/JS with lightweight history and gallery rendering plus a native lightbox overlay.

**Tech Stack:** Static HTML/CSS/JS, Node.js build script, ImageMagick, shell smoke tests.

---

### Task 1: Add smoke coverage first

**Files:**
- Create: `tests/history-gallery-smoke.sh`
- Modify: none
- Test: `tests/history-gallery-smoke.sh`

- [ ] **Step 1: Write the failing smoke test**
- [ ] **Step 2: Run it and confirm failure for missing derivative assets / media index / updated markup**
- [ ] **Step 3: Keep the assertions focused on the new scope only**

### Task 2: Build web derivatives for final candidates

**Files:**
- Create: `scripts/build-final-candidates-media.mjs`
- Modify: none
- Test: `tests/history-gallery-smoke.sh`

- [ ] **Step 1: Implement a script that reads the 21 originals from `public/images/final-candidates/`**
- [ ] **Step 2: Generate `web/` display images and `thumbs/` gallery thumbnails as `.webp` while preserving originals**
- [ ] **Step 3: Run the builder and verify counts**

### Task 3: Add editorial media index

**Files:**
- Create: `public/images/final-candidates/MEDIA_INDEX.md`
- Test: `tests/history-gallery-smoke.sh`

- [ ] **Step 1: Write the 21-entry markdown index with file, category, recommended section, and short caption**
- [ ] **Step 2: Keep the wording short and club-facing**

### Task 4: Integrate History and Gallery only

**Files:**
- Modify: `index.html`, `iguanes-v3.css`, `iguanes-v3.js`
- Test: `tests/history-gallery-smoke.sh`, `tests/github-pages-smoke.sh`

- [ ] **Step 1: Replace the current two-card history media area with an 8-image block using the selected assets**
- [ ] **Step 2: Replace the current gallery cells with the 21 retained images and keep the existing visual language**
- [ ] **Step 3: Add responsive gallery styling and click-to-enlarge lightbox behavior in vanilla JS**
- [ ] **Step 4: Avoid touching unrelated sections**

### Task 5: Verify end-to-end

**Files:**
- Modify: none
- Test: `tests/history-gallery-smoke.sh`, `tests/github-pages-smoke.sh`

- [ ] **Step 1: Run both smoke checks**
- [ ] **Step 2: Recount generated assets and confirm originals are still present**
- [ ] **Step 3: Summarize the resulting ready-to-show state without publishing**
