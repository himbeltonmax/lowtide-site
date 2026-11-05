// Makes the sample downloads in voorbeelden/ (PDF + PNG). Run: node scripts/make-voorbeelden.js "$PWD/voorbeelden"
const { chromium } = require('playwright');
const fs = require('fs');
const out = process.argv[2];
const base = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%}
body{font-family:Inter,sans-serif;color:#24443a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.serif{font-family:"Bitstream Charter",Charter,Georgia,serif;font-weight:400}
.page{width:100%;height:100%;display:flex;flex-direction:column;justify-content:center}
.small{letter-spacing:.24em;text-transform:uppercase;font-weight:700;opacity:.7}
ol{padding-left:1.2em} li{margin:.25em 0}
.bean{display:block}
`;
const bean = (size, fill='#45806b', line='#f7faf5') => `<svg class="bean" width="${size}" height="${size}" viewBox="-70 -70 140 140"><g transform="rotate(35.5)"><ellipse rx="46" ry="64" fill="${fill}"/><line y1="-42" y2="42" stroke="${line}" stroke-width="5.5"/></g></svg>`;
const steps = `<li>Open Lowtide uit de App Store</li><li>Vul je werkmail in (@jouwbedrijf.nl)</li><li>Vul de code in die in je mailbox komt</li>`;

const docs = [
 { file:'lowtide-cadeaukaartje-a6.pdf', w:'148mm', h:'105mm', css:`body{background:#f7faf5}.page{padding:10mm 12mm;font-size:9.5pt;line-height:1.4}
   h1{font-size:19pt;line-height:1.1;margin:2mm 0 3mm}.tag{font-style:italic;font-size:13pt;margin:2mm 0}.row{display:flex;justify-content:space-between;align-items:flex-start}`,
   html:`<div class="page"><div class="row"><p class="small" style="font-size:8pt">Cadeau</p>${bean(34)}</div>
   <h1 class="serif">Jij krijgt Lowtide cadeau van JouwBedrijf B.V.</h1>
   <p>Een filter voor jouw eigen social apps.<br>Weg met ai, ruis, breinrot en doomscrolls.</p>
   <p class="serif tag">Scroll less. See more!</p><ol>${steps}</ol><p style="margin-top:2mm">Veel plezier!</p></div>` },
 ...[['a4','210mm','297mm',1],['a3','297mm','420mm',1.414]].map(([n,w,h,k])=>({ file:`lowtide-poster-${n}.pdf`, w, h,
   css:`body{background:linear-gradient(#7aba94,#45806b);color:#f7faf5}.page{padding:${22*k}mm;text-align:center;align-items:center;font-size:${15*k}pt;line-height:1.45}
   h1{font-size:${54*k}pt;line-height:1.02;margin:${10*k}mm 0}ol{list-style-position:inside;padding:0;margin:${10*k}mm 0;font-size:${17*k}pt}.tag{font-style:italic;font-size:${24*k}pt;margin-top:${8*k}mm}`,
   html:`<div class="page">${bean(110*k,'#f7faf5','#61a680')}<p class="small" style="margin-top:${12*k}mm;font-size:${11*k}pt">Van JouwBedrijf, voor jou</p>
   <h1 class="serif">Minder scrollen.<br>Meer leven.</h1><p>Lowtide: Instagram zonder Reels, zonder eindeloze feed<br>en zonder AI-posts. Gewoon vrienden en echte berichten.</p>
   <ol>${steps}</ol><p class="serif tag">Scroll less. See more.</p></div>` })),
 { file:'lowtide-flyer-a5.pdf', w:'148mm', h:'210mm', css:`body{background:#f7faf5}.page{padding:16mm 14mm;font-size:11pt;line-height:1.5}
   h1{font-size:26pt;line-height:1.1;margin:8mm 0 5mm}ol{margin:5mm 0}.foot{margin-top:auto;font-size:9pt;opacity:.7}`,
   html:`<div class="page" style="justify-content:flex-start">${bean(44)}<h1 class="serif">Welkom bij JouwBedrijf!</h1>
   <p>Bij ons krijg je Lowtide erbij. Zo blijft Instagram rustig: je vrienden en echte berichten, zonder eindeloos scrollen.</p>
   <ol>${steps}</ol><p>Je eerste dag is al druk genoeg. Dit regel je in 1 minuut.</p><p class="serif" style="font-style:italic;font-size:15pt;margin-top:6mm">Scroll less. See more.</p>
   <p class="foot">Lowtide · Niet verbonden aan Instagram of Meta.</p></div>` },
 { file:'lowtide-factuur-voorbeeld.pdf', w:'210mm', h:'297mm', css:`body{background:#fff}.page{padding:22mm;justify-content:flex-start;font-size:10.5pt;line-height:1.5}
   .top{display:flex;justify-content:space-between;align-items:center}.muted{color:#5b7a6f}table{width:100%;border-collapse:collapse;margin-top:14mm}
   td,th{text-align:left;padding:3mm 0;border-bottom:1px solid #d5e3db}th{font-size:9pt;color:#5b7a6f;font-weight:600}td:last-child,th:last-child{text-align:right}
   .tot td{font-weight:700;border-bottom:2px solid #24443a}.ex{position:fixed;top:120mm;left:0;right:0;text-align:center;font-size:60pt;color:rgba(69,128,107,.08);transform:rotate(-20deg);font-weight:800}`,
   html:`<div class="ex">VOORBEELD</div><div class="page"><div class="top"><div style="display:flex;gap:4mm;align-items:center">${bean(36)}<b style="font-size:16pt">Lowtide</b></div><div style="text-align:right"><b style="font-size:16pt">Factuur</b><br><span class="muted">2026-0001 · 1 november 2026</span></div></div>
   <div style="display:flex;justify-content:space-between;margin-top:14mm"><div><span class="muted">Aan</span><br>JouwBedrijf B.V.<br>Voorbeeldstraat 1, 1000 AA Amsterdam<br>KvK 12345678 · btw NL000000000B01<br>finance@jouwbedrijf.nl</div>
   <div style="text-align:right"><span class="muted">Van</span><br>Lowtide<br>KvK en btw-nummer volgen<br>himbelton@gmail.com</div></div>
   <table><tr><th>Omschrijving</th><th>Aantal</th><th>Prijs excl. btw</th><th>Bedrag</th></tr>
   <tr><td>Lowtide jaarlijks, november 2026</td><td>50 accounts</td><td>€ 2,49</td><td>€ 124,50</td></tr>
   <tr><td colspan="3">Subtotaal excl. btw</td><td>€ 124,50</td></tr><tr><td colspan="3">Btw 21%</td><td>€ 26,15</td></tr>
   <tr class="tot"><td colspan="3">Totaal incl. btw</td><td>€ 150,65</td></tr></table>
   <p class="muted" style="margin-top:10mm">Betaald met iDEAL op 1 november 2026. Dit is een voorbeeldfactuur.</p></div>` },
];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  for (const d of docs) {
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${base}@page{size:${d.w} ${d.h};margin:0}${d.css}</style></head><body>${d.html}</body></html>`);
    await p.pdf({ path: `${out}/${d.file}`, width: d.w, height: d.h, printBackground: true });
  }
  const q = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await q.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${base}
   body{background:linear-gradient(#7aba94,#45806b);color:#f7faf5}.page{padding:0 140px;font-size:30px}
   h1{font-size:120px;line-height:1;margin:28px 0 56px}.steps{display:flex;gap:56px;font-size:34px}.steps span{display:flex;align-items:center;gap:18px}
   .steps i{font-style:normal;width:60px;height:60px;border-radius:50%;border:3px solid #f7faf5;display:grid;place-items:center;font-size:28px}
   .logo{position:absolute;right:140px;top:50%;transform:translateY(-50%)}</style></head><body><div class="page">
   <p class="small" style="font-size:24px">Cadeau van JouwBedrijf</p><h1 class="serif">Scroll less.<br>See more.</h1>
   <div class="steps"><span><i>1</i>Open Lowtide</span><span><i>2</i>Vul je werkmail in</span><span><i>3</i>Code uit je mail</span></div>
   <div class="logo">${bean(320,'#f7faf5','#61a680')}</div></div></body></html>`);
  await q.screenshot({ path: `${out}/lowtide-intranet-1920x1080.png` });
  await b.close();
})();
