# a-villanueva-snhu.github.io

CS-499 Capstone Project Portfolio

Aiden Villanueva
Aug. 15, 2026

## Portfolio Scaffold

This repo now includes a simple static portfolio for CS-499 capstone project.

### Files

- `index.html` - Main portfolio page with sections for:
	- Software Engineering narrative
	- DSA narrative
	- Databases narrative
	- Artifacts
	- Images
- `config.js` - Centralized one-line values (name, text, labels, links, dates, image metadata)
- `styles.css` - Site styling
- `scripts.js` - Loads artifact content from Markdown files
- `narratives/` - Markdown files for Software Engineering, DSA, and Databases narrative bodies
- `artifacts/` - Place artifact files here
- `images/` - Place screenshots/images here

## New Behavior

- Narrative and content sections are collapsible.
- The Artifacts section is rendered from Markdown files in `artifacts/`.

## Artifact Markdown Workflow

1. Edit `artifacts/index.md` and list each Markdown file on its own bullet line.
2. Add or update those `.md` files in `artifacts/`.
3. Put linked PDFs/images in `artifacts/` and reference them with normal Markdown links.

Example `artifacts/index.md` list:

- software-engineering.md
- dsa.md
- databases.md

Note: Opening `index.html` directly from file explorer may block Markdown loading in some browsers.
Use a local static server for preview when needed.

