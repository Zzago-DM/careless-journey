/* Sezione: Il Gruppo — PV e stati alterati di tutti gli Slayer, aggiornati in diretta.
   Viene inserita nella pagina esattamente nel punto in cui index.html la richiama (subito sopra l'Area dello Slayer).
   Il funzionamento è in js/gruppo.js, l'aspetto in css/22-gruppo.css. */
tcjSezione(`<section id="gruppo">
  <div class="si">
    <div class="sh"><div class="sl">Sul campo</div><h2 class="st">Il Gruppo</h2><div class="sline"></div><p class="sdesc">Punti Vita, stati alterati, turno di ogni Slayer e cassa di squadra, aggiornati da soli mentre giocate.</p></div>
    <div class="gr-live" id="gr-live" role="status" aria-live="polite"><span class="gr-dot"></span><span id="gr-live-t">In collegamento…</span></div>
    <div class="gr-turnbar" id="gr-turnbar">
      <div class="gr-tb-n"><small>Turno</small><b id="gr-turno">—</b></div>
      <div class="gr-tb-done" id="gr-tb-done"></div>
      <div class="gr-tb-act"><button type="button" class="gr-fine" id="gr-fine" onclick="grFineTurnoMaster()">⏭ Fine turno</button><button type="button" class="gr-azzera" id="gr-azzera" onclick="grAzzera()" title="Nuovo scontro: i turni ripartono da 1" aria-label="Nuovo scontro" hidden>↺</button><small class="gr-tb-h" id="gr-tb-h">Solo il Master può chiudere il turno</small></div>
    </div>
    <div class="gr-board" id="gr-board"></div>
    <div class="gc-cassa" id="gc-cassa" aria-labelledby="gc-tit">
      <div class="gc-head">
        <div class="gc-tit" id="gc-tit"><span aria-hidden="true">💰</span> Cassa di squadra</div>
        <div class="gc-tot" aria-live="polite"><small>Totale del gruppo</small><b id="gc-tot">—</b><small>monete</small></div>
      </div>
      <div class="gc-val" id="gc-val"></div>
      <div class="gc-mov" role="group" aria-label="Togli o aggiungi monete">
        <select class="gc-sel" id="gc-sel" aria-label="Valuta"></select>
        <input class="gc-q" id="gc-q" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="7" placeholder="Quante?" aria-label="Quante monete" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}">
        <button type="button" class="gc-b gc-togli" onclick="gcMuovi(-1)">− Togli</button>
        <button type="button" class="gc-b gc-agg" onclick="gcMuovi(1)">+ Aggiungi</button>
      </div>
      <details class="gc-nuova" id="gc-nuova"><summary>+ Nuova valuta</summary>
        <div class="gc-nrow"><input class="gc-nn" id="gc-nn" type="text" maxlength="40" placeholder="Nome della valuta" aria-label="Nome della nuova valuta"><input class="gc-nq" id="gc-nq" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="7" placeholder="Monete" aria-label="Monete iniziali"><button type="button" class="gc-b" onclick="gcNuova()">Crea</button></div>
      </details>
      <div class="gc-imp" id="gc-imp" hidden></div>
      <div class="gc-msg" id="gc-msg" hidden></div>
      <div class="gc-sto"><div class="gc-sub">Ultimi movimenti</div><ol class="gc-list" id="gc-sto"></ol></div>
    </div>
  </div>
</section>`);
