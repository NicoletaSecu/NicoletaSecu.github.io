//   Avvio 
// Qui si accende tutto. Ogni parte del sito vive nel suo file dentro js/.
// Lo stesso file serve sia la home (index.html) sia la pagina Progetti (progetti.html):
// ogni parte parte solo se nella pagina c'è il suo pezzo.
document.querySelector(".github").href = SETTINGS.githubUrl;

const polaroid = document.querySelector(".polaroid");
if (polaroid) {
  for (const [part, color] of Object.entries(SETTINGS.avatar)) polaroid.style.setProperty(`--${part}`, color);
}
// nella pagina Chi sono, cliccando il ritratto mi vedi alla scrivania mentre programmo (e ritorno)
const aboutPhoto = document.querySelector(".about-photo");
if (aboutPhoto) aboutPhoto.addEventListener("click", () => aboutPhoto.classList.toggle("coding"));

setupAnchors();
if (typeof setupFloats === "function") {
  setupFloats();
  setupStatement();
  setupReveal();
  setupNameSpread();
}
if (document.getElementById("desk")) {
  setupDeskScale();
  setupLamp();
  setupDeskSpread();
}
setupFilters();
setupPreview();
setupActiveRow();
setupLanguageSwitch();
applyLanguage();
if (document.getElementById("contactForm")) setupContactForm();
