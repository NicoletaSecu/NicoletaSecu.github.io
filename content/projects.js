// I PROGETTI: tutte le informazioni sui progetti stanno qui, e le pagine le leggono da qui.
// Galleria della home, pagina Progetti e pagine dei singoli progetti si costruiscono da sole con questi dati.
//
//  Per aggiungerne uno, copia un blocco { ... } e cambia i testi; poi aggiungi il suo id
//  in GALLERY (più in basso) se vuoi che compaia nella galleria della home.
//  La sua pagina (progetto.html?id=...) si crea da sola con questi dati.
//
//  id:          nome breve per l'indirizzo della pagina, minuscolo e con i trattini (es. "air-math")
//  title / description:        testi in italiano
//  title_en / description_en / teaser_en:  testi in inglese (se mancano, si usa l'italiano)
//  teaser:      la frase breve che si vede nella galleria della home e nella pagina Progetti
//  date:        quando l'hai iniziato, "AAAA-MM"  (es. "2026-09")
//  until:       quando l'hai finito, "AAAA-MM" (facoltativo: se manca conta solo il mese di inizio)
//  ongoing:     true se ci lavori ancora ("in corso")
//  maintained:  true se ogni tanto fai ancora migliorie e bug fix
//  type:        una delle chiavi di TYPES qui sotto
//  image:       percorso di un'immagine (es. "img/meteo.png"), oppure "" per un segnaposto
//  link:        indirizzo del sito online, oppure ""
//  repo:        indirizzo del codice su GitHub, oppure "" (privateRepo: true se il codice c'è ma è privato)
//  stack:       linguaggi e strumenti usati, es. ["HTML", "CSS", "JavaScript", "React"]
//  with:        chi ha lavorato con te, es. [{ name: "Nome Cognome", url: "https://..." }]
//  captions / captions_en:  le didascalie delle immagini (img/progetti/<id>/01, 02…), in italiano e inglese,
//               una per immagine nello stesso ordine. Se cambi l'ordine delle immagini, cambia anche questo.

// I tipi di progetto, ognuno col suo colore (one: come si scrive per un progetto solo).
// I colori sono variabili del CSS (--t1, --t2, --t3, in css/wow.css), così si cambiano tutti da lì.
// label è il nome del filtro ("Esperimenti"), one l'etichetta su un singolo progetto ("Esperimento");
// _en sono le versioni inglesi.
const TYPES = {
  app:   { label: "Web app",     one: "Web app",     one_en: "Web app",    label_en: "Web app",     color: "var(--t1)" },
  study: { label: "Studio",      one: "Studio",      one_en: "Study",      label_en: "Study",       color: "var(--t2)" },
  lab:   { label: "Esperimenti", one: "Esperimento", one_en: "Experiment", label_en: "Experiments", color: "var(--t3)" },
};

