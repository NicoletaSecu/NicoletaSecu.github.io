// La pagina di un progetto: legge l'id dall'indirizzo (progetto.html?id=air-math)
// e la riempie con i dati di content/projects.js.
(function () {
  const main = document.getElementById("proj");
  if (!main || typeof PROJECTS === "undefined") return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // l'indirizzo è tipo progetto.html?id=air-math: URLSearchParams legge quello che c'è dopo il "?"
  const id = new URLSearchParams(location.search).get("id");
  const p = PROJECTS.find((x) => x.id === id);

  // nessun progetto con quell'id (indirizzo sbagliato): mostro una pagina "Non trovato"
  if (!p) {
    const notFound = () => {
      document.title = L("Progetto non trovato — Nicoleta Secu", "Project not found — Nicoleta Secu");
      main.innerHTML = `
      <section class="page-head">
        <a class="proj-back mono" href="progetti.html">${L("← tutti i progetti", "← all projects")}</a>
        <h1 class="page-big">${L("Non trovato.", "Not found.")}</h1>
        <p class="page-lead">${L(`Questo progetto non esiste (o ha cambiato nome). Gli altri sono tutti nella pagina <a href="progetti.html">Progetti</a>.`, `This project doesn't exist (or it has been renamed). All the others are on the <a href="progetti.html">Projects</a> page.`)}</p>
      </section>`;
    };
    notFound();
    addEventListener("langchange", notFound);
    return;
  }

  const type = TYPES[p.type] || TYPES.app;
  // le persone con cui ho lavorato, come link se hanno un sito
  const withPeople = (p.with || []).map((w) => w.url ? `<a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.name)}</a>` : esc(w.name)).join(", ");

  // precedente e successivo: tutti i progetti dal più recente (in giro: dopo l'ultimo torna il primo)
  const order = projectsByDate().map((q) => q.id);
  const at = order.indexOf(p.id);
  const near = (d) => PROJECTS.find((q) => q.id === order[(at + d + order.length) % order.length]);
  const prev = at >= 0 ? near(-1) : null, next = at >= 0 ? near(1) : null;

  // il colore del tipo di progetto: il CSS lo usa per l'etichetta e i dettagli della pagina
  main.style.setProperty("--c", type.color);
  // scrive la pagina: all'inizio e di nuovo quando cambi lingua
  function render() {
    const title = esc(tr(p, "title"));
    const status = p.ongoing ? L("in corso", "ongoing") : p.maintained ? L("concluso, con qualche aggiornamento ogni tanto", "finished, with the occasional update") : L("concluso", "finished");
    document.title = `${tr(p, "title")} — Nicoleta Secu`;   // il titolo della scheda del browser
    // Tutta la pagina in un colpo. Per l'immagine grande in alto: se ho già trovato gli screenshot
    // uso il primo (shotSrcs[0]), altrimenti l'immagine scritta in content/projects.js.
    main.innerHTML = `
    <section class="page-head proj-head">
      <a class="proj-back mono rise" href="progetti.html">${L("← tutti i progetti", "← all projects")}</a>
      <div class="proj-tags rise"><span class="proj-badge">${esc(tr(type, "one"))}</span><span class="mono">${projectPeriod(p)}</span></div>
      <h1 class="page-big rise">${title}</h1>
      <p class="page-lead rise">${esc(tr(p, "teaser"))}</p>
    </section>

    <section class="proj-shot-wrap rise">
      <div class="proj-shot" id="projShot">
        ${p.image ? `<img id="projCover" src="${esc((shots[0] && !shots[0].video && shotSrcs[0]) || p.image)}" alt="${title}">` : `<div class="proj-ph">${title}</div>`}
        <span class="proj-glare" aria-hidden="true"></span>
      </div>
    </section>

    <section class="block">
      <div class="block-head mono"><span class="num">01</span> ${L("Cos'è", "What it is")}</div>
      <div class="proj-grid">
        <div class="proj-text rise"><p>${esc(tr(p, "description"))}</p></div>
        <dl class="proj-facts rise">
          <dt class="mono">${L("tipo", "type")}</dt><dd>${esc(tr(type, "one"))}</dd>
          <dt class="mono">${L("periodo", "period")}</dt><dd>${projectPeriod(p)}</dd>
          <dt class="mono">${L("stato", "status")}</dt><dd>${status}</dd>
          ${withPeople ? `<dt class="mono">${L("con", "with")}</dt><dd>${withPeople}</dd>` : ""}
          <dt class="mono">stack</dt><dd><div class="work-stack">${p.stack.map((s) => `<span>${esc(s)}</span>`).join("")}</div></dd>
        </dl>
      </div>
      ${p.link ? `<div class="proj-actions rise"><a class="btn" href="${esc(p.link)}" target="_blank" rel="noopener">${L("Apri il sito ↗", "Open the site ↗")}</a></div>` : ""}
    </section>

    <!-- le immagini del progetto: compaiono solo se nella sua cartella ce ne sono -->
    <section class="block proj-shots-block" id="projShotsBlock" hidden>
      <div class="block-head mono"><span class="num">02</span> ${L("Com'è fatto", "How it's made")}</div>
      <div class="proj-shots" id="projShots"></div>
    </section>

    ${prev && next ? `
    <nav class="proj-nav" aria-label="${L("Altri progetti", "Other projects")}">
      <a href="progetto.html?id=${esc(prev.id)}" class="proj-step"><span class="mono">${L("← precedente", "← previous")}</span><b>${esc(tr(prev, "title"))}</b></a>
      <a href="progetto.html?id=${esc(next.id)}" class="proj-step is-next"><span class="mono">${L("successivo →", "next →")}</span><b>${esc(tr(next, "title"))}</b></a>
    </nav>` : ""}`;
    setupTilt();
  }

  // Le immagini del progetto stanno in img/progetti/<id>/ e si chiamano 01, 02, 03…
  // (png, jpg o webp). Le cerco in ordine e mi fermo alla prima che manca: così basta
  // aggiungere un file nella cartella, senza toccare il codice. Le didascalie stanno in
  // content/projects.js (captions e captions_en), una per immagine nello stesso ordine:
  // lì funzionano sempre, anche aprendo il sito con un doppio clic sul file.
  const folder = `img/progetti/${p.id}/`;
  const EXT = ["png", "jpg", "webp", "jpeg"];
  // shots = le immagini trovate, shotSrcs = i loro indirizzi, caps = le didascalie nelle due lingue
  let shots = [], shotSrcs = [], caps = { it: p.captions || [], en: p.captions_en || [] };
  const capsNow = () => (inEnglish() && caps.en.length ? caps.en : caps.it);
  // Prova a caricare un'immagine: la Promise "risponde" con l'immagine se c'è, con null se non c'è.
  // (Una Promise è un valore che arriva più tardi; con await aspetto che arrivi.)
  //
  // cache: "no-cache" chiede ogni volta al server "è cambiata?". Serve perché le immagini si chiamano
  // sempre 01, 02, 03…: se le rinomini o le sostituisci, il browser altrimenti mostrerebbe quelle vecchie
  // che si ricorda. Se non è cambiata niente, il server risponde "uguale" e il browser usa la sua copia.
  // Con il file scaricato creo un indirizzo temporaneo (URL.createObjectURL) da dare all'immagine.
  //
  // Se apri il sito facendo doppio clic sul file (indirizzo file://), il browser non permette fetch:
  // in quel caso carico l'immagine nel modo classico, aggiungendo ?t=… all'indirizzo
  // perché sia sempre "nuovo" e il browser non usi una copia vecchia.
  const loadImage = (url) => new Promise((ok) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = url; });
  const tryLoad = async (src) => {
    if (location.protocol === "file:") return loadImage(`${src}?t=${Date.now()}`);
    try {
      const r = await fetch(src, { cache: "no-cache" });
      if (!r.ok) return null;
      return loadImage(URL.createObjectURL(await r.blob()));
    } catch (e) {
      return loadImage(`${src}?t=${Date.now()}`); // se fetch non va per qualche motivo, provo comunque
    }
  };
  async function findShots() {
    // Se il progetto ha dei video (videos in content/projects.js), uso quelli al posto delle immagini.
    // Li trasformo in oggetti con gli stessi nomi di un'immagine caricata (src, naturalWidth, naturalHeight),
    // così il resto del codice (le righe, la lightbox) funziona uguale; video: true dice che è un video.
    if (p.videos && p.videos.length)
      return p.videos.map((v) => ({ video: true, src: v.src, poster: v.poster || "", naturalWidth: v.w, naturalHeight: v.h }));
    const found = [];
    for (let i = 1; i <= 30; i++) {
      let hit = null;
      for (const ext of EXT) { hit = await tryLoad(`${folder}${String(i).padStart(2, "0")}.${ext}`); if (hit) break; }
      if (!hit) break;
      found.push(hit);
    }
    return found;
  }

  // mette le immagini nella pagina (anche di nuovo dopo un cambio di lingua)
  // Divide le immagini in righe, come in un album di foto: nella stessa riga hanno tutte la stessa
  // altezza e insieme occupano tutta la larghezza. Così non resta mai un'immagine da sola con
  // tanto spazio vuoto accanto (es. uno screenshot del telefono sotto uno del computer).
  //
  // ratios = larghezza diviso altezza di ogni immagine (uno screenshot del computer è circa 1,76,
  // uno del telefono circa 0,46). Una riga con dentro immagini di "rapporto" totale R, larga W,
  // viene alta W / R. Provo tutti i modi di spezzare la lista in righe (tenendo l'ordine) e scelgo
  // quello in cui le righe sono più vicine all'altezza ideale "ideal". È un calcolo a tappe
  // (programmazione dinamica): best[i] = il modo migliore di sistemare le prime i immagini.
  function rowsFor(ratios, W, gap) {
    const ideal = Math.max(W * 0.405, 200);    // su schermo largo: circa due screenshot del computer per riga
    const maxH = Math.max(innerHeight * 0.8, 320); // una riga troppo alta (es. due telefoni da soli) è scomoda
    const n = ratios.length;
    // Sul telefono lo schermo è stretto: affiancare uno screenshot del computer e uno del telefono
    // li renderebbe minuscoli. Lì metto un'immagine per riga, e gli screenshot del telefono a coppie.
    if (W < 600) {
      const rows = [];
      for (let i = 0; i < n; i++) {
        if (ratios[i] < 1 && ratios[i + 1] < 1) { rows.push([i, i + 1]); i++; }
        else rows.push([i]);
      }
      // sul telefono uno screenshot (o video) del telefono da solo verrebbe alto quasi tutto lo schermo: lo tengo più basso
      return { rows, maxH: Math.max(innerHeight * 0.6, 320) };
    }
    const best = [{ cost: 0, from: -1 }];
    for (let i = 1; i <= n; i++) {
      best[i] = { cost: Infinity, from: 0 };
      for (let j = i - 1; j >= 0; j--) {
        const R = ratios.slice(j, i).reduce((a, b) => a + b, 0);
        const h = (W - gap * (i - j - 1)) / R;
        if (h < 90) break;                         // righe troppo basse: inutile aggiungere altre immagini
        const cost = best[j].cost + (Math.min(h, maxH) - ideal) ** 2 + (h > maxH ? (h - maxH) * 400 : 0);
        if (cost < best[i].cost) best[i] = { cost, from: j };
      }
    }
    // ripercorro all'indietro le scelte fatte e ottengo le righe: [[0], [1, 2], …]
    const rows = [];
    for (let i = n; i > 0; i = best[i].from) rows.unshift([...Array(i - best[i].from).keys()].map((k) => best[i].from + k));
    return { rows, maxH };
  }

  // mette le immagini nella pagina (anche di nuovo dopo un cambio di lingua o di misura della finestra)
  function fillShots(animate) {
    if (!shots.length) return;
    const c = capsNow();
    const box = document.getElementById("projShots");
    document.getElementById("projShotsBlock").hidden = false; // prima la mostro, sennò non posso misurarla
    const W = box.clientWidth, gap = 22;
    const ratios = shots.map((im) => im.naturalWidth / im.naturalHeight);
    const { rows, maxH } = rowsFor(ratios, W, gap);
    // un video: parte da solo, senza audio, in loop. playsinline serve sull'iPhone, altrimenti
    // si aprirebbe a tutto schermo. Con "riduci movimento" attivo non parte da solo e ha i comandi.
    const media = (i) => shots[i].video
      ? `<video src="${esc(shots[i].src)}" poster="${esc(shots[i].poster)}" muted loop playsinline preload="metadata"${reduce ? " controls" : " autoplay"}></video>`
      : `<img src="${esc(shots[i].src)}" alt="${esc(c[i] || tr(p, "title") + " — " + L("immagine", "image") + " " + (i + 1))}" loading="lazy">`;
    const fig = (i) => {
      const cap = c[i] ? `<figcaption><span class="mono">${String(i + 1).padStart(2, "0")}</span> ${esc(c[i])}</figcaption>` : "";
      // flex-grow proporzionale al rapporto: in una riga ogni immagine prende spazio in proporzione alla sua
      // forma, e così vengono tutte della stessa altezza. (Moltiplico per 100 perché se la somma dei flex-grow
      // è minore di 1 il browser non distribuisce tutto lo spazio: uno screenshot del telefono da solo resterebbe stretto.)
      return `<figure class="proj-fig" data-i="${i}" style="flex-grow:${(ratios[i] * 100).toFixed(2)}"><button type="button" class="proj-zoom" data-cursor="ingrandisci" aria-label="${L("Ingrandisci", "Enlarge")} ${i + 1}">${media(i)}</button>${cap}</figure>`;
    };
    box.innerHTML = rows.map((r) => {
      // se la riga verrebbe più alta del massimo, la stringo e la metto al centro
      const R = r.reduce((a, i) => a + ratios[i], 0);
      const h = (W - gap * (r.length - 1)) / R;
      const style = h > maxH ? ` style="max-width:${Math.round(maxH * R + gap * (r.length - 1))}px"` : "";
      return `<div class="proj-row"${style}>${r.map(fig).join("")}</div>`;
    }).join("");
    // alcuni browser fanno partire da soli i video solo se "muted" è impostato anche da script
    if (!reduce) {
      box.querySelectorAll("video").forEach((v) => { v.muted = true; v.play().catch(() => {}); });
      syncVideos([...box.querySelectorAll("video")]);
    }
    box.querySelectorAll(".proj-fig").forEach((f, i) => {
      if (animate) setTimeout(() => f.classList.add("in"), reduce ? 0 : 60 + i * 70);
      else f.classList.add("in");
    });
  }

  // Tiene insieme i video dello stesso progetto (computer e telefono), così mostrano la stessa
  // sezione nello stesso momento. Funziona solo se i video durano uguale: aspetto di conoscere
  // le durate, li riporto tutti all'inizio e li faccio partire insieme. Poi il primo video fa da
  // "direttore": ogni volta che avanza controllo gli altri e, se sono indietro o avanti di più di
  // 15 centesimi di secondo (capita se uno si carica più lentamente), li rimetto al suo stesso punto.
  function syncVideos(vids) {
    if (vids.length < 2) return;
    const ready = (v) => new Promise((ok) => (v.readyState >= 1 ? ok() : v.addEventListener("loadedmetadata", ok, { once: true })));
    Promise.all(vids.map(ready)).then(() => {
      const [lead, ...rest] = vids;
      if (rest.some((v) => Math.abs(v.duration - lead.duration) > 0.3)) return; // durate diverse: non c'è niente da allineare
      vids.forEach((v) => { v.currentTime = 0; v.play().catch(() => {}); });
      lead.addEventListener("timeupdate", () => {
        rest.forEach((v) => { if (Math.abs(v.currentTime - lead.currentTime) > 0.15) v.currentTime = lead.currentTime; });
      });
    });
  }

  // cliccando un'immagine si apre a tutto schermo; frecce per scorrere, Esc per chiudere
  // la lightbox è la vista a tutto schermo; lightboxOpen diventa la funzione che la apre
  let lightboxOpen = null;
  function setupLightbox() {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.hidden = true;
    lb.innerHTML = `<button type="button" class="lb-close" aria-label="${L("Chiudi", "Close")}">×</button>
      <button type="button" class="lb-prev" aria-label="${L("Immagine precedente", "Previous image")}">←</button>
      <figure><img alt=""><video muted loop playsinline controls hidden></video><figcaption class="mono"></figcaption></figure>
      <button type="button" class="lb-next" aria-label="${L("Immagine successiva", "Next image")}">→</button>`;
    document.body.appendChild(lb);
    const img = lb.querySelector("img"), vid = lb.querySelector("video"), cap = lb.querySelector("figcaption");
    let at = 0;
    const show = (i) => {
      at = (i + shotSrcs.length) % shotSrcs.length;
      const c = capsNow();
      // nella vista grande mostro l'immagine oppure il video, e nascondo l'altro
      const isVideo = !!shots[at].video;
      img.hidden = isVideo; vid.hidden = !isVideo;
      if (isVideo) { vid.src = shotSrcs[at]; vid.muted = true; vid.play().catch(() => {}); }
      else { vid.pause(); img.src = shotSrcs[at]; }
      cap.textContent = `${String(at + 1).padStart(2, "0")} / ${String(shotSrcs.length).padStart(2, "0")}${c[at] ? " — " + c[at] : ""}`;
    };
    lightboxOpen = (i) => { show(i); lb.hidden = false; document.documentElement.classList.add("lb-open"); };
    const close = () => { vid.pause(); lb.hidden = true; document.documentElement.classList.remove("lb-open"); };
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", () => show(at - 1));
    lb.querySelector(".lb-next").addEventListener("click", () => show(at + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(at + 1);
      if (e.key === "ArrowLeft") show(at - 1);
    });
  }
  // la pagina si riscrive quando cambi lingua: ascolto i clic su tutto il contenuto
  main.addEventListener("click", (e) => {
    const f = e.target.closest(".proj-fig");
    if (f && lightboxOpen) lightboxOpen(+f.dataset.i);
  });

  // lo screenshot si inclina seguendo il mouse, con un riflesso di luce che si sposta
  function setupTilt() {
    const shot = document.getElementById("projShot");
    if (!shot || reduce) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      shot.style.transform = `rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
      shot.style.setProperty("--gx", `${(50 + x * 40).toFixed(1)}%`);
      shot.style.setProperty("--gy", `${(50 + y * 40).toFixed(1)}%`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    shot.addEventListener("pointermove", (e) => {
      const r = shot.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    shot.addEventListener("pointerleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  // si parte: scrivo la pagina
  render();
  // le parti compaiono una dopo l'altra
  main.querySelectorAll(".rise").forEach((el, i) => setTimeout(() => el.classList.add("in"), reduce ? 0 : 80 + i * 90));

  // cerco le immagini (ci vuole un attimo: per questo .then, "quando hai finito");
  // se non ce ne sono la sezione "Com'è fatto" resta nascosta
  findShots().then((found) => {
    if (!found.length) return;
    shots = found; shotSrcs = found.map((im) => im.src);
    // la prima immagine diventa anche quella grande in alto (più nitida di quella della galleria)
    const cover = document.getElementById("projCover");
    if (cover && !shots[0].video) cover.src = shotSrcs[0];
    fillShots(true);
    setupLightbox();
    // se la finestra cambia larghezza le righe migliori possono essere altre: le rifaccio
    // (aspetto che smetti di ridimensionare per 200 millesimi di secondo)
    let resizeTimer = 0, lastW = innerWidth;
    addEventListener("resize", () => {
      if (innerWidth === lastW) return;
      lastW = innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => fillShots(false), 200);
    });
  });

  addEventListener("langchange", () => {
    render();
    main.querySelectorAll(".rise").forEach((el) => el.classList.add("in"));
    fillShots(false);
  });
})();
