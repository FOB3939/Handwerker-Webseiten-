#!/usr/bin/env python3
"""Messenger reel 'Haustechnik Gruppenchat' (chat.html): python3 make_chat.py [--stills]  (needs jobs/chat/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys, wave
import numpy as np
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/chat'
words = [w for w in json.load(open(f'{job}/words.json')) if True]
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
def find(pre, after=0.0, exact=False):
    return next(w['start'] for w in words if w['start'] >= after and (norm(w['text']) == pre if exact else norm(w['text']).startswith(pre)))
TOTAL = 30.0
C = {'total': TOTAL, 'm1': find('ich', exact=True), 'm2': find('ich', 5.5, True), 'ty': find('und', 7.5, True), 'm3': find('bei', exact=True),
     'm4': find('ist', 11.5, True), 'early': find('dabei') - .1, 'trop': find('tropfen'), 'ger': find('geräusche'), 'stoer': find('störungen'),
     'last': find('das', 23, True), 'endc': round(words[-1]['end'] + .15, 2)}
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words]
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 112, 'fade': 2.5, 'scenes': [0, C['m1']], 'items': []}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='chat.html')
if '--stills' in sys.argv:
    ts = [0.3, 1.5, C['m1'] + .8, C['m2'] + .9, C['ty'] + .5, C['m3'] + .6, C['m4'] + 1.5, C['early'] + .8, C['stoer'] + .4, C['last'] + .6, 29.5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'chat'], check=True)
# custom cartoon sfx
SR = 44100; N = int(SR * TOTAL); rng = np.random.default_rng(5); sfx = np.zeros(N)
def add(sig, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig)); sfx[i:j] += sig[:j - i] * g
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y
x = tt(.5); note = lambda f1, f2: (np.sin(2 * np.pi * f1 * x) * np.exp(-x * 14) + np.sin(2 * np.pi * f2 * np.maximum(0, x - .09)) * np.exp(-np.maximum(0, x - .09) * 12) * (x > .09)) * .5
msg = note(988, 1319)
for c in (C['m1'], C['m2'], C['m3'], C['m4'], C['last']): add(msg, c - .15, .55)        # soft message tones
x = tt(.3); plop = np.sin(2 * np.pi * (900 * x - 1400 * x * x)) * np.exp(-x * 22)
add(plop, C['m1'] + .35 + .9, .6)                                                       # drip plop
x = tt(.7); squeak = np.sin(2 * np.pi * np.cumsum(1300 + 500 * np.sin(2 * np.pi * 3 * x) + 60 * np.sin(2 * np.pi * 40 * x)) / SR) * np.sin(np.pi * x / .7) * .35
add(squeak, C['m2'] + .3, .7)                                                           # door squeak
x = tt(.05); tick = rng.standard_normal(len(x)) * np.exp(-x * 120) * .25
for k in range(int((C['m3'] - C['ty']) / .16)): add(tick, C['ty'] + k * .16, .4)        # typing
x = tt(.35); pop = np.sin(2 * np.pi * (300 * x + 900 * x * x)) * np.exp(-x * 14)
for c in (C['early'], C['trop'], C['ger'], C['stoer']): add(pop, c, .5)
x = tt(.5); wh = lp(rng.standard_normal(len(x)), .15) * np.sin(np.pi * x / .5) ** 2
add(wh, .0, .6); add(wh, C['endc'] - .2, .6)
x = tt(.9); ding = (np.sin(2 * np.pi * 1318 * x) + .5 * np.sin(2 * np.pi * 1975 * x)) * np.exp(-x * 5) * .3
add(ding * .7, C['endc'] + .4, .7)
sfx = sfx / (np.abs(sfx).max() + 1e-9) * .89
with wave.open(f'{job}/sfx2.wav', 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((sfx * 32767).astype(np.int16).tobytes())
# music: cut out after the record scratch, back in on the explanation
mute = f"volume='if(between(t,{C['m4'] + .9:.2f},{C['early']:.2f}),0.08,1)':eval=frame"
fc = (f"[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},{mute},volume=0.22[m];[m][v2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.13[s];"
      f"[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx2.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Haustechnik_Gruppenchat.mp4'], check=True)
print('DONE')