const PROJECTS = [
  {
    id: "sync",
    title: "Sync",
    stack: ["HTML", "CSS", "JavaScript"],
    date: "2026-10",
    until: "2026-11",
    type: "app",
    teaser: "Traccia il ciclo con i dati solo sul telefono: niente account, niente server. Si installa e funziona offline.",
    teaser_en: "Track your cycle with data only on your phone: no account, no server. Installable and works offline.",
    description: "Un'app per tenere traccia del ciclo mestruale con i dati salvati solo sul telefono: niente account, niente server, niente pubblicità. Calendario, previsioni, sintomi, grafici e consigli per ogni fase; si installa sul telefono e funziona anche offline.",
    description_en: "An app to track the menstrual cycle with data stored only on your phone: no account, no server, no ads. Calendar, predictions, symptoms, charts and tips for each phase; it installs on your phone and works offline.",
    image: "img/sync.jpg",
    link: "https://syncycle.onrender.com",
    repo: "",
    privateRepo: true,
  },
  {
    id: "vecchio-portfolio",
    title: "Il vecchio portfolio",
    title_en: "The old portfolio",
    stack: ["HTML", "CSS", "JavaScript", "Matter.js"],
    date: "2026-10",
    until: "2026-11",
    type: "lab",
    teaser: "Una scrivania da esplorare e un bottone rosso che non dovresti premere. Con la fisica di Matter.js.",
    teaser_en: "A desk to explore and a red button you shouldn't press. With Matter.js physics.",
    description: "Una scrivania da esplorare, una linea della metro e un bottone rosso che non dovresti premere. HTML, CSS e JavaScript, con la fisica di Matter.js.",
    description_en: "A desk to explore, a metro line and a red button you really shouldn't press. HTML, CSS and JavaScript, with Matter.js physics.",
    image: "img/portfolio.jpg",
    link: "https://old-portfolio-secu.netlify.app/",
  },
  {
    id: "air-math",
    title: "Air Math",
    stack: ["HTML", "CSS", "JavaScript", "MediaPipe"],
    date: "2026-10",
    type: "lab",
    teaser: "Disegni una forma nell'aria davanti alla webcam e ne esce l'equazione. Un modo diverso per studiare le funzioni.",
    teaser_en: "Draw a shape in the air in front of your webcam and get its equation. A different way to study functions.",
    description: "Nato per divertimento: disegni una forma nell'aria davanti alla webcam e ottieni la sua equazione, dalle rette ai cerchi fino a un cuore. Ma è soprattutto un modo diverso per studiare le funzioni ed esercitarsi a riconoscerle.",
    description_en: "Born just for fun: draw a shape in the air in front of your webcam and get its equation, from lines and circles to a heart. But above all it's a different way to study functions and practise recognising them.",
    image: "img/progetti/air-math/01.webp",
    link: "https://airmath.onrender.com/",
    repo: "https://github.com/NicoletaSecu/AirMath",
    // le didascalie delle immagini in img/progetti/air-math/, una per immagine e nello stesso ordine
    captions: ["La schermata iniziale con i gesti", "Il riconoscimento della mano dalla webcam", "Una curva disegnata nell'aria diventa una cubica", "Una parabola disegnata col mouse"],
    captions_en: ["The start screen with the gestures", "Hand tracking from the webcam", "A curve drawn in the air becomes a cubic", "A parabola drawn with the mouse"],
  },
  {
    id: "b2-c1",
    title: "Da B2 a C1",
    title_en: "From B2 to C1",
    stack: ["HTML", "CSS", "JavaScript"],
    date: "2026-09",
    until: "2026-10",
    type: "study",
    teaser: "Preparare il Cambridge C1: 30 capitoli, 913 schede di lessico, quiz e prove a tempo.",
    teaser_en: "Preparing for Cambridge C1: 30 chapters, 913 vocabulary cards, quizzes and timed tests.",
    description: "Tutto per preparare il Cambridge C1 Advanced: 30 capitoli di teoria, 913 schede di lessico, quiz, prove a tempo e un quaderno degli errori che si svuota man mano.",
    description_en: "Everything to prepare for Cambridge C1 Advanced: 30 grammar chapters, 913 vocabulary cards, quizzes, timed mock tests and a mistakes notebook that empties as you improve.",
    image: "img/progetti/b2-c1/01.webp",
    link: "https://b2-to-c1.netlify.app/",
    repo: "https://github.com/NicoletaSecu/B2-to-C1",
    // le didascalie delle immagini in img/progetti/b2-c1/, una per immagine e nello stesso ordine
    captions: ["La home: da dove partire e a che punto sei", "Sul telefono: com'è fatto l'esame"],
    captions_en: ["Home: where to start and how far you've got", "On the phone: how the exam works"],
  },
  {
    id: "studio-java",
    title: "Studio Java",
    title_en: "Java Study Guide",
    stack: ["Java", "HTML", "CSS", "JavaScript"],
    date: "2026-08",
    type: "study",
    teaser: "Per l'esame di Programmazione 2: teoria, esercizi in formato d'esame e simulazioni a tempo.",
    teaser_en: "For the Programming 2 exam: theory, exam-style exercises and timed mock tests.",
    description: "Pensato per chi deve preparare l'esame di Programmazione 2: teoria a capitoli, esercizi nello stesso formato dello scritto e simulazioni cronometrate da 45 minuti.",
    description_en: "Made for students preparing the Programming 2 (Java) exam: theory chapters, exercises in the same format as the written exam and timed 45-minute mock exams.",
    image: "img/progetti/studio-java/01.webp",
    link: "https://easy-java.netlify.app/",
    repo: "https://github.com/NicoletaSecu/Studio-Java",
    // le didascalie delle immagini in img/progetti/studio-java/, una per immagine e nello stesso ordine
    captions: ["Gli esercizi: output, errori di compilazione e di runtime", "La pagina iniziale", "La teoria, divisa in capitoli", "Le prove d'esame con il timer da 45 minuti", "La scaletta per la prova di laboratorio"],
    captions_en: ["Exercises: output, compile-time and runtime errors", "The home page", "Theory, split into chapters", "Mock exams with the 45-minute timer", "A plan for the lab exam"],
  },
  {
    id: "waysafe",
    title: "WaySafe",
    stack: ["JavaScript", "React", "Node.js", "MongoDB"],
    date: "2026-01",
    until: "2026-05",
    type: "app",
    teaser: "Muoversi in città più sicuri: percorsi che evitano le zone a rischio, segnalazioni e un pulsante SOS.",
    teaser_en: "Getting around the city more safely: routes that avoid risky areas, reports and an SOS button.",
    description: "Progetto universitario: una web app per muoversi in città in modo più sicuro, con percorsi a piedi che evitano le zone a rischio, la mappa della sicurezza delle strade, segnalazioni geolocalizzate e un pulsante SOS. React, Node.js e MongoDB.",
    description_en: "University project: a web app to get around the city more safely, with walking routes that avoid risky areas, a map of street safety, geolocated reports and an SOS button. React, Node.js and MongoDB.",
    image: "img/progetti/waysafe/01.webp",
    link: "https://waysafe.onrender.com",
    repo: "https://github.com/davide-modena/WaySafe",
    with: [{ name: "Davide Modena", url: "https://davide-modena.github.io" }],
    // le didascalie delle immagini in img/progetti/waysafe/, una per immagine e nello stesso ordine
    captions: ["Il percorso più sicuro tra due punti", "La mappa della sicurezza delle strade", "Le segnalazioni da approvare", "Il profilo (con dati di prova)"],
    captions_en: ["The safest route between two places", "The street safety map", "Reports waiting for approval", "The profile (with test data)"],
  },
  {
    id: "flowdegree",
    title: "FlowDegree",
    stack: ["JavaScript", "React", "Python", "FastAPI", "SQL", "PostgreSQL"],
    date: "2026-05",
    until: "2026-08",
    maintained: true,
    type: "app",
    teaser: "Il piano di studi sotto controllo: esami, CFU, medie e conto alla rovescia. Full-stack con login Google.",
    teaser_en: "Your study plan under control: exams, credits, averages and countdowns. Full-stack with Google login.",
    description: "Web app full-stack per tenere sotto controllo il piano di studi universitario: esami, CFU, medie e conto alla rovescia agli appelli. React, FastAPI e PostgreSQL, con login Google.",
    description_en: "Full-stack web app to keep track of a university study plan: exams, credits, grade averages and a countdown to upcoming exams. React, FastAPI and PostgreSQL, with Google login.",
    image: "img/progetti/flowdegree/01.webp",
    link: "https://flow-degree.vercel.app/",
    repo: "https://github.com/NicoletaSecu/FlowDegree",
    // le didascalie delle immagini in img/progetti/flowdegree/, una per immagine e nello stesso ordine
    captions: ["La panoramica: crediti, esami e prossimi appelli", "Un anno con i suoi corsi e gli esami", "L'account e le preferenze"],
    captions_en: ["Overview: credits, exams and upcoming dates", "A year with its courses and exams", "Account and preferences"],
  },
];

