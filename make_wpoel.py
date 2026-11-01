#!/usr/bin/env python3
"""Reel 'Wärmepumpe vs. Ölheizung' (wpoel.html): python3 make_wpoel.py [--stills]  (needs jobs/wpoel/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys, wave
import numpy as np
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/wpoel'
words = [w for w in json.load(open(f'{job}/words.json')) if True]
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
def find(pre, after=0.0, exact=False):
    return next(w['start'] for w in words if w['start'] >= after and (norm(w['text']) == pre if exact else norm(w['text']).startswith(pre)))
TOTAL = 30.0
C = {'total': TOTAL, 'oel': find('die', exact=True) - .1, 'tank': find('tank'), 'lief': find('lieferungen'), 'abg': find('abgasen'),
     'wp': find('die', 8, True) - .1, 'aussen': find('außenluft'), 'minus': find('minusgraden'), 'verd': find('verdichter'), 'heiz': find('heiztemperatur'),
     'so': find('so', 15, True) - .1, 'drei': find('drei'), 'ob': find('ob', exact=True) - .1, 'daem': find('dämmung'), 'hfl': find('heizflächen'),
     'pruef': find('fachlich'), 'endc': round(words[-1]['end'] + .3, 2)}
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words]
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 112, 'fade': 2.5, 'scenes': [0, C['oel'], C['wp'], C['so'], C['ob']], 'items': []}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='wpoel.html')
if '--stills' in sys.argv:
    ts = [0.9, C['tank'] + .4, C['abg'] + .6, C['aussen'] + .5, C['minus'] + .6, C['verd'] + 1.0, C['heiz'] + .6, C['drei'] + 1.2, C['hfl'] + .8, C['pruef'] + .6, 29.5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'wpoel'], check=True)
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
add(wh, 0, .6); add(pop, .55, .5)
for c in (C['oel'], C['wp'], C['so'], C['ob']): add(wh, c - .2, .6)
for c in (C['tank'], C['lief'], C['abg'], C['aussen'], C['minus'], C['verd'], C['drei'], C['daem'], C['hfl'], C['pruef']): add(pop, c, .45)
x = tt(1.4); fire = lp(rng.standard_normal(len(x)), .08) * np.sin(np.pi * x / 1.4) * 2
add(fire, C['oel'] + .3, .35)                                                          # burner whoosh
x = tt(1.0); truck = lp(rng.standard_normal(len(x)), .03) * 3 * np.sin(np.pi * x)
add(truck, C['lief'] - .1, .4)
d = C['so'] - C['wp']; x = tt(d); fan = lp(rng.standard_normal(len(x)), .06) * 1.5 * np.minimum(1, x / .4) * np.minimum(1, (d - x) / .4)
add(fan, C['wp'], .25)                                                                  # fan hum
x = tt(.9); ding = (np.sin(2 * np.pi * 1318 * x) + .5 * np.sin(2 * np.pi * 1975 * x)) * np.exp(-x * 5) * .3
add(ding, C['drei'] + .3, .7); add(ding * .7, C['endc'] + .3, .7)
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
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Waermepumpe_vs_Oelheizung.mp4'], check=True)
print('DONE')
