# 🏛️ Analisi Brand Identity & Stile Visivo: Confapi Roma

Questo documento raccoglie l'analisi approfondita e scientifica dell'identità visiva, del logo, dei colori istituzionali, della tipografia e del tono di voce di **Confapi Roma** (Confederazione Italiana della Piccola e Media Industria Privata - Associazione Territoriale di Roma e Lazio).

---

## 1. Analisi del Logo

### 1.1 Struttura e Morfologia
Il logo attuale di Confapi Roma è composto da due elementi primari:
1. **Il Simbolo Araldico / Pittogramma**:
   - **Forma a Scudo Sagomato**: Rappresenta la protezione, l'unione e la solidità del tessuto industriale confederale.
   - **Elemento Centrale (Aquila / Ali Stilizzate con Ingranaggio)**: Simbolo storico della rappresentanza industriale, dell'operosità e della produttività manifatturiera italiana.
   - **Tricolore Italiano Integrato**: Un nastro tricolore (Verde, Bianco, Rosso) che attraversa diagonalmente o inferiormente il pittogramma per rimarcare la dimensione nazionale e la tutela dell'imprenditoria italiana.
2. **Il Logotipo Testuale ("CONFAPI ROMA")**:
   - **"CONFAPI"**: Tipografia sans-serif geometrica maiuscola in grassetto istituzionale (Heavy/Bold), che conferisce autorevolezza e solidità.
   - **"ROMA" / "ROMA E LAZIO"**: Sub-brand posizionato inferiormente o lateralmente, a sancire il radicamento territoriale nella Capitale e nell'area metropolitana/regionale.

### 1.2 Punti di Forza dell'Identità
- **Grande Riconoscibilità Istituzionale**: Marchio storico (fondato nel 1947 a livello nazionale), punto di riferimento per oltre 116.000 imprese in tutta Italia.
- **DNA Produttivo e Territoriale**: Evoca direttamente la tutela della Piccola e Media Impresa (PMI) e il dialogo con gli enti governativi territoriali (Regione Lazio, Roma Capitale, Prefettura, Camere di Commercio).

### 1.3 Criticità Tecniche dell'Asset Originale Scelto nel Sito Attuale
- **Asset Bitmap a Bassa Risoluzione**: Nel sito attuale (`logo-confapi_1000.png` e `logo-confapi_800.png`) il logo è caricato come PNG rasterizzato non ottimizzato, che risulta sfocato sui display Retina/High-DPI (2x, 3x).
- **Mancanza di Versioning Responsivo**: Non esiste una variante orizzontale compatta (navbar) né un favicon/monogramma SVG vettoriale moderno.
- **Margini e Proporzioni Irregolari**: Il logo originale è incapsulato in un header rigido a tabella/griglia di Joomla con padding inconsistenti.

---

## 2. Sistema Colori & Palette Cromatica

Dall'analisi dei fogli di stile originali (`preset7.css`, `template.css` e layout SP PageBuilder), sono stati estratti i codici colore storici e ottimizzati per il nuovo Design System Corporate:

| Ruolo | Nome Colore | Hex Originale | Hex Ottimizzato (20k Design System) | Uso e Semantica |
|---|---|---|---|---|
| **Primary Base** | *Confapi Navy Deep* | `#002b49` | `#0B192C` / `#1E3E62` | Colore dominante istituzionale per header, typography primaria e sfondi autorevoli |
| **Secondary Accent** | *Confapi Royal Blue* | `#284faf` | `#1D4ED8` / `#2563EB` | Colore per interazioni, bottoni secondari, badge e accenti corporate |
| **Accent Gold / Energy**| *Confapi Yellow/Gold*| `#ffd903` / `#e6c400`| `#D97706` / `#F59E0B` | Evidenziazioni bandi, opportunità economiche, numeri di impatto, premi |
| **National Green** | *Tricolore Emerald* | `#169141` / `#23cf5f`| `#059669` / `#10B981` | Segnali positivi, convenzioni attive, welfare, sostenibilità e transizione green |
| **Neutral Dark** | *Charcoal Ink* | `#333333` / `#656565`| `#0F172A` / `#334155` | Testi body, sottotitoli e icone di interfaccia ad alto contrasto (WCAG AAA) |
| **Neutral Light** | *Pure & Surface White*| `#ffffff` / `#f7f7f7`| `#F8FAFC` / `#FFFFFF` | Sfondi sezioni, card fluttuanti, pannelli informativi |
| **Borders & Dividers** | *Subtle Slate Border* | `#cccccc` | `#E2E8F0` / `#CBD5E1` | Separatori e bordi card puliti ed eleganti |

---

## 3. Tipografia & Gerarchia Visiva

Nel sito storico la tipografia era basata su **Lato** e **Cormorant Garamond**, ma implementata in modo frammentato con oltre 12 varianti di font-size incoerenti. Per il nuovo standard corporate da 20k, la scala tipografica è razionalizzata:

### 3.1 Font Stack Corporate
- **Display & Headings**: `Plus Jakarta Sans` / `Inter` (Font sans-serif premium, altamente geometrico, ultra-leggibile per headline corporate e dashboard).
- **Body & Editorial**: `Inter` (Standard de-facto per leggibilità su schermi e reportistica).
- **Institutional Serif Accent (Optional)**: `Cinzel` / `Playfair Display` (utilizzato con parsimonia per citazioni presidenziali e atti statutari).

### 3.2 Scala Tipografica Istituzionale
- **Display 1**: `48px - 56px` / Line-Height `1.1` / Weight `800` (Hero Title)
- **H1**: `36px - 42px` / Line-Height `1.2` / Weight `700` (Page Title)
- **H2**: `28px - 32px` / Line-Height `1.25` / Weight `700` (Sezioni Principali)
- **H3**: `20px - 24px` / Line-Height `1.3` / Weight `600` (Card & Sottosezioni)
- **Body Regular**: `16px` / Line-Height `1.6` / Weight `400` (Paragrafi & Articoli)
- **Caption & Meta**: `13px - 14px` / Line-Height `1.4` / Weight `500` (Date, Tag, Categorie)

---

## 4. Tono di Voce & Posizionamento del Brand (CX)

- **Target Persona Primario**: Imprenditore, Titolare di PMI romana, Manager d'azienda, Professionista, Startupper innovativo.
- **Target Persona Secondario**: Istituzioni territoriali (Comune di Roma, Regione Lazio, Ministeri), Stampa, Università ed Enti di Formazione.
- **Valore Promesso**: *"La voce, la tutela e il motore di crescita delle Piccole e Medie Imprese di Roma e del Lazio"*.
- **Tono di Comunicazione**: Autorevole, proattivo, chiaro, privo di burocratese sterile, focalizzato sui risultati tangibili (credito d'imposta, contratti collettivi, formazione finanziata, welfare aziendale, networking).
