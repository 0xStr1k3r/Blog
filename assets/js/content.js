const IS_IN_ASSET_HTML = window.location.pathname.includes("/assets/html/");
const ROOT_PREFIX = IS_IN_ASSET_HTML ? "../../" : "./";
const PAGE_PREFIX = IS_IN_ASSET_HTML ? "./" : "./assets/html/";
const CONTENT_INDEX_PATH = `${ROOT_PREFIX}data/content-index.json`;

let cachedIndex = null;

function pageUrl(fileName) {
  return `${PAGE_PREFIX}${fileName}`;
}

function contentFileUrl(filePath) {
  const rel = String(filePath || "").replace(/^\/+/, "");
  return `${ROOT_PREFIX}${rel}`;
}

async function getContentIndex() {
  if (cachedIndex) {
    return cachedIndex;
  }

  const res = await fetch(CONTENT_INDEX_PATH);
  if (!res.ok) {
    throw new Error(`Failed to load ${CONTENT_INDEX_PATH}`);
  }

  cachedIndex = await res.json();
  return cachedIndex;
}

function categoryLabel(category) {
  const labels = {
    writeups: "Writeups",
    research: "Research",
    tools: "Tools",
    cheatsheets: "Cheat Sheets",
    projects: "Projects",
    resources: "Resources",
  };
  return labels[category] || category;
}

function refreshRevealAnimations() {
  if (typeof window.applyRevealToNewContent === "function") {
    window.applyRevealToNewContent();
  }
}

function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAllPosts(index) {
  return Object.entries(index).flatMap(([category, items]) =>
    items.map((item) => ({
      ...item,
      category,
    }))
  );
}

