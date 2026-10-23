// ─────────────────────────────────────────────────────────────
//  TESTI DEL SITO IN ITALIANO E INGLESE
//  Ogni chiave corrisponde a un elemento con data-i18n="chiave" in index.html.
//  Le chiavi "toys." sono i testi dei giochi con gli oggetti caduti.
//  Per cambiare un testo, modificalo qui (in tutte e due le lingue).
// ─────────────────────────────────────────────────────────────

const STRINGS = {
  it: {
    "page.title": "Nicoleta Secu · Portfolio",
    "page.projectsTitle": "Progetti · Nicoleta Secu",
    "nav.label": "Sezioni",
    "nav.projects": "Progetti",
    "nav.about": "Chi sono",
    "nav.contact": "Contatti",

    "desk.label": "La mia scrivania",
    "desk.sticky": "<p>Ciao! Sono <strong>Nicoleta</strong>.</p><p>Questa è la mia scrivania: tocca gli oggetti per esplorare.</p>",
    "desk.notebook": "Progetti",
    "desk.notebookSub": "dal più recente",
    "desk.mug": "Chi sono",
    "desk.phone": "Contatti",
    "desk.phoneSub": "scrivimi",
    "desk.lamp": "luce",
    "desk.lampLabel": "Accendi o spegni la lampada (tema scuro)",
    "desk.polaroid": "io, più o meno",
    "desk.button": "NON<br>PREMERE",
    "desk.hint": "scorri giù per qualche progetto ↓",

    "home.projectsTitle": "Progetti scelti",
    "home.projectsLede": "Un paio di fermate della mia linea. Passa sopra le foto per svilupparle.",
    "home.seeAll": "Vedi tutta la linea →",

    "projects.title": "La linea dei progetti",
    "projects.lede": "Dal più recente al primo. Ogni fermata è un progetto: passa sopra le foto per svilupparle.",
    "projects.filterLabel": "Filtra per tipo",
    "projects.all": "Tutti",
    "projects.featured": "★ in evidenza",
    "projects.developing": "sviluppo…",
    "projects.open": "Apri il sito →",
    "projects.code": "Codice",
    "projects.terminus": "capolinea: qui è dove tutto è cominciato",

    "about.title": "Chi sono",
    "about.text": "Scrivi qui due o tre righe su di te: cosa fai, cosa ti piace, cosa stai imparando adesso.",

    "contact.title": "Scrivimi",
    "contact.lede": "Un'idea, una domanda, un ciao: lasciami un messaggio e ti rispondo appena posso.",
    "contact.email": "Email",
    "contact.phone": "Telefono <small>(facoltativo)</small>",
    "contact.subject": "Oggetto",
    "contact.message": "Messaggio",
    "contact.send": "Invia ✉",
    "contact.missing": "Manca qualcosa: controlla email, oggetto e messaggio.",
    "contact.notReady": "Il modulo non è ancora collegato (manca la chiave in script.js).",
    "contact.sending": "Invio in corso…",
    "contact.ok": "Messaggio inviato! Ti rispondo presto.",
    "contact.error": "Ops, non è partito. Riprova tra poco.",

    "footer.back": "Torna alla scrivania",
    "gravity.restore": "Rimetti tutto a posto",
    "gravity.hint": "Prova ad afferrare un oggetto e scuoterlo",
    "gravity.pencilHint": "Prendi la matita e scrivi sui fogli",
    "gravity.soakHint": "Appoggia un foglio sul caffè…",
    "toys.phoneTitle": "Drin drin!",
    "toys.phoneSub": "smettila di scuotermi",
    "lang.label": "Lingua",

    months: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
  },

  en: {
    "page.title": "Nicoleta Secu · Portfolio",
    "page.projectsTitle": "Projects · Nicoleta Secu",
    "nav.label": "Sections",
    "nav.projects": "Projects",
    "nav.about": "About",
    "nav.contact": "Contact",

    "desk.label": "My desk",
    "desk.sticky": "<p>Hi! I'm <strong>Nicoleta</strong>.</p><p>This is my desk: touch the objects to explore.</p>",
    "desk.notebook": "Projects",
    "desk.notebookSub": "newest first",
    "desk.mug": "About me",
    "desk.phone": "Contact",
    "desk.phoneSub": "write me",
    "desk.lamp": "light",
    "desk.lampLabel": "Turn the lamp on or off (dark theme)",
    "desk.polaroid": "me, more or less",
    "desk.button": "DO NOT<br>PRESS",
    "desk.hint": "scroll down for a few projects ↓",

    "home.projectsTitle": "Selected projects",
    "home.projectsLede": "A couple of stops from my line. Hover the photos to develop them.",
    "home.seeAll": "See the whole line →",

    "projects.title": "The project line",
    "projects.lede": "Newest to oldest. Every stop is a project: hover the photos to develop them.",
    "projects.filterLabel": "Filter by type",
    "projects.all": "All",
    "projects.featured": "★ featured",
    "projects.developing": "developing…",
    "projects.open": "Open the site →",
    "projects.code": "Code",
    "projects.terminus": "end of the line: this is where it all started",

    "about.title": "About me",
    "about.text": "Write two or three lines about yourself here: what you do, what you like, what you're learning right now.",

    "contact.title": "Write me",
    "contact.lede": "An idea, a question, a hello: leave me a message and I'll get back to you as soon as I can.",
    "contact.email": "Email",
    "contact.phone": "Phone <small>(optional)</small>",
    "contact.subject": "Subject",
    "contact.message": "Message",
    "contact.send": "Send ✉",
    "contact.missing": "Something's missing: check email, subject and message.",
    "contact.notReady": "The form isn't connected yet (the key in script.js is missing).",
    "contact.sending": "Sending…",
    "contact.ok": "Message sent! I'll get back to you soon.",
    "contact.error": "Oops, it didn't go through. Try again in a moment.",

    "footer.back": "Back to the desk",
    "gravity.restore": "Put everything back",
    "gravity.hint": "Try grabbing an object and shaking it",
    "gravity.pencilHint": "Grab the pencil and write on the pages",
    "gravity.soakHint": "Put a page on the coffee…",
    "toys.phoneTitle": "Ring ring!",
    "toys.phoneSub": "stop shaking me",
    "lang.label": "Language",

    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
};
