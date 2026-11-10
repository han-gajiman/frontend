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
import {
  type PlanCalendar,
  type PlanTodo,
  TODO_SUGGESTION_LIMIT,
  TODOS_PER_DAY,
  type TodoSuggestion,
  WISH_PLAN_LIMIT,
  type WishPlan,
} from '@/features/plan/types';
import { LETTER_MAX_LENGTH, type Letter, type Postcard, type SendLetterRequest } from '@/features/postcard/types';
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
    story: '팔공산 관봉 꼭대기에서 갓 모양 돌을 쓰고 앉아 있는 석조여래좌상이에요. 통일신라 때 의현스님이 돌아가신 어머니를 위해 바위를 깎아 만들었다고 전해져요. 정성껏 빌면 한 가지 소원은 꼭 들어준다고 해서 오늘도 많은 이가 계단을 올라요. 당신의 단 하나의 소원을 이곳에 맡겨 보세요.',
    latitude: 35.98158,
    longitude: 128.73655,
  },
  {
    id: 2,
    name: '문경새재 과거길',
    region: '문경',
    category: 'PASS',
    description: '과거 보러 가던 선비들이 합격을 빌던 책바위. 지금도 돌을 쌓으며 소원을 빌어요',
    story: '영남 선비들이 과거를 보러 한양으로 넘던 옛 고갯길이에요. 추풍령은 추풍낙엽, 죽령은 미끄러진다는 속설에 선비들은 \'기쁜 소식을 듣는다\'는 문경(聞慶)의 길을 택했대요. 고갯길의 책바위에 빌면 장원 급제한다는 전설도 있어요. 오늘의 노력이 기쁜 소식으로 돌아오길 빌어요.',
    latitude: 36.76844,
    longitude: 128.07522,
  },
  {
    id: 3,
    name: '호미곶 해맞이광장',
    region: '포항',
    category: 'NEW_START',
    description: '바다 위 상생의 손 너머로 한반도에서 가장 먼저 해가 뜨는 곳',
    story: '한반도 호랑이 꼬리에 해당하는 땅끝, 해가 가장 먼저 뜨는 곳으로 알려진 광장이에요. 김정호는 대동여지도를 만들며 이곳을 여러 번 걸어 가장 동쪽 땅임을 확인했다고 전해져요. 새천년을 맞아 세운 \'상생의 손\'은 바다와 육지에서 서로에게 손을 내밀고 있어요. 새로운 시작 앞에서, 먼저 손을 내밀어 보세요.',
    latitude: 36.07676,
    longitude: 129.56793,
  },
  {
    id: 4,
    name: '동화사',
    region: '대구',
    category: 'EARNEST',
    description: '갓바위와 같은 팔공산 품에 안긴 천년 고찰. 갓바위와 함께 걸어 보세요',
    story: '팔공산 자락에서 1,500년 넘게 자리를 지켜 온 절이에요. 신라 흥덕왕 때 심지왕사가 절을 다시 세울 무렵, 한겨울인데도 오동나무 꽃이 활짝 피었대요. 그래서 \'오동나무 꽃\'이라는 뜻의 동화사(桐華寺)라는 이름을 얻었어요. 계절을 거슬러 핀 꽃처럼, 간절한 마음은 때를 기다리지 않아요.',
    latitude: 35.99322,
    longitude: 128.70424,
  },
  {
    id: 5,
    name: '불국사·석굴암',
    region: '경주',
    category: 'EARNEST',
    description: '천 년 넘게 사람들의 소원을 들어 온 신라의 절과 석굴',
    story: '1995년 함께 유네스코 세계유산이 된 신라의 절과 석굴이에요. 『삼국유사』에 따르면 효심 깊은 재상 김대성이 751년에 짓기 시작했다고 해요. 이번 생의 부모를 위해 불국사를, 전생의 부모를 위해 석굴암을 세웠대요. 소중한 사람을 위한 소원을 하나 남겨 보세요.',
    latitude: 35.78991,
    longitude: 129.33184,
  },
  {
    id: 6,
    name: '부석사',
    region: '영주',
    category: 'EARNEST',
    description: '무량수전 앞에서 노을을 보며 조용히 다짐하기 좋은 곳',
    story: '676년 의상대사가 왕명을 받아 세운 화엄의 절이에요. 의상을 사모한 선묘는 용이 되어 그의 귀국길을 지키고, 절터를 막던 무리 앞에 큰 바위를 띄워 물리쳤대요. 그 바위가 무량수전 서쪽에 남은 \'뜬 돌\', 부석이에요. 간절한 마음은 바위도 움직인다고 믿어 보세요.',
    latitude: 36.99847,
    longitude: 128.6871,
  },
  {
    id: 7,
    name: '경주 남산',
    region: '경주',
    category: 'EARNEST',
    description: '산 곳곳의 석탑과 마애불. 돌에 마음을 새겨 온 산이에요',
    story: '절터 100여 곳, 석불 80여 구, 석탑 60여 기가 흩어진 지붕 없는 박물관이에요. 서쪽 기슭의 나정에는 신라 첫 임금 박혁거세의 탄생 이야기가 깃들어 있어요. 신라 사람들은 이 산을 부처의 땅으로 여겨 바위마다 불상을 새겼어요. 천 년 전 그들처럼, 오늘의 다짐을 마음에 새겨 보세요.',
    latitude: 35.79565,
    longitude: 129.22186,
  },
  {
    id: 8,
    name: '영덕 해맞이공원',
    region: '영덕',
    category: 'NEW_START',
    description: '동해 일출과 함께 새로운 30일을 시작하기 좋은 곳',
    story: '강구에서 축산으로 이어지는 바닷길 위, 맑은 일출로 이름난 해안 공원이에요. 1997년 큰 불로 해안과 산이 모두 타 버렸어요. 사람들은 그 자리를 자연 그대로 다시 가꿔 지금의 공원을 만들었어요. 다 타 버린 땅도 다시 피어나듯, 오늘이 당신의 새 출발이에요.',
    latitude: 36.42628,
    longitude: 129.43484,
  },
  {
    id: 9,
    name: '문무대왕릉',
    region: '경주',
    category: 'NEW_START',
    description: '죽어서도 나라를 지키겠다는 다짐이 잠든 바다 위 왕릉',
    story: '경주 봉길리 앞바다의 바위섬, 신라 문무왕의 수중릉이에요. 삼국 통일을 이룬 문무왕은 죽어서 용이 되어 왜구를 막겠다며 동해에 묻어 달라고 유언했어요. 아들 신문왕은 용이 된 아버지가 드나들도록 감은사 법당 아래 물길을 냈대요. 지키고 싶은 다짐을 파도에 실어 보내 보세요.',
    latitude: 35.73826,
    longitude: 129.48688,
  },
  {
    id: 10,
    name: '하회마을 삼신당 신목',
    region: '안동',
    category: 'EARNEST',
    description: '600년 된 느티나무에 소원지를 매달아 비는 곳',
    story: '하회마을 한가운데서 600년 넘게 마을을 지켜 온 느티나무 신목이에요. 마을 사람들은 정월 대보름마다 이곳에서 마을의 평안과 풍년을 빌어 왔어요. 지금은 나무 둘레에 소원을 적은 하얀 종이가 빼곡히 매달려 있어요. 수백 년 소원을 들어 온 나무에 당신의 소원도 걸어 두세요.',
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
  sentLetters: [] as Letter[], // 보낸 엽서 (나에게 보낸 것 포함, 최신이 앞)
  suggestionTurn: 0, // 다시 추천받기마다 다음 고정 답변으로
  spotVisits: [] as { spotId: number; visitedOn: string; wishId: number | null }[], // 방문 인증 (지도의 별). 돌탑마다 명소별 한 번
  wishes: [] as MockWish[],
  stones: [] as MockStone[],
  todos: [] as PlanTodo[], // PLAN-02 날짜별 할 일
  wishPlans: [] as WishPlan[], // PLAN-01 앞으로 할 소원 메모
  todoSuggestionUse: { date: '', count: 0 }, // PLAN-03 할 일 추천 하루 횟수 (소원 추천과 따로)
  todoSuggestionTurn: 0,
  friends: [] as MockFriend[],
  notifications: [] as AppNotification[], // 최신이 앞
  cheers: {} as Record<number, Cheer[]>, // wishId → 응원 (최신이 앞)
  myInviteCodes: [] as string[],
  acceptedInviteCodes: [] as string[],
  nextId: 100,
});

