#!/usr/bin/env python3
"""Autopunkt Audi A5 photo reel without voiceover (ap_a5.html): python3 make_apa5.py [--stills]"""
import json, os, subprocess, sys
KIT = os.path.dirname(os.path.abspath(__file__)); job = f'{KIT}/jobs/ap_a5'
TOTAL = 29.0
cuts = [0, 3.0, 5.5, 8.5, 11.0, 13.5, 16.0, 18.0, 20.0, 24.5]
open(f'{job}/data.js', 'w').write('window.CUES=' + json.dumps({'total': TOTAL}) + ';\n')
json.dump({'total': TOTAL, 'bpm': 120, 'fade': 2.5, 'scenes': cuts, 'items': [[20.8]]}, open(f'{job}/cues.json', 'w'))
env = dict(os.environ, REEL_HTML='ap_a5.html')
if '--stills' in sys.argv:
    subprocess.run(['node', f'{KIT}/render.js', job, '30', '1.6,4.4,7.8,10.0,12.4,15.0,17.0,19.0,22.6,27.5'], check=True, env=env); sys.exit()
subprocess.run(['node', f'{KIT}/render.js', job, '30'], check=True, env=env)
subprocess.run(['python3', f'{KIT}/audio.py', f'{job}/cues.json', job, 'apa5'], check=True)
# music carries the reel; cut sounds stay quiet (no fake engine noise)
fc = (f"[1:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.85[m];[2:a]pan=stereo|c0=c0|c1=c0,apad,atrim=0:{TOTAL},volume=0.12[s];"
      f"[m][s]amix=inputs=2:normalize=0:duration=longest,loudnorm=I=-16:TP=-1.5,alimiter=limit=0.95,apad,atrim=0:{TOTAL}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{job}/frames/f%05d.jpg', '-i', f'{job}/music.wav', '-i', f'{job}/sfx.wav',
                '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
                '-c:a', 'aac', '-b:a', '192k', '-t', str(TOTAL), '-movflags', '+faststart', f'{job}/Autopunkt_Audi_A5_45TDI_quattro_21000.mp4'], check=True)
print('DONE')
