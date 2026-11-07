import { create } from 'zustand';

import type { Visibility, WishSuggestion } from './types';

// 소원 등록 3단계(소원 적기 → 명소 선택 → 다짐 확인) 동안 입력값을 보관합니다.
type WishDraftState = {
  content: string;
  actionGoal: string;
  spotId: number | null;
  spotName: string | null;
  visibility: Visibility; // 🟡 기본값은 ERD대로 PRIVATE, 다짐 확인 화면에서 직접 고름
  suggestion: WishSuggestion | null; // AI 추천 (소원 적기에서 받아 명소 고르기에서도 씁니다)
  setWish: (content: string, actionGoal: string) => void;
  setSpot: (spotId: number, spotName: string) => void;
  setVisibility: (visibility: Visibility) => void;
  setSuggestion: (suggestion: WishSuggestion | null) => void;
  reset: () => void;
};

const initial = { content: '', actionGoal: '', spotId: null, spotName: null, visibility: 'PRIVATE' as Visibility, suggestion: null };

export const useWishDraftStore = create<WishDraftState>((set) => ({
  ...initial,
  setWish: (content, actionGoal) => set({ content, actionGoal }),
  setSpot: (spotId, spotName) => set({ spotId, spotName }),
  setVisibility: (visibility) => set({ visibility }),
  setSuggestion: (suggestion) => set({ suggestion }),
  reset: () => set(initial),
}));