let db = emptyDb();

// 데모 웹 로그인 화면에 미리 채워 두는 계정 (목 서버 전용)
export const MOCK_DEMO_ACCOUNT = { email: 'demo@hangajiman.app', password: 'password123' };

// 자체 로그인 계정 (이메일 → 비밀번호·닉네임). 목 서버라 평문으로 둡니다.
const localAccounts: Record<string, { password: string; nickname: string }> = {
  [MOCK_DEMO_ACCOUNT.email]: { password: MOCK_DEMO_ACCOUNT.password, nickname: '소원지기' },
};
// 비밀번호 찾기 인증코드: 목 모드에서는 메일 없이 항상 이 코드
export const MOCK_RESET_CODE = '123456';

const today = () => addDays(kstToday(), db.dayOffset);

// AUTH-04 닉네임은 회원끼리 겹치면 안 됩니다. 목 서버에서는 친구들 닉네임과 겹치는지만 봅니다.
const takenByFriends = (nickname: string) => db.friends.some((f) => f.nickname === nickname.trim());
function requireFreeNickname(nickname: string): string {
  const next = nickname.trim();
  if (takenByFriends(next)) throw new ApiError('NICKNAME_DUPLICATED', '이미 쓰는 닉네임이에요. 다른 닉네임을 적어 주세요.', 409);
  return next;
}

