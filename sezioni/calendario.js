/* Sezione: Calendario — testo e struttura HTML.
   Viene inserita nella pagina esattamente nel punto in cui index.html la richiama. */
tcjSezione(`<section id="calendario">
  <div class="si">
    <div class="sh"><div class="sl">Ciclo delle Lune</div><h2 class="st">Le 12 Triadi di Lyra e Kornos</h2><div class="sline"></div><p class="sdesc">Il ciclo annuale è scandito da 12 Triadi, alternate tra Lyra (luna bianca) e Kornos (luna nera).</p></div>
    <div style="display:flex;gap:2rem;justify-content:center;margin-bottom:2rem;flex-wrap:wrap">
      <div style="text-align:center"><div class="bly" style="font-size:.7rem;padding:.3rem .9rem">🌕 Lyra — Luna Bianca</div><div style="font-size:.8rem;color:var(--text2);margin-top:.3rem">Triadi 1–6</div></div>
      <div style="text-align:center"><div class="bko" style="font-size:.7rem;padding:.3rem .9rem">🌑 Kornos — Luna Nera</div><div style="font-size:.8rem;color:var(--text2);margin-top:.3rem">Triadi 7–12</div></div>
    </div>
    <div class="cal-sky" id="cal-sky"></div><div class="g3" id="trgrid"></div>
  </div>
</section>`);