function sortByDateDesc(posts) {
  return [...posts].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function createPostCard(post) {
  const postUrl = `${pageUrl("post.html")}?category=${encodeURIComponent(post.category)}&slug=${encodeURIComponent(post.slug)}`;
  const tagHtml = (post.tags || [])
    .slice(0, 3)
    .map(
      (tag) =>
        `<a class="tag" href="${pageUrl("tags.html")}?tag=${encodeURIComponent(tag)}">${escapeHtml(tag)}</a>`
    )
    .join("");

  return `
    <article class="card card-clickable" data-href="${postUrl}" tabindex="0" role="link" aria-label="Open ${escapeHtml(post.title)}">
      <h3><a href="${postUrl}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.excerpt || "No excerpt available.")}</p>
      <div class="tags-wrap">${tagHtml}</div>
      <div class="card-meta">
        <span>${escapeHtml(categoryLabel(post.category))}</span>
        <span>${escapeHtml(formatDate(post.date))}</span>
      </div>
    </article>
  `;
}

function renderEmpty(target, message) {
  target.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderTags(post) {
  return (post.tags || [])
    .map((tag) => `<a class="tag" href="${pageUrl("tags.html")}?tag=${encodeURIComponent(tag)}">${escapeHtml(tag)}</a>`)
    .join("");
}

function renderMarkdown(markdown) {
  const cleaned = markdown.replace(/^---[\s\S]*?---\s*/m, "");
  const codeTokens = [];

  const withCodeTokens = cleaned.replace(/```([\w-]+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const token = `__CODE_BLOCK_${codeTokens.length}__`;
    const language = lang ? ` data-lang="${escapeHtml(lang)}"` : "";
    codeTokens.push(`<pre><code${language}>${escapeHtml(code.trimEnd())}</code></pre>`);
    return token;
  });

  const lines = withCodeTokens.split("\n");
  const html = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeLists();
      continue;
    }

    const codeMatch = line.match(/^__CODE_BLOCK_(\d+)__$/);
    if (codeMatch) {
      closeLists();
      html.push(codeTokens[Number(codeMatch[1])] || "");
      continue;
    }

    if (line.startsWith("### ")) {
      closeLists();
      html.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("## ")) {
      closeLists();
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("# ")) {
      closeLists();
      html.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!inUl) {
        closeLists();
        html.push("<ul>");
        inUl = true;
      }
      html.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (!inOl) {
        closeLists();
        html.push("<ol>");
        inOl = true;
      }
      html.push(`<li>${escapeHtml(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }

    closeLists();
    const withInlineCode = line.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
    html.push(`<p>${withInlineCode}</p>`);
  }

  closeLists();
  return html.join("\n");
}

async function renderHomePage() {
  const featuredTarget = document.getElementById("featured-posts");
  const latestTarget = document.getElementById("latest-posts");
  if (!featuredTarget || !latestTarget) {
    return;
  }

  const index = await getContentIndex();
  const all = sortByDateDesc(getAllPosts(index));
  const featured = all.filter((post) => post.featured).slice(0, 6);

  if (!featured.length) {
    renderEmpty(featuredTarget, "No featured content yet.");
  } else {
    featuredTarget.innerHTML = featured.map(createPostCard).join("");
  }

  latestTarget.innerHTML = all.slice(0, 8).map(createPostCard).join("");
  refreshRevealAnimations();
}

async function renderCategoryPage(category) {
  const target = document.getElementById("category-posts");
  if (!target) {
    return;
  }

  const index = await getContentIndex();
  const posts = sortByDateDesc((index[category] || []).map((entry) => ({ ...entry, category })));
  if (!posts.length) {
    renderEmpty(target, "No posts have been added for this category yet.");
    refreshRevealAnimations();
    return;
  }

  target.innerHTML = posts.map(createPostCard).join("");
  refreshRevealAnimations();
}

async function renderTagPage() {
  const cloudTarget = document.getElementById("tags-overview");
  const resultTarget = document.getElementById("tag-results");
  const titleTarget = document.getElementById("tag-results-title");
  if (!cloudTarget || !resultTarget || !titleTarget) {
    return;
  }

  const index = await getContentIndex();
  const allPosts = getAllPosts(index);
  const tagCounts = new Map();

  allPosts.forEach((post) => {
    (post.tags || []).forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const tagList = [...tagCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  cloudTarget.innerHTML = tagList
    .map(
      ([tag, count]) =>
        `<a class="tag" href="${pageUrl("tags.html")}?tag=${encodeURIComponent(tag)}">${escapeHtml(tag)} (${count})</a>`
    )
    .join("");

  const selectedTag = getQueryParam("tag");
  if (!selectedTag) {
    titleTarget.textContent = "Posts for selected tag";
    renderEmpty(resultTarget, "Select a tag above to filter posts.");
    refreshRevealAnimations();
    return;
  }

  const filtered = sortByDateDesc(
    allPosts.filter((post) => (post.tags || []).some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()))
  );
  titleTarget.textContent = `Posts tagged "${selectedTag}"`;
  if (!filtered.length) {
    renderEmpty(resultTarget, "No posts found for this tag.");
    refreshRevealAnimations();
    return;
  }
  resultTarget.innerHTML = filtered.map(createPostCard).join("");
  refreshRevealAnimations();
}

async function renderSearchPage() {
  const input = document.getElementById("search-input");
  const count = document.getElementById("search-count");
  const target = document.getElementById("search-results");
  if (!(input instanceof HTMLInputElement) || !count || !target) {
    return;
  }

  const index = await getContentIndex();
  const allPosts = sortByDateDesc(getAllPosts(index));

  const render = () => {
    const query = input.value.trim().toLowerCase();
    const filtered = query
      ? allPosts.filter((post) => {
          const haystack = [post.title, post.excerpt, post.category, ...(post.tags || [])].join(" ").toLowerCase();
          return haystack.includes(query);
        })
      : allPosts;

    count.textContent = `${filtered.length} result${filtered.length === 1 ? "" : "s"} found`;
    if (!filtered.length) {
      renderEmpty(target, "No matching results.");
      refreshRevealAnimations();
      return;
    }
    target.innerHTML = filtered.map(createPostCard).join("");
    refreshRevealAnimations();
  };

  input.addEventListener("input", render);
  render();
}

async function renderPostPage() {
  const title = document.getElementById("post-title");
  const meta = document.getElementById("post-meta");
  const breadcrumb = document.getElementById("post-breadcrumb");
  const tags = document.getElementById("post-tags");
  const content = document.getElementById("post-content");
  const related = document.getElementById("related-posts");
  const backBtn = document.getElementById("post-back-btn");

  if (!title || !meta || !breadcrumb || !tags || !content || !related) {
    return;
  }

  const category = getQueryParam("category");
  const slug = getQueryParam("slug");
  if (!category || !slug) {
    title.textContent = "Post not found";
    renderEmpty(content, "Missing query parameters. Use ?category=<name>&slug=<value>.");
    refreshRevealAnimations();
    return;
  }

  const index = await getContentIndex();
  const entry = (index[category] || []).find((item) => item.slug === slug);
  if (!entry) {
    title.textContent = "Post not found";
    renderEmpty(content, "No matching post entry in content index.");
    refreshRevealAnimations();
    return;
  }

  title.textContent = entry.title;
  breadcrumb.innerHTML = `<a href="${pageUrl(`${category}.html`)}">${escapeHtml(categoryLabel(category))}</a>`;
  meta.textContent = `${categoryLabel(category)} · ${formatDate(entry.date)}`;
  tags.innerHTML = renderTags(entry);

  if (backBtn instanceof HTMLButtonElement) {
    backBtn.onclick = () => {
      if (document.referrer && document.referrer.startsWith(window.location.origin)) {
        window.history.back();
        return;
      }
      window.location.href = pageUrl(`${category}.html`);
    };
  }

  const mdRes = await fetch(contentFileUrl(entry.file));
  if (!mdRes.ok) {
    renderEmpty(content, `Unable to load markdown file: ${entry.file}`);
    refreshRevealAnimations();
    return;
  }
  const markdown = await mdRes.text();
  content.innerHTML = renderMarkdown(markdown);

  const relatedPosts = sortByDateDesc(
    (index[category] || []).filter((item) => item.slug !== slug).map((item) => ({ ...item, category }))
  ).slice(0, 3);
  if (!relatedPosts.length) {
    renderEmpty(related, "No related posts yet.");
    refreshRevealAnimations();
    return;
  }
  related.innerHTML = relatedPosts.map(createPostCard).join("");
  refreshRevealAnimations();
}

async function initContent() {
  const pageType = document.body.dataset.page;
  if (!pageType) {
    return;
  }

  try {
    if (pageType === "home") {
      await renderHomePage();
      return;
    }
    if (pageType === "category") {
      const category = document.body.dataset.category;
      if (category) {
        await renderCategoryPage(category);
      }
      return;
    }
    if (pageType === "tags") {
      await renderTagPage();
      return;
    }
    if (pageType === "search") {
      await renderSearchPage();
      return;
    }
    if (pageType === "post") {
      await renderPostPage();
    }
  } catch (error) {
    console.error(error);
    const targets = document.querySelectorAll("#featured-posts,#latest-posts,#category-posts,#tag-results,#search-results,#post-content");
    targets.forEach((target) => {
      if (target) {
        target.innerHTML = `<div class="empty-state">Content failed to load. Check data/content-index.json and markdown paths.</div>`;
      }
    });
  }
}

function initCardNavigation() {
  const activateCard = (card) => {
    const href = card?.dataset?.href;
    if (href) {
      window.location.href = href;
    }
  };

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element) || event.button !== 0) {
      return;
    }

    const card = target.closest(".card-clickable");
    if (!card) {
      return;
    }

    if (target.closest("a,button,input,select,textarea,label")) {
      return;
    }

    activateCard(card);
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const card = target.closest(".card-clickable");
    if (!card) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateCard(card);
    }
  });
}

initCardNavigation();
initContent();
