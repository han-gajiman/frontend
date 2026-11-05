// 메모리에서 동작하는 가짜 백엔드. 앱을 다시 켜면 초기화됩니다.
// 실제 서버처럼 "오늘", "30일 경과" 판단을 여기서 하고, 화면은 응답 값만 씁니다.
// 응답·에러 형식은 docs/API명세서.md를 따릅니다.

import type {
  FindEmailResponse,
  LocalSignupRequest,
  LoginProvider,
  LoginResponse,
  OnboardingRequest,
} from '@/features/auth/types';
import type { AcceptedFriend, Cheer, Friend, Invite } from '@/features/friend/types';
import type { AppNotification, NotificationType } from '@/features/notification/types';
import type { Spot, VisitResponse } from '@/features/spot/types';
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

import { ApiError, type Page } from './client';
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

const SPOT_RADIUS_M = 500;

const spots: Omit<Spot, 'visited' | 'radiusM'>[] = [
  {
    id: 1,
    name: '팔공산 갓바위',
    region: '경산',
    category: 'EARNEST',
    description: '한 가지 소원은 꼭 들어준다는 갓바위 부처. 이름처럼 딱 한 가지만 빌어 보세요',
    latitude: 35.98158,
    longitude: 128.73655,
  },
  {
    id: 2,
    name: '문경새재 과거길',
    region: '문경',
    category: 'PASS',
    description: '과거 보러 가던 선비들이 합격을 빌던 책바위. 지금도 돌을 쌓으며 소원을 빌어요',
    latitude: 36.76844,
    longitude: 128.07522,
  },
  {
    id: 3,
    name: '호미곶 해맞이광장',
    region: '포항',
    category: 'NEW_START',
    description: '바다 위 상생의 손 너머로 한반도에서 가장 먼저 해가 뜨는 곳',
    latitude: 36.07676,
    longitude: 129.56793,
  },
  {
    id: 4,
    name: '동화사',
    region: '대구',
    category: 'EARNEST',
    description: '갓바위와 같은 팔공산 품에 안긴 천년 고찰. 갓바위와 함께 걸어 보세요',
    latitude: 35.99322,
    longitude: 128.70424,
  },
  {
    id: 5,
    name: '불국사·석굴암',
    region: '경주',
    category: 'EARNEST',
    description: '천 년 넘게 사람들의 소원을 들어 온 신라의 절과 석굴',
    latitude: 35.78991,
    longitude: 129.33184,
  },
  {
    id: 6,
    name: '부석사',
    region: '영주',
    category: 'EARNEST',
    description: '무량수전 앞에서 노을을 보며 조용히 다짐하기 좋은 곳',
    latitude: 36.99847,
    longitude: 128.6871,
  },
  {
    id: 7,
    name: '경주 남산',
    region: '경주',
    category: 'EARNEST',
    description: '산 곳곳의 석탑과 마애불. 돌에 마음을 새겨 온 산이에요',
    latitude: 35.79565,
    longitude: 129.22186,
  },
  {
    id: 8,
    name: '영덕 해맞이공원',
    region: '영덕',
    category: 'NEW_START',
    description: '동해 일출과 함께 새로운 30일을 시작하기 좋은 곳',
    latitude: 36.42628,
    longitude: 129.43484,
  },
  {
    id: 9,
    name: '문무대왕릉',
    region: '경주',
    category: 'NEW_START',
    description: '죽어서도 나라를 지키겠다는 다짐이 잠든 바다 위 왕릉',
    latitude: 35.73826,
    longitude: 129.48688,
  },
  {
    id: 10,
    name: '하회마을 삼신당 신목',
    region: '안동',
    category: 'EARNEST',
    description: '600년 된 느티나무에 소원지를 매달아 비는 곳',
    latitude: 36.53935,
    longitude: 128.51741,
  },
];

