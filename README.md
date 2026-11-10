# frontend

**한 가지만**(2026 단디톤 출품작)의 앱·웹입니다. 소원 하나를 정하고, 30일 동안 매일 돌을 하나씩 쌓으며, 경북 명소를 방문해 이어가는 서비스입니다.

- 실서비스 웹: https://han-gajiman.github.io (실제 서버 연결, 이메일·카카오·Google 가입)
- 데모 웹: https://han-gajiman.expo.app (서버 없이 예시 데이터로 동작, 로그인 버튼만 누르면 체험)
- API 서버: [backend](https://github.com/han-gajiman/backend)
- 기준 문서: `docs/` (기능명세서·API 명세서·ERD, 노션 원본과 같은 내용) · 개발 규칙: `CLAUDE.md`

웹이 1순위, Android가 2순위입니다. iOS는 배포하지 않습니다.

## 기술 스택

- Expo SDK 58 · React Native 0.88 · React 19 · TypeScript
- Expo Router (파일 기반 라우팅) · Zustand · NativeWind 4 (Tailwind 3 문법)
- Reanimated 4 (인트로·방문 인증·돌탑·꽃잎 애니메이션, 기기의 동작 줄이기 설정 존중)
- expo-image · expo-linear-gradient · expo-location(방문 인증) · expo-media-library · react-native-view-shot(엽서 저장) · expo-clipboard
- 카카오 지도 (같은 지도 HTML을 폰은 WebView, 웹은 iframe으로)
- 카카오·Google 로그인 (앱은 네이티브 SDK, 웹은 로그인 화면으로 이동했다 돌아오는 방식)

## 처음 받았을 때

```bash
npm install
cp .env.example .env.local     # 개인 설정 (git에 안 올라감)
npx expo start -c              # w: 웹, QR: 폰
```

`git pull` 뒤에는 라이브러리가 바뀌었을 수 있으니 `npm install`과 `npx expo start -c`를 다시 하세요. `.env.example`에 새 값이 생겼으면 `.env.local`에도 넣으세요.

## 설정 (`.env.local`)

`EXPO_PUBLIC_` 값은 앱에 그대로 들어가므로 **비밀값은 넣지 마세요.** (AI 키 등은 서버에만)

| 값 | 설명 |
| --- | --- |
| `EXPO_PUBLIC_USE_MOCK` | `true`면 목 서버(`src/api/mockServer.ts`), `false`면 `EXPO_PUBLIC_API_URL`의 실제 서버 |
| `EXPO_PUBLIC_API_URL` | 실제 서버 주소 (예: `http://localhost:8080/api/v1`, 폰에서는 PC의 IP) |
| `EXPO_PUBLIC_MOCK_SCENARIO` | 목 서버 상태: `normal` 진행 중 돌탑 / `fresh` 처음 쌓는 날 / `empty` 신규 회원 / `error` / `offline` / `slow` |
| `EXPO_PUBLIC_DEMO` | 시연 모드: 시간 이동 버튼, 방문 인증 위치 확인 생략. 실서비스 빌드에서는 끔 |
| `EXPO_PUBLIC_DEMO_TIME_TRAVEL` | `false`면 시연 모드여도 시간 이동 버튼만 숨김 |
| `EXPO_PUBLIC_SKIP_LOCATION` | `true`면 방문 인증 위치 확인만 건너뜀 (테스트 기간 실서비스 웹) |
| `EXPO_PUBLIC_DEV_LOGIN`, `EXPO_PUBLIC_DEV_LOGIN_KEY` | 실제 로컬 서버에 붙을 때 "개발용 로그인" 버튼 (같은 키 = 같은 회원) |
| `EXPO_PUBLIC_KAKAO_JS_KEY` | 카카오 지도 (없으면 명소 목록으로 대신 보여줌) |
| `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY` | 앱 카카오 로그인 |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google 로그인 (웹 클라이언트 ID는 웹·Android 공통) |

## 목 서버로 보기

백엔드 없이 모든 화면을 볼 수 있도록 목 서버가 들어 있습니다. 데이터는 메모리에만 있어서 새로고침하면 처음으로 돌아갑니다.

- 이메일 로그인 `demo@hangajiman.app` / `password123` (데모 웹은 미리 채워져 있음), 카카오·Google 버튼은 바로 로그인
- 비밀번호 찾기 인증코드는 항상 `123456`
- `normal` 시나리오: 진행 중 돌탑 13일째(돌 12개), 지난 돌탑과 1년 회고, 엽서 40장, 친구 3명, 캘린더 할 일

## 실제 서버로 보기

로컬 백엔드를 `local` 프로필로 켜고(`backend/README.md`), `.env.local`을 바꾼 뒤 `npx expo start -c`로 다시 켭니다.

```
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_DEV_LOGIN=true
```

- 로그인 상태는 기기에 저장되고(폰: SecureStore, 웹: localStorage), Access Token이 만료되면 자동으로 재발급합니다.
- Expo 개발 서버가 8081 포트를 쓰므로 백엔드는 8080을 씁니다.

## 배포

웹은 두 곳에 배포합니다. 화면이 바뀌면 main에 머지한 뒤 둘 다 올립니다.

| | 주소 | 데이터 | 명령 |
| --- | --- | --- | --- |
| 실서비스 웹 | https://han-gajiman.github.io | 실제 서버 | `./scripts/deploy-pages.sh` |
| 데모 웹 | https://han-gajiman.expo.app | 목 서버 | 아래 명령 |

```bash
# 데모 웹 (Expo 계정 han-gajiman 로그인 필요, 반영까지 최대 10분)
rm -rf dist && EXPO_PUBLIC_USE_MOCK=true EXPO_PUBLIC_MOCK_SCENARIO=normal EXPO_PUBLIC_DEMO=true EXPO_PUBLIC_DEV_LOGIN=false npx expo export -p web
npx eas-cli@27.2.0 deploy --prod
```

- `deploy-pages.sh`는 실서버 주소로 빌드하고, `404.html`(주소로 바로 들어와도 앱이 뜨게)과 `.nojekyll`(`_expo` 폴더 무시 방지)을 넣어 [han-gajiman.github.io](https://github.com/han-gajiman/han-gajiman.github.io) 저장소에 올립니다. 시간 이동 버튼은 서버가 허락한 시연 계정에만 보입니다. 테스트 기간에는 위치 확인을 건너뛰며, 정식 운영 때는 `SKIP_LOCATION=false ./scripts/deploy-pages.sh`로 배포합니다.
- 카카오 지도와 로그인은 등록된 도메인에서만 됩니다. 카카오 콘솔(Web 도메인, Redirect URI `…/login`)과 Google 콘솔(승인된 JavaScript 원본·리디렉션 URI)에 두 주소와 `http://localhost:8081`이 등록되어 있어야 합니다.
- 탭 아이콘은 `public/favicon-v2.png`입니다. 브라우저가 예전 아이콘을 기억하므로, 바꿀 때는 파일 이름의 숫자를 올리고 `public/index.html`도 고칩니다.

## Android 개발 빌드

카카오·Google SDK, 사진첩 저장, 클립보드는 네이티브 코드라 Expo Go에서는 안 됩니다.

```bash
npx eas-cli@latest build -p android --profile development
```

- 빌드 페이지 QR로 APK를 설치하고 `npx expo start`로 띄운 개발 서버에 접속합니다. JS만 바꿨다면 다시 빌드할 필요가 없습니다.
- 네이티브 라이브러리나 키를 바꾸면 다시 빌드해야 합니다.
- Android 서명은 팀 키스토어(`credentials.json`, git에 안 올라감)를 씁니다. 카카오 키 해시와 Google SHA-1이 이 키 기준으로 등록되어 있습니다.

## 화면

| 화면 | 파일 | 기능 ID |
| --- | --- | --- |
| 인트로 3장 (유성·빛 궤도·노을 연출, 건너뛰기) | `src/app/intro.tsx`, `features/intro/` | - |
| 로그인 · 회원가입 · 계정 찾기 (웹 소셜 로그인은 `/login`으로 돌아옴) | `src/app/login.tsx`, `signup.tsx`, `find-account.tsx` | AUTH-01 |
| 온보딩 (약관·닉네임) | `src/app/onboarding.tsx` | AUTH-02 |
| 홈 = 돌탑 (오늘의 돌 끌어 쌓기, 기록 칸을 누르면 캘린더 할 일 목록, 응원 풍선, 친구 돌탑, 시간 이동) | `src/app/(tabs)/index.tsx`, `features/home/` | HOME-01, STONE-01·02, PLAN-02, DEMO-01 |
| 내 돌탑 시트 (돌탑을 누르면: 소원, 공개 범위, 받은 응원) | `features/wish/components/MyTowerSheet.tsx` | WISH-04, FRIEND-03 |
| 소원 적기 (메모한 소원 불러오기, AI 추천) → 명소 고르기 → 다짐 확인 | `src/app/wish/` | WISH-01·02·03, SPOT-01 |
| 명소 지도 · 방문 인증 (잠긴 화면 → 안개 걷힘, 명소별 빛 연출, 스토리 카드·출처, 다시 인증) | `src/app/(tabs)/spots.tsx`, `features/spot/` | SPOT-02·03·05 |
| 우체통 (받은 엽서 · 보낸 엽서 · 내 엽서함 · 엽서 보내기, 앞뒷면 PNG 저장) | `src/app/mailbox.tsx`, `features/postcard/` | SPOT-04 |
| 소원 캘린더 (기간 줄, 날짜별 할 일, AI 할 일 추천, 소원 메모) | `src/app/planner.tsx`, `features/plan/` | PLAN-01·02·03 |
| 완성 회고 | `src/app/reflection.tsx` | TOWER-02 |
| 모아보기 (1년 묶음별 돌탑 액자, 꽃잎 흩날림, 30일 회고·매일 기록, 1년 회고·방문 명소) | `src/app/(tabs)/collection.tsx`, `features/wish/components/` | TOWER-03·04 |
| 친구 목록 · 초대(링크 복사·공유) · 친구 돌탑(응원, 콕 찌르기) · 초대 링크로 열기 | `src/app/(tabs)/friends.tsx`, `src/app/friends/`, `src/app/invite/` | FRIEND-01~04 |
| 알림함 · 받은 응원 | `src/app/notifications.tsx`, `cheers.tsx` | NOTI-01, FRIEND-03 |
| 내 정보 (닉네임 변경, 시연 계정이면 "시연 처음 상태로", 로그아웃, 탈퇴) | `src/app/me.tsx` | AUTH-04·06, DEMO-03 |

모든 화면에 로딩·에러·빈 상태·오프라인 화면이 있습니다 (`shared/components/ScreenState.tsx`의 `AsyncContent`).

## 폴더 구조

```text
src/
├── app/        화면(라우트). 파일 하나 = 화면 하나, _layout.tsx에서 로그인·온보딩 상태별 접근 제어
│   └── (tabs)/ 하단 탭 4개 (홈·명소·친구·모아보기). 나머지는 탭 위에 뜨는 화면
├── features/   도메인별 types.ts(API 타입) · api.ts(API 함수) · components/
│   └── auth  user  intro  home  wish  stone  spot  postcard  plan  friend  notification  demo
├── shared/     공통 컴포넌트(Screen, Button, TextField, Dialog, ScreenState)와 훅(useApi, useSubmit)
└── api/        API 클라이언트(client.ts, 토큰 재발급), 목 서버(mock.ts, mockServer.ts)
assets/         명소 일러스트, 엽서(앱용), 돌, 배경, 꽃잎, 인트로 그림
public/         웹 전용 정적 파일 (엽서 원본, 탭 아이콘, index.html)
scripts/        deploy-pages.sh (실서비스 웹 배포)
```

## 스크립트

```bash
npx expo start -c       # 개발 서버 (캐시 삭제)
npx tsc --noEmit        # 타입 검사
npx expo lint           # 린트
npx expo install 패키지   # 라이브러리 추가 (SDK 호환 버전으로)
```

작업을 마치기 전에 타입 검사와 린트를 실행하세요.
