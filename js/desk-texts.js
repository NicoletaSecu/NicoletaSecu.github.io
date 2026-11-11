// I testi della scrivania e dei suoi giochi (prima stavano in content/texts.js).
// gravity.js e toys.js li chiedono con t("chiave"); in inglese si usa DESK_TEXTS_EN.
// Per cambiare una frase basta cambiarla qui (in tutte e due le liste, italiano e inglese).
// Le chiavi "crash.*" sono la schermata di errore quando giochi troppo;
// "obj.*" è come si chiama ogni oggetto e "fx.*" la battuta su cosa gli hai fatto.
const DESK_TEXTS = {
  "desk.phone": "Contatti",
  "desk.phoneSub": "scrivimi",
  "gravity.hint": "Prova ad afferrare un oggetto e scuoterlo",
  "gravity.pencilHint": "Prendi la matita e scrivi sui fogli",
  "gravity.soakHint": "Appoggia un foglio sul caffè…",
  "toys.phoneTitle": "Drin drin!",
  "toys.phoneSub": "smettila di scuotermi",
  "crash.title": "Troppo divertimento.",
  "crash.file": "scrivania.js",
  "crash.error": "TroppoDivertimentoError",
  "crash.why": "la scrivania ha bisogno di una pausa",
  "crash.grab": "afferra",
  "crash.shake": "scuoti",
  "crash.reboot": "riavvio la scrivania…",
  "crash.step1": "raccolgo i fogli",
  "crash.step2": "asciugo il caffè",
  "crash.step3": "rimetto ogni cosa al suo posto",
  "crash.done": "fatto. Ma stavolta fai piano :)",
  "crash.skip": "ok, mi calmo",
  "obj.notebook": "quaderno", "fx.notebook": "pagine dappertutto",
  "obj.mug": "tazza", "fx.mug": "caffè sul pavimento",
  "obj.phone": "telefono", "fx.phone": "squilla senza motivo",
  "obj.lamp": "lampada", "fx.lamp": "luce a intermittenza",
  "obj.polaroid": "polaroid", "fx.polaroid": "capelli da rifare",
  "obj.pencil": "matita", "fx.pencil": "scarabocchi ovunque",
  "obj.sticky": "biglietto", "fx.sticky": "messaggio illeggibile",
  "obj.button": "bottoneRosso", "fx.button": "te l'avevo detto di non premerlo",
  "obj.thing": "oggetto", "fx.thing": "un bel po' di confusione",
};
const DESK_TEXTS_EN = {
  "desk.phone": "Contact",
  "desk.phoneSub": "write to me",
  "gravity.hint": "Try grabbing an object and shaking it",
  "gravity.pencilHint": "Grab the pencil and write on the pages",
  "gravity.soakHint": "Put a page on the coffee…",
  "toys.phoneTitle": "Ring ring!",
  "toys.phoneSub": "stop shaking me",
  "crash.title": "Too much fun.",
  "crash.file": "desk.js",
  "crash.error": "TooMuchFunError",
  "crash.why": "the desk needs a break",
  "crash.grab": "grab",
  "crash.shake": "shake",
  "crash.reboot": "rebooting the desk…",
  "crash.step1": "picking up the pages",
  "crash.step2": "mopping up the coffee",
  "crash.step3": "putting everything back in its place",
  "crash.done": "done. But go easy this time :)",
  "crash.skip": "ok, I'll calm down",
  "obj.notebook": "notebook", "fx.notebook": "pages everywhere",
  "obj.mug": "mug", "fx.mug": "coffee on the floor",
  "obj.phone": "phone", "fx.phone": "ringing for no reason",
  "obj.lamp": "lamp", "fx.lamp": "flickering light",
  "obj.polaroid": "polaroid", "fx.polaroid": "hair ruined",
  "obj.pencil": "pencil", "fx.pencil": "scribbles everywhere",
  "obj.sticky": "note", "fx.sticky": "message unreadable",
  "obj.button": "redButton", "fx.button": "I told you not to press it",
  "obj.thing": "object", "fx.thing": "quite a mess",
};
// Dà il testo di una chiave nella lingua scelta. Se manca in inglese usa l'italiano,
// se manca del tutto restituisce la chiave stessa (così ci si accorge che manca).
function t(key) {
  const en = document.documentElement.lang === "en";
  return (en && DESK_TEXTS_EN[key]) || DESK_TEXTS[key] || key;
}
