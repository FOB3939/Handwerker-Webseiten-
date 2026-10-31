#!/usr/bin/env python3
"""Custom reels (horror.html, bingo.html, hauswasser.html): python3 make_fun.py <horror|bingo|hauswasser> [--stills]  (needs jobs/<name>/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__)); name = sys.argv[1]; job = f'{KIT}/jobs/{name}'
words = json.load(open(f'{job}/words.json')); words = words.get('words', words) if isinstance(words, dict) else words
words = [w for w in words if w.get('type', 'word') == 'word']
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
find = lambda pre, after=0.0: next(w['start'] for w in words if w['start'] >= after and norm(w['text']).startswith(pre))
TOTAL = round(words[-1]['end'] + 2.4, 2)
if name == 'horror':
    C = {'hear': find('hören'), 's2': find('im') - .1, 'immer': find('immer'), 's3': find('ihr') - .05,
         's4': find('der', find('stromzähler')) - .1, 's5': find('wir') - .1, 'kost': find('kostenlos'), 's6': find('auf', find('unverbindlich')) - .1,
         'url': find('fobfm')}
    scenes, items, bpm, title = [0, C['s3'], C['s4'], C['s5'], C['s6']], [[C['kost']], [C['url']]], 96, 'FOB_Halloween_Stromzaehler_Horror'
elif name == 'hauswasser':
    C = {'braun': find('braun'), 'rueck': find('rückspülen'), 'nach': find('nachher') - .1, 'auto': find('rückspülautomatik'),
         'jetzt': find('jetzt') - .1, 'acht': find('fünfundvierzig'), 'oft': find('öfter'), 'fuer': find('für') - .1, 'hyg': find('hygiene'),
         'druck': find('wasserdruck'), 'wart': find('wartung'), 'sauber': find('sauberes') - .1, 'end': find('jetzt', find('technik')) - .1,
         'url': find('fobfm')}
    scenes, items, bpm, title = [0, C['nach'], C['jetzt'], C['fuer'], C['sauber'], C['end']], [[C['braun']], [C['auto']], [C['acht']], [C['hyg'], C['druck'], C['wart']], [C['url']]], 116, 'FOB_Hauswasserstation_Vorher_Nachher'
elif name == 'autopunkt':
    C = {'s2': find('bei') - .1, 's3': find('mit', find('gebrauchtwagen')) - .1, 'gar': find('garantie'), 'fin': find('finanzierung'),
         's4': find('dazu') - .1, 'svc': [find('zulassungsdienst'), find('smart'), find('dellenreparatur'), find('unfallinstandsetzung'), find('autoglas'), find('hol')],
         's5': find('besuchen') - .1, 'kast': find('kastenseestraße'), 's6': find('autopunkt', find('glonn', find('kastenseestraße'))) - .1}
    scenes, items, bpm, title = [0, C['s2'], C['s3'], C['s4'], C['s5'], C['s6']], [[C['gar'], C['fin']], C['svc'], [C['kast']]], 118, 'Autopunkt_Glonn_Firmenvorstellung'
elif name == 'ap_car':
    C = {'der': find('der') - .05, 'tdi': find('45'), 'silber': find('in', find('quattro')) - .05, 'sport': find('sportliche') - .05, 'alu': find('alufelgen') - .05,
         'led': find('led') - .05, 'innen': find('innen') - .05, 'multi': find('multifunktionslenkrad') - .05, 'digital': find('digitales') - .05,
         'touch': find('großer') - .05, 'auto': find('und', find('touchscreen')) - .05, 'jetzt': find('jetzt') - .1}
    scenes, items, bpm, title = [0, C['der'], C['silber'], C['innen'], C['jetzt']], [[C['tdi']], [C['sport'], C['alu'], C['led']], [C['multi'], C['digital'], C['touch'], C['auto']]], 124, 'Autopunkt_Glonn_Audi_A5_Sportback_neu'
else:
    checks = [w['start'] for w in words if norm(w['text']) == 'check']
    C = {'items': checks + [find('bingo', 2)], 'bingo': find('bingo', 2), 'fix': find('kein'), 'end': find('jetzt') - .1, 'url': find('fobfm')}
    C['items'] = checks + [C['bingo']]
    scenes, items, bpm, title = [0, C['bingo'], C['end']], [C['items'][:3], [C['url']]], 128, 'FOB_Hausmeister_Bingo'
C['total'] = TOTAL
caps, k = [], 0
while k < len(words):
    w = words[k]
    if w['text'].startswith('[') or w['text'].endswith(']') or w['text'] == '…': k += 1; continue
    if norm(w['text']).startswith('fobfm') and k + 2 < len(words):
        caps.append({'text': 'fob-fm.de', 'start': w['start'], 'end': words[k + 2]['end']}); k += 3; continue
    caps.append({'text': w['text'], 'start': w['start'], 'end': w['end']}); k += 1
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': bpm, 'fade': 2.0, 'scenes': scenes, 'items': items}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML=f'{name}.html')
if '--stills' in sys.argv:
    ts = [1.5, 3.2, 5.6, 8.2, 12.2, TOTAL - .5] if name == 'horror' else [C['braun'] + .6, C['rueck'] + .8, C['nach'] + .6, C['auto'] + .5, C['acht'] + .6, C['acht'] + 1.6, C['oft'] + .5, C['wart'] + .4, C['sauber'] + .8, TOTAL - .5] if name == 'hauswasser' else [0.9, C['s2'] + .4, C['s2'] + 2.2, C['fin'] + .6, C['svc'][2] + .3, C['svc'][5] + .5, C['kast'] + .8, TOTAL - .5] if name == 'autopunkt' else [0.6, C['tdi'] + .4, C['silber'] + .5, C['alu'] + .4, C['led'] + .5, C['multi'] + .5, C['digital'] + .4, C['touch'] + .4, C['auto'] + .5, TOTAL - .5] if name == 'ap_car' else [1.0, C['items'][2] + .3, C['bingo'] + .5, C['fix'] + 1.4, TOTAL - .5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, name], check=True)
fc = (f"[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.30[m];[m][v2]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.36[s];"
      f"[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/{title}.mp4'], check=True)
print('DONE')
