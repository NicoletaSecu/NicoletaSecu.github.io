// La scrivania della home: misure, lampada, oggetti che si allontanano scorrendo, occhi della polaroid.
// (La gravità del bottone rosso sta in gravity.js, i giochi con gli oggetti in toys.js.)

// Dimensioni della scrivania.
// Gli oggetti sono misurati in "--u" = 1% della larghezza della scrivania (2.2% su telefono).
// Così, se la scrivania si allarga o si stringe, tutti gli oggetti crescono o calano insieme.
// ResizeObserver avvisa ogni volta che la scrivania cambia misura, e io ricalcolo --u.
function setupDeskScale() {
  const desk = document.getElementById("desk");
  const update = () => {
    const pct = matchMedia("(max-width: 700px)").matches ? 2.2 : 1;
    desk.style.setProperty("--u", `${(desk.clientWidth * pct) / 100}px`);
  };
  new ResizeObserver(update).observe(desk);
  update();
}

// La lampada fa da interruttore del tema: cliccandola si passa da scuro a chiaro e viceversa
// (come il bottone in alto, e la scelta si ricorda allo stesso modo).
function setupLamp() {
  document.getElementById("lamp").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
}

// Gli oggetti della scrivania vanno via mentre scorri.
// Arrivando alla scrivania gli oggetti sono già al loro posto; quando la superi
// (il suo centro sale oltre il centro dello schermo) si allontanano, ruotano e sbiadiscono.
function setupDeskSpread() {
  const desk = document.getElementById("desk");
  if (!desk || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const objs = [...desk.querySelectorAll(":scope > .obj")];
  // ogni oggetto ha un po' di "carattere": c'è chi si allontana di più e chi ruota di più
  const mood = objs.map((_, i) => ({ k: 0.7 + ((i * 37) % 10) / 20, r: Math.sin(i * 5.3) }));

  // dirs = per ogni oggetto, la direzione dal centro della scrivania verso di lui
  // (un oggetto in alto a destra scappa verso l'alto a destra)
  let dirs = [];
  const measure = () => {
    const w = desk.clientWidth, h = desk.clientHeight;
    dirs = objs.map((o) => {
      const x = o.offsetLeft + o.offsetWidth / 2 - w / 2;
      const y = o.offsetTop + o.offsetHeight / 2 - h / 2;
      // divido per la lunghezza così ottengo solo la direzione (lunga 1), non la distanza
      const len = Math.hypot(x, y) || 1;
      return { x: x / len, y: y / len };
    });
  };
  measure();
  new ResizeObserver(() => { measure(); update(); }).observe(desk);

  // queued evita di ricalcolare più volte nello stesso fotogramma mentre scorri
  let queued = false;
  const update = () => {
    queued = false;
    const r = desk.getBoundingClientRect();
    // di quanto la scrivania è salita oltre il centro dello schermo (prima di arrivarci: 0)
    const past = (innerHeight / 2 - (r.top + r.height / 2)) / innerHeight;
    // a va da 0 (oggetti al loro posto) a 1 (oggetti lontani): parte quando hai superato un po' la scrivania
    const a = Math.max(0, Math.min(1, (past - 0.12) * 1.6));
    // su schermi stretti si allontanano di meno
    const reach = Math.min(260, innerWidth * 0.3);
    objs.forEach((o, i) => {
      if (o.classList.contains("falling")) return; // durante la gravità lo muove la fisica
      const d = dirs[i], m = mood[i];
      const dist = a * reach * m.k;
      o.style.translate = `${(d.x * dist).toFixed(1)}px ${(d.y * dist).toFixed(1)}px`;
      o.style.rotate = `${(m.r * a * 25).toFixed(1)}deg`;
      o.style.opacity = String(1 - a * 0.6);
    });
  };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

// La me della polaroid segue il cursore con gli occhi.
// Sposto le pupille di al massimo 1,6 unità del disegno verso il mouse; più il mouse è lontano,
// più guardano verso di lui (fino a 250 pixel di distanza, poi restano al massimo).
function setupDeskEyes() {
  const pol = document.querySelector("#desk .polaroid");
  if (!pol || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const svg = pol.querySelector("svg");
  // pupille e puntini di luce della faccia normale (quella stordita ha gli occhi a spirale)
  const eyes = [...svg.querySelectorAll(".face-calm .ink, .face-calm .eye-shine")];
  let target = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, running = false;
  addEventListener("pointermove", (e) => {
    const r = svg.getBoundingClientRect();
    if (!r.width) return;
    // il centro degli occhi nel disegno sta a metà larghezza e a poco meno di metà altezza
    const dx = e.clientX - (r.left + r.width * 0.5), dy = e.clientY - (r.top + r.height * 0.47);
    const d = Math.hypot(dx, dy) || 1, k = Math.min(d / 250, 1) * 1.6;
    target = { x: (dx / d) * k, y: (dy / d) * k };
    if (!running) { running = true; requestAnimationFrame(step); }
  });
  // a ogni fotogramma le pupille fanno il 20% della strada: si muovono morbide, non a scatti
  function step() {
    cur.x += (target.x - cur.x) * 0.2;
    cur.y += (target.y - cur.y) * 0.2;
    const t = `translate(${cur.x.toFixed(2)} ${cur.y.toFixed(2)})`;
    eyes.forEach((el) => el.setAttribute("transform", t));
    if (Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.01) requestAnimationFrame(step);
    else running = false;
  }
}

// avvio, solo se nella pagina c'è la scrivania
if (document.getElementById("desk")) {
  setupDeskScale();
  setupLamp();
  setupDeskSpread();
  setupDeskEyes();
}
