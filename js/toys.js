// Giochi con gli oggetti caduti (dopo aver premuto il bottone rosso "NON PREMERE").
// Mentre la gravità è attiva, afferra un oggetto e scuotilo:
//   quaderno → perde i fogli
//   lampada  → la luce lampeggia per qualche secondo
//   tazza    → il caffè si rovescia sulla scrivania
//   telefono → squilla e vibra (se lo lanci in aria e ricade forte, lo schermo si crepa e non va più)
//   polaroid → il ritratto si scompiglia i capelli
//   tutto il resto → trema un po'
// La matita invece si prende per la punta: passala sui fogli caduti per scriverci sopra.
// Un foglio tenuto sopra il caffè rovesciato si inzuppa e, se lo lasci lì, si appiccica.
// Chi gioca troppo si becca una finta schermata di errore ("Troppo divertimento.").
//
// Come funziona: la fisica (cadere, urtarsi, rimbalzare) la fa gravity.js con la libreria Matter.js.
// Ogni oggetto che cade è un "it" (item) con dentro: el = l'elemento HTML, body = il corpo fisico,
// w e h = larghezza e altezza. gravity.js chiama le funzioni di questo file nei momenti giusti
// (quando afferri, scuoti, lasci un oggetto, e a ogni fotogramma con tick), passando "api":
// un insieme di strumenti per creare oggetti nuovi, farli tremare, cambiare il suggerimento in basso…
//
// Toys = (() => { ... })() è una funzione che si chiama da sola e restituisce solo le funzioni
// che servono fuori (le trovi nel return in fondo); tutto il resto resta privato qui dentro.
const Toys = (() => {
  // un numero a caso tra a e b
  const rand = (a, b) => a + Math.random() * (b - a);
  // In Matter.js gli oggetti con lo stesso "gruppo" negativo non si urtano tra loro:
  // lo uso per fogli, gocce e matita, che devono passarsi sopra invece di spingersi
  const NO_COLLIDE = -7;
  const INK = "#2b2620"; // il colore della matita

  // Quaderno: escono dei fogli che scendono piano, come carta vera.
  // Ne ha 14 in tutto; ogni scossone ne fa uscire da 4 a 6. Finiti i fogli, il quaderno trema e basta.
  function notebook(it, api) {
    it.pagesLeft ??= 14; // ??= vuol dire "se non c'è ancora un valore, metti 14"
    const n = Math.min(it.pagesLeft, Math.round(rand(4, 6)));
    if (!n) { api.buzz(it, 400); return; }
    it.pagesLeft -= n;
    it.body.collisionFilter.group = NO_COLLIDE;

    const w = it.w * 0.78;
    const h = it.h * 0.85;
    // dpr: sugli schermi Retina un pixel CSS sono 2 pixel veri; disegno al doppio così la matita è nitida
    const dpr = window.devicePixelRatio || 1;
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      el.className = "loose-page";
      el.setAttribute("aria-hidden", "true");
      // ogni foglio ha una tela su cui la matita può scrivere
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      el.appendChild(canvas);

      // il corpo fisico del foglio: leggero (density bassa) e frenato dall'aria (frictionAir alta),
      // così scende piano e ondeggiando, invece di cadere come un sasso
      const body = Matter.Bodies.rectangle(
        it.body.position.x + rand(-10, 10),
        it.body.position.y + rand(-10, 10),
        w, h,
        {
          angle: it.body.angle + rand(-0.5, 0.5),
          density: 0.0003,
          frictionAir: 0.07,
          friction: 0.8,
          restitution: 0.1,
          collisionFilter: { group: NO_COLLIDE },
        },
      );
      // una spinta iniziale a caso, un po' verso l'alto (y negativa = su)
      Matter.Body.setVelocity(body, { x: rand(-9, 9), y: rand(-12, -3) });
      Matter.Body.setAngularVelocity(body, rand(-0.2, 0.2));
      const page = api.spawn(el, body, w, h);
      page.ctx = ctx;
    }

    // la matita passa sopra ai fogli senza spingerli via
    const pencilItem = api.items().find((i) => i.el.classList.contains("pencil"));
    if (pencilItem) pencilItem.body.collisionFilter.group = NO_COLLIDE;
    if (puddles.length) api.hint("gravity.soakHint");
    else if (pencilItem) api.hint("gravity.pencilHint");
  }

  // Fogli + caffè: un foglio sopra la macchia si inzuppa e si appiccica.
  let puddles = []; // le pozze di caffè sulla scrivania, in coordinate dello schermo
  const SOAK_TO_STICK = 40; // quanti fotogrammi sopra il caffè prima di appiccicarsi
  const SOAK_MAX = 160;     // oltre questo il foglio è zuppo e non si scurisce più
  // quanto caffè assorbe un foglio a ogni fotogramma: la pozza grande dura ~5 secondi di contatto
  const ABSORB_MAIN = 0.003;
  const ABSORB_SMALL = 0.012;

  // la pozza si restringe e si schiarisce man mano che il caffè viene assorbito
  function drain(p) {
    p.amount = Math.max(0, p.amount - (p.main ? ABSORB_MAIN : ABSORB_SMALL));
    p.el.style.scale = String(0.45 + 0.55 * p.amount);
    p.el.style.opacity = String(0.15 + 0.85 * p.amount);
    if (p.amount === 0) {
      p.el.style.transition = "opacity 0.5s";
      p.el.style.opacity = "0";
    }
  }

  // Dove cade un punto dello schermo sul foglio (coordinate del foglio, da 0 a w/h).
  // Il foglio può essere ruotato: con coseno e seno "raddrizzo" il punto nel sistema del foglio.
  function toPage(page, x, y) {
    const dx = x - page.body.position.x;
    const dy = y - page.body.position.y;
    const c = Math.cos(-page.body.angle);
    const s = Math.sin(-page.body.angle);
    return { x: dx * c - dy * s + page.w / 2, y: dx * s + dy * c + page.h / 2 };
  }

  // più caffè c'è nella pozza, più il foglio si macchia in fretta
  function stain(page, pt, radius, amount) {
    const ctx = page.ctx;
    const g = ctx.createRadialGradient(pt.x, pt.y, radius * 0.2, pt.x, pt.y, radius);
    g.addColorStop(0, `rgba(140, 90, 45, ${0.05 * amount})`);
    g.addColorStop(0.85, `rgba(110, 65, 30, ${0.08 * amount})`); // bordo più scuro, come una macchia vera
    g.addColorStop(1, "rgba(110, 65, 30, 0)");
    ctx.save();
    ctx.globalCompositeOperation = "multiply"; // la matita sotto resta visibile
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Telefono lanciato in aria: se ricade forte, lo schermo si crepa.
  // In Matter.js la velocità y è negativa verso l'alto e positiva verso il basso.
  const THROW_UP = -9;   // velocità verso l'alto che conta come "lanciato"
  const HIT_DOWN = 9;    // velocità di caduta che conta come "botta"
  function checkPhoneDrop(api) {
    for (const it of api.items()) {
      if (!it.el.classList.contains("phone") || it.cracked) continue;
      const vy = it.body.velocity.y;
      if (vy < THROW_UP) it.thrown = true;
      // stava cadendo veloce e si è fermato di colpo: ha sbattuto
      if (it.thrown && (it.prevVy || 0) > HIT_DOWN && vy < it.prevVy * 0.3) crackPhone(it, api);
      it.prevVy = vy;
    }
  }

  function crackPhone(it, api) {
    it.cracked = true;
    it.el.classList.add("cracked");
    // se stava squillando, smette: lo schermo si spegne
    const screen = it.el.querySelector(".screen");
    if (screen.dataset.ringing) {
      delete screen.dataset.ringing;
      // torna la scritta di sempre, con le due lingue per il bottone IT/EN
      screen.innerHTML = `<span data-it="${DESK_TEXTS["desk.phone"]}" data-en="${DESK_TEXTS_EN["desk.phone"]}">${t("desk.phone")}</span><small data-it="${DESK_TEXTS["desk.phoneSub"]}" data-en="${DESK_TEXTS_EN["desk.phoneSub"]}">${t("desk.phoneSub")}</small>`;
    }
    api.buzz(it, 250);
    if (navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate(160);
    api.onStop(() => { it.el.classList.remove("cracked"); });
  }

  // tick viene chiamata da gravity.js a ogni fotogramma: controlla il telefono e i fogli sul caffè
  function tick(api) {
    checkPhoneDrop(api);
    if (!puddles.some((p) => p.amount > 0)) {
      // niente più caffè: eventuali fogli ancora appiccicati si staccano
      for (const page of api.items()) if (page.stuck) grab(page);
      return;
    }
    const held = api.held();
    for (const page of api.items()) {
      if (!page.ctx) continue;
      let onMain = false;
      let touching = false;
      for (const p of puddles) {
        if (p.amount <= 0) continue;
        const pt = toPage(page, p.x, p.y);
        // la pozza tocca il foglio se il suo cerchio entra nel rettangolo del foglio
        const nx = Math.max(0, Math.min(pt.x, page.w));
        const ny = Math.max(0, Math.min(pt.y, page.h));
        if (Math.hypot(pt.x - nx, pt.y - ny) > p.radius) continue;
        touching = true;
        if ((page.soak || 0) < SOAK_MAX) stain(page, pt, p.radius, p.amount);
        drain(p);
        if (p.main && pt.x > 0 && pt.x < page.w && pt.y > 0 && pt.y < page.h) onMain = true;
      }
      // il caffè sotto il foglio appiccicato è finito: si stacca e cade
      if (page.stuck && !onMain) {
        page.stuck = false;
        Matter.Body.setStatic(page.body, false);
        page.body.frictionAir = 0.03;
      }
      if (!touching) continue;
      // soak conta per quanti fotogrammi il foglio è stato sul caffè
      page.soak = (page.soak || 0) + 1;
      if (page.soak > SOAK_TO_STICK / 2) page.el.classList.add("soaked");
      // lasciato sopra la pozza: si appiccica alla scrivania
      if (onMain && page !== held && !page.stuck && page.soak >= SOAK_TO_STICK) {
        page.stuck = true;
        Matter.Body.setVelocity(page.body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(page.body, 0);
        Matter.Body.setStatic(page.body, true); // "statico" = fermo, la gravità non lo muove più
      }
    }
  }

  // Chiamata ogni volta che afferri un oggetto.
  // Conta le prese (per la schermata di errore) e, se era un foglio appiccicato, lo stacca.
  function grab(it) {
    stats.grabs++;
    if (!it.stuck) return;
    it.stuck = false;
    Matter.Body.setStatic(it.body, false);
    it.body.frictionAir = 0.03; // bagnato è più pesante: scende più in fretta
  }

  // Matita: si tiene per la punta e scrive sui fogli.
  const isPencil = (it) => it.el.classList.contains("pencil");

  // dov'è la punta, rispetto al centro della matita (la punta è a destra)
  function tipOffset(it) {
    const a = it.body.angle;
    const r = it.w / 2 - 2;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  }

  // gravity.js chiede da quale punto afferrare l'oggetto: per la matita la punta, per gli altri dove clicchi (null)
  function grip(it) {
    return isPencil(it) ? tipOffset(it) : null;
  }

  // Chiamata a ogni fotogramma mentre tieni un oggetto. Serve solo alla matita:
  // trova il foglio sotto la punta e disegna una linea dal punto di prima a quello di adesso.
  function whileHeld(it, api) {
    if (!isPencil(it)) return;
    const off = tipOffset(it);
    const tip = { x: it.body.position.x + off.x, y: it.body.position.y + off.y };

    // il foglio più in alto sotto la punta (parto dall'ultimo della lista, che è disegnato sopra gli altri)
    const pages = api.items().filter((i) => i.ctx);
    let hit = null;
    let local = null;
    for (let i = pages.length - 1; i >= 0; i--) {
      const p = pages[i];
      const dx = tip.x - p.body.position.x;
      const dy = tip.y - p.body.position.y;
      const c = Math.cos(-p.body.angle);
      const s = Math.sin(-p.body.angle);
      const lx = dx * c - dy * s;
      const ly = dx * s + dy * c;
      if (Math.abs(lx) < p.w / 2 && Math.abs(ly) < p.h / 2) {
        hit = p;
        local = { x: lx + p.w / 2, y: ly + p.h / 2 };
        break;
      }
    }

    if (!hit) { it.lastPage = null; return; }
    const ctx = hit.ctx;
    if (it.lastPage === hit && it.lastPoint) {
      ctx.beginPath();
      ctx.moveTo(it.lastPoint.x, it.lastPoint.y);
      ctx.lineTo(local.x, local.y);
      ctx.stroke();
    }
    it.lastPage = hit;
    it.lastPoint = local;
  }

  // quando lasci la matita, la prossima linea non deve collegarsi a quella di prima
  function release(it) {
    it.lastPage = null;
    it.lastPoint = null;
  }

  // Lampada: tutta la stanza lampeggia, poi torna normale.
  // Il lampeggio è un velo nero (.blackout) animato nel CSS, che dura 3,2 secondi.
  function lamp(it, api) {
    if (document.querySelector(".blackout")) return;
    const dark = document.createElement("div");
    dark.className = "blackout";
    document.body.appendChild(dark);
    it.el.classList.add("flickering");
    api.buzz(it, 300);
    const done = () => { dark.remove(); it.el.classList.remove("flickering"); };
    setTimeout(done, 3200);
    api.onStop(done);
  }

  // Tazza: il caffè schizza fuori e lascia una macchia sulla scrivania (succede una volta sola).
  function mug(it, api) {
    if (it.el.classList.contains("spilled")) { api.buzz(it, 300); return; }
    it.el.classList.add("spilled");
    it.body.collisionFilter.group = NO_COLLIDE;

    const { x, y } = it.body.position;

    // schizzi che volano e poi si asciugano
    for (let i = 0; i < 14; i++) {
      const r = rand(3, 7);
      const el = document.createElement("div");
      el.className = "coffee-drop";
      el.setAttribute("aria-hidden", "true");
      const body = Matter.Bodies.circle(x + rand(-8, 8), y + rand(-8, 8), r, {
        density: 0.001,
        friction: 1,
        frictionAir: 0.02,
        restitution: 0.05,
        collisionFilter: { group: NO_COLLIDE },
      });
      Matter.Body.setVelocity(body, { x: rand(-6, 6), y: rand(-8, 0) });
      const drop = api.spawn(el, body, r * 2, r * 2);
      setTimeout(() => { el.classList.add("dry"); setTimeout(() => api.remove(drop), 600); }, rand(900, 1600));
    }

    // la macchia sul legno, dove si trovava la tazza (dentro i bordi della scrivania)
    const desk = document.getElementById("desk");
    const r = desk.getBoundingClientRect();
    const mx = Math.min(130, r.width / 4);
    const my = Math.min(90, r.height / 4);
    const sx = Math.min(Math.max(x, r.left + mx), r.right - mx) - r.left;
    const sy = Math.min(Math.max(y, Math.max(r.top, 0) + my), Math.min(r.bottom, innerHeight) - my) - r.top;
    const stain = document.createElement("div");
    stain.className = "coffee-stain";
    stain.setAttribute("aria-hidden", "true");
    stain.style.left = `${sx}px`;
    stain.style.top = `${sy}px`;
    // una pozza principale più qualche goccia intorno, ogni volta diversa
    const blobs = [{ w: rand(150, 190), h: rand(100, 130), x: 0, y: 0, r: rand(-30, 30), d: 0, main: true }];
    for (let i = 0; i < 6; i++) {
      const s = rand(16, 44);
      blobs.push({ w: s, h: s * rand(0.7, 1), x: rand(-130, 130), y: rand(-80, 80), r: rand(0, 90), d: rand(0.1, 0.6) });
    }
    stain.innerHTML = blobs.map((b) =>
      `<span style="--w:${b.w}px;--h:${b.h}px;--x:${b.x}px;--y:${b.y}px;--r:${b.r}deg;--d:${b.d}s"></span>`).join("");
    // mi segno dove sono le pozze sullo schermo, per inzuppare i fogli che ci passano sopra
    const spans = stain.querySelectorAll("span");
    blobs.forEach((b, i) => {
      puddles.push({
        x: r.left + sx + b.x,
        y: r.top + sy + b.y,
        radius: (b.w + b.h) / 4,
        main: !!b.main,
        amount: 1, // quanto caffè c'è ancora: 1 = pieno, 0 = asciugato dai fogli
        el: spans[i],
      });
    });
    if (api.items().some((i) => i.ctx)) api.hint("gravity.soakHint");
    // uno strato grande come la scrivania, così la macchia non esce dai bordi
    const layer = document.createElement("div");
    layer.className = "stain-layer";
    layer.appendChild(stain);
    desk.appendChild(layer);

    api.onStop(() => { layer.remove(); it.el.classList.remove("spilled"); puddles = []; });
  }

  // Telefono: vibra e sullo schermo compare un messaggio, poi dopo 2,6 secondi torna normale.
  function phone(it, api) {
    // rotto non va più: niente squillo, al massimo un piccolo sussulto
    if (it.cracked) { api.buzz(it, 200); return; }
    api.buzz(it, 1600);
    // vibra davvero, su telefono
    if (navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate([120, 80, 120, 80, 200]);
    const screen = it.el.querySelector(".screen");
    if (screen.dataset.ringing) return;
    screen.dataset.ringing = "1";
    const before = screen.innerHTML;
    screen.innerHTML = `<span>${t("toys.phoneTitle")}</span><small>${t("toys.phoneSub")}</small>`;
    const done = () => { if (!screen.dataset.ringing) return; screen.innerHTML = before; delete screen.dataset.ringing; };
    setTimeout(done, 2600);
    api.onStop(done);
  }

  // Polaroid: il ritratto si scompiglia i capelli e resta stordito.
  // La classe "messy" nel CSS nasconde i capelli in ordine e la faccia normale, e mostra quelli spettinati.
  function polaroid(it, api) {
    api.buzz(it, 500);
    if (it.el.classList.contains("messy")) return;
    it.el.classList.add("messy");
    api.onStop(() => it.el.classList.remove("messy"));
  }

  // Chiamata da gravity.js quando scuoti un oggetto: mi segno cosa hai scosso (per la schermata
  // di errore) e poi faccio partire l'effetto giusto in base alla classe dell'oggetto.
  function shake(it, api) {
    const c = it.el.classList;
    const what = objName(it);
    stats.shaken.set(what, (stats.shaken.get(what) || 0) + 1);
    if (c.contains("notebook")) notebook(it, api);
    else if (c.contains("polaroid")) polaroid(it, api);
    else if (c.contains("lamp")) lamp(it, api);
    else if (c.contains("mug")) mug(it, api);
    else if (c.contains("phone")) phone(it, api);
    else if (!c.contains("pencil")) api.buzz(it, 350); // la matita si muove per scrivere, non trema
  }

  // Troppo gioco: la scrivania va in crash.
  // Mentre la gravità è attiva conto quanto si gioca (afferrare = 1, scuotere = 3).
  // Superato il limite compare una console con l'errore e il resoconto di quello che hai combinato
  // (quante prese, cosa hai scosso), poi la scrivania si "riavvia" e torna tutto a posto.
  // Più basso è il numero, prima arriva (25 = una venticinquina di prese, o otto-nove scossoni).
  const PLAY_LIMIT = 25;
  let playScore = 0;
  const stats = { grabs: 0, shaken: new Map() };

  // come si chiama l'oggetto nei messaggi (le chiavi stanno in js/desk-texts.js)
  function objName(it) {
    const c = it.el.classList;
    for (const k of ["notebook", "mug", "phone", "lamp", "polaroid", "pencil", "sticky"]) if (c.contains(k)) return k;
    if (c.contains("big-red")) return "button";
    return "thing";
  }

  function played(api, points) {
    if (playScore === 0) api.onStop(() => { playScore = 0; stats.grabs = 0; stats.shaken.clear(); });
    playScore += points;
    if (playScore >= PLAY_LIMIT && !document.querySelector(".crash")) crash(api);
  }

  function crash(api) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

    // le righe dell'errore: una per le prese, una per ogni oggetto scosso (al massimo quattro)
    const trace = [`at ${t("crash.grab")}() <i>× ${stats.grabs}</i>`];
    [...stats.shaken.keys()].slice(0, 4).forEach((k) => {
      trace.push(`at ${t("crash.shake")}(${t("obj." + k)}) <i>// ${t("fx." + k)}</i>`);
    });
    const steps = [t("crash.step1"), t("crash.step2"), t("crash.step3")];

    const el = document.createElement("div");
    el.className = "crash";
    el.setAttribute("role", "alertdialog");
    el.setAttribute("aria-label", t("crash.title"));
    el.innerHTML = `
      <div class="crash-inner">
        <p class="crash-title" data-text="${esc(t("crash.title"))}">${esc(t("crash.title"))}</p>
        <div class="editor crash-card">
          <div class="editor-bar">
            <span class="editor-dots" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="mono">${t("crash.file")}</span>
            <span class="editor-badge bad mono">crash</span>
          </div>
          <div class="crash-log mono"></div>
        </div>
        <div class="crash-foot">
          <div class="crash-bar"><i></i></div>
          <button type="button" class="btn crash-skip">${t("crash.skip")}</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    // un attimo di sfarfallio su tutta la pagina, come uno schermo che si inceppa
    const flash = document.createElement("div");
    flash.className = "crash-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 700);

    const log = el.querySelector(".crash-log");
    const bar = el.querySelector(".crash-bar i");
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, reduce ? 0 : ms));
    const line = (html, cls = "") => {
      const d = document.createElement("div");
      d.className = "crash-ln " + cls;
      d.innerHTML = html;
      log.appendChild(d);
      return d;
    };

    // prima l'errore, poi le righe del resoconto, poi il riavvio passo per passo
    let at = 500;
    later(() => line(`<b>Uncaught ${t("crash.error")}:</b> ${esc(t("crash.why"))}`, "is-err"), at);
    trace.forEach((tr) => { at += 320; later(() => line(tr, "is-trace"), at); });
    at += 700;
    later(() => line("&gt; " + esc(t("crash.reboot")), "is-cmd"), at);
    steps.forEach((s, i) => {
      at += 350;
      later(() => {
        const d = line(`<span class="crash-check">…</span> ${esc(s)}`, "is-step");
        bar.style.width = ((i + 0.5) / steps.length) * 100 + "%";
        later(() => { d.querySelector(".crash-check").textContent = "✓"; d.classList.add("ok"); bar.style.width = ((i + 1) / steps.length) * 100 + "%"; }, 650);
      }, at);
      at += 650;
    });
    at += 500;
    later(() => line(esc(t("crash.done")), "is-done"), at);
    later(() => api.stop(), at + 1300);

    // "ok, mi calmo" chiude subito; anche Esc (che ferma la gravità) fa sparire la console
    el.querySelector(".crash-skip").addEventListener("click", () => api.stop());
    api.onStop(() => {
      timers.forEach(clearTimeout);
      el.classList.add("bye");
      setTimeout(() => el.remove(), 500);
    });
  }

  return { shake, grip, grab, whileHeld, release, tick, played };
})();
