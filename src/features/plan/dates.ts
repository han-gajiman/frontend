// 'YYYY-MM-DD' 날짜 계산 (달력 그리기용). "오늘"은 서버가 준 값만 씁니다.
const DAY_MS = 24 * 60 * 60 * 1000;
const toTime = (date: string) => Date.parse(`${date}T00:00:00Z`);
const toDate = (time: number) => new Date(time).toISOString().slice(0, 10);

export const addDays = (date: string, days: number) => toDate(toTime(date) + days * DAY_MS);
export const diffDays = (from: string, to: string) => Math.round((toTime(to) - toTime(from)) / DAY_MS);
export const weekday = (date: string) => new Date(toTime(date)).getUTCDay(); // 0 = 일요일

// 'YYYY-MM'에 n달 더하기
export function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const monthLabel = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return `${y}년 ${m}월`;
};

export const dayLabel = (date: string) => {
  const [, m, d] = date.split('-').map(Number);
  return `${m}월 ${d}일 (${WEEKDAYS[weekday(date)]})`;
};

// 달력 칸: 그 달을 덮는 일요일~토요일 주들. 다른 달 날짜도 칸은 채웁니다.
export function monthWeeks(month: string): string[][] {
  const first = `${month}-01`;
  const start = addDays(first, -weekday(first));
  const lastOfMonth = addDays(`${addMonths(month, 1)}-01`, -1);
  const weeks: string[][] = [];
  for (let day = start; day <= lastOfMonth; day = addDays(day, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(day, i)));
  }
  return weeks;
}
