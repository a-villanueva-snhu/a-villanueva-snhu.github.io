function setText(id, value) {
  if (typeof value !== "string") {
    return;
  }

  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function setAttr(id, attr, value) {
  if (typeof value !== "string") {
    return;
  }

  const element = document.getElementById(id);
  if (element) {
    element.setAttribute(attr, value);
  }
}

function toYouTubeEmbedUrl(url) {
  if (typeof url !== "string" || url.trim().length === 0) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const videoId = parsed.pathname.replaceAll("/", "").trim();
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }

      const watchId = parsed.searchParams.get("v");
      if (watchId) {
        return `https://www.youtube.com/embed/${watchId}`;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const shortsId = parsed.pathname.split("/")[2];
        return shortsId ? `https://www.youtube.com/embed/${shortsId}` : url;
      }
    }
  } catch (error) {
    return url;
  }

  return url;
}

function applyConfig() {
  const config = window.PORTFOLIO_CONFIG;
  if (!config) {
    return {};
  }

  if (typeof config.pageTitle === "string") {
    document.title = config.pageTitle;
  }

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && typeof config.metaDescription === "string") {
    metaDescription.setAttribute("content", config.metaDescription);
  }

  setText("hero-eyebrow", config.heroEyebrow);
  setText("hero-title", config.heroTitle);
  setText("hero-intro", config.heroIntro);

  setText("nav-featured-video", config.nav?.featuredVideo);
  setText("nav-self-assessment", config.nav?.selfAssessment);
  setText("nav-software-engineering", config.nav?.softwareEngineering);
  setText("nav-dsa", config.nav?.dsa);
  setText("nav-databases", config.nav?.databases);
  setText("nav-artifacts", config.nav?.artifacts);
  setText("nav-images", config.nav?.images);

  setText("featured-video-title", config.featuredVideo?.title);
  setText("featured-video-note", config.featuredVideo?.note);
  setAttr("featured-video-iframe", "src", toYouTubeEmbedUrl(config.featuredVideo?.embedUrl));
  setAttr("featured-video-iframe", "title", config.featuredVideo?.embedTitle);

  setText("self-assessment-title", config.narratives?.selfAssessment?.title);
  setText("software-engineering-title", config.narratives?.softwareEngineering?.title);
  setText("dsa-title", config.narratives?.dsa?.title);
  setText("databases-title", config.narratives?.databases?.title);

  setText("artifacts-title", config.artifacts?.title);
  setText("artifacts-note", config.artifacts?.note);

  setText("images-title", config.images?.title);
  setText("images-note", config.images?.note);

  const imageItems = Array.isArray(config.images?.items) ? config.images.items : [];
  imageItems.slice(0, 3).forEach((item, index) => {
    const imageId = `image-${index + 1}`;
    const captionId = `image-${index + 1}-caption`;
    setAttr(imageId, "src", item.src);
    setAttr(imageId, "alt", item.alt);
    setText(captionId, item.caption);
  });

  setText("footer-last-updated", config.footerLastUpdated);

  return config;
}

async function loadNarrativeSection(targetId, markdownFile, messages) {
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  if (typeof markdownFile !== "string" || markdownFile.length === 0) {
    target.innerHTML = `<p>${escapeHtml(messages.emptyMessage)}</p>`;
    return;
  }

  try {
    const response = await fetch(markdownFile, { cache: "no-store" });
    if (!response.ok) {
      target.innerHTML = `<p>${escapeHtml(messages.missingFilePrefix)}${escapeHtml(markdownFile)}.</p>`;
      return;
    }

    const markdown = await response.text();
    target.innerHTML = markdownToHtml(markdown);
  } catch (error) {
    target.innerHTML = `<p>${escapeHtml(messages.loadErrorMessage)}</p>`;
  }
}

