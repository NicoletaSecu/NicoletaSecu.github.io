// ───────────── Elenco dei progetti ─────────────
// Un elenco a titoli enormi. In home (data-view="home") mostra i progetti con home: true;
// nella pagina Progetti (data-view="all") li mostra tutti su un albero del tempo, divisi per anno, con i filtri.
const escapeHtml = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sortedProjects = () => [...PROJECTS].sort((a, b) => b.date.localeCompare(a.date));
const typeOf = (p) => TYPES[p.type] || Object.values(TYPES)[0];

// Il periodo del progetto: "ott 2026", "mag – ago 2026", "dic 2025 – feb 2026", "ott 2026 – in corso"
const monthYear = (d) => { const [y, m] = d.split("-"); return { m: t("months")[+m - 1], y }; };
const period = (p) => {
  const a = monthYear(p.date);
  if (p.ongoing) return `${a.m} ${a.y} – ${t("list.ongoing")}`;
  if (!p.until || p.until === p.date) return `${a.m} ${a.y}`;
  const b = monthYear(p.until);
  return a.y === b.y ? `${a.m} – ${b.m} ${b.y}` : `${a.m} ${a.y} – ${b.m} ${b.y}`;
};
// la nota per i progetti che ogni tanto aggiorni ancora
const maintainedNote = (p) => (p.maintained ? `<span class="fl-note-small">${t("list.maintained")}</span>` : "");

// "Con Davide Modena", con il link al sito di chi ha lavorato con te (campo with in content/projects.js)
const withPeople = (p) => {
  if (!p.with || !p.with.length) return "";
  const names = p.with.map((w) => w.url
    ? `<a href="${escapeHtml(w.url)}" target="_blank" rel="noopener">${escapeHtml(w.name)}</a>`
    : escapeHtml(w.name));
  return ` <span class="fl-with">${t("list.with")} ${names.join(", ")}.</span>`;
};

function renderProjectList() {
  const list = document.getElementById("projectList");
  if (!list) return;
  const onlyHome = list.dataset.view === "home";
  const items = sortedProjects().filter((p) => !onlyHome || p.home);

  let year = null;
  let html = "";
  items.forEach((p, i) => {
    const [y, m] = p.date.split("-");
    const when = period(p);
    const main = p.link || p.repo || "#";
    const title = `
      <a class="fl-main" href="${escapeHtml(main)}" target="_blank" rel="noopener">
        ${p.image ? `<span class="fl-thumb"><img src="${escapeHtml(p.image)}" alt="" loading="lazy"></span>` : ""}
        <span class="fl-title">${escapeHtml(pick(p, "title"))}</span>
      </a>`;
    const site = p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener">${t("list.site")}</a>` : "";
    const desc = `<p class="fl-desc">${escapeHtml(pick(p, "description"))}${withPeople(p)}</p>`;
    const attrs = `data-type="${p.type}" data-year="${y}" data-img="${escapeHtml(p.image)}"`;

    if (onlyHome) {
      // home: numero, titolo enorme, categoria e data a destra, descrizione sotto
      html += `
        <li class="fl-row" ${attrs}>
          <span class="fl-num">${String(i + 1).padStart(2, "0")}</span>
          ${title}
          <div class="fl-side"><span class="fl-type">${escapeHtml(pick(typeOf(p), "label"))} · ${when}</span>${site}${maintainedNote(p)}</div>
          ${desc}
        </li>`;
      return;
    }

    // pagina Progetti: un albero. La linea è al centro, i progetti si alternano a destra e a sinistra,
    // la data sta dall'altra parte della linea. Ogni anno è un capitolo.
    if (y !== year) {
      year = y;
      html += `<li class="fl-year" data-year="${y}"><span>${y}</span></li>`;
    }
    html += `
      <li class="fl-row" ${attrs}>
        <span class="fl-when">${when}</span>
        <span class="fl-dot" style="--c:${typeOf(p).color}" aria-hidden="true"></span>
        <div class="fl-card">
          ${title}
          <div class="fl-side"><span class="fl-type">${escapeHtml(pick(typeOf(p), "label"))}</span>${site}${maintainedNote(p)}</div>
          ${desc}
        </div>
      </li>`;
  });
  if (!onlyHome) html += `<li class="fl-end"><span>${t("projects.terminus")}</span></li>`;
  list.innerHTML = html;
  placeSides();
  updateActiveRow();
}

