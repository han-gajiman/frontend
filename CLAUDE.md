# 한 가지만 — Frontend (CLAUDE.md)

> 이 파일은 초안입니다. 🟡 표시는 팀 결정이 필요한 항목이니 임의로 정하지 말고 개발자에게 물어보세요.

## 서비스 개요
- 서비스명: 한 가지만 (2026 단디톤 출품작, 주제: RESONANCE — 우리가 대구·경북을 좋아하는 진짜 이유)
- 한 줄 설명: 소원 하나를 정하고, 30일 동안 매일 돌을 쌓으며 실천하고, 경북 명소를 방문해 이어가는 서비스
- 핵심 용어: 소원 = 돌탑 1개(30일) / 돌 = 하루 1개 기록 / 12개 돌탑 = 1년 회차
- 일정: 제출 11/20 23:59, 본선 11/21

## 기술 스택
React Native 0.88 · Expo SDK 58 · TypeScript · Expo Router (파일 기반 라우팅, 내부적으로 React Navigation 사용) · Zustand · NativeWind · 카카오 지도(WebView) · Expo Location · Expo Notifications · EAS Build

## 기준 문서 (구현 전에 반드시 읽기)
- 기능명세서: `docs/기능명세서.md` (원본: Notion "기능명세서"). 화면과 상태의 기준입니다.
- API 명세서: `docs/API명세서.md` (원본: Notion "API 명세서")
- Expo 사용법: `AGENTS.md` (Expo는 버전마다 API가 바뀌니 SDK 58 문서 기준으로 확인, 10/28 57 → 58 업그레이드)
- 디자인: 🟡 Figma 링크 (미정)
- 문서끼리 충돌하면 개발자에게 알리세요. 구버전 "MVP 범위 & 기능 명세" 페이지(10/17 이전)는 참고하지 마세요.

## 폴더 구조
```
src/
├─ app/          라우트(화면)만. 파일 하나 = 화면 하나, _layout.tsx = 네비게이터 (Expo Router, 확정)
├─ features/     🟡 도메인별 (auth, wish, stone, spot, friend, notification)
│   └─ 각 feature: components / api / store / types
├─ shared/       🟡 공통 컴포넌트, 훅, 유틸, 테마(NativeWind)
└─ api/          API 클라이언트 (client.ts: 공통 응답 형식·에러 처리, 토큰 재발급은 AUTH-03에서 추가)
```
- `src/app/` 안에는 화면 파일만 두고, 컴포넌트·훅·유틸은 밖에 둡니다.
- 백엔드 도메인 구조와 이름을 맞추면 소통이 쉽습니다.
- API 주소는 `.env.example`을 `.env.local`로 복사해서 `EXPO_PUBLIC_API_URL`로 설정합니다. API 호출은 `src/api/client.ts`의 `apiRequest`를 쓰고, 실패하면 `ApiError.code`(서버 에러 코드 또는 `NETWORK_ERROR`)로 분기합니다.
- 경로는 `@/`로 씁니다. (`@/` = `src/`)
- 스타일은 NativeWind `className`으로 씁니다. (Tailwind v3 문법, 설정: `tailwind.config.js`)

## API·화면 상태 패턴 (예시: `features/wish/`, `src/app/tower.tsx`)
- 도메인별로 `features/<도메인>/types.ts`(API 명세서 타입), `api.ts`(API 함수)를 둡니다. 여러 화면이 공유하는 입력값은 Zustand 스토어(예: `wish/draftStore.ts`)에 둡니다.
- `api.ts` 함수는 `USE_MOCK`이면 `mockCall(() => mockServer.xxx())`를, 아니면 `apiRequest`를 반환합니다. 화면 코드는 목인지 실제인지 몰라도 됩니다.
- 목 서버(`src/api/mockServer.ts`)는 메모리에서 실제 서버처럼 동작합니다(등록·돌 쌓기·시간 이동 반영, 명세서 에러 코드 반환). 새 API를 추가하면 여기에도 같이 추가하세요.
- 불러오기: `useApi(API 함수)` + `<AsyncContent>`로 감싸면 로딩·에러·오프라인·빈 상태가 자동 처리됩니다. 다른 화면에서 돌아오면 다시 불러옵니다.
- 버튼 요청: `useSubmit(API 함수)`의 `run()`은 `{ ok, data }`를 돌려줍니다. 실패하면 `<ErrorText error={error} />`로 보여주세요.
- 화면 틀은 `<Screen title showBack footer>`, 버튼은 `<Button>`, 입력은 `<TextField>`를 씁니다. (`src/shared/components/`)
- 로그인·온보딩 여부에 따른 화면 접근은 `src/app/_layout.tsx`의 `Stack.Protected`가 처리합니다. 새 화면은 여기에 등록하세요.
- 상태 확인: `.env.local`의 `EXPO_PUBLIC_MOCK_SCENARIO`를 `normal | empty | error | offline | slow`로 바꾸고 Metro를 재시작(`npx expo start -c`)하세요. 시연 경로를 처음부터 보려면 `empty`, 시간 이동 버튼은 `EXPO_PUBLIC_DEMO=true`.

