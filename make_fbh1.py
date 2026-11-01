#!/usr/bin/env python3
"""Cartoon reel 'Heizung auf fünf' (fbh1.html): python3 make_fbh1.py [--stills]  (needs jobs/fbh1/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys, wave
import numpy as np
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/fbh1'
words = [w for w in json.load(open(f'{job}/words.json')) if True]
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
def find(pre, after=0.0, exact=False):
    return next(w['start'] for w in words if w['start'] >= after and (norm(w['text']) == pre if exact else norm(w['text']).startswith(pre)))
C = {'bei': find('bei') - .1, 'vert': find('verteilerkasten'), 'zuerst': find('zuerst') - .1, 'leucht': find('leuchtet'), 'wenn': find('wenn'),
     'leucht2': find('leuchtet', 15) - .1, 'stell': find('stellantrieb'), 'warm': find('wird', 19, True), 'defekt': find('defekt'), 'endc': round(words[-1]['end'] + .3, 2)}
TOTAL = round(C['endc'] + 3.0, 2); C['total'] = TOTAL
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words]
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 112, 'fade': 2.5, 'scenes': [0, C['bei'], C['zuerst'], C['leucht2']], 'items': []}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='fbh1.html')
if '--stills' in sys.argv:
    ts = [1.0, C['vert'] + 1.0, C['zuerst'] + 1.2, C['leucht'] + .6, C['wenn'] + 1.0, C['leucht2'] + .6, C['stell'] + .9, C['warm'] + 1.6, C['defekt'] + .6, TOTAL - .4]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'fbh1'], check=True)
# custom cartoon sfx
SR = 44100; N = int(SR * TOTAL); rng = np.random.default_rng(5); sfx = np.zeros(N)
def add(sig, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig)); sfx[i:j] += sig[:j - i] * g
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y
x = tt(.5); wh = lp(rng.standard_normal(len(x)), .15) * np.sin(np.pi * x / .5) ** 2
x = tt(.35); pop = np.sin(2 * np.pi * (300 * x + 900 * x * x)) * np.exp(-x * 14)
x2 = tt(.12); snap = (np.sin(2 * np.pi * 1600 * x2) * np.exp(-x2 * 50) + rng.standard_normal(len(x2)) * np.exp(-x2 * 90) * .4)
x = tt(.9); ding = (np.sin(2 * np.pi * 1318 * x) + .5 * np.sin(2 * np.pi * 1975 * x)) * np.exp(-x * 5) * .3
add(wh, 0, .5); add(ding * .7, C['endc'] + .3, .7)
for c in (C['bei'], C['zuerst'], C['leucht2']): add(wh, c - .2, .6)
add(snap, C['vert'] + .1, .6); add(pop, C['leucht'], .5); add(pop, C['wenn'] + .2, .5); add(snap, C['stell'] + .1, .7); add(ding, C['defekt'], .8)
sfx = sfx / (np.abs(sfx).max() + 1e-9) * .89
with wave.open(f'{job}/sfx2.wav', 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((sfx * 32767).astype(np.int16).tobytes())
# music: cut out after the record scratch, back in on the explanation
mute = 'volume=1'
fc = (f"[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},{mute},volume=0.22[m];[m][v2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.13[s];"
      f"[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx2.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/FBH_Teil1_Raum_bleibt_kalt.mp4'], check=True)
print('DONE')
