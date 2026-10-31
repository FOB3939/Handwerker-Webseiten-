#!/usr/bin/env python3
"""3D reel 'Bad: Platz an den falschen Stellen' (bad.html): python3 make_bad.py [--stills]  (needs jobs/bad/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys, wave
import numpy as np
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/bad'
words = [w for w in json.load(open(f'{job}/words.json')) if True]
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
def find(pre, after=0.0, exact=False):
    return next(w['start'] for w in words if w['start'] >= after and (norm(w['text']) == pre if exact else norm(w['text']).startswith(pre)))
TOTAL = 30.0
C = {'total': TOTAL, 'tuer': find('tür'), 'stau': find('stauraum'), 'dabei': find('dabei'), 'gleich': find('gleicher'), 'oeff': find('öffnet'),
     'wasch': find('waschtisch', 10), 'wc': find('wc'), 'dusche': find('dusche', 10), 'so': find('so', 18, True), 'freie': find('freie'),
     'hoch': find('hochschrank'), 'dusch2': find('dusche', 23), 'stau2': find('stauraum', 23), 'endc': 28.0}
C['was'] = round(C['hoch'] + 1.5, 2)
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words]
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 112, 'fade': 2.5, 'scenes': [0, C['gleich']], 'items': []}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='bad.html')
if '--stills' in sys.argv:
    ts = [0.9, C['tuer'] + .6, C['stau'] + .8, C['dabei'] + 1.8, C['gleich'] + 1.0, C['oeff'] + .8, C['wasch'] + .5, C['dusche'] + 1.2, C['freie'] + .6, C['hoch'] + .7, C['was'] + .8, C['stau2'] + .5, 29.5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'bad'], check=True)
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
x = tt(.6); thud = np.sin(2 * np.pi * (60 * x + 40 * (1 - np.exp(-x * 12)))) * np.exp(-x * 9)
add(wh, 0, .6); add(thud, .55, .8)                                                    # room drops in
x = tt(.35); pop = np.sin(2 * np.pi * (300 * x + 900 * x * x)) * np.exp(-x * 14)
add(pop, .6, .5)                                                                       # "?" pop
x = tt(.5); klonk = (np.sin(2 * np.pi * 180 * x) * np.exp(-x * 18) + lp(rng.standard_normal(len(x)), .3) * np.exp(-x * 40) * 2)
x2 = tt(.6); boing = np.sin(2 * np.pi * np.cumsum(220 + 120 * np.sin(2 * np.pi * 9 * x2) * np.exp(-x2 * 4)) / SR) * np.exp(-x2 * 5) * .5
add(klonk, C['tuer'] + .2, .9); add(boing, C['tuer'] + .25, .6)                        # door hits vanity
x = tt(.08); clk = rng.standard_normal(len(x)) * np.exp(-x * 80) * .5
for k in range(5): add(clk, C['stau'] + k * .09, .5)                                  # clutter clatter
add(wh, C['dabei'], .6)                                                                # camera turns
x = tt(.9); wuup = np.sin(2 * np.pi * np.cumsum(200 + 500 * x) / SR) * np.sin(np.pi * x / .9) * .45
add(wuup, C['gleich'], .7)                                                             # items float up
x = tt(.12); snap = (np.sin(2 * np.pi * 1600 * x) * np.exp(-x * 50) + rng.standard_normal(len(x)) * np.exp(-x * 90) * .4)
add(snap, C['oeff'] + .5, .6)
for c in (C['wasch'] + .95, C['wc'] + .95, C['dusche'] + .95): add(snap, c, .7); add(thud * .4, c, .5)   # snap into place
x = tt(.9); ding = (np.sin(2 * np.pi * 1318 * x) + .5 * np.sin(2 * np.pi * 1975 * x)) * np.exp(-x * 5) * .3
add(ding, C['freie'] + .1, .8)
add(snap, C['hoch'] + .2, .6); add(clk, C['hoch'] + .45, .6); add(clk, C['hoch'] + .6, .6)              # cabinet clack
add(wh, C['was'] - .2, .6); add(pop, C['dusch2'], .5); add(pop, C['stau2'], .5); add(ding * .7, C['endc'] + .4, .7)
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
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Bad_Platz_falsche_Stellen.mp4'], check=True)
print('DONE')
