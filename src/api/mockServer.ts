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
import type { Letter, Postcard, SendLetterRequest } from '@/features/postcard/types';
import type { Spot, VisitResponse } from '@/features/spot/types';
import type { CreateStoneResponse, StoneItem, StoneType } from '@/features/stone/types';
import type {
  CreateWishRequest,
  CreateWishResponse,
  CurrentWish,
  ReflectionRequest,
  RoundSummary,
  Visibility,
  WishResult,
  WishStatus,
  WishSuggestion,
  WishSummary,
  YearReviewResponse,
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
    story: '팔공산 관봉 꼭대기에 앉은 돌부처입니다. 머리에 넓적한 돌을 갓처럼 쓰고 있어 갓바위라 불려요. 정성껏 빌면 한 가지 소원은 꼭 들어준다는 이야기가 전해져, 지금도 시험을 앞둔 사람들이 가파른 돌계단을 오릅니다.',
    latitude: 35.98158,
    longitude: 128.73655,
  },
  {
    id: 2,
    name: '문경새재 과거길',
    region: '문경',
    category: 'PASS',
    description: '과거 보러 가던 선비들이 합격을 빌던 책바위. 지금도 돌을 쌓으며 소원을 빌어요',
    story: '조선 시대 영남의 선비들이 한양으로 과거를 보러 넘던 고갯길입니다. 문경이라는 이름에는 경사스러운 소식을 듣는다는 뜻이 담겨 있다고 해요. 길가의 책바위에는 돌을 쌓으며 합격을 빌던 마음이 지금도 이어지고 있습니다.',
    latitude: 36.76844,
    longitude: 128.07522,
  },
  {
    id: 3,
    name: '호미곶 해맞이광장',
    region: '포항',
    category: 'NEW_START',
    description: '바다 위 상생의 손 너머로 한반도에서 가장 먼저 해가 뜨는 곳',
    story: '한반도를 호랑이에 빗대면 꼬리에 해당하는 곳이라 호미곶이라 불립니다. 새천년을 맞아 세운 상생의 손은 바다와 육지에서 서로 마주 보고 있어요. 해마다 새해 첫날이면 첫 해를 보려는 사람들이 이곳에 모입니다.',
    latitude: 36.07676,
    longitude: 129.56793,
  },
  {
    id: 4,
    name: '동화사',
    region: '대구',
    category: 'EARNEST',
    description: '갓바위와 같은 팔공산 품에 안긴 천년 고찰. 갓바위와 함께 걸어 보세요',
    story: '신라 때 처음 세워진 팔공산의 오래된 절입니다. 절을 다시 지을 때 겨울인데도 오동나무 꽃이 피었다고 해서 동화사라는 이름이 붙었다고 전해져요. 추운 계절에 피어난 꽃처럼, 때를 기다리는 마음을 생각하게 하는 곳입니다.',
    latitude: 35.99322,
    longitude: 128.70424,
  },
  {
    id: 5,
    name: '불국사·석굴암',
    region: '경주',
    category: 'EARNEST',
    description: '천 년 넘게 사람들의 소원을 들어 온 신라의 절과 석굴',
    story: '신라 사람 김대성이 세웠다고 전해지는 절과 돌로 만든 석굴입니다. 돌 하나하나를 다듬어 올린 정성은 천 년이 지난 지금도 남아 있어요. 1995년에 두 곳이 함께 유네스코 세계유산에 올랐습니다.',
    latitude: 35.78991,
    longitude: 129.33184,
  },
  {
    id: 6,
    name: '부석사',
    region: '영주',
    category: 'EARNEST',
    description: '무량수전 앞에서 노을을 보며 조용히 다짐하기 좋은 곳',
    story: '의상대사가 세운 절로, 이름은 떠 있는 돌이라는 뜻입니다. 절을 지을 때 큰 바위가 떠올라 방해하는 무리를 물리쳤다는 이야기가 전해져요. 무량수전 앞에 서면 소백산 능선이 겹겹이 펼쳐집니다.',
    latitude: 36.99847,
    longitude: 128.6871,
  },
  {
    id: 7,
    name: '경주 남산',
    region: '경주',
    category: 'EARNEST',
    description: '산 곳곳의 석탑과 마애불. 돌에 마음을 새겨 온 산이에요',
    story: '신라 사람들이 부처의 산으로 여긴 곳입니다. 골짜기마다 바위에 새긴 불상과 돌탑이 남아 있어 산 전체가 야외 박물관 같아요. 수백 년에 걸쳐 돌에 마음을 새긴 흔적을 걸으며 만날 수 있습니다.',
    latitude: 35.79565,
    longitude: 129.22186,
  },
  {
    id: 8,
    name: '영덕 해맞이공원',
    region: '영덕',
    category: 'NEW_START',
    description: '동해 일출과 함께 새로운 30일을 시작하기 좋은 곳',
    story: '동해를 따라 이어지는 영덕 블루로드 위의 공원입니다. 대게의 고장답게 근처 창포말등대는 대게 집게 모양을 하고 있어요. 탁 트인 바다 위로 떠오르는 해를 보며 새 다짐을 하기 좋은 곳입니다.',
    latitude: 36.42628,
    longitude: 129.43484,
  },
  {
    id: 9,
    name: '문무대왕릉',
    region: '경주',
    category: 'NEW_START',
    description: '죽어서도 나라를 지키겠다는 다짐이 잠든 바다 위 왕릉',
    story: '신라 문무왕이 잠들었다고 전해지는 바다 위 바위입니다. 왕은 죽어서 용이 되어 나라를 지키겠다는 유언을 남겼다고 해요. 파도를 맞으며 그 자리를 지키는 대왕암은 오래 이어지는 다짐을 떠올리게 합니다.',
    latitude: 35.73826,
    longitude: 129.48688,
  },
  {
    id: 10,
    name: '하회마을 삼신당 신목',
    region: '안동',
    category: 'EARNEST',
    description: '600년 된 느티나무에 소원지를 매달아 비는 곳',
    story: '안동 하회마을 한가운데 서 있는 약 600년 된 느티나무입니다. 마을을 지키는 신목으로 여겨져 왔고, 사람들은 소원을 적은 종이를 나무 둘레에 매달아요. 수많은 소원지가 나무를 감싸고 있는 모습이 인상적인 곳입니다.',
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
  yearReviews: {} as Record<number, string>, // 소원 묶음(회차) → 1년 회고
  suggestionUse: { date: '', count: 0 }, // AI 추천 하루 횟수
  postcards: [] as Postcard[], // 내 엽서함
  letters: [] as (Omit<Letter, 'fromMe' | 'toNickname'> & { toMe: boolean })[], // 받은 엽서 (최신이 앞)
  suggestionTurn: 0, // 다시 추천받기마다 다음 고정 답변으로
  spotVisits: [] as { spotId: number; visitedOn: string; wishId: number | null }[], // 방문 인증 (지도의 별). 돌탑마다 명소별 한 번
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

// WISH-02 고정 답변. 실제 AI가 붙기 전까지 어떤 소원을 적어도 이 답변을 번갈아 보여줍니다.
const SUGGESTION_LIMIT_PER_DAY = 10;
const FIXED_SUGGESTIONS: WishSuggestion[] = [
  {
    actionGoals: ['매일 영어 문장 3개 소리 내어 읽기', '하루 10분 영어 영상 따라 말하기', '매일 영어로 일기 한 문장 쓰기'],
    spot: { spotId: 3, spotName: '호미곶 해맞이광장', reason: '새로운 나를 시작하는 소원이니, 해가 가장 먼저 뜨는 곳에서 다짐해 봐요.' },
  },
  {
    actionGoals: ['점심시간에 영어 단어 10개 외우기', '자기 전 영어 팟캐스트 10분 듣기', '하루 한 번 영어로 혼잣말하기'],
    spot: { spotId: 2, spotName: '문경새재 과거길', reason: '옛 선비들이 꿈을 안고 걷던 길에서 꾸준함을 다져 봐요.' },
  },
];

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

// 지난 돌탑의 매일 기록 예시. 네 번에 한 번은 글 없이 쌓은 날
const DAILY_NOTES = ['오늘도 해냈다.', '귀찮았지만 끝까지 했다.', '아침에 바로 끝내니 마음이 편하다.', '생각보다 재밌었다.', '내일은 더 일찍 해야지.', '조금씩 익숙해지는 느낌이다.'];
function dailyLog(actionGoal: string, day: number) {
  if (day % 4 === 3) return null;
  return day % 8 === 0 ? `${actionGoal} 완료!` : DAILY_NOTES[day % DAILY_NOTES.length];
}

// 시나리오별 초기 데이터
function seed() {
  if (MOCK_SCENARIO === 'empty') return;

  // 기존 회원: 첫 번째 소원(1년 전) 돌탑 12개 + 1년 회고, 두 번째 소원 돌탑 6개 + 13일째 진행 중인 돌탑 1개
  db.onboarded = true;
  db.nickname = '소원지기';
  const currentStart = addDays(today(), -12);
  db.journeyStartedOn = addDays(today(), -569); // 1년(365일) 전 묶음이 끝나고 204일째
  db.yearReviews[1] = '하루를 미루지 않는 사람이 되었어요. 작게라도 매일 쌓으면 된다는 걸 알았고, 올해도 그렇게 해 보려고 해요.';
  // 첫 번째 소원 때 호미곶과 영덕에 한 번씩 다녀옴. 진행 중인 돌탑의 영덕 배경도 이 방문으로 열립니다.
  // 데모: 명소 10곳을 모두 방문해 일러스트를 감상할 수 있게 합니다. (첫 번째 소원 기간, 지금 돌탑에서는 다시 인증 가능)
  db.spotVisits = spots.map((spot, i) => ({ spotId: spot.id, visitedOn: addDays(today(), -560 + i * 30), wishId: 21 + i }));
  // 친구 지기가 보낸 엽서 한 장 (아직 안 읽음)
  // 데모: 엽서 40장(명소 10곳 × 4종)을 모두 모은 상태로 시작해 어떤 엽서든 보낼 수 있게 합니다.
  db.postcards = spots.flatMap((spot) =>
    [1, 2, 3, 4].map((style) => ({ spotId: spot.id, spotName: spot.name, style, issuedAt: `${addDays(today(), -30)}T10:00:00+09:00` })),
  );
  db.letters = [
    {
      letterId: 801,
      spotId: 8,
      spotName: '영덕 해맞이공원',
      style: 3,
      message: '영덕에서 해 뜨는 거 보다가 네 생각 났어! 우리 30일 꼭 채우자.',
      fromNickname: '지기',
      toMe: false,
      read: false,
      sentAt: new Date().toISOString(),
    },
  ];

  // 오래된 것부터. 첫 번째 소원은 30일 간격, 두 번째 소원은 30일 + 이틀 간격
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
    { id: 21, daysAgo: 569, content: '영어 회화 시작하기', actionGoal: '하루 한 문장 말하기', spotId: 2, stones: 12, result: 'NOT_ACHIEVED', reflection: '입 떼는 게 제일 어려웠다' },
    { id: 22, daysAgo: 539, content: '스트레칭 습관 만들기', actionGoal: '아침에 5분 스트레칭', spotId: 5, stones: 30, result: 'ACHIEVED', reflection: '허리가 정말 덜 아프다' },
    { id: 23, daysAgo: 509, content: '가계부 쓰기', actionGoal: '자기 전에 지출 적기', spotId: 7, stones: 21, result: 'ACHIEVED', reflection: '새는 돈이 보이기 시작했다' },
    { id: 24, daysAgo: 479, content: '핸드폰 덜 보기', actionGoal: '침대에 들고 가지 않기', spotId: 9, stones: 7, result: 'NOT_ACHIEVED', reflection: '다음엔 충전기를 거실로' },
    { id: 25, daysAgo: 449, content: '요리 열 가지 배우기', actionGoal: '주말마다 새 요리 하기', spotId: 1, stones: 26, result: 'ACHIEVED', reflection: '된장찌개는 이제 자신 있다' },
    { id: 26, daysAgo: 419, content: '자격증 공부하기', actionGoal: '매일 기출 10문제', spotId: 3, stones: 30, result: 'ACHIEVED', reflection: '합격 문자를 받은 날을 잊지 못한다' },
    { id: 27, daysAgo: 389, content: '부모님께 자주 전화하기', actionGoal: '퇴근길에 전화하기', spotId: 4, stones: 19, result: 'ACHIEVED', reflection: '엄마 목소리가 밝아졌다' },
    { id: 28, daysAgo: 359, content: '일찍 잠들기', actionGoal: '11시에 불 끄기', spotId: 6, stones: 11, result: 'NOT_ACHIEVED', reflection: '야근 앞에서 자꾸 무너졌다' },
    { id: 29, daysAgo: 329, content: '사진 한 장씩 찍기', actionGoal: '하루 한 장 남기기', spotId: 8, stones: 28, result: 'ACHIEVED', reflection: '평범한 날도 예뻤다' },
    { id: 30, daysAgo: 299, content: '기타 코드 익히기', actionGoal: '매일 10분 연습', spotId: 10, stones: 15, result: 'NOT_ACHIEVED', reflection: '손끝이 먼저 포기했다' },
    { id: 31, daysAgo: 269, content: '계단으로 다니기', actionGoal: '엘리베이터 대신 계단', spotId: 2, stones: 30, result: 'ACHIEVED', reflection: '이제 5층은 숨이 안 찬다' },
    { id: 32, daysAgo: 239, content: '감사 일기 쓰기', actionGoal: '감사한 일 하나 적기', spotId: 5, stones: 23, result: 'ACHIEVED', reflection: '작은 일에 웃게 되었다' },
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
    for (let i = 0; i < tower.stones; i++) addStone(tower.id, addDays(startDate, i), dailyLog(tower.actionGoal, i));
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
  notify('YEAR_REVIEW', 1, YEAR_REVIEW_MESSAGE);
  db.notifications[0].isRead = true;
  notify('NUDGE', 10, '돌돌이님이 콕 찔렀어요! 오늘의 돌을 쌓아 보세요.');
  notify('POSTCARD', 801, '지기님이 엽서를 보냈어요');
  notify('CHEER', 902, '지기님이 응원을 보냈어요.');
}

const YEAR_REVIEW_MESSAGE = '1년이 지났어요. 그동안 쌓은 돌탑을 돌아봐요';

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
  // TOWER-04: 묶음이 끝나면 돌탑이 있을 때 한 번 알림
  const finished = roundOf(today()) - 1;
  if (
    finished > 0 &&
    finishedTowers(finished).length > 0 &&
    !db.notifications.some((n) => n.type === 'YEAR_REVIEW' && n.targetId === finished)
  ) {
    notify('YEAR_REVIEW', finished, YEAR_REVIEW_MESSAGE);
  }
}

