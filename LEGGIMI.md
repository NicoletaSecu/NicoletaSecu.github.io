# Portfolio

## Com'è organizzata la cartella

```
Portfolio/
├── index.html          la home: nome, progetti, chi sono, scrivania, contatti
├── progetti.html       tutti i progetti su un albero del tempo, con i filtri
├── chi-sono.html       chi sono: ritratto, cosa faccio, percorso
├── favicon.svg         l'iconcina della scheda (NS in bordeaux) + favicon-32.png e apple-touch-icon.png
├── content/            ← QUELLO CHE MODIFICHI TU
│   ├── projects.js     i progetti (italiano + inglese)
│   ├── texts.js        tutti i testi del sito (italiano + inglese)
│   └── settings.js     link GitHub, chiave del modulo "Scrivimi", colori del ritratto
├── img/                le immagini dei progetti (es. img/meteo.png)
├── css/
│   └── style.css       colori, font, aspetto (l'ultimo strato in fondo è lo stile attuale)
└── js/                 il codice, un file per ogni parte
    ├── lang.js           lingua IT / EN
    ├── project-list.js   elenco e linea del tempo dei progetti, filtri, immagine che segue il mouse
    ├── hero.js           apertura (immagini sparse) e frase "Chi sono" che si accende
    ├── desk.js           scrivania e lampada (giorno/notte)
    ├── contact.js        modulo "Scrivimi"
    ├── navigation.js     link interni e ricarica dall'inizio
    ├── gravity.js        il bottone rosso: gli oggetti cadono
    ├── toys.js           cosa succede se scuoti un oggetto caduto
    ├── cursor.js         il pallino che insegue il mouse ("Apri" sopra i progetti)
    └── main.js           avvia tutto
```

## Aggiungere un progetto

Apri `content/projects.js`, copia un blocco `{ ... }` e cambia i testi.
Tutti i progetti compaiono nella pagina Progetti; quelli con `home: true`
compaiono anche nell'elenco della home (toglilo per nasconderlo dalla home).
Se ha un'immagine, mettila in `img/` e scrivi `image: "img/nome-file.png"`.

## Vedere il sito sul computer

Dal Terminale:

```bash
cd ~/Desktop/ThingsForMyLife/Portfolio && python3 -m http.server 5173
```

Poi apri http://localhost:5173 nel browser.

## Prima di ogni push: aggiorna la versione

I browser tengono in memoria i file CSS e JS: senza questo passaggio chi ha già visto
il sito potrebbe vedere pezzi vecchi mescolati a quelli nuovi. Dal Terminale:

```bash
sh aggiorna-versione.sh
```

Cambia il numero `?v=...` dei file in tutte le pagine, così i browser scaricano quelli nuovi.
