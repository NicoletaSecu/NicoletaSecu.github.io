// ───────────── Gravità ─────────────
// Il bottone rosso fa cadere gli elementi con data-gravity visibili sullo schermo.
// Si possono afferrare e lanciare; se ne scuoti uno succede qualcosa (vedi toys.js).
// Al loro posto resta una copia invisibile, così la pagina non si sposta.
const Gravity = (() => {
  let engine = null;
  let raf = 0;
  let items = [];
  let drag = null;
  let active = false;
  let cleanups = [];
  const restoreBtn = document.getElementById("restore");

  // Quante volte devi cambiare direzione, e in quanto tempo, perché conti come "scuotere".
  const SHAKE_FLIPS = 4;
  const SHAKE_WINDOW_MS = 900;
  const SHAKE_MIN_STEP_PX = 6;
  const SHAKE_COOLDOWN_MS = 1500;

  function addItem(el, body, w, h, extra = {}) {
    const it = { el, body, w, h, ...extra };
    el.classList.add("falling");
    el.addEventListener("pointerdown", onDown);
    Matter.Composite.add(engine.world, body);
    items.push(it);
    return it;
  }

  // Strumenti che toys.js usa per far succedere le cose.
  const api = {
    // Aggiunge un oggetto nuovo (un foglio, una goccia…) che esiste solo finché dura la gravità.
    spawn(el, body, w, h) {
      el.style.cssText += `;position:fixed;left:0;top:0;width:${w}px;height:${h}px;touch-action:none;`;
      document.body.appendChild(el);
      return addItem(el, body, w, h, { spawned: true });
    },
    // Fa vibrare un oggetto per un po'.
    buzz(it, ms) { it.buzzUntil = performance.now() + ms; Matter.Sleeping.set(it.body, false); },
    // Toglie un oggetto creato con spawn (es. una goccia che si è asciugata).
    remove(it) {
      if (!engine || !items.includes(it)) return; // la gravità è già finita
      Matter.Composite.remove(engine.world, it.body);
      it.el.remove();
      items = items.filter((i) => i !== it);
    },
    // Tutti gli oggetti che stanno cadendo.
    items: () => items,
    // L'oggetto che stai tenendo in mano (o null).
    held: () => (drag ? drag.it : null),
    // Cambia il suggerimento in basso (chiave di content/texts.js).
    hint(key) { hintEl.textContent = t(key); },
    // Cosa rimettere a posto quando la gravità finisce.
    onStop(fn) { cleanups.push(fn); },
    // Rimette tutto a posto (come il bottone "Rimetti tutto a posto").
    stop: () => stop(),
  };
  const hintEl = document.querySelector(".shake-hint");

  function start() {
    if (active || !window.Matter) return;
    const { Engine, Bodies, Composite, Body } = Matter;
    const W = innerWidth, H = innerHeight, T = 400;

    const els = [...document.querySelectorAll("[data-gravity]")].filter((el) => {
      if (el.parentElement.closest("[data-gravity]")) return false;
      const r = el.getBoundingClientRect();
      return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < H && r.right > 0 && r.left < W;
    });
    if (!els.length) return;

    active = true;
    // enableSleeping: gli oggetti fermi "si addormentano" e smettono di tremare
    // (es. il quaderno con sopra la matita); più iterazioni = contatti più stabili
    engine = Engine.create({ gravity: { y: 1.1 }, enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, H + T / 2, W + 2 * T, T, { isStatic: true }), // pavimento
      Bodies.rectangle(-T / 2, H / 2, T, H * 6, { isStatic: true }),         // muro sinistro
      Bodies.rectangle(W + T / 2, H / 2, T, H * 6, { isStatic: true }),      // muro destro
      Bodies.rectangle(W / 2, -2 * H - T / 2, W + 2 * T, T, { isStatic: true }), // soffitto (molto in alto)
    ]);

    // Prima misuro tutto, poi sposto: così le misure non si influenzano a vicenda.
    const measured = els.map((el) => ({
      el,
      r: el.getBoundingClientRect(),
      w: el.offsetWidth,
      h: el.offsetHeight,
      rot: parseFloat(getComputedStyle(el).getPropertyValue("--rot")) || 0,
    }));

    for (const m of measured) {
      const ph = m.el.cloneNode(true);
      ph.removeAttribute("data-gravity");
      ph.removeAttribute("id");
      ph.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
      ph.style.visibility = "hidden";
      ph.setAttribute("aria-hidden", "true");
      ph.inert = true;
      m.el.before(ph);

      // oggetti lunghi e sottili (la matita) con i bordi dritti: arrotondati farebbero da perno
      // e ciò che ci finisce sopra continuerebbe a dondolare
      const thin = Math.max(m.w, m.h) / Math.min(m.w, m.h) > 5;
      const body = Bodies.rectangle(m.r.left + m.r.width / 2, m.r.top + m.r.height / 2, m.w, m.h, {
        angle: (m.rot * Math.PI) / 180,
        restitution: 0.2,     // rimbalzano poco
        friction: 0.7,        // e scivolano poco
        frictionStatic: 1,
        frictionAir: 0.02,    // un po' di freno, così si fermano invece di dondolare
        chamfer: thin ? undefined : { radius: Math.min(m.w, m.h) * 0.12 },
      });
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);

      const saved = m.el.getAttribute("style");
      m.el.style.cssText = (saved || "") +
        `;position:fixed;left:0;top:0;right:auto;bottom:auto;margin:0;translate:none;rotate:none;opacity:1;` +
        `width:${m.w}px;height:${m.h}px;transition:none;touch-action:none;`;
      addItem(m.el, body, m.w, m.h, { ph, saved });
    }

    document.documentElement.classList.add("gravity-active");
    restoreBtn.hidden = false;
    raf = requestAnimationFrame(tick);
  }

  function tick() {
    if (!engine) return; // la gravità è appena finita: niente da muovere
    const now = performance.now();
    for (const it of items) {
      if (it.buzzUntil > now) {
        const f = 0.006 * it.body.mass;
        Matter.Sleeping.set(it.body, false);
        Matter.Body.applyForce(it.body, it.body.position, { x: (Math.random() - 0.5) * f, y: (Math.random() - 0.7) * f });
      }
    }
    Matter.Engine.update(engine, 1000 / 60);
    for (const it of items) {
      const { x, y } = it.body.position;
      it.el.style.transform = `translate(${x - it.w / 2}px, ${y - it.h / 2}px) rotate(${it.body.angle}rad)`;
    }
    if (drag) Toys.whileHeld(drag.it, api);
    Toys.tick(api);
    raf = requestAnimationFrame(tick);
  }

  function onDown(e) {
    const it = items.find((i) => i.el === e.currentTarget);
    if (!it) return;
    e.preventDefault();
    Matter.Sleeping.set(it.body, false); // quando lo afferri si sveglia
    Toys.grab(it);
    Toys.played(api, 1); // ogni oggetto afferrato conta come "gioco"
    const b = it.body;
    const p = { x: e.clientX, y: e.clientY };
    // Alcuni oggetti si prendono da un punto preciso (la matita per la punta).
    const grip = Toys.grip(it);
    const constraint = Matter.Constraint.create({
      pointA: p,
      bodyB: b,
      pointB: grip || { x: p.x - b.position.x, y: p.y - b.position.y },
      stiffness: grip ? 0.5 : 0.12,
      damping: 0.08,
      length: 0,
    });
    Matter.Composite.add(engine.world, constraint);
    drag = { it, constraint, lastX: p.x, lastY: p.y, dirX: 0, dirY: 0, flips: [] };
  }

  function onMove(e) {
    if (!drag) return;
    drag.constraint.pointA = { x: e.clientX, y: e.clientY };
    detectShake(e.clientX, e.clientY);
  }

  // Scuotere = cambiare direzione molte volte in poco tempo mentre tieni un oggetto.
  function detectShake(x, y) {
    const now = performance.now();
    const dx = x - drag.lastX;
    const dy = y - drag.lastY;
    if (Math.abs(dx) > SHAKE_MIN_STEP_PX) {
      const dir = Math.sign(dx);
      if (drag.dirX && dir !== drag.dirX) drag.flips.push(now);
      drag.dirX = dir;
      drag.lastX = x;
    }
    if (Math.abs(dy) > SHAKE_MIN_STEP_PX) {
      const dir = Math.sign(dy);
      if (drag.dirY && dir !== drag.dirY) drag.flips.push(now);
      drag.dirY = dir;
      drag.lastY = y;
    }
    drag.flips = drag.flips.filter((tm) => now - tm < SHAKE_WINDOW_MS);
    const it = drag.it;
    if (drag.flips.length >= SHAKE_FLIPS && now - (it.lastShake || 0) > SHAKE_COOLDOWN_MS) {
      it.lastShake = now;
      drag.flips = [];
      Toys.played(api, 3); // scuotere conta di più
      Toys.shake(it, api);
    }
  }

  function onUp() {
    if (!drag) return;
    Matter.Composite.remove(engine.world, drag.constraint);
    Toys.release(drag.it);
    drag = null;
  }

  function stop() {
    if (!active) return;
    cancelAnimationFrame(raf);
    onUp();
    cleanups.forEach((fn) => fn());
    cleanups = [];
    for (const it of items) {
      if (it.spawned) { it.el.remove(); continue; }
      it.el.removeEventListener("pointerdown", onDown);
      if (it.saved === null) it.el.removeAttribute("style");
      else it.el.setAttribute("style", it.saved);
      it.el.classList.remove("falling");
      it.ph.remove();
      it.el.classList.add("settle");
      setTimeout(() => it.el.classList.remove("settle"), 600);
    }
    items = [];
    Matter.Engine.clear(engine);
    engine = null;
    active = false;
    api.hint("gravity.hint");
    document.documentElement.classList.remove("gravity-active");
    restoreBtn.hidden = true;
    // gli effetti di scorrimento (nome, scrivania) si rimettono in pari con la posizione attuale
    dispatchEvent(new Event("scroll"));
  }

  // Mentre la gravità è attiva, gli oggetti si lanciano: niente clic sui link.
  document.addEventListener("click", (e) => {
    if (active && e.target.closest(".falling")) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  addEventListener("pointermove", onMove);
  addEventListener("pointerup", onUp);
  addEventListener("pointercancel", onUp);
  addEventListener("keydown", (e) => { if (e.key === "Escape") stop(); });
  let lastW = innerWidth;
  addEventListener("resize", () => { if (innerWidth !== lastW) { lastW = innerWidth; stop(); } });

  restoreBtn.addEventListener("click", stop);
  document.getElementById("gravityDesk").addEventListener("click", start);

  return { start, stop };
})();
