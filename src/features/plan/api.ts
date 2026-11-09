import { apiRequest } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import type { PlanCalendar, PlanTodo, TodoSuggestion, WishPlan } from './types';

// PLAN-01 GET /plans/calendar?month=YYYY-MM — 그 달의 돌탑·소원 메모·할 일. month가 없으면 서버 기준 이번 달
export function getPlanCalendar(month?: string): Promise<PlanCalendar> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getPlanCalendar(month));
  }
  return apiRequest<PlanCalendar>(month ? `/plans/calendar?month=${month}` : '/plans/calendar');
}

// PLAN-02 GET /plans/todos/today — 돌 쌓기 화면에서 불러오는 오늘 할 일
export function getTodayTodos(): Promise<PlanTodo[]> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getTodayTodos());
  }
  return apiRequest<PlanTodo[]>('/plans/todos/today');
}

// POST /plans/todos — 지난 날짜 400 PLAN_PAST_DATE, 하루 5개 넘으면 400 PLAN_TODO_LIMIT
export function addTodo(date: string, content: string): Promise<PlanTodo> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.addTodo(date, content));
  }
  return apiRequest<PlanTodo>('/plans/todos', { method: 'POST', body: { date, content } });
}

// PATCH /plans/todos/{id} — 완료 체크
export function setTodoDone(todoId: number, done: boolean): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.updateTodo(todoId, { done }));
  }
  return apiRequest<void>(`/plans/todos/${todoId}`, { method: 'PATCH', body: { done } });
}

// DELETE /plans/todos/{id}
export function deleteTodo(todoId: number): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.deleteTodo(todoId));
  }
  return apiRequest<void>(`/plans/todos/${todoId}`, { method: 'DELETE' });
}

// PLAN-03 POST /plans/todos/suggestion — 진행 중 돌탑 기간의 날짜만, 한 번에 1개, 하루 10번
export function suggestTodo(date: string): Promise<TodoSuggestion> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.suggestTodo(date));
  }
  return apiRequest<TodoSuggestion>('/plans/todos/suggestion', { method: 'POST', body: { date } });
}

// GET /plans/wish-plans — 새 소원 등록 화면에서 불러오는 소원 메모 (시작 예정일 순)
export function getWishPlans(): Promise<WishPlan[]> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getWishPlans());
  }
  return apiRequest<WishPlan[]>('/plans/wish-plans');
}

// POST /plans/wish-plans — 최대 12개 (400 PLAN_WISH_LIMIT)
export function addWishPlan(content: string, startDate: string): Promise<WishPlan> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.addWishPlan(content, startDate));
  }
  return apiRequest<WishPlan>('/plans/wish-plans', { method: 'POST', body: { content, startDate } });
}

// DELETE /plans/wish-plans/{id}
export function deleteWishPlan(planId: number): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.deleteWishPlan(planId));
  }
  return apiRequest<void>(`/plans/wish-plans/${planId}`, { method: 'DELETE' });
}
