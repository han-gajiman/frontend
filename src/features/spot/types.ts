// docs/API명세서.md 🗺️ Spot 기준

import type { Postcard } from '@/features/postcard/types';

export type SpotCategory = string; // 🟡 명소 카테고리 기준 미정 (시드: EARNEST, PASS, NEW_START)

// GET /spots
export type Spot = {
  id: number;
  name: string;
  region: string;
  category: SpotCategory;
  description: string;
  story?: string; // 명소 이야기 (뒷면). 🟡 백엔드 미구현이라 지금은 목 데이터에만 있습니다.
  latitude: number;
  longitude: number;
  radiusM: number; // 방문 인증 반경. 앱이 기기 안에서 거리를 계산할 때 씁니다.
  visited: boolean; // 내가 방문 인증한 명소 (지도에 별표). 로그인 전이면 false
  visitedThisTower?: boolean; // 지금 진행 중인 돌탑 기간에 인증했는지. false면 "이 장소 다시 인증하기" (🟡 백엔드 반영 전)
};

// POST /spots/{spotId}/visits. firstVisit=false면 지금 돌탑에서 이미 인증한 명소
// postcard: 이번 인증으로 받은 엽서 (이미 인증했거나 그 명소 엽서를 다 모았으면 null)
export type VisitResponse = {
  visitId: number;
  firstVisit: boolean;
  postcard: Postcard | null;
};