const roundOf = (date: string) =>
  db.journeyStartedOn ? Math.floor(diffDays(db.journeyStartedOn, date) / 365) + 1 : 1;

const isVisited = (spotId: number) => db.spotVisits.some((v) => v.spotId === spotId);
// 지금 진행 중인 돌탑 기간에 인증했는지 (돌탑이 없으면 돌탑 없이 한 인증)
const visitedThisTower = (spotId: number) =>
  db.spotVisits.some((v) => v.spotId === spotId && v.wishId === (openWish()?.id ?? null));

const finishedTowers = (round: number) =>
  db.wishes.filter((w) => w.status !== 'ACTIVE' && roundOf(w.endDate) === round);

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
      hasUnreadLetter: db.letters.some((l) => !l.read),
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
      spot: { id: spot.id, name: spot.name, category: spot.category, visited: isVisited(spot.id), backgroundImageUrl: null },
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

  suggestForWish(content: string): WishSuggestion {
    if (!content.trim()) throw new ApiError('INVALID_INPUT', '소원을 먼저 적어 주세요.', 400);
    if (db.suggestionUse.date !== today()) db.suggestionUse = { date: today(), count: 0 };
    if (db.suggestionUse.count >= SUGGESTION_LIMIT_PER_DAY) {
      throw new ApiError('AI_RATE_LIMIT', '오늘은 추천을 다 썼어요.', 429);
    }
    db.suggestionUse.count++;
    return FIXED_SUGGESTIONS[db.suggestionTurn++ % FIXED_SUGGESTIONS.length];
  },

  getStones(wishId: number): { content: StoneItem[]; page: number; size: number; hasNext: boolean } {
    const content = db.stones
      .filter((stone) => stone.wishId === wishId)
      .sort((a, b) => b.stoneDate.localeCompare(a.stoneDate))
      .map(({ id, stoneDate, type, content: text }) => ({ stoneId: id, stoneDate, type, content: text }));
    return { content, page: 0, size: 30, hasNext: false };
  },

  getWishes(round?: number): WishSummary[] {
    runScheduler();
    return finishedTowers(round ?? roundOf(today()))
      .map((w) => ({
        wishId: w.id,
        content: w.content,
        startDate: w.startDate,
        endDate: w.endDate,
        stoneCount: stoneCount(w.id),
        spotId: w.spotId,
        spotName: spotOf(w.spotId).name,
        visited: isVisited(w.spotId),
        result: w.result,
        reflection: w.reflection,
      }));
  },

  getRounds(): RoundSummary[] {
    runScheduler();
    const current = roundOf(today());
    const rounds = new Set([current, ...db.wishes.filter((w) => w.status !== 'ACTIVE').map((w) => roundOf(w.endDate))]);
    return [...rounds]
      .sort((a, b) => a - b)
      .map((round) => {
        const towerCount = finishedTowers(round).length;
        const review = db.yearReviews[round] ?? null;
        return {
          round,
          towerCount,
          reviewAt: db.journeyStartedOn ? addDays(db.journeyStartedOn, 365 * round) : null,
          canWriteReview: review === null && round < current && towerCount > 0,
          review,
          visits: db.spotVisits
            .filter((v) => roundOf(v.visitedOn) === round)
            .map((v) => ({ spotId: v.spotId, spotName: spotOf(v.spotId).name, visitedOn: v.visitedOn })),
        };
      });
  },

  writeYearReview(round: number, content: string): YearReviewResponse {
    runScheduler();
    if (round >= roundOf(today()) || finishedTowers(round).length === 0) {
      throw new ApiError('YEAR_REVIEW_NOT_AVAILABLE', '1년이 지나고 돌탑이 있을 때 쓸 수 있어요.', 400);
    }
    if (db.yearReviews[round]) throw new ApiError('YEAR_REVIEW_ALREADY', '이미 1년 회고를 남겼어요.', 409);
    db.yearReviews[round] = content;
    return { round, content };
  },

  getSpots(category?: string): Spot[] {
    return spots
      .filter((s) => !category || s.category === category)
      .map((s) => ({ ...s, radiusM: SPOT_RADIUS_M, visited: isVisited(s.id), visitedThisTower: visitedThisTower(s.id) }));
  },

  createVisit(spotId: number): VisitResponse {
    const firstVisit = !visitedThisTower(spotId);
    if (!firstVisit) return { visitId: spotId, firstVisit, postcard: null };
    db.spotVisits.push({ spotId, visitedOn: today(), wishId: openWish()?.id ?? null });
    // 그 명소 엽서 4종 중 아직 없는 1장
    const owned = db.postcards.filter((p) => p.spotId === spotId).map((p) => p.style);
    const missing = [1, 2, 3, 4].filter((style) => !owned.includes(style));
    if (missing.length === 0) return { visitId: spotId, firstVisit, postcard: null };
    const postcard: Postcard = {
      spotId,
      spotName: spotOf(spotId).name,
      style: missing[Math.floor(Math.random() * missing.length)],
      issuedAt: new Date().toISOString(),
    };
    db.postcards.push(postcard);
    return { visitId: spotId, firstVisit, postcard };
  },

  getPostcards(): Postcard[] {
    return [...db.postcards].sort((a, b) => a.spotId - b.spotId || a.style - b.style);
  },

  sendLetter(body: SendLetterRequest): { letterId: number } {
    if (!db.postcards.some((p) => p.spotId === body.spotId && p.style === body.style)) {
      throw new ApiError('POSTCARD_NOT_OWNED', '가진 엽서만 보낼 수 있어요.', 403);
    }
    const message = body.message.trim();
    if (!message || message.length > 100) throw new ApiError('INVALID_INPUT', '글은 1~100자로 적어 주세요.', 400);
    const friend = body.receiverId === undefined ? null : db.friends.find((f) => f.id === body.receiverId);
    if (body.receiverId !== undefined && !friend) throw new ApiError('FRIEND_NOT_FOUND', '친구를 찾을 수 없어요.', 404);
    const letterId = db.nextId++;
    // 친구에게 보낸 엽서는 친구 우체통으로 가므로 내 받은 엽서에는 나에게 보낸 것만 쌓입니다.
    if (!friend) {
      db.letters.unshift({
        letterId,
        spotId: body.spotId,
        spotName: spotOf(body.spotId).name,
        style: body.style,
        message,
        fromNickname: db.nickname,
        toMe: true,
        read: false,
        sentAt: new Date().toISOString(),
      });
    }
    return { letterId };
  },

  getReceivedLetters(): Page<Letter> {
    const content = db.letters.map(({ toMe, ...letter }) => ({ ...letter, fromMe: toMe, toNickname: db.nickname }));
    return { content, page: 0, size: 50, hasNext: false };
  },

  markLetterRead(letterId: number): void {
    const letter = db.letters.find((l) => l.letterId === letterId);
    if (!letter) throw new ApiError('LETTER_NOT_FOUND', '엽서를 찾을 수 없어요.', 404);
    letter.read = true;
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
