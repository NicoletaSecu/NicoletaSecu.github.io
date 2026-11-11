// Le parti comuni a tutte le pagine: tema chiaro/scuro, lingua, cursore, barra in alto
// con l'avvallamento, barra di avanzamento, comparse e modulo dei contatti.
// Questo file è incluso da ogni pagina, quindi tutto quello che c'è qui vale ovunque.
//
// Tutto il codice sta dentro (function () { ... })(): è una funzione che si chiama da sola.
// Serve a tenere le variabili "private", così non si mescolano con quelle degli altri script.
(function () {
  // Alcune persone chiedono al sistema di ridurre le animazioni (impostazioni di accessibilità).
  // "reduce" è true in quel caso, e più sotto lo uso per spegnere i movimenti.
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // lerp = "interpolazione lineare": fa un passo da a verso b. Con t = 0.18 percorre il 18% della strada.
  // Ripetuto a ogni fotogramma dà quel movimento morbido che rallenta arrivando.
  const lerp = (a, b, t) => a + (b - a) * t;
  // clamp tiene un numero dentro un intervallo: clamp(15, 0, 10) dà 10.
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // il tag <html>: ci tengo sopra il tema (data-theme) e la lingua (lang)
  const root = document.documentElement;

  // Tema chiaro o scuro.
  // Il CSS guarda l'attributo data-theme di <html>: cambiandolo, cambiano tutti i colori.
  // localStorage è una piccola memoria del browser che resta anche chiudendo la pagina:
  // lì mi segno la scelta, e lo script in cima a ogni pagina la rilegge prima di disegnare.
  // (Il try/catch serve perché in alcune modalità private localStorage non funziona e darebbe errore.)
  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  // Lingua: italiano o inglese. La scelta sta in <html lang>, la mette già lo script in cima a ogni pagina.
  // Nelle pagine ogni testo da tradurre ha accanto la sua versione inglese, in data-en
  // (e data-en-aria-label, data-en-content… per gli attributi). L'italiano me lo segno in data-it.
  // Gli script che scrivono testi da soli usano L("italiano", "english") e ascoltano "langchange".
  const isEN = () => root.lang === "en";
  // window.L la rende visibile anche agli altri script (fuori da questa funzione)
  window.L = (it, en) => (isEN() && en != null ? en : it);

  // Mette nella pagina i testi della lingua scelta.
  function translate() {
    const en = isEN();
    // 1) i testi: la prima volta copio l'italiano in data-it, così posso tornare indietro
    document.querySelectorAll("[data-en]").forEach((el) => {
      if (!el.hasAttribute("data-it")) el.setAttribute("data-it", el.innerHTML);
      el.innerHTML = en ? el.getAttribute("data-en") : el.getAttribute("data-it");
    });
    // 2) gli attributi: data-en-aria-label="..." traduce aria-label, e così via.
    // Passo tutti gli elementi e guardo se hanno attributi che iniziano con "data-en-".
    document.querySelectorAll("*").forEach((el) => {
      for (const a of [...el.attributes]) {
        if (!a.name.startsWith("data-en-")) continue;
        // "data-en-aria-label".slice(8) toglie i primi 8 caratteri ("data-en-") e lascia "aria-label"
        const name = a.name.slice(8), keep = "data-it-" + name;
        if (!el.hasAttribute(keep)) el.setAttribute(keep, el.getAttribute(name) || "");
        el.setAttribute(name, en ? a.value : el.getAttribute(keep));
      }
    });
  }
  translate();

  // Il bottone IT/EN non è scritto nelle pagine: lo aggiungo io, subito prima del bottone del tema.
  const themeSpot = document.getElementById("themeBtn");
  if (themeSpot) {
    themeSpot.insertAdjacentHTML("beforebegin",
      '<button class="lang-btn" id="langBtn" type="button" aria-label="Italiano / English"><span data-l="it">IT</span><span data-l="en">EN</span></button>');
    document.getElementById("langBtn").addEventListener("click", () => {
      root.lang = isEN() ? "it" : "en";
      try { localStorage.setItem("lang", root.lang); } catch (e) {}
      translate();
      // avviso tutti gli altri script: chi scrive testi da solo li riscrive nella nuova lingua
      dispatchEvent(new Event("langchange"));
    });
  }

  // Cursore su misura: solo con mouse o touchpad, e allora la freccia del sistema sparisce.
  // "fine" è true quando c'è un puntatore preciso che può passare sopra le cose (non un dito).
  const cursor = document.querySelector(".cursor");
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  // cm = dove sta il cursore disegnato (x, y) e dove dovrebbe andare (tx, ty, cioè "target").
  // Ogni fotogramma x si avvicina un po' a tx: per questo il cursore insegue il mouse con un filo di ritardo.
  const cm = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2 };
  // Cosa c'è scritto nel cerchio, a seconda di cosa hai sotto.
  // Le parole sono in italiano; CURSOR_EN dice come si traducono.
  const CURSOR_EN = { vai: "go", scopri: "explore", "apri ↗": "open ↗", prendi: "grab", clic: "click", trascina: "drag", ingrandisci: "zoom", home: "home" };
  function labelIt(t) {
    if (t.dataset.cursor) return t.dataset.cursor;          // un elemento può chiedere la sua parola con data-cursor="..."
    if (t.classList.contains("falling")) return "prendi";   // gli oggetti che cadono col bottone rosso
    if (t.matches("a[target=_blank]")) return "apri ↗";     // i link che si aprono in un'altra scheda
    if (t.matches("a")) return "vai";                       // gli altri link
    return "clic";                                          // bottoni e tutto il resto
  }
  const labelFor = (t) => { const it = labelIt(t); return L(it, CURSOR_EN[it]); };
  const dot = cursor && cursor.querySelector(".cursor-dot");
  if (cursor && fine) {
    // has-cursor su <html> dice al CSS di nascondere la freccia del sistema
    root.classList.add("has-cursor");
    const label = cursor.querySelector(".cursor-label");
    // Il browser non sa dov'è il puntatore finché non lo muovi: riparto da dov'era nella pagina di prima.
    // sessionStorage è come localStorage, ma si svuota quando chiudi la scheda.
    let fresh = true;
    try {
      const last = JSON.parse(sessionStorage.getItem("cursorPos") || "null");
      if (last) {
        cm.x = cm.tx = last.x; cm.y = cm.ty = last.y;
        cursor.style.transform = `translate(${cm.x}px, ${cm.y}px)`;
        cursor.classList.add("on");
      }
    } catch (e) {}
    // "pagehide" arriva quando stai lasciando la pagina: mi segno dov'era il cursore
    addEventListener("pagehide", () => {
      try { sessionStorage.setItem("cursorPos", JSON.stringify({ x: cm.tx, y: cm.ty })); } catch (e) {}
    });
    addEventListener("pointermove", (e) => {
      cm.tx = e.clientX; cm.ty = e.clientY;
      // al primo movimento (o rientrando nella finestra) salta sotto il mouse, senza scivolare
      if (fresh) { cm.x = cm.tx; cm.y = cm.ty; fresh = false; }
      cursor.classList.add("on");
    });
    // se il mouse esce dalla finestra il cursore sparisce
    document.addEventListener("pointerleave", () => { cursor.classList.remove("on"); fresh = true; });
    // Quando passi sopra qualcosa di cliccabile, il cursore diventa un cerchio con una parola dentro.
    // closest() risale dall'elemento sotto il mouse fino al primo che corrisponde (es. il link che lo contiene).
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor], a, button, label, .falling");
      // sulla barra in alto resta la goccia: il cerchio coprirebbe le voci
      const hot = !!t && !t.closest(".nav") && !t.matches("input, textarea");
      cursor.classList.toggle("hot", hot);
      if (hot) label.textContent = labelFor(t);
    });
    // mentre tieni premuto il tasto il cursore si schiaccia un po' (classe "press" nel CSS)
    addEventListener("pointerdown", () => cursor.classList.add("press"));
    addEventListener("pointerup", () => cursor.classList.remove("press"));
  }

  // Barra in alto: una linea sotto le voci, con un avvallamento sotto quella attiva
  // e lì dentro un pallino. L'avvallamento scivola morbido da una voce all'altra.
  // La linea è un disegno SVG: un <path> (la linea con la curva) e un <circle> (il pallino).
  const pill = document.querySelector(".nav-pill");
  const links = pill ? [...pill.querySelectorAll(".nav-link")] : [];
  let active = null;   // la voce accesa adesso
  let notch = null;    // tutto quello che serve per disegnare l'avvallamento
  if (pill) {
    pill.insertAdjacentHTML("beforeend", '<svg class="nav-notch" aria-hidden="true"><path></path><circle r="4.5"></circle></svg>');
    // x = dove sta l'avvallamento ora, tx = dove deve arrivare, raf = il fotogramma prenotato (0 se fermo)
    notch = { svg: pill.querySelector(".nav-notch"), path: pill.querySelector(".nav-notch path"), dot: pill.querySelector(".nav-notch circle"), x: null, tx: null, raf: 0 };
  }
  // Disegna la linea per un fotogramma e, se non è ancora arrivata, prenota il prossimo.
  function drawNotch() {
    const n = notch;
    // W = larghezza della barra, y = altezza della linea, d = profondità dell'avvallamento, m = margine ai lati
    const W = pill.clientWidth, y = 5, d = 10, m = 16;
    n.svg.setAttribute("width", W);
    n.svg.setAttribute("height", 20);
    // nessuna voce attiva (es. la 404): solo la linea dritta
    if (n.tx === null) { n.path.setAttribute("d", `M ${m} ${y} L ${W - m} ${y}`); n.dot.style.opacity = 0; n.raf = 0; return; }
    const prev = n.x;
    // ogni fotogramma percorre il 16% della strada che manca
    n.x = reduce ? n.tx : n.x + (n.tx - n.x) * 0.16;
    const v = Math.abs(n.x - prev), cx = n.x;   // v = quanto si è mosso, cioè la velocità
    // La linea: dritta fino a poco prima della voce, poi due curve (C = curva di Bézier)
    // che scendono e risalgono formando l'avvallamento, poi di nuovo dritta fino in fondo.
    n.path.setAttribute("d",
      `M ${m} ${y} L ${cx - 26} ${y} C ${cx - 12} ${y} ${cx - 12} ${y + d} ${cx} ${y + d} ` +
      `C ${cx + 12} ${y + d} ${cx + 12} ${y} ${cx + 26} ${y} L ${W - m} ${y}`);
    n.dot.setAttribute("cx", cx.toFixed(1));
    n.dot.setAttribute("cy", (y + d - 5 - Math.min(v, 5)).toFixed(1)); // mentre corre, il pallino salta un po' fuori
    n.dot.style.opacity = 1;
    // requestAnimationFrame chiede al browser di richiamare drawNotch al prossimo fotogramma (circa 60 al secondo)
    n.raf = Math.abs(n.tx - n.x) > 0.3 ? requestAnimationFrame(drawNotch) : 0;
  }
  // Sposta l'avvallamento sotto una voce. Con instant = true ci va subito, senza scivolare.
  function moveNotch(link, instant) {
    if (!notch) return;
    if (link) {
      // il centro della voce: da dove inizia (offsetLeft) più metà della sua larghezza
      notch.tx = link.offsetLeft + link.offsetWidth / 2;
      if (instant || notch.x === null) notch.x = notch.tx;
    }
    if (!notch.raf) notch.raf = requestAnimationFrame(drawNotch);
  }
  // Accende una voce del menu.
  function setActive(link) {
    if (!link || link === active) return;
    const first = !active;   // true se è la prima volta su questa pagina
    active = link;
    links.forEach((l) => l.classList.toggle("is-active", l === link));
    // arrivando da un'altra pagina, il pallino parte dalla voce di prima e scivola fin qui
    if (first && notch && !reduce) {
      let from = null;
      try { from = links[+sessionStorage.getItem("notchFrom")]; } catch (e) {}
      if (from && from !== link) {
        notch.x = from.offsetLeft + from.offsetWidth / 2;
        moveNotch(link, false);
        return;
      }
    }
    moveNotch(link, first); // altrimenti la prima volta compare già al suo posto
  }
  // prima di lasciare la pagina mi segno quale voce era accesa (il suo numero nella lista)
  addEventListener("pagehide", () => {
    try { if (active) sessionStorage.setItem("notchFrom", String(links.indexOf(active))); } catch (e) {}
  });
  // ogni pagina dice chi è con <body data-page="..."> (home, projects, about, contact…)
  const page = document.body.dataset.page;
  // le sezioni della home che possono accendere una voce del menu
  const roots = [...document.querySelectorAll("[data-section-root]")];
  // "spy" (spia): guarda fin dove hai scorso la home e accende la voce giusta
  function spy() {
    if (page !== "home" || !roots.length) return;
    // l'ultima sezione con una voce nel menu che è già salita oltre il segno
    // (galleria e scrivania non hanno una voce loro: resta accesa "Home")
    const mark = innerHeight * 0.35;   // il segno: a un terzo dell'altezza dello schermo
    let cur = links.find((l) => l.dataset.section === roots[0].id);
    for (const r of roots) {
      const link = links.find((l) => l.dataset.section === r.id);
      if (link && r.getBoundingClientRect().top <= mark) cur = link;
    }
    setActive(cur);
  }
  if (page === "home") spy();
  // nella pagina di un singolo progetto resta accesa "Progetti"
  else setActive(links.find((l) => l.dataset.page === (page === "project" ? "projects" : page)));
  moveNotch(null); // disegna la linea anche dove nessuna voce è attiva
  // passive: true dice al browser che non blocco lo scorrimento, così resta fluido
  addEventListener("scroll", spy, { passive: true });
  addEventListener("resize", () => moveNotch(active, true));
  // quando i font arrivano le voci cambiano larghezza: rimetto a posto l'avvallamento
  // (se sta già scivolando non lo blocco: aggiorno solo la destinazione)
  if (document.fonts) document.fonts.ready.then(() => moveNotch(active, !notch || !notch.raf));
  // cambiando lingua le voci cambiano larghezza: l'avvallamento scivola sotto la voce al nuovo posto
  addEventListener("langchange", () => moveNotch(active, false));

  // il nome in alto a sinistra: in cima alla home non c'è, compare appena scorri
  // (la classe "scrolled" sul body lo fa comparire, vedi .nav-brand nel CSS)
  if (page === "home") {
    const brand = () => document.body.classList.toggle("scrolled", scrollY > innerHeight * 0.55);
    brand();
    addEventListener("scroll", brand, { passive: true });
  }

  // Comparse: gli elementi con data-reveal entrano con un'animazione quando arrivano sullo schermo.
  // IntersectionObserver è un "osservatore" del browser che avvisa quando un elemento diventa visibile;
  // threshold: 0.25 vuol dire "quando se ne vede almeno un quarto". Poi smetto di osservarlo (unobserve).
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.25 });
  document.querySelectorAll(".tl, [data-reveal]").forEach((el) => io.observe(el));

  // Frasi che si accendono da sole, parola per parola, appena entrano nello schermo (es. in Chi sono).
  // Ogni parola diventa uno <span class="w">; poi le accendo una alla volta, ogni 85 millesimi di secondo.
  const wordsIO = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (!e.isIntersecting) return;
      wordsIO.unobserve(e.target);
      e.target.querySelectorAll(".w").forEach((s, i) => setTimeout(() => s.classList.add("on"), reduce ? 0 : 300 + i * 85));
    });
  }, { threshold: 0.2 });
  // Divide la frase in parole. Un <br> nella frase resta un a capo:
  // prima la spezzo dove ci sono i <br>, poi divido ogni pezzo in parole e rimetto i <br> in mezzo.
  const splitWords = (el) => {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((part) => {
      // un <div> d'appoggio mi serve per avere il testo "pulito", senza tag
      const tmp = document.createElement("div");
      tmp.innerHTML = part;
      const words = tmp.textContent.trim().split(/\s+/).filter(Boolean);
      return words.map((w) => `<span class="w">${w}</span> `).join("");
    }).join("<br>");
  };
  document.querySelectorAll("[data-words]").forEach((el) => { splitWords(el); wordsIO.observe(el); });
  // cambiando lingua la frase arriva già tradotta da translate(): la ridivido e la riaccendo
  addEventListener("langchange", () => {
    document.querySelectorAll("[data-words]").forEach((el) => {
      splitWords(el);
      el.querySelectorAll(".w").forEach((s, i) => setTimeout(() => s.classList.add("on"), reduce ? 0 : i * 40));
    });
  });

  // Il ciclo che gira a ogni fotogramma: muove il cursore e riempie la barra di avanzamento in alto.
  const sbFill = document.getElementById("scrollbarFill");
  function frame() {
    if (cursor && fine) {
      const px = cm.x, py = cm.y;   // dov'era il cursore al fotogramma prima
      cm.x = lerp(cm.x, cm.tx, 0.18); cm.y = lerp(cm.y, cm.ty, 0.18);
      cursor.style.transform = `translate(${cm.x}px, ${cm.y}px)`;
      // La goccia si allunga nella direzione in cui corre; sopra un link torna tonda.
      // vx, vy = di quanto si è spostato; sp = la velocità; atan2 dà l'angolo della direzione.
      // La allungo (st) in quella direzione e la stringo nell'altra, così sembra una goccia.
      const vx = cm.x - px, vy = cm.y - py, sp = Math.hypot(vx, vy);
      const st = cursor.classList.contains("hot") || reduce ? 1 : 1 + Math.min(sp / 20, 0.9);
      dot.style.transform = `rotate(${Math.atan2(vy, vx).toFixed(3)}rad) scale(${st.toFixed(3)}, ${(1 / Math.sqrt(st)).toFixed(3)})`;
    }
    if (sbFill) {
      // quanto hai scorso, da 0 (in cima) a 1 (in fondo), trasformato in percentuale di larghezza
      const max = document.documentElement.scrollHeight - innerHeight;
      sbFill.style.width = clamp(scrollY / (max || 1), 0, 1) * 100 + "%";
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Modulo dei contatti: passa da Web3Forms, un servizio che riceve il modulo e mi manda una email.
  // Così la mia email non compare mai sul sito. La "access_key" dice a Web3Forms a chi spedire:
  // non è una password, può stare nel codice.
  const form = document.getElementById("contactForm");
  if (form) {
    const status = document.getElementById("contactStatus");
    // scrive il messaggio sotto il bottone; k è "ok" (verde) o "err" (rosso)
    const say = (t, k) => { status.textContent = t; status.className = "contact-status mono " + (k || ""); };
    // async: dentro posso usare await, cioè "aspetta la risposta" senza bloccare la pagina
    form.addEventListener("submit", async (e) => {
      e.preventDefault();   // niente invio "classico" che ricaricherebbe la pagina
      // botcheck è una casella nascosta: le persone non la vedono, i robot la spuntano. Se è spuntata, ignoro.
      if (form.botcheck && form.botcheck.checked) return;
      // checkValidity controlla le regole scritte nell'HTML (required, type="email"…)
      if (!form.checkValidity()) { say(L("manca qualcosa: controlla email, oggetto e messaggio", "something's missing: check email, subject and message"), "err"); return; }
      const data = new FormData(form);
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;   // niente doppi clic mentre invia
      say(L("invio…", "sending…"));
      try {
        // fetch manda i dati a Web3Forms e aspetta la risposta
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: "17f155cf-637e-4b1f-8fd7-89f99e3db3ab",
            subject: `[Portfolio] ${data.get("subject")}`,
            from_name: "Portfolio",
            email: data.get("email"),
            replyto: data.get("email"),   // così rispondendo all'email scrivo direttamente a chi mi ha contattata
            oggetto: data.get("subject"),
            message: data.get("message"),
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error();   // qualcosa è andato storto: salto al catch
        form.reset();
        say(L("grazie! ti rispondo appena posso", "thank you! I'll get back to you as soon as I can"), "ok");
      } catch (_) {
        say(L("qualcosa non è andato, riprova tra poco", "something went wrong, please try again in a bit"), "err");
      } finally {
        // finally viene eseguito in ogni caso, sia che sia andata bene sia male
        btn.disabled = false;
      }
    });
  }
})();
