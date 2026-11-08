import { Image, type ImageSource } from 'expo-image';
import { Text, View } from 'react-native';

import { TITLE_FONT } from '@/features/intro/components/DesignCanvas';

// 돌 1개의 생김새 (피그마 "돌탑"의 돌 5종, assets/stones).
// 크기·위치·회전·그림은 index로 고정되어 있어서, 같은 돌탑은 항상 같은 모양으로 그려집니다.

// index마다 항상 같은 0~1 값 (무작위처럼 보이지만 재현 가능)
const seeded = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// 그림마다 여백이 있어서 돌 본체의 범위(box: 왼쪽, 위, 오른쪽, 아래 픽셀)를 기준으로 맞춥니다.
type StoneImage = { source: ImageSource; size: [number, number]; box: [number, number, number, number] };

const aspect = (stone: StoneImage) => (stone.box[2] - stone.box[0]) / (stone.box[3] - stone.box[1]);

const LONG: StoneImage = { source: require('../../../../assets/stones/stone-long.png'), size: [480, 160], box: [41, 44, 438, 145] };
const FLAT: StoneImage = { source: require('../../../../assets/stones/stone-flat.png'), size: [480, 160], box: [57, 32, 423, 131] };
const WIDE: StoneImage = { source: require('../../../../assets/stones/stone-wide.png'), size: [480, 192], box: [50, 24, 425, 176] };
const OVAL: StoneImage = { source: require('../../../../assets/stones/stone-oval.png'), size: [480, 214], box: [56, 35, 424, 183] };
const PEBBLE: StoneImage = { source: require('../../../../assets/stones/stone-pebble.png'), size: [480, 270], box: [77, 34, 401, 228] };

// 피그마 돌탑처럼 아래에는 길고 납작한 돌, 위로 갈수록 둥근 돌. 바로 위아래 돌은 겹치지 않습니다.
function stoneImage(index: number): StoneImage {
  if (index === 0) return LONG;
  const pool = index < 8 ? [FLAT, LONG, WIDE] : index < 18 ? [WIDE, OVAL, FLAT] : [OVAL, PEBBLE, WIDE];
  const pick = pool[Math.floor(seeded(index + 400) * pool.length)];
  return pick === stoneImage(index - 1) ? pool[(pool.indexOf(pick) + 1) % pool.length] : pick;
}

const WISH_TEXT_COLOR = '#2c2660';
const WISH_STONE_WIDTH = 184;

// 돌 index(0 = 맨 아래)별 기본 크기. 위로 갈수록 작아지고, 높이는 그림의 비율을 따릅니다.
export function stoneSize(index: number) {
  const width = (104 - index * 1.6) * (0.88 + 0.24 * seeded(index));
  return { width, height: width / aspect(stoneImage(index)) };
}

type StoneShapeProps = {
  index: number;
  scale: number;
  isToday: boolean;
  label?: string; // 돌에 새긴 글씨 (맨 아래 돌의 소원 문구)
};

// 그림의 돌 본체가 width×height에 꼭 맞도록 그립니다.
function StonePicture({ stone, width, height }: { stone: StoneImage; width: number; height: number }) {
  const [imageWidth, imageHeight] = stone.size;
  const [left, top, right, bottom] = stone.box;
  const scaleX = width / (right - left);
  const scaleY = height / (bottom - top);
  return (
    <Image
      source={stone.source}
      style={{ position: 'absolute', left: -left * scaleX, top: -top * scaleY, width: imageWidth * scaleX, height: imageHeight * scaleY }}
      contentFit="fill"
    />
  );
}

export function StoneShape({ index, scale, isToday, label }: StoneShapeProps) {
  const { width, height } = stoneSize(index);
  const offsetX = (seeded(index + 100) - 0.5) * 10;
  const rotate = (seeded(index + 200) - 0.5) * 8;

  // 소원 돌(맨 아래): 가장 긴 받침돌에 소원을 새깁니다. 긴 소원은 두 줄까지
  if (label) {
    const wishHeight = WISH_STONE_WIDTH / aspect(LONG);
    return (
      <View style={{ width: WISH_STONE_WIDTH, height: wishHeight, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 }}>
        <StonePicture stone={LONG} width={WISH_STONE_WIDTH} height={wishHeight} />
        <Text
          numberOfLines={2}
          style={{ fontFamily: TITLE_FONT, fontSize: 12.5, lineHeight: 15, fontWeight: '700', textAlign: 'center', color: WISH_TEXT_COLOR }}>
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        width: width * scale,
        height: height * scale,
        transform: [{ translateX: offsetX * scale }, { rotate: `${rotate}deg` }],
        filter: isToday ? 'brightness(0.75)' : undefined, // 오늘 쌓은 돌은 조금 어둡게
      }}>
      <StonePicture stone={stoneImage(index)} width={width * scale} height={height * scale} />
    </View>
  );
}
