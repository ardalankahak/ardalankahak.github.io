// ============================================
// Utility
// ============================================
async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.html !== undefined) node.innerHTML = opts.html;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.attrs) Object.entries(opts.attrs).forEach(([k, v]) => node.setAttribute(k, v));
  children.forEach(c => c && node.appendChild(c));
  return node;
}

function isVideo(path) {
  return /\.(mp4|webm|mov)$/i.test(path || "");
}

// ============================================
// Mobile nav toggle
// ============================================
document.getElementById("navToggle")?.addEventListener("click", () => {
  document.getElementById("siteNav").classList.toggle("open");
});

// ============================================
// Profile / About / Resume
// ============================================
async function renderProfile() {
  const data = await loadJSON("data/profile.json");
  if (!data) return;

  document.title = `${data.name} — Portfolio`;
  document.getElementById("heroName").textContent = data.name;
  document.getElementById("heroTitle").textContent = data.title;
  document.getElementById("heroTagline").textContent = data.tagline;
  document.getElementById("aboutText").textContent = data.about;

  // Hero photo (only shown if a photo path is set and loads successfully)
  const heroPhoto = document.getElementById("heroPhoto");
  if (data.photo) {
    heroPhoto.src = data.photo;
    heroPhoto.alt = data.name;
    heroPhoto.addEventListener("load", () => { heroPhoto.style.display = "block"; });
    heroPhoto.addEventListener("error", () => {
      console.warn(`Profile photo not found at "${data.photo}". Check the filename/path in data/profile.json matches the file in assets/images/.`);
      heroPhoto.style.display = "none";
    });
  }

  // Hero links: resume button + social links
  const heroLinks = document.getElementById("heroLinks");
  heroLinks.innerHTML = "";
  if (data.resumeFile) {
    heroLinks.appendChild(el("a", {
      class: "btn primary",
      text: "Download Resume (PDF)",
      attrs: { href: data.resumeFile, target: "_blank", rel: "noopener" }
    }));
  }
  (data.links || []).forEach(link => {
    heroLinks.appendChild(el("a", {
      class: "btn",
      text: link.label,
      attrs: { href: link.url, target: "_blank", rel: "noopener" }
    }));
  });

  // Skills
  const skillsList = document.getElementById("skillsList");
  skillsList.innerHTML = "";
  (data.skills || []).forEach(skill => {
    skillsList.appendChild(el("li", { text: skill }));
  });

  // Experience timeline
  const expTimeline = document.getElementById("experienceTimeline");
  expTimeline.innerHTML = "";
  (data.experience || []).forEach(job => {
    const bullets = el("ul", {}, (job.bullets || []).map(b => el("li", { text: b })));
    expTimeline.appendChild(el("div", { class: "timeline-item" }, [
      el("span", { class: "period", text: job.period }),
      el("h3", { text: job.role }),
      el("p", { class: "org", text: job.org }),
      el("p", { text: job.summary }),
      bullets
    ]));
  });

  // Education timeline
  const eduTimeline = document.getElementById("educationTimeline");
  eduTimeline.innerHTML = "";
  (data.education || []).forEach(ed => {
    eduTimeline.appendChild(el("div", { class: "timeline-item" }, [
      el("span", { class: "period", text: ed.period }),
      el("h3", { text: ed.degree }),
      el("p", { class: "org", text: ed.school }),
      ed.notes ? el("p", { text: ed.notes }) : null
    ]));
  });

  // Contact section
  const contactLinks = document.getElementById("contactLinks");
  contactLinks.innerHTML = "";
  if (data.email) {
    contactLinks.appendChild(el("a", { class: "btn primary", text: `Email: ${data.email}`, attrs: { href: `mailto:${data.email}` } }));
  }
  (data.links || []).forEach(link => {
    contactLinks.appendChild(el("a", { class: "btn", text: link.label, attrs: { href: link.url, target: "_blank", rel: "noopener" } }));
  });
}

// ============================================
// Generic expandable "catalog record" renderer
// ============================================
function makeRecord(index, title, sub, status, bodyContent) {
  const record = el("div", { class: "record", attrs: { "data-open": "false" } });

  const header = el("button", {
    class: "record-header",
    attrs: { type: "button", "aria-expanded": "false" }
  }, [
    el("span", { class: "record-index", text: String(index).padStart(2, "0") }),
    el("div", { class: "record-main" }, [
      el("p", { class: "record-title", text: title }),
      el("p", { class: "record-sub", text: sub })
    ]),
    el("span", { class: "record-status", text: status || "" }),
    el("span", { class: "record-caret", html: "+" })
  ]);

  const body = el("div", { class: "record-body" }, [
    el("div", { class: "record-body-inner" }, bodyContent)
  ]);

  header.addEventListener("click", () => {
    const isOpen = record.getAttribute("data-open") === "true";
    record.setAttribute("data-open", isOpen ? "false" : "true");
    header.setAttribute("aria-expanded", String(!isOpen));
  });

  record.appendChild(header);
  record.appendChild(body);
  return record;
}

