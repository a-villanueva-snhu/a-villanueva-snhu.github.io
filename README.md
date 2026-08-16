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
- `narratives/` - Markdown files for Software Engineering, DSA and Databases narrative bodies
- `artifacts/` - Place artifact files here
- `images/` - Place screenshots/images here

## New Behavior

- Narrative and content sections are collapsible.
- The Artifacts section is rendered from Markdown files in `artifacts/`.

## Artifacts From Local Folder

The Artifacts section now pulls file listings from a local manifest for the `artifacts/` folder.

## Artifact Layout File

Artifacts are now rendered as separate subsections using a master layout file:

- `artifacts/layout.json`

Each entry can define:

- `path`: relative path inside `artifacts/`
- `title`: subsection title
- `type`: optional override for file type
- `embed`: `true` or `false`

Directory entry support:

- Set `type` to `"directory"` and `path` to a folder inside `artifacts/`.
- The renderer will expand that folder recursively using `artifacts/manifest.json`.
- Each discovered file will render as its own subsection under that directory entry title.

Example:

```json
{
	"entries": [
		{
			"path": "software-engineering.md",
			"title": "Software Engineering Artifact",
			"type": "md",
			"embed": true
		},
		{
			"path": "images/diagram.png",
			"title": "Architecture Diagram",
			"type": "png",
			"embed": true
		}
	]
}
```

Embedding behavior:

- Markdown/text/code files render inline
- Image files render inline as images
- PDF files render inline in an embedded frame
- Other files show an open-file link

Configure this in `config.js` under `artifacts`:

- `source`: set to `"layoutFile"` (uses `artifacts/layout.json`)
- `layout.path`: layout JSON path (default: `artifacts/layout.json`)
- `layout.allowedExtensions`: optional extension filter for layout entries
- `layout.excludedFiles`: optional file name exclusions
- `manifestDirectory.path`: manifest JSON path (default: `artifacts/manifest.json`)
- `manifestDirectory.allowedExtensions`: file extensions to display
- `manifestDirectory.excludedFiles`: file names to hide from the listing

The loader supports nested directories recursively, as long as those file paths are included in the manifest.

Manifest format (`artifacts/manifest.json`):

```json
{
	"files": [
		"software-engineering.md",
		"docs/diagram.png",
		"code/example.py"
	]
}
```

Fallback order:

1. `layoutFile`
2. `manifestDirectory`
3. Markdown artifact index loader

To regenerate the manifest recursively after adding files:

```powershell
./generate-artifacts-manifest.ps1
```

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

