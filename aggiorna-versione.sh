#!/bin/sh
# Aggiorna il numero di versione dei file CSS e JS nelle pagine (es. style.css?v=20261026-1530).
# Serve perché i browser tengono in memoria i file vecchi: con un numero nuovo
# sono costretti a scaricare quelli aggiornati. Lancialo prima di ogni push:
#   sh aggiorna-versione.sh
cd "$(dirname "$0")"
V=$(date +%Y%m%d-%H%M)
for f in *.html; do
  # toglie la versione vecchia (se c'è) e mette quella nuova
  sed -E -i '' \
    -e "s#(href=\"css/[^\"?]+\.css)(\?v=[^\"]*)?\"#\1?v=$V\"#g" \
    -e "s#(src=\"(js|content)/[^\"?]+\.js)(\?v=[^\"]*)?\"#\1?v=$V\"#g" \
    "$f"
done
echo "Versione aggiornata: $V"
