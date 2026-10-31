#!/usr/bin/env python3
"""Autopunkt Audi A5 reel with ORIGINAL video audio (ap_car2.html): python3 make_apcar2.py [--stills]"""
import json, os, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/ap_car2'; src = f'{KIT}/jobs/ap_car'
SRC = '/root/.claude/uploads/e657668c-b5a5-5bee-b18b-a5ba7cb5b06b/f874a9ca-749069a2-64fe-4d7f-9912-b5c331a955ad.mp4'
os.makedirs(job, exist_ok=True)
VD = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', SRC], capture_output=True, text=True).stdout)
NF = len([f for f in os.listdir(f'{src}/vid') if f.endswith('.jpg')])
TOTAL = round(VD + 3.6, 2)
C = {'total': TOTAL, 'vdur': round(VD, 2), 'nf': NF}
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps(C) + ';\n')
hits = [2.6, 4.4, 7.4, 11.4, 14.9, 16.0, 20.6, 22.3, 23.1, 26.4, 33.7]
json.dump({'total': TOTAL, 'bpm': 120, 'fade': 2.5, 'scenes': [0, 2.6, 26.4, VD], 'items': [hits[1:9], [VD + .7]]}, open(f'{job}/cues.json', 'w'))
env = dict(os.environ, REEL_HTML='ap_car2.html')
if '--stills' in sys.argv:
    subprocess.run(['node', f'{KIT}/render.js', job, '30', '1.0,4.0,5.5,8.5,15.4,23.6,28.5,34.3,37.5'], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'apcar2'], check=True)
# original voice stays on top, music ducks under it, end card gets music only
fc = (f"[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5,afade=t=out:st={VD - .4:.2f}:d=0.4,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.26[m];[m][v2]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=300[md];"
      f"[3:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.22[s];"
      f"[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', SRC,
                '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav', '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Autopunkt_Audi_A5_Originalton.mp4'], check=True)
print('DONE')
