// Solo per la home: la galleria dei progetti scelti ("I miei preferiti"), il nome che scappa
// dal mouse e vola via quando scorri, la frase rosa che si cancella e si riscrive.
// Lo carica solo index.html, dopo content/projects.js (da lì arrivano i progetti).
(function () {
  // true se la persona ha chiesto al sistema meno animazioni: in quel caso fermo i movimenti
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // lerp fa un passo da a verso b (t = quanta strada, da 0 a 1); clamp tiene un numero tra due limiti
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // i progetti arrivano da content/projects.js, nell'ordine di GALLERY;
  // ognuno apre la sua pagina (progetto.html?id=...)
  const work = document.getElementById("work");
  const stage = document.getElementById("workStage");
  const track = document.getElementById("workTrack");
  // se manca qualcosa (pagina diversa o dati non caricati) mi fermo qui, senza errori
  if (!work || !track || typeof PROJECTS === "undefined") return;
  // GALLERY è la lista degli id scelti (es. ["sync", "air-math"]): per ognuno cerco il progetto intero
  const list = GALLERY.map((id) => PROJECTS.find((p) => p.id === id)).filter(Boolean);
  // L'HTML di un riquadro della galleria. È una funzione perché lo riscrivo anche quando cambi lingua.
  // tr(p, "title") prende il titolo nella lingua giusta; L("it", "en") sceglie tra due testi.
  // padStart(2, "0") trasforma 1 in "01"; date.slice(0, 4) prende solo l'anno da "2026-10".
  const panelHTML = (p, i) => {
    const type = TYPES[p.type] || TYPES.app;
    return `<div class="work-figure">
         <span class="work-badge">${tr(type, "one")}</span>
         <span class="work-open">${L("scopri →", "explore →")}</span>
         <img src="${p.image}" alt="${tr(p, "title")}" loading="lazy" draggable="false">
       </div>
       <div class="work-meta">
         <span class="work-index">${String(i + 1).padStart(2, "0")} — ${p.date.slice(0, 4)}</span>
         <h3 class="work-title">${tr(p, "title")}</h3>
         <p class="work-desc">${tr(p, "teaser")}</p>
         <div class="work-stack">${p.stack.slice(0, 4).map((s) => `<span>${s}</span>`).join("")}</div>
       </div>`;
  };
  // l'ultimo riquadro, quello che porta alla pagina con tutti i progetti
  const moreHTML = () => `<a href="progetti.html" draggable="false" data-cursor="vai"><b>${L("Tutti i progetti →", "All projects →")}</b><span>${L(`${PROJECTS.length} progetti, dal più recente, con i filtri.`, `${PROJECTS.length} projects, newest first, with filters.`)}</span></a>`;
  // creo un link <a> per ogni progetto e lo aggiungo alla striscia (track)
  list.forEach((p, i) => {
    const a = document.createElement("a");
    a.className = "work-panel";
    a.href = `progetto.html?id=${encodeURIComponent(p.id)}`;
    a.draggable = false;              // altrimenti trascinando la galleria il browser trascinerebbe il link
    a.dataset.cursor = "scopri";      // la parola che compare nel cursore
    a.style.setProperty("--c", (TYPES[p.type] || TYPES.app).color);   // il colore del tipo di progetto, usato dal CSS
    a.innerHTML = panelHTML(p, i);
    track.appendChild(a);
  });
  // in fondo alla galleria: il riquadro che porta a tutti i progetti
  const more = document.createElement("div");
  more.className = "work-more";
  more.innerHTML = moreHTML();
  track.appendChild(more);
  // cambiando lingua riscrivo i testi dei riquadri e rimisuro (le scritte possono cambiare larghezza)
  addEventListener("langchange", () => {
    list.forEach((p, i) => { track.children[i].innerHTML = panelHTML(p, i); });
    more.innerHTML = moreHTML();
    layout();
  });
  const panels = [...track.children];
  const progress = document.getElementById("workProgress");

  // Dove sta ogni progetto quando è al centro, e fin dove si può andare.
  // La galleria è una striscia lunga che sposto verso sinistra: x è di quanto è spostata.
  // stops = i valori di x per cui ogni riquadro sta esattamente al centro dello schermo;
  // maxX = lo spostamento massimo (l'ultimo riquadro al centro).
  let stops = [], maxX = 0;
  function layout() {
    const w = panels[0].offsetWidth;
    // spazio vuoto a sinistra e a destra, così anche il primo e l'ultimo possono stare al centro
    const side = Math.max(0, (innerWidth - w) / 2);
    track.style.paddingLeft = track.style.paddingRight = side + "px";
    stops = panels.map((p) => p.offsetLeft + p.offsetWidth / 2 - innerWidth / 2);
    maxX = stops[stops.length - 1];
    tx = clamp(tx, 0, maxX);
  }
  // x = dove sta la galleria adesso, tx = dove deve arrivare (si avvicina piano, vedi frame())
  let x = 0, tx = 0;
  layout();
  addEventListener("resize", layout);

  // finito lo swipe, il progetto più vicino si mette al centro
  let snapTimer = 0;
  // nearest trova il riquadro più vicino a una posizione; snap ce lo porta; goTo va al riquadro numero i
  const nearest = (v) => stops.reduce((best, s, i) => (Math.abs(s - v) < Math.abs(stops[best] - v) ? i : best), 0);
  const snap = () => { tx = stops[nearest(tx)]; };
  const goTo = (i) => { tx = stops[clamp(i, 0, stops.length - 1)]; };

  // solo lo swipe orizzontale del touchpad muove i progetti: su e giù scorrono la pagina e basta
  stage.addEventListener("wheel", (e) => {
    // deltaX = quanto scorri di lato, deltaY = quanto in su/giù: se è più verticale lascio stare
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault(); // niente "pagina indietro" del browser mentre scorri di lato
    tx = clamp(tx + e.deltaX * 1.1, 0, maxX);
    // quando smetti di scorrere per 160 millesimi di secondo, il progetto più vicino va al centro
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snap, 160);
  }, { passive: false });

  // trascinando (mouse o dito) la galleria segue la mano; in verticale il dito scorre la pagina
  let drag = null;
  // drag tiene: dove hai premuto (x0), dov'era la galleria (t0), se ti sei mosso davvero (moved)
  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;   // solo il tasto sinistro
    drag = { x0: e.clientX, t0: tx, moved: false, id: e.pointerId };
  });
  addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0;
    // sotto i 6 pixel lo considero un clic, non un trascinamento
    if (Math.abs(dx) > 6) { drag.moved = true; stage.classList.add("dragging"); }
    if (drag.moved) tx = clamp(drag.t0 - dx * 1.2, 0, maxX);
  });
  const endDrag = () => {
    if (!drag) return;
    if (drag.moved) snap();
    stage.classList.remove("dragging");
    setTimeout(() => { drag = null; }, 0);
  };
  addEventListener("pointerup", endDrag);
  addEventListener("pointercancel", endDrag);
  // se hai trascinato, il rilascio non apre il progetto
  track.addEventListener("click", (e) => { if (drag && drag.moved) e.preventDefault(); }, true);

  // le frecce, per chi non ha il touchpad; e le frecce della tastiera
  document.getElementById("workPrev").addEventListener("click", () => goTo(nearest(tx) - 1));
  document.getElementById("workNext").addEventListener("click", () => goTo(nearest(tx) + 1));
  addEventListener("keydown", (e) => {
    const r = work.getBoundingClientRect();
    if (r.top > innerHeight * 0.5 || r.bottom < innerHeight * 0.5) return;
    if (e.key === "ArrowRight") goTo(nearest(tx) + 1);
    if (e.key === "ArrowLeft") goTo(nearest(tx) - 1);
  });

  // Il nome diviso in lettere; ognuna ha la sua direzione per volare via.
  // Ogni lettera diventa uno <span class="ch"> e si porta dietro _t: la sua spinta casuale
  // (sx, sy = direzione in cui vola, sr = quanto ruota) e il suo spostamento attuale (x, y).
  const hero = document.querySelector(".hero");
  const chars = [];
  document.querySelectorAll(".hero-name .line").forEach((line) => {
    const text = line.textContent.trim();
    line.textContent = "";
    [...text].forEach((ch) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch;
      s._t = { x: 0, y: 0, sx: Math.random() * 2 - 1, sy: -0.3 - Math.random() * 1.1, sr: Math.random() * 2 - 1 };
      line.appendChild(s);
      chars.push(s);
    });
  });
  // dove sta il mouse sopra il nome (on = false quando esce)
  let heroMouse = { x: 0, y: 0, on: false };
  hero.addEventListener("pointermove", (e) => { heroMouse = { x: e.clientX, y: e.clientY, on: true }; });
  hero.addEventListener("pointerleave", () => { heroMouse.on = false; });

  // Il ciclo, frame per frame (circa 60 volte al secondo): muove la galleria e le lettere del nome.
  // skew = quanto la galleria si piega di lato mentre corre
  let skew = 0;
  function frame() {
    // galleria: si avvicina piano al punto giusto, e piega in base a quanto corre
    const prev = x;
    x = reduce ? tx : lerp(x, tx, 0.1);
    const vel = x - prev;   // la velocità: di quanto si è mossa in questo fotogramma
    skew = lerp(skew, reduce ? 0 : clamp(vel * 0.4, -14, 14), 0.15);
    // sposto la striscia a sinistra di x pixel e la piego un po' (skewX)
    track.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    progress.style.width = (maxX ? (x / maxX) * 100 : 0).toFixed(1) + "%";

    // quello al centro è nitido; gli altri sono velati e girati, come un nastro attorcigliato.
    // Mentre la galleria corre si vedono tutti un po' meno.
    // n = quanto è lontano dal centro ogni riquadro (0 = al centro, 1 = un riquadro più in là)
    const speed = Math.min(Math.abs(vel) / 25, 1);
    const step = panels[0].offsetWidth * 1.1;
    for (const p of panels) {
      const r = p.getBoundingClientRect();
      const n = clamp((r.left + r.width / 2 - innerWidth / 2) / step, -2, 2);
      const a = Math.min(Math.abs(n), 1);
      const veil = clamp(a * 0.65 + speed * 0.35, 0, 0.85);
      // --veil è il velo scuro sopra l'immagine: il CSS lo usa come opacità
      p.style.setProperty("--veil", veil.toFixed(3));
      p.classList.toggle("is-center", a < 0.3);
      // quelli di lato vanno indietro (translateZ), girano (rotateY) e si rimpiccioliscono (scale)
      if (!reduce) {
        p.style.transform =
          `translateZ(${(-Math.abs(n) * 160).toFixed(0)}px) rotateY(${(-n * 24).toFixed(1)}deg) ` +
          `rotateZ(${(n * skew * 0.25).toFixed(2)}deg) scale(${(1 - a * 0.12).toFixed(3)})`;
      }
    }

    // il nome: scappa dal mouse e vola via scorrendo
    if (!reduce) {
      // hp = quanto hai scorso rispetto all'altezza del primo schermo, da 0 a 1;
      // ease = hp al quadrato, così all'inizio le lettere si muovono poco e poi sempre di più
      const hp = clamp(scrollY / (innerHeight * 0.85), 0, 1);
      const ease = hp * hp;
      for (const s of chars) {
        const t = s._t;
        let mx = 0, my = 0;
        // se il mouse è a meno di 160 pixel, la lettera si allontana (più è vicino, più scappa)
        if (hp < 0.5 && heroMouse.on) {
          const r = s.getBoundingClientRect();
          const dx = r.left + r.width / 2 - heroMouse.x, dy = r.top + r.height / 2 - heroMouse.y;
          const d = Math.hypot(dx, dy);
          if (d < 160 && d > 0) { const f = (1 - d / 160) * 26; mx = (dx / d) * f; my = (dy / d) * f; }
        }
        t.x = lerp(t.x, mx, 0.15); t.y = lerp(t.y, my, 0.15);
        const fx = t.x + t.sx * ease * 320, fy = t.y + t.sy * ease * 320, rot = t.sr * ease * 60;
        s.style.transform = `translate(${fx.toFixed(1)}px, ${fy.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
        s.style.opacity = (1 - ease).toFixed(2);
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  // quando le immagini finiscono di caricare i riquadri possono cambiare misura: rimisuro
  track.querySelectorAll("img").forEach((img) => img.addEventListener("load", layout));

  // La frase rosa si cancella e si riscrive, come se qualcuno la stesse scrivendo.
  // pi = quale frase, ci = quante lettere si vedono, del = true mentre sta cancellando.
  const typeEl = document.getElementById("typeText");
  const PHRASES = {
    it: ["in cose che si possono usare.", "in web app che funzionano.", "in strumenti per studiare.", "in esperimenti un po' folli."],
    en: ["into things people can use.", "into web apps that work.", "into tools for studying.", "into slightly crazy experiments."],
  };
  let phrases = PHRASES[document.documentElement.lang] || PHRASES.it;
  if (typeEl) typeEl.textContent = phrases[0];
  if (typeEl && !reduce) {
    let pi = 0, ci = phrases[0].length, del = true;
    // cambiando lingua la frase di adesso compare già intera nella nuova lingua, poi il giro continua
    addEventListener("langchange", () => {
      phrases = PHRASES[document.documentElement.lang] || PHRASES.it;
      ci = phrases[pi].length;
      typeEl.textContent = phrases[pi];
    });
    // step aggiunge o toglie una lettera, poi si richiama da solo dopo un po' (wait):
    // scrive più piano (62 ms) di quanto cancella (32 ms), e si ferma 1,7 secondi a frase finita
    const step = () => {
      let wait;
      if (!del && ci === phrases[pi].length) { del = true; wait = 1700; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; wait = 240; }
      else { ci += del ? -1 : 1; typeEl.textContent = phrases[pi].slice(0, ci); wait = del ? 32 : 62; }
      setTimeout(step, wait);
    };
    setTimeout(step, 1700);
  } else if (typeEl) {
    addEventListener("langchange", () => { typeEl.textContent = (PHRASES[document.documentElement.lang] || PHRASES.it)[0]; });
  }
})();
