// ─────────────────────────────────────────────────────────────
//  TESTI DEL SITO IN ITALIANO E INGLESE
//  Ogni chiave corrisponde a un elemento con data-i18n="chiave" in index.html
//  o progetti.html. Per cambiare un testo, modificalo qui (in tutte e due le lingue).
//  Le chiavi "toys." sono i testi dei giochi con gli oggetti caduti.
// ─────────────────────────────────────────────────────────────

const STRINGS = {
  it: {
    "page.title": "Nicoleta Secu · Portfolio",
    "page.projectsTitle": "Progetti · Nicoleta Secu",
    "lang.label": "Lingua",

    // barra in alto
    "nav.label": "Sezioni",
    "nav.projects": "Progetti",
    "nav.about": "Chi sono",
    "nav.desk": "Scrivania",
    "nav.contact": "Contatti",

    // apertura: il nome enorme
    "hero.label": "Presentazione",
    "intro.kicker": "Docente ITP · Sviluppatrice web",
    "intro.lead": "Insegno, programmo e trasformo le idee <em>in siti che si possono usare.</em>",
    "hero.scroll": "Scorri per esplorare ↓",

    // etichette numerate delle sezioni
    "label.projects": "Progetti",
    "label.about": "Chi sono",
    "label.desk": "Gioca con la mia scrivania",
    "label.contact": "Contatti",

    // elenco dei progetti
    "home.more": "Tutti i progetti, con i filtri ↗",
    "list.site": "Sito ↗",
    "list.code": "Codice ↗",

    // pagina Progetti
    "projects.title": "Tutti i progetti",
    "projects.lede": "Dal più recente al primo. Passa sopra un progetto per vederlo.",
    "projects.filterLabel": "Filtra per tipo",
    "projects.all": "Tutti",
    "projects.terminus": "capolinea: qui è dove tutto è cominciato",

    // chi sono: la frase grande si accende parola per parola; sotto la scheda
    "about.statement": "Chi sono? Una ragazza piena di idee, questo è sicuro. E pronta ad affrontare più di quanto immagini, a volte persino più di quanto immagini io.",
    "about.details":
      '<dl class="about-facts">' +
        '<dt>Oggi</dt><dd>Docente ITP di Informatica e Matematica, dal 2025</dd>' +
        '<dt>Laurea</dt><dd>Informatica</dd>' +
        '<dt>Diploma</dt><dd>Amministrazione, Finanza e Marketing, articolazione Sistemi Informativi Aziendali (SIA)</dd>' +
      '</dl>' +
      '<p>Esperienza? Sempre in crescita, sempre in cammino verso qualcosa di nuovo da imparare. La dimostrazione? <a href="#progetti">I miei progetti ↑</a></p>',

    // scrivania
    "desk.label": "La mia scrivania",
    "desk.note": "Tocca gli oggetti. E se proprio vuoi, premi il bottone rosso.",
    "desk.sticky": "<p>Ciao!</p><p>Questa è la mia scrivania: tocca gli oggetti per esplorare.</p>",
    "desk.notebook": "Progetti",
    "desk.notebookSub": "dal più recente",
    "desk.mug": "Chi sono",
    "desk.phone": "Contatti",
    "desk.phoneSub": "scrivimi",
    "desk.lamp": "luce",
    "desk.lampLabel": "Accendi o spegni la lampada (tema scuro)",
    "desk.polaroid": "io, più o meno",
    "desk.button": "NON<br>PREMERE",

    // contatti
    "contact.big": "Scriviamoci.",
    "contact.email": "Email",
    "contact.phone": "Telefono <small>(facoltativo)</small>",
    "contact.subject": "Oggetto",
    "contact.message": "Messaggio",
    "contact.send": "Invia ✉",
    "contact.missing": "Manca qualcosa: controlla email, oggetto e messaggio.",
    "contact.notReady": "Il modulo non è ancora collegato (manca la chiave in content/settings.js).",
    "contact.sending": "Invio in corso…",
    "contact.ok": "Messaggio inviato! Ti rispondo presto.",
    "contact.error": "Ops, non è partito. Riprova tra poco.",

    // piè di pagina
    "footer.back": "← Torna alla home",

    // gravità e giochi
    "gravity.restore": "Rimetti tutto a posto",
    "gravity.hint": "Prova ad afferrare un oggetto e scuoterlo",
    "gravity.pencilHint": "Prendi la matita e scrivi sui fogli",
    "gravity.soakHint": "Appoggia un foglio sul caffè…",
    "toys.phoneTitle": "Drin drin!",
    "toys.phoneSub": "smettila di scuotermi",

    months: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
  },

  en: {
    "page.title": "Nicoleta Secu · Portfolio",
    "page.projectsTitle": "Projects · Nicoleta Secu",
    "lang.label": "Language",

    "nav.label": "Sections",
    "nav.projects": "Projects",
    "nav.about": "About",
    "nav.desk": "Desk",
    "nav.contact": "Contact",

    "hero.label": "Introduction",
    "intro.kicker": "Computer Science teacher · Web developer",
    "intro.lead": "I teach, I code, and I turn ideas <em>into websites people can actually use.</em>",
    "hero.scroll": "Scroll to explore ↓",

    "label.projects": "Projects",
    "label.about": "About me",
    "label.desk": "Play with my desk",
    "label.contact": "Contact",

    "home.more": "All projects, with filters ↗",
    "list.site": "Site ↗",
    "list.code": "Code ↗",

    "projects.title": "All projects",
    "projects.lede": "Newest first. Hover a project to see it.",
    "projects.filterLabel": "Filter by type",
    "projects.all": "All",
    "projects.terminus": "end of the line: this is where it all started",

    "about.statement": "Who am I? A girl full of ideas, that's for sure. And ready to take on more than you'd expect, sometimes even more than I'd expect.",
    "about.details":
      '<dl class="about-facts">' +
        '<dt>Now</dt><dd>Computer Science and Maths teacher (ITP, technical-practical teacher), since 2025</dd>' +
        '<dt>Degree</dt><dd>Computer Science</dd>' +
        '<dt>Diploma</dt><dd>Administration, Finance and Marketing, Business Information Systems track (SIA)</dd>' +
      '</dl>' +
      '<p>Experience? Always growing, always on the way to something new to learn. The proof? <a href="#progetti">My projects ↑</a></p>',

    "desk.label": "My desk",
    "desk.note": "Touch the objects. And if you really must, press the red button.",
    "desk.sticky": "<p>Hi!</p><p>This is my desk: touch the objects to explore.</p>",
    "desk.notebook": "Projects",
    "desk.notebookSub": "newest first",
    "desk.mug": "About me",
    "desk.phone": "Contact",
    "desk.phoneSub": "write me",
    "desk.lamp": "light",
    "desk.lampLabel": "Turn the lamp on or off (dark theme)",
    "desk.polaroid": "me, more or less",
    "desk.button": "DO NOT<br>PRESS",

    "contact.big": "Let's talk.",
    "contact.email": "Email",
    "contact.phone": "Phone <small>(optional)</small>",
    "contact.subject": "Subject",
    "contact.message": "Message",
    "contact.send": "Send ✉",
    "contact.missing": "Something's missing: check email, subject and message.",
    "contact.notReady": "The form isn't connected yet (the key in content/settings.js is missing).",
    "contact.sending": "Sending…",
    "contact.ok": "Message sent! I'll get back to you soon.",
    "contact.error": "Oops, it didn't go through. Try again in a moment.",

    "footer.back": "← Back home",

    "gravity.restore": "Put everything back",
    "gravity.hint": "Try grabbing an object and shaking it",
    "gravity.pencilHint": "Grab the pencil and write on the pages",
    "gravity.soakHint": "Put a page on the coffee…",
    "toys.phoneTitle": "Ring ring!",
    "toys.phoneSub": "stop shaking me",

    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
};