// I miei preferiti: i progetti nella galleria che scorre di lato nella home (tutti gli altri stanno in progetti.html)
const GALLERY = ["sync", "air-math"];

// Tutti i progetti dal più recente (a parità di mese resta l'ordine scritto qui sopra)
// [...PROJECTS] fa una copia della lista, così l'ordine originale non cambia;
// localeCompare confronta le date scritte come testo ("2026-10" viene dopo "2026-09")
const projectsByDate = () => [...PROJECTS].sort((a, b) => b.date.localeCompare(a.date));

// La lingua scelta (la mette lo script in cima a ogni pagina) e il testo giusto di un progetto o di un tipo:
// tr(p, "title") dà title_en in inglese, se c'è, altrimenti title
const inEnglish = () => document.documentElement.lang === "en";
const tr = (o, key) => (inEnglish() && o[key + "_en"]) || o[key] || "";

// Il periodo di un progetto: "ott – nov 2026", "ott 2026 – in corso", "dic 2025 – feb 2026"
const MONTHS_IT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Esempio: date "2026-10" e until "2026-11" diventano "ott – nov 2026" (in inglese "Oct – Nov 2026").
function projectPeriod(p) {
  const months = inEnglish() ? MONTHS_EN : MONTHS_IT;
  const my = (d) => { const [y, m] = d.split("-"); return { m: months[+m - 1], y }; };
  const a = my(p.date);
  if (p.ongoing) return `${a.m} ${a.y} – ${inEnglish() ? "ongoing" : "in corso"}`;
  if (!p.until || p.until === p.date) return `${a.m} ${a.y}`;
  const b = my(p.until);
  return a.y === b.y ? `${a.m} – ${b.m} ${b.y}` : `${a.m} ${a.y} – ${b.m} ${b.y}`;
}
