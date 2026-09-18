# 💎 Piano di Refactoring Corporate da 20k: Confapi Roma

## La Visione dell'Agenzia: Trasformare Confapi Roma nel Portale di Riferimento per le PMI

Questo piano strategico è progettato secondo i massimi standard delle migliori digital agency internazionali per progetti corporate da 20.000€+. L'obiettivo è riposizionare **Confapi Roma e Lazio** come un ecosistema digitale d'élite, capace di attrarre imprenditori, semplificare l'accesso ai servizi e offrire un backend Node.js ultra-performante per la gestione editoriale in Markdown.

---

## 1. Strategia UX & Architettura dell'Esperienza (CX)

### 1.1 Mappatura dei Cluster Utente (User Personas)
1. **Marco, 48 anni - Titolare PMI Manifatturiera/Metalmeccanica (Pomezia/Roma Est)**
   - *Bisogno*: Consulenza rapida su contrattazione collettiva, cassa integrazione, welfare aziendale e credito d'imposta macchinari 4.0.
   - *Soluzione UX*: Pulsante rapido "Assistenza Sindacale & Fiscale", calcolatore dei benefici, contatto diretto con un consulente dedicato.
2. **Elena, 36 anni - Co-Founder Startup Innovativa / PMI Digitale (Roma Centro/EUR)**
   - *Bisogno*: Bandi regionali Lazio Innova, formazione finanziata con Fondapi per i propri sviluppatori, networking con altre imprese.
   - *Soluzione UX*: Hub "Bandi & Finanza Agevolata", filtro dinamico per bandi aperti, calendario eventi di networking.
3. **Paolo, 54 anni - Imprenditore Edile (ANIEM Confapi Roma)**
   - *Bisogno*: Aggiornamenti normativi sul Codice Appalti, DGUE, sicurezza nei cantieri, convenzioni assicurative.
   - *Soluzione UX*: Canale dedicato ANIEM Edilizia con circolari operative in formato Markdown scaricabile e consultabile istantaneamente.

---

## 2. Design System Corporate "Confapi Enterprise 2.0"

### 2.1 Principi di Design
- **Autorevolezza & Fiducia**: Tonalità *Deep Navy Blue* con accenti *Royal Blue* e tocchi di *Tricolore Emerald & Warm Gold*.
- **Pulizia Visiva & Spaziatura Generosa**: Griglia fluida a 12 colonne, card fluttuanti con ombre morbide (soft shadows), micro-interazioni eleganti e icone Lucide/Heroicons vettoriali.
- **Glassmorphism Istituzionale**: Header semi-trasparente con effetto *blur* dinamico allo scroll, per mantenere la navigazione sempre accessibile con massima raffinatezza.

### 2.2 Layout delle Sezioni Chiave (Frontend)
1. **Header Istituzionale**:
   - Logo vettoriale ad alta definizione con monogramma responsive.
   - Navigazione pulita a mega-menu (Chi Siamo, Servizi PMI, Bandi & News, Convenzioni, Governance).
   - Quick Action: Bottone "Diventa Socio" ad alto impatto visivo + Switch Tema / Ricerca istantanea.
2. **Hero Section d'Impatto**:
   - Headline potente: *"Il motore della Piccola e Media Impresa a Roma e nel Lazio"*.
   - Statistiche animate in tempo reale: `+116.000 Imprese Tutelate`, `+13 CCNL Gestiti`, `€45M+ Crediti & Bandi Sbloccati`, `100% Vicinanza Territoriale`.
   - CTA Duale: *"Richiedi Consulenza Immediata"* (primario) e *"Esplora i Servizi per la tua Impresa"* (secondario).
3. **Interactive Service Matrix (I Servizi)**:
   - 6 pilastri interattivi: *Relazioni Sindacali, Credito & Finanza, Formazione & Fondapi, Sicurezza & Qualità, Internazionalizzazione, Transizione Green & Ambiente*.
4. **Interactive Onboarding Funnel ("Diventa Socio")**:
   - Calcolatore interattivo a step: selezione dipendenti -> settore -> servizi di interesse -> richiesta di adesione in 60 secondi.
5. **Sala Stampa & Newsroom Dinamica**:
   - Articoli categorizzati (Fisco, Lavoro, Bandi, Europa, Territorio) con tempo di lettura, autorevolezza editoriale e formattazione tipografica impeccabile.
6. **Hub Convenzioni Esclusive**:
   - Showcase delle partnership attive (UnipolSai, TIM, Enel, etc.) con stima del risparmio aziendale annuo.
7. **Footer Istituzionale & Helpdesk**:
   - Mappa della sede centrale di Roma, contatti PEC/Telefono diretti, link allo Statuto, trasparenza e iscrizione alla Newsletter sindacale.

---

## 3. Backend & Portale CMS in Node.js

### 3.1 Architettura Software del Backend
- **Runtime**: Node.js moderno con architettura modulare (Express / Fastify REST API).
- **Database / Storage**: Database JSON/SQLite strutturato con persistenza atomica, indici e pieno supporto per migrazioni.
- **Editor Markdown**:
  - Supporto WYSIWYG & Raw Markdown con live preview in tempo reale.
  - Formattazione avanzata: Titoli, liste, tabelle, callout istituzionali (Note, Warning, Tip), citazioni e snippet di codice.
  - Caricamento & Gestione Immagini / Allegati PDF.
- **Funzionalità Amministrative CMS**:
  - CRUD Completo per Articoli (Crea, Modifica, Elimina, Pubblica, Bozza).
  - Gestione Categorie e Tag dinamici.
  - Gestione Autori, Data di Pubblicazione e Stima automatica del tempo di lettura.
  - Gestione Richieste di Contatto / Nuove Adesioni Socio con notifica.
  - Ricerca Full-Text e filtri avanzati per stato e categoria.

---

## 4. Metodologia del Loop Iterativo (5 Fasi di Qualità)

1. **Iterazione 1: Scraping, Data Extraction & Re-Architecture** (Completata con successo: 132 pagine scansionate, 77 articoli catalogati).
2. **Iterazione 2: Core Design System & Frontend Corporate Layout** (Implementazione componenti, hero, servizi, membership wizard, footer, styling responsive).
3. **Iterazione 3: Backend Node.js & CMS Markdown Portal** (Implementazione API REST, pannello admin, editor markdown, rewrites database).
4. **Iterazione 4: Integrazione Dati, Newsroom Live & Test Visivi / DevTools** (Verifica rendering su mobile, tablet e desktop, screenshot e controllo contrasto/accessibilità).
5. **Iterazione 5: QA Finale, Performance & Consegna Documentale** (Ottimizzazione asset, SEO metatag Schema.org, verifica zero-errori).
