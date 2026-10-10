/* Sezione: Corone Aetheriche — testo e struttura HTML.
   Viene inserita nella pagina esattamente nel punto in cui index.html la richiama. */
tcjSezione(`<section id="corone">
  <div class="si">
    <div class="sh"><div class="sl">Riconoscimenti</div><h2 class="st">Corone Aetheriche</h2><div class="sline"></div><p class="sdesc">Oggetti antichi, tramandati solo ai più forti Slayer della Gilda. Non si comprano e non si assegnano per meriti ufficiali: si conquistano nelle Sfide Indomabili.</p></div>
    <link rel="stylesheet" href="css/08-corone.css">

    <div class="bbox" id="bbox-corone">
    <div class="card" style="margin-bottom:2rem">
      <div class="ct">Cosa sono</div>
      <p>Nel mondo degli Slayer esistono riconoscimenti che vanno ben oltre i titoli ufficiali della Gilda, e le <strong>Corone Aetheriche</strong> sono tra questi. Il loro valore non risiede nella rarità del materiale, ma nel significato che portano con sé: chi possiede una Corona non ha semplicemente vinto una sfida — ha dimostrato di essere qualcuno a cui il mondo Slayer riconosce una <strong>presenza stabile, continuativa, degna di sostentamento</strong>.</p>
      <div class="qi">Come si ottenga una Corona, in verità, non lo sa più nessuno con certezza: le regole per conquistarne una nuova sembrano essersi perse nel tempo. Quel che resta sono le Sfide Indomabili — e chi le supera ottiene qualcosa che nessuna missione ordinaria può dare.</div>
    </div>

    <div class="card" style="margin-bottom:2rem">
      <div class="ct">L’introito</div>
      <p>Ogni Corona garantisce al suo portatore un <strong>introito passivo in monete d’oro</strong>, riscuotibile ad ogni triade quando il gruppo fa ritorno a Ramsgate o in un centro affiliato alla Gilda. Non si tratta di una cifra enorme, ma è sufficiente a garantire l’indipendenza minima a uno Slayer che voglia sopravvivere senza dipendere esclusivamente dalle cacce.</p>
      <p style="margin-top:.9rem">Si tira <strong>1D20</strong> e si moltiplica per un valore che dipende da quante Corone si possiedono: il moltiplicatore parte da <strong>&times;2</strong> con la prima Corona e cresce di <strong>+2</strong> per ognuna in più. In altre parole è sempre <strong>il doppio delle Corone possedute</strong>.</p>
      <div class="ctb" style="margin-top:1.2rem">
        <table class="tcj-t" style="margin:0"><thead><tr><th>Corone</th><th>Moltiplicatore</th></tr></thead><tbody>
          <tr><td>1</td><td>&times;2</td></tr><tr><td>2</td><td>&times;4</td></tr><tr><td>3</td><td>&times;6</td></tr>
          <tr><td>4</td><td>&times;8</td></tr><tr><td>5</td><td>&times;10</td></tr><tr><td>6</td><td>&times;12</td></tr>
        </tbody></table>
        <table class="tcj-t" style="margin:0"><thead><tr><th>Corone</th><th>Moltiplicatore</th></tr></thead><tbody>
          <tr><td>7</td><td>&times;14</td></tr><tr><td>8</td><td>&times;16</td></tr><tr><td>9</td><td>&times;18</td></tr>
          <tr><td>10</td><td>&times;20</td></tr><tr><td>11</td><td>&times;22</td></tr><tr><td>12</td><td>&times;24</td></tr>
        </tbody></table>
      </div>
      <div class="qi">Esempio: con 2 Corone, un tiro di 14 rende 14 &times; 4 = <strong>56 monete d’oro</strong>.</div>
      <p style="font-size:.85rem;color:var(--text2);font-style:italic">Nella <a href="#scheda" style="color:var(--gold2)">scheda dello Slayer</a> il moltiplicatore viene calcolato da solo in base alle Corone segnate.</p>
    </div>

    <div class="card" style="margin-bottom:2rem">
      <div class="ct">Le Sfide Indomabili</div>
      <p>Sono <strong>cacce di difficoltà eccezionale</strong>: non solo per la potenza del Behemoth coinvolto, ma per i vincoli e le condizioni che le governano. Si affrontano durante i periodi di <strong>timeout</strong>, quando qualcuno del gruppo decide liberamente di cimentarsi.</p>
      <p style="margin-top:.9rem">Non vengono imposte dalla Gilda né ricompensate con riconoscimenti ufficiali: <strong>affrontarle non è obbligatorio</strong>. Sono una scelta, e come tale vanno trattate. Possono essere risolte in modo puramente meccanico oppure narrate in roleplay — la decisione spetta interamente ai Player che vogliono partecipare.</p>
    </div>

    <div class="card" style="margin-bottom:2rem">
      <div class="ct">Come si risolve una Sfida</div>
      <p>Il sistema si basa interamente sui <strong>D6</strong>. Non conta quanti danni si infliggono, né quanto velocemente si abbatte il Behemoth: conta quante <strong>facce uguali</strong> si ottengono in un singolo tiro.</p>
      <div style="margin-top:1.1rem">
        <div class="co-step"><div class="co-num">1</div><div><div class="co-stt">Ci si prepara</div>Pozioni, nucleo difensivo e nucleo offensivo scelti in funzione del Behemoth. Da quanti di questi tre elementi si portano dipende il numero di dadi a disposizione.</div></div>
        <div class="co-step"><div class="co-num">2</div><div><div class="co-stt">Si tira tre volte a testa</div>Ogni giocatore che partecipa esegue <strong>tre tiri</strong> in tutto nel corso della sfida, con la possibilità di <strong>ritirare una sola volta per tiro</strong>.</div></div>
        <div class="co-step"><div class="co-num">3</div><div><div class="co-stt">Si contano le facce uguali</div>Ogni tiro vale un risultato secondo la tabella dei Livelli di Successo, da &minus;1 fino a +7.</div></div>
        <div class="co-step"><div class="co-num">4</div><div><div class="co-stt">Si sommano i successi del gruppo</div>I risultati di tutti i partecipanti confluiscono in un unico totale. La soglia da raggiungere è di <strong>15 successi</strong>.</div></div>
      </div>
    </div>

    <div class="ctb" style="margin-bottom:2rem">
      <div>
        <h3 style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold2);margin-bottom:.9rem">Livelli di Successo</h3>
        <table class="tcj-t"><thead><tr><th>Risultato</th><th>Condizione</th><th>Effetto</th></tr></thead><tbody>
          <tr><td>Nullo</td><td>0 facce uguali</td><td style="color:var(--fire)">&minus;1</td></tr>
          <tr><td>Base</td><td>2 facce uguali</td><td>&plusmn;0</td></tr>
          <tr><td>Critico</td><td>3 facce uguali</td><td style="color:var(--earth)">+1</td></tr>
          <tr><td>Extreme</td><td>4 facce uguali</td><td style="color:var(--gold2)">+3</td></tr>
          <tr><td>Impossible</td><td>5 facce uguali</td><td style="color:var(--radiant)">+5</td></tr>
          <tr><td><strong>Jackpot</strong></td><td>6 facce uguali</td><td style="color:var(--gold2);font-weight:bold">+7</td></tr>
        </tbody></table>
        <div class="qi">Le facce uguali vanno contate <strong>all’interno di un singolo tiro</strong>: sei dadi che mostrano tutti lo stesso numero valgono +7, sei dadi tutti diversi costano &minus;1 al totale del gruppo.</div>
      </div>
      <div>
        <h3 style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold2);margin-bottom:.9rem">La Preparazione</h3>
        <table class="tcj-t"><thead><tr><th>Livello</th><th>Requisito</th><th>Dadi</th></tr></thead><tbody>
          <tr><td>Nessuna</td><td>&mdash;</td><td>3</td></tr>
          <tr><td>Livello 1</td><td>1 elemento su 3</td><td>4</td></tr>
          <tr><td>Livello 2</td><td>2 elementi su 3</td><td>5</td></tr>
          <tr><td><strong>Massima</strong></td><td>Tutti e 3</td><td><strong>6</strong></td></tr>
        </tbody></table>
        <div class="co-warn">Una caccia affrontata senza alcuna preparazione è una caccia in svantaggio: non impossibile, ma decisamente più rischiosa.</div>
      </div>
    </div>

    <div class="co-el" style="margin-bottom:2rem">
      <div class="co-elc"><div class="co-elt">Pozioni</div><div style="font-size:.85rem;color:var(--text2)">Portare con sé pozioni adeguate alla tipologia di caccia.</div></div>
      <div class="co-elc"><div class="co-elt">Nucleo Difensivo</div><div style="font-size:.85rem;color:var(--text2)">Equipaggiare un nucleo elementale difensivo coerente con il Behemoth bersaglio.</div></div>
      <div class="co-elc"><div class="co-elt">Nucleo Offensivo</div><div style="font-size:.85rem;color:var(--text2)">Equipaggiare un nucleo elementale offensivo efficace contro il Behemoth bersaglio.</div></div>
    </div>

    <div class="ctb">
      <div class="card">
        <div class="ct">Chi ottiene la Corona</div>
        <p>Raggiunta la soglia, <strong>chi ha contribuito al maggior numero di successi individuali</strong> si aggiudica la Corona. Se quel personaggio ne possiede già una, la Corona passa al <strong>secondo classificato</strong>.</p>
        <div class="qi">I 15 successi sono la soglia <em>iniziale</em>: man mano che le Sfide vengono superate, il valore richiesto può aumentare progressivamente.</div>
      </div>
      <div class="card">
        <div class="ct">Se la Sfida fallisce</div>
        <p>Non è tutto perduto. Una parte dei successi ottenuti <strong>abbassa la soglia richiesta per la volta seguente</strong>, come dei checkpoint che permettono di arrivare più preparati al tentativo successivo.</p>
        <div class="qi">Lo scaglione da superare è di <strong>5 successi per volta</strong>.</div>
      </div>
    </div>
</div>
  </div>
</section>`);
