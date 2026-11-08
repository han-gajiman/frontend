import { Image } from 'expo-image';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { TITLE_FONT } from '@/features/intro/components/DesignCanvas';

import { backLayout } from '../backLayouts';
import { POSTCARD_IMAGES } from '../images';

const FLIP = { duration: 500, easing: Easing.inOut(Easing.cubic) };
const FILL = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backfaceVisibility: 'hidden' } as const;
export const POSTCARD_RATIO = 2 / 3; // 100×150mm

export type LetterText = { to: string; from: string; message: ReactNode };

// 엽서 한 장. 누르면 뒤집혀 뒷면이 보이고, 편지가 있으면 뒷면의 MESSAGE·TO·FROM 칸에 씁니다.
export function PostcardCard({
  spotId,
  style,
  letter,
  width,
  startOnBack = false,
  flippable = true,
}: {
  spotId: number;
  style: number;
  letter?: LetterText;
  width: number;
  startOnBack?: boolean;
  flippable?: boolean; // 글을 쓰는 중에는 뒤집히지 않게
}) {
  const images = POSTCARD_IMAGES[spotId]?.[style];
  const [onBack, setOnBack] = useState(startOnBack);
  const flip = useSharedValue(startOnBack ? 180 : 0);
  // 웹은 뒷면 숨김이 글자까지 적용되지 않아서, 90도를 넘는 순간 보이는 면을 직접 바꿉니다.
  const frontStyle = useAnimatedStyle(() => ({
    opacity: flip.get() < 90 ? 1 : 0,
    transform: [{ perspective: 1200 }, { rotateY: `${flip.get()}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.get() < 90 ? 0 : 1,
    transform: [{ perspective: 1200 }, { rotateY: `${flip.get() - 180}deg` }],
  }));
  if (!images) return null;

  const turn = () => {
    setOnBack(!onBack);
    flip.set(withTiming(onBack ? 0 : 180, FLIP));
  };

  return (
    <Pressable
      onPress={turn}
      disabled={!flippable}
      accessibilityRole="button"
      accessibilityLabel={onBack ? '엽서 앞면 보기' : '엽서 뒷면 보기'}
      style={{ width, height: width / POSTCARD_RATIO }}>
      <Animated.View style={[FILL, frontStyle, CARD_SHADOW]}>
        <Image source={images.front} style={{ flex: 1, borderRadius: 6 }} contentFit="cover" />
      </Animated.View>
      <Animated.View style={[FILL, backStyle, CARD_SHADOW]}>
        <Image source={images.back} style={{ flex: 1, borderRadius: 6 }} contentFit="cover" />
        {letter && <BackText spotId={spotId} style={style} letter={letter} width={width} />}
      </Animated.View>
    </Pressable>
  );
}

const CARD_SHADOW = { borderRadius: 6, boxShadow: '0 6px 18px rgba(30,20,70,0.25)' } as const;

const INK = '#2c2660';
const LIGHT_INK = '#fffdf6';

// 글이 칸을 넘지 않게 글자 크기를 줄입니다. (한글 한 글자 폭 ≈ 글자 크기, 줄 간격 1.5배)
export function messageFontSize(cardWidth: number, box: [number, number, number, number], length: number) {
  const width = (cardWidth * box[2]) / 100;
  const height = (cardWidth / POSTCARD_RATIO) * (box[3] / 100);
  let size = Math.max(10, Math.round(cardWidth * 0.036));
  while (size > 8) {
    const perLine = Math.max(1, Math.floor(width / (size * 0.95)));
    if (Math.ceil(Math.max(length, 1) / perLine) * size * 1.5 <= height) break;
    size -= 0.5;
  }
  return size;
}

// 뒷면의 MESSAGE·TO·FROM 칸에 바로 씁니다. 칸 위치는 엽서마다 다릅니다(backLayouts).
export function BackText({ spotId, style, letter, width }: { spotId: number; style: number; letter: LetterText; width: number }) {
  const layout = backLayout(spotId, style);
  const nameSize = Math.max(10, Math.round(width * 0.036));
  const [mx, my, mw, mh] = layout.message;
  const name = (field: 'to' | 'from', value: string) => {
    const [x, y, w] = layout[field];
    return (
      <Text
        numberOfLines={1}
        style={{
          position: 'absolute',
          left: `${x}%`,
          bottom: `${100 - y + 0.3}%`, // 줄 바로 위
          width: `${w}%`,
          fontFamily: TITLE_FONT,
          fontSize: nameSize,
          color: layout.light?.includes(field) ? LIGHT_INK : INK,
        }}>
        {layout.prefix?.includes(field) ? `${field.toUpperCase()}. ` : ''}
        {value}
      </Text>
    );
  };
  const size = typeof letter.message === 'string' ? messageFontSize(width, layout.message, letter.message.length) : nameSize;

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
      <View style={{ position: 'absolute', left: `${mx}%`, top: `${my}%`, width: `${mw}%`, height: `${mh}%` }}>
        {typeof letter.message === 'string' ? (
          <Text style={{ fontFamily: TITLE_FONT, fontSize: size, lineHeight: size * 1.5, color: INK }}>{letter.message}</Text>
        ) : (
          letter.message
        )}
      </View>
      {name('to', letter.to)}
      {name('from', letter.from)}
    </View>
  );
}
