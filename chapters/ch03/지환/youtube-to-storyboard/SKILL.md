---
name: youtube-to-storyboard
description: Convert an authorized local video or accessible YouTube URL into a sequence→scene→shot storyboard (콘티). Use when the user asks for a video storyboard, shot list, scene breakdown, cut analysis, camera/composition analysis, narrative analysis, or "콘티". Triggers — "콘티", "storyboard", "shot list", "컷 분석", "장면 분석", "씬 분석" with a video reference.
allowed-tools:
  - Read
  - Bash
---

# YouTube to Storyboard

## Hierarchy

콘티는 세 계층으로 구성한다.

```
시퀀스 (서사 단락, 감정/장소 단위)
  └─ 씬 (장소·시간·행동 연속성)
       └─ 샷 (컷 단위: 구도·카메라·대사·행동)
```

샷이 "무엇을 찍었는가"라면, 씬은 "어디서 무슨 일이 일어났는가", 시퀀스는 "왜 이 장면들이 묶이는가"다.

## Input

`$ARGUMENTS`에서 입력을 읽는다. 받을 수 있는 형태:

- 로컬 비디오 경로 (`/path/to/video.mp4`)
- 접근 가능한 YouTube URL
- 타임스탬프가 있는 추출 프레임 목록

세분화 수준을 명시하지 않으면 **scene-based(씬 단위)**를 기본으로 사용한다.

## Workflow

### 1. 메타데이터 수집

```bash
ffprobe -v quiet -print_format json -show_format -show_streams "$INPUT"
```

duration, resolution, fps, 오디오 채널, 자막 트랙 유무를 기록한다.

### 2. 씬 경계 감지 + 프레임 추출

```bash
# 씬 경계 감지 (threshold 0.4 기본)
ffmpeg -i "$INPUT" -vf "select='gt(scene,0.4)',showinfo" -vsync vfr frames/scene_%04d.jpg

# 긴 대화 씬 보완 추출: 연속 구간이 30초 초과 시 4~6초 간격 추가
ffmpeg -i "$INPUT" -vf "fps=1/5" -ss "$START" -to "$END" frames/dialogue_%04d.jpg
```

45초 고정 간격은 흐름 파악에는 쓰되, 실제 콘티 씬 경계는 scene detection 결과로 결정한다.

### 3. 스키마 확인

[references/storyboard-schema.md](references/storyboard-schema.md)를 Read한 뒤 분석을 시작한다.

### 4. 씬 분석

각 프레임을 분석할 때:

- **직접 증거만**: 구도·인물 위치·조명·오브젝트는 프레임에서 직접 읽은 것만 기술한다.
- **추론 표기**: 카메라 움직임·내러티브 의도·대사는 연속 프레임·오디오·자막 근거가 없으면 `inference`로 표기한다.
- **주체 익명화**: 실명을 영상만으로 추정하지 않는다. `인물 A`, `인물 B`로 표기하고, 사용자가 이름을 지정하면 일괄 치환한다.
- **자막·대사·음향 분리**: `subtitle`(화면 텍스트), `dialogue`(음성 전사), `audio`(환경음/음악 여부)를 별도 필드로 기록한다.

### 5. 시퀀스 그룹화

씬 분석이 끝난 뒤 장소·감정·서사 목적이 연속되는 씬을 **시퀀스**로 묶는다. 시퀀스에는 제목과 서사 목적 한 줄을 붙인다.

### 6. 출력 생성

[assets/storyboard.md](assets/storyboard.md) 템플릿에서 `storyboard.md`와 구조적으로 동등한 `storyboard.json`을 생성한다.

### 7. 검증

- 타임코드가 시간 순서이고 겹치지 않는다.
- 모든 씬이 `evidence_frame` 경로를 가진다.
- `confidence: low` 항목에 `evidence_note`가 있다.

## 대형 영상 처리 (`context: fork`)

영상이 10분 초과이거나 씬이 50개 이상 예상될 때, 씬 분석 단계를 `mjcf-audit` 패턴처럼 별도 컨텍스트로 분리한다. 부모 대화를 오염시키지 않고 분석 리포트만 반환받는다.

## Output contract

모든 씬(샷)에 포함:

| 필드 | 규칙 |
|---|---|
| `sequence` | 시퀀스 제목 |
| `scene` | 장소 / 시간대 |
| `start` / `end` | `HH:MM:SS.mmm` |
| `shot_size` | ECU, CU, MCU, MS, MLS, LS, ELS, `unknown` |
| `angle` | eye-level, high, low, overhead, Dutch, POV, `unknown` |
| `camera_motion` | static, pan, tilt, dolly, tracking, zoom, handheld, `unknown` (스틸 프레임 판단은 `inference`) |
| `subjects` | `인물 A` 등 익명 배열 |
| `action` | 직접 관찰 가능한 행동 |
| `composition` | 배치·심도·선·여백·색조·조명 |
| `subtitle` | 화면 내 텍스트(OCR); 없으면 `null` |
| `dialogue` | 음성 전사; 없으면 `null` |
| `audio` | 환경음/음악/침묵 여부 |
| `narrative_function` | 이 샷이 서사에서 하는 역할 한 줄 |
| `evidence_frame` | `frames/scene_014.jpg` |
| `confidence` | `high`, `medium`, `low`, `inference` |
| `transition` | cut, dissolve, fade, match cut, `unknown` |

## Failure handling

- URL 접근 불가 → 로컬 사본 또는 제공된 프레임 요청. 접근 제한을 우회하지 않는다.
- scene detector 미설치 → 제한 보고 후 사용자가 제공한 타임스탬프 프레임만 사용.
- 컷이 지나치게 빠를 때 → 연속 컷을 beat로 묶고 묶음 기준을 출력에 명시한다.
- OCR과 음성 전사가 다를 때 → 둘 다 보존하고 불일치를 `evidence_note`에 기록한다.
