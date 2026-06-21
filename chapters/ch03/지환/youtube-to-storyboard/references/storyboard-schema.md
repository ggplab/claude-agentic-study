# Storyboard schema

## Hierarchy

```
Sequence  →  scene narrative unit (emotion / location arc)
  Scene   →  continuous location / time / action
    Shot  →  single cut: framing, camera, dialogue, action
```

시퀀스는 서사 단락(감정·장소 흐름이 같은 씬 묶음), 씬은 장소·시간 연속성, 샷은 컷 단위다.

## Subject anonymization rule

영상만으로 실명을 추정하지 않는다. `인물 A`, `인물 B` … 순서로 표기한다. 사용자가 이름을 지정하면 일괄 치환한다.

## Confidence levels

| 값 | 의미 |
|---|---|
| `high` | 프레임·오디오·자막에서 직접 확인 |
| `medium` | 복수 프레임이나 문맥으로 강하게 추정 |
| `low` | 단일 프레임 단서만 있어 불확실 |
| `inference` | 증거 없음, 추론만 |

`confidence: low` 이하는 반드시 `evidence_note`에 근거를 남긴다.

## Shot fields

| Field | Rule |
|---|---|
| `shot_id` | `S01`, `S02` … 연속 |
| `sequence` | 시퀀스 제목 (씬이 속한 서사 단락) |
| `scene` | 장소 / 시간대 (예: `지하철 내부 / 낮`) |
| `start` / `end` | `HH:MM:SS.mmm`; end > start |
| `shot_size` | ECU, CU, MCU, MS, MLS, LS, ELS, `unknown` |
| `angle` | eye-level, high, low, overhead, Dutch, POV, `unknown` |
| `camera_motion` | static, pan, tilt, dolly, tracking, zoom, handheld, `unknown`. 스틸 프레임 판단은 `inference`. |
| `subjects` | 배열. 실명 미확인 시 `인물 A` 등 익명 사용 |
| `action` | 직접 관찰 가능한 행동만 |
| `composition` | 배치·심도·leading lines·여백·색조·조명 |
| `subtitle` | 화면 내 텍스트(OCR). 없으면 `null`. |
| `dialogue` | 음성 전사. 없으면 `null`. OCR과 다르면 둘 다 보존. |
| `audio` | 환경음 / 음악 / 침묵 여부 |
| `narrative_function` | 이 샷이 서사에서 하는 역할 한 줄 |
| `evidence_frame` | 대표 프레임 상대 경로 |
| `confidence` | `high`, `medium`, `low`, `inference` |
| `transition` | cut, dissolve, fade, match cut, `unknown` |
| `evidence_note` | 직접 증거 및 불확실 이유 |

## Analysis rules

- 프레임에서 읽을 수 있는 것: 구도·오브젝트·조명·포즈·화면 텍스트.
- 프레임만으로 판단하지 않는 것: 카메라 움직임·대사·내러티브 의도 → 연속 프레임·오디오·자막 근거 필요.
- 연속 테이크는 요청 세분화 수준이 "모든 컷"이 아니면 하나의 씬으로 유지한다.
- 빠른 연속 컷은 beat로 묶되, 묶음 기준(예: 3초 이내)을 출력에 명시한다.
- 긴 대화 씬(30초 초과 연속 구간)은 4~6초 간격으로 보완 프레임을 추출한다.

## JSON shape

```json
{
  "source": {
    "path_or_url": "...",
    "duration": "HH:MM:SS.mmm",
    "resolution": "854x480",
    "fps": 23.976,
    "subtitle_track": true
  },
  "granularity": "scene-based",
  "sequences": [
    {
      "sequence_id": "SQ01",
      "title": "관계의 단절",
      "narrative_purpose": "두 인물 사이의 거리감을 공간 이동으로 드러냄",
      "scenes": ["S04", "S05", "S06"]
    }
  ],
  "shots": [
    {
      "shot_id": "S01",
      "sequence": "SQ01",
      "scene": "지하철 내부 / 낮",
      "start": "02:11.400",
      "end": "02:16.700",
      "shot_size": "MS",
      "angle": "eye-level",
      "camera_motion": "static",
      "subjects": ["인물 B"],
      "action": "차량 내부에서 이동한다",
      "composition": "중앙 배치, 창문과 손잡이가 배경 리듬 형성",
      "subtitle": null,
      "dialogue": null,
      "audio": "환경음(열차 소음)",
      "narrative_function": "인물의 고립과 이동을 연결",
      "evidence_frame": "frames/scene_014.jpg",
      "confidence": "high",
      "transition": "cut",
      "evidence_note": "프레임에서 직접 확인: 창문, 손잡이, 인물 위치"
    }
  ]
}
```