// 친구와 친구의 돌탑 (다른 회원 데이터라 내 wishes와 따로 둡니다)
type MockFriend = {
  id: number;
  nickname: string;
  wish: { id: number; content: string; stoneCount: number; stonedToday: boolean; visibility: Visibility; spotId: number; spotVisited: boolean } | null;
  lastNudgedOn: string | null;
};

const emptyDb = () => ({
  dayOffset: 0, // 시연용 시간 이동 (DEMO-01)
  onboarded: false,
  provider: 'KAKAO' as LoginProvider,
  nickname: '',
  journeyStartedOn: null as string | null,
  visitedSpotIds: [] as number[], // 방문 인증한 명소 (지도의 별)
  wishes: [] as MockWish[],
  stones: [] as MockStone[],
  friends: [] as MockFriend[],
  notifications: [] as AppNotification[], // 최신이 앞
  cheers: {} as Record<number, Cheer[]>, // wishId → 응원 (최신이 앞)
  myInviteCodes: [] as string[],
  acceptedInviteCodes: [] as string[],
  nextId: 100,
});

let db = emptyDb();

// 자체 로그인 계정 (이메일 → 비밀번호·닉네임). 목 서버라 평문으로 둡니다.
const localAccounts: Record<string, { password: string; nickname: string }> = {
  'demo@hangajiman.app': { password: 'password123', nickname: '소원지기' },
};
// 비밀번호 찾기 인증코드: 목 모드에서는 메일 없이 항상 이 코드
export const MOCK_RESET_CODE = '123456';

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

  // 기존 회원: 완성한 돌탑 6개(30개를 다 채운 돌탑 1개 포함) + 13일째 진행 중인 돌탑 1개
  db.onboarded = true;
  db.nickname = '소원지기';
  const currentStart = addDays(today(), -12);
  db.journeyStartedOn = addDays(today(), -204);
  db.visitedSpotIds = [8]; // 진행 중인 돌탑의 영덕 해맞이공원에 다녀옴

  // 오래된 것부터. 다음 돌탑 시작까지 30일 + 이틀 간격
  const pastTowers: {
    id: number;
    daysAgo: number;
    content: string;
    actionGoal: string;
    spotId: number;
    stones: number;
    result: 'ACHIEVED' | 'NOT_ACHIEVED';
    reflection: string;
  }[] = [
    { id: 2, daysAgo: 204, content: '일기 꾸준히 쓰기', actionGoal: '자기 전 세 줄 쓰기', spotId: 10, stones: 15, result: 'ACHIEVED', reflection: '세 줄이면 충분했다' },
    { id: 3, daysAgo: 172, content: '하루 30분 걷기', actionGoal: '점심 먹고 한 바퀴 걷기', spotId: 4, stones: 9, result: 'NOT_ACHIEVED', reflection: '다음엔 더 쉽게 시작하기' },
    { id: 4, daysAgo: 140, content: '물 2리터 마시기', actionGoal: '자리에 물병 두기', spotId: 8, stones: 24, result: 'ACHIEVED', reflection: '물병 효과가 컸다' },
    { id: 5, daysAgo: 108, content: '책 한 권 끝까지 읽기', actionGoal: '매일 열 쪽 읽기', spotId: 6, stones: 18, result: 'NOT_ACHIEVED', reflection: '절반은 읽었다' },
    { id: 1, daysAgo: 76, content: '토익 800점 넘기', actionGoal: '매일 LC 1세트 풀기', spotId: 3, stones: 27, result: 'ACHIEVED', reflection: '마지막 모의고사 820점!' },
    { id: 6, daysAgo: 44, content: '아침 6시에 일어나기', actionGoal: '알람 듣고 바로 일어나기', spotId: 1, stones: 30, result: 'ACHIEVED', reflection: '30일을 다 채웠다' },
  ];
  for (const tower of pastTowers) {
    const startDate = addDays(today(), -tower.daysAgo);
    db.wishes.push({
      id: tower.id,
      content: tower.content,
      actionGoal: tower.actionGoal,
      spotId: tower.spotId,
      visibility: 'PRIVATE',
      status: 'CLOSED',
      startDate,
      endDate: addDays(startDate, TOWER_DAYS - 1),
      result: tower.result,
      reflection: tower.reflection,
    });
    for (let i = 0; i < tower.stones; i++) addStone(tower.id, addDays(startDate, i), null);
  }

  db.wishes.push({
    id: 10,
    content: '백엔드 개발자로 취업하기',
    actionGoal: '매일 영어 단어 20개 외우기',
    spotId: 8,
    visibility: 'FRIENDS',
    status: 'ACTIVE',
    startDate: currentStart,
    endDate: addDays(currentStart, TOWER_DAYS - 1),
    result: null,
    reflection: null,
  });
  for (let i = 0; i < 12; i++) addStone(10, addDays(currentStart, i), i % 2 ? '영어 단어 20개 외움' : null);

  // 친구 3명: 콕 찌를 수 있는 친구 / 오늘 이미 쌓은 친구 / 비공개 돌탑 친구
  db.friends.push(
    {
      id: 201,
      nickname: '지기',
      wish: { id: 501, content: '토익 800점 넘기', stoneCount: 8, stonedToday: false, visibility: 'FRIENDS', spotId: 8, spotVisited: false },
      lastNudgedOn: null,
    },
    {
      id: 202,
      nickname: '돌돌이',
      wish: { id: 502, content: '매일 30분 달리기', stoneCount: 20, stonedToday: true, visibility: 'FRIENDS', spotId: 3, spotVisited: true },
      lastNudgedOn: null,
    },
    { id: 203, nickname: '비밀이', wish: null, lastNudgedOn: null },
  );
  const now = new Date().toISOString();
  db.cheers[501] = [
    { cheerId: 901, writerNickname: '돌돌이', isAnonymous: false, message: '토익 화이팅!', createdAt: now },
  ];
  db.cheers[10] = [
    { cheerId: 902, writerNickname: '지기', isAnonymous: false, message: '오늘도 하나 쌓자!', createdAt: now },
    { cheerId: 903, writerNickname: '돌돌이', isAnonymous: false, message: '벌써 13일째네! 꾸준한 모습 멋있어요.', createdAt: now },
    { cheerId: 904, writerNickname: null, isAnonymous: true, message: '소원 꼭 이루어지길 바랄게요. 저도 작년에 같은 소원을 빌었는데 매일 조금씩 하다 보니 정말 이루어졌어요. 포기하지 말고 끝까지 같이 쌓아요!', createdAt: now },
    { cheerId: 905, writerNickname: '지기', isAnonymous: false, message: '면접 잘 보고 와!', createdAt: now },
  ];
  notify('NUDGE', 10, '돌돌이님이 콕 찔렀어요! 오늘의 돌을 쌓아 보세요.');
  notify('CHEER', 902, '지기님이 응원을 보냈어요.');
}

