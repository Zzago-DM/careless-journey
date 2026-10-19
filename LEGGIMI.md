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
- **Dopo una modifica, lancia `node strumenti/versiona.js`** (vedi sotto). Se te ne dimentichi il sito funziona lo stesso, solo che i browser possono tenere la versione vecchia per una decina di minuti.

## Aggiornamenti sicuri (strumenti/versiona.js)

Prima di ogni pubblicazione si lancia `node strumenti/versiona.js`. Lo strumento:

- aggiunge a ogni file richiamato da `index.html` un'etichetta `?v=…` che cambia **solo** quando cambia quel file: il browser riscarica solo ciò che è stato modificato, e non può mai mescolare file vecchi e nuovi;
- scrive la versione della pagina in `index.html` (`TCJ_VERSIONE`) e in `versione.json`. Se un browser apre una copia vecchia della pagina, nei primi secondi si aggiorna da solo; più tardi mostra «È disponibile una versione nuova del sito · Aggiorna», senza interrompere nessuno.

Si può lanciare quante volte si vuole: se non è cambiato niente, non tocca niente. Se aggiungi un file che a sua volta richiama altri file del sito, aggiungilo all'elenco `DA_AGGIORNARE` dentro lo strumento.

## Apertura leggera (js/caricamento.js)

Le parti pesanti che non servono nei primi secondi arrivano in sottofondo appena la pagina è aperta, nello stesso ordine e nello stesso punto di prima:

- `tcjGruppo("mappe", [...])` in `index.html`: le mappe ingrandite (`sezioni/mappe/`), il Maelstrom, l'isola sconosciuta e i loro script. Se qualcuno tocca una terra prima che siano arrivate, vengono scaricate subito e la mappa si apre da sola.
- `tcjGruppo("ritratti", [...])`: i ritratti delle armi dei personaggi (`dati/ritratti-giocatori.js`), usati solo nell'animazione di sblocco.
- La scena animata del Maelstrom si accende solo alla prima apertura; il simbolo dei Mael e le Corone si caricano quando si arriva a vederli.

Per aggiungere un file a un gruppo basta metterlo nell'elenco, nella posizione giusta.

## Aree dei giocatori online (js/sync-giocatori.js)

Ogni personaggio ha il suo "pacchetto" (scheda, licenza, ritratto, sigillo, note personali, alloggio, tema) che può essere salvato online in un repository privato tutto suo. Il token si incolla nel sito una volta per dispositivo e resta solo in quel browser.

**Preparazione (una volta sola, la fa il Master):**
1. Crea tre repository **privati** vuoti: `tcj-athena`, `tcj-panlan`, `tcj-asonnes` (spunta "Add a README" così non sono vuoti del tutto).
2. Per ognuno crea un token in *Settings → Developer settings → Personal access tokens → Fine-grained tokens*: Expiration **No expiration**, Repository access **Only select repositories** (solo quello del giocatore), Permissions **Contents: Read and write**.
3. Consegna a ogni giocatore il suo token, in privato.

**Il giocatore:** apre la sua Area dello Slayer con il codice → "☁ Collega salvataggio online" → incolla il token. Da lì: all'apertura dell'area il sito scarica l'ultima versione, con "☁ Salva online" la carica. Se trova modifiche fatte su due dispositivi, chiede quale versione tenere.

Se un token si perde: revocalo su GitHub e creane uno nuovo; ogni versione salvata resta nella cronologia del repository.

**Token del Master:** un solo token fine-grained con *Only select repositories* = `tcj-athena`, `tcj-panlan`, `tcj-asonnes`, *Contents: Read and write*, *No expiration*. Si incolla nella Zona Master → «Aree dei giocatori online». Da lì si scarica, si apre, si corregge e si salva online l'area di ciascun giocatore; il salvataggio compare su GitHub con la nota «(dal Master)». Il token resta solo sul dispositivo dove lo incolli.

## Il Gruppo — PV e stati in diretta (js/gruppo.js)

La sezione **Il Gruppo** (`sezioni/gruppo.js`, `css/22-gruppo.css`, `js/gruppo.js`), subito sopra l'Area dello Slayer, mostra a tutti i Punti Vita (con la barra) e gli stati alterati di ogni personaggio. Nella scheda ci sono i PV attuali / massimi con i pulsanti ±1 e ±5 e il riquadro «Stati alterati» (un tocco: forma lieve, due: grave, tre: via; «⏭ Fine turno» toglie un turno a tutti).

