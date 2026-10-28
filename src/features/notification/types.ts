// docs/API명세서.md 🔔 Notification 기준

// targetId 의미: CHEER → 응원 id, NUDGE·TOWER_COMPLETED → 내 돌탑 id, POSTCARD → 엽서 id, YEAR_REVIEW → 회차
export type NotificationType = 'CHEER' | 'NUDGE' | 'TOWER_COMPLETED' | 'POSTCARD' | 'YEAR_REVIEW';

// GET /notifications 항목
export type AppNotification = {
  id: number;
  type: NotificationType;
  targetId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
};
