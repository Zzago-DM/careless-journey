/* Sezione: Manuale dello Slayer — testo e struttura HTML.
   Viene inserita nella pagina esattamente nel punto in cui index.html la richiama.
   Le schede di armi e celle sono costruite dai dati in dati/manuale.js. */
tcjSezione(`<section id="manuale">
  <div class="si">
    <div class="sh"><div class="sl">Regole</div><h2 class="st">Manuale dello Slayer</h2><div class="sline"></div><p class="sdesc">Le regole per giocare, spiegate in ordine: dalle basi al combattimento, fino a celle, elementi e progressione.</p></div>
    <div class="cta-row"><a href="media/Manuale_dello_Slayer.pdf" target="_blank" rel="noopener noreferrer" class="tcj-cta tcj-cta-purple">📖 Apri il Manuale completo</a><a href="https://www.owlbear.rodeo/room/jrCXLMk2u9Yz/The%20Faint%20Maker" target="_blank" rel="noopener noreferrer" class="tcj-cta tcj-cta-gold">⚔ Entra al tavolo · Owlbear Rodeo</a></div>
    <div class="mtabs">
      <button class="mtab active" data-p="basi" onclick="swTab('basi',this)">Le basi</button>
      <button class="mtab" data-p="combattimento" onclick="swTab('combattimento',this)">Combattimento</button>
      <button class="mtab" data-p="tipologie" onclick="swTab('tipologie',this)">Tipi di attacco</button>
      <button class="mtab" data-p="armi" onclick="swTab('armi',this)">Armi</button>
      <button class="mtab" data-p="celle" onclick="swTab('celle',this)">Celle di Aether</button>
      <button class="mtab" data-p="elementi" onclick="swTab('elementi',this)">Nuclei &amp; Elementi</button>
      <button class="mtab" data-p="stati" onclick="swTab('stati',this)">Stati alterati</button>
      <button class="mtab" data-p="equipaggiamento" onclick="swTab('equipaggiamento',this)">Tonici &amp; Piloni</button>
      <button class="mtab" data-p="supporto" onclick="swTab('supporto',this)">Armi di supporto</button>
      <button class="mtab" data-p="progressione" onclick="swTab('progressione',this)">Progressione</button>
    </div>
    <div class="bbox" id="bbox-manuale">

    <!-- ===================== LE BASI ===================== -->
    <div class="mpanel active" id="p-basi">
      <p class="mn-lead">Ogni giocatore guida uno <b>Slayer</b>: un cacciatore addestrato ad affrontare i <b>Behemoth</b>, creature nate dall'eccesso di Aether. Si caccia in gruppo, e la cooperazione non è facoltativa: un gruppo disorganizzato, anche se forte, è destinato a fallire.</p>
      <p class="mn-p">I giocatori dicono <b>cosa fanno</b> i loro Slayer e quali rischi vogliono correre; i dadi stabiliscono <b>se ci riescono</b> e a che prezzo; il <b>Dungeon Master</b> descrive il mondo, interpreta i Behemoth, decide quando serve un tiro e ha l'ultima parola su ciò che accade.</p>

      <h3 class="mn-h">Le sei caratteristiche</h3>
      <p class="mn-p">Le capacità del personaggio sono descritte da sei caratteristiche. Quando il DM chiede un tiro, al risultato del dado aggiungi il <b>bonus</b> della caratteristica coinvolta.</p>
      <div class="mn-tw"><table class="tcj-t"><thead><tr><th style="width:26%">Caratteristica</th><th>Cosa misura</th></tr></thead><tbody>
        <tr><td><b>Forza</b> (FOR)</td><td>Potenza fisica, atletismo, forza bruta. Quanto danno fai appoggiandoti a un muro.</td></tr>
        <tr><td><b>Destrezza</b> (DES)</td><td>Agilità, riflessi ed equilibrio: «vola come una farfalla, pungi come un'ape».</td></tr>
        <tr><td><b>Costituzione</b> (COST)</td><td>Salute, vigore e resistenza. Quanto reggi quando quel muro ti crolla addosso.</td></tr>
        <tr><td><b>Intelligenza</b> (INT)</td><td>Acume, memoria e capacità di ragionare.</td></tr>
        <tr><td><b>Saggezza</b> (SAG)</td><td>Sintonia con ciò che ti circonda: intuito, perspicacia, buon senso pratico.</td></tr>
        <tr><td><b>Carisma</b> (CAR)</td><td>Capacità di trattare con gli altri: sicurezza, eloquenza, fascino.</td></tr>
      </tbody></table></div>

      <h3 class="mn-h">Competenze</h3>
      <p class="mn-p">Le competenze sono le attività in cui il tuo Slayer è particolarmente bravo. Ogni personaggio ne ha <b>5</b> fin dall'inizio. Quando fai un tiro che rientra in una tua competenza, aggiungi <b>+2</b> oltre al normale bonus della caratteristica.</p>
      <div class="mn-skills">
        <div>Acrobatica <span class="mn-chip">DES</span></div>
        <div>Ammaestrare creature <span class="mn-chip">SAG</span></div>
        <div>Atletica <span class="mn-chip">FOR</span></div>
        <div>Behemothologia <span class="mn-chip">INT</span></div>
        <div>Furtività <span class="mn-chip">DES</span></div>
        <div>Inganno <span class="mn-chip">CAR</span></div>
        <div>Intimidire <span class="mn-chip">CAR</span></div>
        <div>Intrattenere <span class="mn-chip">CAR</span></div>
        <div>Intuizione <span class="mn-chip">SAG</span></div>
        <div>Investigare <span class="mn-chip">INT</span></div>
        <div>Natura <span class="mn-chip">SAG</span></div>
        <div>Percezione <span class="mn-chip">SAG</span></div>
        <div>Persuasione <span class="mn-chip">CAR</span></div>
        <div>Pozioni <span class="mn-chip">INT</span></div>
        <div>Rapidità di mano <span class="mn-chip">DES</span></div>
        <div>Sopravvivenza <span class="mn-chip">SAG</span></div>
        <div>Storia <span class="mn-chip">INT</span></div>
        <div>Tradizioni <span class="mn-chip">INT</span></div>
      </div>

      <h3 class="mn-h">Parole da conoscere</h3>
      <div class="mn-gl">
        <div><b>CD (Classe Difficoltà)</b>Il numero che il tuo tiro deve superare perché l'azione riesca.</div>
        <div><b>1D20, 2D6…</b>Quanti dadi tirare e di che tipo: «2D6» significa due dadi a sei facce.</div>
        <div><b>Tiro puro</b>Tiri il dado così com'è, senza aggiungere bonus.</div>
        <div><b>Bonus</b>Il numero che una caratteristica (FOR, DES, COST…) aggiunge ai tiri.</div>
        <div><b>Round e turno</b>Un round è il turno degli Slayer seguito dal turno del Behemoth.</div>
        <div><b>Quadretto</b>L'unità di misura per spostamenti, distanze e aree (per esempio 3×3).</div>
        <div><b>Parte</b>Ogni Behemoth ha parti (testa, zampe, coda…) che si possono colpire e rompere.</div>
        <div><b>Carica Aetherica</b>L'energia che accumuli combattendo, legata agli attacchi speciali delle armi.</div>
        <div><b>Token elementale</b>Segnalino lasciato sul Behemoth dagli attacchi elementali: a 10 dello stesso elemento scatta il malus.</div>
        <div><b>Vantaggio / Svantaggio</b>Tiri due D20 e tieni il più alto (vantaggio) o il più basso (svantaggio).</div>
        <div><b>Atterrato</b>Uno Slayer a 0 PV: non è morto, ma è a terra finché non si rialza.</div>
        <div><b>Nucleo</b>Il cristallo elementale montato su arma e armatura, scelto prima di partire.</div>
      </div>
    </div>

    <!-- ===================== COMBATTIMENTO ===================== -->
    <div class="mpanel" id="p-combattimento">
      <p class="mn-lead">Il combattimento procede a <b>round</b>. In ogni round prima agiscono tutti gli Slayer, poi agisce il Behemoth. Lo scontro ruota attorno a tre cose: controllare lo spazio, rompere le parti del mostro e coordinarsi.</p>

      <h3 class="mn-h">Com'è fatto un round</h3>
      <ol class="mn-steps">
        <li><b>Turno degli Slayer.</b> Agiscono tutti, uno dopo l'altro. L'ordine si decide all'inizio dello scontro e il gruppo può gestirlo come preferisce.</li>
        <li><b>Turno del Behemoth.</b> Il mostro agisce come un'unica creatura dominante: può colpire più Slayer, cambiare il terreno, infliggere stati alterati e reagire a ciò che il gruppo ha fatto. Le parti rotte e gli stordimenti cambiano via via il suo comportamento.</li>
        <li><b>Si ricomincia.</b> Anche durante il turno del Behemoth gli Slayer non restano fermi: possono schivare, reagire e attivare effetti difensivi o celle che scattano in risposta a un attacco.</li>
      </ol>

      <h3 class="mn-h">Cosa puoi fare nel tuo turno</h3>
      <ul class="mn-list">
        <li>Muoverti sul campo di battaglia.</li>
        <li>Attaccare con l'arma principale.</li>
        <li>Usare un'arma di supporto (pistola o arco).</li>
        <li>Attivare celle o effetti che richiedono condizioni particolari.</li>
        <li>Usare oggetti e interagire con l'ambiente.</li>
        <li>Aiutare un alleato.</li>
      </ul>
      <div class="mn-note"><span class="mn-k">Quando attacchi, dichiara sempre</span>1) con quale <b>arma</b>, 2) quale <b>parte</b> del Behemoth colpisci, 3) che <b>tipo di attacco</b> fai: mirato, lacerante o stordente.</div>

      <h3 class="mn-h">I tre tiri fondamentali</h3>
      <p class="mn-p">Quasi tutto il combattimento si risolve con questi tre tiri. Contro un Behemoth la difficoltà dipende dal mostro; contro altri Slayer o NPC è fissa.</p>
      <div class="mn-tw"><table class="tcj-t"><thead><tr><th style="width:18%">Azione</th><th>Contro un Behemoth</th><th>Contro Slayer o NPC</th></tr></thead><tbody>
        <tr><td><b>Colpire</b><span class="mn-sub">andare a segno con un attacco</span></td><td>Tiri <b>1D20 puro</b> (senza bonus).<br>Devi superare <b>5 + Bonus DES del Behemoth</b>.</td><td>Tiri <b>1D20 + Bonus DES</b>.<br>Devi superare <b>13</b>.</td></tr>
        <tr><td><b>Schivare</b><span class="mn-sub">evitare un colpo spostandoti</span></td><td>Tiri <b>1D20 + Bonus DES</b>.<br>Devi superare <b>15</b>.</td><td>Tiri <b>1D20 + Bonus DES</b>.<br>Devi superare <b>13</b>.</td></tr>
        <tr><td><b>Tankare</b><span class="mn-sub">reggere il colpo senza spostarti</span></td><td>Tiri <b>1D20 + Bonus FOR + Bonus COST</b>.<br>Devi superare <b>13 + Bonus FOR del Behemoth</b>.</td><td>Tiri <b>1D20 + Bonus FOR + Bonus COST</b>.<br>Devi superare <b>17</b>.</td></tr>
      </tbody></table></div>

      <h3 class="mn-h">Colpo critico</h3>
      <p class="mn-p">Un attacco è <b>critico</b> in due casi:</p>
      <ul class="mn-list">
        <li><b>Dado dei danni al massimo.</b> Dopo essere andato a segno tiri i danni: se il dado mostra il suo valore più alto (4 su un D4, 6 su un D6, 8 su un D8…) è critico. Se tiri più dadi insieme, basta che uno solo mostri il massimo.</li>
        <li><b>20 naturale per colpire.</b> Se il D20 per colpire mostra 20, l'attacco è critico qualunque sia il risultato dei danni.</li>
      </ul>

      <h3 class="mn-h">Vantaggio e svantaggio</h3>
      <p class="mn-p">Con il <b>vantaggio</b> tiri due D20 e tieni il risultato più alto; con lo <b>svantaggio</b> tieni il più basso. Non si sommano: se hai sia vantaggio sia svantaggio, si annullano e tiri normalmente.</p>

      <h3 class="mn-h">A 0 PV: atterrato</h3>
      <p class="mn-p">Quando arrivi a 0 Punti Vita non muori: vieni <b>atterrato</b>. Nel tuo turno, da atterrato:</p>
      <ul class="mn-list">
        <li>puoi <b>rialzarti</b> rinunciando all'azione principale: torni in piedi con <b>5 PV</b>;</li>
        <li>puoi comunque usare le <b>azioni bonus</b>.</li>
      </ul>
      <p class="mn-p">Per tornare <b>pienamente in assetto</b> devi superare un tiro di <b>1D20 puro</b> contro una CD crescente, che parte da <b>5</b>. Se tutta la squadra resta a terra per un intero round senza che nessuno superi la CD, il gruppo <b>perde i sensi</b>.</p>

      <h3 class="mn-h">Stanchezza</h3>
      <p class="mn-p">La stanchezza non arriva da sola a fine round. Si prende un livello <b>ogni volta che si cade nel primo round</b>, oppure <b>al termine di due round di fila senza recuperare</b>.</p>
      <div class="mn-tw"><table class="tcj-t"><thead><tr><th style="width:18%">Livello</th><th>Effetto</th></tr></thead><tbody>
        <tr><td><b>1</b></td><td>Velocità dimezzata</td></tr>
        <tr><td><b>2</b></td><td>Svantaggio alle prove di caratteristica</td></tr>
        <tr><td><b>3</b></td><td>Svantaggio ai tiri per colpire e ai tiri salvezza</td></tr>
        <tr><td><b>4</b></td><td>Punti Vita massimi dimezzati</td></tr>
        <tr><td><b>5</b></td><td>Velocità ridotta a 0</td></tr>
        <tr><td><b>6</b></td><td>Svenimento</td></tr>
      </tbody></table></div>
      <div class="mn-note"><span class="mn-k">Come si recupera</span>Un <b>riposo breve</b> toglie 2 livelli. Un <b>riposo lungo</b> li toglie tutti.</div>
    </div>

    <!-- ===================== TIPI DI ATTACCO ===================== -->
    <div class="mpanel" id="p-tipologie">
      <p class="mn-lead">Ogni attacco va dichiarato come <b>mirato</b>, <b>lacerante</b> o <b>stordente</b>. Il tipo decide cosa provochi al Behemoth e quale caratteristica usi per colpire e per i danni.</p>
      <div class="mn-grid wide">
        <div class="mn-c"><div class="ct">🎯 Mirato</div>
          <p class="mn-sub">Un colpo preciso su una parte specifica.</p>
          <div class="mn-row"><span class="mn-k">Serve a</span><span>Rompere le parti del Behemoth. Una parte già rotta non si può rompere di nuovo.</span></div>
          <div class="mn-row"><span class="mn-k">Per colpire</span><span>DES</span></div>
          <div class="mn-row"><span class="mn-k">Danni</span><span>DES</span></div>
        </div>
        <div class="mn-c"><div class="ct">🩸 Lacerante</div>
          <p class="mn-sub">Indebolisce una parte senza romperla subito.</p>
          <div class="mn-row"><span class="mn-k">Serve a</span><span>Preparare il colpo successivo: il tuo prossimo attacco sullo stesso Behemoth fa <b>+2 danni</b>. La lacerazione dura <b>2 turni</b>.</span></div>
          <div class="mn-row"><span class="mn-k">Per colpire</span><span>DES</span></div>
          <div class="mn-row"><span class="mn-k">Danni</span><span>FOR</span></div>
        </div>
        <div class="mn-c"><div class="ct">💫 Stordente</div>
          <p class="mn-sub">Forza bruta per sopraffare il mostro. Rende di più sulla testa.</p>
          <div class="mn-row"><span class="mn-k">Serve a</span><span>Stordire: il Behemoth resta <b>inerme per 1 turno</b>. Ogni stordimento successivo è più difficile da ottenere.</span></div>
          <div class="mn-row"><span class="mn-k">Per colpire</span><span>FOR</span></div>
          <div class="mn-row"><span class="mn-k">Danni</span><span>FOR</span></div>
        </div>
      </div>
    </div>

    <!-- ===================== ARMI ===================== -->
    <div class="mpanel" id="p-armi">
      <p class="mn-lead">Le armi aetheriche non sono semplici lame: sono <b>catalizzatori di Aether</b>, costruite per creature molto più grandi e forti di un essere umano. Ogni arma ha tre elementi: il <b>dado di danno</b>, il <b>tipo di danno speciale</b> e il modo in cui accumula <b>Cariche Aetheriche</b> per i suoi attacchi speciali.</p>
      <h3 class="mn-h">Le tre famiglie</h3>
      <div class="mn-tw"><table class="tcj-t"><thead><tr><th>Famiglia</th><th>Modifica</th><th>Dado</th><th>Attacchi per turno</th></tr></thead><tbody>
        <tr><td><b>Pesanti</b><span class="mn-sub">Martello, Ascia</span></td><td>−1 DES, +2 COST</td><td>1D8</td><td>Uno solo. Eccellono nel danno stordente e nel controllo.</td></tr>
        <tr><td><b>Bilanciate</b><span class="mn-sub">Spada, Lancia</span></td><td>+1 DES, +1 COST</td><td>1D6</td><td>Due, ma il secondo solo se il primo va a segno.</td></tr>
        <tr><td><b>Leggere</b><span class="mn-sub">Pugni, Lame a Catena</span></td><td>+2 DES, −1 COST</td><td>1D4</td><td>Due. Se il primo manca il bersaglio, puoi ritirarlo.</td></tr>
      </tbody></table></div>
      <div class="mn-note"><span class="mn-k">Come leggere le schede qui sotto</span>Il <b>dado di danno</b> cresce con il livello (riga dei livelli). La riga <b>Cariche</b> riporta i valori degli attacchi speciali di quell'arma. «<b>In prossimità</b>» significa vicino al Behemoth, «<b>a distanza</b>» lontano da lui.</div>
      <div id="wgrid" class="mn-grid wide"></div>
    </div>

    <!-- ===================== CELLE ===================== -->
    <div class="mpanel" id="p-celle">
      <p class="mn-lead">Le celle sono <b>cristalli di Aether raffinato</b> che si attivano vicino ai Behemoth o in presenza di Cariche Aetheriche. Ogni Slayer ne può montare <b>fino a 6</b> (quante e quali dipende dal livello: vedi <b>Progressione</b>).</p>
      <p class="mn-p">Ogni cella ha due gradi di potenziamento: <b>+3</b> (primo) e <b>+6</b> (massimo). Ci sono tre famiglie:</p>
      <div class="mn-grid small">
        <div class="mn-c"><div class="ct">⚔ Forza</div><p>Attacco: più danni, soprattutto se sai leggere lo stato del Behemoth.</p></div>
        <div class="mn-c"><div class="ct">🛡 Vigore</div><p>Sopravvivenza: attenuano o annullano gli stati alterati.</p></div>
        <div class="mn-c"><div class="ct">🧭 Tecnica</div><p>Stile di gioco: movimento, risorse, supporto e controllo del campo.</p></div>
      </div>
      <div id="cgrid" class="mn-grid"></div>
    </div>

    <!-- ===================== NUCLEI & ELEMENTI ===================== -->
    <div class="mpanel" id="p-elementi">
      <p class="mn-lead">Il <b>nucleo elementale</b> si sceglie <b>prima di ogni esplorazione</b> e non si può cambiare durante l'avventura, a meno di usare un <b>nucleo di ricambio</b> (vedi sotto). Fa due cose insieme: dà un elemento ai tuoi <b>attacchi</b> e cambia la <b>resistenza</b> della tua armatura.</p>
      <div class="mn-note"><span class="mn-k">La regola d'oro</span>In <b>difesa</b> conviene lo <b>stesso elemento</b> del Behemoth (subisci meno danni). In <b>attacco</b> conviene l'<b>elemento opposto</b> (fai più danni).</div>

      <h3 class="mn-h">Token elementali</h3>
      <ul class="mn-list">
        <li>Ogni attacco elementale lascia sul Behemoth dei <b>token</b> del suo elemento.</li>
        <li>Quando un elemento arriva a <b>10 token</b>, il Behemoth subisce il <b>malus aetherico</b> di quell'elemento (vedi <b>Stati alterati</b>).</li>
        <li>Il Behemoth è <b>immune al proprio elemento</b>: i token di quell'elemento non si applicano.</li>
        <li>I contatori dei diversi elementi sono <b>separati</b>: un Behemoth può subire più malus aetherici insieme.</li>
      </ul>

      <h3 class="mn-h">Nuclei di ricambio</h3>
      <p>Oltre ai nuclei montati, ogni Slayer può portare con sé fino a <b>3 nuclei di ricambio</b>, d'attacco o di difesa, presi dalla stiva della nave o comprati al negozio. Sono usa e getta: quando ne monti uno, il nucleo che avevi prima <b>si consuma e sparisce</b>.</p>
      <h3 class="mn-h">I sei nuclei</h3>
      <div class="mn-grid">
        <div class="mn-c el" style="--c:var(--fire)"><div class="ct">🔥 Fiammeggiante</div>
          <div class="mn-row"><span class="mn-k">Sull'arma</span><span>+2 danni contro i Behemoth glaciali. Può infliggere <b>Bruciato</b>, ma non ai Behemoth di fuoco.</span></div>
          <div class="mn-row"><span class="mn-k">Sull'armatura</span><span>¼ di danni in meno dai Behemoth infuocati, ¼ in più da quelli glaciali.</span></div></div>
        <div class="mn-c el" style="--c:var(--ice)"><div class="ct">❄️ Glaciale</div>
          <div class="mn-row"><span class="mn-k">Sull'arma</span><span>+2 danni contro i Behemoth infuocati. Può infliggere <b>Ibernato</b>, ma non ai Behemoth di ghiaccio.</span></div>
          <div class="mn-row"><span class="mn-k">Sull'armatura</span><span>¼ di danni in meno dai Behemoth glaciali, ¼ in più da quelli infuocati.</span></div></div>
        <div class="mn-c el" style="--c:var(--earth)"><div class="ct">🌍 Terrestre</div>
          <div class="mn-row"><span class="mn-k">Sull'arma</span><span>+2 danni contro i Behemoth elettrici. Può infliggere <b>Interrato</b>, ma non ai Behemoth di terra.</span></div>
          <div class="mn-row"><span class="mn-k">Sull'armatura</span><span>¼ di danni in meno dai Behemoth terrestri, ¼ in più da quelli elettrici.</span></div></div>
        <div class="mn-c el" style="--c:var(--lightning)"><div class="ct">⚡ Elettrico</div>
          <div class="mn-row"><span class="mn-k">Sull'arma</span><span>+2 danni contro i Behemoth terrestri. Può infliggere <b>Fulminato</b>, ma non ai Behemoth elettrici.</span></div>
          <div class="mn-row"><span class="mn-k">Sull'armatura</span><span>¼ di danni in meno dai Behemoth elettrici, ¼ in più da quelli terrestri.</span></div></div>
        <div class="mn-c el" style="--c:var(--dark)"><div class="ct">🌑 Oscuro</div>
          <div class="mn-row"><span class="mn-k">Sull'arma</span><span>+2 danni contro i Behemoth radianti. Può infliggere <b>Corrotto</b>, ma non ai Behemoth oscuri.</span></div>
          <div class="mn-row"><span class="mn-k">Sull'armatura</span><span>¼ di danni in meno dai Behemoth oscuri, ¼ in più da quelli radianti.</span></div></div>
        <div class="mn-c el" style="--c:var(--radiant)"><div class="ct">✨ Radiante</div>
          <div class="mn-row"><span class="mn-k">Sull'arma</span><span>+2 danni contro i Behemoth oscuri. Può infliggere <b>Abbagliato</b>, ma non ai Behemoth radianti.</span></div>
          <div class="mn-row"><span class="mn-k">Sull'armatura</span><span>¼ di danni in meno dai Behemoth radianti, ¼ in più da quelli oscuri.</span></div></div>
      </div>
    </div>

    <!-- ===================== STATI ALTERATI ===================== -->
    <div class="mpanel" id="p-stati">
      <p class="mn-lead">Gli stati alterati colpiscono sia gli Slayer sia i Behemoth. Quelli <b>aetherici</b> nascono dagli elementi e hanno quasi sempre una forma <b>lieve</b> e una <b>grave</b>; quelli <b>di stato</b> nascono da ferite, colpi e sforzi. Le <b>celle di Vigore</b> proteggono da entrambi.</p>

      <h3 class="mn-h">Malus aetherici <small>forma lieve → forma grave</small></h3>
      <div class="mn-grid wide">
        <div class="mn-c el" style="--c:var(--fire)"><div class="ct">🔥 Fuoco</div><div class="mn-pair">
          <div><b>Scottato</b><span>−2 PV a turno</span><i>3 turni</i></div><div class="arr">→</div>
          <div><b>Bruciato</b><span>−5 PV a turno</span><i>3 turni</i></div></div></div>
        <div class="mn-c el" style="--c:var(--ice)"><div class="ct">❄️ Ghiaccio</div><div class="mn-pair">
          <div><b>Ghiacciato</b><span>−3 DES</span><i>3 turni</i></div><div class="arr">→</div>
          <div><b>Ibernato</b><span>−5 DES</span><i>3 turni</i></div></div></div>
        <div class="mn-c el" style="--c:var(--lightning)"><div class="ct">⚡ Elettricità</div><div class="mn-pair">
          <div><b>Elettrificato</b><span>−1 PV a turno, niente azioni bonus</span><i>3 turni</i></div><div class="arr">→</div>
          <div><b>Fulminato</b><span>−3 PV a turno, niente azioni bonus</span><i>3 turni</i></div></div></div>
        <div class="mn-c el" style="--c:var(--earth)"><div class="ct">🌍 Terra</div><div class="mn-pair">
          <div><b>Interrato</b><span>Movimento dimezzato</span><i>3 turni</i></div><div class="arr">→</div>
          <div><b>Drenato</b><span>Non puoi muoverti</span><i>3 turni</i></div></div></div>
        <div class="mn-c el" style="--c:var(--dark)"><div class="ct">🌑 Oscurità</div><div class="mn-pair">
          <div><b>Corrotto</b><span>−5 PV a turno, svantaggio ai tiri di COST</span><i>5 turni</i></div></div></div>
        <div class="mn-c el" style="--c:var(--radiant)"><div class="ct">✨ Luce</div><div class="mn-pair">
          <div><b>Abbagliato</b><span>−5 PV a turno, svantaggio ai tiri di DES</span><i>5 turni</i></div></div></div>
      </div>

      <h3 class="mn-h">Malus di stato</h3>
      <div class="mn-grid">
        <div class="mn-c"><div class="ct">Sanguinante</div><p>Per <b>3 turni</b> perdi <b>2 PV</b> ogni volta che ti muovi o fai un'azione.</p><p class="mn-sub">Si toglie rinunciando al proprio turno.</p></div>
        <div class="mn-c"><div class="ct">Emorragia</div><p>Per <b>5 turni</b> perdi <b>5 PV</b> ogni volta che ti muovi o fai un'azione.</p><p class="mn-sub">Si toglie rinunciando al proprio turno.</p></div>
        <div class="mn-c"><div class="ct">Stordito</div><p>Perdi il <b>primo turno</b>; nel <b>secondo</b> non puoi muoverti.</p></div>
        <div class="mn-c"><div class="ct">Frenesia</div><p>Per <b>1 turno</b> ottieni <b>+8 FOR</b>. Quando finisce, nel turno successivo non puoi agire.</p></div>
      </div>
    </div>

    <!-- ===================== TONICI & PILONI ===================== -->
    <div class="mpanel" id="p-equipaggiamento">
      <p class="mn-lead">All'inizio di ogni spedizione ricevi gratis <b>5 tonici di guarigione</b> (curano 1D6 PV ciascuno). In più hai <b>3 slot</b> di equipaggiamento: in ogni slot puoi mettere <b>5 tonici</b> oppure <b>2 piloni</b>, sempre di un solo tipo. Ogni oggetto arriva dalla <b>stiva della nave</b>, e allora in stiva ne resta uno in meno, oppure dal <b>negozio</b>. Quello che non usi lo puoi riporre in stiva.</p>
      <h3 class="mn-h">Tonici base <small>durano 1 turno</small></h3>
      <div class="mn-tw"><table class="tcj-t"><thead><tr><th style="width:30%">Tonico</th><th>Effetto</th></tr></thead><tbody>
        <tr><td><b>Salute</b></td><td>Recuperi 1D6 PV</td></tr><tr><td><b>Resistenza</b></td><td>+2 COST</td></tr><tr><td><b>Stamina</b></td><td>+2 DES</td></tr><tr><td><b>Assalto</b></td><td>+2 FOR</td></tr>
      </tbody></table></div>
      <h3 class="mn-h">Tonici avanzati <small>durano 3 turni</small></h3>
      <div class="mn-tw"><table class="tcj-t"><thead><tr><th style="width:30%">Tonico</th><th>Effetto</th></tr></thead><tbody>
        <tr><td><b>Aether Carica</b></td><td>+1 token elementale e +2 DES</td></tr>
        <tr><td><b>Frenesia</b></td><td>Una Frenesia ridotta: +4 FOR, ma quando finisce ha lo stesso effetto negativo (nel turno successivo non puoi agire)</td></tr>
        <tr><td><b>Antidoto</b></td><td>+2 COST; se hai uno stato aetherico, lo fa finire o lo riduce</td></tr>
        <tr><td><b>Rubavita</b></td><td>Perdi 1 PV a turno, ma recuperi 5 PV ogni volta che attacchi il mostro</td></tr>
      </tbody></table></div>
      <h3 class="mn-h">Piloni <small>durano 3 turni · area 5×5</small></h3>
      <p class="mn-p">Si piazzano sul campo e funzionano per chiunque si trovi nella loro area.</p>
      <div class="mn-tw"><table class="tcj-t"><thead><tr><th style="width:30%">Pilone</th><th>Effetto</th></tr></thead><tbody>
        <tr><td><b>Ripulente</b></td><td>Nell'area i malus aetherici smettono di peggiorare</td></tr>
        <tr><td><b>Inamovibile</b></td><td>Immunità a sbalzi e stordimento; se vieni atterrato puoi attaccare ancora una volta</td></tr>
        <tr><td><b>Ispirazione</b></td><td>Chi è atterrato nell'area, o sta per cadere, torna in assetto prima del colpo fatale</td></tr>
        <tr><td><b>Accogliente</b></td><td>Cura 4 PV a turno a chiunque sia nell'area</td></tr>
      </tbody></table></div>
    </div>

    <!-- ===================== ARMI DI SUPPORTO ===================== -->
    <div class="mpanel" id="p-supporto">
      <p class="mn-lead">Pistole e archi aetherici non servono ad abbattere i Behemoth: sono pensati per gli scontri contro <b>avversari umani e creature minori</b> e per controllare il campo. Li ha progettati il Maestro delle Pistole <b>Janek Zai</b>.</p>
      <div class="mn-tw"><table class="tcj-t"><thead><tr><th style="width:22%"></th><th>🔫 Pistola Aetherica</th><th>🏹 Arco Aetherico</th></tr></thead><tbody>
        <tr><td><b>Ideale per</b></td><td>Gruppi di avversari e effetti di controllo</td><td>Controllo del territorio e supporto da lontano</td></tr>
        <tr><td><b>Azione</b></td><td>Azione <b>bonus</b></td><td>Azione <b>principale</b> (più lento, ma più potente)</td></tr>
        <tr><td><b>Gittata</b></td><td>Fino a 10 quadretti</td><td>Da 5 a 30 quadretti. Sotto i 5 tiri con <b>svantaggio</b></td></tr>
        <tr><td><b>Per colpire</b><span class="mn-sub">contro NPC</span></td><td colspan="2">Tiri <b>1D20 + Bonus DES</b> e devi superare <b>13</b>. Oltre la gittata la CD sale di <b>+4</b>, e di altri +4 ogni 10 quadretti in più.</td></tr>
      </tbody></table></div>
      <h3 class="mn-h">Danni per livello</h3>
      <div class="mn-tw"><table class="tcj-t"><thead><tr><th>Livello</th><th>Pistola</th><th>Arco</th></tr></thead><tbody>
        <tr><td><b>1</b></td><td>1 proiettile · 1D4</td><td>1 freccia · 1D6</td></tr>
        <tr><td><b>5</b></td><td>2 proiettili · 2D4</td><td>1 freccia · 1D8</td></tr>
        <tr><td><b>10</b></td><td>3 proiettili · 3D4</td><td>1 freccia · 1D10</td></tr>
        <tr><td><b>15</b></td><td>4 proiettili · 4D4</td><td>1 freccia · 1D12</td></tr>
        <tr><td><b>20</b></td><td>5 proiettili · 5D4</td><td>1 freccia · 1D20</td></tr>
      </tbody></table></div>
      <h3 class="mn-h">Proiettili e frecce aetheriche <small>ogni effetto dura al massimo 3 turni</small></h3>
      <div class="mn-grid wide">
        <div class="mn-c el" style="--c:var(--earth)"><div class="ct">🌍 Terrestre</div>
          <div class="mn-row"><span class="mn-k">Su di te o un alleato</span><span>Un vortice di pietre protegge il bersaglio: +3 COST.</span></div>
          <div class="mn-row"><span class="mn-k">Su un nemico</span><span>Lo rallenta: svantaggio ai tiri di DES e movimenti ridotti.</span></div></div>
        <div class="mn-c el" style="--c:var(--fire)"><div class="ct">🔥 Fiammeggiante</div>
          <p>Una palla di fuoco: <b>1D4 danni extra</b> in un'area 3×3 e il bersaglio prende fuoco. Chi gli sta vicino fa un tiro salvezza di COST (CD 13 + bonus): se lo fallisce, prende fuoco anche lui.</p></div>
        <div class="mn-c el" style="--c:var(--ice)"><div class="ct">❄️ Congelante</div>
          <p>Crea una zona di ghiaccio 5×5: hai <b>vantaggio</b> ai tiri contro gli avversari dentro l'area, che si muovono a fatica.</p></div>
        <div class="mn-c el" style="--c:var(--radiant)"><div class="ct">✨ Radiante</div>
          <p>Crea una zona 5×5: gli alleati dentro l'area hanno <b>+4 DES</b> e recuperano <b>2 PV</b> per ogni turno passato lì.</p></div>
        <div class="mn-c el" style="--c:var(--dark)"><div class="ct">🌑 Oscuro</div>
          <p>Apre un portale che teletrasporta il bersaglio nel punto colpito dal proiettile.</p>
          <div class="mn-row"><span class="mn-k">Su un nemico</span><span>Tiri 1D20 + Bonus DES contro CD 8: se riesci, il nemico viene teletrasportato.</span></div>
          <div class="mn-row"><span class="mn-k">Su di te o un alleato</span><span>Teletrasporto automatico (per fuggire, schivare o liberarsi da una presa), ma il bersaglio subisce comunque il danno del colpo.</span></div></div>
        <div class="mn-c el" style="--c:var(--lightning)"><div class="ct">⚡ Fulmineo</div>
          <p>Un fulmine corre lungo la linea di tiro: il <b>primo avversario</b> colpito resta paralizzato e <b>perde il turno</b>.</p></div>
      </div>
    </div>

    <!-- ===================== PROGRESSIONE ===================== -->
    <div class="mpanel" id="p-progressione">
      <p class="mn-lead">Crescere di livello non significa solo diventare più forti: significa imparare a reggere più Aether, governare più celle e sopravvivere a cacce che spezzerebbero chiunque altro.</p>
      <h3 class="mn-h">A ogni livello</h3>
      <ul class="mn-list">
        <li><b>Punti Vita:</b> +5 PV + il tuo Bonus COST.</li>
        <li><b>Ogni 2 livelli:</b> assegni 2 punti alle caratteristiche, alternando due gruppi: una volta <b>FOR, DES, COST</b>, la volta dopo <b>SAG, INT, CAR</b>.</li>
        <li><b>Dal livello 20</b> le caratteristiche non salgono più.</li>
      </ul>
      <h3 class="mn-h">Gli stadi dello Slayer</h3>
      <div class="mn-tw"><table class="tcj-t"><thead><tr><th style="width:20%">Stadio</th><th style="width:12%">Livelli</th><th>Celle</th></tr></thead><tbody>
        <tr><td style="color:var(--text2)"><b style="color:inherit">Novizio</b></td><td>1–5</td><td>Al massimo <b>3 celle</b>, solo di <b>Vigore e Tecnica</b>. Si è ancora guidati (e limitati) dalla gilda.</td></tr>
        <tr><td style="color:var(--earth)"><b style="color:inherit">Cacciatore</b></td><td>6–10</td><td>Si sbloccano le celle di <b>Forza</b>. Il limite resta di 3 celle.</td></tr>
        <tr><td style="color:var(--ice)"><b style="color:inherit">Discepolo</b></td><td>11–15</td><td>Fino a <b>6 celle</b>. Accesso alle celle di Vigore e Tecnica superiori; puoi portare quelle inferiori al <b>+6</b> (le celle di Forza no). La build deve restare bilanciata.</td></tr>
        <tr><td style="color:var(--gold2)"><b style="color:inherit">Maestro</b></td><td>16–20</td><td>Accesso alle celle di <b>Forza superiori</b>, potenziabili al +6. A discrezione del DM, anche tutte le celle di Vigore e Tecnica al +6.</td></tr>
        <tr><td style="color:var(--radiant)"><b style="color:inherit">Fenice</b></td><td>21–30</td><td><b>Cadono tutti i limiti.</b> Il corpo dello Slayer regge qualsiasi build, con equipaggiamenti che solo in pochi sanno usare.</td></tr>
      </tbody></table></div>
    </div>

    </div>
  </div>
</section>`);
