# Redazione V1

Accesso: http://localhost:3081/admin. Anche `/studio` porta al nuovo pannello.
Si utilizzano gli account già presenti nella V1. Il porting non cambia password e non condivide sessioni o dati con la V2.

## Funzioni

- **Panoramica**: canali di pubblicazione, conteggi e ultimi articoli modificati.
- **Articoli**: ricerca per titolo, canale e stato; editor visuale; immagini nel testo e copertina; anteprima; bozza, pubblicazione e cestino recuperabile; versioni precedenti e controllo delle modifiche concorrenti.
- **Immagini**: caricamento, ottimizzazione in WebP, ricerca, riutilizzo e modifica della descrizione.
- **Categorie dei servizi**: nomi, descrizioni, visibilità e nuove categorie. Le modifiche aggiornano il menu e le pagine pubbliche. Gli URL esistenti restano stabili.
- **Richieste di contatto**: destinatario, recapiti, messaggio, stato e note interne.
- **Domande di adesione**: PDF compilato con le due firme e stato della pratica.
- **Accessi e account**: password e gestione degli account con ruoli amministratore/redattore.

Le pubblicazioni nei servizi richiedono una categoria collegata. Nelle pagine pubbliche dei servizi compaiono al massimo tre articoli pertinenti. I contenuti ANIEM compaiono nella pagina ANIEM della V1.

## Dati e conservazione

Il codice dell’admin è stato copiato e adattato dalla V2 su richiesta del 17 settembre 2026. La copia è autonoma in `cms/` e `public/cms-assets/`; non ci sono import runtime dalla V2.

- Database unificato: `backend/data/adesioni/memberships.sqlite` (oppure `V1_DATA_DIR/adesioni/memberships.sqlite`).
- PDF firmati: `backend/data/adesioni/memberships/`, sempre privati e scaricabili solo dopo l’accesso.
- Immagini caricate: `backend/data/adesioni/uploads/`, servite mediante `/uploads/`.
- Articoli e contatti JSON originari sono conservati. La migrazione iniziale è idempotente e mantiene ID, date e metadati originali. Da questo momento gli aggiornamenti editoriali vanno nel database, non nei vecchi JSON.
- Copia dei file precedenti: `tmp/pre-admin-port-20260917-201248/`.
- Backup SQLite precedente al porting: `backend/data/adesioni/backups/pre-admin-*.sqlite`.

Per il backup completo conservare il database SQLite con una copia consistente e le cartelle `memberships` e `uploads`. Non copiare solo il file SQLite mentre è in uso in modalità WAL.

## Verifiche

`npm run test:admin` verifica migrazione, autenticazione, CSRF, ruoli, editor, versioni, media, servizi e richieste su dati temporanei.

`npm run test:membership` verifica il modulo a quattro passaggi, le due firme, il PDF e la ricezione protetta, oltre agli aggiornamenti dell’anteprima.

`npm run build` e `npm run test:porting` verificano il trasporto attraverso Next.js. Gli account QA dei test esistono soltanto negli archivi temporanei.
