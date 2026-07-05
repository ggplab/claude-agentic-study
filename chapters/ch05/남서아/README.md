# 남서아 · 5장 정리: 출력 스타일에 심는 환각 방지 지침 (2026-07-05)

- **관통 질문**: 출력 스타일의 환각 방지 지침은 정확히 어떤 원리로 작동하고, 얼마나 믿어도 되나?
- 조사 방식: 책 5장 해당 절 정리 → 공식 문서 검증 · 실사례 조사 서브에이전트 2개 병렬 fan-out → 종합
- ⚠️ **핵심 발견**: "출력 스타일로 환각 방지"는 공식 기능이 아니라 **공식 기법을 스타일 파일에 옮겨 담은 책의 응용 제안**이다. 기법 자체는 공식·학술 근거가 있지만, "시스템 수준이 요청 프롬프트보다 효과적"이라는 비교 근거는 어디에도 없다

![환각 방지 지침 지도](hallucination-map.png)

- 도식 원본: [hallucination-map.html](hallucination-map.html)

---

## 1. 책 내용 정리 (5장 "출력 스타일에서 환각 방지 지침")

- 전제: 출력 스타일은 응답 특성을 시스템 수준에서 바꾼다 → 환각 방지 지침도 여기 심으면 요청마다 반복 없이 일관 적용
- 환각의 전형: 존재하지 않는 URL 제시 · 확인 안 된 API 정보 단정 · 실행 안 한 검증 결과 보고

### 규칙 4축

| 축 | 내용 |
|---|---|
| **① URL 인용 정책** | 도구 응답에 실제 나타난 URL만 인용 · 패턴 추측 생성 금지 · 못 찾으면 "검색 결과에서 URL을 찾을 수 없습니다" 명시 · 출처에 "WebSearch를 통해 검색됨" 표시 |
| **② 불확실성 표현 허용** | 클로드가 '모르겠다'라고 말하기 어려운 상황이 환각의 주요 원인 → "공식 출처를 통한 검증이 필요합니다" 같은 표현을 명시적으로 허용 |
| **③ 도구 결과 기반 강제** | 도구 검증 없이 URL 제공 금지 · 파일시스템 확인 없이 버전 번호 금지 · 문서 검색 없이 API 동작 주장 금지 |
| **④ 출처 표시 (팀 검증 스타일)** | 모든 기술적 주장에 출처: 파일 기반(경로/파일명:줄번호) · 웹 기반(WebFetch/WebSearch URL) · 문서(라이브러리/버전) |

- 책의 결론: 기술 문서 생성·코드 리뷰·API 통합처럼 **정확성이 중요한 작업**에서 특히 차이가 난다

---

## 2. 공식 문서 실측 — 책 주장은 어디까지 근거가 있나

### 검증 결과 요약

