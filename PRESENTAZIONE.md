# Demo CONFAPI Roma

Aprire http://localhost:3081/ mentre il server è attivo. Per riavviarlo: `node demo-server.js` dalla cartella del progetto oppure aprire `AVVIO-DEMO.cmd`.

## Percorso per la call

1. Homepage: gerarchia magazine, notizie reali, accessi ai bisogni delle imprese.
2. Aprire il bando in primo piano: pagina completa con fonte e contatto contestuale.
3. Aprire Notizie: ricerca, filtri, ordinamento, paginazione.
4. Aprire Contatti e inserire dati di esempio. La richiesta compare nello Studio editoriale, sezione Richieste e imprese.
5. Nello Studio creare un nuovo contenuto, salvarlo come bozza, aprire l’anteprima e cambiare lo stato in Pubblicato. Il contenuto compare nel magazine.
6. Analisi e progetto è disponibile a http://localhost:3081/analisi.

## Confini della demo

È una proposta locale, senza autenticazione. Non esporre il server su Internet e usare dati di esempio. Non sono implementati upload, programmazione, account, ruoli, revisioni e invio email. Gli archivi originali e la proposta precedente sono preservati. I dati della nuova demo si trovano in `backend/data/editorial-demo.json` e `backend/data/editorial-requests.json`.

Le 77 schede recuperate dall’archivio sono segnalate come da verificare. Sei schede curate illustrano il nuovo modello. Le fotografie provengono dal patrimonio pubblico del sito CONFAPI; il loro utilizzo definitivo deve rientrare nei diritti disponibili al cliente.

Il sito pubblico dichiara Joomla, non WordPress. La versione e gli strumenti effettivamente usati dalla redazione vanno verificati con il cliente.
