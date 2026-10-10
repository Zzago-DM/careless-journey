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
