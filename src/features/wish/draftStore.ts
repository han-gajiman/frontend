import { create } from 'zustand';

// 소원 등록 3단계(소원 적기 → 명소 선택 → 다짐 확인) 동안 입력값을 보관합니다.
type WishDraftState = {
  content: string;
  actionGoal: string;
  spotId: number | null;
  spotName: string | null;
  setWish: (content: string, actionGoal: string) => void;
  setSpot: (spotId: number, spotName: string) => void;
  reset: () => void;
};

const initial = { content: '', actionGoal: '', spotId: null, spotName: null };

export const useWishDraftStore = create<WishDraftState>((set) => ({
  ...initial,
  setWish: (content, actionGoal) => set({ content, actionGoal }),
  setSpot: (spotId, spotName) => set({ spotId, spotName }),
  reset: () => set(initial),
}));
