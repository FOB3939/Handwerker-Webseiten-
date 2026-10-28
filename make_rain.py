#!/usr/bin/env python3
"""Build the 'Gehen vs. Rennen' reel (rain.html): python3 make_rain.py <job_dir> [--stills]"""
import json, os, re, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__))
job = os.path.abspath(sys.argv[1]); stills = '--stills' in sys.argv
words = json.load(open(f'{job}/words.json')); words = words.get('words', words) if isinstance(words, dict) else words
words = [w for w in words if w.get('type', 'word') == 'word']
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
def find(prefix, after=0.0):
    for w in words:
        if w['start'] >= after and norm(w['text']).startswith(prefix): return w['start']
    raise SystemExit('cue not found: ' + prefix)
TOTAL = 30.0
C = {'total': TOTAL}
C['cut'] = find('rennen')                       # hard cut from face to the two people
C['s2'] = find('gleiche') - .1                   # split screen
C['s3'] = find('beim') - .1                      # schematic explanation
C['dafur'] = find('dafür')
C['s4'] = find('bei', C['dafur'] + .5) - .1      # resolution
C['win'] = find('weniger', C['s4'])
C['s5'] = find('der', C['win']) - .1             # conclusion
C['oben'] = find('oben', C['s5']) - .4
C['rew'] = find('also', C['s5']) - .1            # quick rewind to the start scene
C['fin'] = min(TOTAL - 2.6, find('ab', C['rew']) - .2)   # closing question
caps = [{'text': w['text'].replace('Hundert', '100'), 'start': w['start'], 'end': w['end']} for w in words]
json.dump({'total': TOTAL, 'scenes': [0, C['cut'], C['s2'], C['s3'], C['s4'], C['s5'], C['rew']], 'items': [[], [], [], [C['dafur']], [C['win']], [C['oben']], [C['fin']]]}, open(f'{job}/cues.json', 'w'))
with open(f'{job}/data.js', 'w') as f:
    f.write('window.CUES=' + json.dumps(C) + ';\nwindow.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
print(json.dumps(C))
env = dict(os.environ, REEL_HTML='rain.html')
if stills:
    ts = [1.2, C['cut'] + .8, C['s2'] + 2.5, C['s3'] + 3.5, C['s4'] + 3, C['s5'] + 1.5, C['rew'] + .4, TOTAL - .6]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'regen'], check=True)
fc = ("[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-16:TP=-1.5,apad,asplit[v1][v2];"
      "[2:a]pan=stereo|c0=c0|c1=c0,volume=0.24[m];[m][v2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];"
      "[3:a]pan=stereo|c0=c0|c1=c0,volume=0.38[s];"
      "anoisesrc=color=pink:amplitude=0.5:duration=30,highpass=f=500,lowpass=f=7000,volume=0.05,afade=t=out:st=28.5:d=1.5,pan=stereo|c0=c0|c1=c0[rn];"
      "[v1][md][s][rn]amix=inputs=4:normalize=0:duration=longest,alimiter=limit=0.95[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/reel.mp4'], check=True)
print('DONE', f'{job}/reel.mp4')