function mediaRow(images = [], video = "") {
  const items = [];
  images.forEach(src => {
    items.push(el("img", { attrs: { src, alt: "", loading: "lazy" } }));
  });
  if (video) {
    const v = el("video", { attrs: { src: video, controls: "true", preload: "metadata" } });
    items.push(v);
  }
  if (!items.length) return null;
  return el("div", { class: "media-row" }, items);
}

// ============================================
// Projects
// ============================================
async function renderProjects() {
  const data = await loadJSON("data/projects.json");
  const container = document.getElementById("projectsCatalog");
  const countEl = document.getElementById("projectCount");
  container.innerHTML = "";

  if (!data || !data.length) {
    container.appendChild(el("div", { class: "empty-note", text: "No projects yet — add entries to data/projects.json" }));
    countEl.textContent = "";
    return;
  }
  countEl.textContent = `${data.length} entries`;

  data.forEach((p, i) => {
    const body = [];
    if (p.tags?.length) {
      body.push(el("div", { class: "tag-row" }, p.tags.map(t => el("span", { text: t }))));
    }
    body.push(el("p", { text: p.description }));
    if (p.highlights?.length) {
      body.push(el("ul", { class: "highlight-list" }, p.highlights.map(h => el("li", { text: h }))));
    }
    const media = mediaRow(p.images, p.video);
    if (media) body.push(media);
    if (p.links?.length) {
      body.push(el("div", { class: "link-row" }, p.links.map(l =>
        el("a", { class: "btn", text: l.label, attrs: { href: l.url, target: "_blank", rel: "noopener" } })
      )));
    }

    container.appendChild(makeRecord(i + 1, p.title, p.period || "", p.status, body));
  });
}

// ============================================
// Papers
// ============================================
async function renderPapers() {
  const data = await loadJSON("data/papers.json");
  const container = document.getElementById("papersCatalog");
  const countEl = document.getElementById("paperCount");
  container.innerHTML = "";

  if (!data || !data.length) {
    container.appendChild(el("div", { class: "empty-note", text: "No publications yet — add entries to data/papers.json" }));
    countEl.textContent = "";
    return;
  }
  countEl.textContent = `${data.length} entries`;

  data.forEach((paper, i) => {
    const body = [];
    body.push(el("p", { text: `${paper.authors || ""}` }));
    body.push(el("p", { text: paper.abstract }));
    if (paper.fullText) {
      body.push(el("p", { html: "<strong>Full text</strong>" }));
      body.push(el("div", { class: "full-text", text: paper.fullText }));
    }
    const linkRow = [];
    if (paper.pdfFile) {
      linkRow.push(el("a", { class: "btn primary", text: "Download PDF", attrs: { href: paper.pdfFile, target: "_blank", rel: "noopener" } }));
    }
    (paper.links || []).forEach(l => {
      linkRow.push(el("a", { class: "btn", text: l.label, attrs: { href: l.url, target: "_blank", rel: "noopener" } }));
    });
    if (linkRow.length) body.push(el("div", { class: "link-row" }, linkRow));

    container.appendChild(makeRecord(i + 1, paper.title, `${paper.venue || ""} · ${paper.year || ""}`, paper.year, body));
  });
}

// ============================================
// Books
// ============================================
async function renderBooks() {
  const data = await loadJSON("data/books.json");
  const container = document.getElementById("booksCatalog");
  const countEl = document.getElementById("bookCount");
  container.innerHTML = "";

  if (!data || !data.length) {
    container.appendChild(el("div", { class: "empty-note", text: "No books yet — add entries to data/books.json" }));
    countEl.textContent = "";
    return;
  }
  countEl.textContent = `${data.length} entries`;

  data.forEach((book, i) => {
    const body = [];
    const topRow = [];
    if (book.cover) {
      topRow.push(el("img", { class: "book-cover-inline", attrs: { src: book.cover, alt: "" } }));
    }
    if (book.rating) {
      topRow.push(el("span", { class: "rating", text: "★".repeat(book.rating) + "☆".repeat(5 - book.rating) }));
    }
    if (book.progress) {
      topRow.push(el("span", { class: "rating", text: `${book.progress} complete` }));
    }
    if (topRow.length) body.push(el("div", { class: "media-row", attrs: { style: "grid-template-columns:auto auto;align-items:center;" } }, topRow));
    if (book.notes) body.push(el("p", { text: book.notes }));

    container.appendChild(makeRecord(i + 1, book.title, book.author || "", book.status, body));
  });
}

// ============================================
// Init
// ============================================
renderProfile();
renderProjects();
renderPapers();
renderBooks();
