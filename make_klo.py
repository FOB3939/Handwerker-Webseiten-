#!/usr/bin/env python3
"""Cartoon reel 'Toilette ist kein Mülleimer' (klo.html): python3 make_klo.py [--stills]  (needs jobs/klo/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys, wave
import numpy as np
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/klo'
words = [w for w in json.load(open(f'{job}/words.json')) if True]
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
def find(pre, after=0.0, exact=False):
    return next(w['start'] for w in words if w['start'] >= after and (norm(w['text']) == pre if exact else norm(w['text']).startswith(pre)))
TOTAL = 30.0
C = {'total': TOTAL, 'gek': find('gekündigt'), 'grund': find('grund'), 'aufg': find('aufgaben'), 'feucht': find('feucht') - .05,
     'kr': find('küchenrolle'), 'katz': find('katzen'), 'nur': find('nur') - .1, 'spuel': find('spülen'), 'probl': find('problemlos'),
     'tp': find('toilettenpapier'), 'kr2': find('küchenrolle', 14), 'zus': find('zusammen'), 'genau': find('genau'), 'problem': find('problem', 18, True),
     'desh': find('deshalb') - .1, 'abf': find('abfälle'), 'muell': find('mülleimer'), 'dienst': find('dienstag'), 'endc': round(words[-1]['end'] + .2, 2)}
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words]
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 112, 'fade': 2.5, 'scenes': [0, C['nur']], 'items': []}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='klo.html')
if '--stills' in sys.argv:
    ts = [0.6, C['gek'] + .6, C['aufg'] + .6, C['kr'] + .7, C['katz'] + .9, C['spuel'] + .5, C['probl'] + .6, C['tp'] + .9, C['zus'] + .4, C['problem'] + .8, C['abf'] + .5, C['muell'] + 1.0, C['dienst'] + .3, 29.5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'klo'], check=True)
# custom cartoon sfx
SR = 44100; N = int(SR * TOTAL); rng = np.random.default_rng(5); sfx = np.zeros(N)
def add(sig, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig)); sfx[i:j] += sig[:j - i] * g
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y
x = tt(1.1); siren = np.sin(2 * np.pi * np.cumsum(np.where((x * 4).astype(int) % 2 == 0, 740, 587)) / SR) * np.minimum(1, x / .05) * np.minimum(1, (1.1 - x) / .2) * .5
add(siren, C['gek'], .6)                                                              # alarm
x = tt(.35); pop = np.sin(2 * np.pi * (300 * x + 900 * x * x)) * np.exp(-x * 14)
x2 = tt(.3); buzz = np.sign(np.sin(2 * np.pi * 140 * x2)) * np.exp(-x2 * 9) * .35
for c in (C['feucht'], C['kr'], C['katz']): add(pop, c, .6); add(buzz, c + .45, .5)   # pop + soft "nope"
add(pop, C['aufg'], .5)
x = tt(1.4); flush = lp(rng.standard_normal(len(x)), .12) * np.sin(np.pi * x / 1.4) ** 1.5 * 1.6
add(flush, C['spuel'] - .1, .9)                                                       # flush
for c in (C['probl'], C['tp'] + .4, C['zus'], C['problem']): add(pop, c, .5)
x = tt(.9); glug = sum(np.sin(2 * np.pi * (120 + 60 * k) * x) * np.exp(-((x - .2 * k) * 18) ** 2) for k in range(4)) * .6
add(glug, C['problem'] + .2, .8)                                                      # gurgle
x = tt(.5); wh = lp(rng.standard_normal(len(x)), .15) * np.sin(np.pi * x / .5) ** 2
for c in (C['nur'], C['desh'], C['endc']): add(wh, c - .2, .7)
for j in range(3): add(wh[:int(.35 * SR)], C['abf'] + j * .35, .5)
x = tt(.9); ding = (np.sin(2 * np.pi * 1318 * x) + .5 * np.sin(2 * np.pi * 1975 * x)) * np.exp(-x * 5) * .3
add(ding, C['muell'] + .3, .8); add(pop, C['dienst'] - .5, .5); add(ding * .7, C['endc'] + .5, .7)
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
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Toilette_ist_kein_Muelleimer.mp4'], check=True)
print('DONE')
