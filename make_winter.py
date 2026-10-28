#!/usr/bin/env python3
"""FOB Winterdienst photo reel (winter.html): python3 make_winter.py [--stills]"""
import json, os, re, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/winterdienst'
words = json.load(open(f'{job}/words.json')); words = words.get('words', words) if isinstance(words, dict) else words
words = [w for w in words if w.get('type', 'word') == 'word']
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
find = lambda pre, after=0.0: next(w['start'] for w in words if w['start'] >= after and norm(w['text']).startswith(pre))
end = words[-1]['end']; TOTAL = round(end + 3.2, 2)
a = 0; b = find('fob') - .1; c = find('in', b) - .1; d = find('vom') - .1; e = find('ob') - .1; f = find('jetzt', e) - .1
url = find('fobfm', f)
shots = [{'img': 'plow', 'pos': '78% center', 't0': 0, 't1': b, 'z': [1.15, 1.32], 'dx': -60},
         {'img': 'fraese', 't0': b, 't1': c, 'z': [1.06, 1.18], 'dy': 40},
         {'img': 'hof', 'pos': '70% center', 't0': c, 't1': d, 'z': [1.1, 1.22], 'dx': 80},
         {'img': 'einfahrt', 't0': d, 't1': e, 'z': [1.05, 1.18], 'dy': -40},
         {'img': 'plow', 'fit': True, 'top': 690, 't0': e, 't1': TOTAL, 'z': [1.0, 1.08]}]
segs = [{'t0': 0, 't1': b, 'k': 'Saison 2026/27', 'h': 'Noch kein<br><b>Winterdienst?</b>'},
        {'t0': b, 't1': c, 'k': 'Räumen & Streuen', 'h': 'Wir <b>räumen</b><br>für Sie'},
        {'t0': c, 't1': d, 'k': 'Einsatzgebiet', 'h': '<b>Weßling</b><small>Hochstadt · München &amp; Umgebung</small>'},
        {'t0': d, 't1': e, 'k': 'Zuverlässig', 'h': 'Gehweg<br><b>bis Einfahrt</b>'}]
caps = []
k = 0
while k < len(words):
    w = words[k]
    if norm(w['text']).startswith('fobfm') and k + 2 < len(words):
        caps.append({'text': 'fob-fm.de', 'start': w['start'], 'end': words[k + 2]['end']}); k += 3; continue
    caps.append({'text': w['text'], 'start': w['start'], 'end': w['end']}); k += 1
data = {'total': TOTAL, 'shots': shots, 'segs': segs, 'opt': [e, f], 'oa': find('pauschal'), 'ob': find('flexibel'), 'end': f, 'url': url, 'caps': caps}
open(f'{job}/data.js', 'w').write('window.DATA=' + json.dumps(data, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 116, 'fade': 2.5, 'scenes': [0, b, c, d, e, f], 'items': [[], [], [], [], [data['oa'], data['ob']], [url]]}, open(f'{job}/cues.json', 'w'))
print('TOTAL', TOTAL, [round(x, 2) for x in (b, c, d, e, f)])
env = dict(os.environ, REEL_HTML='winter.html')
if '--stills' in sys.argv:
    ts = [1.8, (b + c) / 2 + .5, (c + d) / 2 + .5, (d + e) / 2 + .5, f - .3, TOTAL - .3]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'winterdienst'], check=True)
fc = (f"[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.28[m];[m][v2]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.32[s];"
      f"[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/FOB_Winterdienst_Reel.mp4'], check=True)
print('DONE')
