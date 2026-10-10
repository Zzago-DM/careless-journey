/* Sezione: Mappa ingrandita: Continente Terrestre — testo e struttura HTML.
   Viene inserita nella pagina esattamente nel punto in cui index.html la richiama. */
tcjSezione(`<div class="cj-overlay" id="cj-terrestre" aria-hidden="true"><div class="wrap">
  <div class="bar">
    <a class="back" role="button" tabindex="0"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg> Mappa</a>
    <span class="crumb">Le Isole Frantumate&nbsp; / &nbsp;<b>Continente Terrestre</b></span>
  </div>
  <div class="stage">
    <svg viewBox="0 0 652 824" role="img" aria-label="Mappa dettagliata del Continente Terrestre">
<defs>
  <path id="terrestre-pEast" d="M179.9,195.5C172.4,199.9 164.2,215.9 157.6,220.0C150.9,224.1 143.1,218.2 139.7,220.0C136.4,221.9 136.7,228.2 137.5,231.2C138.2,234.2 144.9,234.2 144.2,237.9C143.4,241.6 134.9,247.5 133.0,253.5C131.2,259.4 131.9,269.1 133.0,273.6C134.1,278.0 139.3,278.4 139.7,280.3C140.1,282.1 130.8,278.8 135.2,284.7C139.7,290.7 159.0,309.6 166.5,316.0C173.9,322.3 176.5,319.7 179.9,322.7C183.2,325.6 184.3,332.7 186.6,333.8C188.8,334.9 186.2,324.9 193.3,329.3C200.3,333.8 217.4,346.8 228.9,360.6C240.5,374.3 256.8,401.5 262.4,411.9C268.0,422.3 263.5,420.1 262.4,423.1C261.3,426.0 258.3,430.1 255.7,429.7C253.1,429.4 248.7,421.2 246.8,420.8C244.9,420.4 243.5,424.9 244.6,427.5C245.7,430.1 250.9,435.7 253.5,436.4C256.1,437.2 257.2,432.0 260.2,432.0C263.2,432.0 269.9,435.0 271.3,436.4C272.8,437.9 266.1,436.4 269.1,440.9C272.1,445.4 286.6,456.5 289.2,463.2C291.8,469.9 281.8,477.0 284.7,481.1C287.7,485.2 300.0,488.1 307.0,487.8C314.1,487.4 321.5,483.3 327.1,478.8C332.7,474.4 330.1,465.4 340.5,461.0C350.9,456.5 378.1,455.8 389.6,452.1C401.1,448.3 403.3,448.3 409.7,438.7C416.0,429.0 425.7,403.7 427.5,394.0C429.4,384.4 421.9,385.5 420.8,380.7C419.7,375.8 422.7,369.5 420.8,365.0C419.0,360.6 410.0,362.8 409.7,353.9C409.3,345.0 419.7,321.2 418.6,311.5C417.5,301.8 413.4,298.9 403.0,295.9C392.6,292.9 368.0,298.9 356.1,293.6C344.2,288.4 333.8,271.3 331.6,264.6C329.3,258.0 340.9,261.7 342.7,253.5C344.6,245.3 346.1,223.0 342.7,215.6C339.4,208.1 328.6,212.2 322.7,208.9C316.7,205.5 309.6,200.7 307.0,195.5C304.4,190.3 316.0,181.0 307.0,177.6C298.1,174.3 265.0,173.5 253.5,175.4C242.0,177.3 242.0,186.9 237.9,188.8C233.8,190.6 232.3,185.1 228.9,186.6C225.6,188.0 222.3,196.6 217.8,197.7C213.3,198.8 208.5,193.6 202.2,193.3C195.9,192.9 187.3,191.0 179.9,195.5Z"/>
  <path id="terrestre-pWest" d="M99.5,282.5C92.9,289.6 81.7,313.4 72.8,322.7C63.8,331.9 46.7,326.7 46.0,338.3C45.3,349.8 64.6,381.0 68.3,391.8C72.0,402.6 71.3,399.3 68.3,403.0C65.3,406.7 51.9,406.3 50.5,414.1C49.0,421.9 60.1,442.0 59.4,449.8C58.6,457.6 48.2,456.9 46.0,461.0C43.8,465.1 42.7,469.5 46.0,474.4C49.3,479.2 60.9,484.0 66.1,490.0C71.3,495.9 68.7,503.0 77.2,510.1C85.8,517.1 106.6,529.8 117.4,532.4C128.2,535.0 136.4,525.3 141.9,525.7C147.5,526.1 148.3,533.5 150.9,534.6C153.5,535.7 154.6,530.5 157.6,532.4C160.5,534.2 162.8,545.0 168.7,545.8C174.7,546.5 180.2,535.7 193.3,536.8C206.3,538.0 233.4,554.7 246.8,552.5C260.2,550.2 266.9,528.7 273.6,523.5C280.3,518.2 284.7,523.1 287.0,521.2C289.2,519.4 288.1,514.9 287.0,512.3C285.8,509.7 280.6,507.8 280.3,505.6C279.9,503.4 284.4,501.9 284.7,498.9C285.1,495.9 285.8,491.8 282.5,487.8C279.1,483.7 267.2,477.3 264.6,474.4C262.0,471.4 269.5,475.5 266.9,469.9C264.3,464.3 259.4,449.8 249.0,440.9C238.6,432.0 214.1,422.7 204.4,416.4C194.7,410.0 191.4,405.9 191.0,403.0C190.6,400.0 197.7,396.7 202.2,398.5C206.6,400.4 213.3,411.2 217.8,414.1C222.3,417.1 225.2,417.5 228.9,416.4C232.7,415.2 239.4,412.3 240.1,407.4C240.8,402.6 236.8,392.6 233.4,387.4C230.1,382.1 224.5,381.8 220.0,376.2C215.6,370.6 214.1,361.3 206.6,353.9C199.2,346.5 180.6,331.9 175.4,331.6C170.2,331.2 174.3,345.7 175.4,351.7C176.5,357.6 181.7,363.2 182.1,367.3C182.5,371.4 176.9,372.5 177.6,376.2C178.4,379.9 185.8,386.6 186.6,389.6C187.3,392.6 186.2,398.9 182.1,394.0C178.0,389.2 165.0,368.0 162.0,360.6C159.0,353.1 167.6,359.1 164.2,349.4C160.9,339.8 150.5,314.1 141.9,302.6C133.4,291.0 120.0,283.6 112.9,280.3C105.9,276.9 106.2,275.4 99.5,282.5Z"/>
  <path id="terrestre-pSat0" d="M242.3,57.2C240.8,56.0 241.6,58.3 240.1,57.2C238.6,56.0 235.3,51.2 233.4,50.5C231.6,49.7 230.4,52.3 228.9,52.7C227.5,53.1 225.6,52.3 224.5,52.7C223.4,53.1 223.4,54.6 222.3,54.9C221.1,55.3 219.7,55.7 217.8,54.9C215.9,54.2 212.6,50.8 211.1,50.5C209.6,50.1 210.4,52.3 208.9,52.7C207.4,53.1 204.4,53.8 202.2,52.7C199.9,51.6 198.5,47.1 195.5,46.0C192.5,44.9 187.3,44.9 184.3,46.0C181.4,47.1 179.5,51.9 177.6,52.7C175.8,53.4 174.7,50.1 173.2,50.5C171.7,50.8 169.5,53.4 168.7,54.9C168.0,56.4 170.9,56.8 168.7,59.4C166.5,62.0 157.6,65.3 155.3,70.5C153.1,75.7 154.2,85.8 155.3,90.6C156.4,95.5 160.9,97.3 162.0,99.5C163.1,101.8 163.1,102.1 162.0,104.0C160.9,105.9 156.1,108.8 155.3,110.7C154.6,112.6 157.2,111.1 157.6,115.2C157.9,119.3 156.4,130.4 157.6,135.2C158.7,140.1 162.0,142.7 164.2,144.2C166.5,145.7 169.1,144.9 170.9,144.2C172.8,143.4 173.9,140.4 175.4,139.7C176.9,139.0 178.4,140.4 179.9,139.7C181.4,139.0 183.2,136.7 184.3,135.2C185.4,133.8 186.2,132.6 186.6,130.8C186.9,128.9 185.4,126.3 186.6,124.1C187.7,121.9 192.1,119.3 193.3,117.4C194.4,115.5 192.5,114.4 193.3,112.9C194.0,111.4 196.2,109.2 197.7,108.5C199.2,107.7 201.1,108.1 202.2,108.5C203.3,108.8 202.5,110.3 204.4,110.7C206.3,111.1 209.2,112.6 213.3,110.7C217.4,108.8 225.6,103.3 228.9,99.5C232.3,95.8 231.2,91.7 233.4,88.4C235.6,85.0 240.5,81.0 242.3,79.5C244.2,78.0 243.1,81.0 244.6,79.5C246.1,78.0 250.5,73.1 251.3,70.5C252.0,67.9 250.5,66.1 249.0,63.8C247.5,61.6 243.8,58.3 242.3,57.2Z"/>
  <path id="terrestre-pSat1" d="M548.0,320.4C545.4,321.5 542.8,326.0 541.3,327.1C539.8,328.2 540.9,325.3 539.1,327.1C537.2,329.0 531.6,336.0 530.1,338.3C528.7,340.5 529.0,338.6 530.1,340.5C531.3,342.4 535.7,347.6 536.8,349.4C538.0,351.3 535.3,349.8 536.8,351.7C538.3,353.5 544.3,358.4 545.8,360.6C547.2,362.8 545.4,363.9 545.8,365.0C546.1,366.2 547.6,366.2 548.0,367.3C548.4,368.4 547.6,370.6 548.0,371.7C548.4,372.9 549.9,372.1 550.2,374.0C550.6,375.8 550.6,381.0 550.2,382.9C549.9,384.8 548.4,380.3 548.0,385.1C547.6,390.0 546.9,406.3 548.0,411.9C549.1,417.5 549.5,417.5 554.7,418.6C559.9,419.7 574.8,419.0 579.2,418.6C583.7,418.2 579.2,417.1 581.5,416.4C583.7,415.6 590.0,415.2 592.6,414.1C595.2,413.0 596.0,410.4 597.1,409.7C598.2,408.9 597.8,411.2 599.3,409.7C600.8,408.2 604.9,405.9 606.0,400.7C607.1,395.5 607.1,383.3 606.0,378.4C604.9,373.6 600.4,374.3 599.3,371.7C598.2,369.1 598.9,364.7 599.3,362.8C599.7,361.0 601.2,361.7 601.5,360.6C601.9,359.5 601.2,357.2 601.5,356.1C601.9,355.0 603.4,356.1 603.8,353.9C604.1,351.7 604.5,345.3 603.8,342.7C603.0,340.1 600.1,339.4 599.3,338.3C598.6,337.2 600.8,337.9 599.3,336.0C597.8,334.2 592.2,328.6 590.4,327.1C588.5,325.6 590.4,328.2 588.2,327.1C585.9,326.0 581.5,321.5 577.0,320.4C572.5,319.3 564.4,320.8 561.4,320.4C558.4,320.1 559.9,318.2 559.1,318.2C558.4,318.2 558.8,320.1 556.9,320.4C555.1,320.8 550.6,319.3 548.0,320.4Z"/>
  <path id="terrestre-pSat2" d="M128.5,704.2C127.4,703.4 127.1,703.8 126.3,704.2C125.6,704.5 125.6,706.0 124.1,706.4C122.6,706.8 118.9,706.0 117.4,706.4C115.9,706.8 116.3,708.3 115.2,708.6C114.0,709.0 111.8,708.3 110.7,708.6C109.6,709.0 108.8,710.1 108.5,710.9C108.1,711.6 110.3,711.2 108.5,713.1C106.6,715.0 99.2,719.8 97.3,722.0C95.5,724.2 97.7,725.4 97.3,726.5C96.9,727.6 95.5,727.6 95.1,728.7C94.7,729.8 95.5,732.1 95.1,733.2C94.7,734.3 93.2,731.7 92.9,735.4C92.5,739.1 93.2,751.8 92.9,755.5C92.5,759.2 91.0,754.7 90.6,757.7C90.2,760.7 89.9,770.0 90.6,773.3C91.4,776.7 93.2,777.0 95.1,777.8C96.9,778.5 100.3,778.2 101.8,777.8C103.3,777.4 101.8,775.9 104.0,775.6C106.2,775.2 112.9,775.9 115.2,775.6C117.4,775.2 115.5,773.7 117.4,773.3C119.3,773.0 124.5,773.0 126.3,773.3C128.2,773.7 126.3,775.2 128.5,775.6C130.8,775.9 137.5,775.9 139.7,775.6C141.9,775.2 141.2,773.7 141.9,773.3C142.7,773.0 142.7,774.4 144.2,773.3C145.7,772.2 149.7,768.5 150.9,766.6C152.0,764.8 151.2,763.3 150.9,762.2C150.5,761.1 149.0,760.7 148.6,759.9C148.3,759.2 148.3,758.5 148.6,757.7C149.0,757.0 150.9,756.2 150.9,755.5C150.9,754.7 149.0,755.5 148.6,753.3C148.3,751.0 149.7,745.1 148.6,742.1C147.5,739.1 143.4,736.5 141.9,735.4C140.4,734.3 141.2,736.5 139.7,735.4C138.2,734.3 134.1,733.2 133.0,728.7C131.9,724.2 133.8,712.7 133.0,708.6C132.3,704.5 129.7,704.9 128.5,704.2Z"/>
  <clipPath id="terrestre-cE"><use href="#terrestre-pEast"/></clipPath>
  <clipPath id="terrestre-cW"><use href="#terrestre-pWest"/></clipPath>
  <radialGradient id="terrestre-topLight" cx="42%" cy="6%" r="65%"><stop offset="0" stop-color="#bfe6d6" stop-opacity="0.16"/><stop offset="0.5" stop-color="#3fae9a" stop-opacity="0.06"/><stop offset="1" stop-color="#3fae9a" stop-opacity="0"/></radialGradient>
  <radialGradient id="terrestre-mushGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3fd0bd" stop-opacity="0.4"/><stop offset="1" stop-color="#3fd0bd" stop-opacity="0"/></radialGradient>
  <radialGradient id="terrestre-toxGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#a6c83c" stop-opacity="0.5"/><stop offset="1" stop-color="#a6c83c" stop-opacity="0"/></radialGradient>
  <linearGradient id="terrestre-forestG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a8048"/><stop offset="1" stop-color="#214a2c"/></linearGradient>
  <linearGradient id="terrestre-mushG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e6e56"/><stop offset="1" stop-color="#143a2e"/></linearGradient>
  <linearGradient id="terrestre-cliffG" gradientUnits="userSpaceOnUse" x1="0" y1="46" x2="0" y2="824"><stop offset="0" stop-color="#4e4a2c"/><stop offset="0.5" stop-color="#2a2816"/><stop offset="1" stop-color="#12100a"/></linearGradient>
  <filter id="terrestre-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.5"/></filter>
  <filter id="terrestre-soft2" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="13"/></filter>
</defs>
<rect x="0" y="0" width="652" height="824" fill="#070a08"/>
<rect x="0" y="0" width="652" height="824" fill="url(#terrestre-topLight)"/>
<ellipse cx="173" cy="431" rx="120" ry="136" fill="url(#terrestre-mushGlow)" opacity="0.45"/>
<g fill="#000" opacity="0.42" filter="url(#terrestre-soft2)">
<use href="#terrestre-pEast" transform="translate(7,42)"/>
<use href="#terrestre-pWest" transform="translate(7,40)"/>
<use href="#terrestre-pSat0" transform="translate(6,26)"/>
<use href="#terrestre-pSat1" transform="translate(6,26)"/>
<use href="#terrestre-pSat2" transform="translate(6,26)"/>
</g>
<g opacity="0.97">
<use href="#terrestre-pEast" transform="translate(0,28)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pEast" transform="translate(0,24)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pEast" transform="translate(0,20)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pEast" transform="translate(0,16)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pEast" transform="translate(0,12)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pEast" transform="translate(0,8)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pEast" transform="translate(0,4)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pWest" transform="translate(0,26)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pWest" transform="translate(0,22)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pWest" transform="translate(0,18)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pWest" transform="translate(0,14)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pWest" transform="translate(0,10)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pWest" transform="translate(0,6)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pWest" transform="translate(0,2)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat0" transform="translate(0,15)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat0" transform="translate(0,12)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat0" transform="translate(0,9)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat0" transform="translate(0,6)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat0" transform="translate(0,3)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat1" transform="translate(0,15)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat1" transform="translate(0,12)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat1" transform="translate(0,9)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat1" transform="translate(0,6)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat1" transform="translate(0,3)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat2" transform="translate(0,15)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat2" transform="translate(0,12)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat2" transform="translate(0,9)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat2" transform="translate(0,6)" fill="url(#terrestre-cliffG)"/>
<use href="#terrestre-pSat2" transform="translate(0,3)" fill="url(#terrestre-cliffG)"/>
</g>
<use href="#terrestre-pSat0" fill="url(#terrestre-mushG)"/>
<clipPath id="terrestre-cs0"><use href="#terrestre-pSat0"/></clipPath>
<g clip-path="url(#terrestre-cs0)"><g transform="translate(163.767,76.2881) scale(1.00131)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(171.917,81.9864) scale(1.00131)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(163.496,129.309) scale(1.00131)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(172.043,107.287) scale(1.00131)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g></g>
<use href="#terrestre-pSat1" fill="url(#terrestre-forestG)"/>
<clipPath id="terrestre-cs1"><use href="#terrestre-pSat1"/></clipPath>
<g clip-path="url(#terrestre-cs1)"><g transform="translate(560.129,344.599) scale(1.00131)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(573.274,385.189) scale(1.00131)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(571.614,358.101) scale(1.00131)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(583.534,375.143) scale(1.00131)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g></g>
<use href="#terrestre-pSat2" fill="url(#terrestre-mushG)"/>
<clipPath id="terrestre-cs2"><use href="#terrestre-pSat2"/></clipPath>
<g clip-path="url(#terrestre-cs2)"><g transform="translate(128.132,710.205) scale(1.00131)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(108.815,723.047) scale(1.00131)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(133.276,752.429) scale(1.00131)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(116.602,710.515) scale(1.00131)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g></g>
<!-- LOBO OVEST: funghi giganti + Agarus -->
<use href="#terrestre-pWest" fill="url(#terrestre-mushG)"/>
<g clip-path="url(#terrestre-cW)">
  <ellipse cx="173" cy="431" rx="101" ry="114" fill="url(#terrestre-mushGlow)" opacity="0.3"/>
  <g transform="translate(174.087,384.187) scale(1.23207)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(72.7555,418.14) scale(1.12805)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(68.408,400.465) scale(1.29114)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(150.473,494.649) scale(1.08802)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(86.7085,350.066) scale(1.15872)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(193.499,523.598) scale(1.23859)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(91.0454,324.809) scale(1.09601)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(125.868,492.08) scale(1.17541)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(98.7789,435.904) scale(1.06944)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(195.933,385.794) scale(1.21764)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(73.0953,345.927) scale(1.24034)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(204.73,399.015) scale(1.19521)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(127.07,436.853) scale(1.26647)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(228.899,464.023) scale(1.13413)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(112.216,434.185) scale(1.22402)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
<g transform="translate(171.821,506.215) scale(1.20024)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#3fc9b4" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#3fc9b4"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#7fe8d8" opacity="0.75"/></g>
  <ellipse cx="128" cy="362" rx="63" ry="65" fill="#5a6a24" opacity="0.4"/>
  <ellipse cx="128" cy="362" rx="48" ry="49" fill="url(#terrestre-toxGlow)" opacity="0.45"/>
  <g transform="translate(80.4154,369.268) scale(1.11911)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#6e9a2c" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#6e9a2c"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#a6c83c" opacity="0.75"/></g>
<g transform="translate(100.789,354.547) scale(1.11911)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#6e9a2c" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#6e9a2c"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#a6c83c" opacity="0.75"/></g>
<g transform="translate(157.43,363.222) scale(1.11911)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#6e9a2c" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#6e9a2c"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#a6c83c" opacity="0.75"/></g>
<g transform="translate(127.309,351.606) scale(1.11911)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#6e9a2c" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#6e9a2c"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#a6c83c" opacity="0.75"/></g>
<g transform="translate(121.746,313.415) scale(1.11911)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#6e9a2c" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#6e9a2c"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#a6c83c" opacity="0.75"/></g>
<g transform="translate(78.9356,376.258) scale(1.11911)"><ellipse cx="0" cy="-3" rx="9" ry="4.5" fill="#6e9a2c" opacity="0.28"/><rect x="-1.3" y="-3" width="2.6" height="7.5" fill="#c2ccbc" opacity="0.6"/><ellipse cx="0" cy="-3.4" rx="6.2" ry="3" fill="#6e9a2c"/><ellipse cx="0" cy="-4.2" rx="3.6" ry="1.6" fill="#a6c83c" opacity="0.75"/></g>
</g>
<!-- LOBO EST: foresta di conifere -->
<use href="#terrestre-pEast" fill="url(#terrestre-forestG)"/>
<g clip-path="url(#terrestre-cE)">
  <g opacity="0.45"><polygon points="162,222 295,207 280,332 168,316" fill="#43955a"/>
    <polygon points="295,207 404,300 375,394 280,332" fill="#2c6638"/>
    <polygon points="168,316 280,332 263,450 174,432" fill="#367a44"/></g>
  <g transform="translate(212.353,343.735) scale(1.19786)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(246.56,360.142) scale(1.27324)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(312.845,212.155) scale(1.22088)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(217.897,258.554) scale(1.27907)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(408.715,323.404) scale(1.26198)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(367.461,325.078) scale(1.29369)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(316.304,235.543) scale(1.21836)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(315.214,432.742) scale(1.09863)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(286.271,397.89) scale(1.26297)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(324.686,211.744) scale(1.28748)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(347.186,356.618) scale(1.27335)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(228.759,202.668) scale(1.19429)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(374.994,324.087) scale(1.22838)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(336.974,435.701) scale(1.10995)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(335.757,447.324) scale(1.25614)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(185.92,253.786) scale(1.19533)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(400.898,314.031) scale(1.12734)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(313.085,276.886) scale(1.07516)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(282.14,300.206) scale(1.2614)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
<g transform="translate(241.625,354.962) scale(1.29341)"><rect x="-1" y="3" width="2" height="4.5" fill="#36281a"/><polygon points="0,-8.5 5.6,3 -5.6,3" fill="#2c6b38"/><polygon points="0,-4.6 4.4,4.6 -4.4,4.6" fill="#358044"/><polygon points="0,-8.5 2.4,-2 -1.2,-1" fill="#46945a" opacity="0.55"/></g>
</g>
<use href="#terrestre-pEast" fill="none" stroke="#7fc890" stroke-width="1.8" opacity="0.32"/>
<use href="#terrestre-pWest" fill="none" stroke="#5fd0b8" stroke-width="1.6" opacity="0.34"/>
<use href="#terrestre-pSat0" fill="none" stroke="#7fc890" stroke-width="1.4" opacity="0.3"/>
<use href="#terrestre-pSat1" fill="none" stroke="#7fc890" stroke-width="1.4" opacity="0.3"/>
<use href="#terrestre-pSat2" fill="none" stroke="#7fc890" stroke-width="1.4" opacity="0.3"/>
<!-- Agarus danger -->
<circle cx="128" cy="362" r="31" fill="url(#terrestre-toxGlow)" opacity="0.4"/>
<circle cx="128" cy="362" r="22" fill="none" stroke="#a6c83c" stroke-width="1.6" stroke-dasharray="3 5" opacity="0.6"/>
<g class="marker" data-k="greenshard">
  <circle class="hit" cx="268" cy="338" r="24"/>
  <g class="pin">
    <ellipse cx="268" cy="351" rx="17" ry="5" fill="#000" opacity="0.35"/>
    <circle cx="268" cy="338" r="13" fill="#0c1408" stroke="#cba85a" stroke-width="2"/>
    <g fill="#e6c878" transform="translate(268,338)"><rect x="-8" y="-2" width="4.5" height="8"/><polygon points="-8,-2 -3.5,-2 -5.7,-7"/><rect x="-2" y="-5" width="5" height="11"/><polygon points="-2,-5 3,-5 0.5,-11"/><rect x="4.5" y="-1" width="4.5" height="7"/><polygon points="4.5,-1 9,-1 6.7,-6"/></g>
  </g>
  <g class="tip" transform="translate(268,338)">
    <rect x="-80" y="-78" width="160" height="48" rx="8" fill="#0a0d08" stroke="#cba85a" stroke-opacity="0.5"/>
    <text x="0" y="-58" text-anchor="middle" fill="#eccd84" font-family="Cinzel,serif" font-size="12.5" font-weight="600">Greenshard</text>
    <text x="0" y="-41" text-anchor="middle" fill="#c4ccae" font-family="Georgia,serif" font-size="11.5">Capitale &#183; Slayer di Frontiera</text>
  </g>
</g>
<g class="marker" data-k="agarus">
  <circle class="hit" cx="128" cy="362" r="24"/>
  <g class="pin">
    <circle cx="128" cy="362" r="12" fill="#10140a" stroke="#a6c83c" stroke-width="2"/>
    <path d="M128,356 l5,9 l-10,0 z" fill="#bcd84a"/></g>
  <g class="tip" transform="translate(128,362)">
    <rect x="-78" y="-76" width="156" height="48" rx="8" fill="#0a0d08" stroke="#a6c83c" stroke-opacity="0.5"/>
    <text x="0" y="-56" text-anchor="middle" fill="#bcd84a" font-family="Cinzel,serif" font-size="12" font-weight="600">Agarus</text>
    <text x="0" y="-39" text-anchor="middle" fill="#c4ccae" font-family="Georgia,serif" font-size="11.5">Pericolo &#183; nube tossica</text>
  </g>
</g>
<g transform="translate(626,40)" opacity="0.5">
  <circle r="16" fill="none" stroke="#7fc890" stroke-width="1"/>
  <text x="0" y="-7" text-anchor="middle" fill="#9fd8a8" font-family="Cinzel,serif" font-size="10" font-weight="700">N</text>
  <path d="M0,-3 L3.4,7 L0,4.6 L-3.4,7 Z" fill="#7fc890"/>
</g>
</svg>
    <div class="titleplate"><div class="ele">Terra &#183; aether terrestre</div><h1>Continente Terrestre</h1></div>
    <div class="hint"><span class="dot"></span> Tocca i punti per i dettagli</div>
  </div>
  <div class="info">
    <p class="lede">Due lobi sospesi <b>nel vuoto</b>, senza nulla a unirli: a est una foresta di conifere attorno a <b>Greenshard</b>, a ovest una distesa di <b>funghi giganti</b> bioluminescenti. A nord-ovest, la nube di Agarus avanza.</p>
    <div class="grid">
      <div class="cell"><div class="k">Capitale</div><div class="v">Greenshard<small>Al centro del lobo est</small></div></div>
      <div class="cell"><div class="k">Chi comanda</div><div class="v">Nessun governo unico<small>Due comunità divise: gli Slayer di Frontiera a est (Greenshard), pacifici e aperti; i Custodi di Rovo a ovest, isolazionisti, ormai una manciata di superstiti senza più una capitale</small></div></div>
      <div class="cell"><div class="k">Fazioni</div><div class="v">Slayer di Frontiera &#183; Custodi di Rovo<small>Separati dal vuoto che taglia il continente</small></div></div>
      <div class="cell"><div class="k danger">Zona da evitare</div><div class="v">Agarus &mdash; nord-ovest<small>Nube tossica in espansione, sull'antica capitale dei Custodi di Rovo ormai divorata</small></div></div>
      <div class="cell wide"><div class="k">Situazione</div><div class="v">I Custodi di Rovo sono in lento declino: le tossine di Agarus si allargano dal loro vecchio cuore e li costringono a ritirarsi, riducendoli a pochi superstiti.</div></div>
    </div>
    <div class="legend">
      <div class="it"><span class="sw" style="background:linear-gradient(180deg,#3a8048,#214a2c)"></span><b>Foresta di conifere</b>&nbsp;— est</div>
      <div class="it"><span class="sw" style="background:linear-gradient(180deg,#2e6e56,#143a2e)"></span><b>Funghi giganti</b>&nbsp;— ovest</div>
      <div class="it"><span class="sw" style="background:linear-gradient(180deg,#6e7e2a,#3a4818)"></span><b>Agarus</b>&nbsp;— nord-ovest, pericolo</div>
    </div>
  </div>
</div></div>`);
