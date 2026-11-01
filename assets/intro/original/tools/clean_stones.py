"""인트로 돌 이미지 다듬기 (Figma 원본: assets/intro/original, 결과: assets/intro)
원래 윤곽은 최대한 살리고, 다른 돌에서 묻어온 조각·빛 궤도 선·잘린 윗면만 정리합니다.
2장 돌 3개를 따로 쌓는 연출, 막장 돌탑을 '아래 세 개 + 맨 위 하나'로 나누는 데 씁니다.

실행: pip install pillow numpy opencv-python-headless
      python3 assets/intro/original/tools/clean_stones.py
"""
import os
import cv2
import numpy as np
from PIL import Image

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'  # original/
OUT = os.path.dirname(os.path.dirname(W)) + '/'  # assets/intro/
SS = 4


def load(name):
    a = np.array(Image.open(W + name).convert('RGBA'))
    return a[:, :, :3].copy(), a[:, :, 3].copy()


def inpaint(rgb, holes, radius=6):
    if not holes.any():
        return rgb
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    out = cv2.inpaint(bgr, holes.astype(np.uint8) * 255, radius, cv2.INPAINT_TELEA)
    return cv2.cvtColor(out, cv2.COLOR_BGR2RGB)


def fill_transparent(rgb, alpha):
    """투명한 곳의 색을 돌 색으로 채움 (배경색이 가장자리로 번지지 않게)"""
    return inpaint(rgb, alpha < 128, radius=3)


def ellipse_mask(shape, ell, grow=0.0):
    (cx, cy), (w, h), ang = ell
    big = np.zeros((shape[0] * SS, shape[1] * SS), np.uint8)
    cv2.ellipse(big, ((cx * SS, cy * SS), ((w + grow) * SS, (h + grow) * SS), ang), 255, -1, cv2.LINE_AA)
    return cv2.resize(big, (shape[1], shape[0]), interpolation=cv2.INTER_AREA)


def side_points(alpha, y0, y1):
    pts = []
    for y in range(y0, y1):
        xs = np.where(alpha[y] > 128)[0]
        if len(xs):
            pts += [(xs.min(), y), (xs.max(), y)]
    return np.array(pts, np.float32)


def luminance(rgb):
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)


def dilate(m, k=3):
    return cv2.dilate(m.astype(np.uint8), np.ones((k, k), np.uint8)).astype(bool)


def mirror_fill(rgb, holes):
    """구멍(윗부분)을 바로 아래 질감을 위로 뒤집어 채움. 번진 듯한 얼룩 대신 돌 질감이 이어지게."""
    out = rgb.copy()
    h = rgb.shape[0]
    cols = np.where(holes.any(0))[0]
    yb = np.array([np.where(holes[:, x])[0].max() for x in cols], np.float32)
    yb = cv2.GaussianBlur(yb.reshape(1, -1), (1, 31), 0).ravel()  # 기준선을 가로로 부드럽게 (세로 줄무늬 방지)
    for x, b in zip(cols, yb):
        b = int(round(b))
        for y in np.where(holes[:, x])[0]:
            out[y, x] = rgb[min(h - 1, max(0, 2 * b - y + 1)), x]
    # 경계가 티 나지 않게 채운 부분만 살짝 흐림
    soft = cv2.GaussianBlur(out, (3, 3), 0)
    edge = dilate(holes, 3)
    out[edge] = soft[edge]
    return out


def lift_shadow(rgb, region, target):
    """그림자 진 부분을 질감은 살리고 밝기만 target에 맞춤"""
    lum = luminance(rgb)
    smooth = cv2.GaussianBlur(lum, (0, 0), 6) + 1
    gain = np.clip(target / smooth, 1.0, 2.2)
    gain = cv2.GaussianBlur(np.where(region, gain, 1.0).astype(np.float32), (0, 0), 3)
    return np.clip(rgb.astype(np.float32) * gain[:, :, None], 0, 255).astype(np.uint8)


def save(rgb, alpha, name, crop=False):
    """가장자리 몇 픽셀만 돌 색으로 채우고(확대·축소 시 테두리 번짐 방지) 나머지 투명 부분은 비움, 256색으로 저장"""
    rgb = fill_transparent(rgb, alpha)
    rgb[~dilate(alpha > 0, 9)] = 0
    img = Image.fromarray(np.dstack([rgb, alpha]))
    box = None
    if crop:
        box = img.getbbox()
        img = img.crop(box)
    img.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(OUT + name, optimize=True)
    return box


# ── 2장 위 돌: 아래로 삐져나온 그림자 조각 잘라내기 + 빛 궤도 선 지우기 ──
rgb, alpha = load('screen_02_stone_01.png')
h, w = alpha.shape
rgb = fill_transparent(rgb, alpha)
lum = luminance(rgb)
# 돌과 그림자 조각 사이의 가는 어두운 선(약 110~140행)을 따라 그 아래를 잘라냄
xs = np.arange(55, 196)
cut = np.array([110 + int(np.argmin(np.where(alpha[110:141, x] > 128, lum[110:141, x], 0))) for x in xs], np.float32)
cut = np.polyval(np.polyfit(xs, cut, 2), xs) - 1
new_alpha = alpha.copy()
for x, c in zip(xs, cut):
    y0 = int(np.floor(c))
    new_alpha[y0 + 1:, x] = 0
    new_alpha[y0, x] = int(new_alpha[y0, x] * (c - y0))  # 경계 한 픽셀은 반투명으로
