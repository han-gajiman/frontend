// 열린 명소 일러스트의 명소별 잔잔한 움직임 (노션 "방문 인증 완료 후 명소 일러스트 애니메이션 기획" 3. 명소별 추천).
// 그림은 한 장이라 나뭇잎·파도만 따로 움직일 수 없어서, 전체 그림의 아주 느린 이동·확대와 빛 색·방향 변화로 표현합니다.
// 수치는 노션 권장값 안: 확대 최대 1.02배, 이동 최대 ±4px, 빛 최대 8%, 주기 8~12초.

export type SpotAmbience = {
  light: string; // 빛 색 (#rrggbb)
  from: 'top' | 'bottom' | 'left' | 'right'; // 빛이 들어오는 쪽
  lightPeriod: number; // 빛이 밝아졌다 돌아오는 한 주기(ms)
  breathPeriod: number; // 확대·축소 한 주기(ms)
  pan?: number; // 좌우로 아주 느리게 이동하는 폭(px). 없으면 이동 없음
};

const DEFAULT: SpotAmbience = { light: '#ffd9a8', from: 'top', lightPeriod: 8000, breathPeriod: 10000 };

const AMBIENCE: Record<number, SpotAmbience> = {
  // 팔공산 갓바위: 산안개와 따뜻한 햇빛
  1: { light: '#ffd9a8', from: 'top', lightPeriod: 9000, breathPeriod: 11000 },
  // 문경새재 과거길: 숲속 바람, 화면이 아주 느리게 이동하며 깊이감
  2: { light: '#e8f2c8', from: 'left', lightPeriod: 10000, breathPeriod: 12000, pan: 4 },
  // 호미곶: 수평선 쪽 일출 빛이 밝아졌다 어두워짐
  3: { light: '#ffc28a', from: 'bottom', lightPeriod: 7000, breathPeriod: 10000 },
  // 동화사: 고요한 햇살
  4: { light: '#fff0c4', from: 'top', lightPeriod: 10000, breathPeriod: 12000 },
  // 불국사·석굴암: 실내의 은은한 반사광
  5: { light: '#ffe6c0', from: 'bottom', lightPeriod: 8000, breathPeriod: 10000 },
  // 부석사: 산바람, 좌우로 아주 천천히 움직이며 공간감
  6: { light: '#ffe2c2', from: 'right', lightPeriod: 9000, breathPeriod: 11000, pan: 4 },
  // 경주남산: 노을의 살구빛
  7: { light: '#ffb98f', from: 'top', lightPeriod: 8000, breathPeriod: 10000 },
  // 영덕 해맞이공원: 바닷바람, 느린 이동과 햇빛
  8: { light: '#ffd7a0', from: 'right', lightPeriod: 8000, breathPeriod: 10000, pan: 3 },
  // 문무대왕릉: 바다의 호흡 (조금 더 깊게 숨쉼)
  9: { light: '#d6e6ff', from: 'bottom', lightPeriod: 9000, breathPeriod: 8000 },
  // 하회마을 삼신당 신목: 나뭇잎 사이로 비치는 빛 (조금 빠르게 깜빡이듯)
  10: { light: '#f4f0b8', from: 'top', lightPeriod: 6000, breathPeriod: 12000 },
};

export const spotAmbience = (spotId: number): SpotAmbience => AMBIENCE[spotId] ?? DEFAULT;

// LinearGradient 방향 (빛이 들어오는 쪽이 진하고 반대쪽으로 사라짐)
export const LIGHT_DIRECTION = {
  top: { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
  bottom: { start: { x: 0.5, y: 1 }, end: { x: 0.5, y: 0 } },
  left: { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } },
  right: { start: { x: 1, y: 0.5 }, end: { x: 0, y: 0.5 } },
} as const;

// '#rrggbb' → 투명한 같은 색 (그라데이션 끝)
export const transparent = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},0)`;
};
