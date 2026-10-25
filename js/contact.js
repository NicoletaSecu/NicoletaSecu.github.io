//    Modulo "Scrivimi" 
// I messaggi passano da Web3Forms, che li inoltra alla tua email senza mostrarla sul sito.
// La chiave si imposta in content/settings.js.
function setupContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const button = form.querySelector(".send");
  const say = (text, kind) => { status.textContent = text; status.className = `form-status ${kind || ""}`; };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (data.get("botcheck")) return;
    if (!form.checkValidity()) {
      say(t("contact.missing"), "err");
      form.querySelector(":invalid").focus();
      return;
    }
    if (!SETTINGS.web3formsKey) {
      say(t("contact.notReady"), "err");
      return;
    }

    button.disabled = true;
    say(t("contact.sending"));
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: SETTINGS.web3formsKey,
          subject: `[Portfolio] ${data.get("subject")}`,
          from_name: "Portfolio",
          email: data.get("email"),
          replyto: data.get("email"),
          telefono: data.get("phone") || "—",
          oggetto: data.get("subject"),
          lingua: lang.toUpperCase(),
          message: data.get("message"),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      form.reset();
      say(t("contact.ok"), "ok");
    } catch (err) {
      say(t("contact.error"), "err");
    } finally {
      button.disabled = false;
    }
  });
}
