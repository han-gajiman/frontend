// docs/API명세서.md 🗺️ Spot 기준

export type SpotCategory = string; // 🟡 명소 카테고리 기준 미정 (시드: EARNEST, PASS, NEW_START)

// GET /spots
export type Spot = {
  id: number;
  name: string;
  region: string;
  category: SpotCategory;
  description: string;
  latitude: number;
  longitude: number;
};
