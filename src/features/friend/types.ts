// docs/API명세서.md 🤝 Friend & Cheer 기준 (백엔드 friend 도메인 응답과 같음)

// POST /friends/invites
export type Invite = {
  inviteCode: string;
  inviteUrl: string;
  expiresAt: string;
};

// POST /friends/invites/{inviteCode}/accept — 초대한 사람(새 친구)
export type AcceptedFriend = {
  friendId: number;
  nickname: string;
};

// GET /friends 항목. 친구의 진행 중 돌탑이 없거나 비공개면 wish는 null
export type Friend = {
  friendId: number;
  nickname: string;
  wish: {
    wishId: number;
    content: string;
    stoneCount: number;
    stonedToday: boolean;
  } | null;
};

// GET /wishes/{wishId}/cheers 항목. 익명이면 writerNickname null
export type Cheer = {
  cheerId: number;
  writerNickname: string | null;
  isAnonymous: boolean;
  message: string;
  createdAt: string;
};

export const CHEER_MAX_LENGTH = 100;
