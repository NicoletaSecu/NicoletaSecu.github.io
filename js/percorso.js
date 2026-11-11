// Chi sono: il percorso come una linea del tempo da trascinare.
// L'anno gira come un contachilometri e sotto la linea compare la tappa di quel periodo.
(function () {
  const box = document.getElementById("path");
  if (!box) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // le tappe, in ordine di linea: "at" è l'anno in cui stanno sulla linea, "when" il periodo scritto per intero.
  // when_en, title_en e text_en sono le stesse cose in inglese
  const ERAS = [
    { at: 2022, when: "2022", title: "Stage da Ithaca Studio", c: "--t2",
      title_en: "Internship at Ithaca Studio",
      text: "<p>Studio di marketing e web design a Verona. Ricerca di nuovi clienti e fornitori in Italia e nei mercati UE; revisione del design dei siti dei clienti, con attenzione a usabilità e chiarezza, lavorando con i developer per sistemare le incongruenze grafiche.</p>" +
            "<h4>Corsi \"Tandem\" con l'Università di Verona</h4><p>\"Chi è l'Homo Economicus e come evolverà\" (ambito economico) e \"Introduzione all'Intelligenza Artificiale\" (ambito informatico).</p>" +
            "<h4>Corso con COSP Verona</h4><p>\"Internazionalizzazione\", legato sia a percorsi accademici sia lavorativi e aziendali.</p>",
      text_en: "<p>A marketing and web design studio in Verona. Looking for new clients and suppliers in Italy and in EU markets; reviewing the design of clients' websites with a focus on usability and clarity, working with the developers to fix visual inconsistencies.</p>" +
            "<h4>\"Tandem\" courses with the University of Verona</h4><p>\"Who is Homo Economicus and how will he evolve\" (economics) and \"Introduction to Artificial Intelligence\" (computer science).</p>" +
            "<h4>Course with COSP Verona</h4><p>\"Internationalisation\", related to both academic paths and the world of work and business.</p>" },
    // il diploma sta sulla linea nell'anno in cui l'ho preso
    { at: 2023, when: "2018 — 2023", title: "Diploma di Amministrazione, Finanza e Marketing", c: "--t3",
      title_en: "High school diploma in Administration, Finance and Marketing",
      text: "<p>Articolazione Sistemi Informativi Aziendali (SIA).</p>",
      text_en: "<p>Business Information Systems track (SIA).</p>" },
    // la città la aggiungo a laurea finita
    { at: 2024, when: "2024 — in corso", title: "Laurea triennale in Informatica", c: "--t1",
      when_en: "2024 — ongoing", title_en: "Bachelor's degree in Computer Science",
      text: "" },
    { at: 2025, when: "a.s. 2025/26 e 2026/27 — in corso", title: "Docente ITP", c: "--t2",
      when_en: "school years 2025/26 and 2026/27 — ongoing", title_en: "Lab teacher (ITP)",
      text: "<p>Informatica e Matematica.</p>",
      text_en: "<p>Computer Science and Maths.</p>" },
  ];
  // en(tappa, "title") dà il testo nella lingua scelta: in inglese title_en, se c'è
  const en = (e, k) => (document.documentElement.lang === "en" && e[k + "_en"] != null ? e[k + "_en"] : e[k]);
  // prima della prima tappa (2018–2021) ero alle superiori: si vede il diploma
  const BEFORE = ERAS.find((e) => e.at === 2023);
  // Y0 = primo anno della linea, Y1 = l'anno di oggi (si allunga da sola ogni anno)
  const Y0 = 2018, Y1 = new Date().getFullYear();

  const odo = document.getElementById("pathOdo");
  const rail = document.getElementById("pathRail");
  const knob = document.getElementById("pathKnob");
  const fill = document.getElementById("pathFill");
  const era = document.getElementById("pathEra");
  const whenEl = era.querySelector(".path-when"), titleEl = era.querySelector("h3"), textEl = era.querySelector(".path-text");

  // Il contachilometri: quattro colonne di cifre da 0 a 9, una sopra l'altra.
  // Per mostrare una cifra sposto la colonna in su (es. per il 5 la sposto di 5 righe): vedi show().
  const cols = [0, 1, 2, 3].map(() => {
    const c = document.createElement("div");
    c.className = "path-col";
    c.innerHTML = [...Array(10).keys()].map((d) => `<span>${d}</span>`).join("");
    odo.appendChild(c);
    return c;
  });

  // le tacche degli anni; quelle dove comincia una tappa sono più grandi e si cliccano
  // pct(anno) = a che percentuale della linea sta quell'anno (Y0 a sinistra = 0%, Y1 a destra = 100%)
  const pct = (y) => ((y - Y0) / (Y1 - Y0)) * 100;
  for (let y = Y0; y <= Y1; y++) {
    const e = ERAS.find((x) => x.at === y);
    const t = document.createElement(e ? "button" : "span");
    t.className = "path-tick" + (e ? " is-era" : "");
    t.style.left = pct(y) + "%";
    t.textContent = y;
    if (e) {
      t.type = "button";
      // stopPropagation: il clic sulla tacca non deve arrivare anche alla linea (che inizierebbe a trascinare)
      t.addEventListener("pointerdown", (ev) => ev.stopPropagation());
      t.addEventListener("click", () => go(y, true));
    }
    rail.appendChild(t);
  }

  // year = l'anno mostrato, cur = la tappa mostrata, last = la posizione del pallino (da 0 a 1)
  let year = Y0, cur = null, last = 0;
  // Mette il pallino in posizione p (0 = inizio linea, 1 = fine) e aggiorna anno e tappa.
  function show(p, animate) {
    p = clamp(p, 0, 1);
    last = p;
    const anim = animate && !reduce;
    knob.style.transition = fill.style.transition = anim ? "left .45s var(--ease), width .45s var(--ease)" : "none";
    knob.style.left = p * 100 + "%";
    fill.style.width = p * 100 + "%";
    year = Math.round(Y0 + p * (Y1 - Y0));
    rail.setAttribute("aria-valuenow", year);
    String(year).split("").forEach((d, i) => { cols[i].style.transform = `translateY(${-d}em)`; });
    // si accende l'anno in cui ti trovi (non la tappa: prima del 2022, per esempio, non è acceso il 2023)
    rail.querySelectorAll(".path-tick").forEach((t) => t.classList.toggle("on", +t.textContent === year));
    // la tappa da mostrare: l'ultima iniziata entro l'anno scelto (prima del 2022, il diploma)
    const e = ERAS.filter((x) => x.at <= year).pop() || BEFORE;
    if (e !== cur) {
      cur = e;
      whenEl.textContent = en(e, "when");
      titleEl.textContent = en(e, "title");
      textEl.innerHTML = en(e, "text");
      box.style.setProperty("--era", `var(${e.c})`);
      // rifaccio partire l'animazione di cambio tappa (void offsetWidth forza il browser a ripartire)
      era.classList.remove("swap"); void era.offsetWidth; era.classList.add("swap");
    }
  }
  const go = (y, animate) => show((y - Y0) / (Y1 - Y0), animate);

  // trascinare il pallino (o cliccare sulla linea); lasciandolo si ferma sull'anno più vicino
  let dragging = false;
  // at(evento) = dove hai cliccato sulla linea, da 0 a 1
  const at = (e) => { const r = rail.getBoundingClientRect(); return (e.clientX - r.left) / r.width; };
  // setPointerCapture: anche se esci dalla linea mentre trascini, continuo a ricevere i movimenti
  rail.addEventListener("pointerdown", (e) => { dragging = true; rail.setPointerCapture(e.pointerId); show(at(e), true); });
  rail.addEventListener("pointermove", (e) => { if (dragging) show(at(e), false); });
  const release = () => { if (!dragging) return; dragging = false; go(year, true); };
  rail.addEventListener("pointerup", release);
  rail.addEventListener("pointercancel", release);
  // e con le frecce della tastiera
  rail.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { go(Math.min(Y1, year + 1), true); e.preventDefault(); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { go(Math.max(Y0, year - 1), true); e.preventDefault(); }
  });

  go(Y0, false);
  // cambiando lingua la tappa di adesso si riscrive
  addEventListener("langchange", () => { cur = null; show(last, false); });
})();
