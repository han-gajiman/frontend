import type { ImageSource } from 'expo-image';

// 방문 전·명소 일러스트가 아직 없을 때 쓰는 기본 화면
export const DEFAULT_BACKGROUND: ImageSource = require('../../../assets/spots/default.png');

// 명소 id별 일러스트 (assets/spots). 그림이 추가되면 여기에 한 줄씩 넣습니다.
const ILLUSTRATIONS: Record<number, ImageSource> = {
  3: require('../../../assets/spots/homigot.png'),
  8: require('../../../assets/spots/yeongdeok.png'),
};

export function spotIllustration(spotId: number | null): ImageSource | null {
  return spotId === null ? null : (ILLUSTRATIONS[spotId] ?? null);
}
