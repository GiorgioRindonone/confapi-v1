# Verifica del porting V1
- Backup degli originali: archivio-originali-2026-09-14, manifest SHA-256.
- Confronto HTTP con il magazine originale sulla 3081: 10 endpoint, stesso stato e contenuto.
- Asset della cartella public: identici agli originali.
- Build Next.js 16.3.5: completata.
- Cinque test Next.js su dati temporanei: pagine, asset, query studio, creazione/pubblicazione articoli, contatti/adesioni locali, aggiornamento stato, rifiuto origine estranea e redirect admin.
- Il modulo con due firme non appartiene al magazine: è conservato integralmente nel progetto propostav2 originale e nella copia di migrazione separata.
- Porta finale: 3081. La porta 3181 è riservata alle verifiche temporanee.
