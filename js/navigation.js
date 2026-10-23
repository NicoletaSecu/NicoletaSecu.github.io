// ───────────── Link interni e ricarica ─────────────
// I link come "#progetti" scorrono alla sezione senza scriverla nell'indirizzo,
// così quando ricarichi la pagina riparti sempre dall'inizio.
// Se arrivi da un'altra pagina con un indirizzo tipo "index.html#contatti",
// la pagina scende a quella sezione una volta sola, poi l'indirizzo torna pulito.
function setupAnchors() {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const arrivedAt = location.hash ? document.getElementById(location.hash.slice(1)) : null;
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  window.scrollTo({ top: 0, behavior: "instant" });
  // aspetto che la pagina sia completa (immagini comprese), così la sezione è al posto giusto,
  // e ci salto subito senza animazione
  if (arrivedAt) addEventListener("load", () => arrivedAt.scrollIntoView({ behavior: "instant" }), { once: true });

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || e.defaultPrevented) return;
    const id = link.getAttribute("href").slice(1);
    const target = id === "top" ? document.body : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (id === "top") window.scrollTo({ top: 0, behavior: "smooth" });
    else target.scrollIntoView({ behavior: "smooth" });
  });
}
