# Verifica della codebase per la presentazione — 9 settembre 2026

Ambito: implementazione esistente confrontata con inventario 02 e piano 04. Server di verifica: http://localhost:3082. La nuova demo magazine viene sviluppata nell'altro task, in file separati. Non è stata rifatta in questa verifica la scansione del sito online.

## Correzioni effettuate

- Homepage: “Tutti gli articoli” mostra tutti i 78 record anziché aprire il CMS. Ricerca mantenuta. Rimossi il titolo che apriva un contenuto diverso e i numeri di circolare generati arbitrariamente. Data dell'edizione aggiornata. Errore di caricamento visibile.
- Navigazione comune: riparati i rimandi a sezioni inesistenti; raggiungono ora le sezioni disponibili di notiziario, unioni ed enti. Questo ripristina la navigazione, ma non sostituisce le pagine di servizio previste dal piano.
- Adesione: sostituito il risparmio fisso per numero di dipendenti con una selezione del profilo aziendale. Collegati label e campi; pulsanti del selettore accessibili da tastiera. Il backend conserva ora partita IVA, indirizzo e PEC, valida email e ragione sociale e segnala gli errori di salvataggio. Scrittura con file temporaneo e rinomina. La conferma distingue il salvataggio locale dall'invio email.
- Articolo: correlati limitati ai pubblicati, messaggio di errore utile, stampa senza navigazione e sidebar.
- Stile condiviso: focus visibile, controlli leggibili su mobile, griglie e footer adattabili, rispetto del movimento ridotto. Nessuna modifica ai file magazine dell'altro task.
- Server di verifica in ascolto solo su loopback per impostazione predefinita.

## Scostamenti e piano per pagina

1. **Homepage / notiziario.** Il concept editoriale è coerente con la proposta, ma i contenuti del database risultano riscritti genericamente, con date da verificare. Le etichette sui bandi e il flash normativo sono ancora statici. Prima della consegna: importare testi e date originali, distinguere archivio e attualità, collegare i titoli a contenuti corrispondenti. Poi: archivio dedicato con categorie, paginazione e ricerca sul server.
2. **Chi siamo.** Storia, governance e statuto sono presenti in una pagina unica; i PDF locali sono disponibili. Prima della pubblicazione: confermare persone, recapiti e corrispondenza degli estratti con i documenti. Poi: componenti riutilizzabili per organi, incarichi e documenti, con data di aggiornamento.
3. **Convenzioni.** Sono presenti sette schede locali; l'inventario descrive anche partner differenti. Occorre verificare partner, validità e condizioni effettive. Poi: modello convenzione con categoria, scadenza, allegati e referente; filtri per esigenza aziendale.
4. **Come associarsi.** Percorso navigabile e PDF presenti. La richiesta viene salvata localmente; non esiste invio email. Poi: informativa approvata, raccolta dei dati strettamente necessari, conferme email e gestione delle richieste nel CMS. Nessuna promessa quantitativa senza metodo e dati validati.
5. **Articolo.** Pagina dinamica disponibile. Prima della produzione: sanitizzazione del Markdown/HTML, protezione delle bozze anche nell'endpoint di dettaglio, date normalizzate. Poi: URL stabili, metadati specifici, allegati, collegamenti alle fonti e redirect degli URL precedenti.
6. **Servizi / sistema / unioni.** Nel prototipo prevalgono sezioni della homepage; mancano le pagine autonome del piano per i sei servizi. Poi: un template comune con destinatari, attività, documenti, referente e CTA; distinguere i fondi per formazione e previdenza senza testi contraddittori.
7. **CMS.** CRUD locale disponibile, ma non equivalenza completa con il CMS originario. Mancano autenticazione/ruoli, protezione delle API amministrative e dei lead, media manager, revisioni, backup e migrazione verificata. Queste sono condizioni necessarie per la pubblicazione, non rifiniture grafiche.

## Sequenza di refactoring

Prima della call: percorsi navigabili e correzioni qui implementate; usare dati di prova nei moduli. Per il nuovo stile mostrare la demo magazine preparata nell'altro task.

Sprint successivo: validazione dell'archivio e dei contenuti istituzionali, template condivisi per header/footer, modello dati per articoli/servizi/convenzioni e pagine mancanti.

Prima del go-live: autenticazione e autorizzazioni, sanitizzazione, storage transazionale e backup, email, privacy approvata, migrazione URL e allegati, SEO e test completi desktop/mobile.

## Verifiche

`node scripts/verify-presentation.js`: sei route HTTP 200, sintassi JavaScript inline valida, 21 asset locali HTTP 200, rifiuto di input adesione non validi, conservazione dei campi aggiuntivi con fixture isolata in cartella temporanea. Nessun lead di prova aggiunto al database effettivo.

Browser: archivio espanso a 78 schede; selezione 6–15 dipendenti sincronizzata al modulo; tutti i campi adesione con etichetta. Ispezione desktop della homepage e mobile delle pagine principali. Non è un audit completo di sicurezza, normativa o contenuti.