- I dati stanno nel repository **privato** `gruppo`, file `stato.json`. Quando un giocatore cambia PV o stati, dopo un paio di secondi il sito invia la sua riga; gli altri dispositivi la rileggono ogni pochi secondi mentre la pagina è aperta.
- Si usa il token del personaggio (se manca, quello del Master).
- **Turni.** Il giocatore preme «✓ Ho concluso l'azione» (con conferma; può tornare indietro con «↩ Riprendi l'azione» finché il turno è aperto) e sul quadro compare «Azione conclusa». Solo chi ha il **token del Master** può premere «⏭ Fine turno» nella sezione Il Gruppo: per ogni personaggio toglie i PV degli stati che fanno danno a turno (Scottato −2, Bruciato −5, Elettrificato −1, Fulminato −3, Corrotto −5, Abbagliato −5), toglie un turno a ogni stato e azzera le azioni concluse. Le schede dei giocatori si aggiornano da sole e partono gli effetti visivi. «↺» riporta il contatore a 1 per un nuovo scontro. Sanguinante ed Emorragia non tolgono PV in automatico (dipendono da quando ci si muove o si agisce). Senza token il quadro mostra solo ciò che è salvato su quel dispositivo.

**Preparazione (una volta sola, la fa il Master):**
1. Crea il repository privato `gruppo` (spunta "Add a README").
2. In *Settings → Developer settings → Fine-grained tokens* apri **ognuno dei quattro token** (Athena, Pan Lan, Asonnes, Master) → *Edit* → in *Repository access* aggiungi `gruppo` → salva. I permessi restano *Contents: Read and write*. I giocatori non devono reincollare niente.

## Reliquie (Nave › Zona Segreta + capitolo del Master)

- Nella Nave, toccando la **Zona Segreta** compare «🗝️ Entra nella stanza delle Reliquie»: una stanza con un piedistallo per ogni artefatto visibile (`js/reliquie.js`, `css/23-reliquie.css`). Toccando un artefatto si apre la sua scheda: descrizione del Master e «Le mie note» del giocatore, salvate nel suo pacchetto (`tcj-rel-<personaggio>`) e quindi nel suo salvataggio online.
- Il sito pubblico legge solo `dati/reliquie.json` e le immagini in `img/reliquie/`: contengono **solo** le reliquie che il Master ha deciso di mostrare.
- I dati veri stanno in `tcj-master`: `reliquie/reliquie.json` (tutte le reliquie, note del Master, «Mostra ai giocatori») e `reliquie/foto/` (galleria: gli 8 frammenti e armi e artefatti dei Mael).
- Si lavora dalla Zona Master, capitolo «Reliquie della nave» (`js/master-reliquie.js`, aggiunto da solo prima che i capitoli diventino bolle). «📣 Pubblica sul sito» riscrive `dati/reliquie.json` e le immagini in un'unica modifica: il token del Master deve includere anche `careless-journey`.

## Zona Master privata

I contenuti della Zona Master (testi, segreti, schede di Mael e Maestri) **non stanno più in questo repository**: sono nel repository privato `tcj-master` (`zona-master.html`, `schede.json`).

- Si entra dalla barra in alto con «🔒 Master» incollando il token del Master (che deve includere `tcj-master`). Niente più password.
- Il dispositivo tiene una copia dei contenuti e da lì in poi apre la Zona Master da solo. In cima alla Zona ci sono «🔒 Chiudi» e «Scollega questo dispositivo».
- Per modificare la Zona Master si modificano i file di `tcj-master`; i dispositivi con il token propongono «Ricarica» quando trovano la versione nuova.
- Le versioni precedenti di questo sito, nella cronologia di GitHub, contengono ancora i vecchi contenuti della Zona Master.

## Codici delle aree dei giocatori

Nel sito non c'è più nessun codice in chiaro: in `js/area-giocatori.js` (PA_HASH) c'è solo l'«impronta» di ogni codice, da cui non si risale al codice vero. Per cambiare il codice di un personaggio:

    node strumenti/impronta.js "NuovoCodice"

e incolla il risultato al posto dell'impronta di quel personaggio. Maiuscole e minuscole non contano.

## Incontri (sezione pubblica + editor del Master)

- La sezione **Incontri** (`sezioni/incontri.js`, `js/incontri.js`) legge `dati/incontri.json`: contiene **solo** ciò che i giocatori possono vedere. Le foto pubblicate, già ritagliate, stanno in `img/incontri/`.
- I dati veri stanno nel repository privato `tcj-master`: `incontri/personaggi.json` (elenco completo, note del Master, interruttori di visibilità) e `incontri/foto/` (galleria delle foto originali).
- Si lavora dalla Zona Master, capitolo «Incontri — Registro dei personaggi» (`js/master-incontri.js`). «📣 Pubblica sul sito» riscrive `dati/incontri.json` e le foto in un'unica modifica: il token del Master deve includere anche `careless-journey` (Contents: Read and write).
- Le note dei giocatori sui personaggi stanno nel loro pacchetto (`tcj-inc-<personaggio>`) e seguono il loro salvataggio online.
