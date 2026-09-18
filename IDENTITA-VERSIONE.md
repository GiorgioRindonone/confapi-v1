# Sito V1
- Cartella operativa: sito v1.
- Indirizzo locale: http://localhost:3081
- Origine del porting: demo-server.js e cartelle della radice (magazine 3081).
- Runtime: Next.js 16.3.5, React 19.3.0, Node.js 24.
- Avvio locale: AVVIO-SITO.cmd oppure npm run dev.
- Build: npm run build. Avvio build: npm start.
- Nessun import o collegamento ai file dell’altra versione.
- Dati: backend/data/*.json.
- Adesioni online ripristinate il 15 settembre 2026 su richiesta esplicita: modulo a quattro passaggi, due firme, PDF originale e gestione protetta in /admin/adesioni. Codice autonomo in membership/ e public/js/membership-*.js, archivio privato in backend/data/adesioni (oppure V1_DATA_DIR/adesioni).
- Gli account di redazione del flusso recuperato sono stati copiati una sola volta, senza sessioni. Nessun collegamento al database della V2. Test: node --test tests/membership.test.cjs.
- I vecchi script e le pagine non collegate sono conservati per non perdere informazioni.
- I template HTML e la logica interattiva originali sono conservati: questa è una migrazione del runtime con un adattatore Next.js, non una riscrittura completa delle pagine in componenti React.
- Il livello di compatibilità è pages/api/__legacy/[[...path]].js; non richiede un secondo server Express.
- Backup sorgente immutato: ../archivio-originali-2026-09-14/sito v1.
- Non usare i lanciatori nella vecchia radice/propostav2 per lavorare su questa copia.

- 17 settembre 2026: admin della V2 ricreato su richiesta nella V1, in cms/ e public/cms-assets/, con database locale unificato e migrazione conservativa degli articoli/contatti V1. /studio reindirizza a /admin. Nessuna dipendenza runtime dalla V2. Vedi GUIDA-REDAZIONE-V1.md.