| 주장 | 판정 | 근거 |
|---|---|---|
| 환각 감소 기법 자체 | ✅ 공식 | Anthropic [Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) 가이드에 "I don't know" 허용 · 인용 grounding · 인용 검증 명시 |
| 출력 스타일이 시스템 프롬프트를 바꾼다 | ✅ 공식 | [Output styles](https://code.claude.com/docs/en/output-styles) — 정확한 동작은 아래 "동작 원리 3가지" 참조 |
| "출력 스타일 = 환각 방지 수단" | ⚠️ 책의 응용 | 공식 output styles 문서에 환각 언급 **없음**(역할·톤·형식 변경 용도). 공식 프롬프트 기법을 스타일 파일로 옮긴 제안 |
| "시스템 수준이 요청 프롬프트보다 효과적" | ❌ 근거 없음 | 공식 비교 설명·벤치마크 모두 부재 |

### output style 동작 원리 3가지 — 지침을 여기 심으면 무슨 일이 생기나

1. **끝에 추가 + 대화 중 리마인더 재주입**
   - 클로드 코드는 매 세션 자체 시스템 프롬프트(내장 코딩 지침)로 시작하고, 커스텀 스타일 지침은 그 **맨 뒤에 덧붙는다** (통째로 갈아끼우는 게 아님)
   - 대화가 길어지면 모델이 앞쪽 지침을 잊는 경향이 있는데, 클로드 코드가 대화 중간에 "스타일 지침을 지켜라"는 리마인더를 **자동으로 다시 끼워넣는다**
   - → 환각 방지 지침을 CLAUDE.md가 아니라 스타일에 심을 때의 실질 이점: **지침이 계속 재주입돼 긴 세션에서도 살아남는다**
2. **`keep-coding-instructions: false`(기본)의 함정**
   - 커스텀 스타일을 켜면 기본적으로 내장 SWE 지침(변경 범위 잡기·주석·작업 검증 방법)이 **빠져버린다**
   - → "환각 방지 스타일"을 켰더니 코딩 능력이 은근히 깎이는 부작용 가능. 코딩 세션용이면 frontmatter에 `keep-coding-instructions: true` 필수
3. **세션 시작 시 1회 로드 (프롬프트 캐싱)**
   - 스타일 파일은 세션 시작 때 한 번만 읽힌다. 세션 도중 `.md`를 고쳐도 지금 대화엔 반영 안 됨 → `/clear` 또는 새 세션 필요
   - 이유는 프롬프트 캐싱: 시스템 프롬프트를 고정해야 매 턴 비용이 싸진다

- **헤르메스 실험에 대입**: 스킬/CLAUDE.md 방식은 "추가"라 SWE 능력 보존이 쉽고, output style 방식은 리마인더 재주입이 있는 대신 `keep-coding-instructions`를 챙겨야 한다 — before/after 비교에서 통제할 변수

### 그래서 "왜 효과가 있는(것처럼 보이는)가" — 내 정리

- **기법의 힘**: "모르겠다" 허용·도구 기반 강제 자체가 환각을 줄인다는 건 공식 + 학술 근거가 있다 (아래 3절)
- **위치의 힘(운영)**: 스타일에 심으면 매 세션 자동 적용 + 리마인더 재주입 → 사람이 깜빡해도 규칙이 산다. 효과의 실체는 "시스템 프롬프트가 더 세다"가 아니라 **"반복 없이 일관 적용된다"** 쪽에 가깝다
- **믿음의 한계**: 지침은 확률을 낮출 뿐 보장이 아니다. 공식 가이드도 "크게 줄이지만 완전 제거는 불가"라고 명시 → **"지침을 넣었다 = 환각이 사라졌다"로 착각하지 않기**

### 애초에 "I don't know" 허용은 왜 통하는가 — 원리

> 지침 한 줄이 왜 효과를 내는지 근거를 파봤다. 결론: 모델이 몰라서 지어내는 게 아니라, **"모른다"는 선택지가 학습 과정에서 억눌려 있어서**다.

1. **LLM은 "가장 그럴듯한 이어짓기"를 뽑는 기계다**
   - 모르는 질문에서도 그럴듯한 URL·버전 번호가 확률상 자연스러운 연속이면 그냥 나온다. 환각은 버그가 아니라 이 구조의 기본 동작
2. **훈련이 "찍기"를 보상해왔다** — [Why Language Models Hallucinate (OpenAI, 2025)](https://arxiv.org/abs/2509.04664)
   - 오답 감점 없는 시험에선 찍는 게 기대점수상 이득이듯, 대부분의 벤치마크·평가가 빈칸("모르겠다")보다 자신 있는 오답에 점수를 줬다 → 모델은 시험 잘 보는 수험생으로 최적화되며 불확실할 때 찍도록 훈련된다는 것이 논문의 핵심 논증
3. **그런데 모델은 자기가 모른다는 걸 어느 정도 "안다"** — [Language Models (Mostly) Know What They Know (Anthropic, 2022)](https://arxiv.org/abs/2207.05221)
   - 모델이 자기 답이 맞을 확률(P(True))과 "내가 이 질문의 답을 아는지"(P(IK))를 꽤 잘 추정한다는 실측 — **불확실성 신호는 이미 모델 안에 있다**

- **종합**: "모르면 모른다고 해도 된다"는 지침은 새 능력을 주는 게 아니라, 2번이 억누른 "모르겠다" 출력 경로를 다시 열어 3번의 내부 캘리브레이션이 겉으로 나오게 하는 것 → 지침 한 줄치고 효과가 큰 이유
- **같은 원리에서 나오는 한계**: "(mostly)"다 — 모델이 자신 있게 틀리는 영역(훈련 데이터에 그럴듯한 오답이 많은 곳)에선 이 지침도 안 통한다. 그래서 도구 검증 강제가 별도 축으로 필요하다

---

## 3. 참고 자료 지도 — 프롬프트 개선에 쓸 것들

### 공식 (Anthropic)

- [Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) — 기본 3기법("I don't know" 허용 · 직접 인용 grounding · 인용 기반 검증-철회) + 고급 4기법(CoT 검증 · Best-of-N · 반복 정제 · 외부 지식 제한)
- [Output styles](https://code.claude.com/docs/en/output-styles) · [Prompt caching](https://code.claude.com/docs/en/prompt-caching) — 심는 위치의 동작 원리

### 학술 (기법의 효과 입증)

- **According-to prompting** ([arXiv 2305.13252](https://arxiv.org/abs/2305.13252)) — "According to Wikipedia, ..."만 붙여도 grounding 개선을 QUIP-Score로 정량 입증
- **Chain-of-Verification** ([arXiv 2309.11495](https://arxiv.org/abs/2309.11495), Meta) — 초안→검증 질문→독립 답변→최종 응답 4단계로 환각 감소 입증

### 실사례 (GitHub · 커뮤니티)

- [Anti-Hallucination Rules gist (mingrath)](https://gist.github.com/mingrath/7e292d9ca976f63e499db971f21b6bbe) — Claude Code/Cursor/Windsurf 공용 5규칙. 핵심 문구 **"No source = no claim"**
- [anthropic-anti-hallucinate-skills (instantX-research)](https://github.com/instantX-research/anthropic-anti-hallucinate-skills) — CLAUDE.md 전역/프로젝트/플러그인 3가지 설치 방식. "being honest IS being helpful" 프레임
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) — anti-hallucination 설계 스킬 수록
- 커뮤니티 공통 패턴: `[Verified]/[Unverified]` 라벨 · tool-first 검증 · 완료 주장 전 증거 확인
- **부재 확인**: 환각 방지 **전용 output style** 공개 사례는 못 찾음 — 실사례는 전부 CLAUDE.md 규칙/스킬 형태. 규칙 파일 자체의 통제 벤치마크도 없음

---

## 4. 헤르메스 에이전트 적용 계획

- 배경: 오늘 헤르메스 에이전트 설치를 알려주는 오프라인 스터디를 진행했다. 비개발자 동료·스터디원에게 넘기는 세팅일수록 환각 방지가 기본값이어야 한다 (2장 "잘 넘기는 법"의 연장)
- 내 뉴스 크롤링 도구의 실증: 파이프라인 대부분이 결정론인데도 **분류 단계(LLM 개입 지점)에서 가끔 환각** — URL 처리 규칙을 생각하지 못했던 지점

### 실험 설계 (예정)

| 단계 | 내용 |
|---|---|
| 1. 스킬 제작 | 헤르메스 전용 환각 방지 스킬 — 규칙 4축을 SKILL.md로. 실사례가 CLAUDE.md 형태 지배적이므로 전역 CLAUDE.md 규칙 버전도 병행 |
| 2. before/after | 같은 작업(기술 질문·뉴스 분류)을 지침 유/무로 돌려 출처 표기율·미검증 단정 횟수 비교 |
| 3. 공유 세트 | 옵시디언에서 편집 가능한 룰북 체계·목차 포함해 스터디원 배포 |

---

## 5. 남은 미제

- 규칙 4축 중 **어느 축이 효과의 대부분을 내는지** 분리 측정 필요 (체감상 ②불확실성 허용 + ③도구 기반이 컸다)
- 커스텀 스타일의 SWE 지침 제거 리스크(`keep-coding-instructions`)와 환각 방지 지침의 상호작용
- 지침 준수율이 모델·컨텍스트 길이에 따라 어떻게 변하는지

---

## 출처

1. [platform.claude.com — Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) (공식)
2. [code.claude.com — Output styles](https://code.claude.com/docs/en/output-styles) · [Prompt caching](https://code.claude.com/docs/en/prompt-caching) (공식)
3. [arXiv 2305.13252](https://arxiv.org/abs/2305.13252) · [arXiv 2309.11495](https://arxiv.org/abs/2309.11495) · [arXiv 2207.05221](https://arxiv.org/abs/2207.05221) (Anthropic, P(IK) 캘리브레이션) · [arXiv 2509.04664](https://arxiv.org/abs/2509.04664) (OpenAI, 찍기 보상 구조) (학술)
4. [mingrath gist](https://gist.github.com/mingrath/7e292d9ca976f63e499db971f21b6bbe) · [instantX-research](https://github.com/instantX-research/anthropic-anti-hallucinate-skills) · [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) (실사례)
5. 책 〈클로드 코드로 시작하는 실전 에이전틱 코딩〉 5장 해당 절 · 서브에이전트 조사 2건(2026-07-05)
