// docs/API명세서.md 🗺️ Spot & Postcard 기준 (SPOT-04 엽서)

// GET /postcards 항목, 방문 인증 응답의 새 엽서. style 1~4
export type Postcard = {
  spotId: number;
  spotName: string;
  style: number;
  issuedAt: string;
};

// POST /postcards/letters. receiverId가 없으면 나에게 보내기
export type SendLetterRequest = {
  spotId: number;
  style: number;
  receiverId?: number;
  message: string;
};

// GET /postcards/letters/received 항목. TO = 받는 사람, FROM = 보낸 사람
export type Letter = {
  letterId: number;
  spotId: number;
  spotName: string;
  style: number;
  message: string;
  fromNickname: string;
  toNickname: string;
  fromMe: boolean;
  read: boolean;
  sentAt: string;
};

export const LETTER_MAX_LENGTH = 100;
export const STYLES_PER_SPOT = 4;
export const SPOT_COUNT = 10;
export const TOTAL_POSTCARDS = STYLES_PER_SPOT * SPOT_COUNT;

export const STYLE_NAMES: Record<number, string> = {
  1: '빈티지 판화',
  2: '서정적인 손그림',
  3: '모던 그래픽',
  4: '사진풍 여행 엽서',
};
