# Reproducible one-colour trace of the approved Tidewater oyster engraving.
# Usage: python3 -I scripts/brand/trace-mark.py <transparent-engraving.png> <out.svg> 150 [#hex]
# Source: Drive "tidewater-oyster-mark-transparent.png" (master brand board, approved 2026-10-28).
import sys, numpy as np, potrace
from PIL import Image, ImageFilter
src, out, thr = sys.argv[1], sys.argv[2], int(sys.argv[3])
im=Image.open(src).convert('RGBA')
S=3
im=im.resize((im.width*S,im.height*S),Image.LANCZOS)
a=np.array(im).astype(float)
lum=(0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2])
alpha=a[...,3]/255
ink=(alpha>0.5)&(lum<thr)
# drop speckle: remove tiny components
import cv2
n,lab,stats,_=cv2.connectedComponentsWithStats(ink.astype(np.uint8),8)
keep=np.zeros(n,bool); keep[1:]=stats[1:,cv2.CC_STAT_AREA]>=60*S
# remove stray marks left of x<120px (orig) not connected to shell body
ink=keep[lab]
bmp=potrace.Bitmap(~ink)
path=bmp.trace(turdsize=8*S,alphamax=1.0,opttolerance=0.3)
W,H=im.width/S,im.height/S
f=lambda p:f"{round(p.x*2/S)} {round(p.y*2/S)}"
d=[]
for c in path:
  d.append("M"+f(c.start_point))
  for s in c.segments:
    if s.is_corner: d.append("L"+f(s.c)+" L"+f(s.end_point))
    else: d.append("C"+f(s.c1)+" "+f(s.c2)+" "+f(s.end_point))
  d.append("Z")
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W*2:.0f} {H*2:.0f}"><path fill="{sys.argv[4] if len(sys.argv)>4 else "currentColor"}" fill-rule="evenodd" d="{"".join(d)}"/></svg>'
open(out,'w').write(svg); print(len(svg),'bytes',len(path),'curves')
