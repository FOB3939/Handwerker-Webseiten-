#!/usr/bin/env python3
"""Build the heat-pump reel (wp.html): python3 make_wp.py <job_dir> [--stills]"""
import json, os, re, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__))
job = os.path.abspath(sys.argv[1]); stills = '--stills' in sys.argv
words = json.load(open(f'{job}/words.json')); words = words.get('words', words) if isinstance(words, dict) else words
words = [w for w in words if w.get('type', 'word') == 'word']
norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())
def find(prefix, after=0.0):
    for w in words:
        if w['start'] >= after and norm(w['text']).startswith(prefix):
            return w['start']
    raise SystemExit(f'cue not found: {prefix}')
C = {}
C['co2'] = find('der', find('geld'))
C['loesung'] = find('die', find('heizkosten'))
C['viessmann'] = find('viessmann'); C['holt'] = find('holt')
C['vorher'] = find('vorher'); C['jetzt1'] = find('jetzt', C['vorher'])
C['b1'] = find('niedrig'); C['b2'] = find('unabh'); C['b3'] = find('klima')
C['proc'] = find('so', C['b3']); C['p1'] = find('kostenlos', C['proc']); C['p2'] = find('planung')
C['p3'] = find('hilfe'); C['p4'] = find('einbau'); C['p4b'] = find('deutschlandweit')
C['kfw'] = find('über', C['p4b']); C['pct'] = find('siebzig'); C['feb'] = find('aber', C['pct'])
C['pack'] = find('ob', C['feb']); C['komplett'] = find('komplettpaket')
C['cta'] = find('jetzt', C['komplett']); C['url'] = find('fob', C['cta'])
C['total'] = round(words[-1]['end'] + 2.8, 2)
# written forms for captions
caps, k = [], 0
while k < len(words):
    w = words[k]; n = norm(w['text'])
    if n.startswith('fobfm') and k + 2 < len(words):
        caps.append({'text': 'fob-fm.de', 'start': w['start'], 'end': words[k + 2]['end']}); k += 3; continue
    if n == 'siebzig' and k + 1 < len(words):
        caps.append({'text': '70 %', 'start': w['start'], 'end': words[k + 1]['end']}); k += 2; continue
    t = w['text'].replace('zweitausendsiebenundzwanzig', '2027')
    caps.append({'text': t, 'start': w['start'], 'end': w['end']}); k += 1
json.dump({'total': C['total']}, open(f'{job}/cues.json', 'w'))
with open(f'{job}/data.js', 'w') as f:
    f.write('window.CUES=' + json.dumps(C) + ';\nwindow.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
print(json.dumps(C))
# audio cues for the shared audio.py (scene starts + item dings)
sc = [0, C['co2'], C['loesung'], C['vorher'], C['proc'], C['kfw'], C['pack'], C['cta']]
items = [[], [], [C['viessmann']], [C['b1'], C['b2'], C['b3']], [C['p1'], C['p2'], C['p3'], C['p4']], [C['feb']], [C['komplett']], [C['url']]]
json.dump({'scenes': [0] + [s - .15 for s in sc[1:]], 'items': items, 'total': C['total']}, open(f'{job}/audio_cues.json', 'w'))
env = dict(os.environ, REEL_HTML='wp.html')
if stills:
    ts = [3.5, C['co2'] + 2.5, C['loesung'] + 4.5, C['proc'] - .6, C['p4b'] + .5, C['pack'] - .5, C['pack'] + 3.5, C['total'] - 1.2]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/audio_cues.json', job, 'waermepumpe'], check=True)
fc = ("[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-16:TP=-1.5,apad,asplit[v1][v2];"
      "[2:a]pan=stereo|c0=c0|c1=c0,volume=0.30[m];[m][v2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];"
      "[3:a]pan=stereo|c0=c0|c1=c0,volume=0.40[s];[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/vo.mp3',
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(C['total']), '-movflags', '+faststart', f'{job}/reel.mp4'], check=True)
print('DONE', f'{job}/reel.mp4')
