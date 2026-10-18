# Frontend

이 디렉터리는 모바일 서비스의 프론트엔드 앱을 담당하는 Expo + React Native 프로젝트입니다.

## 프로젝트 개요

- 앱 유형: 모바일 우선(Mobile First) React Native 앱
- 프레임워크: Expo SDK 57
- 네비게이션: Expo Router
- UI 라이브러리: React Native
- 언어: TypeScript
- 주요 목적: 서비스 소개 화면, 로그인 진입점, 메인 화면 확장을 위한 기반 구조 마련

현재 구현 상태는 기본 랜딩 페이지 형태이며, 이후에 온보딩, 로그인, 메인 대시보드, 탭 네비게이션 등으로 확장할 수 있도록 구성되어 있습니다.

## 기술 스택

- React Native 0.86.3
- React 19.2.3
- Expo 57
- Expo Router
- TypeScript 6.0.3
- React Native Web

## 폴더 구조

```text
frontend/
├── src/
│   └── app/
│       ├── _layout.tsx      # 앱 루트 레이아웃
│       └── index.tsx        # 메인 홈 화면
├── app.json                 # Expo 앱 설정
├── babel.config.js          # Babel 설정
├── eslint.config.js         # ESLint 설정
├── package.json             # 프로젝트 의존성 및 스크립트
├── tsconfig.json            # TypeScript 설정
└── README.md                # 프론트엔드 문서
```

## 실행 방법

1. 의존성 설치

```bash
cd frontend
npm install
```

2. 개발 서버 실행

```bash
npm start
```

3. 실행 환경 선택

```bash
npm run android
npm run ios
npm run web
```
4. 실행 방법
- 모바일 환경 구동 시 터미널에 생성 된 qr코드 스캔
- EXPO GO 모바일 앱 다운로드 후 PC와 모바일을 같은 와이파이에 연결
- web환경에서 구동 시 바로 실행 가능

## 스크립트 설명

```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "lint": "expo lint"
}
```

- `npm start`: Expo 개발 서버 실행
- `npm run android`: Android 에뮬레이터/디바이스 연결 실행
- `npm run ios`: iOS 시뮬레이터 실행
- `npm run web`: 웹 브라우저에서 테스트
- `npm run lint`: 코드 린트 검사

## 현재 화면 구성

`src/app/index.tsx`에는 다음 내용을 중심으로 한 기본 화면이 구현되어 있습니다.

- 상단 Hero 영역
- 서비스 소개 문구
- 주요 기능 카드
- CTA 버튼
- 모바일 첫 UI 디자인

이 화면은 이후에 실제 비즈니스 기능과 연결되어 다음 화면으로 확장될 수 있습니다.

- 온보딩 화면
- 로그인/회원가입 화면
- 메인 대시보드
- 알림/설정/마이페이지
- 탭 기반 네비게이션

## 개발 원칙

- 모바일 우선 UX 설계
- Expo Router 기반 화면 구조 유지
- 화면 단위 코드는 `src/app/` 아래에 구성
- 공통 컴포넌트, 훅, 유틸은 별도 디렉터리로 분리 가능
- 네이티브 코드 수정은 `ios/`, `android/` 직접 수정 대신 Expo 설정을 통해 처리

## 다음 단계 제안

1. 로그인/회원가입 화면 추가
2. 하단 탭 네비게이션 구성
3. API 연동용 서비스 레이어 구축
4. 사용자 상태 관리 구조 추가
5. 실제 서비스 흐름에 맞는 페이지 설계

## 참고

본 프로젝트는 백엔드와 함께 동작하는 전체 서비스 구조에서 프론트엔드 진입점 역할을 수행합니다. 현재는 초기 앱 시안과 구조 설계 단계이며, 이후 기능 구현을 통해 실제 사용자 플로우를 완성해 나가면 됩니다.
