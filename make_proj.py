#!/usr/bin/env python3
"""Project montage reel (proj.html), music only: python3 make_proj.py [--stills]"""
import json, os, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/proj'
D = [2.0, 1.4, 3.0, 3.0, 1.7, 1.5, 1.7, 1.4, 1.2, 1.2, 1.4, 1.2, 1.6, 1.8, 1.8, 1.6]
cuts = [round(sum(D[:i]), 2) for i in range(len(D) + 1)]; ENDC = cuts[-1]; TOTAL = round(ENDC + 2.5, 2)
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps({'total': TOTAL}) + ';\n')
json.dump({'total': TOTAL, 'bpm': 120, 'fade': 2.0, 'scenes': [0, cuts[1], cuts[2], cuts[7], cuts[10], cuts[12], ENDC], 'items': [[cuts[14]], [ENDC + .5]]}, open(f'{job}/cues.json', 'w'))
print(TOTAL, cuts)
env = dict(os.environ, REEL_HTML='proj.html')
if '--stills' in sys.argv:
    ts = [c + .6 for c in cuts[:-1]] + [ENDC + 1.5]
    subprocess.run(['node', f'{KIT}/render.js', job, '30', ','.join(f'{x:.2f}' for x in ts)], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'proj7'], check=True)
fc = (f"[1:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.55[m];[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.22[s];"
      f"[m][s]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5,aresample=44100,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav',
                '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
                '-c:a', 'aac', '-b:a', '192k', '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/FOB_Renovierung_Schritt_fuer_Schritt.mp4'], check=True)
print('DONE')
