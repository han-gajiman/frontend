// 메모리에서 동작하는 가짜 백엔드. 앱을 다시 켜면 초기화됩니다.
// 실제 서버처럼 "오늘", "30일 경과" 판단을 여기서 하고, 화면은 응답 값만 씁니다.
// 응답·에러 형식은 docs/API명세서.md를 따릅니다.

import type { LoginResponse, OnboardingRequest } from '@/features/auth/types';
import type { Spot } from '@/features/spot/types';
import type { CreateStoneResponse, StoneType } from '@/features/stone/types';
import type {
  CreateWishRequest,
  CreateWishResponse,
  CurrentWish,
  ReflectionRequest,
  Visibility,
  WishResult,
  WishStatus,
  WishSummary,
} from '@/features/wish/types';
import type { Me } from '@/features/user/types';

import { ApiError } from './client';
import { MOCK_SCENARIO } from './mock';

const TOWER_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// 'YYYY-MM-DD' 날짜 계산 (KST 기준 날짜 문자열)
const toTime = (date: string) => Date.parse(`${date}T00:00:00Z`);
const toDate = (time: number) => new Date(time).toISOString().slice(0, 10);
const addDays = (date: string, days: number) => toDate(toTime(date) + days * DAY_MS);
const diffDays = (from: string, to: string) => Math.round((toTime(to) - toTime(from)) / DAY_MS);
const kstToday = () => toDate(Date.now() + 9 * 60 * 60 * 1000);

type MockWish = {
  id: number;
  content: string;
  actionGoal: string;
  spotId: number;
  visibility: Visibility;
  status: WishStatus;
  startDate: string;
  endDate: string;
  result: WishResult | null;
  reflection: string | null;
};

type MockStone = {
  id: number;
  wishId: number;
  stoneDate: string;
  type: StoneType;
  content: string | null;
};

const spots: Spot[] = [
  {
    id: 1,
    name: '팔공산 갓바위',
    region: '경산',
    category: 'EARNEST',
    description: '한 가지 소원은 꼭 들어준다는 갓바위 부처',
    latitude: 35.9776,
    longitude: 128.727,
  },
  {
    id: 2,
    name: '문경새재 과거길',
    region: '문경',
    category: 'PASS',
    description: '경사스러운 소식을 듣는 길',
    latitude: 36.765,
    longitude: 128.077,
  },
  {
    id: 3,
    name: '호미곶 해맞이광장',
    region: '포항',
    category: 'NEW_START',
    description: '새해 첫 해가 떠오르는 곳',
    latitude: 36.0766,
    longitude: 129.5683,
  },
];

const emptyDb = () => ({
  dayOffset: 0, // 시연용 시간 이동 (DEMO-01)
  onboarded: false,
  nickname: '',
  locationAgreed: false,
  journeyStartedOn: null as string | null,
  wishes: [] as MockWish[],
  stones: [] as MockStone[],
  nextId: 100,
});

let db = emptyDb();

const today = () => addDays(kstToday(), db.dayOffset);

function addStone(wishId: number, stoneDate: string, content: string | null) {
  const stone: MockStone = {
    id: db.nextId++,
    wishId,
    stoneDate,
    type: content ? 'PRACTICE' : 'ATTENDANCE',
    content,
  };
  db.stones.push(stone);
  return stone;
}

// 시나리오별 초기 데이터
function seed() {
  if (MOCK_SCENARIO === 'empty') return;

  // 기존 회원: 완성한 돌탑 1개 + 13일째 진행 중인 돌탑 1개
  db.onboarded = true;
  db.nickname = '소원지기';
  const pastStart = addDays(today(), -45);
  const currentStart = addDays(today(), -12);
  db.journeyStartedOn = pastStart;

  db.wishes.push(
    {
      id: 1,
      content: '토익 800점 넘기',
      actionGoal: '매일 LC 1세트 풀기',
      spotId: 3,
      visibility: 'PRIVATE',
      status: 'CLOSED',
      startDate: pastStart,
      endDate: addDays(pastStart, TOWER_DAYS - 1),
      result: 'ACHIEVED',
      reflection: '마지막 모의고사 820점!',
    },
    {
      id: 10,
      content: '백엔드 개발자로 취업하기',
      actionGoal: '매일 영어 단어 20개 외우기',
      spotId: 2,
      visibility: 'FRIENDS',
      status: 'ACTIVE',
      startDate: currentStart,
      endDate: addDays(currentStart, TOWER_DAYS - 1),
      result: null,
      reflection: null,
    },
  );
  for (let i = 0; i < 27; i++) addStone(1, addDays(pastStart, i), null);
  for (let i = 0; i < 12; i++) addStone(10, addDays(currentStart, i), i % 2 ? '영어 단어 20개 외움' : null);
}
seed();

// 스케줄러(TOWER-01): 기간이 끝난 돌탑을 COMPLETED로 전환
function runScheduler() {
  for (const wish of db.wishes) {
    if (wish.status === 'ACTIVE' && wish.endDate < today()) wish.status = 'COMPLETED';
  }
}

const roundOf = (date: string) =>
  db.journeyStartedOn ? Math.floor(diffDays(db.journeyStartedOn, date) / 365) + 1 : 1;

