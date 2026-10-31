#!/usr/bin/env python3
"""Autopunkt Audi A5 photo reel with voiceover (ap_a5b.html): python3 make_apa5b.py [--stills]  (needs jobs/ap_a5/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/ap_a5g'
words = json.load(open(f'{job}/words.json')); words = words.get('words', words) if isinstance(words, dict) else words
words = [w for w in words if w.get('type', 'word') == 'word']
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
find = lambda pre, after=0.0: next(w['start'] for w in words if w['start'] >= after and norm(w['text']).startswith(pre))
TOTAL = round(words[-1]['end'] + 2.4, 2)
C = {'total': TOTAL, 'der': find('der') - .05, 'tdi': find('45') - .05, 'diesel': find('diesel') - .05, 'allrad': find('allrad'), 'auto': find('automatik'),
     'km': find('89'), 'im': find('im', find('kilometer')) - .05, 'beim': find('beim') - .05, 'dazu': find('dazu') - .05,
     'preis': find('und', find('dazu') + .1) - .05, 'zahl': find('26'), 'end': find('interesse') - .15}
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words]
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 120, 'fade': 2.2, 'scenes': [0, C['der'], C['tdi'], C['diesel'], C['im'], C['beim'], C['dazu'], C['preis'], C['end']],
           'items': [[C['km'], C['zahl']], [C['end'] + .9]]}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='ap_a5b.html')
if '--stills' in sys.argv:
    ts = [1.0, C['der'] + .6, C['tdi'] + .15, C['km'] + 1.0, C['im'] + 1.2, C['beim'] + .12, C['dazu'] + 1.2, C['preis'] + .7, C['zahl'] + 1.0, C['end'] + .5, TOTAL - .3]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'apa5g'], check=True)
# voice in front, music ducked under it, cut sounds kept quiet (no fake engine noise)
fc = (f"[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.26[m];[m][v2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.16[s];"
      f"[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Autopunkt_Audi_A5_45TDI_quattro_26990_Georg.mp4'], check=True)
print('DONE')
