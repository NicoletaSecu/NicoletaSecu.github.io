// Il grafo dietro al nome, nell'apertura della home.
// Ogni screenshot è legato ai linguaggi e agli strumenti del suo progetto (il campo stack
// di content/projects.js); più progetti usano un linguaggio, più il suo punto è grande.
// Passando sopra a un punto si accendono in bordeaux lui, le sue linee e i progetti che lo
// usano, e accanto si scrive un po' del suo codice. Scorrendo, la rete va via come gli screenshot.

// Linguaggi e strumenti di ogni progetto, presi dal campo stack di content/projects.js.
const STACK = Object.fromEntries(PROJECTS.filter((p) => p.stack).map((p) => [p.title, p.stack]));

// Colori semplici per tutti i linguaggi: commenti, testi tra virgolette, tag HTML/JSX,
// proprietà CSS, parole chiave e numeri.
const CODE_TOKENS = new RegExp([
  /(\/\/.*$|#.*$)/.source,
  /("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)/.source,
  /(<\/?[A-Za-z][\w-]*|\/?>)/.source,
  /(^\s*[a-z-]+(?=:\s))/.source,
  /\b(function|const|let|return|if|not|for|def|raise|async|await|new|of|else|undefined|null|import|from)\b/.source,
  /\b(\d+(?:\.\d+)?(?:px|%)?)\b/.source,
].join("|"), "g");

const escCode = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function highlightCode(line) {
  let out = "", last = 0;
  line.replace(CODE_TOKENS, (m, com, str, tag, prop, kw, num, at) => {
    out += escCode(line.slice(last, at));
    const cls = com ? "c" : str ? "s" : tag ? "k" : prop ? "p" : kw ? "k" : "n";
    out += `<span class="${cls}">${escCode(m)}</span>`;
    last = at + m.length;
    return m;
  });
  return out + escCode(line.slice(last));
}

const CARET = '<span class="caret"></span>';
const TYPE_SPEED = () => 0.05 + Math.random() * 0.04; // lettere al millisecondo: circa 70 al secondo

// Cosa si scrive passando sopra a un linguaggio (nudge: ritocco della posizione, in pixel, come [destra, basso]; below: sotto il punto; belowShot: sotto lo screenshot di quel progetto): righe vere dei progetti, tranne Java e SQL
// che sono esempi (non ho il codice di Studio Java sul computer e FlowDegree usa SQLAlchemy).
const HOVER_CODE = {
  "JavaScript": { file: "airmath/js/app.js", below: true, code: String.raw`function extendStroke(x, y) {
  if (!current) return;
  const l = current[current.length - 1];
  if (Math.hypot(x - l.x, y - l.y) < 2) return;
  current.push({ x, y });
}` },
  "HTML": { file: "sync/index.html", code: String.raw`<div class="card hero">
  <div class="cycleday tnum" id="cycleDay">—</div>
  <div class="hero-sub" id="heroSub"></div>
  <button class="btn block" id="quickPeriod"></button>
</div>` },
  "CSS": { file: "portfolio/css/style.css", code: String.raw`.fl-float {
  position: absolute;
  width: var(--w);
  border-radius: 6px;
  overflow: hidden;
  cursor: grab;
}` },
  "Python": { file: "flowdegree/main.py", code: String.raw`def register(user, db):
    db_user = db.query(models.User).filter(
        models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400)
    return new_user` },
  "Java": { file: "esempio/Conto.java", nudge: [60, 0], code: String.raw`public class Conto {
  private int saldo;

  public void versa(int importo) {
    if (importo > 0) saldo += importo;
  }
}` },
  "SQL": { file: "esempio/esami.sql", belowShot: "Da B2 a C1", code: String.raw`SELECT name, cfu
FROM courses
WHERE user_id = 1
ORDER BY year, name;` },
};
// Terminale e git: punti senza progetto, con un loro "codice" (i comandi e quello che risponde il terminale).
// Le righe che iniziano con "$ " sono comandi e vengono scritte dopo il prompt.
Object.assign(HOVER_CODE, {
  "Terminale": { file: "terminale — zsh", term: true, code: `$ npm test
✗ avgCycle(): atteso 28, ottenuto 27.67
$ npm test
✓ avgCycle: 8 test passati` },
  "git commit": { file: "terminale — git", term: true, code: `$ git add .
$ git commit -m "Grafo animato"
[main 3f2a9c1] Grafo animato
 4 files changed, 212 insertions(+)` },
  "git push": { file: "terminale — git", term: true, nudge: [150, -120], code: `$ git push
Enumerating objects: 12, done.
Writing objects: 100% (7/7), done.
   37ff8c3..3f2a9c1  main -> main` },
});
// Dove stanno intorno al nome (angolo in radianti): vicini tra loro, in basso a sinistra.
const GIT_NODES = { "Terminale": 2.3, "git commit": 2.6, "git push": 2.9 };
// I linguaggi veri e propri; tutto il resto (librerie, framework, database) è uno strumento, più piccolo.
const LANGS = ["JavaScript", "HTML", "CSS", "Python", "Java", "SQL"];
// Ogni strumento è legato al suo linguaggio.
const TOOL_OF = { "React": "JavaScript", "Node.js": "JavaScript", "Matter.js": "JavaScript", "MediaPipe": "JavaScript", "FastAPI": "Python", "PostgreSQL": "SQL", "MongoDB": "Node.js" };

function setupGraph() {
  const canvas = document.getElementById("graph");
  if (!canvas) return;
  const hero = canvas.parentElement;
  const text = hero.querySelector(".fl-hero-text");
  const ctx = canvas.getContext("2d");
  const REACH = 60; // quanto vicino deve arrivare il mouse a un punto, in pixel
  let W = 0, H = 0, dpr = 1, nodes = [], links = [], colors = {};
  let mouse = { x: -9999, y: -9999 };
  let hover = null;

  // il riquadro di codice che si scrive accanto al linguaggio sotto al mouse (senza cornice, come nella prova del codice)
  const pop = document.createElement("div");
  pop.className = "graph-code";
  pop.innerHTML = '<div class="code-tab"></div><div class="code-body"></div>';
  // prima degli screenshot nella pagina, così il codice sta dietro a loro e al nome
  hero.insertBefore(pop, hero.querySelector(".fl-floats"));
  const popTab = pop.querySelector(".code-tab"), popBody = pop.querySelector(".code-body");
  let popFor = null, popText = "", popAt = 0, popTyped = 0;

  function showCode(nd) {
    const c = HOVER_CODE[nd.name];
    if (!c) return;
    popFor = nd; popText = c.code; popAt = 0; popTyped = 0;
    popTab.textContent = c.file;
    popBody.innerHTML = "";
    pop.classList.toggle("term", !!c.term);
    pop.classList.add("on");
    // accanto al punto: prova a destra, a sinistra, sopra e sotto, e prende il primo posto
    // che non copre il nome, la frase, gli screenshot e non esce dallo schermo
    const w = Math.min(300, W - 24);
    const h = c.code.split("\n").length * 21 + 34;
    pop.style.width = `${w}px`;
    const lab = nd.r + 12 + nd.name.length * 7;
    // tutti i posti possibili intorno al punto (a destra, a sinistra, sopra, sotto, più o meno in alto)
    const spots = [];
    for (const x of [nd.x + lab, nd.x - nd.r - 12 - w, nd.x - w / 2, nd.x - w * 0.2, nd.x - w * 0.8]) {
      for (const y of [nd.y - h - 90, nd.y - h - 40, nd.y - h - 16, nd.y - h * 0.6, nd.y - h * 0.3, nd.y - 12, nd.y + 18]) spots.push([x, y]);
    }
    const b = box();
    const rect = (el) => { const r = el.getBoundingClientRect(); return { l: r.left - b.left, r: r.right - b.left, t: r.top - b.top, b: r.bottom - b.top }; };
    const shots = [...hero.querySelectorAll(".fl-float")].filter((el) => el.offsetWidth).map(rect);
    const words = [text].map(rect);
    const inside = ([x, y]) => x >= 8 && x + w <= W - 8 && y >= 60 && y + h <= H - 30;
    const overlap = ([x, y], q) => Math.max(0, Math.min(x + w, q.r) - Math.max(x, q.l)) * Math.max(0, Math.min(y + h, q.b) - Math.max(y, q.t));
    // vale il posto che non copre il nome né la frase e che copre il meno possibile gli screenshot
    // (se ce n'è uno completamente libero, è quello); a parità, il primo della lista
    let best = null, bestCover = Infinity;
    for (const sp of spots) {
      if (!inside(sp) || words.some((q) => overlap(sp, { l: q.l - 6, r: q.r + 6, t: q.t - 6, b: q.b + 6 }) > 0)) continue;
      const cover = shots.reduce((sum, q) => sum + overlap(sp, q), 0);
      if (cover < bestCover) { best = sp; bestCover = cover; }
    }
    // below: il posto preferito è a destra del nome, un po' sotto il punto (di solito sotto lo screenshot).
    // Se a destra non c'è spazio, si sposta a sinistra quanto basta per restare nello schermo, ma resta sotto il punto;
    // lo si scarta solo se coprirebbe il nome o la frase.
    const under = [Math.max(8, Math.min(W - w - 8, nd.x + lab)), Math.min(H - h - 30, nd.y + 18)];
    const useUnder = c.below && !words.some((q) => overlap(under, { l: q.l - 6, r: q.r + 6, t: q.t - 6, b: q.b + 6 }) > 0);
    // belowShot: il codice sta sotto lo screenshot di quel progetto, con il bordo sinistro allineato all'immagine
    const shotEl = c.belowShot && hero.querySelector(`.fl-float[data-title="${c.belowShot}"]`);
    let underShot = null;
    if (shotEl && shotEl.offsetWidth) {
      const q = rect(shotEl);
      const sp = [Math.max(8, Math.min(W - w - 8, q.l)), q.b + 14];
      if (inside(sp) && !words.some((t) => overlap(sp, { l: t.l - 6, r: t.r + 6, t: t.t - 6, b: t.b + 6 }) > 0)) underShot = sp;
    }
    const [bx, by] = underShot || (useUnder ? under : best || spots[0]);
    // un ritocco a mano per i punti dove il posto scelto non piaceva: [spostamento a destra, spostamento in basso]
    const [nx, ny] = c.nudge || [0, 0];
    const px = bx + nx, py = by + ny;
    pop.style.left = `${Math.max(8, Math.min(W - w - 8, px))}px`;
    pop.style.top = `${Math.max(60, Math.min(H - h - 30, py))}px`;
    pop.style.rotate = `${(nd.x % 5) - 2}deg`;
  }
  function typeCode(dt) {
    if (!popFor || popAt >= popText.length) return;
    popTyped += dt * TYPE_SPEED() * 1.4;
    const add = Math.floor(popTyped);
    if (!add) return;
    popTyped -= add;
    popAt = Math.min(popText.length, popAt + add);
    const shown = popText.slice(0, popAt).split("\n");
    const term = HOVER_CODE[popFor.name].term;
    const body = (l) => {
      if (!term) return highlightCode(l);
      return l.startsWith("$ ") ? `<span class="prompt">~/progetti $</span> ${escCode(l.slice(2))}` : escCode(l);
    };
    popBody.innerHTML = shown.map((l, i) => `<div class="code-line"><span class="ln">${i + 1}</span><span class="tx">${body(l)}${i === shown.length - 1 && popAt < popText.length ? CARET : ""}</span></div>`).join("");
  }

  function readColors() {
    const st = getComputedStyle(document.documentElement);
    colors = {
      ink: st.getPropertyValue("--ink").trim() || "#1d1b18",
      muted: st.getPropertyValue("--muted").trim() || "#6b655c",
      accent: st.getPropertyValue("--accent").trim() || "#8c2f45",
    };
  }

  const box = () => hero.getBoundingClientRect();
  function centerOf(el) {
    const c = el.getBoundingClientRect(), b = box();
    return { x: c.left + c.width / 2 - b.left, y: c.top + c.height / 2 - b.top };
  }

  function build() {
    const r = box();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // i progetti sono gli screenshot che si vedono; ognuno porta i suoi linguaggi
    const shots = [...hero.querySelectorAll(".fl-float")].filter((el) => el.offsetWidth && STACK[el.dataset.title]);
    const used = new Map();
    shots.forEach((el) => STACK[el.dataset.title].forEach((name) => used.set(name, (used.get(name) || 0) + 1)));
    // uno strumento si porta dietro il suo linguaggio anche se nessuno screenshot lo usa direttamente
    for (const name of [...used.keys()]) {
      let up = TOOL_OF[name];
      while (up) { if (!used.has(up)) used.set(up, 0); up = TOOL_OF[up]; }
    }

    // i punti stanno in orbita intorno al nome: ognuno dal lato dei suoi progetti,
    // e i linguaggi usati ovunque (come JavaScript) dove c'è più spazio
    const tr = text.getBoundingClientRect();
    const ox = tr.left - r.left + tr.width / 2, oy = tr.top - r.top + tr.height / 2;
    const rx = Math.min(tr.width / 2 + 110, W / 2 - 60), ry = Math.min(tr.height / 2 + 80, H / 2 - 60);
    nodes = [...used.entries()].map(([name, count]) => {
      const mine = shots.filter((el) => STACK[el.dataset.title].includes(name)).map(centerOf);
      const mx = mine.reduce((s, p) => s + p.x - ox, 0), my = mine.reduce((s, p) => s + p.y - oy, 0);
      const lang = LANGS.includes(name);
      return { name, lang, count, angle: Math.atan2(my, mx || 0.001), ph: Math.random() * 6.28, sp: 0.2 + Math.random() * 0.25,
               r: lang ? 3 + count * 0.6 : 2.4 + count * 0.3, vx: 0, vy: 0 };
    }).concat(Object.entries(GIT_NODES).map(([name, angle]) => ({
      name, lang: false, count: 0, angle, ph: Math.random() * 6.28, sp: 0.2 + Math.random() * 0.25, r: 3.2, vx: 0, vy: 0,
    }))).sort((p, q) => p.angle - q.angle);
    // in ordine di lato, a distanza uguale lungo l'orbita (così le etichette non si pestano)
    const start = nodes.length ? nodes[0].angle : 0;
    nodes.forEach((nd, i) => {
      const ang = start + (i / nodes.length) * Math.PI * 2;
      nd.x = nd.hx = ox + Math.cos(ang) * rx;
      nd.y = nd.hy = oy + Math.sin(ang) * ry;
    });
    nodes.forEach((nd) => { keepOut(nd); nd.hx = nd.x; nd.hy = nd.y; });
    const at = (name) => nodes.findIndex((n) => n.name === name);
    links = [];
    shots.forEach((el) => STACK[el.dataset.title].forEach((name) => links.push({ el, b: at(name), len: 200 })));
    for (const [tool, lang] of Object.entries(TOOL_OF)) {
      if (at(tool) >= 0 && at(lang) >= 0) links.push({ a: at(tool), b: at(lang), len: 90 });
    }
    // terminale → git commit → git push, e il terminale è legato ai linguaggi che si lanciano da lì
    links.push({ a: at("Terminale"), b: at("git commit"), len: 80 }, { a: at("git commit"), b: at("git push"), len: 80 });
    for (const name of ["Python", "JavaScript"]) if (at(name) >= 0) links.push({ a: at("Terminale"), b: at(name), len: 160 });
    // e tanti punti piccoli senza nome, sparsi e legati ai vicini: la rete diventa più fitta
    const named = nodes.length;
    const extra = W < 700 ? 6 : 14;
    for (let i = 0; i < extra; i++) {
      const nd = { name: "", lang: false, filler: true, count: 0, r: 1.4 + Math.random() * 1.4,
                   x: Math.random() * W, y: 70 + Math.random() * (H - 120), vx: 0, vy: 0,
                   ph: Math.random() * 6.28, sp: 0.2 + Math.random() * 0.3 };
      keepOut(nd);
      nd.hx = nd.x; nd.hy = nd.y;
      // legato al punto più vicino tra quelli già messi, e a volte anche al secondo
      const near = nodes.map((o, j) => ({ j, d: Math.hypot(o.x - nd.x, o.y - nd.y) })).sort((p, q) => p.d - q.d);
      nodes.push(nd);
      if (!near.length) continue; // ancora nessun punto a cui legarsi
      const k = nodes.length - 1;
      links.push({ a: k, b: near[0].j, len: near[0].d });
      if (near[1] && Math.random() < 0.4) links.push({ a: k, b: near[1].j, len: near[1].d });
    }
    // anche qualche punto con il nome si lega al punto senza nome più vicino
    for (let i = 0; i < named; i++) {
      const nd = nodes[i];
      const near = nodes.slice(named).map((o, j) => ({ j: j + named, d: Math.hypot(o.x - nd.x, o.y - nd.y) })).sort((p, q) => p.d - q.d)[0];
      if (near) links.push({ a: i, b: near.j, len: near.d });
    }
  }

  // se un punto (con la sua etichetta) finisce sopra al nome, alla frase o a uno screenshot,
  // lo sposto sul bordo più vicino
  function keepOut(nd) {
    const b = box(), label = nd.r + 8 + nd.name.length * 7;
    // l'etichetta deve stare dentro lo schermo
    nd.x = Math.max(nd.r + 8, Math.min(W - label - 8, nd.x));
    for (const el of [text, ...hero.querySelectorAll(".fl-float")]) {
      if (!el.offsetWidth) continue;
      const c = el.getBoundingClientRect();
      const pad = el === text ? 24 : 10;
      const x0 = c.left - b.left - pad - label, x1 = c.right - b.left + pad;
      const y0 = c.top - b.top - pad, y1 = c.bottom - b.top + pad;
      if (nd.x < x0 || nd.x > x1 || nd.y < y0 || nd.y > y1) continue;
      const gaps = [[nd.x - x0, "x", x0], [x1 - nd.x, "x", x1], [nd.y - y0, "y", y0], [y1 - nd.y, "y", y1]];
      const [, axis, edge] = gaps.sort((p, q) => p[0] - q[0])[0];
      nd[axis] = edge;
      nd[axis === "x" ? "vx" : "vy"] = 0;
    }
    // l'etichetta resta sempre dentro lo schermo, anche dopo essere stata spostata fuori da un ostacolo
    nd.x = Math.max(nd.r + 8, Math.min(W - label - 8, nd.x));
  }

  function step(time, dt) {
    const t = time / 1000;
    for (const nd of nodes) {
      // ogni punto gira piano intorno al suo posto
      nd.vx += (nd.hx + Math.cos(t * nd.sp + nd.ph) * 16 - nd.x) * 0.01;
      nd.vy += (nd.hy + Math.sin(t * nd.sp * 1.3 + nd.ph) * 12 - nd.y) * 0.01;
      // i punti si tengono a distanza tra loro
      for (const o of nodes) {
        if (o === nd) continue;
        const dx = nd.x - o.x, dy = nd.y - o.y, d = Math.hypot(dx, dy) || 1;
        const room = nd.filler || o.filler ? 40 : 70;
        if (d < room) { nd.vx += (dx / d) * (room - d) * 0.01; nd.vy += (dy / d) * (room - d) * 0.01; }
      }
      // il mouse li spinge un po' via
      const mx = nd.x - mouse.x, my = nd.y - mouse.y, md = Math.hypot(mx, my);
      if (md < 110 && md > 0.1) { nd.vx += (mx / md) * (1 - md / 110) * 0.5; nd.vy += (my / md) * (1 - md / 110) * 0.5; }
      // e dentro lo schermo
      nd.vx += (Math.max(40, Math.min(W - 40, nd.x)) - nd.x) * 0.05;
      nd.vy += (Math.max(70, Math.min(H - 50, nd.y)) - nd.y) * 0.05;
    }
    for (const l of links) {
      const a = l.el ? centerOf(l.el) : nodes[l.a], nb = nodes[l.b];
      const dx = nb.x - a.x, dy = nb.y - a.y, d = Math.hypot(dx, dy) || 1;
      const f = (d - l.len) * 0.0002;
      nb.vx -= (dx / d) * f; nb.vy -= (dy / d) * f;
      if (!l.el) { a.vx += (dx / d) * f; a.vy += (dy / d) * f; }
    }
    for (const nd of nodes) {
      nd.vx *= 0.88; nd.vy *= 0.88;
      nd.x += nd.vx; nd.y += nd.vy;
      keepOut(nd);
    }
    // il punto sotto al mouse
    hover = null;
    let best = REACH;
    for (const nd of nodes) {
      if (!nd.name) continue; // i punti senza nome non si "prendono"
      const d = Math.hypot(nd.x - mouse.x, nd.y - mouse.y) - nd.r;
      if (d < best) { best = d; hover = nd; }
    }
    // passando sopra a un linguaggio si scrive il suo codice; uscendo il riquadro sfuma
    if (hover && HOVER_CODE[hover.name] && hover !== popFor) showCode(hover);
    if ((!hover || !HOVER_CODE[hover.name]) && popFor) { popFor = null; pop.classList.remove("on"); }
    typeCode(dt);
  }

  // un collegamento è acceso se tocca il punto sotto al mouse
  const litLink = (l) => hover && (nodes[l.b] === hover || (!l.el && nodes[l.a] === hover));
  const litShots = () => new Set(links.filter((l) => l.el && litLink(l)).map((l) => l.el));


  // Scorrendo, il grafo "va via" come gli screenshot: si allarga dal centro dell'apertura.
  // Il disegno si ingrandisce intorno al centro; gli screenshot si spostano già da soli,
  // quindi le loro coordinate vanno riportate indietro (unscale) prima di disegnare.
  function scrollZoom() {
    const k = 1 + Math.min(scrollY, innerHeight) * 0.35 / 450;
    const cx = W / 2, cy = H / 2;
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * cx * (1 - k), dpr * cy * (1 - k));
    ctx.lineWidth = 1 / k;
    return (p) => ({ x: cx + (p.x - cx) / k, y: cy + (p.y - cy) / k });
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const unscale = scrollZoom();
    for (const l of links) {
      const a = l.el ? unscale(centerOf(l.el)) : nodes[l.a], nb = nodes[l.b];
      const lit = litLink(l);
      ctx.strokeStyle = lit ? colors.accent : colors.ink;
      ctx.globalAlpha = lit ? 0.7 : hover ? 0.06 : 0.14;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(nb.x, nb.y); ctx.stroke();
    }
    const near = hover ? new Set(links.filter(litLink).filter((l) => !l.el).flatMap((l) => [nodes[l.a], nodes[l.b]])) : new Set();
    for (const nd of nodes) {
      const lit = nd === hover || near.has(nd);
      ctx.globalAlpha = hover && !lit ? 0.35 : nd.filler && !lit ? 0.5 : 1;
      ctx.fillStyle = lit ? colors.accent : nd.lang ? colors.ink : colors.muted;
      ctx.beginPath(); ctx.arc(nd.x, nd.y, nd === hover ? nd.r + 1.5 : nd.r, 0, 6.29); ctx.fill();
      if (!nd.name) continue;
      // il nome accanto al punto
      ctx.font = `${nd.lang ? 500 : 400} ${nd.lang ? 13 : 11.5}px "Inter Tight", system-ui, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillText(nd.name, nd.x + nd.r + 6, nd.y);
    }
    ctx.globalAlpha = 1;
    // i progetti che usano il punto sotto al mouse si fanno avanti
    const on = litShots();
    hero.querySelectorAll(".fl-float").forEach((el) => el.classList.toggle("graph-lit", on.has(el)));
  }

  readColors();
  build();
  if (reduceMotion) { draw(); return; }

  addEventListener("pointermove", (e) => {
    const r = box();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  document.addEventListener("pointerleave", () => { mouse = { x: -9999, y: -9999 }; });
  let lastW = innerWidth;
  addEventListener("resize", () => { if (innerWidth !== lastW) { lastW = innerWidth; build(); } });
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  let lastT = performance.now();
  const frame = (time) => {
    const dt = Math.min(time - lastT, 100);
    lastT = time;
    if (box().bottom > 0) { step(time, dt); draw(); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
