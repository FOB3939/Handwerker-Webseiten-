#!/usr/bin/env python3
"""FOB Sanitär retention reel (sanitaer.html): python3 make_sanitaer.py [--stills]"""
import json, os, re, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/sanitaer'
words = json.load(open(f'{job}/words.json')); words = words.get('words', words) if isinstance(words, dict) else words
words = [w for w in words if w.get('type', 'word') == 'word']
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
find = lambda pre, after=0.0: next(w['start'] for w in words if w['start'] >= after and norm(w['text']).startswith(pre))
end = words[-1]['end']; TOTAL = round(end + 2.6, 2)
C = {'total': TOTAL}
C['hier'] = find('hier')
C['s2'] = find('ein', C['hier']) - .1
C['nichts'] = find('nichts')
C['s3'] = find('so', C['nichts']) - .1
C['parts'] = [find('füllventil'), find('ablaufventil'), find('schwimmerglocke')]
C['ent'] = find('entkalken'); C['burst'] = find('schmutz'); C['wieder'] = find('alles', C['burst']); C['druck'] = find('spüldruck')
C['s4'] = find('dazu') - .1
C['s5'] = find('ihr', C['s4']) - .1
C['s6'] = find('folgen') - .1
C['tap'] = find('folgen') + .9
C['url'] = find('fobfm')
C['hits'] = C['parts'] + [C['druck']]
caps, k = [], 0
while k < len(words):
    w = words[k]
    if norm(w['text']).startswith('fobfm') and k + 2 < len(words):
        caps.append({'text': 'fob-fm.de', 'start': w['start'], 'end': words[k + 2]['end']}); k += 3; continue
    caps.append({'text': w['text'], 'start': w['start'], 'end': w['end']}); k += 1
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
d4 = (C['s5'] - C['s4']) / 4
json.dump({'total': TOTAL, 'bpm': 124, 'fade': 2.2, 'scenes': [0, C['s2'], C['s3'], C['s4'], C['s4'] + d4, C['s4'] + 2 * d4, C['s4'] + 3 * d4, C['s5'], C['s6']],
           'items': [[C['hier']], [], C['parts'] + [C['druck']], [], [], [], [], [], [C['tap'], C['url']]]}, open(f'{job}/cues.json', 'w'))
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='sanitaer.html')
if '--stills' in sys.argv:
    ts = [C['hier'] + .8, C['nichts'] + .5, C['parts'][2] + .6, C['burst'] + .6, C['druck'] + .5, C['s4'] + .6, C['s5'] + 1.5, TOTAL - .5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'sanitaer'], check=True)
fc = (f"[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.30[m];[m][v2]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.36[s];"
      f"[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/FOB_Reel_Sanitaer_Spuelkasten.mp4'], check=True)
print('DONE')
