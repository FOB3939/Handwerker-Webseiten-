#!/usr/bin/env python3
"""Cut the reference image into animation layers for opa.html.
   python3 prepare_opa.py   (needs jobs/opa/src/orig.png + src/man_mask2.png; writes jobs/opa/layers/*.png)"""
import os, cv2, numpy as np
KIT = os.path.dirname(os.path.abspath(__file__)); J = f'{KIT}/jobs/opa'; os.makedirs(f'{J}/layers', exist_ok=True)
im = cv2.imread(f'{J}/src/orig.png'); h, w = im.shape[:2]; fg = cv2.imread(f'{J}/src/man_mask2.png', 0)
Y, X = np.mgrid[0:h, 0:w]
P = lambda pts: np.array(pts, np.int32)
def poly(pts):
    m = np.zeros((h, w), np.uint8); cv2.fillPoly(m, [P(pts)], 255); return m
HEAD = [(268,330),(272,280),(300,235),(340,213),(400,203),(450,213),(480,238),(500,272),(520,296),(532,298),(531,330),(525,352),(523,400),(521,449),(500,456),(470,454),(440,444),(410,434),(380,439),(345,434),(318,434),(298,402),(283,370)]
ARM = [(470,466),(520,498),(590,551),(612,530),(640,503),(670,496),(692,518),(695,548),(664,584),(618,600),(606,618),(566,650),(516,680),(470,702)]
PLATE = (686, 476, 840, 636)
BROW_N = [(409,354),(419,338),(440,320),(458,304),(468,311),(453,330),(431,350),(416,361)]
BROW_F = [(468,297),(481,287),(499,289),(500,304),(485,306),(470,307)]
wallish = (im.astype(int).mean(2) > 205) & ((im[:, :, 2].astype(int) - im[:, :, 0].astype(int)) > 25)
head = cv2.bitwise_and(fg, poly(HEAD)); head[wallish & (Y < 330)] = 0; head = cv2.morphologyEx(head, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
n_, lab_, st_, _ = cv2.connectedComponentsWithStats(head); head = np.where(lab_ == 1 + np.argmax(st_[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
arm = cv2.bitwise_and(fg, poly(ARM))
arm[X < 466] = 0
body = fg.copy(); body[(head > 0) & (Y < 424)] = 0; body[(arm > 0) & (X >= 486)] = 0
def rgba(img, a):
    o = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA); o[:, :, 3] = a; return o
def save(name, img, a, box=None):
    o = rgba(img, a)
    if box is None:
        ys, xs = np.where(a > 0); box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    x0, y0, x1, y1 = box; cv2.imwrite(f'{J}/layers/{name}.png', o[y0:y1, x0:x1]); return [int(x0), int(y0), int(x1), int(y1)]
# base: original image; only regions that get revealed (arm, head, plate) are refilled from clean wall pixels
base = im.copy().astype(np.float32)
def fill_cols(hole, mode):
    ys, xs = np.where(hole > 0)
    for x in np.unique(xs):
        col = np.where(hole[:, x] > 0)[0]
        for seg in np.split(col, np.where(np.diff(col) > 1)[0] + 1):
            y0, y1 = seg[0] - 1, seg[-1] + 1
            yt = max(y0, 0)
            if mode == 'top':
                yt = max(y0 - 14, 0)
                while yt > 0 and fg[yt, x] > 0: yt -= 1
                yt = max(yt - 6, 0)
            top = base[yt, x].copy(); bot = base[min(y1, h - 1), x].copy()
            for i, y in enumerate(seg):
                k = (i + 1) / (len(seg) + 1)
                base[y, x] = top if mode == 'top' else top * (1 - k) + bot * k
def fill_rows(hole, cx):
    for y in np.unique(np.where(hole > 0)[0]):
        row = np.where(hole[y] > 0)[0]
        L, R = row.min() - 1, row.max() + 1
        for x in row: base[y, x] = base[y, max(L, 0)] if x < cx else base[y, min(R, w - 1)]
armhole = cv2.dilate(arm, np.ones((33, 33), np.uint8)); armhole[X < 486] = 0; armhole[fg == 0] = armhole[fg == 0]; armhole[(Y > 600) & (X < 520) & (fg > 0) & (arm == 0)] = 0
plhole = np.zeros((h, w), np.uint8); plhole[PLATE[1]-3:PLATE[3]+3, PLATE[0]-3:PLATE[2]+3] = 255; plhole[armhole > 0] = 0
headhole = cv2.dilate(head, np.ones((11, 11), np.uint8))
fill_cols(plhole, 'interp'); fill_cols(armhole, 'top'); fill_rows(headhole, 400)
allh = cv2.bitwise_or(cv2.bitwise_or(armhole, plhole), headhole)
bl = cv2.GaussianBlur(base, (0, 0), 3); m = cv2.GaussianBlur(allh.astype(np.float32) / 255, (0, 0), 2)[..., None]
base = base * (1 - m) + bl * m
cv2.imwrite(f'{J}/layers/base.jpg', base.astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 93])
# head with brows inpainted (brows become own layers)
bm = cv2.bitwise_or(poly(BROW_N), poly(BROW_F)); headimg = cv2.inpaint(im, cv2.dilate(bm, np.ones((5, 5), np.uint8)), 5, cv2.INPAINT_TELEA)
boxes = {'head': save('head', headimg, cv2.GaussianBlur(head, (3, 3), 0)),
         'body': save('body', im, cv2.GaussianBlur(body, (3, 3), 0)),
         'arm': save('arm', im, cv2.GaussianBlur(arm, (3, 3), 0)),
         'browN': save('browN', im, cv2.GaussianBlur(poly(BROW_N), (3, 3), 0)),
         'browF': save('browF', im, cv2.GaussianBlur(poly(BROW_F), (3, 3), 0)),
         'plate': save('plate', im, np.full((h, w), 255, np.uint8), PLATE),
         'piece': save('piece', im, np.full((h, w), 255, np.uint8), (787, 548, 812, 600))}
eye_white = im[350, 437].tolist()[::-1]; skin = im[380, 425].tolist()[::-1]
import json; json.dump({'boxes': boxes, 'eyeWhite': eye_white, 'skin': skin, 'W': w, 'H': h}, open(f'{J}/layers/layers.json', 'w'))
open(f'{J}/layers/layers.js', 'w').write('window.LAYERS=' + json.dumps({'boxes': boxes, 'eyeWhite': eye_white, 'skin': skin, 'W': w, 'H': h}) + ';')
print(boxes, eye_white, skin)
