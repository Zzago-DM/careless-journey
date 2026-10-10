/* Sezione: Manuale dello Slayer — testo e struttura HTML.
   Viene inserita nella pagina esattamente nel punto in cui index.html la richiama. */
tcjSezione(`<section id="manuale">
  <div class="si">
    <div class="sh"><div class="sl">Regole</div><h2 class="st">Manuale dello Slayer</h2><div class="sline"></div><p class="sdesc">Tutto ciò che serve per giocare: armi, celle, combattimento, nuclei elementali e progressione.</p></div>
    <div class="cta-row"><a href="https://zzago-dm.github.io/Manuale-Cacciatore/Manuale_dello_Slayer.pdf" target="_blank" rel="noopener noreferrer" class="tcj-cta tcj-cta-purple">📖 Apri il Manuale completo</a><a href="https://www.owlbear.rodeo/room/jrCXLMk2u9Yz/The%20Faint%20Maker" target="_blank" rel="noopener noreferrer" class="tcj-cta tcj-cta-gold">⚔ Entra al tavolo · Owlbear Rodeo</a></div>
    <div class="mtabs">
      <button class="mtab active" onclick="swTab('armi',this)">Armi</button>
      <button class="mtab" onclick="swTab('tipologie',this)">Tipologie Attacco</button>
      <button class="mtab" onclick="swTab('celle',this)">Celle di Aether</button>
      <button class="mtab" onclick="swTab('omnicelle',this)">Omnicelle &amp; AMP</button>
      <button class="mtab" onclick="swTab('combattimento',this)">Combattimento</button>
      <button class="mtab" onclick="swTab('elementi',this)">Nuclei &amp; Elementi</button>
      <button class="mtab" onclick="swTab('stati',this)">Stati &amp; Effetti</button>
      <button class="mtab" onclick="swTab('equipaggiamento',this)">Equipaggiamento</button>
      <button class="mtab" onclick="swTab('progressione',this)">Progressione</button>
      <button class="mtab" onclick="swTab('supporto',this)">Armi di Supporto</button>
    </div>
    <div class="bbox" id="bbox-manuale"><div class="mpanel active" id="p-armi">
      <div class="qi">Le armi aetheriche sono catalizzatori di Aether, progettati per affrontare creature che superano l'umano in forza, resistenza e dimensioni.</div>
      <table class="tcj-t" style="margin-top:1.25rem"><thead><tr><th>Categoria</th><th>Mod.</th><th>Dado</th><th>Regola</th></tr></thead><tbody>
        <tr><td><strong>Pesanti</strong> (Martelli, Asce)</td><td>−1 DES, +2 COST</td><td>1D8</td><td>Nessun secondo attacco nello stesso turno</td></tr>
        <tr><td><strong>Leggere</strong> (Pugni, Lame)</td><td>+2 DES, −1 COST</td><td>1D4</td><td>Due attacchi per turno; se il primo fallisce si può ritirare</td></tr>
        <tr><td><strong>Bilanciate</strong> (Lance, Spade)</td><td>+1 DES, +1 COST</td><td>1D6</td><td>Secondo attacco solo se il primo va a segno</td></tr>
      </tbody></table>
      <div id="wgrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.25rem"></div>
    </div>
    <div class="mpanel" id="p-tipologie">
      <table class="tcj-t"><thead><tr><th>Tipologia</th><th>Obiettivo</th><th>Colpire</th><th>Danni</th><th>Effetto</th></tr></thead><tbody>
        <tr><td><strong>Mirato</strong></td><td>Colpo preciso su una parte</td><td>DES</td><td>DES</td><td>Rompe la parte. Una parte rotta non può essere rotta nuovamente.</td></tr>
        <tr><td><strong>Lacerante</strong></td><td>Indebolisce senza rompere</td><td>DES</td><td>FOR</td><td>+2 ai danni del prossimo attacco sulla stessa parte. Dura 2 turni.</td></tr>
        <tr><td><strong>Stordente</strong></td><td>Sopraffare con forza bruta</td><td>FOR</td><td>FOR</td><td>Behemoth inerme 1 turno. Più efficace sulla testa. Stordimenti successivi più difficili.</td></tr>
      </tbody></table>
    </div>
    <div class="mpanel" id="p-celle">
      <div class="qi">Ogni Slayer può equipaggiare fino a 6 celle, suddivise in tre categorie potenziabili (+3 e +6).</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.85rem;margin-top:1.25rem" id="cgrid"></div>
    </div>
    <div class="mpanel" id="p-omnicelle">
      <div class="qi">Ogni Slayer possiede un singolo slot Omnicella, distinto dalle celle normali e legato al personaggio, non all'arma. Lo slot può ospitare fino a 4 AMP scelti liberamente dal catalogo, oppure una delle sei Omnicelle elementali una volta ottenuta. La scelta tra le due modalità resta sempre libera.</div>
      <div style="font-size:.78rem;color:var(--text2);font-style:italic;margin:.6rem 0 1.5rem">Le condizioni per ottenere ciascuna Omnicella sono note solo al Master.</div>
      <h3 style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold2);margin:1.25rem 0 .9rem">Le Sei Omnicelle</h3>
      <div id="ogrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;margin-bottom:2rem"></div>
      <h3 style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold2);margin:1.25rem 0 .9rem">Catalogo AMP</h3>
      <div class="qi" style="margin-bottom:1rem">Potenziamenti passivi minori: fino a 4 equipaggiabili contemporaneamente nello slot Omnicella, finché non si ottiene la versione elementale.</div>
      <table class="tcj-t"><thead><tr><th style="width:28%">AMP</th><th>Effetto</th></tr></thead><tbody id="ampbody"></tbody></table>
    </div>
    <div class="mpanel" id="p-combattimento">
      <div class="qi">Combattimento strutturato in round alternati tra Slayer e Behemoth.</div>
      <h3 style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold2);margin:1.25rem 0 .7rem">Tiri Fondamentali</h3>
      <table class="tcj-t"><thead><tr><th>Azione</th><th>Contro Behemoth</th><th>Contro Slayer / NPC</th></tr></thead><tbody>
        <tr><td><strong>Colpire</strong></td><td>CD = 5 + Bonus DES mostro → 1D20 puro</td><td>CD fissa 13 → 1D20 + Bonus DES</td></tr>
        <tr><td><strong>Schivare</strong></td><td>CD fissa 15 → 1D20 + Bonus DES</td><td>CD fissa 13 → 1D20 + Bonus DES</td></tr>
        <tr><td><strong>Tankare</strong></td><td>CD = 13 + Bonus FOR → 1D20 + FOR + COST</td><td>CD fissa 17 → 1D20 + FOR + COST</td></tr>
      </tbody></table>
      <h3 style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold2);margin:1.25rem 0 .7rem">Stanchezza</h3>
      <table class="tcj-t"><thead><tr><th>Livello</th><th>Effetto</th></tr></thead><tbody>
        <tr><td>1</td><td>Velocità dimezzata</td></tr><tr><td>2</td><td>Svantaggio alle prove di caratteristica</td></tr>
        <tr><td>3</td><td>Svantaggio ai tiri per colpire e tiri salvezza</td></tr><tr><td>4</td><td>PV massimi dimezzati</td></tr>
        <tr><td>5</td><td>Velocità ridotta a 0</td></tr><tr><td>6</td><td>Svenimento</td></tr>
      </tbody></table>
      <p style="font-size:.86rem;color:var(--text2)">Riposo breve: −2 livelli. Riposo lungo: rimozione completa.</p>
    </div>
    <div class="mpanel" id="p-elementi">
      <div class="qi">In difesa conviene adottare lo stesso elemento del Behemoth; in attacco, l'elemento opposto.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;margin-top:1.25rem">
        <div class="card"><div style="font-family:'Cinzel',serif;font-size:.88rem;font-weight:700;color:var(--fire);margin-bottom:.7rem">🔥 Fiammeggiante</div><div style="display:flex;gap:.45rem;margin-bottom:.25rem;font-size:.82rem"><span style="color:var(--text2);min-width:50px;font-family:'Cinzel',serif;font-size:.56rem;text-transform:uppercase">Arma</span><span>+2 vs glaciali; può Bruciare</span></div><div style="display:flex;gap:.45rem;font-size:.82rem"><span style="color:var(--text2);min-width:50px;font-family:'Cinzel',serif;font-size:.56rem;text-transform:uppercase">Armatura</span><span>Riduce ¼ danni da infuocati; aumenta ¼ da glaciali</span></div></div>
        <div class="card"><div style="font-family:'Cinzel',serif;font-size:.88rem;font-weight:700;color:var(--ice);margin-bottom:.7rem">❄️ Glaciale</div><div style="display:flex;gap:.45rem;margin-bottom:.25rem;font-size:.82rem"><span style="color:var(--text2);min-width:50px;font-family:'Cinzel',serif;font-size:.56rem;text-transform:uppercase">Arma</span><span>+2 vs infuocati; può Ibernare</span></div><div style="display:flex;gap:.45rem;font-size:.82rem"><span style="color:var(--text2);min-width:50px;font-family:'Cinzel',serif;font-size:.56rem;text-transform:uppercase">Armatura</span><span>Riduce ¼ danni da glaciali; aumenta ¼ da infuocati</span></div></div>
        <div class="card"><div style="font-family:'Cinzel',serif;font-size:.88rem;font-weight:700;color:var(--earth);margin-bottom:.7rem">🌍 Terrestre</div><div style="display:flex;gap:.45rem;margin-bottom:.25rem;font-size:.82rem"><span style="color:var(--text2);min-width:50px;font-family:'Cinzel',serif;font-size:.56rem;text-transform:uppercase">Arma</span><span>+2 vs elettrici; può Fulminare</span></div><div style="display:flex;gap:.45rem;font-size:.82rem"><span style="color:var(--text2);min-width:50px;font-family:'Cinzel',serif;font-size:.56rem;text-transform:uppercase">Armatura</span><span>Riduce ¼ da terrestri; aumenta ¼ da elettrici</span></div></div>
        <div class="card"><div style="font-family:'Cinzel',serif;font-size:.88rem;font-weight:700;color:var(--lightning);margin-bottom:.7rem">⚡ Elettrico</div><div style="display:flex;gap:.45rem;margin-bottom:.25rem;font-size:.82rem"><span style="color:var(--text2);min-width:50px;font-family:'Cinzel',serif;font-size:.56rem;text-transform:uppercase">Arma</span><span>+2 vs terrestri; può Interrare</span></div><div style="display:flex;gap:.45rem;font-size:.82rem"><span style="color:var(--text2);min-width:50px;font-family:'Cinzel',serif;font-size:.56rem;text-transform:uppercase">Armatura</span><span>Riduce ¼ da elettrici; aumenta ¼ da terrestri</span></div></div>
        <div class="card"><div style="font-family:'Cinzel',serif;font-size:.88rem;font-weight:700;color:var(--dark);margin-bottom:.7rem">🌑 Oscuro</div><div style="display:flex;gap:.45rem;margin-bottom:.25rem;font-size:.82rem"><span style="color:var(--text2);min-width:50px;font-family:'Cinzel',serif;font-size:.56rem;text-transform:uppercase">Arma</span><span>+2 vs radianti; può Corrompere</span></div><div style="display:flex;gap:.45rem;font-size:.82rem"><span style="color:var(--text2);min-width:50px;font-family:'Cinzel',serif;font-size:.56rem;text-transform:uppercase">Armatura</span><span>Riduce ¼ da oscuri; aumenta ¼ da radianti</span></div></div>
        <div class="card"><div style="font-family:'Cinzel',serif;font-size:.88rem;font-weight:700;color:var(--radiant);margin-bottom:.7rem">✨ Radiante</div><div style="display:flex;gap:.45rem;margin-bottom:.25rem;font-size:.82rem"><span style="color:var(--text2);min-width:50px;font-family:'Cinzel',serif;font-size:.56rem;text-transform:uppercase">Arma</span><span>+2 vs oscuri; può Abbagliare</span></div><div style="display:flex;gap:.45rem;font-size:.82rem"><span style="color:var(--text2);min-width:50px;font-family:'Cinzel',serif;font-size:.56rem;text-transform:uppercase">Armatura</span><span>Riduce ¼ da radianti; aumenta ¼ da oscuri</span></div></div>
      </div>
    </div>
    <div class="mpanel" id="p-stati">
      <h3 style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold2);margin-bottom:.9rem">Malus Aetherici</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.6rem;margin-bottom:1.75rem">
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--fire);margin-bottom:.15rem">Scottato</div><div style="font-size:.8rem;color:var(--text2)">3 turni → −2 PV/turno</div></div>
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--fire);margin-bottom:.15rem">Bruciato</div><div style="font-size:.8rem;color:var(--text2)">3 turni → −5 PV/turno</div></div>
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--ice);margin-bottom:.15rem">Ghiacciato</div><div style="font-size:.8rem;color:var(--text2)">3 turni → −3 DES</div></div>
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--ice);margin-bottom:.15rem">Ibernato</div><div style="font-size:.8rem;color:var(--text2)">3 turni → −5 DES</div></div>
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--lightning);margin-bottom:.15rem">Elettrificato</div><div style="font-size:.8rem;color:var(--text2)">3 turni → −1 PV, no azioni bonus</div></div>
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--lightning);margin-bottom:.15rem">Fulminato</div><div style="font-size:.8rem;color:var(--text2)">3 turni → −3 PV, no azioni bonus</div></div>
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--earth);margin-bottom:.15rem">Interrato</div><div style="font-size:.8rem;color:var(--text2)">3 turni → movimento dimezzato</div></div>
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--earth);margin-bottom:.15rem">Drenato</div><div style="font-size:.8rem;color:var(--text2)">3 turni → impossibile muoversi</div></div>
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--dark);margin-bottom:.15rem">Corrotto</div><div style="font-size:.8rem;color:var(--text2)">5 turni → −5 PV, svantaggio COST</div></div>
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--radiant);margin-bottom:.15rem">Abbagliato</div><div style="font-size:.8rem;color:var(--text2)">5 turni → −5 PV, svantaggio DES</div></div>
      </div>
      <h3 style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold2);margin-bottom:.9rem">Malus di Stato</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.6rem">
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--gold2);margin-bottom:.15rem">Sanguinante</div><div style="font-size:.8rem;color:var(--text2)">3 turni → −2 PV per azione/mov. Si rimuove rinunciando al turno.</div></div>
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--gold2);margin-bottom:.15rem">Emorragia</div><div style="font-size:.8rem;color:var(--text2)">5 turni → −5 PV per azione/mov. Si rimuove rinunciando al turno.</div></div>
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--gold2);margin-bottom:.15rem">Stordito</div><div style="font-size:.8rem;color:var(--text2)">Perde il 1° turno. No movimento nel 2°.</div></div>
        <div class="card" style="padding:.7rem"><div style="font-family:'Cinzel',serif;font-size:.76rem;color:var(--gold2);margin-bottom:.15rem">Frenesia</div><div style="font-size:.8rem;color:var(--text2)">1 turno → +8 FOR. Al termine no azione nel turno successivo.</div></div>
      </div>
    </div>
    <div class="mpanel" id="p-equipaggiamento">
      <div class="qi">5 tonici di guarigione gratuiti (1D6 PV). Tre slot: 5 tonici per slot o 2 piloni per slot.</div>
      <h3 style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold2);margin:1.25rem 0 .7rem">Tonici Base <span style="font-weight:300;color:var(--text2);font-size:.78rem">(1 turno)</span></h3>
      <table class="tcj-t"><thead><tr><th>Tonico</th><th>Effetto</th></tr></thead><tbody><tr><td>Salute</td><td>+1D6 PV</td></tr><tr><td>Resistenza</td><td>+2 COST</td></tr><tr><td>Stamina</td><td>+2 DES</td></tr><tr><td>Assalto</td><td>+2 FOR</td></tr></tbody></table>
      <h3 style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold2);margin:1.25rem 0 .7rem">Tonici Avanzati <span style="font-weight:300;color:var(--text2);font-size:.78rem">(3 turni)</span></h3>
      <table class="tcj-t"><thead><tr><th>Tonico</th><th>Effetto</th></tr></thead><tbody><tr><td>Aether Carica</td><td>+1 token elementali e +2 DES</td></tr><tr><td>Frenesia</td><td>+4 FOR; effetti negativi identici al termine</td></tr><tr><td>Antidoto</td><td>+2 COST; conclude o riduce stati aetherici attivi</td></tr><tr><td>Rubavita</td><td>−1 PV nel tempo; +5 PV ad ogni attacco al mostro</td></tr></tbody></table>
      <h3 style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold2);margin:1.25rem 0 .7rem">Piloni <span style="font-weight:300;color:var(--text2);font-size:.78rem">(3 turni, area 5×5)</span></h3>
      <table class="tcj-t"><thead><tr><th>Pilone</th><th>Effetto</th></tr></thead><tbody><tr><td>Ripulente</td><td>Blocca il progresso dei Malus aetherici nell'area</td></tr><tr><td>Inamovibile</td><td>Immunità da sbalzi e stordimento; se atterrati si può attaccare ancora</td></tr><tr><td>Ispirazione</td><td>Chi sta per cadere torna in assetto prima del colpo fatale</td></tr><tr><td>Accogliente</td><td>Cura 4 PV/turno a chiunque nell'area</td></tr></tbody></table>
    </div>
    <div class="mpanel" id="p-supporto">
      <div class="qi">Armi progettate da <strong>Janek Zai</strong> per gestire scontri contro Non-Behemoth e controllare il campo di battaglia.</div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;margin-top:1.25rem">
        <div class="card" style="padding:1.2rem">
          <div style="font-family:'Cinzel',serif;font-size:.92rem;font-weight:700;color:var(--gold2);margin-bottom:.3rem">🔫 Pistola Aetherica</div>
          <div style="font-size:.82rem;color:var(--text2);margin-bottom:.75rem;line-height:1.6">Portata media · Richiede <strong>azione bonus</strong> · Danno base 1D4 · Distanza 10 quadretti. Ideale per gruppi di avversari umani e applicazione di effetti di controllo. Può sparare Proiettili Aetherici con effetti elementali variabili.<br><strong style="color:var(--gold3)">Colpire (vs NPC):</strong> 1D20 + Bonus DES contro CD 13 entro i 10 quadretti; oltre i 10 la CD aumenta di +4, e di altri +4 ogni ulteriori 10 quadretti.</div>
          <div style="font-family:'Cinzel',serif;font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold3);margin-bottom:.4rem">Progressione</div>
          <table class="tcj-t" style="margin:0"><thead><tr><th>Livello</th><th>Proiettili</th><th>Dado</th></tr></thead><tbody>
            <tr><td>1</td><td>1</td><td>1D4</td></tr>
            <tr><td>5</td><td>2</td><td>2D4</td></tr>
            <tr><td>10</td><td>3</td><td>3D4</td></tr>
            <tr><td>15</td><td>4</td><td>4D4</td></tr>
            <tr><td>20</td><td>5</td><td>5D4</td></tr>
          </tbody></table>
        </div>
        <div class="card" style="padding:1.2rem">
          <div style="font-family:'Cinzel',serif;font-size:.92rem;font-weight:700;color:var(--gold2);margin-bottom:.3rem">🏹 Arco Aetherico</div>
          <div style="font-size:.82rem;color:var(--text2);margin-bottom:.75rem;line-height:1.6">Lunga gittata · Richiede <strong>azione principale</strong> · Gittata 30 quadretti. Più lento ma più potente della pistola. Indicato per controllo del territorio e supporto a lunga distanza. Spara frecce aetheriche con effetti elementali.<br><strong style="color:var(--gold3)">Colpire (vs NPC):</strong> 1D20 + Bonus DES contro CD 13 tra i 5 e i 30 quadretti; sotto i 5 il tiro è con svantaggio; oltre i 30 la CD aumenta di +4, e di altri +4 ogni ulteriori 10 quadretti.</div>
          <div style="font-family:'Cinzel',serif;font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold3);margin-bottom:.4rem">Progressione</div>
          <table class="tcj-t" style="margin:0"><thead><tr><th>Livello</th><th>Dado</th></tr></thead><tbody>
            <tr><td>1</td><td>1D6</td></tr>
            <tr><td>5</td><td>1D8</td></tr>
            <tr><td>10</td><td>1D10</td></tr>
            <tr><td>15</td><td>1D12</td></tr>
            <tr><td>20</td><td>1D20</td></tr>
          </tbody></table>
        </div>
      </div>

      <h3 style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold2);margin:1.75rem 0 .75rem">Proiettili & Frecce Aetheriche <span style="font-weight:300;color:var(--text2);font-size:.78rem">(durata massima effetti: 3 turni)</span></h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:.85rem">
        <div class="card" style="padding:.85rem">
          <div style="font-family:'Cinzel',serif;font-size:.8rem;font-weight:700;color:var(--earth);margin-bottom:.4rem">🌍 Terrestre</div>
          <div style="font-size:.82rem;color:var(--text);line-height:1.55"><strong style="color:var(--text2)">Su alleato/sé:</strong> vortice di pietre, +3 COST.<br><strong style="color:var(--text2)">Su nemico:</strong> riduce DES e movimenti (svantaggio DES).</div>
        </div>
        <div class="card" style="padding:.85rem">
          <div style="font-family:'Cinzel',serif;font-size:.8rem;font-weight:700;color:var(--fire);margin-bottom:.4rem">🔥 Fiammeggiante</div>
          <div style="font-size:.82rem;color:var(--text);line-height:1.55">Palla di fuoco: 1D4 extra in area 3×3, infuoca il bersaglio. Tiro salvezza COST CD 13+ bonus per i vicini.</div>
        </div>
        <div class="card" style="padding:.85rem">
          <div style="font-family:'Cinzel',serif;font-size:.8rem;font-weight:700;color:var(--ice);margin-bottom:.4rem">❄️ Congelante</div>
          <div style="font-size:.82rem;color:var(--text);line-height:1.55">Zona 5×5 di ghiaccio: vantaggio ai tiri vs avversari nell'area, mobilità ridotta per loro.</div>
        </div>
        <div class="card" style="padding:.85rem">
          <div style="font-family:'Cinzel',serif;font-size:.8rem;font-weight:700;color:var(--radiant);margin-bottom:.4rem">✨ Radiante</div>
          <div style="font-size:.82rem;color:var(--text);line-height:1.55">Zona 5×5: alleati +4 DES e +2 PV rigenerati per ogni turno trascorso nell'area.</div>
        </div>
        <div class="card" style="padding:.85rem">
          <div style="font-family:'Cinzel',serif;font-size:.8rem;font-weight:700;color:var(--dark);margin-bottom:.4rem">🌑 Oscuro</div>
          <div style="font-size:.82rem;color:var(--text);line-height:1.55">Portale che teletrasporta il bersaglio nell'area del proiettile.<br><strong style="color:var(--text2)">Su nemico:</strong> lo Slayer tira 1D20 + Bonus DES contro CD 8 (fissa e bassa); se riesce, il nemico viene teletrasportato.<br><strong style="color:var(--text2)">Su alleato/sé:</strong> teletrasporto automatico (fuga, schivata o sfuggire a prese), ma subisce comunque il danno del colpo del proiettile.</div>
        </div>
        <div class="card" style="padding:.85rem">
          <div style="font-family:'Cinzel',serif;font-size:.8rem;font-weight:700;color:var(--lightning);margin-bottom:.4rem">⚡ Fulmineo</div>
          <div style="font-size:.82rem;color:var(--text);line-height:1.55">Fulmine sulla linea di tiro: paralizza il primo avversario colpito, gli fa perdere il turno.</div>
        </div>
      </div>
    </div>
    <div class="mpanel" id="p-progressione">
      <div class="qi">+5 PV + Bonus COST ad ogni livello. +2 punti caratteristiche ogni 2 livelli.</div>
      <table class="tcj-t" style="margin-top:1.25rem"><thead><tr><th>Stadio</th><th>Livelli</th><th>Celle</th><th>Capacità</th></tr></thead><tbody>
        <tr><td style="color:var(--text2)"><strong>Novizio</strong></td><td>1–5</td><td>Max 3 (Vigore e Tecnica)</td><td>Guidato dalla gilda.</td></tr>
        <tr><td style="color:var(--earth)"><strong>Cacciatore</strong></td><td>6–10</td><td>+Forza disponibile</td><td>Accesso alle celle Forza.</td></tr>
        <tr><td style="color:var(--ice)"><strong>Discepolo</strong></td><td>11–15</td><td>6 celle</td><td>Vigore e Tecnica superiori; +6. Build con bilanciamento imposto.</td></tr>
        <tr><td style="color:var(--gold2)"><strong>Maestro</strong></td><td>16–20</td><td>Celle Forza superiori</td><td>Tutte le celle al +6 (a discrezione DM).</td></tr>
        <tr><td style="color:var(--radiant)"><strong>Fenice</strong></td><td>21–30</td><td>Nessun limite</td><td>Tutti i limiti cadono.</td></tr>
      </tbody></table>
    </div>
</div>
  </div>
</section>`);
