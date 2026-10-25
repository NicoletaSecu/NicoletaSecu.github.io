
//  I PROGETTI
//  Per aggiungerne uno, copia un blocco { ... } e cambia i testi.
//  L'ordine qui non conta: il sito li ordina dal più recente
//  e li raggruppa per anno da solo.
//
//  title / description:        testi in italiano
//  title_en / description_en:  testi in inglese (se mancano, si usa l'italiano)
//  date:        quando l'hai iniziato, "AAAA-MM"  (es. "2026-09")
//  until:       quando l'hai finito, "AAAA-MM" (facoltativo: se manca conta solo il mese di inizio)
//  ongoing:     true se ci lavori ancora ("in corso")
//  maintained:  true se ogni tanto fai ancora migliorie e bug fix
//  type:        una delle chiavi di TYPES qui sotto
//  image:       percorso di un'immagine (es. "img/meteo.png"), oppure "" per un segnaposto
//  link:        indirizzo del sito online, oppure ""
//  repo:        indirizzo del codice su GitHub, oppure ""
//  featured:    true per metterlo "in evidenza"
//  home:        true per mostrarlo anche nella home (tutti gli altri stanno solo nella pagina Progetti)
//  with:        chi ha lavorato con te, es. [{ name: "Nome Cognome", url: "https://..." }]
//               (compare come "Con Nome Cognome", con il link al suo sito)

// Ogni tipo è una "linea della metro" con il suo colore.
const TYPES = {
  app:   { label: "Web app",     label_en: "Web app",     color: "#8c2f45" },
  study: { label: "Studio",      label_en: "Study",       color: "#2e86ab" },
  lab:   { label: "Esperimenti", label_en: "Experiments", color: "#4c9a2a" },
};

const PROJECTS = [
  {
    title: "Sync",
    date: "2026-10",
    type: "app",
    description: "Un'app per tenere traccia del ciclo mestruale con i dati salvati solo sul telefono: niente account, niente server, niente pubblicità. Calendario, previsioni, sintomi, grafici e consigli per ogni fase; si installa sul telefono e funziona anche offline.",
    description_en: "An app to track the menstrual cycle with data stored only on your phone: no account, no server, no ads. Calendar, predictions, symptoms, charts and tips for each phase; it installs on your phone and works offline.",
    image: "img/sync.jpg",
    link: "https://syncycle.onrender.com",
    repo: "", // il repository è privato: niente link al codice
  },
  {
    title: "Questo portfolio",
    title_en: "This portfolio",
    date: "2026-10",
    ongoing: true,
    type: "lab",
    description: "Una scrivania da esplorare, una linea della metro e un bottone rosso che non dovresti premere. HTML, CSS e JavaScript, con la fisica di Matter.js.",
    description_en: "A desk to explore, a metro line and a red button you really shouldn't press. HTML, CSS and JavaScript, with Matter.js physics.",
    image: "img/portfolio.jpg",
    link: "https://nicoletasecu.github.io/",
    repo: "https://github.com/NicoletaSecu/NicoletaSecu.github.io",
    home: true,
  },
  {
    title: "Air Math",
    date: "2026-10",
    type: "lab",
    description: "Nato per divertimento: disegni una forma nell'aria davanti alla webcam e ottieni la sua equazione, dalle rette ai cerchi fino a un cuore. Ma è soprattutto un modo diverso per studiare le funzioni ed esercitarsi a riconoscerle.",
    description_en: "Born just for fun: draw a shape in the air in front of your webcam and get its equation, from lines and circles to a heart. But above all it's a different way to study functions and practise recognising them.",
    image: "img/airmath.jpg",
    link: "https://airmath.onrender.com/",
    repo: "https://github.com/NicoletaSecu/AirMath",
    featured: true,
    home: true,
  },
  {
    title: "Da B2 a C1",
    title_en: "From B2 to C1",
    date: "2026-09",
    until: "2026-10",
    type: "study",
    description: "Tutto per preparare il Cambridge C1 Advanced: 30 capitoli di teoria, 913 schede di lessico, quiz, prove a tempo e un quaderno degli errori che si svuota man mano.",
    description_en: "Everything to prepare for Cambridge C1 Advanced: 30 grammar chapters, 913 vocabulary cards, quizzes, timed mock tests and a mistakes notebook that empties as you improve.",
    image: "img/b2-to-c1.jpg",
    link: "https://b2-to-c1.netlify.app/",
    repo: "https://github.com/NicoletaSecu/B2-to-C1",
  },
  {
    title: "Studio Java",
    title_en: "Java Study Guide",
    date: "2026-08",
    type: "study",
    description: "Pensato per chi deve preparare l'esame di Programmazione 2 a UniTN: teoria a capitoli, esercizi nello stesso formato dello scritto e simulazioni cronometrate da 45 minuti.",
    description_en: "Made for students preparing the Programming 2 (Java) exam at the University of Trento (UniTN): theory chapters, exercises in the same format as the written exam and timed 45-minute mock exams.",
    image: "img/studio-java.jpg",
    link: "https://easy-java.netlify.app/",
    repo: "https://github.com/NicoletaSecu/Studio-Java",
  },
  {
    title: "WaySafe",
    date: "2026-01",
    until: "2026-05",
    type: "app",
    description: "Progetto universitario: una web app per muoversi a Trento in modo più sicuro, con percorsi a piedi che evitano le zone a rischio, la mappa della sicurezza delle strade, segnalazioni geolocalizzate e un pulsante SOS. React, Node.js e MongoDB.",
    description_en: "University project: a web app to get around Trento more safely, with walking routes that avoid risky areas, a map of street safety, geolocated reports and an SOS button. React, Node.js and MongoDB.",
    image: "img/waysafe.jpg",
    link: "https://waysafe.onrender.com",
    repo: "https://github.com/davide-modena/WaySafe",
    with: [{ name: "Davide Modena", url: "https://davide-modena.github.io" }],
  },
  {
    title: "FlowDegree",
    date: "2026-05",
    until: "2026-08",
    maintained: true,
    type: "app",
    description: "Web app full-stack per tenere sotto controllo il piano di studi universitario: esami, CFU, medie e conto alla rovescia agli appelli. React, FastAPI e PostgreSQL, con login Google.",
    description_en: "Full-stack web app to keep track of a university study plan: exams, credits, grade averages and a countdown to upcoming exams. React, FastAPI and PostgreSQL, with Google login.",
    image: "img/flowdegree.webp",
    link: "https://flow-degree.vercel.app/",
    repo: "https://github.com/NicoletaSecu/FlowDegree",
    featured: true,
  },
];