## 반드시 지킬 규칙
1. **날짜·시간 판단은 서버 기준**: "오늘 돌을 쌓았는지", "30일이 지났는지"는 클라이언트 시계로 계산하지 말고 서버 응답을 쓰세요. 시연용 시간 가속이 서버 시계를 바꾸기 때문에, 클라이언트 시간을 쓰면 화면이 어긋납니다.
2. **소원은 수정 불가**: 소원과 실천 목표를 등록한 뒤 수정하거나 취소하는 UI를 만들지 마세요. 등록 전에 "다짐 확인" 단계에서 한 번 더 확인합니다.
3. **위치정보**: 위치 동의는 선택입니다. 동의가 없거나 권한을 거부해도 앱의 나머지 기능은 정상이어야 하고, 방문 인증을 누를 때만 동의를 요청합니다. 좌표는 인증 요청에만 쓰고 앱에 저장하지 마세요.
4. **모든 화면에 상태를 만드세요**: 로딩, 에러, 빈 상태, 오프라인. 상태 없이 정상 케이스만 만들지 마세요.
5. **돌탑 화면은 핵심 화면**: 돌 0~30개, 오늘 완료, 30일 완성 연출, 배경(허허벌판 / 방문한 명소 풍경)을 모두 표현해야 합니다.
6. **API 키·비밀값을 앱에 넣지 마세요.** LLM 호출은 백엔드에서만 합니다.
7. **카카오 로그인**은 Expo Go만으로 안 될 수 있어 개발 빌드(EAS Build)가 필요할 수 있습니다. 구현 초반에 실제 기기에서 먼저 확인하세요.

## 화면 목록 (기능 ID 기준)
- 진입: 소셜 로그인, 약관·위치 동의, 닉네임 (AUTH)
- 홈: 진행 중 돌탑 / 빈 홈 (HOME-01)
- 소원 등록: 소원 + 실천 목표(AI 추천 3개), 명소 추천·선택, 다짐 확인 (WISH, SPOT-01)
- 돌탑: 돌탑 화면, 오늘 완료 (STONE)
- 명소: 지도, 방문 인증 (SPOT-02, 03)
- 엽서: 보관함, 상세 (SPOT-04)
- 완성: 회고, 모아보기 (TOWER)
- 친구: 초대, 친구 돌탑, 응원, 콕 찌르기 (FRIEND)
- 기타: 알림함, 내 정보·탈퇴

## 구현 순서
- 우선순위는 기능명세서의 P0 → P1 → P2 순서입니다.
- 백엔드가 준비되기 전에는 가짜 API(목 데이터)로 화면을 먼저 만들고, 연결할 때 교체합니다.
- 시연 경로(로그인 → 소원 등록 → 돌 쌓기 → 시간 가속 → 완성 회고 → 모아보기)가 끝까지 이어지는 것을 최우선으로 합니다.
- 큰 작업은 Plan 모드로 계획을 먼저 보여주세요.

## 미결정 항목 🟡 — 임의 결정 금지
- 다짐 기간 2주의 의미, 진행 중 돌탑 개수, 익명 소원지기 방식, 명소 카테고리 기준
- 방문 인증·엽서의 P0 승격 여부, "소원 좁히기" 단계 유지 여부
- `src/app/` 밖의 폴더 구조 확정, 브랜치·커밋 규칙
- (결정됨 10/23) 애니메이션은 Reanimated. 웹은 spring 미지원이라 `springify()` 대신 시간 기반 프리셋을 씁니다. `Animated.View`에는 NativeWind `className`이 적용되지 않으니 `style`로 쓰세요.

## 작업 방식
- 코드를 쓰기 전에 관련 문서를 읽고, 이해한 내용과 계획을 먼저 짧게 알려주세요.
- 화면 하나를 만들 때 위 상태들(정상, 로딩, 에러, 빈 상태)을 확인하는 방법을 함께 제시하세요.
