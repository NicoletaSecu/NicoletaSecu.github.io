# Portfolio

## Com'è organizzata la cartella

```
Portfolio/
├── index.html          la home: scrivania, progetti scelti, chi sono, contatti
├── progetti.html       tutti i progetti (linea completa con filtri)
├── content/            ← QUELLO CHE MODIFICHI TU
│   ├── projects.js     i progetti (italiano + inglese)
│   ├── texts.js        tutti i testi del sito (italiano + inglese)
│   └── settings.js     link GitHub e chiave del modulo "Scrivimi"
├── img/                le immagini dei progetti (es. img/meteo.png)
├── css/
│   └── style.css       colori, font, aspetto
└── js/                 il codice, un file per ogni parte
    ├── lang.js           lingua IT / EN
    ├── projects-line.js  linea della metro, filtri, camera oscura
    ├── desk.js           scrivania e lampada (giorno/notte)
    ├── contact.js        modulo "Scrivimi"
    ├── navigation.js     link interni e ricarica dall'inizio
    ├── gravity.js        il bottone rosso: gli oggetti cadono
    ├── toys.js           cosa succede se scuoti un oggetto caduto
    └── main.js           avvia tutto
```

## Aggiungere un progetto

Apri `content/projects.js`, copia un blocco `{ ... }` e cambia i testi.
Tutti i progetti compaiono nella pagina Progetti; aggiungi `home: true` a quelli
che vuoi mostrare anche in home.
Se ha un'immagine, mettila in `img/` e scrivi `image: "img/nome-file.png"`.

## Vedere il sito sul computer

Dal Terminale:

```bash
cd ~/Desktop/ThingsForMyLife/Portfolio && python3 -m http.server 5173
```

Poi apri http://localhost:5173 nel browser.
