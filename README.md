
# 🗓️ CBT Diary (React Native)

## 📌 시스템 개요

현대인 중 스트레스나 우울감을 겪는 사람은 많지만, 심리 치료 서비스의 이용률은 낮습니다.
**CBT Diary**는 \*\*인지행동치료(CBT)\*\*를 누구나 쉽게 소개받고 체험할 수 있도록 하는 모바일 일기 앱입니다.
심리 치료에 대한 진입장벽을 허물고, 사용자에게 쉽게 다가갈 수 있는 자가 기록 및 분석 서비스를 제공합니다.

---

## 📂 파일 구조 & 주요 화면

```
/src
 ├ auth/
 │   ├ SignInScreen.tsx     – 로그인 페이지
 │   └ SignupScreen.tsx     – 회원가입 페이지
 ├ main/
 │   ├ MainScreen.tsx       – 일기 목록 조회
 │   ├ WriteScreen.tsx      – 일기 작성
 │   └ AnalyzeScreen.tsx    – 분석 결과 확인
 └ AuthContext.tsx         – 로그인/인증 상태 관리 및 Context API
```

* **MainScreen.tsx**: User Token에서 ID 추출 시도 (실패)
* **AuthContext.tsx**: JWT 토큰 관리, 로그인·로그아웃·토큰 유효성 처리

---

## 🛠️ 기술 스택 & 핵심 기능

* **React Native** 기반 모바일 앱
* **인증 로직**: Context API로 JWT 토큰 저장 및 응답 코드에 따른 예외 처리
* **사용한 Hooks**:

  * `useState`, `useEffect` — 상태 및 라이프사이클 관리
  * `useContext` — 전역 인증 상태 접근
  * `useCallback`, `useMemo` — 렌더링 최적화

---

## 🎯 주요 경험 (압축 요약)

* 프론트엔드를 단순 UI가 아닌 **상태 관리, 인증, 최적화 관점**에서 깊이 경험
* **프론트-백 협업의 어려움**: API 스펙 조율, 예외 처리, JWT 흐름을 맞추는 복잡성 실감
* **시간 투자 대비 성과**: 시스템 시나리오 통합 과정과 API 연동 과정이 길어져 프론트 고도화 작업이 제한됨

---

## 🚀 실행 방법

### 터미널 1 – Metro 서버 실행

```bash
npx react-native start
```

### 터미널 2 – 앱 실행 (Android 에뮬레이터/디바이스 대상)

```bash
npx react-native run-android
```

