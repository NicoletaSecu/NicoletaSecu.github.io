// ───────────── Dimensioni della scrivania ─────────────
// Gli oggetti sono misurati in "--u" = 1% della larghezza della scrivania (2.2% su telefono).
function setupDeskScale() {
  const desk = document.getElementById("desk");
  const update = () => {
    const pct = matchMedia("(max-width: 700px)").matches ? 2.2 : 1;
    desk.style.setProperty("--u", `${(desk.clientWidth * pct) / 100}px`);
  };
  new ResizeObserver(update).observe(desk);
  update();
}

// ───────────── Lampada = tema giorno/notte ─────────────
function setupLamp() {
  document.getElementById("lamp").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
}
