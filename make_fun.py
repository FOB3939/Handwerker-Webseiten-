#!/usr/bin/env python3
"""Custom fun reels (horror.html, bingo.html): python3 make_fun.py <horror|bingo> [--stills]  (needs jobs/<name>/vo.mp3 + words.json)"""
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
    ts = [1.5, 3.2, 5.6, 8.2, 12.2, TOTAL - .5] if name == 'horror' else [1.0, C['items'][2] + .3, C['bingo'] + .5, C['fix'] + 1.4, TOTAL - .5]
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
