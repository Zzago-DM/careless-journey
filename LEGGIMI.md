# The Careless Journey — com'è fatto il sito

Il sito era un unico file `index.html`. Adesso è diviso in pezzi: ogni parte sta nel suo file, e `index.html` li richiama nell'ordine giusto. Per chi apre il sito non cambia niente.

## Le cartelle

| Cartella | Cosa contiene | Quando la tocchi |
|---|---|---|
| `index.html` | Solo lo scheletro: l'elenco dei pezzi nell'ordine in cui vengono caricati | Quando aggiungi o togli un pezzo intero |
| `sezioni/` | Il testo e la struttura di ogni sezione (Mondo, Mappa, Mael, Nave, Zona Master…) | Per cambiare testi, titoli, riquadri |
| `sezioni/mappe/` | Le mappe ingrandite dei continenti, di Ramsgate e del Maelstrom | Per cambiare il disegno delle mappe |
| `css/` | L'aspetto: colori, caratteri, animazioni. Il numero davanti al nome è l'ordine di caricamento | Per cambiare come appare qualcosa |
| `js/` | Il funzionamento: pulsanti, finestre, salvataggi, suoni, animazioni | Per cambiare cosa succede quando si clicca |
| `dati/` | Solo valori: statistiche dei Behemoth, armi, celle, drop, schede della Zona Master, continenti | Per cambiare un numero o una scheda |
| `media/` | Le immagini che prima erano incollate dentro la pagina (Corone, simbolo dei Mael) | Per sostituire un'immagine |
| `img/`, `beh/` | Foto dei Maestri e icone dei Behemoth, come prima | Come prima |

## Regole da ricordare

- **L'ordine conta.** Gli stili si sovrascrivono in ordine (per questo i file in `css/` sono numerati), e alcuni script usano cose create da quelli prima. Se sposti una riga in `index.html`, controlla il sito.
- **I file in `sezioni/` sono HTML dentro un contenitore.** Il testo sta tra due accenti gravi `` ` ``. Se nel testo ti serve un accento grave o la sequenza `${`, mettici davanti una barra rovesciata: `` \` `` e `\${`.
- **I dati dei giocatori non sono qui.** Restano salvati nel browser di ciascuno, come prima.
- **Dopo una modifica** GitHub Pages può impiegare qualche minuto ad aggiornarsi, e il browser può tenere in memoria la versione vecchia: ricarica la pagina con Ctrl+F5 (o svuota la cache sul telefono).

## Aree dei giocatori online (js/sync-giocatori.js)

Ogni personaggio ha il suo "pacchetto" (scheda, licenza, ritratto, sigillo, note personali, alloggio, tema) che può essere salvato online in un repository privato tutto suo. Il token si incolla nel sito una volta per dispositivo e resta solo in quel browser.

**Preparazione (una volta sola, la fa il Master):**
1. Crea tre repository **privati** vuoti: `tcj-athena`, `tcj-panlan`, `tcj-asonnes` (spunta "Add a README" così non sono vuoti del tutto).
2. Per ognuno crea un token in *Settings → Developer settings → Personal access tokens → Fine-grained tokens*: Expiration **No expiration**, Repository access **Only select repositories** (solo quello del giocatore), Permissions **Contents: Read and write**.
3. Consegna a ogni giocatore il suo token, in privato.

**Il giocatore:** apre la sua Area dello Slayer con il codice → "☁ Collega salvataggio online" → incolla il token. Da lì: all'apertura dell'area il sito scarica l'ultima versione, con "☁ Salva online" la carica. Se trova modifiche fatte su due dispositivi, chiede quale versione tenere.

Se un token si perde: revocalo su GitHub e creane uno nuovo; ogni versione salvata resta nella cronologia del repository.

**Token del Master:** un solo token fine-grained con *Only select repositories* = `tcj-athena`, `tcj-panlan`, `tcj-asonnes`, *Contents: Read and write*, *No expiration*. Si incolla nella Zona Master → «Aree dei giocatori online». Da lì si scarica, si apre, si corregge e si salva online l'area di ciascun giocatore; il salvataggio compare su GitHub con la nota «(dal Master)». Il token resta solo sul dispositivo dove lo incolli.
