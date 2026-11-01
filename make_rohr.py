#!/usr/bin/env python3
"""Reel 'Rohrbruch – was jetzt?' (rohr.html): python3 make_rohr.py [--stills]  (needs jobs/rohr/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys, wave
import numpy as np
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/rohr'
words = [w for w in json.load(open(f'{job}/words.json')) if True]
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
def find(pre, after=0.0, exact=False):
    return next(w['start'] for w in words if w['start'] >= after and (norm(w['text']) == pre if exact else norm(w['text']).startswith(pre)))
TOTAL = 30.0
C = {'total': TOTAL, 'erst': find('erstens') - .1, 'hah': find('hauptabsperrhahn'), 'zaehl': find('wasserzähler'), 'zweit': find('zweitens') - .1,
     'sich': find('sicherung'), 'aber': find('aber'), 'dritt': find('drittens') - .1, 'fotos': find('fotos'), 'videos': find('videos'),
     'viert': find('viertens') - .1, 'verm': find('vermieter'), 'und': find('und', 20, True) - .1, 'haupt2': find('hauptabsperrhahn', 20),
     'speich': find('speichern'), 'endc': round(words[-1]['end'] + .3, 2)}
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words]
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 112, 'fade': 2.5, 'scenes': [0, C['erst']], 'items': []}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='rohr.html')
if '--stills' in sys.argv:
    ts = [0.9, C['hah'] + 1.6, C['zaehl'] + .4, C['aber'] + .5, C['fotos'] + .1, C['videos'] + .8, C['verm'] + .5, C['haupt2'] + .3, C['speich'] + .6, 29.5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'rohr'], check=True)
# custom cartoon sfx
SR = 44100; N = int(SR * TOTAL); rng = np.random.default_rng(5); sfx = np.zeros(N)
def add(sig, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig)); sfx[i:j] += sig[:j - i] * g
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y
x = tt(.4); bang = lp(rng.standard_normal(len(x)), .5) * np.exp(-x * 14) * 2
add(bang, 0, .8)                                                                        # burst
d = C['hah'] + 1.2; x = tt(d); hiss = (lp(rng.standard_normal(len(x)), .4) * .9) * np.minimum(1, x / .1) * np.minimum(1, (d - x) / .8)
add(hiss, .05, .35)                                                                     # spraying water
x = tt(.7); al = np.sin(2 * np.pi * np.where((x * 6).astype(int) % 2 == 0, 880, 660) * x) * np.exp(-x * 1.5) * .4
add(al, .1, .45)                                                                        # short alarm
x = tt(.35); pop = np.sin(2 * np.pi * (300 * x + 900 * x * x)) * np.exp(-x * 14)
for c in (C['erst'], C['zweit'], C['dritt'], C['viert'], C['speich']): add(pop, c, .55)
x2 = tt(.12); snap = (np.sin(2 * np.pi * 1600 * x2) * np.exp(-x2 * 50) + rng.standard_normal(len(x2)) * np.exp(-x2 * 90) * .4)
add(snap, C['sich'], .7)                                                                # breaker
x = tt(.15); shutter = rng.standard_normal(len(x)) * np.exp(-x * 40) * .6
add(shutter, C['fotos'], .7); add(shutter, C['videos'], .5)
x = tt(1.2); ring = np.sin(2 * np.pi * 1200 * x) * np.sin(2 * np.pi * 20 * x) * (x < .9) * .35
add(ring, C['viert'] + .3, .5)
x = tt(.9); ding = (np.sin(2 * np.pi * 1318 * x) + .5 * np.sin(2 * np.pi * 1975 * x)) * np.exp(-x * 5) * .3
add(ding, C['hah'] + 1.4, .7); add(ding * .7, C['endc'] + .3, .7)
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
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Rohrbruch_was_jetzt.mp4'], check=True)
print('DONE')
