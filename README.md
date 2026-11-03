# Frontend

한 가지만(2026 단디톤) 모바일 앱입니다. 소원 하나를 정하고 30일 동안 매일 돌을 쌓으며, 경북 명소를 방문해 이어가는 서비스입니다.

- 개발 규칙과 코드 패턴: `CLAUDE.md`
- 기능·API·ERD 기준 문서: `docs/`

## 기술 스택

- Expo SDK 58 · React Native 0.88 · React 19 · TypeScript (폰의 Expo Go도 SDK 58 버전이어야 합니다)
- Expo Router (파일 기반 라우팅)
- NativeWind 4 (Tailwind 3 문법 스타일링)
- Zustand (상태 관리)
- Reanimated (애니메이션)
- 카카오 지도 (명소 지도, 폰은 WebView·웹은 iframe으로 같은 지도 HTML을 띄움)

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

**설치 없이 보기**: 웹 데모 https://han-gajiman.expo.app (목 모드, main에 머지한 뒤 직접 배포)

`npx expo start -c` 실행 후:

- **폰 (개발 빌드)**: EAS로 만든 개발 빌드 앱을 설치하고 터미널의 QR 코드를 찍습니다. PC와 폰이 같은 와이파이에 있어야 합니다. (아래 "카카오·Google 로그인" 참고)
- **폰 (Expo Go)**: `npx expo start -c --go`로 실행하거나 실행 중에 `s`를 눌러 Expo Go 모드로 바꾼 뒤 QR을 찍습니다. 카카오·Google 로그인 버튼만 안내 문구가 뜹니다.
- **웹**: 터미널에서 `w`.
- **iOS 시뮬레이터**: 터미널에서 `i`. Xcode 26.4 이상이 필요합니다.

## 목 데이터로 실행하기

백엔드 없이 화면을 확인할 수 있도록 목 서버(`src/api/mockServer.ts`)가 들어 있습니다. 데이터는 메모리에만 있어서 앱을 새로 켜면 초기화됩니다.

`.env.local` 설정:

| 값 | 설명 |
| --- | --- |
| `EXPO_PUBLIC_USE_MOCK=true` | 목 서버 사용 (`false`면 `EXPO_PUBLIC_API_URL`의 실제 서버) |
| `EXPO_PUBLIC_MOCK_SCENARIO` | `normal` 진행 중 돌탑이 있는 회원 / `empty` 신규 회원(시연 경로 처음부터) / `error` 서버 에러 / `offline` 인터넷 끊김 / `slow` 3초 로딩 |
| `EXPO_PUBLIC_DEMO=true` | 홈에 시연용 시간 이동 버튼(+1일, +30일) 표시 |

목 모드 이메일 로그인: `demo@hangajiman.app` / `password123`, 닉네임 `소원지기` (회원가입한 계정도 앱을 끄기 전까지 로그인 가능). 비밀번호 찾기 인증코드는 항상 `123456`

실제 서버로 비밀번호 찾기를 확인할 때 백엔드에 메일 설정(`SPRING_MAIL_HOST` 등)이 없으면, 인증코드는 백엔드 콘솔 로그에 찍힙니다.

## 웹 데모 배포 (EAS Hosting)

main에 머지한 뒤 아래 명령으로 목 모드 웹을 내보내 https://han-gajiman.expo.app 에 배포합니다. Expo 계정(`han-gajiman`)에 로그인되어 있어야 하고, 카카오 지도를 보이려면 `.env.local`에 `EXPO_PUBLIC_KAKAO_JS_KEY`가 있어야 합니다. 배포 후 반영까지 10분 정도 걸릴 수 있습니다.

```
EXPO_PUBLIC_USE_MOCK=true EXPO_PUBLIC_MOCK_SCENARIO=normal EXPO_PUBLIC_DEMO=true EXPO_PUBLIC_DEV_LOGIN=false npx expo export -p web
npx eas-cli@27.2.0 deploy --prod
```

## 카카오 지도 (명소)

`src/features/spot/components/`의 `SpotMap`이 카카오 지도 JavaScript API를 씁니다. 카카오는 앱용 지도 SDK가 없어서, 지도 HTML(`kakaoMapHtml.ts`) 하나를 폰에서는 WebView로, 웹에서는 iframe으로 띄웁니다.

- `.env.local`에 `EXPO_PUBLIC_KAKAO_JS_KEY`(JavaScript 키)를 넣으면 지도가 뜹니다. 없거나 불러오기에 실패하면 명소 목록으로 대신 보여줍니다.
- 카카오는 등록된 도메인에서만 지도를 허용합니다. 콘솔 → 플랫폼 → Web에 `http://localhost:8081`, `https://han-gajiman.expo.app`을 등록하세요. 폰 WebView는 `https://han-gajiman.expo.app`에서 연 것으로 띄웁니다.

## 실제 서버로 실행하기

로컬 백엔드를 `local` 프로필로 켜고(`backend/README.md`), `.env.local`을 이렇게 바꾼 뒤 `npx expo start -c`로 다시 실행합니다.

```
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1   # 폰에서는 localhost 대신 PC의 IP
EXPO_PUBLIC_DEV_LOGIN=true                         # 로그인 화면에 "개발용 로그인" 버튼
EXPO_PUBLIC_DEV_LOGIN_KEY=me                       # 같은 키 = 같은 회원, 바꾸면 새 회원
```

