// ───────────── Apertura e "Chi sono" (solo in home) ─────────────
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Gli screenshot dei progetti sparsi intorno al nome.
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
    // data-gravity: anche loro cadono col bottone rosso
    return `<div class="fl-float" data-gravity data-d="${s.d}"
                 style="--x:${s.x};--y:${s.y};--w:${s.w};--rot:${s.rot}deg">
              <img src="${escapeHtml(p.image)}" alt="" draggable="false">
            </div>`;
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

// La frase di "Chi sono" si accende parola per parola mentre scorri.
// Il testo viene da content/texts.js (data-i18n-words), così cambia con la lingua.
function updateStatement() {
  const el = document.getElementById("statement");
  if (!el) return;
  const words = el.querySelectorAll(".w");
  if (reduceMotion) { words.forEach((w) => w.classList.add("on")); return; }
  const r = el.getBoundingClientRect();
  const progress = (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35);
  const lit = Math.round(Math.max(0, Math.min(1, progress)) * words.length);
  words.forEach((w, i) => w.classList.toggle("on", i < lit));
}

function renderStatement() {
  const el = document.getElementById("statement");
  if (!el) return;
  el.innerHTML = t(el.dataset.i18nWords).split(/\s+/).map((w) => `<span class="w">${escapeHtml(w)}</span>`).join(" ");
  updateStatement();
}

function setupStatement() {
  if (!document.getElementById("statement")) return;
  addEventListener("scroll", updateStatement, { passive: true });
  addEventListener("resize", updateStatement);
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
    if (document.documentElement.classList.contains("gravity-active")) return;
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
