# Product Overview (PM/BA Onboarding)

## What this product is
**YouHook (Video Meta Generate)** is a lightweight workspace for turning a video (or a set of images) into **YouTube-ready packaging**: thumbnail options, a draft description, and suggested tags.

This document describes the product from a **business and user-workflow perspective**. It intentionally avoids technical implementation details.

## Who it’s for
- **Creator teams**: social/video producers who need faster, more consistent metadata
- **Marketing teams**: growth/SEO practitioners who want repeatable packaging quality
- **Editors and channel managers**: people preparing a video for publishing on YouTube
- **PMs/BAs**: stakeholders defining workflows, requirements, and roadmap

## The core problem it solves
Video packaging is often slow, inconsistent, and hard to standardize. Teams need a faster way to:
- Produce multiple thumbnail directions without starting from scratch each time
- Draft metadata that matches a desired style (“tone”) and stays within reasonable limits
- Generate a baseline set of tags to accelerate publishing prep

## Current user workflow (happy path)
1. **Upload an input asset**
   - Upload a **video file** to drive thumbnail generation, or upload an **image** as a starting point.
2. **Provide optional context**
   - Add **hook text** (a short “what’s the video about / what’s the hook?” line).
   - Add a short **video description** as additional context (useful when hook text is empty).
3. **Choose a tone**
   - Pick one of the available tones to guide the style of outputs.
4. **Choose what to generate**
   - Select any combination of: **Thumbnails**, **Description**, **Tags**.
5. **Generate**
   - The product generates the selected outputs and shows them in the results panel.

## What users can generate today
### Thumbnails
- **Multiple thumbnail variants** are generated per request.
- Users can **request more variants** (up to a capped maximum shown in the UI).
- A user can **select** a preferred variant for review.

### Description
- Generates a **draft YouTube description** aligned to the selected tone.
- Uses hook text and/or the provided video description as context.

### Tags
- Generates a **suggested list of tags** aligned to the selected tone.
- Can optionally use the generated description as additional context.

### Guidance
- After successful generation, the product shows **optimization notes** to help users interpret and improve results (based on the chosen tone and what was generated).

## User experience notes
- **Desktop layout**: inputs on the left, generated results on the right for side-by-side iteration.
- **Mobile layout**: a two-tab flow (“Inputs” and “Results”) designed for small screens.
- **Resilience**: each section (thumbnails / description / tags) has its own loading, success, and error states, and can be retried independently.

## What is explicitly not part of the product (yet)
These items may appear in marketing copy or UI affordances, but are **not implemented end-to-end** in the current product:
- **Account management and sign-in** (the app does not provide a complete user login flow)
- **Team workflows** like approvals, comments, and audit history
- **Publishing/export integrations** (e.g., pushing metadata directly to YouTube or other platforms)
- **Persistent project/video library** (saving and browsing previously generated work as a “dashboard”)
- **Multi-language localization workflows**
- **Deep video analysis** features (e.g., transcript extraction, chapter generation)
- **Fully functional editing + copy tools** for generated text (UI controls may exist, but editing/copy behavior is not guaranteed)

## Glossary
- **Hook text**: a short, human-written line that captures the main promise or angle of the video.
- **Tone**: a style preset that influences how “viral”, “curiosity-driven”, or “educational” the outputs feel.
- **Variant**: one of several alternative thumbnail options generated for the same inputs.
- **Tags**: suggested keywords/hashtags intended to improve discoverability and categorization.


