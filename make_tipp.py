#!/usr/bin/env python3
"""FOB tip reel 'WC rinnt' (tipp.html): python3 make_tipp.py [--stills]  (needs jobs/tipp-wc-rinnt/vo.mp3 + words.json)"""
import json, os, re, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/tipp-wc-rinnt'
words = json.load(open(f'{job}/words.json')); words = words.get('words', words) if isinstance(words, dict) else words
words = [w for w in words if w.get('type', 'word') == 'word']
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
find = lambda pre, after=0.0: next(w['start'] for w in words if w['start'] >= after and norm(w['text']).startswith(pre))
TOTAL = round(words[-1]['end'] + 2.4, 2)
C = {'total': TOTAL}
C['hier'] = find('rinnt') + .3
C['st'] = find('dann') - .1; C['ck'] = find('rufen')
C['s2'] = find('sonst') - .1; C['nichts'] = find('spüldruck')
C['s3'] = find('wir', C['s2']) - .1
C['sk'] = find('oder', C['s3']) - .1
d3 = C['sk'] - C['s3']  # tank sequence spread over the whole scene: out, descale, brush, back in, pressure
C['parts'] = [C['s3'] + d3 * x for x in (.06, .12, .18)]
C['ent'] = C['s3'] + d3 * .24; C['burst'] = C['s3'] + d3 * .46; C['wieder'] = C['s3'] + d3 * .68; C['druck'] = C['s3'] + d3 * .86
C['s6'] = find('folgen') - .1; C['tap'] = C['s6'] + .9; C['url'] = find('tipps')
C['hits'] = C['parts'] + [C['druck'], C['ck'], C['url']]
caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words]
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
json.dump({'total': TOTAL, 'bpm': 124, 'fade': 2.0, 'scenes': [0, C['st'], C['s2'], C['s3'], C['sk'], C['s6']],
           'items': [[C['hier']], [C['ck']], [C['nichts']], C['parts'] + [C['druck']], [], [C['tap'], C['url']]]}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='tipp.html')
if '--stills' in sys.argv:
    ts = [C['hier'] + .5, C['ck'] + .5, C['nichts'] + .5, C['parts'][2] + .6, C['burst'] + .5, C['sk'] + 1, TOTAL - .5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'tipp-wc'], check=True)
fc = (f"[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.30[m];[m][v2]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.36[s];"
      f"[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/FOB_Tipp_WC_rinnt.mp4'], check=True)
print('DONE')
