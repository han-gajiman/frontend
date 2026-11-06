import { Text, View } from 'react-native';

import { TITLE_FONT } from '@/features/intro/components/DesignCanvas';

// 돌 1개의 생김새. Figma 시안이 나오면 이 파일만 이미지(SVG/PNG)로 교체하면 됩니다.
// 크기·위치·회전은 index로 고정되어 있어서, 같은 돌탑은 항상 같은 모양으로 그려집니다.

// index마다 항상 같은 0~1 값 (무작위처럼 보이지만 재현 가능)
const seeded = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const STONE_COLORS = ['#a8a29e', '#9ca3af', '#a3a3a3', '#b5ada6'];
const TODAY_COLOR = '#57534e';
const WISH_STONE_COLOR = '#f6f1e7';
const WISH_TEXT_COLOR = '#3b342e';
const WISH_STONE_MAX_WIDTH = 250;
const WISH_STONE_MIN_HEIGHT = 36;

// 돌 index(0 = 맨 아래)별 기본 크기. 위로 갈수록 작아집니다.
export function stoneSize(index: number) {
  return {
    width: (104 - index * 1.6) * (0.88 + 0.24 * seeded(index)),
    height: (30 - index * 0.3) * (0.9 + 0.2 * seeded(index + 300)),
  };
}

type StoneShapeProps = {
  index: number;
  scale: number;
  isToday: boolean;
  label?: string; // 돌에 새긴 글씨 (맨 아래 돌의 소원 문구)
};

export function StoneShape({ index, scale, isToday, label }: StoneShapeProps) {
  const { width, height } = stoneSize(index);
  const offsetX = (seeded(index + 100) - 0.5) * 10;
  const rotate = (seeded(index + 200) - 0.5) * 10;

  // 소원 돌(맨 아래): 다른 돌보다 밝고 반듯한 받침돌에 글씨를 또렷하게 새깁니다. 긴 소원은 두 줄까지
  if (label) {
    return (
      <View
        style={{
          minWidth: width * scale,
          maxWidth: WISH_STONE_MAX_WIDTH,
          minHeight: Math.max(WISH_STONE_MIN_HEIGHT, height * scale),
          paddingHorizontal: 18,
          paddingVertical: 7,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(120,104,88,0.4)',
          backgroundColor: WISH_STONE_COLOR,
          boxShadow: '0 3px 8px rgba(40,30,70,0.28)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          numberOfLines={2}
          style={{ fontFamily: TITLE_FONT, fontSize: 14, lineHeight: 19, textAlign: 'center', color: WISH_TEXT_COLOR }}>
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
        borderRadius: (height * scale) / 2,
        backgroundColor: isToday ? TODAY_COLOR : STONE_COLORS[index % STONE_COLORS.length],
        transform: [{ translateX: offsetX * scale }, { rotate: `${rotate}deg` }],
      }}
    />
  );
}
