// ───────────── Apertura e "Chi sono" (solo in home) ─────────────
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Gli screenshot dei progetti sparsi intorno al nome (cliccandoli si apre il progetto).
// x, y = posizione; w = larghezza; d = quanto si muovono (più è alto, più sembrano vicini)
const FLOAT_SPOTS = [
  { x: "5%",  y: "16%", w: "17vw", rot: -4, d: 1.2 },
  { x: "74%", y: "12%", w: "19vw", rot: 3,  d: 0.8 },
  { x: "79%", y: "60%", w: "15vw", rot: -2, d: 1.4 },
  { x: "7%",  y: "66%", w: "16vw", rot: 2,  d: 0.9 },
  { x: "33%", y: "6%",  w: "11vw", rot: 5,  d: 0.6 },
  { x: "56%", y: "79%", w: "12vw", rot: -6, d: 1.1 },
];

function setupFloats() {
  const box = document.getElementById("floats");
  if (!box) return;
  const withImages = sortedProjects().filter((p) => p.image);
  box.innerHTML = FLOAT_SPOTS.map((s, i) => {
    const p = withImages[i % withImages.length];
    // ogni immagine apre il suo progetto; data-gravity: anche loro cadono col bottone rosso
    return `<a class="fl-float" href="${escapeHtml(p.link || p.repo || "progetti.html")}" target="_blank" rel="noopener"
               aria-label="${escapeHtml(pick(p, "title"))}" data-gravity data-d="${s.d}"
               style="--x:${s.x};--y:${s.y};--w:${s.w};--rot:${s.rot}deg">
              <img src="${escapeHtml(p.image)}" alt="" draggable="false">
            </a>`;
  }).join("");
  if (reduceMotion) return;

  const floats = [...box.children];
  let mx = 0, my = 0; // mouse, da -0.5 a 0.5
  let cx = 0, cy = 0; // gli stessi valori, inseguiti con morbidezza
  addEventListener("pointermove", (e) => {
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
  });

  const frame = () => {
    // mentre la gravità è attiva, sono gli oggetti a muoversi da soli
    if (!document.documentElement.classList.contains("gravity-active")) {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      const spread = Math.min(scrollY, innerHeight) * 0.35; // scorrendo si allontanano dal centro
      for (const el of floats) {
        const d = +el.dataset.d;
        const r = el.getBoundingClientRect();
        const dirX = Math.sign(r.left + r.width / 2 - innerWidth / 2) || 1;
        const dirY = Math.sign(r.top + scrollY + r.height / 2 - innerHeight / 2) || 1;
        const x = -cx * 40 * d + dirX * spread * d * 0.6;
        const y = -cy * 30 * d + dirY * spread * d * 0.4;
        el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// ───────────── Testi che si accendono parola per parola ─────────────
// Avvolge ogni parola dei testi (anche quelle dentro i link) in <span class="w">.
function wrapWords(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  for (const node of texts) {
    if (!node.textContent.trim()) continue;
    const frag = document.createDocumentFragment();
    for (const part of node.textContent.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); continue; }
      const w = document.createElement("span");
      w.className = "w";
      w.textContent = part;
      frag.appendChild(w);
    }
    node.replaceWith(frag);
  }
  return [...root.querySelectorAll(".w")];
}

// La frase grande di "Chi sono" si accende da sola, una parola alla volta,
// appena compare sullo schermo (senza bisogno di scorrere).
// Il testo viene da content/texts.js (data-i18n-words), così cambia con la lingua.
let statementPlayed = false;
let statementTimer = null;

function renderStatement() {
  const el = document.getElementById("statement");
  if (!el) return;
  el.textContent = t(el.dataset.i18nWords);
  const words = wrapWords(el);
  // dopo un cambio di lingua (o se le animazioni sono ridotte) la frase è già tutta accesa
  if (statementPlayed || reduceMotion) words.forEach((w) => w.classList.add("on"));
}

function playStatement() {
  if (statementPlayed) return;
  statementPlayed = true;
  const words = [...document.querySelectorAll("#statement .w")];
  let i = 0;
  clearInterval(statementTimer);
  statementTimer = setInterval(() => {
    if (i < words.length) words[i++].classList.add("on");
    else clearInterval(statementTimer);
  }, 110);
}

function setupStatement() {
  const el = document.getElementById("statement");
  if (!el || reduceMotion) return;
  // se è già sullo schermo all'apertura della pagina, parte subito
  const r = el.getBoundingClientRect();
  if (r.top < innerHeight && r.bottom > 0) { setTimeout(playStatement, 500); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); setTimeout(playStatement, 350); }
  }, { threshold: 0.3 });
  io.observe(el);
}

