// La pagina Progetti: una fisarmonica di strisce, dal più recente a sinistra, con i filtri per tipo.
// Di base sono tutte chiuse; passandoci sopra una si apre e togliendo il cursore si richiude.
// Nella striscia aperta l'immagine porta al sito del progetto, il titolo alla sua pagina.
(function () {
  const acc = document.getElementById("plAcc");
  const filters = document.getElementById("plFilters");
  // se la pagina non è quella giusta o i dati non ci sono, non faccio niente
  if (!acc || typeof PROJECTS === "undefined") return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // touch = true su telefoni e tablet (niente mouse che "passa sopra")
  const touch = !matchMedia("(hover: hover) and (pointer: fine)").matches;
  // esc trasforma i caratteri speciali (< > & " ') in testo innocuo, così un titolo non può rompere l'HTML
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const all = projectsByDate();   // tutti i progetti, dal più recente
  // i tipi davvero usati da almeno un progetto (un filtro senza progetti non serve)
  const used = Object.keys(TYPES).filter((k) => all.some((p) => p.type === k));
  let strips = [];      // le strisce della fisarmonica (elementi HTML)
  let filter = "all";   // il filtro scelto: "all" oppure il tipo ("app", "study", "lab")

  // L'HTML di una striscia. Dentro ci sono due "facce": quella chiusa (numero e titolo in verticale)
  // e quella aperta (.acc-open, con tipo, periodo, descrizione e i due bottoni). Il CSS mostra l'una o l'altra.
  // Il numero conta all'indietro: il più recente ha il numero più alto.
  const stripHTML = (p, i) => {
    const type = TYPES[p.type] || TYPES.app;
    const title = esc(tr(p, "title"));
    const page = `progetto.html?id=${encodeURIComponent(p.id)}`;
    const img = `<img src="${esc(p.image)}" alt="" loading="lazy" draggable="false">`;
    // l'immagine copre tutta la striscia: se c'è il sito ci porta lì
    const media = p.link
      ? `<a class="acc-img" href="${esc(p.link)}" target="_blank" rel="noopener" data-cursor="apri ↗" aria-label="${L("Apri il sito di", "Open the site of")} ${title}">${img}</a>`
      : `<a class="acc-img" href="${page}" data-cursor="scopri" aria-label="${title}">${img}</a>`;
    return `
      <div class="acc-strip" data-type="${esc(p.type)}" style="--c:${type.color}">
        ${media}
        <span class="acc-num mono">${String(all.length - i).padStart(2, "0")}</span>
        <span class="acc-v" aria-hidden="true">${title}</span>
        <div class="acc-open">
          <span class="acc-meta mono">${esc(tr(type, "one"))} · ${projectPeriod(p)}</span>
          <a class="acc-title" href="${page}" data-cursor="scopri">${title}</a>
          <p>${esc(tr(p, "teaser"))}</p>
          <div class="acc-links">
            <a href="${page}" data-cursor="scopri">${L("Scopri il progetto →", "Explore the project →")}</a>
            ${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${L("Apri il sito ↗", "Open the site ↗")}</a>` : ""}
          </div>
        </div>
      </div>`;
  };

  // aprire e chiudere: si apre quella sotto il cursore (o col fuoco della tastiera), le altre si chiudono
  const open = (s) => strips.forEach((o) => o.classList.toggle("open", o === s));

  // scrive le strisce (all'inizio e quando cambi lingua) e tiene il filtro scelto
  // animate = true solo la prima volta (le strisce entrano una dopo l'altra); cambiando lingua no
  function render(animate) {
    acc.innerHTML = all.map(stripHTML).join("");
    strips = [...acc.querySelectorAll(".acc-strip")];
    strips.forEach((s) => {
      if (!touch) {
        s.addEventListener("pointerenter", () => open(s));
        s.addEventListener("pointerleave", () => s.classList.remove("open"));
      }
      s.addEventListener("focusin", () => open(s));
      s.addEventListener("focusout", (e) => { if (!s.contains(e.relatedTarget)) s.classList.remove("open"); });
      // hidden nasconde la striscia se non è del tipo filtrato
      s.hidden = filter !== "all" && s.dataset.type !== filter;
      if (!animate) s.classList.add("in");
    });
    // all'inizio le strisce entrano una dopo l'altra
    if (animate) strips.forEach((s, i) => setTimeout(() => s.classList.add("in"), reduce ? 0 : 120 + i * 70));
  }

  // i filtri: "Tutti" più un bottone per ogni tipo usato, col numero di progetti
  function renderFilters() {
    filters.innerHTML =
      `<button type="button" class="pl-chip${filter === "all" ? " is-on" : ""}" data-f="all">${L("Tutti", "All")} <i>${all.length}</i></button>` +
      used.map((k) => `<button type="button" class="pl-chip${filter === k ? " is-on" : ""}" data-f="${k}" style="--c:${TYPES[k].color}"><span class="pl-dot"></span>${esc(tr(TYPES[k], "label"))} <i>${all.filter((p) => p.type === k).length}</i></button>`).join("");
  }

  // Un solo ascoltatore per tutti i filtri: guardo quale bottone è stato cliccato (closest).
  // Si chiama "delegazione" e funziona anche dopo che i bottoni vengono riscritti.
  filters.addEventListener("click", (e) => {
    const b = e.target.closest(".pl-chip");
    if (!b) return;
    filter = b.dataset.f;
    filters.querySelectorAll(".pl-chip").forEach((c) => c.classList.toggle("is-on", c === b));
    let k = 0;
    strips.forEach((s) => {
      const show = filter === "all" || s.dataset.type === filter;
      s.classList.remove("open");
      s.hidden = !show;
      // quelle che restano rientrano una dopo l'altra
      // void s.offsetWidth costringe il browser a "ridisegnare" subito: così togliere e rimettere
      // la classe "in" fa ripartire l'animazione invece di essere ignorato
      if (show && !reduce) { s.classList.remove("in"); void s.offsetWidth; setTimeout(() => s.classList.add("in"), k++ * 60); }
    });
  });

  // sul telefono il primo tocco apre la striscia; quando è aperta i link funzionano
  if (touch) {
    acc.addEventListener("click", (e) => {
      const s = e.target.closest(".acc-strip");
      if (s && !s.classList.contains("open")) { e.preventDefault(); open(s); }
    });
  }

  renderFilters();
  render(true);
  addEventListener("langchange", () => { renderFilters(); render(false); });
})();
