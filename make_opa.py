#!/usr/bin/env python3
"""Reel "Schlagen ist keine Reparatur" (opa.html) – 20 s, 1080x1920, sound effects + light music, no voice.
   python3 prepare_opa.py        # once: cut the reference image into layers
   python3 make_opa.py --stills  # check frames  -> jobs/opa/stills
   python3 make_opa.py           # full MP4       -> jobs/opa/Opa_Spuelung_Hammer.mp4"""
import json, os, subprocess, sys, wave
import numpy as np
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/opa'; TOTAL = 20.0
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps({'total': TOTAL}) + ';\n')
json.dump({'total': TOTAL, 'bpm': 112, 'fade': 2.0, 'scenes': [0, 3.0, 7.6, 10.2, 17.0], 'items': []}, open(f'{job}/cues.json', 'w'))
env = dict(os.environ, REEL_HTML='opa.html')
if '--stills' in sys.argv:
    subprocess.run(['node', f'{KIT}/render.js', job, '30', '0.5,3.5,4.0,5.8,7.3,8.2,9.4,11.3,11.95,12.5,15.9,18.8'], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'opa'], check=True)
SR = 44100; N = int(SR * TOTAL); rng = np.random.default_rng(7); sfx = np.zeros(N)
def add(sig, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig)); sfx[i:j] += sig[:j - i] * g
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y
# running water: filtered noise + bubbles, on 0–5.0 s and from 7.6 s
def water(d):
    x = tt(d); n = lp(rng.standard_normal(len(x)), .18) * 1.2
    bub = sum(np.sin(2 * np.pi * (500 + 300 * k) * x) * (np.sin(2 * np.pi * (3 + k) * x) > .92) for k in range(4)) * .05
    return (n + bub) * np.minimum(1, x / .15) * np.minimum(1, (d - x) / .15)
add(water(5.0), 0, .32); add(water(TOTAL - 7.6), 7.6, .32)
x = tt(.25); knock = (np.sin(2 * np.pi * 220 * x) * np.exp(-x * 30) + lp(rng.standard_normal(len(x)), .4) * np.exp(-x * 60)) * .9
for c in (4.0, 4.4, 4.8): add(knock, c, .8)                                   # three knocks on the plate
x = tt(.12); clap = lp(rng.standard_normal(len(x)), .5) * np.exp(-x * 40)
for c in (5.75, 5.95, 6.15): add(clap, c, .4)                                  # dusting off the hands
x = tt(.6); gurgle = sum(np.sin(2 * np.pi * (180 + 70 * k) * x) * np.exp(-((x - .12 * k) * 20) ** 2) for k in range(5)) * .5
add(gurgle, 7.6, .7)                                                           # water comes back
x = tt(.35); boing = np.sin(2 * np.pi * np.cumsum(300 + 400 * np.exp(-x * 6)) / SR) * np.exp(-x * 5) * .5
add(boing, 8.75, .7)                                                           # double take
x = tt(.4); shing = np.sin(2 * np.pi * np.cumsum(1200 + 2000 * x) / SR) * np.exp(-x * 7) * .35
add(shing, 10.2, .6)                                                           # hammer appears
x = tt(1.0); roll = lp(rng.standard_normal(len(x)), .3) * (np.sin(2 * np.pi * 28 * x) > 0) * np.minimum(1, x / .8) * .6
add(roll, 10.6, .45)                                                           # drum roll (dramatic pause)
x = tt(.3); wh = lp(rng.standard_normal(len(x)), .2) * np.sin(np.pi * x / .3) ** 2
add(wh, 11.6, .9)
x = tt(.7); bonk = (np.sin(2 * np.pi * (90 * x + 30 * (1 - np.exp(-x * 8)))) * np.exp(-x * 6) + sum(np.sin(2 * np.pi * f * x) for f in (870, 1340, 2110)) * np.exp(-x * 9) * .25)
add(bonk, 11.85, 1.0)                                                          # KRACK
x = tt(.08); tick = (np.sin(2 * np.pi * 2600 * x) + rng.standard_normal(len(x)) * .5) * np.exp(-x * 70) * .5
for c, g in ((12.2, .8), (12.38, .5), (12.5, .35), (12.58, .2)): add(tick, c, g)   # plastic piece bouncing
x = tt(.9); ding = (np.sin(2 * np.pi * 1318 * x) + .5 * np.sin(2 * np.pi * 1975 * x)) * np.exp(-x * 5) * .3
add(ding, 17.15, .7)
sfx = sfx / (np.abs(sfx).max() + 1e-9) * .89
with wave.open(f'{job}/sfx2.wav', 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((sfx * 32767).astype(np.int16).tobytes())
# music: quiet bed, drops out for the dramatic pause before the hammer hit
fc = (f"[1:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume='if(between(t,10.55,12.6),0.05,1)':eval=frame,volume=0.22[m];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.8[s];"
      f"[m][s]amix=inputs=2:normalize=0,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/music.wav', '-i', f'{job}/sfx2.wav',
                '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
                '-c:a', 'aac', '-b:a', '192k', '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Opa_Spuelung_Hammer.mp4'], check=True)
print('DONE')