- Expo Go·웹에서는 카카오·Google 로그인이 안 되므로 **개발용 로그인** 버튼으로 실제 서버에 로그인합니다.
- 로그인 상태는 기기에 저장되어 앱을 다시 켜도 유지됩니다. (폰: SecureStore, 웹: localStorage)
- Access Token이 만료되면 자동으로 재발급받아 요청을 다시 보내고, 재발급도 실패하면 로그인 화면으로 갑니다.
- Expo 개발 서버가 8081 포트를 쓰므로, 백엔드는 8080(기본) 또는 8082처럼 다른 포트로 켜세요.

## 카카오·Google 로그인 (개발 빌드)

카카오·Google SDK는 네이티브 코드라 **Expo Go와 웹에서는 동작하지 않습니다.** 목 모드에서는 SDK 없이 버튼만 누르면 로그인되고, Expo Go·웹에서 실제 서버로 붙을 때는 개발용 로그인을 씁니다.

실제 소셜 로그인 확인 방법:

1. `.env.local`에 키를 넣습니다. (`.env.example` 참고: `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`)
2. 개발 빌드를 만듭니다. `npx eas-cli@latest build -p android --profile development` (EAS 프로젝트 `@han-gajiman/han-gajiman`, 빌드용 키는 EAS 환경변수에 등록됨)
3. 빌드 페이지의 QR로 APK를 폰에 설치하고, `npx expo start`로 띄운 개발 서버에 접속합니다. JS 코드는 개발 서버에서 받으므로 코드만 바꿨다면 다시 빌드할 필요가 없습니다.
4. 키나 네이티브 라이브러리를 바꾸면 네이티브 설정이 바뀌므로 개발 빌드를 다시 만들어야 합니다.

Android 서명은 팀 키스토어를 씁니다(`eas.json`의 `credentialsSource: local`). 키스토어 파일과 비밀번호가 담긴 `credentials.json`은 git에 올리지 않으니 담당자에게 따로 받으세요. 카카오 키 해시와 Google Android SHA-1이 이 키스토어 기준으로 등록되어 있어서, 다른 키로 서명하면 소셜 로그인이 실패합니다.

콘솔 설정:

- **카카오 개발자 콘솔**: 플랫폼에 Android 패키지명·키 해시, iOS 번들 ID 등록, 카카오 로그인 활성화
- **Google Cloud 콘솔**: OAuth 클라이언트 ID를 웹·Android(패키지명 + SHA-1)·iOS(번들 ID)로 각각 만들기
- **백엔드**: `GOOGLE_CLIENT_IDS`에 웹·iOS 클라이언트 ID, `KAKAO_ADMIN_KEY`에 카카오 어드민 키 (`backend/README.md`)

## 현재 화면

| 화면 | 파일 | 기능 ID |
| --- | --- | --- |
| 로그인 (이메일·카카오·Google) | `src/app/login.tsx` | AUTH-01, AUTH-03 (토큰 저장·자동 재발급) |
| 회원가입 (이메일·비밀번호·닉네임, 로그인 화면 디자인) | `src/app/signup.tsx` | AUTH-01 (자체 로그인) |
| 계정 찾기 (아이디: 닉네임 → 가린 이메일 / 비밀번호: 이메일 인증코드) | `src/app/find-account.tsx` | AUTH-01 (자체 로그인) |
| 온보딩 | `src/app/onboarding.tsx` | AUTH-02 |
| 홈 = 돌탑 (오늘의 돌 끌어서 쌓기, 실천 기록, 공개 범위, 친구 돌탑 맛보기, 시연용 시간 이동) | `src/app/index.tsx` → `features/home/components` | HOME-01, STONE-01, STONE-02, WISH-04, DEMO-01 |
| 소원 적기 → 명소 고르기 → 다짐 확인 (공개 범위 선택) | `src/app/wish/` | WISH-01, SPOT-01, WISH-03, WISH-04 |
| 완성 회고 | `src/app/reflection.tsx` | TOWER-02 |
| 모아보기 (회차 선택) | `src/app/collection.tsx` | TOWER-03, TOWER-04 |
| 명소 지도 | `src/app/spots.tsx` | SPOT-02 |
| 내 정보·탈퇴 | `src/app/me.tsx` | AUTH-04, AUTH-05, AUTH-06 |
| 친구 목록 | `src/app/friends/index.tsx` | FRIEND-02 |
| 친구 초대 (링크 만들기·공유, 코드로 추가) | `src/app/friends/invite.tsx` | FRIEND-01 |
| 친구 돌탑 (응원, 콕 찌르기) | `src/app/friends/[friendId].tsx` | FRIEND-02, FRIEND-03, FRIEND-04 |
| 초대 링크로 열기 (로그인 전이면 로그인 후 이어서) | `src/app/invite/[code].tsx` | FRIEND-01 |
| 알림함 (안 읽은 알림 점, 누르면 관련 화면으로) | `src/app/notifications.tsx` | NOTI-01 |
| 받은 응원 (내 진행 중 돌탑) | `src/app/cheers.tsx` | FRIEND-03 |

아직 없는 화면(P1): 방문 인증·엽서, AI 실천 목표 추천. 푸시 알림 받기(기기 푸시 토큰 등록)는 개발 빌드에서 추가 예정

## 폴더 구조

```text
src/
├── app/          화면(라우트). 파일 하나 = 화면 하나, _layout.tsx에서 로그인 상태별 접근 제어
├── features/     도메인별 types.ts(API 타입) · api.ts(API 함수) · components/
│   ├── auth/  user/  home/  wish/  stone/  spot/  friend/  demo/
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