const stoneCount = (wishId: number) => db.stones.filter((s) => s.wishId === wishId).length;

const openWish = () => db.wishes.find((w) => w.status === 'ACTIVE' || w.status === 'COMPLETED');

function findWish(wishId: number) {
  const wish = db.wishes.find((w) => w.id === wishId);
  if (!wish) throw new ApiError('WISH_NOT_OWNER', '본인의 돌탑이 아니에요.', 403);
  return wish;
}

const spotOf = (spotId: number) => spots.find((s) => s.id === spotId)!;

export const mockServer = {
  login(): LoginResponse {
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      isNewUser: !db.onboarded,
      onboarded: db.onboarded,
    };
  },

  completeOnboarding(body: OnboardingRequest): void {
    if (!body.agreements.terms || !body.agreements.privacy) {
      throw new ApiError('REQUIRED_AGREEMENT_MISSING', '필수 약관에 동의해 주세요.', 400);
    }
    db.onboarded = true;
    db.nickname = body.nickname;
    db.locationAgreed = body.agreements.location;
  },

  getMe(): Me {
    runScheduler();
    return {
      id: 1,
      nickname: db.nickname,
      profileImageUrl: null,
      provider: 'KAKAO',
      agreements: { location: db.locationAgreed },
      hasActiveWish: openWish() !== undefined,
      journey: db.journeyStartedOn
        ? {
            startedOn: db.journeyStartedOn,
            currentRound: roundOf(today()),
            reviewAt: addDays(db.journeyStartedOn, 365 * roundOf(today())),
          }
        : null,
    };
  },

  updateLocationAgreement(agreed: boolean): void {
    db.locationAgreed = agreed;
  },

  // 탈퇴: 본인 데이터 전부 삭제 → 다시 로그인하면 새 회원
  deleteAccount(): void {
    db = emptyDb();
  },

  getCurrentWish(): CurrentWish | null {
    runScheduler();
    const wish = openWish();
    if (!wish) return null;

    const spot = spotOf(wish.spotId);
    const dayIndex = Math.min(diffDays(wish.startDate, today()) + 1, TOWER_DAYS);
    return {
      wishId: wish.id,
      content: wish.content,
      actionGoal: wish.actionGoal,
      status: wish.status,
      visibility: wish.visibility,
      spot: { id: spot.id, name: spot.name, category: spot.category, visited: false, backgroundImageUrl: null },
      stoneCount: stoneCount(wish.id),
      stonedToday: db.stones.some((s) => s.wishId === wish.id && s.stoneDate === today()),
      dayIndex,
      daysLeft: TOWER_DAYS - dayIndex,
    };
  },

  createWish(body: CreateWishRequest): CreateWishResponse {
    runScheduler();
    if (openWish()) throw new ApiError('WISH_ALREADY_ACTIVE', '이미 진행 중인 돌탑이 있어요.', 409);

    const startDate = today();
    const endDate = addDays(startDate, TOWER_DAYS - 1);
    db.journeyStartedOn ??= startDate;
    const wish: MockWish = {
      id: db.nextId++,
      ...body,
      status: 'ACTIVE',
      startDate,
      endDate,
      result: null,
      reflection: null,
    };
    db.wishes.push(wish);
    return { wishId: wish.id, startDate, endDate };
  },

  createStone(wishId: number, content: string | null): CreateStoneResponse {
    runScheduler();
    const wish = findWish(wishId);
    if (wish.status !== 'ACTIVE') throw new ApiError('WISH_NOT_ACTIVE', '진행 중인 돌탑이 아니에요.', 400);
    if (db.stones.some((s) => s.wishId === wishId && s.stoneDate === today())) {
      throw new ApiError('STONE_ALREADY_TODAY', '오늘은 이미 돌을 쌓았어요.', 409);
    }

    const stone = addStone(wishId, today(), content);
    return { stoneId: stone.id, stoneDate: stone.stoneDate, type: stone.type, stoneCount: stoneCount(wishId) };
  },

  submitReflection(wishId: number, body: ReflectionRequest): void {
    runScheduler();
    const wish = findWish(wishId);
    if (wish.status !== 'COMPLETED') throw new ApiError('TOWER_NOT_COMPLETED', '아직 30일이 지나지 않았어요.', 403);

    wish.status = 'CLOSED';
    wish.result = body.result;
    wish.reflection = body.reflection;
  },

  getWishes(round?: number): WishSummary[] {
    runScheduler();
    const targetRound = round ?? roundOf(today());
    return db.wishes
      .filter((w) => w.status !== 'ACTIVE' && roundOf(w.endDate) === targetRound)
      .map((w) => ({
        wishId: w.id,
        content: w.content,
        startDate: w.startDate,
        stoneCount: stoneCount(w.id),
        spotName: spotOf(w.spotId).name,
        visited: false,
        result: w.result,
      }));
  },

  getSpots(category?: string): Spot[] {
    return category ? spots.filter((s) => s.category === category) : spots;
  },

  timeTravel(days: number): { serverNow: string } {
    db.dayOffset += days;
    runScheduler();
    return { serverNow: `${today()}T09:00:00+09:00` };
  },
};
