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

La sezione **Il Gruppo** (`sezioni/gruppo.js`, `css/22-gruppo.css`, `js/gruppo.js`), subito sopra l'Area dello Slayer, mostra a tutti i Punti Vita (con la barra) e gli stati alterati di ogni personaggio. Nella scheda ci sono i PV attuali / massimi con i pulsanti ±1 e ±5, una casella «Quanti PV?» con «− Danno» e «+ Cura» per qualunque importo (un solo cambio e un solo invio al Gruppo, `grPvX` in `js/gruppo.js`) e il riquadro «Stati alterati» (un tocco: forma lieve, due: grave, tre: via; «⏭ Fine turno» toglie un turno a tutti).

- I dati stanno nel repository **privato** `gruppo`, file `stato.json`. Quando un giocatore cambia PV o stati, dopo un paio di secondi il sito invia la sua riga; gli altri dispositivi la rileggono ogni pochi secondi mentre la pagina è aperta.
- Si usa il token del personaggio (se manca, quello del Master).
- **Turni.** Il giocatore preme «✓ Ho concluso l'azione» (con conferma; può tornare indietro con «↩ Riprendi l'azione» finché il turno è aperto) e sul quadro compare «Azione conclusa». Solo chi ha il **token del Master** può premere «⏭ Fine turno» nella sezione Il Gruppo: per ogni personaggio toglie i PV degli stati che fanno danno a turno (Scottato −2, Bruciato −5, Elettrificato −1, Fulminato −3, Corrotto −5, Abbagliato −5), toglie un turno a ogni stato e azzera le azioni concluse. Le schede dei giocatori si aggiornano da sole e partono gli effetti visivi. «↺» riporta il contatore a 1 per un nuovo scontro. Sanguinante ed Emorragia non tolgono PV in automatico (dipendono da quando ci si muove o si agisce). Senza token il quadro mostra solo ciò che è salvato su quel dispositivo.

