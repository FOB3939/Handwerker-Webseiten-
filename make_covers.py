#!/usr/bin/env python3
"""Instagram cover images (1080x1920, text inside the 3:4 grid-safe area y 240..1680): python3 make_covers.py <outdir>"""
import json, os, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__)); OUT = sys.argv[1]
C = [  # file, chip, line1, line2 (accent), accent color, image(s), crop top (y of source to show in card)
 ('01_waermepumpe', 'HEIZUNG', 'Öl vs. Luft', 'Der Unterschied', '#2ee6d6', ['wpoel'], 430),
 ('02_renovierung', 'RENOVIERUNG', 'Vorher', '→ Nachher', '#d9a21b', ['proj_v', 'proj_n'], 300),
 ('03_toilette', 'SANITÄR', 'Die Toilette', 'hat gekündigt', '#ffd23f', ['klo'], 380),
 ('04_aussenhahn', 'FROST-ALARM ❄️', 'Außenhahn', 'winterfest?', '#7fd3ff', ['frost'], 330),
 ('05_rohrbruch', 'NOTFALL-CHECKLISTE', 'Rohrbruch!', 'Was jetzt?', '#ff4d5a', ['rohr'], 330),
 ('06_heizung5', 'HEIZUNG', 'Stufe 5 =', 'schneller warm?', '#ff8a1f', ['heiz5'], 560),
 ('07_gruppenchat', 'HAUSTECHNIK', 'Wenn dein Haus', 'schreiben könnte', '#2ee6d6', ['chat'], 330),
 ('08_bad', 'PLANUNGSBEISPIEL', 'Wer hat dieses', 'Bad geplant?!', '#ffd23f', ['bad'], 520),
 ('09_fbh_teil1', 'FUSSBODENHEIZUNG · TEIL 1', 'Ein Raum', 'bleibt kalt?', '#5aa9ff', ['fbh1'], 400),
 ('10_fbh_teil2', 'FUSSBODENHEIZUNG · TEIL 2', 'Fußbodenheizung', 'spülen', '#2ee6d6', ['fbh2'], 560),
]
html = open(f'{KIT}/cover_tpl.html').read()
pages = []
for f, chip, l1, l2, col, imgs, top in C:
    pages.append({'f': f, 'chip': chip, 'l1': l1, 'l2': l2, 'col': col, 'imgs': [f'jobs/covers/{i}.jpg' for i in imgs], 'top': top})
open(f'{KIT}/jobs/covers/data.js', 'w').write('window.PAGES=' + json.dumps(pages, ensure_ascii=False) + ';')
js = f"""
const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const pg=await b.newPage({{viewport:{{width:1080,height:1920}}}});
await pg.goto('file://{KIT}/cover_tpl.html');await pg.evaluate(()=>document.fonts.ready);
for(let i=0;i<{len(pages)};i++){{await pg.evaluate(i=>show(i),i);await pg.waitForTimeout(150);await pg.screenshot({{path:'{OUT}/'+PAGES_F[i]+'.jpg',type:'jpeg',quality:93}})}}
await b.close()}})();""".replace('PAGES_F', json.dumps([p['f'] for p in pages]))
open('/tmp/rt/cov.js', 'w').write(js); subprocess.run(['node', '/tmp/rt/cov.js'], check=True)
