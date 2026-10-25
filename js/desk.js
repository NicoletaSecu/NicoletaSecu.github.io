// ───────────── Dimensioni della scrivania ─────────────
// Gli oggetti sono misurati in "--u" = 1% della larghezza della scrivania (2.2% su telefono).
function setupDeskScale() {
  const desk = document.getElementById("desk");
  const update = () => {
    const pct = matchMedia("(max-width: 700px)").matches ? 2.2 : 1;
    desk.style.setProperty("--u", `${(desk.clientWidth * pct) / 100}px`);
  };
  new ResizeObserver(update).observe(desk);
  update();
}

// ───────────── Lampada = tema giorno/notte ─────────────
function setupLamp() {
  document.getElementById("lamp").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
}

// ───────────── La scrivania si "monta" mentre scorri ─────────────
// Quando la scrivania entra nello schermo gli oggetti arrivano da fuori e si ricompongono;
// quando è al centro sono tutti al loro posto; scorrendo oltre si allontanano di nuovo.
function setupDeskSpread() {
  const desk = document.getElementById("desk");
  if (!desk || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const objs = [...desk.querySelectorAll(":scope > .obj")];
  // ogni oggetto ha un po' di "carattere": c'è chi si allontana di più e chi ruota di più
  const mood = objs.map((_, i) => ({ k: 0.7 + ((i * 37) % 10) / 20, r: Math.sin(i * 5.3) }));

  let dirs = [];
  const measure = () => {
    const w = desk.clientWidth, h = desk.clientHeight;
    dirs = objs.map((o) => {
      const x = o.offsetLeft + o.offsetWidth / 2 - w / 2;
      const y = o.offsetTop + o.offsetHeight / 2 - h / 2;
      const len = Math.hypot(x, y) || 1;
      return { x: x / len, y: y / len };
    });
  };
  measure();
  new ResizeObserver(() => { measure(); update(); }).observe(desk);

  let queued = false;
  const update = () => {
    queued = false;
    if (document.documentElement.classList.contains("gravity-active")) return;
    const r = desk.getBoundingClientRect();
    // quanto è lontana la scrivania dal centro dello schermo (0 = al centro)
    const off = Math.abs(r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    const a = Math.max(0, Math.min(1, (off - 0.12) * 1.6));
    objs.forEach((o, i) => {
      const d = dirs[i], m = mood[i];
      const dist = a * 260 * m.k;
      o.style.translate = `${(d.x * dist).toFixed(1)}px ${(d.y * dist).toFixed(1)}px`;
      o.style.rotate = `${(m.r * a * 25).toFixed(1)}deg`;
      o.style.opacity = String(1 - a * 0.6);
    });
  };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}
