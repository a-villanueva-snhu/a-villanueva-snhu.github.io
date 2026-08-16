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
  const escaped = escapeHtml(text);
  return escaped.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.length === 0) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      continue;
    }

    if (line.startsWith("### ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h3>${renderInlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("## ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h3>${renderInlineMarkdown(line.slice(3))}</h3>`);
      continue;
    }

    if (line.startsWith("# ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h3>${renderInlineMarkdown(line.slice(2))}</h3>`);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${renderInlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    if (inList) {
      html.push("</ul>");
      inList = false;
    }
    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  }

  if (inList) {
    html.push("</ul>");
  }

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

applyConfig();
loadNarrativesFromMarkdown();
loadArtifactMarkdown();
