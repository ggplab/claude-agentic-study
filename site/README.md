# 스터디 아카이브 대시보드 (site/)

이 디렉터리는 스터디 아카이브를 한눈에 볼 수 있는 **React + Vite + TypeScript** 정적 대시보드다.
저장소에 쌓인 markdown 파일들(README들)과 HTML 프로토타입을 빌드 시 파싱해 정적 사이트로 생성한다.

배포 URL: <https://ggplab.github.io/claude-agentic-study/>

---

## 요구사항

- Node.js 20 이상

---

## 명령

```bash
# 의존성 설치
npm install

# 로컬 개발 서버 (자동으로 npm run gen을 선실행해 content 생성)
npm run dev

# 저장소 markdown/html → src/generated/content.json 생성 + 프로토타입 복사
npm run gen

# 프로덕션 빌드 (prebuild가 gen을 자동 실행) → dist/
npm run build

# 빌드 결과 미리보기
npm run preview

# 타입 검사
npm run typecheck
```

---

## 데이터 원천

빌드 시 `scripts/build-content.mjs` 스크립트가 아래 파일들을 읽어 `src/generated/content.json`을 생성한다.

| 파일 | 역할 |
|------|------|
| 루트 `README.md` | 진행 현황 표, 책 정보 |
| `members.md` | 스터디 멤버 목록 |
| `chapters/chNN/README.md` | 챕터 공용 정리본 |
| `chapters/chNN/<이름>/README.md` | 개인 정리본 |
| `chapters/chNN/**/*.html` | HTML 프로토타입 (인앱 iframe 뷰) |

---

## 자동 배포 방식

`chapters/**`, `README.md`, `members.md`, `site/**` 중 하나라도 `main` 브랜치에 push되면
`.github/workflows/pages.yml`이 자동으로 실행되어 사이트를 재빌드하고 GitHub Pages에 배포한다.

---

## 최초 1회 설정

저장소 Settings → Pages → Build and deployment → Source를 **"GitHub Actions"** 로 변경해야 배포가 활성화된다.

---

## 생성물 커밋 금지

아래 경로는 빌드 때 자동 재생성되므로 커밋하지 않는다(`.gitignore`에 등록됨).

- `src/generated/`
- `public/prototypes/`
- `dist/`

---

## 로컬에서 base 경로 없이 보기

배포 시 base 경로는 `/claude-agentic-study/`로 고정되어 있다.
로컬에서 `/`로 확인하고 싶을 때는 아래처럼 빌드한다.

```bash
BASE_PATH=/ npm run build
```
