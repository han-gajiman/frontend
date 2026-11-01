"""인트로 2장 배경 다듬기 (Figma 원본: assets/intro/original/screen_02_artwork.jpg → assets/intro/screen_02_artwork.jpg)
Figma 배경에는 돌을 지운 자리에 뭉개진 얼룩이 남아 있어서, 돌이 다 쌓이기 전에 그 얼룩이 보입니다.
돌이 있던 자리를 주변 하늘·구름·산으로 채웁니다.

실행: pip install pillow numpy opencv-python-headless
      python3 assets/intro/original/tools/clean_artwork.py
"""
import os

import cv2
import numpy as np
from PIL import Image

ORIG = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'  # original/
OUT = os.path.dirname(os.path.dirname(ORIG)) + '/'  # assets/intro/

# 디자인 좌표 (src/features/intro/pages.ts 2장)
ART_BOX = (-13, 1.8, 423, 876.5)
STONES = [
    ('screen_02_stone_03.png', (62.53, 587.86, 264.43, 103.63)),
    ('screen_02_stone_02.png', (99, 511, 192.07, 95.38)),
    ('screen_02_stone_01.png', (130, 454, 142.04, 94.46)),
]

art = np.array(Image.open(ORIG + 'screen_02_artwork.jpg').convert('RGB'))
ah, aw = art.shape[:2]
sx, sy = aw / ART_BOX[2], ah / ART_BOX[3]

# 돌(원본 실루엣)이 있던 자리 = 얼룩이 남은 자리
hole = np.zeros((ah, aw), np.uint8)
for name, (x, y, w, h) in STONES:
    alpha = np.array(Image.open(ORIG + name).convert('RGBA'))[:, :, 3]
    ih, iw = alpha.shape
    k = min(w / iw, h / ih)  # contentFit contain
    rw, rh = iw * k, ih * k
    left = (x + (w - rw) / 2 - ART_BOX[0]) * sx
    top = (y + (h - rh) / 2 - ART_BOX[1]) * sy
    size = (max(1, round(rw * sx)), max(1, round(rh * sy)))
    resized = cv2.resize(alpha, size, interpolation=cv2.INTER_AREA)
    l, t = round(left), round(top)
    hole[t:t + size[1], l:l + size[0]] = np.maximum(hole[t:t + size[1], l:l + size[0]], resized)
hole = cv2.dilate((hole > 20).astype(np.uint8), np.ones((15, 15), np.uint8))

bgr = cv2.cvtColor(art, cv2.COLOR_RGB2BGR)
filled = cv2.inpaint(bgr, hole * 255, 25, cv2.INPAINT_TELEA)
# 채운 부분의 잔 줄무늬를 부드럽게 (경계는 서서히 섞음)
soft = cv2.GaussianBlur(filled, (0, 0), 6)
blend = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 4)[:, :, None]
result = (filled * (1 - blend) + soft * blend).astype(np.uint8)
Image.fromarray(cv2.cvtColor(result, cv2.COLOR_BGR2RGB)).save(OUT + 'screen_02_artwork.jpg', quality=92)
