/* Sezione: Behemoth (bestiario) — testo e struttura HTML.
   Viene inserita nella pagina esattamente nel punto in cui index.html la richiama. */
tcjSezione(`<section id="behemoth">
  <div class="si">
    <div class="sh"><div class="sl">Catalogo</div><h2 class="st">I Behemoth</h2><div class="sline"></div><p class="sdesc">Creature che incarnano l'eccesso dell'Aether. Classificate per categoria e tipo elementale.</p></div>
    <div class="bfilt">
      <button class="fb active" onclick="fbeh('all',this)">Tutti</button>
      <button class="fb" onclick="fbeh('classico',this)">Classici</button><button class="fb" onclick="fbeh('variante',this)">Varianti</button>
      <button class="fb" onclick="fbeh('anomalo',this)">Anomali</button><button class="fb" onclick="fbeh('leggendario',this)">Leggendari</button>
      <button class="fb" onclick="fbeh('evoluto',this)">Evoluti</button><button class="fb" onclick="fbeh('nuovo',this)">Nuove Aggiunte</button>
      <button class="fb" onclick="fbeh('glaciale',this)">❄ Glaciale</button><button class="fb" onclick="fbeh('ardente',this)">🔥 Ardente</button>
      <button class="fb" onclick="fbeh('folgorante',this)">⚡ Folgorante</button><button class="fb" onclick="fbeh('terrestre',this)">🌍 Terrestre</button>
      <button class="fb" onclick="fbeh('radiante',this)">✨ Radiante</button><button class="fb" onclick="fbeh('oscuro',this)">🌑 Oscuro</button>
      <button class="fb" onclick="fbeh('neutro',this)">◆ Neutro</button>
    </div>
    <div class="bbox-bar"><input type="search" class="bsearch" id="bsearch" placeholder="Cerca un Behemoth…" oninput="fbehApply()" aria-label="Cerca un Behemoth"><span class="bcount" id="bcount"></span></div><div class="bbox" id="bbox"><div class="g4" id="bgrid"></div><div class="bnone" id="bnone" hidden>Nessun Behemoth corrisponde.</div></div>
  </div>
</section>`);
