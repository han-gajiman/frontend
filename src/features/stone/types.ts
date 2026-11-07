// docs/API명세서.md 🪨 Stone 기준

export type StoneType = 'ATTENDANCE' | 'PRACTICE'; // 출석 / 실천 기록

// POST /wishes/{wishId}/stones
export type CreateStoneResponse = {
  stoneId: number;
  stoneDate: string;
  type: StoneType;
  stoneCount: number;
};

// GET /wishes/{wishId}/stones 항목. 글 없이 쌓았으면 content가 null
export type StoneItem = {
  stoneId: number;
  stoneDate: string;
  type: StoneType;
  content: string | null;
};
