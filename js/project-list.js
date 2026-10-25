// ───────────── Elenco dei progetti ─────────────
// Un elenco a titoli enormi. In home (data-view="home") mostra i progetti con home: true;
// nella pagina Progetti (data-view="all") li mostra tutti, divisi per anno, con i filtri.
const escapeHtml = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sortedProjects = () => [...PROJECTS].sort((a, b) => b.date.localeCompare(a.date));
const typeOf = (p) => TYPES[p.type] || Object.values(TYPES)[0];

function renderProjectList() {
  const list = document.getElementById("projectList");
  if (!list) return;
  const onlyHome = list.dataset.view === "home";
  const items = sortedProjects().filter((p) => !onlyHome || p.home);

  let year = null;
  let html = "";
  items.forEach((p, i) => {
    const [y, m] = p.date.split("-");
    // nella pagina Progetti, un'etichetta per ogni anno
    if (!onlyHome && y !== year) {
      year = y;
      html += `<li class="fl-year" data-year="${y}">${y}</li>`;
    }
    const main = p.link || p.repo || "#";
    html += `
      <li class="fl-row" data-type="${p.type}" data-year="${y}" data-img="${escapeHtml(p.image)}">
        <span class="fl-num">${String(i + 1).padStart(2, "0")}</span>
        <a class="fl-main" href="${escapeHtml(main)}" target="_blank" rel="noopener">
          ${p.image ? `<span class="fl-thumb"><img src="${escapeHtml(p.image)}" alt="" loading="lazy"></span>` : ""}
          <span class="fl-title">${escapeHtml(pick(p, "title"))}</span>
        </a>
        <div class="fl-side">
          <span class="fl-type">${escapeHtml(pick(typeOf(p), "label"))} · ${t("months")[+m - 1]} ${y}</span>
          ${p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener">${t("list.site")}</a>` : ""}
          ${p.repo ? `<a href="${escapeHtml(p.repo)}" target="_blank" rel="noopener">${t("list.code")}</a>` : ""}
        </div>
        <p class="fl-desc">${escapeHtml(pick(p, "description"))}</p>
      </li>`;
  });
  if (!onlyHome) html += `<li class="fl-end">${t("projects.terminus")}</li>`;
  list.innerHTML = html;
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
  });
}

// ───────────── L'immagine grande che segue il mouse ─────────────
function setupPreview() {
  const list = document.getElementById("projectList");
  const box = document.getElementById("preview");
  if (!list || !box || matchMedia("(hover: none)").matches) return;
  const img = box.querySelector("img");
  let x = 0, y = 0, tx = 0, ty = 0, on = false;

  list.addEventListener("pointerover", (e) => {
    const row = e.target.closest(".fl-row");
    if (!row || !row.dataset.img) return;
    if (img.getAttribute("src") !== row.dataset.img) img.src = row.dataset.img;
    box.classList.add("show");
    on = true;
  });
  list.addEventListener("pointerleave", () => {
    box.classList.remove("show");
    on = false;
  });
  addEventListener("pointermove", (e) => { tx = e.clientX + 24; ty = e.clientY - box.offsetHeight / 2; });

  const frame = () => {
    if (on) {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      const maxX = innerWidth - box.offsetWidth - 12; // non uscire dallo schermo a destra
      box.style.transform = `translate(${Math.min(x, maxX).toFixed(1)}px, ${y.toFixed(1)}px)`;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
