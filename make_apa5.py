#!/usr/bin/env python3
"""Autopunkt Audi A5 photo reel with voiceover (ap_a5.html): python3 make_apa5.py [--stills]  (needs jobs/ap_a5/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/ap_a5'
words = json.load(open(f'{job}/words.json')); words = words.get('words', words) if isinstance(words, dict) else words
words = [w for w in words if w.get('type', 'word') == 'word']
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
find = lambda pre, after=0.0: next(w['start'] for w in words if w['start'] >= after and norm(w['text']).startswith(pre))
TOTAL = round(words[-1]['end'] + 2.4, 2)
C = {'total': TOTAL, 'tdi': find('45') - .05, 'diesel': find('diesel') - .05, 'allrad': find('allrad'), 'auto': find('automatik'),
     'im': find('im') - .05, 'beim': find('beim') - .05, 'dazu': find('dazu') - .05, 'preis': find('der', find('dazu')) - .05,
     'zahl': find('einundzwanzig'), 'end': find('interesse') - .1}
C['seat'] = C['preis']  # no room for the seat b-roll at this voice length
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words]
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 120, 'fade': 2.2, 'scenes': [0, C['tdi'], C['diesel'], C['im'], C['beim'], C['dazu'], C['preis'], C['end']],
           'items': [[C['zahl']]]}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='ap_a5.html')
if '--stills' in sys.argv:
    ts = [1.6, C['tdi'] + .8, C['auto'] + .4, C['im'] + 1.2, C['beim'] + 1.5, C['dazu'] + 1.2, C['zahl'] + .8, TOTAL - .5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'apa5'], check=True)
# voice in front, music ducked under it, cut sounds kept quiet (no fake engine noise)
fc = (f"[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.26[m];[m][v2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.10[s];"
      f"[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Autopunkt_Audi_A5_45TDI_quattro_21000_mit_Sprecher.mp4'], check=True)
print('DONE')
