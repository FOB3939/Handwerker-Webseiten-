#!/usr/bin/env python3
"""Music bed + sound effects for a reel: python3 audio.py <cues.json> <out_dir> <seed-string>"""
import json, sys, wave, zlib
import numpy as np
cues = json.load(open(sys.argv[1])); out = sys.argv[2]
seed = zlib.crc32(sys.argv[3].encode())
rng = np.random.default_rng(seed)
SR = 44100; T = cues['total']; N = int(SR * T)
mus = np.zeros(N); sfx = np.zeros(N)
def add(buf, sig, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if 0 <= i < N: buf[i:j] += sig[:j - i] * g
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y
PROGS = [  # (bass roots Hz, triads Hz)
 ([55.0, 43.65, 65.41, 49.0], [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 261.6, 329.6], [196, 246.9, 293.7]]),
 ([49.0, 41.2, 55.0, 43.65], [[196, 246.9, 293.7], [164.8, 207.7, 246.9], [220, 277.2, 329.6], [174.6, 220, 261.6]]),
 ([41.2, 55.0, 49.0, 61.74], [[164.8, 196, 246.9], [220, 261.6, 329.6], [196, 246.9, 293.7], [185, 246.9, 293.7]]),
]
roots, chords = PROGS[seed % len(PROGS)]
bpm = [112, 116, 120, 124][seed // 7 % 4]; beat = 60 / bpm; bar = 4 * beat
t = np.arange(int(.35 * SR)) / SR
kick = np.sin(2 * np.pi * (45 * t + (110 / 18) * (1 - np.exp(-t * 18)))) * np.exp(-t * 7)
hn = rng.standard_normal(int(.06 * SR)); hat = np.diff(np.concatenate([[0], hn])) * np.exp(-np.arange(len(hn)) / SR * 60) * .35
cn = rng.standard_normal(int(.18 * SR)); clap = lp(cn, .35) * np.exp(-np.arange(len(cn)) / SR * 22) * .6
intro = cues['scenes'][1] if len(cues['scenes']) > 1 else 3
for b in range(int(T / bar) + 1):
    t0 = b * bar; ci = b % 4
    n = int(bar * SR); tt = np.arange(n) / SR
    pad = sum(np.sin(2 * np.pi * f * tt + np.sin(2 * np.pi * .3 * tt) * .4) + .3 * np.sin(2 * np.pi * 2 * f * tt) for f in chords[ci])
    add(mus, pad * np.minimum(1, tt / .4) * np.minimum(1, (bar - tt) / .3) * .05, t0)
    for k in range(8):
        n = int(beat / 2 * SR); tt = np.arange(n) / SR; f = roots[ci] * (2 if k % 4 == 3 else 1)
        add(mus, (np.sign(np.sin(2 * np.pi * f * tt)) * .5 + np.sin(2 * np.pi * f * tt)) * np.exp(-tt * 6) * .16, t0 + k * beat / 2)
    for k in range(4):
        tb = t0 + k * beat
        if tb < intro and k % 2: continue
        add(mus, kick, tb, .9)
        if tb >= intro and k % 2 == 1: add(mus, clap, tb, .8)
        add(mus, hat, tb + beat / 2)
        if tb >= intro: add(mus, hat, tb + beat * .75, .5)
fo = np.ones(N); i = int((T - 1.8) * SR); fo[i:] = np.linspace(1, 0, N - i); mus *= fo
def whoosh(d=.55, up=True):
    n = int(d * SR); x = rng.standard_normal(n); tt = np.arange(n) / SR
    a = np.linspace(.02, .25, n) if up else np.linspace(.25, .02, n)
    y = np.zeros(n); acc = 0.0
    for k in range(n): acc += a[k] * (x[k] - acc); y[k] = acc
    return y * np.sin(np.pi * tt / d) ** 2 * 1.2
def impact(g=1.0):
    n = int(SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * (38 * tt + 9 * (1 - np.exp(-tt * 10)))) * np.exp(-tt * 4.5) + rng.standard_normal(n) * np.exp(-tt * 30) * .5) * g
def ding():
    n = int(.8 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1318 * tt) + .5 * np.sin(2 * np.pi * 1975 * tt)) * np.exp(-tt * 5) * .25
W = whoosh()
add(sfx, impact(.6), 0)
for s in cues['scenes'][1:]:
    add(sfx, W, s - .3, .7); add(sfx, impact(.55), s + .05)
for its in cues['items']:
    for ti in its: add(sfx, ding(), ti - .05, .45)
def wr(name, x):
    x = x / (np.abs(x).max() + 1e-9) * .89
    with wave.open(f'{out}/{name}', 'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((x * 32767).astype(np.int16).tobytes())
wr('music.wav', mus); wr('sfx.wav', sfx)
