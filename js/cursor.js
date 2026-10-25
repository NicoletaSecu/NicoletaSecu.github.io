// ───────────── Il pallino che insegue il mouse ─────────────
// Un piccolo cerchio terracotta segue il mouse con un leggero ritardo.
// Sopra un progetto (anche le immagini intorno al nome) diventa un cerchio grande con scritto "Apri"; sopra gli altri link
// e bottoni diventa un anello. La freccia normale resta, così cliccare e trascinare
// sono comodi come sempre. Niente pallino su telefono e per chi ha ridotto le animazioni.
(function () {
  if (matchMedia("(hover: none)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const FOLLOW = 0.35; // quanto in fretta insegue (1 = subito, più basso = più ritardo)

  const dot = document.createElement("div");
  dot.className = "cursor-follow";
  dot.setAttribute("aria-hidden", "true");
  dot.innerHTML = "<span></span>";
  document.body.appendChild(dot);
  const label = dot.querySelector("span");

  let x = innerWidth / 2, y = innerHeight / 2; // dove sta il pallino
  let tx = x, ty = y;                           // dove sta il mouse
  let running = false;

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    tx = e.clientX;
    ty = e.clientY;
    dot.classList.add("on");
    if (!running) { running = true; requestAnimationFrame(frame); }
  });
  document.addEventListener("pointerleave", () => dot.classList.remove("on"));

  // sopra cosa siamo? progetti → "Apri"; altri link e bottoni → anello
  document.addEventListener("pointerover", (e) => {
    const project = e.target.closest(".fl-main, .fl-float");
    const clickable = e.target.closest("a, button, .chip, input, textarea, [data-gravity]");
    dot.classList.toggle("big", !!project);
    dot.classList.toggle("ring", !project && !!clickable);
    label.textContent = project ? t("cursor.open") : "";
  });

  function frame() {
    x += (tx - x) * FOLLOW;
    y += (ty - y) * FOLLOW;
    dot.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    // quando ha raggiunto il mouse si ferma, così non consuma
    if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) requestAnimationFrame(frame);
    else running = false;
  }
})();
