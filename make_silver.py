#!/usr/bin/env python3
"""Silver Stage image reel (silver.html): python3 make_silver.py [--stills|--mux]"""
import json, os, re, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/silver'
words = json.load(open(f'{job}/words.json')); words = words.get('words', words) if isinstance(words, dict) else words
words = [w for w in words if w.get('type', 'word') == 'word']
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
def find(prefix, after=0.0):
    return next(w['start'] for w in words if w['start'] >= after and norm(w['text']).startswith(prefix))
end = words[-1]['end']
b_will = find('willkommen'); b_buhne = find('eine'); b_ton = find('ein', b_buhne + .5); b_pro = find('profi')
b_raum = find('und', b_pro); b_fin = find('silver', b_raum); CTA = find('jetzt', b_fin)
TOTAL = round(end + 4.5, 2)
# segments: (start, end, shots[(img, mode, from, to)], kicker, headline)
SEG = [(0, b_will - .1, [('truss', 'cover', .1, .45), ('drums', 'cover', .55, .3), ('piano', 'cover', .45, .7)], '', ''),
       (b_buhne - .1, b_ton - .1, [('stage', 'cover', .2, .6), ('stage_mixer', 'cover', .55, .25), ('mixer_stage', 'cover', .3, .6)], 'Live', 'Echte <b>Bühne</b><br>Sound &amp; Licht'),
       (b_ton - .1, b_pro - .1, [('control', 'cover', .25, .55), ('booth', 'cover', .5, .3), ('mic', 'cover', .62, .62)], 'Recording', 'Dein <b>Tonstudio</b>'),
       (b_pro - .1, b_raum - .1, [('mixer_yamaha', 'fit'), ('rack', 'cover', .55, .75), ('tubetech', 'fit')], 'Equipment', 'Profi-<b>Equipment</b>'),
       (b_raum - .1, b_fin - .1, [('dance2', 'cover', .15, .5), ('room_drums', 'cover', .65, .35), ('dance1', 'cover', .3, .6)], 'Space', 'Proben · Tanz<br><b>Events</b>')]
shots, segs = [], []
for t0, t1, sh, k, h in SEG:
    n = len(sh); d = (t1 - t0) / n
    for i, s in enumerate(sh):
        e = {'img': s[0], 'mode': s[1], 't0': round(t0 + i * d, 3), 't1': round(t0 + (i + 1) * d, 3)}
        if s[1] == 'cover': e.update({'from': s[2], 'to': s[3], 'zoom': s[2] == s[3]})
        shots.append(e)
    segs.append({'t0': t0, 't1': t1, 'k': k, 'h': h})
# logo reveal 1 (Willkommen) over blurred stage; final logo card from b_fin to end
shots.insert(3, {'img': 'stage', 'mode': 'fit', 't0': round(b_will - .1, 3), 't1': round(b_buhne - .1, 3), 'top': 690})
shots.append({'img': 'stage', 'mode': 'fit', 't0': round(b_fin - .1, 3), 't1': TOTAL, 'top': 690})
LOGOS = [[b_will - .1, b_buhne - .1, False], [b_fin - .1, TOTAL + 1, True]]
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words]
with open(f'{job}/data.js', 'w') as f:
    f.write(f'window.SHOTS={json.dumps(shots)};window.SEGS={json.dumps(segs)};window.LOGOS={json.dumps(LOGOS)};'
            f'window.TOTAL={TOTAL};window.END={b_fin - .1};window.CTA={CTA};window.CAPS={json.dumps(caps, ensure_ascii=False)};\n')
json.dump({'total': TOTAL, 'bpm': 120, 'fade': 3.0, 'scenes': sorted({s['t0'] for s in shots}), 'items': [[CTA]]}, open(f'{job}/cues.json', 'w'))
print('TOTAL', TOTAL, [round(s['t0'], 2) for s in shots])
env = dict(os.environ, REEL_HTML='silver.html')
if '--stills' in sys.argv:
    ts = [s['t0'] + (s['t1'] - s['t0']) * .7 for s in shots[::2]] + [TOTAL - .3]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
if '--mux' not in sys.argv: subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'silver'], check=True)
fc = (f"[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.30[m];[m][v2]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.30[s];"
      f"[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Silver_Stage_Reel.mp4'], check=True)
print('DONE')
