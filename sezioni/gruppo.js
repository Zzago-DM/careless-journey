/* Sezione: Il Gruppo — PV e stati alterati di tutti gli Slayer, aggiornati in diretta.
   Viene inserita nella pagina esattamente nel punto in cui index.html la richiama (subito sopra l'Area dello Slayer).
   Il funzionamento è in js/gruppo.js, l'aspetto in css/22-gruppo.css. */
tcjSezione(`<section id="gruppo">
  <div class="si">
    <div class="sh"><div class="sl">Sul campo</div><h2 class="st">Il Gruppo</h2><div class="sline"></div><p class="sdesc">Punti Vita e stati alterati di ogni Slayer. Si aggiorna da solo appena qualcuno cambia la propria scheda.</p></div>
    <div class="gr-live" id="gr-live" role="status" aria-live="polite"><span class="gr-dot"></span><span id="gr-live-t">In collegamento…</span></div>
    <div class="gr-board" id="gr-board"></div>
  </div>
</section>`);
