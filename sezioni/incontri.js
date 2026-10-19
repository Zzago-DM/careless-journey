/* Sezione: Incontri — i personaggi conosciuti dal gruppo (testo e struttura HTML).
   I dati arrivano da dati/incontri.json, che si aggiorna dalla Zona Master con «Pubblica sul sito». */
tcjSezione(`<section id="incontri">
  <div class="si">
    <div class="sh"><div class="sl">Volti lungo il viaggio</div><h2 class="st">Incontri</h2><div class="sline"></div><p class="sdesc">I personaggi che il gruppo ha conosciuto. Cerca un nome per sapere se l'avete già incontrato e cosa sapete di lui.</p></div>
    <button type="button" class="inc-apri" id="inc-apri" aria-haspopup="dialog" aria-controls="inc-win">
      <span class="inc-apri-av" id="inc-apri-av" aria-hidden="true"></span>
      <span class="inc-apri-t"><b>Registro degli Incontri</b><small id="inc-apri-n">Apro il registro…</small></span>
      <span class="inc-apri-b">📖 Apri il registro</span>
    </button>
    <div class="inc-win" id="inc-win" role="dialog" aria-modal="true" aria-labelledby="inc-win-t" hidden>
     <div class="inc-win-box">
      <div class="inc-win-top"><div><div class="sl">Volti lungo il viaggio</div><h3 class="inc-win-t" id="inc-win-t">Registro degli Incontri</h3></div><button type="button" class="mae-x inc-win-x" id="inc-win-x" aria-label="Chiudi il registro">✕</button></div>
      <div class="inc-bar">
        <label class="inc-cerca"><span class="inc-lente" aria-hidden="true">⌕</span><input type="search" id="inc-q" placeholder="Cerca un nome, una fazione, un tag…" autocomplete="off" aria-label="Cerca tra gli incontri"></label>
        <div class="inc-ordine" role="radiogroup" aria-label="Ordina">
          <button type="button" role="radio" class="inc-ord on" data-ord="az" aria-checked="true">A–Z</button>
          <button type="button" role="radio" class="inc-ord" data-ord="cont" aria-checked="false">Per continente</button>
        </div>
        <span class="inc-conta" id="inc-conta" aria-live="polite"></span>
      </div>
      <div class="inc-lista" id="inc-lista"><div class="inc-vuoto">Apro il registro degli incontri…</div></div>
     </div>
    </div>
  </div>
</section>`);
