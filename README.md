# Frontend

한 가지만(2026 단디톤) 모바일 앱입니다. 소원 하나를 정하고 30일 동안 매일 돌을 쌓으며, 경북 명소를 방문해 이어가는 서비스입니다.

- 개발 규칙과 코드 패턴: `CLAUDE.md`
- 기능·API·ERD 기준 문서: `docs/`

## 기술 스택

- Expo SDK 57 · React Native 0.86 · React 19 · TypeScript
- Expo Router (파일 기반 라우팅)
- NativeWind 4 (Tailwind 3 문법 스타일링)
- Zustand (상태 관리)
- Reanimated (애니메이션)
- react-native-maps (명소 지도, 웹 미지원)

## 처음 받았을 때

```bash
cd frontend
npm install
cp .env.example .env.local
npx expo start -c
```

`.env.local`은 git에 올라가지 않는 개인 설정 파일입니다. 값은 `.env.example`의 설명을 참고하세요.

## git pull 받은 뒤

라이브러리가 추가됐을 수 있으니 항상 아래를 실행하세요.

```bash
npm install
npx expo start -c
```

- `.env.example`에 새 값이 추가됐다면 `.env.local`에도 같이 추가하세요.
- 설정 파일이나 `.env.local`을 바꾼 뒤에는 `-c`(캐시 삭제)를 꼭 붙여서 다시 실행하세요.

## 화면 보기

`npx expo start -c` 실행 후:

- **폰 (추천)**: Expo Go 앱을 설치하고 터미널의 QR 코드를 찍습니다. PC와 폰이 같은 와이파이에 있어야 합니다.
- **웹**: 터미널에서 `w`. 지도는 웹에서 목록으로 대신 보입니다.
- **iOS 시뮬레이터**: 터미널에서 `i`. Xcode 26.4 이상이 필요합니다.

## 목 데이터로 실행하기

백엔드 없이 화면을 확인할 수 있도록 목 서버(`src/api/mockServer.ts`)가 들어 있습니다. 데이터는 메모리에만 있어서 앱을 새로 켜면 초기화됩니다.

`.env.local` 설정:

| 값 | 설명 |
| --- | --- |
| `EXPO_PUBLIC_USE_MOCK=true` | 목 서버 사용 (`false`면 `EXPO_PUBLIC_API_URL`의 실제 서버) |
| `EXPO_PUBLIC_MOCK_SCENARIO` | `normal` 진행 중 돌탑이 있는 회원 / `empty` 신규 회원(시연 경로 처음부터) / `error` 서버 에러 / `offline` 인터넷 끊김 / `slow` 3초 로딩 |
| `EXPO_PUBLIC_DEMO=true` | 돌탑 화면에 시연용 시간 이동 버튼(+1일, +30일) 표시 |

## 실제 서버로 실행하기

로컬 백엔드를 `local` 프로필로 켜고(`backend/README.md`), `.env.local`을 이렇게 바꾼 뒤 `npx expo start -c`로 다시 실행합니다.

```
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1   # 폰에서는 localhost 대신 PC의 IP
EXPO_PUBLIC_DEV_LOGIN=true                         # 로그인 화면에 "개발용 로그인" 버튼
EXPO_PUBLIC_DEV_LOGIN_KEY=me                       # 같은 키 = 같은 회원, 바꾸면 새 회원
```

- 카카오·Google SDK 연동 전까지는 **개발용 로그인** 버튼으로 실제 서버에 로그인합니다.
- 로그인 상태는 기기에 저장되어 앱을 다시 켜도 유지됩니다. (폰: SecureStore, 웹: localStorage)
- Access Token이 만료되면 자동으로 재발급받아 요청을 다시 보내고, 재발급도 실패하면 로그인 화면으로 갑니다.
- Expo 개발 서버가 8081 포트를 쓰므로, 백엔드는 8080(기본) 또는 8082처럼 다른 포트로 켜세요.

## 현재 화면

| 화면 | 파일 | 기능 ID |
| --- | --- | --- |
| 로그인 | `src/app/login.tsx` | AUTH-01 (카카오·Google은 SDK 연동 전, 개발용 로그인으로 실제 서버 연결), AUTH-03 (토큰 저장·자동 재발급) |
| 온보딩 | `src/app/onboarding.tsx` | AUTH-02 |
| 홈 | `src/app/index.tsx` | HOME-01 |
| 소원 적기 → 명소 고르기 → 다짐 확인 | `src/app/wish/` | WISH-01, SPOT-01, WISH-03 |
| 돌탑 | `src/app/tower.tsx` | STONE-01, STONE-02, DEMO-01 |
| 완성 회고 | `src/app/reflection.tsx` | TOWER-02 |
| 모아보기 | `src/app/collection.tsx` | TOWER-03 |
| 명소 지도 | `src/app/spots.tsx` | SPOT-02 |
| 내 정보·탈퇴 | `src/app/me.tsx` | AUTH-04, AUTH-05, AUTH-06 |

아직 없는 화면(P1): 방문 인증·엽서, 친구, 알림함, AI 실천 목표 추천

## 폴더 구조

```text
src/
├── app/          화면(라우트). 파일 하나 = 화면 하나, _layout.tsx에서 로그인 상태별 접근 제어
├── features/     도메인별 types.ts(API 타입) · api.ts(API 함수) · components/
│   ├── auth/  user/  wish/  stone/  spot/  demo/
├── shared/       공통 컴포넌트(Screen, Button, TextField, ScreenState)와 훅(useApi, useSubmit)
├── api/          API 클라이언트(client.ts), 목 서버(mock.ts, mockServer.ts)
└── global.css    NativeWind 진입점
```

## 스크립트

```bash
npx expo start -c      # 개발 서버 (캐시 삭제)
npx expo lint          # 린트
npx tsc --noEmit       # 타입 검사
npx expo install 패키지  # 라이브러리 추가 (npm install 대신, SDK 호환 버전으로 설치)
```

작업을 마치기 전에 린트와 타입 검사를 실행하세요.
