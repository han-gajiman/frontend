// docs/API명세서.md 🪨 Stone 기준

export type StoneType = 'ATTENDANCE' | 'PRACTICE'; // 출석 / 실천 기록

// POST /wishes/{wishId}/stones
export type CreateStoneResponse = {
  stoneId: number;
  stoneDate: string;
  type: StoneType;
  stoneCount: number;
};