async function loadNarrativesFromMarkdown() {
  const config = window.PORTFOLIO_CONFIG || {};
  const narrativeConfig = config.narratives || {};
  const messages = {
    emptyMessage: narrativeConfig.emptyMessage || "No narrative markdown file configured.",
    loadErrorMessage: narrativeConfig.loadErrorMessage || "Narrative could not be loaded.",
    missingFilePrefix: narrativeConfig.missingFilePrefix || "Could not load "
  };

  await Promise.all([
    loadNarrativeSection("self-assessment-body", narrativeConfig.selfAssessment?.markdownFile, messages),
    loadNarrativeSection("software-engineering-body", narrativeConfig.softwareEngineering?.markdownFile, messages),
    loadNarrativeSection("dsa-body", narrativeConfig.dsa?.markdownFile, messages),
    loadNarrativeSection("databases-body", narrativeConfig.databases?.markdownFile, messages)
  ]);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineMarkdown(text) {
  const codeTokens = [];
  const escapedTokens = [];

  // Protect code spans first so markdown formatting is not applied inside them.
  const withCodeTokens = text.replace(/`([^`]+)`/g, (_, codeValue) => {
    const token = `@@CODETOKEN${codeTokens.length}@@`;
    codeTokens.push(`<code>${escapeHtml(codeValue)}</code>`);
    return token;
  });

  // Protect backslash-escaped markdown punctuation (e.g., \_ or \*).
  const withEscapedTokens = withCodeTokens.replace(/\\([\\`*_{}\[\]()#+\-.!])/g, (_, literalChar) => {
    const token = `@@ESCTOKEN${escapedTokens.length}@@`;
    escapedTokens.push(escapeHtml(literalChar));
    return token;
  });

  let rendered = escapeHtml(withEscapedTokens)
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/(?<!\\)\*\*([^*]+)(?<!\\)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\\)__([^_]+)(?<!\\)__/g, "<strong>$1</strong>")
    .replace(/(?<!\\)\*([^*]+)(?<!\\)\*/g, "<em>$1</em>")
    .replace(/(?<!\\)_([^_]+)(?<!\\)_/g, "<em>$1</em>");

  escapedTokens.forEach((value, index) => {
    rendered = rendered.replace(`@@ESCTOKEN${index}@@`, value);
  });

  codeTokens.forEach((value, index) => {
    rendered = rendered.replace(`@@CODETOKEN${index}@@`, value);
  });

  return rendered;
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let listType = null;

  function closeListIfOpen() {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.length === 0) {
      closeListIfOpen();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeListIfOpen();
      const level = headingMatch[1].length;
      const content = renderInlineMarkdown(headingMatch[2]);
      html.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    const unorderedItemMatch = line.match(/^[-*+]\s+(.*)$/);
    if (unorderedItemMatch) {
      if (listType !== "ul") {
        closeListIfOpen();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${renderInlineMarkdown(unorderedItemMatch[1])}</li>`);
      continue;
    }

    const orderedItemMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedItemMatch) {
      if (listType !== "ol") {
        closeListIfOpen();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${renderInlineMarkdown(orderedItemMatch[1])}</li>`);
      continue;
    }

    closeListIfOpen();
    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  }

  closeListIfOpen();

  return html.join("\n");
}

function parseArtifactIndex(markdown) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter((line) => line.toLowerCase().endsWith(".md"));
}

async function loadArtifactMarkdown() {
  const target = document.getElementById("artifact-content");
  if (!target) {
    return;
  }

  const config = window.PORTFOLIO_CONFIG || {};
  const emptyMessage = config.artifacts?.emptyMessage || "No artifact markdown files listed in artifacts/index.md yet.";
  const loadErrorMessage =
    config.artifacts?.loadErrorMessage ||
    "Artifacts could not be loaded. Use a local static server when previewing this page.";
  const missingFilePrefix = config.artifacts?.missingFilePrefix || "Could not load artifacts/";

  try {
    const indexResponse = await fetch("artifacts/index.md", { cache: "no-store" });
    if (!indexResponse.ok) {
      throw new Error("Could not load artifacts/index.md");
    }

    const indexMarkdown = await indexResponse.text();
    const artifactFiles = parseArtifactIndex(indexMarkdown);

    if (artifactFiles.length === 0) {
      target.innerHTML = `<p>${escapeHtml(emptyMessage)}</p>`;
      return;
    }

    const blocks = await Promise.all(
      artifactFiles.map(async (file) => {
        const response = await fetch(`artifacts/${file}`, { cache: "no-store" });
        if (!response.ok) {
          return `<p>${escapeHtml(missingFilePrefix)}${escapeHtml(file)}.</p>`;
        }
        const markdown = await response.text();
        return markdownToHtml(markdown);
      })
    );

    target.innerHTML = blocks.join("\n<hr />\n");
  } catch (error) {
    target.innerHTML = `<p>${escapeHtml(loadErrorMessage)}</p>`;
  }
}