// ───────────── Il progetto al centro dello schermo si accende ─────────────
// Mentre scorri, il progetto più vicino al centro dello schermo ha la miniatura a colori,
// il titolo bordeaux e (nella pagina Progetti) il pallino pieno. Funziona anche su telefono.
function updateActiveRow() {
  const rows = [...document.querySelectorAll("#projectList .fl-row:not(.closed)")];
  const mid = innerHeight / 2;
  let best = null;
  let bestDist = Infinity;
  for (const r of rows) {
    const b = r.getBoundingClientRect();
    if (b.bottom < 0 || b.top > innerHeight) continue; // fuori dallo schermo
    const dist = Math.abs(b.top + b.height / 2 - mid);
    if (dist < bestDist) { best = r; bestDist = dist; }
  }
  rows.forEach((r) => r.classList.toggle("active", r === best));
}

function setupActiveRow() {
  if (!document.getElementById("projectList")) return;
  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; updateActiveRow(); });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
}

// Nell'albero i progetti visibili si alternano: il primo a sinistra, il secondo a destra, e così via.
function placeSides() {
  document.querySelectorAll('#projectList[data-view="all"] .fl-row:not(.closed)').forEach((r, i) => {
    r.classList.toggle("left", i % 2 === 0);
    r.classList.toggle("right", i % 2 === 1);
  });
}

// ───────────── Filtri (solo nella pagina Progetti) ─────────────
function renderFilters() {
  const box = document.getElementById("filters");
  if (!box) return;
  const used = [...new Set(PROJECTS.map((p) => p.type))];
  box.innerHTML =
    `<button class="chip" type="button" data-filter="all" aria-pressed="true">${t("projects.all")}</button>` +
    used.map((k) => {
      const type = TYPES[k] || Object.values(TYPES)[0];
      return `<button class="chip" type="button" data-filter="${k}" aria-pressed="false" style="--c:${type.color}"><i></i>${pick(type, "label")}</button>`;
    }).join("");
}

function setupFilters() {
  const box = document.getElementById("filters");
  if (!box) return;
  box.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const f = chip.dataset.filter;
    box.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    // i progetti che non c'entrano spariscono, e con loro gli anni rimasti vuoti
    document.querySelectorAll(".fl-row").forEach((r) => r.classList.toggle("closed", f !== "all" && r.dataset.type !== f));
    document.querySelectorAll(".fl-year").forEach((y) => {
      const open = document.querySelector(`.fl-row[data-year="${y.dataset.year}"]:not(.closed)`);
      y.classList.toggle("closed", !open);
    });
    placeSides();
    updateActiveRow();
  });
}

// ───────────── L'anteprima grande della miniatura ─────────────
// Passando sopra la miniatura compare l'immagine grande, ferma accanto alla miniatura
// (a destra se c'è spazio, altrimenti a sinistra). Titolo e "Sito" restano cliccabili.
function setupPreview() {
  const list = document.getElementById("projectList");
  const box = document.getElementById("preview");
  if (!list || !box || matchMedia("(hover: none)").matches) return;
  const img = box.querySelector("img");
  const GAP = 18;

  const place = (thumb) => {
    const r = thumb.getBoundingClientRect();
    const w = box.offsetWidth, h = box.offsetHeight;
    const x = r.right + GAP + w < innerWidth ? r.right + GAP : r.left - GAP - w;
    // centrata sulla miniatura, ma sempre dentro lo schermo
    const y = Math.max(12, Math.min(innerHeight - h - 12, r.top + r.height / 2 - h / 2));
    box.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  };

  let current = null;
  list.addEventListener("pointerover", (e) => {
    const thumb = e.target.closest(".fl-thumb");
    const row = thumb && thumb.closest(".fl-row");
    if (!row || !row.dataset.img) return;
    if (img.getAttribute("src") !== row.dataset.img) img.src = row.dataset.img;
    current = thumb;
    place(thumb);
    box.classList.add("show");
  });
  list.addEventListener("pointerout", (e) => {
    const thumb = e.target.closest(".fl-thumb");
    if (!thumb || thumb.contains(e.relatedTarget)) return;
    current = null;
    box.classList.remove("show");
  });
  // se la pagina scorre mentre è aperta, resta attaccata alla sua miniatura
  addEventListener("scroll", () => { if (current) place(current); }, { passive: true });
}
