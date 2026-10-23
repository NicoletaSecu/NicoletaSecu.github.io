// ───────────── La linea della metro (progetti) ─────────────
const escapeHtml = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const initials = (s) => s.replace(/\(.*?\)/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
const seedOf = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100, 7);
const formatDate = (d) => { const [y, m] = d.split("-"); return `${t("months")[+m - 1]} ${y}`; };

// In home (data-view="home") mostra solo i progetti con home: true; nella pagina Progetti tutti.
function renderMetro() {
  const metro = document.getElementById("metro");
  if (!metro) return;
  const onlyHome = metro.dataset.view === "home";
  const list = onlyHome ? PROJECTS.filter((p) => p.home) : PROJECTS;
  const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
  let year = null;
  let side = 0;
  let html = "";

  for (const p of sorted) {
    const y = p.date.slice(0, 4);
    if (y !== year) {
      year = y;
      html += `<li class="year-stop" data-year="${y}"><span class="interchange" aria-hidden="true"></span><h3 data-gravity>${y}</h3></li>`;
    }
    const type = TYPES[p.type] || Object.values(TYPES)[0];
    const title = pick(p, "title");
    const photo = p.image
      ? `<img src="${escapeHtml(p.image)}" alt="" loading="lazy" draggable="false">`
      : `<div class="ph" style="--seed:${seedOf(p.title)}"><span>${escapeHtml(initials(title))}</span></div>`;

    html += `
      <li class="station ${side++ % 2 ? "right" : "left"}${p.featured ? " featured" : ""}"
          data-type="${p.type}" data-year="${y}" style="--c:${type.color}">
        <span class="dot" aria-hidden="true"></span>
        <article class="card" data-gravity>
          <div class="photo">${photo}<span class="dev-label">${t("projects.developing")}</span></div>
          <div class="info">
            <p class="meta"><span class="tag">${pick(type, "label")}</span> · ${formatDate(p.date)}${p.featured ? ` · <span class="star">${t("projects.featured")}</span>` : ""}</p>
            <h4>${escapeHtml(title)}</h4>
            <p>${escapeHtml(pick(p, "description"))}</p>
            ${p.link || p.repo ? `<p class="links">
              ${p.link ? `<a class="go" href="${escapeHtml(p.link)}" target="_blank" rel="noopener">${t("projects.open")}</a>` : ""}
              ${p.repo ? `<a class="code" href="${escapeHtml(p.repo)}" target="_blank" rel="noopener">${t("projects.code")}</a>` : ""}
            </p>` : ""}
          </div>
        </article>
      </li>`;
  }
  if (!onlyHome) html += `<li class="terminus"><p>${t("projects.terminus")}</p></li>`;
  metro.innerHTML = html;
}

// ───────────── Filtri (le "linee" colorate) ─────────────
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
    document.querySelectorAll(".station").forEach((s) => s.classList.toggle("closed", f !== "all" && s.dataset.type !== f));
    document.querySelectorAll(".year-stop").forEach((y) => {
      const open = document.querySelector(`.station[data-year="${y.dataset.year}"]:not(.closed)`);
      y.classList.toggle("closed", !open);
    });
    // quelli rimasti si rimettono in fila, alternando sinistra e destra
    document.querySelectorAll(".station:not(.closed)").forEach((s, i) => {
      s.classList.toggle("left", i % 2 === 0);
      s.classList.toggle("right", i % 2 === 1);
    });
  });
}

// ───────────── Camera oscura ─────────────
// Le foto sono quasi nere: si sviluppano mentre ci passi sopra col mouse (lo fa il CSS con :hover)
// e tornano scure quando lo togli. Su telefono, senza mouse, si sviluppano mentre sono sullo schermo.
let darkroomObserver = null;
function setupDarkroom() {
  if (!matchMedia("(hover: none)").matches || !("IntersectionObserver" in window)) return;
  darkroomObserver?.disconnect();
  darkroomObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => en.target.classList.toggle("developed", en.isIntersecting));
  }, { threshold: 0.6 });
  document.querySelectorAll(".card").forEach((c) => darkroomObserver.observe(c));
}
