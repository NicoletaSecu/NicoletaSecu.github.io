// TEMPORANEO: un selettore in basso a sinistra per provare le palette dei colori sulle pagine vere.
// "Ora" sono i colori di adesso, A, B e C le tre proposte (le trovi in fondo a css/wow.css).
// La scelta si ricorda (localStorage) anche cambiando pagina. Scelta la palette, si toglie questo file
// e la riga <script src="js/prova-palette.js"> dalle pagine.
(function () {
  const root = document.documentElement;
  const OPTS = [["", "Ora"], ["a", "A"], ["b", "B"], ["c", "C"]];
  // mette la classe pal-a / pal-b / pal-c su <html> (o nessuna, per i colori di adesso)
  const apply = (k) => {
    OPTS.forEach(([o]) => o && root.classList.toggle("pal-" + o, o === k));
    try { localStorage.setItem("palette", k); } catch (e) {}
    bar.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.k === k));
  };
  const bar = document.createElement("div");
  bar.className = "pal-switch";
  bar.innerHTML = "<span>Prova colori</span>" + OPTS.map(([k, t]) => `<button type="button" data-k="${k}">${t}</button>`).join("");
  document.body.appendChild(bar);
  bar.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) apply(b.dataset.k); });
  let saved = "a";
  try { const s = localStorage.getItem("palette"); if (s !== null) saved = s; } catch (e) {}
  apply(saved);
})();
