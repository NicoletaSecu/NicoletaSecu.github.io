// ─────────────────────────────────────────────────────────────
//  I TUOI PROGETTI
//  Per aggiungerne uno, copia un blocco { ... } e cambia i testi.
//  L'ordine qui non conta: il sito li ordina dal più recente
//  e li raggruppa per anno da solo.
//
//  title / description:        testi in italiano
//  title_en / description_en:  testi in inglese (se mancano, si usa l'italiano)
//  date:        "AAAA-MM"  (es. "2026-09")
//  type:        una delle chiavi di TYPES qui sotto
//  image:       percorso di un'immagine (es. "img/meteo.png"), oppure "" per un segnaposto
//  link:        indirizzo del sito online, oppure ""
//  repo:        indirizzo del codice su GitHub, oppure ""
//  featured:    true per metterlo "in evidenza"
//  home:        true per mostrarlo anche nella home (tutti gli altri stanno solo nella pagina Progetti)
// ─────────────────────────────────────────────────────────────

// Ogni tipo è una "linea della metro" con il suo colore.
const TYPES = {
  app:   { label: "Web app",     label_en: "Web app",     color: "#e4572e" },
  study: { label: "Studio",      label_en: "Study",       color: "#2e86ab" },
  lab:   { label: "Esperimenti", label_en: "Experiments", color: "#4c9a2a" },
};

const PROJECTS = [
  {
    title: "Questo portfolio",
    title_en: "This portfolio",
    date: "2026-10",
    type: "lab",
    description: "Una scrivania da esplorare, una linea della metro e un bottone rosso che non dovresti premere. HTML, CSS e JavaScript, con la fisica di Matter.js.",
    description_en: "A desk to explore, a metro line and a red button you really shouldn't press. HTML, CSS and JavaScript, with Matter.js physics.",
    image: "img/portfolio.jpg",
    link: "",
    repo: "",
    home: true,
  },
  {
    title: "Air Math",
    date: "2026-10",
    type: "lab",
    description: "Disegni una forma nell'aria davanti alla webcam e ottieni la sua equazione: rette, cerchi, parabole, fino a un cuore. Tracciamento della mano con MediaPipe.",
    description_en: "Draw a shape in the air in front of your webcam and get its equation: lines, circles, parabolas, even a heart. Hand tracking with MediaPipe.",
    image: "img/airmath.jpg",
    link: "https://airmath.onrender.com/",
    repo: "https://github.com/NicoletaSecu/AirMath",
    featured: true,
    home: true,
  },
  {
    title: "Da B2 a C1",
    title_en: "From B2 to C1",
    date: "2026-10",
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
    description: "Manuale online per l'esame di Programmazione 2: teoria a capitoli, esercizi in formato esame e simulazioni cronometrate da 45 minuti. HTML, CSS e JavaScript puri.",
    description_en: "Online study guide for the Programming 2 (Java) exam: theory chapters, exam-style exercises and timed 45-minute mock exams. Plain HTML, CSS and JavaScript.",
    image: "img/studio-java.jpg",
    link: "https://easy-java.netlify.app/",
    repo: "https://github.com/NicoletaSecu/Studio-Java",
  },
  {
    title: "FlowDegree",
    date: "2026-07",
    type: "app",
    description: "Web app full-stack per tenere sotto controllo il piano di studi universitario: esami, CFU, medie e conto alla rovescia agli appelli. React, FastAPI e PostgreSQL, con login Google.",
    description_en: "Full-stack web app to keep track of a university study plan: exams, credits, grade averages and a countdown to upcoming exams. React, FastAPI and PostgreSQL, with Google login.",
    image: "img/flowdegree.webp",
    link: "https://flow-degree.vercel.app/",
    repo: "https://github.com/NicoletaSecu/FlowDegree",
    featured: true,
  },
];
