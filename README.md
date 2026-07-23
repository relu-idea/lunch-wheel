# 오늘의 점메추 (Lunch Roulette) 🍱

회사 동료들과 함께 점심 메뉴를 고르기 힘들 때, 근처 식당 리스트를 입력하고 룰렛을 돌려 메뉴를 정해주는 웹 애플리케이션입니다. 당첨된 메뉴에는 Gemini AI가 재치 있는 한 줄 응원 코멘트를 남겨줍니다.

## 🌟 주요 기능

- **식당 리스트 관리**: 한 줄에 하나씩 자주 가는 식당 이름을 손쉽게 입력 (자동 저장 기능 지원)
- **인터랙티브 룰렛**: 스핀 & 스톱 버튼으로 직관적이고 재미있는 메뉴 추첨
- **Gemini AI 위트 코멘트**: 당첨된 식당/메뉴에 어울리는 짧고 유머러스한 맞춤형 AI 코멘트 제공
- **반응형 디자인**: 모바일과 데스크톱 모두에서 쾌적한 UX 제공

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **AI Integration**: `@google/genai` (Gemini API)
- **Icons & Design**: FontAwesome, Pretendard Font

## 🚀 시작하기

### 1. 프로젝트 클론 및 패키지 설치

```bash
git clone https://github.com/your-username/lunch-wheel.git
cd lunch-wheel
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 Gemini API 키를 입력합니다.

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> 💡 Gemini API 키는 [Google AI Studio](https://aistudio.google.com/)에서 발급받으실 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후 사용합니다.

### 4. 빌드

```bash
npm run build
```

---

## 📤 AI Studio에서 깃허브로 올리는 방법

1. 화면 상단/우측의 **Settings(설정)** 메뉴 또는 **Export** 버튼을 클릭합니다.
2. **Export to GitHub** 옵션을 선택합니다.
3. GitHub 계정을 연동하고 새로운 리포지토리(Repository) 이름 작성 후 내보내기를 완료합니다.
4. (대안) **Download ZIP**을 받아 로컬에서 `git init`, `git add .`, `git commit`, `git push`로 올리실 수도 있습니다.
