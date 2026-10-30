#!/usr/bin/env python3
"""FOB fun-fact reel 'tropfender Wasserhahn' (tropf.html): python3 make_tropf.py [--stills]  (needs jobs/tropf/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys, wave
import numpy as np
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/tropf'
words = json.load(open(f'{job}/words.json')); words = words.get('words', words) if isinstance(words, dict) else words
words = [w for w in words if w.get('type', 'word') == 'word']
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
find = lambda pre, after=0.0: next(w['start'] for w in words if w['start'] >= after and norm(w['text']).startswith(pre))
TOTAL = round(words[-1]['end'] + 2.4, 2)
def onsets(t_end):  # word onsets from the audio itself (transcript timings of the repeated "Tropf" are unreliable)
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f'{job}/vo.mp3', '-t', str(t_end), '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(float); w = 320
    e = np.array([np.sqrt((x[i:i + w] ** 2).mean()) for i in range(0, len(x) - w, w)]); on = e > e.max() * .05
    res, i = [], 0
    while i < len(on):
        if on[i]:
            j = i
            while j + 1 < len(on) and (on[j + 1] or (j + 2 < len(on) and on[j + 2])): j += 1
            if (j - i + 1) * .02 >= .06: res.append(round(i * .02, 2))
            i = j + 1
        else: i += 1
    return res
drips = onsets(find('ein') - .05)[:3]
C = {'total': TOTAL, 'drips': drips}
C['s2'] = find('ein') - .1; C['six'] = find('sechstausend')
C['s3'] = find('das', C['six']) - .1; C['vierzig'] = find('vierzig')
C['s4'] = find('nur') - .1; C['nicht'] = find('nicht', C['s4'])
C['s5'] = find('unser') - .1; C['fix'] = find('dicht')
C['s6'] = find('folgen') - .1; C['tap'] = C['s6'] + .9
C['hits'] = [C['six'], C['vierzig'], C['nicht'], C['fix']]
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words if not w['text'].startswith('[') and not w['text'].endswith(']') and w['text'] != '…']
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 112, 'fade': 2.0, 'scenes': [C['s2'], C['s2'], C['s3'], C['s4'], C['s5'], C['s6']],
           'items': [[C['six']], [C['vierzig']], [C['fix']], [C['tap']]]}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='tropf.html')
if '--stills' in sys.argv:
    ts = [drips[-1] + .2, C['six'] + .5, C['vierzig'] + .5, C['nicht'] + .5, C['fix'] + .5, TOTAL - .5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
# drip "plip" sounds: on each spoken Tropf and every 0.5 s while the counter runs
SR = 44100; N = int(SR * TOTAL); dr = np.zeros(N)
def plip(t0, g=1.0):
    n = int(.12 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (1400 * tt - 3500 * tt * tt)) * np.exp(-tt * 38) * g
    i = int(t0 * SR); j = min(N, i + n)
    if 0 <= i < N: dr[i:j] += s[:j - i]
for d in drips: plip(d, 1.0)
t = C['s2'] + .45
while t < C['s3']: plip(t, .55); t += .5
plip(C['s5'] + .65, .8)
with wave.open(f'{job}/drip.wav', 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((dr / (np.abs(dr).max() + 1e-9) * .8 * 32767).astype(np.int16).tobytes())
if not os.path.exists(f'{job}/frames/f00000.jpg') or '--render' in sys.argv: subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'tropf'], check=True)
fc = (f"[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.28,afade=t=in:st={C['s2'] - .3:.2f}:d=0.4[m0];"
      f"[m0][v2]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.32[s];"
      f"[4:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.9[d];"
      f"[v1][md][s][d]amix=inputs=4:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav', '-i', f'{job}/drip.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/FOB_Fakt_Tropfender_Wasserhahn.mp4'], check=True)
print('DONE')