// PLAN-03 고정 답변 (목 서버). 다시 추천받기마다 다음 문구
const FIXED_TODO_SUGGESTIONS = [
  '영어 단어 20개 소리 내어 외우기',
  '어제 외운 단어 10개 복습하기',
  '관심 회사 채용 공고 1개 읽기',
  '알고리즘 문제 1개 풀고 풀이 정리하기',
  '포트폴리오 프로젝트 커밋 1개 남기기',
  '기술 블로그 글 1편 읽고 요약하기',
];

// WISH-02 고정 답변. 실제 AI가 붙기 전까지 어떤 소원을 적어도 이 답변을 번갈아 보여줍니다.
const SUGGESTION_LIMIT_PER_DAY = 10;
const FIXED_SUGGESTIONS: Omit<WishSuggestion, 'remaining'>[] = [
  {
    actionGoals: ['매일 영어 문장 3개 소리 내어 읽기', '하루 10분 영어 영상 따라 말하기', '매일 영어로 일기 한 문장 쓰기'],
    spot: { spotId: 3, spotName: '호미곶 해맞이광장', reason: '새로운 나를 시작하는 소원이니, 해가 가장 먼저 뜨는 곳에서 다짐해 봐요.' },
    fallback: false,
    supportMessage: null,
  },
  {
    actionGoals: ['점심시간에 영어 단어 10개 외우기', '자기 전 영어 팟캐스트 10분 듣기', '하루 한 번 영어로 혼잣말하기'],
    spot: { spotId: 2, spotName: '문경새재 과거길', reason: '옛 선비들이 꿈을 안고 걷던 길에서 꾸준함을 다져 봐요.' },
    fallback: false,
    supportMessage: null,
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

// 받은 엽서 예시 글 (긴 글, 줄바꿈 섞음)
const LETTER_SENDERS = ['지기', '돌돌이', '면주', '현', '바람결', '새벽별'];
const LONG_LETTERS = [
  '오늘 드디어 여기 왔어! 생각보다 훨씬 넓고 예뻐서 깜짝 놀랐어. 네 소원도 같이 빌었으니까 꼭 이루어질 거야. 우리 남은 날도 하루도 빼먹지 말고 끝까지 같이 쌓자. 진짜 응원해!!',
  '여기 와 보니까 네가 왜 이곳을 골랐는지 알겠더라. 바람도 좋고 하늘도 맑아서 한참을 앉아 있었어. 우리 30일 꼭 채우자! 다 채우면 같이 오자.',
  '오늘도 돌 하나 쌓았지?\n나는 오늘 좀 힘들었는데 네 돌탑 보고 다시 힘냈어.\n조금만 더 가면 반이야. 끝까지 같이 가자, 응원할게!',
  '엽서 받으면 꼭 답장해 줘! 요즘 매일 아침에 일어나서 제일 먼저 하는 게 돌 쌓기야. 덕분에 습관이 생긴 것 같아. 너도 꾸준히 하고 있지? 고마워 정말로.',
  '하루하루 쌓다 보면 어느새 탑이 되어 있을 거야.\n\n오늘 여기서 네 소원도 같이 빌었어. 꼭 이루어지길 바라. 다음 달에는 우리 같이 가 보자.',
  '사진으로만 보던 곳을 직접 와 보니 훨씬 멋지다. 소원 하나만 빌 수 있다고 해서 고민하다가 네 합격을 빌었어. 이번엔 진짜 될 거야. 늘 응원하고 있어!',
  'ㅋㅋㅋ 여기 사람 진짜 많다\n그래도 줄 서서 소원 빌고 왔어\n돌탑도 하나 몰래 올려놓고 옴\n너도 오늘 쌓는 거 잊지 마!!\n내일 또 콕 찌를 거야',
];

// 시나리오별 초기 데이터
function seed() {
  if (MOCK_SCENARIO === 'empty') return;

  // 기존 회원: 첫 번째 소원(1년 전) 돌탑 12개 + 1년 회고, 두 번째 소원 돌탑 6개 + 13일째 진행 중인 돌탑 1개
  db.onboarded = true;
  db.nickname = '소원지기';
  const fresh = MOCK_SCENARIO === 'fresh'; // 처음 쌓는 날: 진행 중 돌탑이 오늘 시작, 돌 0개
  const currentStart = fresh ? today() : addDays(today(), -12);
  db.journeyStartedOn = addDays(today(), -569); // 1년(365일) 전 묶음이 끝나고 204일째
  db.yearReviews[1] = '하루를 미루지 않는 사람이 되었어요. 작게라도 매일 쌓으면 된다는 걸 알았고, 올해도 그렇게 해 보려고 해요.';
  // 첫 번째 소원 때 호미곶과 영덕에 한 번씩 다녀옴. 진행 중인 돌탑의 영덕 배경도 이 방문으로 열립니다.
  // 첫 번째 소원 때 갓바위·호미곶·영덕을 한 번씩 방문 (진행 중인 돌탑의 영덕 배경도 이 방문으로 열림). 엽서는 데모라 40장 모두 해금
  db.spotVisits = [
    { spotId: 1, visitedOn: addDays(today(), -470), wishId: 24 },
    { spotId: 3, visitedOn: addDays(today(), -409), wishId: 26 },
    { spotId: 8, visitedOn: addDays(today(), -317), wishId: 29 },
  ];
  // 친구 지기가 보낸 엽서 한 장 (아직 안 읽음)
  // 데모: 엽서 40장(명소 10곳 × 4종)을 모두 모은 상태로 시작해 어떤 엽서든 보낼 수 있게 합니다.
  db.postcards = spots.flatMap((spot) =>
    [1, 2, 3, 4].map((style) => ({ spotId: spot.id, spotName: spot.name, style, issuedAt: `${addDays(today(), -30)}T10:00:00+09:00` })),
  );
  // 받은 엽서 40장: 명소 10곳 × 4종을 한 장씩, 글은 최대 길이(100자) 가까이 채워 엽서 그림과 글이 겹치는지 확인합니다.
  // 첫 장(영덕 3번)만 안 읽은 상태
  db.letters = spots.flatMap((spot, si) =>
    [1, 2, 3, 4].map((style, ti) => {
      const n = si * 4 + ti;
      return {
        letterId: 801 + n,
        spotId: spot.id,
        spotName: spot.name,
        style,
        message: LONG_LETTERS[n % LONG_LETTERS.length].slice(0, LETTER_MAX_LENGTH),
        fromNickname: LETTER_SENDERS[n % LETTER_SENDERS.length],
        toMe: false,
        read: true,
        sentAt: `${addDays(today(), -n)}T${String(9 + (n % 12)).padStart(2, '0')}:20:00+09:00`,
      };
    }),
  );
  const unread = db.letters.findIndex((l) => l.spotId === 8 && l.style === 3);
  const [first] = db.letters.splice(unread, 1);
  db.letters.unshift({ ...first, read: false, sentAt: new Date().toISOString() });
  db.sentLetters = [
    {
      letterId: 802,
      spotId: 3,
      spotName: '호미곶 해맞이광장',
      style: 2,
      message: '지기야 호미곶 손 조형물 진짜 크더라. 다음엔 같이 가자!',
      fromNickname: db.nickname || '소원지기',
      toNickname: '지기',
      fromMe: true,
      read: true,
      sentAt: `${addDays(today(), -3)}T18:20:00+09:00`,
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
  if (!fresh) for (let i = 0; i < 12; i++) addStone(10, addDays(currentStart, i), i % 2 ? '영어 단어 20개 외움' : null);

  // 소원 캘린더: 어제 끝낸 할 일, 오늘·앞으로 할 일, 이번 돌탑이 끝난 다음 날 시작할 소원 메모
  const todo = (offset: number, content: string, done = false) =>
    db.todos.push({ todoId: db.nextId++, date: addDays(today(), offset), content, done });
  todo(-1, '영어 단어 20개 외우기', true);
  todo(-1, '이력서 초안 쓰기', true);
  todo(0, '영어 단어 20개 외우기');
  todo(0, '알고리즘 문제 1개 풀기');
  todo(1, '포트폴리오 README 다듬기');
  todo(3, '모의 면접 영상 보기');
  db.wishPlans.push({
    planId: db.nextId++,
    content: '하프 마라톤 완주하기',
    startDate: addDays(currentStart, TOWER_DAYS),
    endDate: addDays(currentStart, TOWER_DAYS * 2 - 1),
  });

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
    if (Object.values(localAccounts).some((a) => a.nickname === body.nickname.trim()) || takenByFriends(body.nickname)) {
      throw new ApiError('NICKNAME_DUPLICATED', '이미 쓰는 닉네임이에요. 다른 닉네임을 적어 주세요.', 409);
    }
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
    db.nickname = requireFreeNickname(body.nickname);
    db.onboarded = true;
  },

  changeNickname(nickname: string): void {
    const next = nickname.trim();
    if (!next || next.length > 30) throw new ApiError('INVALID_INPUT', '닉네임은 1~30자로 적어 주세요.', 400);
    db.nickname = requireFreeNickname(next);
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
      stats: {
        towerCount: db.wishes.filter((w) => w.status !== 'ACTIVE').length,
        visitedSpotCount: new Set(db.spotVisits.map((v) => v.spotId)).size,
        postcardCount: db.postcards.length,
      },
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

  createStone(wishId: number, content: string | null, doneTodoIds: number[] = []): CreateStoneResponse {
    runScheduler();
    const wish = findWish(wishId);
    if (wish.status !== 'ACTIVE') throw new ApiError('WISH_NOT_ACTIVE', '진행 중인 돌탑이 아니에요.', 400);
    if (db.stones.some((s) => s.wishId === wishId && s.stoneDate === today())) {
      throw new ApiError('STONE_ALREADY_TODAY', '오늘은 이미 돌을 쌓았어요.', 409);
    }

    const stone = addStone(wishId, today(), content);
    // PLAN-02 기록에 넣은 오늘 할 일은 완료 (오늘 것만)
    db.todos.forEach((t) => {
      if (doneTodoIds.includes(t.todoId) && t.date === today()) t.done = true;
    });
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

  // ---- PLAN-01~03 소원 캘린더 ----

  getPlanCalendar(requested?: string): PlanCalendar {
    runScheduler();
    const month = requested ?? today().slice(0, 7);
    const first = `${month}-01`;
    const last = addDays(addDays(first, 32).slice(0, 8) + '01', -1); // 그 달 마지막 날
    const overlaps = (start: string, end: string) => start <= last && end >= first;
    return {
      month,
      today: today(),
      wishes: db.wishes
        .filter((w) => overlaps(w.startDate, w.endDate))
        .map((w) => ({ wishId: w.id, content: w.content, startDate: w.startDate, endDate: w.endDate, status: w.status })),
      wishPlans: db.wishPlans.filter((p) => overlaps(p.startDate, p.endDate)),
      todos: db.todos.filter((t) => t.date >= first && t.date <= last),
    };
  },

  getTodayTodos(): PlanTodo[] {
    return db.todos.filter((t) => t.date === today());
  },

  addTodo(date: string, content: string): PlanTodo {
    const text = content.trim();
    if (!text) throw new ApiError('INVALID_INPUT', '할 일을 적어 주세요.', 400);
    if (date < today()) throw new ApiError('PLAN_PAST_DATE', '지난 날짜에는 적을 수 없어요.', 400);
    if (db.todos.filter((t) => t.date === date).length >= TODOS_PER_DAY) {
      throw new ApiError('PLAN_TODO_LIMIT', `하루에 ${TODOS_PER_DAY}개까지 적을 수 있어요.`, 400);
    }
    const todo = { todoId: db.nextId++, date, content: text, done: false };
    db.todos.push(todo);
    return todo;
  },

  updateTodo(todoId: number, change: { done?: boolean }): void {
    const todo = db.todos.find((t) => t.todoId === todoId);
    if (!todo) throw new ApiError('PLAN_TODO_NOT_FOUND', '할 일을 찾을 수 없어요.', 404);
    if (todo.date < today()) throw new ApiError('PLAN_PAST_DATE', '지난 날짜는 바꿀 수 없어요.', 400);
    if (change.done !== undefined) todo.done = change.done;
  },

  deleteTodo(todoId: number): void {
    const todo = db.todos.find((t) => t.todoId === todoId);
    if (!todo) throw new ApiError('PLAN_TODO_NOT_FOUND', '할 일을 찾을 수 없어요.', 404);
    if (todo.date < today()) throw new ApiError('PLAN_PAST_DATE', '지난 날짜는 바꿀 수 없어요.', 400);
    db.todos = db.todos.filter((t) => t.todoId !== todoId);
  },

  suggestTodo(date: string): TodoSuggestion {
    runScheduler();
    const wish = db.wishes.find((w) => w.status === 'ACTIVE');
    if (!wish || date < wish.startDate || date > wish.endDate) {
      throw new ApiError('PLAN_SUGGEST_OUT_OF_TOWER', '진행 중인 돌탑 기간에만 추천받을 수 있어요.', 400);
    }
    if (db.todoSuggestionUse.date !== today()) db.todoSuggestionUse = { date: today(), count: 0 };
    if (db.todoSuggestionUse.count >= TODO_SUGGESTION_LIMIT) {
      throw new ApiError('AI_RATE_LIMIT', '오늘 할 일 추천을 다 썼어요.', 429);
    }
    db.todoSuggestionUse.count++;
    const content = FIXED_TODO_SUGGESTIONS[db.todoSuggestionTurn++ % FIXED_TODO_SUGGESTIONS.length];
    return { content, remaining: TODO_SUGGESTION_LIMIT - db.todoSuggestionUse.count, fallback: false };
  },

  getWishPlans(): WishPlan[] {
    return [...db.wishPlans].sort((a, b) => a.startDate.localeCompare(b.startDate));
  },

  addWishPlan(content: string, startDate: string): WishPlan {
    const text = content.trim();
    if (!text) throw new ApiError('INVALID_INPUT', '소원을 적어 주세요.', 400);
    if (startDate < today()) throw new ApiError('PLAN_PAST_DATE', '지난 날짜에는 적을 수 없어요.', 400);
    // 30일 동안 소원은 하나: 진행 중 돌탑 기간, 다른 메모의 30일과 겹치면 안 됨
    const active = db.wishes.find((w) => w.status === 'ACTIVE');
    if (active && startDate <= active.endDate) {
      throw new ApiError('PLAN_WISH_IN_TOWER', '진행 중인 돌탑이 끝난 뒤 날짜에만 적을 수 있어요.', 400);
    }
    const endDate = addDays(startDate, TOWER_DAYS - 1);
    if (db.wishPlans.some((p) => p.startDate <= endDate && p.endDate >= startDate)) {
      throw new ApiError('PLAN_WISH_OVERLAP', '다른 소원 메모의 30일과 겹쳐요.', 400);
    }
    if (db.wishPlans.length >= WISH_PLAN_LIMIT) {
      throw new ApiError('PLAN_WISH_LIMIT', `소원 메모는 ${WISH_PLAN_LIMIT}개까지 적을 수 있어요.`, 400);
    }
    const plan = { planId: db.nextId++, content: text, startDate, endDate: addDays(startDate, TOWER_DAYS - 1) };
    db.wishPlans.push(plan);
    return plan;
  },

  deleteWishPlan(planId: number): void {
    db.wishPlans = db.wishPlans.filter((p) => p.planId !== planId);
  },

  suggestForWish(content: string): WishSuggestion {
    if (!content.trim()) throw new ApiError('INVALID_INPUT', '소원을 먼저 적어 주세요.', 400);
    if (db.suggestionUse.date !== today()) db.suggestionUse = { date: today(), count: 0 };
    if (db.suggestionUse.count >= SUGGESTION_LIMIT_PER_DAY) {
      throw new ApiError('AI_RATE_LIMIT', '오늘은 추천을 다 썼어요.', 429);
    }
    db.suggestionUse.count++;
    const picked = FIXED_SUGGESTIONS[db.suggestionTurn++ % FIXED_SUGGESTIONS.length];
    return { ...picked, remaining: SUGGESTION_LIMIT_PER_DAY - db.suggestionUse.count };
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
    db.sentLetters.unshift({
      letterId,
      spotId: body.spotId,
      spotName: spotOf(body.spotId).name,
      style: body.style,
      message,
      fromNickname: db.nickname,
      toNickname: friend ? friend.nickname : db.nickname,
      fromMe: true,
      read: true,
      sentAt: new Date().toISOString(),
    });
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

  getSentLetters(): Page<Letter> {
    return { content: db.sentLetters, page: 0, size: 50, hasNext: false };
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

  resetTimeTravel(): { serverNow: string } {
    db.dayOffset = 0;
    return { serverNow: `${today()}T09:00:00+09:00` };
  },
};
