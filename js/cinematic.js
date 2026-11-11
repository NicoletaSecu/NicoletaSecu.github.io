// L'atmosfera notturna del sito: un'aurora che si muove piano dietro a tutto,
// un velo di grana, la vignettatura ai bordi e l'ora locale in alto.
// Tutto iniettato da qui, così ogni pagina ha l'effetto senza toccarne il markup.
// Si vede solo col tema scuro (lo stile sta in css/style.css): di giorno resta
// il sito chiaro di prima.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("cine");

  // gli effetti di fondo stanno dietro a tutto e non si cliccano
  const fx = document.createElement("div");
  fx.className = "cine-fx";
  fx.setAttribute("aria-hidden", "true");
  fx.innerHTML =
    '<div class="cine-aurora"></div>' +
    '<div class="cine-vignette"></div>' +
    '<div class="cine-grain"></div>';
  document.body.prepend(fx);
  if (reduce) fx.classList.add("still"); // con le animazioni ridotte l'aurora resta ferma

  // in alto: un pallino "dal vivo" e l'ora locale che scorre
  const top = document.querySelector(".fl-top-right");
  if (top) {
    const hud = document.createElement("div");
    hud.className = "cine-hud";
    hud.innerHTML =
      '<span class="cine-live" aria-hidden="true"></span>' +
      '<time class="cine-clock" aria-label="Ora locale">--:--:--</time>';
    top.insertBefore(hud, top.firstChild);
    const clock = hud.querySelector(".cine-clock");
    const p = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      clock.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
      clock.dateTime = d.toISOString();
    };
    tick();
    setInterval(tick, 1000);
  }
})();
