// Nella pagina Contatti: un sigillo di ceralacca che si forma mentre scrivi il
// messaggio e si imprime quando invii. Non tocca l'invio vero (quello sta in
// contact.js): è solo il gesto di "sigillare la lettera".
(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const msg = form.querySelector('textarea[name="message"]');
  const foot = form.querySelector(".letter-foot");
  if (!msg || !foot) return;

  const seal = document.createElement("div");
  seal.className = "sigillo";
  seal.setAttribute("aria-hidden", "true");
  seal.innerHTML = '<span class="sigillo-wax"><span class="sigillo-mono">NS</span></span>';
  foot.appendChild(seal);

  const FULL = 120; // a questa lunghezza del messaggio il sigillo è pronto
  const grow = () => {
    const p = Math.min(msg.value.trim().length / FULL, 1);
    seal.style.setProperty("--p", p.toFixed(3));
    seal.classList.toggle("ready", p >= 1);
  };
  msg.addEventListener("input", grow);
  grow();

  // si imprime solo se il modulo è valido (se manca qualcosa, niente stampo)
  form.addEventListener("submit", () => {
    if (msg.value.trim() && form.checkValidity()) {
      seal.classList.remove("stamped");
      void seal.offsetWidth; // riavvia l'animazione
      seal.classList.add("stamped");
    }
  });
  // dopo un invio riuscito contact.js fa form.reset(): il sigillo torna a formarsi
  form.addEventListener("reset", () => {
    seal.classList.remove("stamped");
    requestAnimationFrame(grow);
  });
})();