function normalizeArtifactPath(pathValue) {
  if (typeof pathValue !== "string") {
    return "";
  }

  return pathValue
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function encodePathSegments(pathValue) {
  return pathValue
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function parseArtifactManifestEntries(rawData) {
  const entries = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.files)
      ? rawData.files
      : [];

  return entries
    .map((entry) => (typeof entry === "string" ? entry : entry?.path))
    .filter((entry) => typeof entry === "string")
    .map((entry) => normalizeArtifactPath(entry))
    .filter((entry) => entry.length > 0);
}

function getFileExtension(pathValue) {
  const normalized = normalizeArtifactPath(pathValue).toLowerCase();
  const dotIndex = normalized.lastIndexOf(".");
  return dotIndex >= 0 ? normalized.slice(dotIndex + 1) : "";
}

function deriveArtifactTitle(pathValue) {
  const fileName = normalizeArtifactPath(pathValue).split("/").pop() || "Artifact";
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  return withoutExtension
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeArtifactLayoutEntry(entry) {
  if (typeof entry === "string") {
    return {
      path: normalizeArtifactPath(entry)
    };
  }

  if (entry && typeof entry === "object") {
    return {
      path: normalizeArtifactPath(entry.path || ""),
      title: typeof entry.title === "string" ? entry.title : undefined,
      type: typeof entry.type === "string" ? entry.type : undefined,
      embed: entry.embed !== false
    };
  }

  return null;
}

function isDirectoryLayoutEntry(entry) {
  return typeof entry?.type === "string" && entry.type.toLowerCase() === "directory";
}

async function loadArtifactManifestEntries(config) {
  const manifestPath =
    typeof config?.artifacts?.manifestDirectory?.path === "string"
      ? config.artifacts.manifestDirectory.path
      : "artifacts/manifest.json";

  const response = await fetch(manifestPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Artifact manifest request failed");
  }

  const data = await response.json();
  return parseArtifactManifestEntries(data);
}

async function expandDirectoryLayoutEntries(entries, config) {
  const hasDirectoryEntries = entries.some((entry) => isDirectoryLayoutEntry(entry));
  if (!hasDirectoryEntries) {
    return entries;
  }

  const manifestPaths = await loadArtifactManifestEntries(config);
  const expanded = [];
  const seenPaths = new Set();

  entries.forEach((entry) => {
    if (!isDirectoryLayoutEntry(entry)) {
      if (!seenPaths.has(entry.path)) {
        expanded.push(entry);
        seenPaths.add(entry.path);
      }
      return;
    }

    const prefix = normalizeArtifactPath(entry.path);
    const prefixWithSlash = `${prefix}/`;
    const matchingPaths = manifestPaths
      .filter((manifestPath) => manifestPath.startsWith(prefixWithSlash))
      .sort((a, b) => a.localeCompare(b));

    matchingPaths.forEach((manifestPath) => {
      if (seenPaths.has(manifestPath)) {
        return;
      }

      const relativeName = manifestPath.slice(prefixWithSlash.length);
      const childTitle = entry.title ? `${entry.title}: ${relativeName}` : deriveArtifactTitle(manifestPath);
      expanded.push({
        path: manifestPath,
        title: childTitle,
        embed: entry.embed !== false
      });
      seenPaths.add(manifestPath);
    });
  });

  return expanded;
}

function normalizeArtifactLayoutEntries(rawData) {
  const sourceEntries = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.entries)
      ? rawData.entries
      : [];

  return sourceEntries
    .map((entry) => normalizeArtifactLayoutEntry(entry))
    .filter((entry) => entry && typeof entry.path === "string" && entry.path.length > 0);
}

function renderArtifactSubsectionSkeleton(entry, index) {
  const title = escapeHtml(entry.title || deriveArtifactTitle(entry.path));
  const contentId = `artifact-entry-content-${index}`;

  return `
    <section class="artifact-entry" id="artifact-entry-${index}">
      <details class="artifact-entry-collapsible">
        <summary class="artifact-entry-summary">
          <h3>${title}</h3>
        </summary>
        <div id="${contentId}" class="artifact-entry-content">Loading content...</div>
      </details>
    </section>
  `;
}

function renderUnsupportedArtifactContent(target, href) {
  target.innerHTML = `<p>Preview not available for this file type. <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Open file</a>.</p>`;
}

function normalizeNotebookSource(source) {
  if (Array.isArray(source)) {
    return source.join("");
  }

  if (typeof source === "string") {
    return source;
  }

  return "";
}

function normalizeNotebookOutputText(value) {
  if (Array.isArray(value)) {
    return value.join("");
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function renderNotebookOutputBlock(output) {
  const outputType = typeof output?.output_type === "string" ? output.output_type : "";

  if (outputType === "error") {
    const traceback = Array.isArray(output?.traceback) ? output.traceback.join("\n") : "";
    const fallback = `${output?.ename || "Error"}: ${output?.evalue || ""}`.trim();
    const errorText = traceback || fallback || "Error output";
    return `<div class="notebook-output notebook-output-error"><pre><code>${escapeHtml(errorText)}</code></pre></div>`;
  }

  if (outputType === "stream") {
    const textValue = normalizeNotebookOutputText(output?.text);
    if (!textValue) {
      return "";
    }
    return `<div class="notebook-output notebook-output-text"><pre><code>${escapeHtml(textValue)}</code></pre></div>`;
  }

  const data = output?.data;
  if (!data || typeof data !== "object") {
    return "";
  }

  const pngData = normalizeNotebookOutputText(data["image/png"]);
  if (pngData) {
    return `<div class="notebook-output notebook-output-image"><img class="notebook-output-image-preview" src="data:image/png;base64,${pngData}" alt="Notebook output image" /></div>`;
  }

  const jpegData = normalizeNotebookOutputText(data["image/jpeg"]);
  if (jpegData) {
    return `<div class="notebook-output notebook-output-image"><img class="notebook-output-image-preview" src="data:image/jpeg;base64,${jpegData}" alt="Notebook output image" /></div>`;
  }

  const svgData = normalizeNotebookOutputText(data["image/svg+xml"]);
  if (svgData) {
    const encodedSvg = encodeURIComponent(svgData);
    return `<div class="notebook-output notebook-output-image"><img class="notebook-output-image-preview" src="data:image/svg+xml;utf8,${encodedSvg}" alt="Notebook output image" /></div>`;
  }

  const htmlData = normalizeNotebookOutputText(data["text/html"]);
  if (htmlData) {
    return `<div class="notebook-output notebook-output-html">${htmlData}</div>`;
  }

  const textPlainData = normalizeNotebookOutputText(data["text/plain"]);
  if (textPlainData) {
    return `<div class="notebook-output notebook-output-text"><pre><code>${escapeHtml(textPlainData)}</code></pre></div>`;
  }

  return "";
}

function renderNotebookOutputs(outputs) {
  if (!Array.isArray(outputs) || outputs.length === 0) {
    return "";
  }

  const outputBlocks = outputs
    .map((output) => renderNotebookOutputBlock(output))
    .filter((block) => block.length > 0);

  if (outputBlocks.length === 0) {
    return "";
  }

  return `<div class="notebook-cell-outputs">${outputBlocks.join("\n")}</div>`;
}

function renderNotebookPreview(notebookText) {
  let notebookData;

  try {
    notebookData = JSON.parse(notebookText);
  } catch (error) {
    return "<p>Notebook preview is unavailable because the file is not valid JSON.</p>";
  }

  const cells = Array.isArray(notebookData?.cells) ? notebookData.cells : [];
  if (cells.length === 0) {
    return "<p>This notebook has no cells.</p>";
  }

  const cellHtml = cells
    .map((cell, index) => {
      const cellType = typeof cell?.cell_type === "string" ? cell.cell_type.toLowerCase() : "unknown";
      const sourceText = normalizeNotebookSource(cell?.source);
      const label = `Cell ${index + 1}: ${cellType === "markdown" ? "Markdown" : cellType === "code" ? "Code" : "Content"}`;

      if (cellType === "markdown") {
        return `
          <article class="notebook-cell notebook-cell-markdown">
            <p class="notebook-cell-label">${escapeHtml(label)}</p>
            <div class="notebook-cell-body">${markdownToHtml(sourceText)}</div>
          </article>
        `;
      }

      const outputsHtml = renderNotebookOutputs(cell?.outputs);

      return `
        <article class="notebook-cell notebook-cell-code">
          <p class="notebook-cell-label">${escapeHtml(label)}</p>
          <pre><code>${escapeHtml(sourceText)}</code></pre>
          ${outputsHtml}
        </article>
      `;
    })
    .join("\n");

  return `<div class="notebook-preview">${cellHtml}</div>`;
}

async function renderArtifactEntryContent(entry, index) {
  const contentTarget = document.getElementById(`artifact-entry-content-${index}`);
  if (!contentTarget) {
    return;
  }

  const artifactPath = normalizeArtifactPath(entry.path);
  const encodedPath = encodePathSegments(artifactPath);
  const href = `artifacts/${encodedPath}`;
  const extension = (entry.type || getFileExtension(artifactPath)).toLowerCase();
  const embedEnabled = entry.embed !== false;

  if (embedEnabled && ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension)) {
    contentTarget.innerHTML = `<img class="artifact-inline-image" src="${escapeHtml(href)}" alt="${escapeHtml(entry.title || deriveArtifactTitle(artifactPath))}" />`;
    return;
  }

  if (embedEnabled && extension === "pdf") {
    contentTarget.innerHTML = `<iframe class="artifact-inline-pdf" src="${escapeHtml(href)}" title="${escapeHtml(entry.title || deriveArtifactTitle(artifactPath))}"></iframe>`;
    return;
  }

  if (embedEnabled && extension === "ipynb") {
    try {
      const response = await fetch(href, { cache: "no-store" });
      if (!response.ok) {
        renderUnsupportedArtifactContent(contentTarget, href);
        return;
      }

      const notebookText = await response.text();
      contentTarget.innerHTML = renderNotebookPreview(notebookText);
      return;
    } catch (error) {
      renderUnsupportedArtifactContent(contentTarget, href);
      return;
    }
  }

  if (embedEnabled && ["md", "txt", "py", "js", "java", "c", "cpp", "cs", "sql", "json", "yaml", "yml"].includes(extension)) {
    try {
      const response = await fetch(href, { cache: "no-store" });
      if (!response.ok) {
        renderUnsupportedArtifactContent(contentTarget, href);
        return;
      }

      const textContent = await response.text();
      if (extension === "md") {
        contentTarget.innerHTML = markdownToHtml(textContent);
      } else {
        contentTarget.innerHTML = `<pre><code>${escapeHtml(textContent)}</code></pre>`;
      }
      return;
    } catch (error) {
      renderUnsupportedArtifactContent(contentTarget, href);
      return;
    }
  }

  renderUnsupportedArtifactContent(contentTarget, href);
}

async function loadArtifactsFromLayout() {
  const target = document.getElementById("artifact-content");
  if (!target) {
    return false;
  }

  const config = window.PORTFOLIO_CONFIG || {};
  const layoutConfig = config.artifacts?.layout;

  if (config.artifacts?.source !== "layoutFile" || !layoutConfig) {
    return false;
  }

  const layoutPath = typeof layoutConfig.path === "string" ? layoutConfig.path : "artifacts/layout.json";
  const allowedExtensions = Array.isArray(layoutConfig.allowedExtensions)
    ? layoutConfig.allowedExtensions.map((ext) => String(ext).toLowerCase())
    : [];
  const excludedFiles = Array.isArray(layoutConfig.excludedFiles)
    ? layoutConfig.excludedFiles.map((name) => String(name).toLowerCase())
    : [];
  const emptyMessage =
    config.artifacts?.emptyDirectoryMessage || "No files found in the configured artifacts directory.";
  const loadErrorMessage =
    config.artifacts?.directoryLoadErrorMessage || "Artifacts directory could not be loaded.";

  try {
    const response = await fetch(layoutPath, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Artifact layout request failed");
    }

    const data = await response.json();
    const entries = normalizeArtifactLayoutEntries(data);
    const expandedEntries = await expandDirectoryLayoutEntries(entries, config);

    const filteredEntries = expandedEntries.filter((entry) => {
      const fileName = entry.path.split("/").pop()?.toLowerCase() || "";
      if (excludedFiles.includes(fileName)) {
        return false;
      }

      if (allowedExtensions.length === 0) {
        return true;
      }

      const extension = getFileExtension(entry.path);
      return allowedExtensions.includes(extension);
    });

    if (filteredEntries.length === 0) {
      target.innerHTML = `<p>${escapeHtml(emptyMessage)}</p>`;
      return true;
    }

    target.innerHTML = filteredEntries.map((entry, index) => renderArtifactSubsectionSkeleton(entry, index)).join("\n");
    await Promise.all(filteredEntries.map((entry, index) => renderArtifactEntryContent(entry, index)));
    return true;
  } catch (error) {
    target.innerHTML = `<p>${escapeHtml(loadErrorMessage)}</p>`;
    return true;
  }
}

async function loadArtifacts() {
  const loadedFromLayout = await loadArtifactsFromLayout();
  if (loadedFromLayout) {
    return;
  }

  const loadedFromManifest = await loadArtifactManifestDirectory();
  if (loadedFromManifest) {
    return;
  }

  if (!loadedFromManifest) {
    await loadArtifactMarkdown();
  }
}

async function loadArtifactManifestDirectory() {
  const target = document.getElementById("artifact-content");
  if (!target) {
    return false;
  }

  const config = window.PORTFOLIO_CONFIG || {};
  const manifestConfig = config.artifacts?.manifestDirectory;

  if (config.artifacts?.source !== "manifestDirectory" || !manifestConfig) {
    return false;
  }

  const manifestPath = typeof manifestConfig.path === "string" ? manifestConfig.path : "artifacts/manifest.json";
  const allowedExtensions = Array.isArray(manifestConfig.allowedExtensions)
    ? manifestConfig.allowedExtensions.map((ext) => String(ext).toLowerCase())
    : [];
  const excludedFiles = Array.isArray(manifestConfig.excludedFiles)
    ? manifestConfig.excludedFiles.map((name) => String(name).toLowerCase())
    : [];
  const emptyMessage =
    config.artifacts?.emptyDirectoryMessage || "No files found in the configured artifacts directory.";
  const loadErrorMessage =
    config.artifacts?.directoryLoadErrorMessage || "Artifacts directory could not be loaded.";

  try {
    const response = await fetch(manifestPath, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Artifact manifest request failed");
    }

    const data = await response.json();
    const entries = parseArtifactManifestEntries(data);

    const filteredPaths = entries.filter((relativePath) => {
      const fileName = relativePath.split("/").pop()?.toLowerCase() || "";
      if (excludedFiles.includes(fileName)) {
        return false;
      }

      if (allowedExtensions.length === 0) {
        return true;
      }

      const dotIndex = fileName.lastIndexOf(".");
      const extension = dotIndex >= 0 ? fileName.slice(dotIndex + 1) : "";
      return allowedExtensions.includes(extension);
    });

    if (filteredPaths.length === 0) {
      target.innerHTML = `<p>${escapeHtml(emptyMessage)}</p>`;
      return true;
    }

    const fallbackEntries = filteredPaths.map((pathValue) => ({ path: pathValue }));
    target.innerHTML = fallbackEntries.map((entry, index) => renderArtifactSubsectionSkeleton(entry, index)).join("\n");
    await Promise.all(fallbackEntries.map((entry, index) => renderArtifactEntryContent(entry, index)));
    return true;
  } catch (error) {
    target.innerHTML = `<p>${escapeHtml(loadErrorMessage)}</p>`;
    return true;
  }
}

applyConfig();
loadNarrativesFromMarkdown();
loadArtifacts();
