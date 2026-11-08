import type { ImageSource } from 'expo-image';

// 방문 전·명소가 없을 때 쓰는 기본 화면 (피그마 "안개 낀 파스텔 산맥과 바위 고원")
export const DEFAULT_BACKGROUND: ImageSource = require('../../../assets/spots/default.jpg');

// 명소 id별 일러스트 (assets/spots, 피그마 "명소 1–10"을 720×1280 JPEG로 내보냄 11/8)
const ILLUSTRATIONS: Record<number, ImageSource> = {
  1: require('../../../assets/spots/gatbawi.jpg'),
  2: require('../../../assets/spots/mungyeong-saejae.jpg'),
  3: require('../../../assets/spots/homigot.jpg'),
  4: require('../../../assets/spots/donghwasa.jpg'),
  5: require('../../../assets/spots/bulguksa-seokguram.jpg'),
  6: require('../../../assets/spots/buseoksa.jpg'),
  7: require('../../../assets/spots/gyeongju-namsan.jpg'),
  8: require('../../../assets/spots/yeongdeok.jpg'),
  9: require('../../../assets/spots/munmu-tomb.jpg'),
  10: require('../../../assets/spots/hahoe-sindangmok.jpg'),
};

export function spotIllustration(spotId: number | null): ImageSource | null {
  return spotId === null ? null : (ILLUSTRATIONS[spotId] ?? null);
}
