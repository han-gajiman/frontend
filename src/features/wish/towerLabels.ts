import type { WishSummary } from './types';

export const FULL_STONES = 30;
export const RESULT_LABEL = { ACHIEVED: '이루었어요', NOT_ACHIEVED: '아직이에요' } as const;

const ORDINALS = ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];

// 소원 묶음(회차, 첫 시작일부터 1년)의 화면 이름: 1 → "첫 번째 소원"
export const roundTitle = (round: number) =>
  round <= ORDINALS.length ? `${ORDINALS[round - 1]} 번째 소원` : `${round}번째 소원`;

// 30개를 다 채우면 금색 별, 다 못 쌓았어도 소원을 이루었으면 흰색 별
export function crownOf(wish: WishSummary) {
  if (wish.stoneCount >= FULL_STONES) return 'gold';
  return wish.result === 'ACHIEVED' ? 'white' : undefined;
}
