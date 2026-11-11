// Solo nella pagina Progetti: un piccolo quadrante a lato, come la moviola di una
// sala di montaggio. Mentre scorri ti dice su quale progetto sei (03 / 07), il suo
// periodo e con cosa è fatto, e la pellicola a fianco segna il punto. I fotogrammi
// sono cliccabili per saltare al progetto.
(function () {
  const list = document.querySelector('#projectList[data-view="all"]');
  if (!list) return;

  // ogni progetto è legato alla sua immagine, così dall'immagine risalgo allo stack
  const byImg = {};
  (typeof PROJECTS !== "undefined" ? PROJECTS : []).forEach((p) => { if (p.image) byImg[p.image] = p; });

  const hud = document.createElement("aside");
  hud.className = "moviola";
  hud.setAttribute("aria-hidden", "true");
  hud.innerHTML =
    '<div class="moviola-strip"></div>' +
    '<div class="moviola-read">' +
      '<div class="moviola-idx"><b>--</b><span>/ --</span></div>' +
      '<div class="moviola-title"></div>' +
      '<div class="moviola-when"></div>' +
      '<div class="moviola-stack"></div>' +
    "</div>";
  document.body.appendChild(hud);

  const strip = hud.querySelector(".moviola-strip");
  const idxEl = hud.querySelector(".moviola-idx b");
  const totEl = hud.querySelector(".moviola-idx span");
  const titleEl = hud.querySelector(".moviola-title");
  const whenEl = hud.querySelector(".moviola-when");
  const stackEl = hud.querySelector(".moviola-stack");

  let cells = [];
  let shownTotal = -1;

  // la pellicola: un fotogramma per progetto visibile, cliccabile
  function buildStrip(rows) {
    if (rows.length === shownTotal) return;
    shownTotal = rows.length;
    strip.innerHTML = "";
    cells = rows.map((row, i) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "moviola-cell";
      cell.tabIndex = -1;
      cell.addEventListener("click", () => row.scrollIntoView({ behavior: "smooth", block: "center" }));
      strip.appendChild(cell);
      return cell;
    });
  }

  // il progetto più vicino al centro dello schermo, come fa updateActiveRow
  function nearestCenter(rows) {
    const mid = innerHeight / 2;
    let best = null, bestDist = Infinity, bestI = -1;
    rows.forEach((r, i) => {
      const b = r.getBoundingClientRect();
      if (b.bottom < 0 || b.top > innerHeight) return;
      const d = Math.abs(b.top + b.height / 2 - mid);
      if (d < bestDist) { best = r; bestDist = d; bestI = i; }
    });
    return { row: best, i: bestI };
  }

  let lastRow = null;
  function update() {
    const rows = [...list.querySelectorAll(".fl-row:not(.closed)")];
    if (!rows.length) { hud.classList.remove("on"); return; }
    buildStrip(rows);
    const { row, i } = nearestCenter(rows);
    cells.forEach((c, k) => c.classList.toggle("on", k === i));
    totEl.textContent = `/ ${String(rows.length).padStart(2, "0")}`;
    if (!row) { hud.classList.remove("on"); return; }
    hud.classList.add("on");
    if (row === lastRow) return;
    lastRow = row;

    idxEl.textContent = String(i + 1).padStart(2, "0");
    titleEl.textContent = (row.querySelector(".fl-title") || {}).textContent || "";
    whenEl.textContent = (row.querySelector(".fl-when") || {}).textContent || "";
    const proj = byImg[row.dataset.img];
    const stack = (proj && proj.stack) || [];
    stackEl.innerHTML = stack.slice(0, 5).map((s) => `<span>${s.replace(/[&<>]/g, "")}</span>`).join("");
  }

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  // anche quando si cambia filtro la lista cambia: la riseguo
  new MutationObserver(onScroll).observe(list, { attributes: true, subtree: true, attributeFilter: ["class"] });
  update();
})();