// 알림함에 추가 (실제 서버는 이때 푸시도 보냄)
function notify(type: NotificationType, targetId: number, message: string) {
  db.notifications.unshift({
    id: db.nextId++,
    type,
    targetId,
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
}
seed();

// 스케줄러(TOWER-01): 기간이 끝난 돌탑을 COMPLETED로 전환
function runScheduler() {
  for (const wish of db.wishes) {
    if (wish.status === 'ACTIVE' && wish.endDate < today()) {
      wish.status = 'COMPLETED';
      notify('TOWER_COMPLETED', wish.id, '30일 돌탑이 완성됐어요');
    }
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

// stone@example.com → st***@ex***.com (백엔드와 같은 규칙)
const maskEmail = (email: string) => {
  const [local, domain] = email.split('@');
  const dot = domain.lastIndexOf('.');
  const keep = (part: string) => part.slice(0, part.length > 2 ? 2 : 1);
  return `${keep(local)}***@${keep(dot > 0 ? domain.slice(0, dot) : domain)}***${dot > 0 ? domain.slice(dot) : ''}`;
};

export const mockServer = {
  // 자체 로그인: 가입한 계정(메모리) + 시연용 계정 demo@hangajiman.app / password123
  signupLocal(body: LocalSignupRequest): LoginResponse {
    const email = body.email.trim().toLowerCase();
    if (localAccounts[email]) throw new ApiError('AUTH_EMAIL_DUPLICATED', '이미 가입된 이메일이에요.', 409);
    localAccounts[email] = { password: body.password, nickname: body.nickname };
    db = emptyDb(); // 새 회원
    db.nickname = body.nickname;
    return mockServer.login('LOCAL');
  },

  loginLocal(email: string, password: string): LoginResponse {
    if (localAccounts[email.trim().toLowerCase()]?.password !== password) {
      throw new ApiError('AUTH_LOGIN_FAILED', '이메일 또는 비밀번호가 맞지 않아요.', 401);
    }
    return mockServer.login('LOCAL');
  },

  findEmails(nickname: string): FindEmailResponse {
    const emails = Object.entries(localAccounts)
      .filter(([, account]) => account.nickname === nickname.trim())
      .map(([email]) => maskEmail(email));
    return { emails };
  },

  resetPassword(email: string, code: string, newPassword: string): void {
    const account = localAccounts[email.trim().toLowerCase()];
    if (!account || code !== MOCK_RESET_CODE) {
      throw new ApiError('AUTH_RESET_CODE_INVALID', '인증코드가 맞지 않거나 만료됐어요.', 400);
    }
    account.password = newPassword;
  },

  login(provider: LoginProvider): LoginResponse {
    db.provider = provider;
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
  },

  getMe(): Me {
    runScheduler();
    return {
      id: 1,
      nickname: db.nickname,
      profileImageUrl: null,
      provider: db.provider,
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
      spot: { id: spot.id, name: spot.name, category: spot.category, visited: db.visitedSpotIds.includes(spot.id), backgroundImageUrl: null },
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

  changeVisibility(wishId: number, visibility: Visibility): void {
    const wish = db.wishes.find((w) => w.id === wishId);
    if (!wish) throw new ApiError('WISH_NOT_FOUND', '돌탑을 찾을 수 없어요.', 404);
    wish.visibility = visibility;
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
        spotId: w.spotId,
        spotName: spotOf(w.spotId).name,
        visited: db.visitedSpotIds.includes(w.spotId),
        result: w.result,
      }));
  },

  getSpots(category?: string): Spot[] {
    return spots
      .filter((s) => !category || s.category === category)
      .map((s) => ({ ...s, radiusM: SPOT_RADIUS_M, visited: db.visitedSpotIds.includes(s.id) }));
  },

  createVisit(spotId: number): VisitResponse {
    const firstVisit = !db.visitedSpotIds.includes(spotId);
    if (firstVisit) db.visitedSpotIds.push(spotId);
    return { visitId: spotId, firstVisit };
  },

  // --- 친구 (FRIEND-01~04) ---

  createInvite(): Invite {
    const code = Math.random().toString(36).slice(2, 10).padEnd(8, 'x');
    db.myInviteCodes.push(code);
    return {
      inviteCode: code,
      inviteUrl: `https://hangajiman.app/invite/${code}`,
      expiresAt: `${addDays(today(), 7)}T09:00:00+09:00`,
    };
  },

  // 목 모드에서는 8자리 영문·숫자 코드면 "새 친구"가 초대한 것으로 칩니다.
  acceptInvite(code: string): AcceptedFriend {
    if (!/^[A-Za-z0-9]{8}$/.test(code)) {
      throw new ApiError('FRIEND_INVITE_NOT_FOUND', '잘못되었거나 만료된 초대예요.', 404);
    }
    if (db.myInviteCodes.includes(code)) {
      throw new ApiError('FRIEND_SELF_INVITE', '본인의 초대는 수락할 수 없어요.', 400);
    }
    if (db.acceptedInviteCodes.includes(code)) {
      throw new ApiError('FRIEND_ALREADY', '이미 친구예요.', 409);
    }
    db.acceptedInviteCodes.push(code);
    const friend: MockFriend = { id: db.nextId++, nickname: `새 친구 ${code.slice(0, 3)}`, wish: null, lastNudgedOn: null };
    db.friends.unshift(friend);
    return { friendId: friend.id, nickname: friend.nickname };
  },

  getFriends(): Page<Friend> {
    const content = db.friends.map((f) => ({
      friendId: f.id,
      nickname: f.nickname,
      wish:
        f.wish && f.wish.visibility === 'FRIENDS'
          ? { wishId: f.wish.id, content: f.wish.content, stoneCount: f.wish.stoneCount, stonedToday: f.wish.stonedToday, spotId: f.wish.spotId, spotName: spotOf(f.wish.spotId).name, spotVisited: f.wish.spotVisited }
          : null,
    }));
    return { content, page: 0, size: 50, hasNext: false };
  },

  getCheers(wishId: number): Page<Cheer> {
    const mine = db.wishes.some((w) => w.id === wishId);
    const friendWish = db.friends.find((f) => f.wish?.id === wishId && f.wish.visibility === 'FRIENDS');
    if (!mine && !friendWish) throw new ApiError('CHEER_NOT_ALLOWED', '응원할 수 없는 돌탑이에요.', 403);
    return { content: db.cheers[wishId] ?? [], page: 0, size: 50, hasNext: false };
  },

  writeCheer(wishId: number, rawMessage: string): { cheerId: number } {
    const message = rawMessage.trim();
    if (!message) throw new ApiError('INVALID_INPUT', '요청 값이 올바르지 않아요.', 400);
    if ([...message].length > 100) throw new ApiError('CHEER_TOO_LONG', '응원은 100자까지 쓸 수 있어요.', 400);
    const friend = db.friends.find((f) => f.wish?.id === wishId && f.wish.visibility === 'FRIENDS');
    if (!friend) throw new ApiError('CHEER_NOT_ALLOWED', '응원할 수 없는 돌탑이에요.', 403);

    const cheer: Cheer = {
      cheerId: db.nextId++,
      writerNickname: db.nickname,
      isAnonymous: false,
      message,
      createdAt: new Date().toISOString(),
    };
    db.cheers[wishId] = [cheer, ...(db.cheers[wishId] ?? [])];
    return { cheerId: cheer.cheerId };
  },

  nudge(friendId: number): void {
    const friend = db.friends.find((f) => f.id === friendId);
    if (!friend) throw new ApiError('FRIEND_NOT_FOUND', '친구를 찾을 수 없어요.', 404);
    if (!friend.wish || friend.wish.visibility !== 'FRIENDS' || friend.wish.stonedToday) {
      throw new ApiError('NUDGE_NOT_ALLOWED', '지금은 콕 찌를 수 없는 친구예요.', 400);
    }
    if (friend.lastNudgedOn === today()) throw new ApiError('NUDGE_LIMIT', '오늘은 이미 콕 찔렀어요.', 429);
    friend.lastNudgedOn = today();
  },

  // --- 알림 (NOTI-01) ---

  getNotifications(): Page<AppNotification> {
    return { content: db.notifications, page: 0, size: 50, hasNext: false };
  },

  markNotificationRead(id: number): void {
    const notification = db.notifications.find((n) => n.id === id);
    if (!notification) throw new ApiError('NOTIFICATION_NOT_FOUND', '알림을 찾을 수 없어요.', 404);
    notification.isRead = true;
  },

  timeTravel(days: number): { serverNow: string } {
    db.dayOffset += days;
    runScheduler();
    return { serverNow: `${today()}T09:00:00+09:00` };
  },
};