**Cassa di squadra** (riquadro «💰 Cassa di squadra» sotto le schede del Gruppo). Le monete del gruppo stanno in `stato.json`, campo `cassa` = `{ val: [{n: nome valuta, q: monete}], mov: [ultimi 10 movimenti] }`.
- Il **totale del gruppo** non si scrive: è la somma delle valute (tutte monete d'oro, senza cambio).
- Si sceglie la valuta (anche toccandola nell'elenco), si scrive quante monete e «− Togli» / «+ Aggiungi». Nessuna valuta scende sotto zero. «+ Nuova valuta» la può creare chiunque; la × per eliminarla compare solo quando la valuta è a zero.
- Ogni movimento arriva agli altri dispositivi alla lettura successiva (3 secondi se il Gruppo o la scheda sono sullo schermo, 6 altrimenti) con un avviso «chi e quanto», senza motivo; sotto la cassa restano gli ultimi 10 movimenti.
- Serve un token: quello del personaggio con l'area aperta, oppure quello del Master (che compare come «Il Master»).
- **Passaggio dalle schede:** finché la cassa non è mai stata creata, il dispositivo di Athena ci porta da solo le valute della sua scheda; il Master può anche premere «🔍 Controlla le schede» (legge le schede online dei tre Slayer, mostra le monete di ciascuno e porta nella cassa quelle di Athena). Per ora nell'Area dello Slayer resta anche il vecchio riquadro «💰 Monete» (fondo di squadra, valute, quota personale), com'era: non è collegato alla cassa.

**Preparazione (una volta sola, la fa il Master):**
1. Crea il repository privato `gruppo` (spunta "Add a README").
2. In *Settings → Developer settings → Fine-grained tokens* apri **ognuno dei quattro token** (Athena, Pan Lan, Asonnes, Master) → *Edit* → in *Repository access* aggiungi `gruppo` → salva. I permessi restano *Contents: Read and write*. I giocatori non devono reincollare niente.

## Modifica dell'Area dello Slayer (js/area-modifica.js)

Nella barra in cima a ogni Area dello Slayer c'è **✎ Modifica area**. Si apre una schermata a widget, come la home di un telefono, con un widget per ogni sezione della scheda:

- **spostare:** si trascinano col mouse da tutto il widget, col dito dalla maniglia **⠿** (così la schermata scorre). Da tastiera: maniglia selezionata + frecce;
- **grandezza:** la maniglia **⤡** nell'angolo, trascinata a destra/sinistra, sceglie mezza riga o riga intera; in su/giù sceglie l'altezza fino a chiudere il widget. Toccando un widget si apre lo stesso menu a pulsanti;
- **altezza:** *Intera* (tutto il contenuto), *Media* e *Compatta* (altezza fissa, si scorre dentro il riquadro: solo per le sezioni che possono diventare lunghe), *Chiusa* (solo il titolo, si apre col tocco). Sul telefono i riquadri stanno comunque uno sotto l'altro: lì contano ordine e altezza;
- **Conferma →** mostra la scheda **prima e dopo**, con **← Continua a modificare**, **Annulla** e **✓ Salva** (attivo dopo 3 secondi). **↺ Originale** torna alla disposizione del sito.

La disposizione è salvata nella chiave `tcj-lay-<personaggio>`, dentro il pacchetto online del personaggio. Dopo «Salva» viene caricata online subito, se su quel dispositivo c'è il token del player (o del Master); se nel frattempo un altro dispositivo ha salvato, compare il confronto delle due versioni invece di sovrascrivere. Senza token resta su quel dispositivo finché non si collega il salvataggio online.

Ogni riquadro in `sezioni/scheda.js` ha un nome nell'attributo `data-pz`. Se aggiungi un riquadro nuovo, dagli un `data-pz` e aggiungilo all'elenco `PZ` in cima a `js/area-modifica.js` (l'ultimo valore dice se si può accorciare): comparirà nella sua posizione originale anche per chi ha già una disposizione salvata.

## Viaggi in nave (Mappa del Mondo · js/viaggi.js + dati/viaggi.js)

In alto a sinistra sulla Mappa del Mondo (sotto la mappa sul telefono) c'è **⛵ Viaggi**: si sceglie partenza, arrivo e condizioni del cielo, e il pannello dice quanti giorni di navigazione servono. **⛵ Salpa** fa partire la nave, **⚓ Siamo arrivati** la ferma alla meta, **↩ Annulla viaggio** la lascia dov'era. La nave non impiega il tempo vero.

- **Tempi:** in `dati/viaggi.js`, elenco `VG_VIAGGI`. Sono i giorni con **cielo sereno**, da costa a costa (i punti più vicini tra le due terre), e valgono in tutte e due le direzioni. Per cambiarne uno basta cambiare il numero (anche `1.5` per un giorno e mezzo).
- **Cielo:** `VG_CIELO` — Cielo sereno ×1, Venti contrari ×1,3, Burrasca ×1,6, Tempesta aetherica ×2, arrotondati per eccesso al mezzo giorno. Il cielo cambia solo la velocità (e il colore della rotta): **la rotta è sempre la stessa**.
- **Rotte:** in `VG_VIAGGI` (`rotta`), un elenco di punti della mappa. Il primo e l'ultimo sono gli approdi: i punti di costa più vicini tra le **isole principali** dei due continenti (le isolette intorno non contano). Sono state calcolate per passare nel cielo aperto: non sorvolano continenti diversi da partenza e arrivo e girano sempre attorno al Maelstrom (`VG_MAELSTROM`). Se sposti un punto a mano, controlla sulla mappa che la rotta resti nel vuoto.
- **Nave ferma:** `nave` in `VG_LUOGHI` è dove la nave resta su ogni terra se non c'è un viaggio.

Ogni player ha la sua nave: lo stato sta nella chiave `tcj-vg-<personaggio>`, dentro il pacchetto online del personaggio (segue il player su ogni dispositivo con «☁ Salva online»). Senza un personaggio attivo la nave resta solo nel browser (`tcj-vg`). Ha sostituito la vecchia rotta fissa da Ramsgate e l'opzione «Rotta della nave» del menu del Master.

## Schermate delle novità e scelta del dispositivo (js/novita.js + css/40-novita.css)

Prima di tutto il resto (anche dell'animazione d'apertura, che aspetta) compaiono:
1. **Le novità**: una schermata per ogni aggiornamento («Novità · 1 di 6», «Ho capito →», «← Indietro»). Ognuna si vede **una volta sola per dispositivo** (chiave `tcj-novita-viste`).
   Per annunciarne una nuova: aggiungerla in fondo all'elenco `NOVITA` in `js/novita.js` con un `id` mai usato.
   **Regola:** a ogni modifica che i giocatori vedono si aggiunge subito la sua schermata. Mai Zona Master, segreti, lore nascosta o sorprese (per esempio le animazioni di sblocco delle zone); nel dubbio, chiedere al Master.
2. **Il dispositivo** (solo la prima volta, chiave `tcj-dispositivo`): «📱 Telefono — versione leggera» o «💻 Computer — versione completa», con già segnata quella adatta. Si cambia quando si vuole dal menu ⚔ Slayer → «Dispositivo» (la pagina si ricarica allo stesso punto, senza animazione d'apertura).

## Versione leggera (telefono) — html[data-leggero], css/39-leggero.css

Il primo script di `index.html` decide la versione (la scelta salvata, altrimenti quella adatta al dispositivo) e mette `data-leggero` sulla pagina. Nella versione leggera:
- **tutto resta com'è ma fermo**: le animazioni e le transizioni CSS finiscono subito, i disegni SVG animati (bagliori della mappa, nuvole, rotta della nave) vengono fermati, e il sito risponde «sì» alla domanda «riduci il movimento», che tutti gli script animati rispettano già (niente animazioni a canvas);
- **unica eccezione: l'isola che compare dopo un minuto nella vista del Maelstrom** (e la sua mappa), che resta animata;
- niente animazione d'apertura (`js/intro.js` non si scarica), temi del sito, aspetti dell'area (solo la scheda classica), effetti laterali, particelle di sfondo, creature e suoni; il Maelstrom è sempre «Bassa» e fermo (`…?fermo=1`); i ritratti dell'animazione di sblocco (`dati/ritratti-giocatori.js`, 500 KB) non si scaricano;
- restano il colore del sito scelto per ogni personaggio (Impostazioni sfondo → Colore del sito) e, per il Master, il colore della Zona Master (Cremisi/Oro);
- il Gruppo mostra tutto (barre, stati, Fine turno con i danni) senza effetti: i valori si aggiornano e basta;
- nel menu ⚔ Slayer spariscono le righe Suoni, Effetti laterali, Particelle, Animazione del Maelstrom e Tema del sito.

Misure su un iPhone simulato (pagina ferma 5 s / 120 scatti di scorrimento): completa 1,9 s / 2,7 s di lavoro, leggera 0,02 s / 0,35 s.

## Effetti laterali sul telefono

Sul telefono e sul tablet gli effetti laterali partono **spenti** (il sito è più leggero); chi li vuole li accende dal menu ⚔ Slayer → «Effetti laterali», e la scelta resta su quel dispositivo (chiave `tcj_fx`). Sul computer partono accesi come prima.

## Animazione del Maelstrom: Alta / Media / Bassa (js/maelstrom-qualita.js)

Nel menu in alto a destra (⚔ Slayer ▾) c'è **Animazione del Maelstrom**, che decide quale vista si apre cliccando il Maelstrom sulla mappa:

- **Alta**: la scena a clessidra su canvas (`sezioni/mappe/maelstrom-scena.html`), la più ricca e la più pesante.
- **Media**: la stessa scena alleggerita (`…maelstrom-scena.html?q=media`): circa un terzo delle scie, metà delle rocce e delle nubi, 30 fotogrammi al secondo e risoluzione normale invece che alta.
- **Bassa**: la vista originale del Maelstrom in SVG (`sezioni/mappe/maelstrom-scena-originale.html`), recuperata dalla versione del sito prima della clessidra.

La scelta resta nel browser di ognuno (chiave `tcj_mael`). Se nessuno ha scelto, i telefoni e i tablet partono da **Bassa** e i computer da **Alta**.

## Reliquie (Nave › Zona Segreta + capitolo del Master)

- Nella Nave, toccando la **Zona Segreta** compare «🗝️ Entra nella stanza delle Reliquie»: una stanza con un piedistallo per ogni artefatto visibile (`js/reliquie.js`, `css/23-reliquie.css`). Toccando un artefatto si apre la sua scheda: descrizione del Master e «Le mie note» del giocatore, salvate nel suo pacchetto (`tcj-rel-<personaggio>`) e quindi nel suo salvataggio online.
- Il sito pubblico legge solo `dati/reliquie.json` e le immagini in `img/reliquie/`: contengono **solo** le reliquie che il Master ha deciso di mostrare.
- I dati veri stanno in `tcj-master`: `reliquie/reliquie.json` (tutte le reliquie, note del Master, «Mostra ai giocatori») e `reliquie/foto/` (galleria: gli 8 frammenti e armi e artefatti dei Mael).
- Si lavora dalla Zona Master, capitolo «Reliquie della nave» (`js/master-reliquie.js`, aggiunto da solo prima che i capitoli diventino libri della libreria). «📣 Pubblica sul sito» riscrive `dati/reliquie.json` e le immagini in un'unica modifica: il token del Master deve includere anche `careless-journey`.
- **Artefatti e oggetti del gruppo.** Sotto i piedistalli c'è una bacheca che scrivono i giocatori (`js/reliquie-bacheca.js`, stili in `css/23-reliquie.css`): ogni voce è solo testo (artefatto o oggetto, nome e descrizione) e la vedono tutti. Accanto a ogni voce compare chi l'ha messa via; il giocatore può togliere la spunta «Mostra il mio nome» e allora compare «una mano ignota» (il Master vede comunque il nome). Sta nel repository privato `gruppo`, file `oggetti.json`, quindi funziona con i token che ci sono già (niente da preparare). Ogni oggetto ricorda chi l'ha aggiunto: può modificarlo o toglierlo solo chi l'ha scritto (con la sua Area aperta) oppure il Master. Mentre la stanza è aperta la bacheca si aggiorna da sola ogni pochi secondi; senza token si vede l'ultima copia salvata sul dispositivo.

## Zona Master privata

I contenuti della Zona Master (testi, segreti, schede di Mael e Maestri) **non stanno più in questo repository**: sono nel repository privato `tcj-master` (`zona-master.html`, `schede.json`).

- Si entra dalla barra in alto con «🔒 Master» incollando il token del Master (che deve includere `tcj-master`). Niente più password.
- Il dispositivo tiene una copia dei contenuti e da lì in poi apre la Zona Master da solo. In cima alla Zona ci sono «🔒 Chiudi» e «Scollega questo dispositivo».
- Per modificare la Zona Master si modificano i file di `tcj-master`; i dispositivi con il token propongono «Ricarica» quando trovano la versione nuova.
- Le versioni precedenti di questo sito, nella cronologia di GitHub, contengono ancora i vecchi contenuti della Zona Master.

## La libreria della Zona Master (js/master-libreria.js)

I capitoli della Zona Master sono **volumi su una libreria a scaffali**: il titolo sta sul dorso (i titoli con «—» mettono la seconda parte in corsivo), il numero romano in cima segue l'ordine dei capitoli. Passando sopra un libro esce un poco dallo scaffale e la targa d'ottone sotto la libreria mostra titolo e sottotitolo; toccandolo il libro viene estratto, si gira mostrando la copertina, si apre e compare solo quel capitolo. «◂ Torna alla libreria» rimette tutto a posto.

- Altezza, spessore e colore di ogni volume si ricavano dal titolo, quindi restano sempre uguali. Sul computer al massimo 8 volumi per ripiano; sul telefono quanti ne stanno. Negli spazi liberi compaiono candele e pile di libri coricati.
- Un capitolo nuovo in `tcj-master/zona-master.html` (un `.msec` con `.msect` e `.msecsub`) diventa da solo un nuovo volume.
- Nello stesso file c'è la finestra delle Schede dei Mael.

## Schede in diretta (Zona Master › Aree dei giocatori online · js/diretta-schede.js)

Il capitolo «Aree dei giocatori online» è diviso in tre colonne, una per Slayer: in cima lo stato del salvataggio online **su questo dispositivo** (Apri l'area / Scarica / Salva online, come prima), sotto la **scheda in sola lettura**, aggiornata a ogni modifica del giocatore.

- **Dal giocatore:** quando la sua Area dello Slayer è aperta e collegata con il **suo** token, ogni modifica della scheda viene copiata nel file `diretta.json` del suo repository (`tcj-athena`, `tcj-panlan`, `tcj-asonnes`), dopo un paio di secondi; più modifiche di fila diventano un solo invio e tra due invii passano almeno 12 secondi. `dati.json` e il «☁ Salva online» del giocatore non cambiano. Il ritratto viaggia come miniatura. Gli altri giocatori non possono leggerlo: il repository lo aprono solo il token del personaggio e quello del Master.
- **Dal Master:** mentre il capitolo è aperto (o a schermo intero) il sito rilegge i tre `diretta.json` ogni 3 secondi (se nulla è cambiato GitHub risponde «uguale» e non costa niente). Ciò che è appena cambiato si illumina (un tocco lo spegne) e finisce in «Ultime modifiche». In cima a ogni scheda: «In diretta · adesso» se il giocatore ha modificato negli ultimi 2 minuti, e se ha modifiche non ancora salvate online.
- Finché un giocatore non ha mai mandato la diretta, la colonna mostra la copia di questo dispositivo e poi l'ultimo «Salva online» del giocatore.
- **⛶ Schermo intero** mette le tre schede sopra il sito, ognuna con il suo scorrimento; sul telefono si scorre da una scheda all'altra di lato (i tre nomi in cima portano alla scheda).
- Non serve preparare niente: bastano i token che ci sono già.

## Tema «Oro del Master» (js/tema-oro.js)

Nel menu **⚔ Slayer › Zona Master** ci sono tre scelte d'oro, indipendenti tra loro e visibili solo al Master:

- **Colore della Zona Master** (🩸 Cremisi / ☀ Oro · Golden Sun) → `html[data-zm=oro]`. Cambia **solo la Zona Master** e le sue finestre (libreria, strumenti, schede in diretta), non lo sfondo del sito. Funziona anche con «Sfondo del Master» spento. Libri in cuoio scuro e foglia d'oro con un riflesso che scorre sui dorsi; dietro il titolo, al posto dell'anello runico, il **Golden Sun** (il simbolo accanto a «The Careless Journey», `#gsun` in `sezioni/simboli-svg.js`): respira, gli girano attorno due aloni e una scia di luce ne ripercorre i contorni. La scelta sta in `tcj_bg_master` → `zm`.
- **Colore del sito** «☀ Oro del Master» → `html[data-el=oro]`: solo sfondo e colori del resto del sito; la Zona Master segue la sua scelta.
- **Effetti laterali «Sigillo Aureo»:** ai due bordi dello schermo il Golden Sun d'oro (sul lato destro non viene specchiato), con un alone che respira, due cerchi tratteggiati che girano attorno alla spirale, fasci di luce, onde di luce che partono dalla spirale, un riflesso che lo attraversa dall'alto in basso, una scia luminosa lungo i contorni e scintille che si staccano dalle punte; intorno pulviscolo d'oro e scaglie di foglia d'oro che cadono girando. Il simbolo viene letto da `#gsun`, quindi se un giorno cambi il disegno lì cambia anche qui. Il disegno è in `js/tema-oro.js` (OFX); il motore degli effetti laterali resta in `js/area-giocatori.js`.
- `css/29-tema-oro-auto.css` è **generato**: `node strumenti/tema-oro.js` prende le regole cremisi della Zona Master e degli strumenti del Master e ne scrive la versione dorata (`html[data-zm=oro]`). Rilancialo se aggiungi stili rossi in quei file (l'elenco è in cima allo strumento), poi `node strumenti/versiona.js`.

## Tema del sito: Attuale / Cieli Tersi / Manuale classico / Cacciatore / Gastrocomiche / Reami Dimenticati / Arena (js/tema-sito.js)

Si sceglie nel menu in alto a destra (⚔ Slayer ▾ → «Tema del sito»). Di base resta **Attuale**. Nel codice i temi hanno ancora le chiavi di prima (`dauntless`, `pergamena`, `mh`, `osteria`, `reami`): cambiano solo i nomi nel menu.

- **Cieli Tersi** (`css/31-tema-dauntless.css`, ispirato a Dauntless): cielo con isole sospese ai lati, nuvole, alianti, una nave e un Behemoth volante che passano; pannelli blu notte con cornici d'acciaio, schede blu e pulsante principale dorato, come nei menu del gioco.
- **Manuale classico** (`css/32-tema-pergamena.css`): come un manuale di D&D classico — ogni sezione è un foglio di pergamena con bordi strappati e bruciacchiati, fibre, macchie e puntini del tempo; inchiostro scuro e titoli rossi.
- **Cacciatore** (`css/34-tema-monster-hunter.css`, ispirato a Monster Hunter): valle al tramonto (`media/cacciatore-valle.webp`, disegno originale) con montagne, alberi giganti, fiume e nebbia; lucciole guida verdi e creature mitologiche che attraversano il cielo a turno, da sinistra a destra o al contrario (`js/tema-creature.js`: drago occidentale, drago orientale, fenice, viverna, stormo); in basso a destra un piccolo accampamento su una collinetta, con tenda, falò, carne sullo spiedo che gira e un gatto che gira la manovella. Il colore Aether tinge la luce della valle.
- **Gastrocomiche** (`css/35-tema-osteria.css`): muro d'osteria, carta macchiata di vino, tovaglia a quadri e titoli scritti col gesso su lavagna (ispirato a Brancalonia e alle Gastrocomiche di InnTale).
- **Reami Dimenticati** (`css/36-tema-reami.css`, ispirato ai Forgotten Realms): sullo sfondo un tempio sotterraneo illuminato dal fuoco (`media/reami-tempio.webp`, disegno originale) con braci che salgono e luce che tremola; il colore Aether tinge la luce del tempio. I riquadri di testo sono muri di pietra scura a blocchi (texture SVG nel blocco «Pietra» in fondo al file) con le scritte incise in oro caldo e la luce delle torce dall'alto; barra del menu in cuoio rosso e oro.
- **Arena** (`css/41-tema-arena.css` + `js/tema-arena.js`, ispirato ai menu di Ratchet & Clank 3, Ratchet: Gladiator e Jak 2, senza nulla di originale dei giochi): sullo sfondo una stazione spaziale disegnata da zero (`media/arena-stazione.webp`) con due anelli che girano in versi opposti (fasce a spicchi che scorrono, mascherate sulla curva), navicelle, una scia e luci che lampeggiano; riquadri di metallo canna di fucile con cornice d'acciaio, staffe agli angoli e filo arancione; targa del titolo arancione semitrasparente con un leggero disturbo televisivo e asta d'acciaio sotto; filetti ambra. Sul telefono la stazione è ferma. Caratteri: Michroma (titoli), Rajdhani (etichette), Exo 2 (testo).
- Gli effetti laterali e le particelle di sfondo restano in tutti i temi (nei temi chiari diventano scuri come inchiostro, per vedersi sulla carta).
- Tutti seguono il **colore Aether** scelto (Impostazioni sfondo): in Cieli Tersi cambia il cielo (Glaciale = bianco sporco invernale, Oscuro = notte viola…), nel Manuale classico si tinge il foglio.
- **Non cambiano mai**: la Zona Master (e le sue finestre), l'animazione iniziale e la mappa del mondo con le mappe dei continenti. L'elenco di ciò che resta escluso è in cima ai file CSS dei temi (`:is(#ms,#pwo,…)`).
- **Leggerezza:** si scaricano solo gli stili del tema scelto (elenco `TCJ_TEMI_CSS` in `index.html`, caricato da `js/tema-sito.js`). Sul telefono `css/38-temi-telefono.css` spegne da solo gli effetti più pesanti (strati di colore fusi, bordi ruvidi dei titoli, aloni e due delle creature, nuvole che scorrono).
- La scelta resta nel browser (`tcj-tema`); se un personaggio è attivo finisce anche nel suo pacchetto (`tcj_bg_<pg>`, campo `t`) e lo segue su ogni dispositivo.

### Caratteri dei temi (css/37-temi-caratteri.css)

Ogni tema ha i suoi caratteri (dai Google Fonts), applicati a titoli, etichette e testo; Zona Master, mappa e Aspetto dell'area restano come sono.

| Tema | Titoli | Etichette e pulsanti | Testo |
|---|---|---|---|
| Cieli Tersi | Cinzel grassetto, maiuscolo | come prima (Barlow Condensed) | come prima |
| Cacciatore | Cinzel nerissimo con bordi ruvidi (filtro `#tcj-ruvido`) | Oswald | come prima |
| Gastrocomiche | Gloria Hallelujah (gesso sulla lavagna) | Patrick Hand | Patrick Hand |
| Reami Dimenticati | Cinzel inciso | Cinzel | EB Garamond |
| Arena | Michroma | Rajdhani | Exo 2 |
| Manuale classico | Great Vibes (calligrafia) | Dancing Script | Dancing Script |

Le regole sono generate partendo dagli stili che usano Cinzel Decorative (titoli), Cinzel (etichette) e Crimson Pro (testo): se si aggiunge una sezione nuova con questi caratteri, conviene aggiungere i suoi selettori al file.

## Aspetto dell'Area dello Slayer (js/area-aspetto.js + css/33-area-aspetto.css)

Opzionale, solo per l'area del singolo player: di base resta la **scheda classica**. Dalla barra «Aspetto dell'area» il player può trasformare le sezioni in 📚 libri, ⚗ ampolle, 🗄 cassettiera, 🃏 tavolo pirata, 🔨 attrezzi, 📖 capitoli o 📌 bacheca. Toccando un oggetto si apre sotto solo quella sezione, con gli stessi dati della scheda.

- Gli oggetti sono disegnati realistici: i libri sono gli stessi volumi della libreria della Zona Master (stili di `css/20-master-libreria.css`), le ampolle sono di vetro con liquido, menisco, bolle e tappo di sughero, il tavolo ha assi di legno, candela accesa, monete, dadi e carte illustrate. Le trame (legno, carta, sughero) sono piccole immagini SVG in cima a `css/33-area-aspetto.css`.
- Sul telefono ampolle, carte, cassetti e attrezzi si rimpiccioliscono e stanno in più per riga.
- Misure, forme e inclinazioni partono a caso e restano uguali finché il player non preme «↻ Mescola».
- Con le ampolle, «✎ Personalizza ampolle» permette di scegliere forma e colore di ognuna («↺ Come prima» torna a quella casuale).
- L'ordine degli oggetti segue la disposizione di «✎ Modifica area».
- Si salva nella chiave `tcj-asp-<pg>`, dentro il pacchetto online del personaggio.
- Per una sezione nuova della scheda basta il suo `data-pz`: compare da sola. Nome, icona e attrezzo si aggiungono in `NOMI` e `ATTREZZI` in cima al file.

## Codici delle aree dei giocatori

Nel sito non c'è più nessun codice in chiaro: in `js/area-giocatori.js` (PA_HASH) c'è solo l'«impronta» di ogni codice, da cui non si risale al codice vero. Per cambiare il codice di un personaggio:

    node strumenti/impronta.js "NuovoCodice"

e incolla il risultato al posto dell'impronta di quel personaggio. Maiuscole e minuscole non contano.

## Incontri (sezione pubblica + editor del Master)

- La sezione **Incontri** (`sezioni/incontri.js`, `js/incontri.js`) legge `dati/incontri.json`: contiene **solo** ciò che i giocatori possono vedere. Le foto pubblicate, già ritagliate, stanno in `img/incontri/`.
- I dati veri stanno nel repository privato `tcj-master`: `incontri/personaggi.json` (elenco completo, note del Master, interruttori di visibilità) e `incontri/foto/` (galleria delle foto originali).
- Si lavora dalla Zona Master, capitolo «Incontri — Registro dei personaggi» (`js/master-incontri.js`). «📣 Pubblica sul sito» riscrive `dati/incontri.json` e le foto in un'unica modifica: il token del Master deve includere anche `careless-journey` (Contents: Read and write).
- Le note dei giocatori sui personaggi stanno nel loro pacchetto (`tcj-inc-<personaggio>`) e seguono il loro salvataggio online.
