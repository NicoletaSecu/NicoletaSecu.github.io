// ───────────── Lingua (IT / EN) ─────────────
// Quella scelta col selettore, altrimenti quella del browser (italiano → IT, tutto il resto → EN).
let lang = (() => {
  let saved;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  if (saved === "it" || saved === "en") return saved;
  return (navigator.language || "").toLowerCase().startsWith("it") ? "it" : "en";
})();

const t = (key) => STRINGS[lang][key] ?? STRINGS.it[key] ?? key;

// Prende il campo nella lingua giusta: per l'inglese prova prima "campo_en".
const pick = (obj, field) => (lang === "en" && obj[`${field}_en`]) || obj[field] || "";

function applyLanguage() {
  document.documentElement.lang = lang;
  document.title = t(document.body.dataset.title || "page.title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  const status = document.getElementById("formStatus");
  if (status) status.textContent = "";
  renderMetro();
  renderFilters();
  setupDarkroom();
}

function setupLanguageSwitch() {
  const box = document.querySelector(".lang");
  if (!box) return;
  box.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-lang]");
    if (!b || b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    try { localStorage.setItem("lang", lang); } catch (err) {}
    applyLanguage();
  });
}