new_alpha = cv2.GaussianBlur(new_alpha, (3, 3), 0)
streak = (lum - cv2.medianBlur(lum.astype(np.uint8), 11).astype(np.float32) > 14) & (new_alpha > 128)
rgb = inpaint(rgb, dilate(streak, 5), radius=7)
save(rgb, new_alpha, 'screen_02_stone_01.png')

# ── 2장 가운데 돌: 왼쪽 위에 붙은 다른 돌 조각 잘라내기 ──
rgb, alpha = load('screen_02_stone_02.png')
h, w = alpha.shape
rgb = fill_transparent(rgb, alpha)
ell = cv2.fitEllipse(side_points(alpha, int(h * 0.3), h - 4).reshape(-1, 1, 2))
body = ellipse_mask(alpha.shape, ell, grow=6)
new_alpha = alpha.copy()
top = np.arange(h)[:, None] < h * 0.35
new_alpha = np.where(top, np.minimum(alpha, body), new_alpha).astype(np.uint8)
lum = luminance(rgb)
odd = top & (new_alpha > 128) & (np.abs(lum - cv2.medianBlur(lum.astype(np.uint8), 13).astype(np.float32)) > 26)
rgb = inpaint(rgb, dilate(odd, 5), radius=7)
save(rgb, new_alpha, 'screen_02_stone_02.png')

# ── 2장 아래 돌: 평평하게 잘린 윗면과 어두운 띠를 둥근 윗면으로 복원 ──
rgb, alpha = load('screen_02_stone_03.png')
h, w = alpha.shape
rgb = fill_transparent(rgb, alpha)
pts = side_points(alpha, int(h * 0.35), h - 6)
# 왼쪽 위 둥근 부분(원래 남아 있는 윗면)도 맞춤에 포함
left_top = [(x, np.where(alpha[:, x] > 128)[0].min()) for x in range(int(w * 0.04), int(w * 0.3)) if (alpha[:, x] > 128).any()]
ell = cv2.fitEllipse(np.vstack([pts, np.array(left_top, np.float32)]).reshape(-1, 1, 2))
dome = ellipse_mask(alpha.shape, ell, grow=-1)
split = int(h * 0.6)
new_alpha = alpha.copy()
new_alpha[:split] = dome[:split]
lum = luminance(rgb)
med = np.median(lum[alpha > 200])
dark = (lum < med * 0.86) & (np.arange(h)[:, None] < split) & (alpha > 128)
rgb = lift_shadow(rgb, dilate(dark, 9), med)
holes = (new_alpha > 0) & (alpha < 200)
holes[split:] = False
rgb = mirror_fill(rgb, holes)
save(rgb, new_alpha, 'screen_02_stone_03.png')

# ── 막장 돌탑: 맨 위 돌과 아래 세 개로 나누기 (둘 다 원본과 같은 캔버스 크기) ──
rgb, alpha = load('final_tower.png')
h, w = alpha.shape
lum = luminance(rgb)
lum_masked = np.where(alpha > 128, lum, 0)  # 돌 사이 틈(투명)도 경계로 봄
xs = np.arange(205, 472)
offset = np.array([int(np.argmin(lum_masked[268:322, x])) for x in xs], np.uint8)  # 268행부터의 거리
seam_raw = 268 + cv2.medianBlur(offset.reshape(1, -1), 9).ravel().astype(np.float32)
poly = np.polyfit(xs, seam_raw, 3)
seam = np.full(w, 268.0)
seam[xs] = np.polyval(poly, xs)
rows = np.arange(h)[:, None]
top_region = rows < seam[None, :]

top_alpha = np.where(top_region, alpha, 0).astype(np.uint8)
print('top box', save(rgb, top_alpha, 'final_tower_top.png', crop=True))

base_alpha = np.where(top_region, 0, alpha).astype(np.uint8)
# 두 번째 돌의 둥근 윗면 복원: 보이는 양옆 윤곽으로 타원을 맞춰 윗부분을 채움
second = cv2.fitEllipse(side_points(base_alpha, 300, 440).reshape(-1, 1, 2))
dome = ellipse_mask(alpha.shape, second, grow=-2)
upper = rows < 340
base_alpha = np.where(upper, dome, base_alpha).astype(np.uint8)
med = np.median(lum[alpha > 200])
shadow = upper & (lum < med * 0.8) & (base_alpha > 0)
holes = upper & (base_alpha > 0) & (top_region | (alpha < 200) | dilate(shadow, 9))
rgb_base = mirror_fill(fill_transparent(rgb, np.where(top_region, 0, alpha)), holes)
print('base box', save(rgb_base, base_alpha, 'final_tower_base.png', crop=True))