// I blocchi con data-reveal (es. "Insegno / Programmo") si accendono parola per parola
// mentre scorri: più scendi, più parole si accendono.
let revealBlocks = [];

function renderReveal() {
  revealBlocks = [...document.querySelectorAll("[data-reveal]")].map((el) => ({ el, words: wrapWords(el) }));
  updateReveal();
}

function updateReveal() {
  for (const { el, words } of revealBlocks) {
    if (reduceMotion) { words.forEach((w) => w.classList.add("on")); continue; }
    const r = el.getBoundingClientRect();
    const progress = (innerHeight * 0.9 - r.top) / (r.height + innerHeight * 0.3);
    const lit = Math.round(Math.max(0, Math.min(1, progress)) * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < lit));
  }
}

function setupReveal() {
  if (!document.querySelector("[data-reveal]")) return;
  addEventListener("scroll", updateReveal, { passive: true });
  addEventListener("resize", updateReveal);
}

// ───────────── Il nome si sparpaglia mentre scorri ─────────────
// Ogni lettera di "Nicoleta Secu" si allontana dal centro, ruota un po' e sbiadisce,
// come gli screenshot intorno. Tornando su, le lettere si rimettono a posto.
function setupNameSpread() {
  const name = document.querySelector(".fl-name");
  if (!name || reduceMotion) return;

  // divido il nome in lettere, tenendo l'a capo
  const parts = [...name.childNodes].map((n) => n.nodeType === 3
    ? [...n.textContent].map((ch) => (/\s/.test(ch) ? ch : `<span class="ch">${escapeHtml(ch)}</span>`)).join("")
    : n.outerHTML);
  name.innerHTML = parts.join("");
  const letters = [...name.querySelectorAll(".ch")];
  // ogni lettera ha la sua direzione "a caso", ma sempre la stessa
  const rnd = letters.map((_, i) => ({ y: Math.sin(i * 12.9898) * 0.5, r: Math.cos(i * 78.233) }));

  let base = [];
  const measure = () => {
    letters.forEach((l) => { l.style.translate = ""; l.style.rotate = ""; });
    const nr = name.getBoundingClientRect();
    const cx = nr.left + nr.width / 2, cy = nr.top + nr.height / 2;
    base = letters.map((l) => {
      const r = l.getBoundingClientRect();
      return { x: r.left + r.width / 2 - cx, y: r.top + r.height / 2 - cy };
    });
  };
  measure();
  addEventListener("resize", () => { measure(); update(); });

  let queued = false;
  const update = () => {
    queued = false;
    // (anche durante la gravità: si muovono solo le lettere dentro il nome, non il nome stesso)
    const s = Math.max(0, Math.min(1, scrollY / (innerHeight * 0.8))); // 0 = in cima, 1 = sparpagliato
    letters.forEach((l, i) => {
      const b = base[i];
      const x = b.x * s * 0.9;
      const y = b.y * s * 0.9 + rnd[i].y * s * 220;
      l.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      l.style.rotate = `${(rnd[i].r * s * 30).toFixed(1)}deg`;
    });
    name.style.opacity = String(1 - s * 0.75);
  };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}
