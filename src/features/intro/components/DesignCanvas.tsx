import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import type { DescriptionLine, Frame, Layer, TitleLine } from '../pages';

// Figma 프레임 좌표를 그대로 쓰는 캔버스. 화면을 빈틈없이 채우도록(cover) 프레임 전체를 확대·축소하고 가운데에 둡니다.
// 그림·돌·글자의 배치가 디자인과 같은 비율로 유지됩니다. (버튼·건너뛰기처럼 안전 영역을 지켜야 하는 것은 캔버스 밖에 둡니다)
export function DesignCanvas({
  frame,
  width,
  height,
  children,
}: {
  frame: Frame;
  width: number;
  height: number;
  children: ReactNode;
}) {
  const scale = Math.max(width / frame.width, height / frame.height);
  return (
    <View style={{ width, height, overflow: 'hidden' }} pointerEvents="none">
      <View
        style={{
          position: 'absolute',
          width: frame.width,
          height: frame.height,
          left: (width - frame.width) / 2,
          top: (height - frame.height) / 2,
          transform: [{ scale }],
        }}>
        {children}
      </View>
    </View>
  );
}

export function boxStyle({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return { position: 'absolute' as const, left: x, top: y, width: w, height: h };
}

export function LayerImage({ layer }: { layer: Layer }) {
  return <Image source={layer.source} style={boxStyle(layer)} contentFit={layer.fit ?? 'contain'} />;
}

export const TITLE_FONT = 'GowunBatang';
export const TITLE_FONT_BOLD = 'GowunBatang-Bold';

// 제목 한 줄 (프레임 가로 가운데 정렬). 줄 안에서 색·크기·굵기가 바뀌는 부분은 span으로 나눕니다.
export function TitleText({ line, frameWidth }: { line: TitleLine; frameWidth: number }) {
  return (
    <Text
      style={{
        position: 'absolute',
        top: line.top,
        left: 0,
        width: frameWidth,
        textAlign: 'center',
        fontFamily: TITLE_FONT,
        fontSize: line.size,
        ...(line.glow
          ? { textShadowColor: 'rgba(255,255,255,0.92)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: line.glow }
          : null),
      }}>
      {line.spans.map((span) => (
        <Text
          key={span.text}
          style={{
            color: span.color,
            fontSize: span.size ?? line.size,
            fontFamily: span.bold ? TITLE_FONT_BOLD : TITLE_FONT,
          }}>
          {span.text}
        </Text>
      ))}
    </Text>
  );
}

// 설명 한 줄. 본문은 시스템 한글 글꼴을 씁니다(디자인의 Noto Sans KR과 거의 같음)
export function DescriptionText({ line, frameWidth }: { line: DescriptionLine; frameWidth: number }) {
  return (
    <Text
      style={{
        position: 'absolute',
        top: line.top,
        left: 0,
        width: frameWidth,
        textAlign: 'center',
        fontSize: line.size,
        color: line.color,
      }}>
      {line.text}
    </Text>
  );
}
