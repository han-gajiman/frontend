import type { WishStatus } from '@/features/wish/types';

// PLAN-01~03 소원 캘린더 (API 명세서 /plans)

export const TOWER_DAYS = 30; // 돌탑 하나 = 30일 (소원 메모도 30일로 표시)
export const TODO_MAX_LENGTH = 40;
export const TODOS_PER_DAY = 5;
export const WISH_PLAN_MAX_LENGTH = 100;
export const WISH_PLAN_LIMIT = 12;
export const TODO_SUGGESTION_LIMIT = 10; // 하루 전체 (소원 등록 AI 추천과 따로)

export type PlanTodo = {
  todoId: number;
  date: string; // YYYY-MM-DD
  content: string;
  done: boolean;
};

// 앞으로 할 소원 메모 (시작 예정일부터 30일을 캘린더에 점선으로)
export type WishPlan = {
  planId: number;
  content: string;
  startDate: string;
  endDate: string;
};

export type CalendarWish = {
  wishId: number;
  content: string;
  startDate: string;
  endDate: string;
  status: WishStatus;
};

// GET /plans/calendar?month=YYYY-MM (그 달과 겹치는 것만)
export type PlanCalendar = {
  month: string; // YYYY-MM
  today: string; // 서버 기준 오늘 (클라이언트 시계 사용 금지)
  wishes: CalendarWish[];
  wishPlans: WishPlan[];
  todos: PlanTodo[];
};

// POST /plans/todos/suggestion
export type TodoSuggestion = {
  content: string;
  remaining: number; // 오늘 남은 추천 횟수
  fallback: boolean; // AI가 실패해서 기본 문구
};
