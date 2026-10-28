#!/usr/bin/env python3
"""Autohaus Bruck ad (bruck.html), exactly 38 s: python3 make_bruck.py [--stills]"""
import json, os, re, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/bruck'
TOTAL = 38.0
# (file, start time, tempo, text) – one voice segment per scene of the cut plan
SEG = [('s1', .10, 1.0, 'Du willst dein Auto verkaufen? Dann komm zu Autohaus Bruck!'),
       ('s2', 4.20, 1.0, 'Dein Ansprechpartner für den Autoankauf in Fürstenfeldbruck.'),
       ('s3', 9.10, 1.0, 'Wir bewerten dein Fahrzeug fair und transparent. Auch wenn du bei uns kein anderes Auto kaufst.'),
       ('s4', 15.20, 1.0, 'Sende uns deine Fahrzeugdaten. Nach der Begutachtung vor Ort treffen wir sofort eine Kaufentscheidung.'),
       ('s5', 22.10, 1.15, 'Bei Einigung folgt die schnelle Auszahlung. Frag jetzt unverbindlich an – per WhatsApp, telefonisch oder online.'),
       ('s6', 28.70, 1.0, 'Autohaus Bruck, Rudolf-Diesel-Ring 2 in Fürstenfeldbruck. Schreib uns jetzt und biete uns dein Auto an!')]
def speech(path):
    out = subprocess.run(['ffmpeg', '-i', path, '-af', 'silencedetect=n=-40dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]))
    st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]
    en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
    pauses = [(s, e) for s, e in zip(st, en) if e < dur - .05]
    end = st[-1] if st and (len(en) < len(st) or en[-1] >= dur - .05) else dur
    return pauses, end
caps, inputs, filt = [], [], []
for i, (n, t0, tempo, text) in enumerate(SEG):
    pauses, end = speech(f'{job}/{n}.mp3')
    # spread words over the spoken parts (pauses removed), weighted by length
    spans, cur = [], 0.0
    for s, e in pauses: spans.append((cur, s)); cur = e
    spans.append((cur, end))
    words = text.split(); sents = re.split(r'(?<=[.?!:–,])\s+', text)
    # assign sentences to spans in order (extra sentences share the last span)
    groups = [[] for _ in spans]; si = 0
    for k, snt in enumerate(sents): groups[min(k, len(spans) - 1)].extend(snt.split())
    for (a, b), ws in zip(spans, groups):
        if not ws: continue
        wt = [len(w) + 2 for w in ws]; tot = sum(wt); x = a
        for w, q in zip(ws, wt):
            d = (b - a) * q / tot
            caps.append({'text': w, 'start': round(t0 + x / tempo, 3), 'end': round(t0 + (x + d * .92) / tempo, 3)}); x += d
    inputs += ['-i', f'{job}/{n}.mp3']
    filt.append(f'[{i}:a]aresample=44100,atempo={tempo},adelay={int(t0*1000)}|{int(t0*1000)}[v{i}]')
filt.append(''.join(f'[v{i}]' for i in range(len(SEG))) + f'amix=inputs={len(SEG)}:normalize=0:duration=longest,apad,atrim=0:{TOTAL}[vo]')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(filt), '-map', '[vo]', '-ac', '1', f'{job}/vo.wav'], check=True)
w = {c['text']: c['start'] for c in caps}
first = lambda word, after=0: next(c['start'] for c in caps if c['text'].startswith(word) and c['start'] >= after)
C = {'total': TOTAL, 'c1': 9.4, 'c2': max(11.9, first('Auch') - .2), 'd1': 15.4, 'd2': first('Nach') - .1, 'd3': first('treffen') - .1,
     'e2': first('Frag') - .1, 'e3': first('WhatsApp') - .3}
json.dump({'total': TOTAL, 'bpm': 120, 'fade': 3.5, 'scenes': [0, 4, 9, 15, 22, 25, 28],
           'items': [[], [], [C['c1'], C['c2']], [C['d1'], C['d2'], C['d3']], [], [C['e2']], []]}, open(f'{job}/cues.json', 'w'))
with open(f'{job}/data.js', 'w') as f:
    f.write('window.CUES=' + json.dumps(C) + ';\nwindow.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='bruck.html')
if '--stills' in sys.argv:
    subprocess.run(['node', f'{KIT}/render.js', job, '30', '2.6,6.8,13.5,21,24,26.5,33,37.9'], check=True, env=env); sys.exit()
if '--mux' not in sys.argv: subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'bruck'], check=True)
fc = (f"[1:a]pan=stereo|c0=c0|c1=c0,aresample=44100,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.26[m];[m][v2]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.30[s];"
      f"[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.wav',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-r', '30', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Autohaus_Bruck_Wir_kaufen_dein_Auto_38s.mp4'], check=True)
print('DONE')
