#!/usr/bin/env python3
"""FOB Reel builder.

  python3 make_reel.py script <spec.json>                  -> prints the voiceover text for TTS
  python3 make_reel.py build  <spec.json> <vo.mp3> <words.json> [--stills]
        -> jobs/<slug>/reel.mp4  (1080x1920, 30 fps, captions, music bed, sfx)

words.json = the transcript word list from ElevenLabs Scribe ([{text,start,end,type}, ...]).
"""
import json, os, re, sys, difflib, subprocess, shutil

KIT = os.path.dirname(os.path.abspath(__file__))

def segments(spec):
    """Ordered voiceover segments: (scene_idx, item_idx or None, text)."""
    segs = []
    for i, sc in enumerate(spec['scenes']):
        segs.append((i, None, sc['vo']))
        for j, it in enumerate(sc.get('items', [])):
            if it.get('vo'):
                segs.append((i, j, it['vo']))
    return segs

def script_text(spec):
    return ' '.join(s[2].strip() for s in segments(spec))

norm = lambda w: re.sub(r'[^0-9a-zäöüß]', '', w.lower())

def toks(text):
    return [t for t in (norm(x) for x in re.split(r'[\s\-–]+', text)) if t]

def cues(spec, words):
    words = [w for w in words if w.get('type', 'word') == 'word' and norm(w['text'])]
    # expand transcript words that contain hyphens into sub-tokens sharing the word's timing
    tw = []
    for w in words:
        for t in toks(w['text']):
            tw.append((t, w['start']))
    segs = segments(spec)
    st, owner = [], []
    for k, (_, _, text) in enumerate(segs):
        for t in toks(text):
            st.append(t); owner.append(k)
    sm = difflib.SequenceMatcher(a=st, b=[t for t, _ in tw], autojunk=False)
    amap = {}
    for blk in sm.get_matching_blocks():
        for d in range(blk.size):
            amap[blk.a + d] = tw[blk.b + d][1]
    seg_t = []
    for k in range(len(segs)):
        idx = [n for n, o in enumerate(owner) if o == k]
        hit = next((amap[n] for n in idx if n in amap), None)
        seg_t.append(hit)
    # fill gaps by interpolation
    for k in range(len(seg_t)):
        if seg_t[k] is None:
            prev = next((seg_t[q] for q in range(k - 1, -1, -1) if seg_t[q] is not None), 0.0)
            nxt = next((seg_t[q] for q in range(k + 1, len(seg_t)) if seg_t[q] is not None), prev + 1.0)
            seg_t[k] = (prev + nxt) / 2
    ns = len(spec['scenes'])
    scenes = [0.0] * ns
    items = [[] for _ in range(ns)]
    for (i, j, _), t in zip(segs, seg_t):
        if j is None:
            scenes[i] = t
        else:
            items[i].append(t)
    scenes[0] = 0.0
    # scene cuts slightly before the first word of a scene
    scenes = [0.0] + [max(scenes[i - 1] + .5, s - .15) for i, s in enumerate(scenes) if i > 0]
    end = words[-1]['end']
    total = round(end + 2.6, 2)
    return {'scenes': scenes, 'items': items, 'end': end, 'total': total}

def fix_caps(caps):
    """Spoken forms -> written forms in the burned-in captions."""
    out, k = [], 0
    while k < len(caps):
        w = caps[k]
        if norm(w['text']).startswith('fobfm') and k + 2 < len(caps) and norm(caps[k + 1]['text']) == 'punkt':
            out.append({'text': 'fob-fm.de', 'start': w['start'], 'end': caps[k + 2]['end']})
            k += 3; continue
        out.append(dict(w, text=w['text'].replace('My-Hammer', 'MyHammer')))
        k += 1
    return out

def run(cmd):
    print('+', ' '.join(cmd) if isinstance(cmd, list) else cmd, flush=True)
    subprocess.run(cmd, check=True, shell=isinstance(cmd, str))

def build(spec_path, vo, words_path, stills=False):
    spec = json.load(open(spec_path))
    words = json.load(open(words_path))
    if isinstance(words, dict):
        words = words.get('words', [])
    job = os.path.join(KIT, 'jobs', spec['slug'])
    os.makedirs(job, exist_ok=True)
    c = cues(spec, words)
    caps = [{'text': w['text'], 'start': w['start'], 'end': w['end']} for w in words if w.get('type', 'word') == 'word']
    caps = fix_caps(caps)
    json.dump(c, open(os.path.join(job, 'cues.json'), 'w'), indent=1)
    with open(os.path.join(job, 'data.js'), 'w') as f:
        f.write('window.SPEC=' + json.dumps(spec, ensure_ascii=False) + ';\n')
        f.write('window.CUES=' + json.dumps(c) + ';\n')
        f.write('window.CAPS=' + json.dumps(caps, ensure_ascii=False) + ';\n')
    print('cues:', json.dumps(c))
    if stills:
        ts = []
        for i, s in enumerate(c['scenes']):
            e = c['scenes'][i + 1] if i + 1 < len(c['scenes']) else c['total']
            ts.append(round(s + (e - s) * .8, 2))
        run(['node', os.path.join(KIT, 'render.js'), job, '30', ','.join(map(str, ts))])
        return
    run(['node', os.path.join(KIT, 'render.js'), job, '30'])
    run(['python3', os.path.join(KIT, 'audio.py'), os.path.join(job, 'cues.json'), job, spec['slug']])
    out = os.path.join(job, 'reel.mp4')
    fc = ("[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-16:TP=-1.5,apad,asplit[v1][v2];"
          "[2:a]pan=stereo|c0=c0|c1=c0,volume=0.30[m];"
          "[m][v2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];"
          "[3:a]pan=stereo|c0=c0|c1=c0,volume=0.40[s];"
          "[v1][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95[a]")
    run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(job, 'frames', 'f%05d.jpg'),
         '-i', vo, '-i', os.path.join(job, 'music.wav'), '-i', os.path.join(job, 'sfx.wav'),
         '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
         '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', '-t', str(c['total']),
         '-movflags', '+faststart', out])
    shutil.rmtree(os.path.join(job, 'frames'), ignore_errors=True)
    print('DONE', out)

if __name__ == '__main__':
    a = sys.argv[1:]
    if a and a[0] == 'script':
        print(script_text(json.load(open(a[1]))))
    elif a and a[0] == 'build':
        build(a[1], a[2], a[3], '--stills' in a)
    else:
        print(__doc__)
