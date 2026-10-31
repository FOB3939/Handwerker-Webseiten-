#!/usr/bin/env python3
"""Cartoon reel 'Heizung auf fünf' (heiz5.html): python3 make_heiz5.py [--stills]  (needs jobs/heiz5/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys, wave
import numpy as np
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/heiz5'
words = [w for w in json.load(open(f'{job}/words.json')) if not w['text'].startswith('[') and not w['text'].endswith(']') and w['text'] not in ('clear', 'explainer')]
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
def find(pre, after=0.0, exact=False):
    return next(w['start'] for w in words if w['start'] >= after and (norm(w['text']) == pre if exact else norm(w['text']).startswith(pre)))
TOTAL = 30.0
C = {'total': TOTAL, 'klingt': find('klingt'), 'nach': find('nach'), 'turbo': find('turbo'), 'ist': find('ist', exact=True) - .02,
     'ein': find('ein', exact=True) - .05, 'gew': find('gewünscht'), 'ist2': find('ist', 8, True) - .05, 'ventil': find('ventil'),
     'genauso': find('genauso'), 'fuenf': find('fünf', 10) - .05, 'laenger': find('länger'), 'desh': find('deshalb') - .05,
     'wunsch': find('wunschtemp'), 'hk': find('heizkörper', 22), 'das': find('das', 24) - .1, 'tropen': find('tropen'), 'endc': 27.3}
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words]
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 112, 'fade': 2.5, 'scenes': [0, C['ein']], 'items': []}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='heiz5.html')
if '--stills' in sys.argv:
    ts = [0.9, 2.0, C['klingt'] + .2, C['ist'] + .5, C['gew'] + .6, C['ist2'] + 1.0, C['genauso'] + .5, C['laenger'] + .5, 19.9,
          C['wunsch'] + .5, C['hk'] + .9, C['das'] + 1.0, C['tropen'] + .5, 29.5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'heiz5'], check=True)
# custom cartoon sfx
SR = 44100; N = int(SR * TOTAL); rng = np.random.default_rng(5); sfx = np.zeros(N)
def add(sig, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig)); sfx[i:j] += sig[:j - i] * g
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y
x = tt(.25); click = np.sin(2 * np.pi * 1800 * x) * np.exp(-x * 60)
for k in range(5): add(click, .5 + k * .12, .5)                                  # dial clicks to 5
d = C['ist'] - 1.2; x = tt(d); rum = lp(rng.standard_normal(len(x)), .05) * 3 * np.minimum(1, x / .3)  # rocket rumble
add(rum * (1 + .3 * np.sin(2 * np.pi * 9 * x)), 1.2, .9)
x = tt(.18); beep = np.sin(2 * np.pi * 880 * x) * np.exp(-x * 10)
for c, f in ((C['klingt'], 1), (C['nach'], 1), (C['turbo'], 1.5)): add(np.sin(2 * np.pi * 880 * f * x) * np.exp(-x * 10), c, .6)
x = tt(.55); scratch = np.sin(2 * np.pi * np.cumsum(900 + 700 * np.sin(2 * np.pi * 6 * x)) / SR) * lp(rng.standard_normal(len(x)), .3) * 4 * np.exp(-x * 4)
add(scratch, C['ist'], .9)
x = tt(.35); pop = np.sin(2 * np.pi * (300 * x + 900 * x * x)) * np.exp(-x * 14)
for c in (C['ist'] + .25, C['gew'], C['ist2'], C['genauso'], C['laenger'], C['wunsch'], C['hk']): add(pop, c, .55)
x = tt(.9); ding = (np.sin(2 * np.pi * 1318 * x) + .5 * np.sin(2 * np.pi * 1975 * x)) * np.exp(-x * 5) * .3
R1 = C['genauso'] + .1 + 2.4; add(ding, R1, .8); add(ding, R1 + 3.85, .8); add(ding, C['endc'] + .4, .7)
x = tt(.5); wh = lp(rng.standard_normal(len(x)), .15) * np.sin(np.pi * x / .5) ** 2
for c in (C['ein'], C['ist2'], C['desh'], C['das'], C['endc']): add(wh, c - .25, .8)
for k in range(6):                                                                 # jungle birds
    x = tt(.22); add(np.sin(2 * np.pi * np.cumsum(2400 + 900 * np.sin(2 * np.pi * 14 * x)) / SR) * np.sin(np.pi * x / .22), C['das'] + .5 + k * .42, .35)
sfx = sfx / (np.abs(sfx).max() + 1e-9) * .89
with wave.open(f'{job}/sfx2.wav', 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((sfx * 32767).astype(np.int16).tobytes())
# music: cut out after the record scratch, back in on the explanation
mute = f"volume='if(between(t,{C['ist']:.2f},{C['ein'] + .3:.2f}),0.05,1)':eval=frame"
fc = (f"[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},{mute},volume=0.22[m];[m][v2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.13[s];"
      f"[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx2.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Heizung_auf_5_schneller_warm.mp4'], check=True)
print('DONE')
