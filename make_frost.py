#!/usr/bin/env python3
"""Reel 'Außenwasserhahn winterfest' (frost.html): python3 make_frost.py [--stills]  (needs jobs/frost/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys, wave
import numpy as np
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/frost'
words = [w for w in json.load(open(f'{job}/words.json')) if True]
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
def find(pre, after=0.0, exact=False):
    return next(w['start'] for w in words if w['start'] >= after and (norm(w['text']) == pre if exact else norm(w['text']).startswith(pre)))
TOTAL = 27.0
C = {'total': TOTAL, 'gefr': find('gefriert'), 'dehnt': find('dehnt'), 'besch': find('beschädigen'), 'desh': find('deshalb') - .1,
     'abs': find('absperrventil'), 'aussen': find('außenhahn'), 'entl': find('falls'), 'schl': find('schlauch'), 'auch': find('auch'),
     'endc': round(words[-1]['end'] + .3, 2)}
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words]
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 112, 'fade': 2.5, 'scenes': [0, C['desh']], 'items': []}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='frost.html')
if '--stills' in sys.argv:
    ts = [0.8, C['gefr'] + .8, C['besch'] + .5, C['abs'] + .6, C['aussen'] + 1.5, C['entl'] + 1.2, C['schl'] + .8, C['auch'] + 1.2, 26.5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'frost'], check=True)
# custom cartoon sfx
SR = 44100; N = int(SR * TOTAL); rng = np.random.default_rng(5); sfx = np.zeros(N)
def add(sig, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig)); sfx[i:j] += sig[:j - i] * g
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y
x = tt(1.6); wind = lp(rng.standard_normal(len(x)), .03) * 3 * np.sin(np.pi * x / 1.6)
add(wind, 0, .6); add(wind, 1.4, .4)                                                    # cold wind
x = tt(.6); crk = sum(np.sin(2 * np.pi * f * x) for f in (2200, 3100)) * np.exp(-x * 9) * .3
add(crk, C['gefr'] + .3, .5)                                                            # ice crackle
x = tt(.4); knack = lp(rng.standard_normal(len(x)), .5) * np.exp(-x * 18) * 2
add(knack, C['besch'], .9)                                                              # KNACK
x = tt(.5); wh = lp(rng.standard_normal(len(x)), .15) * np.sin(np.pi * x / .5) ** 2
add(wh, C['desh'] - .2, .6)
x = tt(.35); pop = np.sin(2 * np.pi * (300 * x + 900 * x * x)) * np.exp(-x * 14)
x2 = tt(.12); snap = (np.sin(2 * np.pi * 1600 * x2) * np.exp(-x2 * 50) + rng.standard_normal(len(x2)) * np.exp(-x2 * 90) * .4)
for c in (C['abs'], C['aussen'], C['entl'], C['schl'], C['auch']): add(pop, c, .5)
add(snap, C['abs'] + .6, .5); add(snap, C['aussen'] + .3, .5)
x = tt(1.6); trickle = lp(rng.standard_normal(len(x)), .25) * np.sin(np.pi * x / 1.6) * .8
add(trickle, C['aussen'] + .4, .6); add(trickle, C['entl'] + .3, .4)
x = tt(.9); ding = (np.sin(2 * np.pi * 1318 * x) + .5 * np.sin(2 * np.pi * 1975 * x)) * np.exp(-x * 5) * .3
add(ding * .7, C['endc'] + .3, .7)
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
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Aussenwasserhahn_winterfest.mp4'], check=True)
print('DONE')
