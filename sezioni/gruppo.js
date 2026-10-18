/* Sezione: Il Gruppo — PV e stati alterati di tutti gli Slayer, aggiornati in diretta.
   Viene inserita nella pagina esattamente nel punto in cui index.html la richiama (subito sopra l'Area dello Slayer).
   Il funzionamento è in js/gruppo.js, l'aspetto in css/22-gruppo.css. */
tcjSezione(`<section id="gruppo">
  <div class="si">
    <div class="sh"><div class="sl">Sul campo</div><h2 class="st">Il Gruppo</h2><div class="sline"></div><p class="sdesc">Punti Vita, stati alterati e turno di ogni Slayer, aggiornati da soli mentre giocate.</p></div>
    <div class="gr-live" id="gr-live" role="status" aria-live="polite"><span class="gr-dot"></span><span id="gr-live-t">In collegamento…</span></div>
    <div class="gr-turnbar" id="gr-turnbar">
      <div class="gr-tb-n"><small>Turno</small><b id="gr-turno">—</b></div>
      <div class="gr-tb-done" id="gr-tb-done"></div>
      <div class="gr-tb-act"><button type="button" class="gr-fine" id="gr-fine" onclick="grFineTurnoMaster()">⏭ Fine turno</button><button type="button" class="gr-azzera" id="gr-azzera" onclick="grAzzera()" title="Nuovo scontro: i turni ripartono da 1" aria-label="Nuovo scontro" hidden>↺</button><small class="gr-tb-h" id="gr-tb-h">Solo il Master può chiudere il turno</small></div>
    </div>
    <div class="gr-board" id="gr-board"></div>
  </div>
</section>`);
