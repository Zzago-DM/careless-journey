/* Sezione: Incontri — i personaggi conosciuti dal gruppo (testo e struttura HTML).
   I dati arrivano da dati/incontri.json, che si aggiorna dalla Zona Master con «Pubblica sul sito». */
tcjSezione(`<section id="incontri">
  <div class="si">
    <div class="sh"><div class="sl">Volti lungo il viaggio</div><h2 class="st">Incontri</h2><div class="sline"></div><p class="sdesc">I personaggi che il gruppo ha conosciuto. Cerca un nome per sapere se l'avete già incontrato e cosa sapete di lui.</p></div>
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
</section>`);
