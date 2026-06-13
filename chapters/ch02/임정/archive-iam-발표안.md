# (아카이브) 임정 2장 발표안: IAM 버전

> 발표 주제를 "도구 5가지를 트리거 3종으로" 통일하면서, 처음 골랐던 IAM 버전을 여기 아카이브로 보존합니다. 내용 자체는 유효하므로 추후 다른 챕터나 글에서 재사용할 수 있습니다.
> 관련 LinkedIn 초안(IAM 주제)은 로컬 `_drafts/ch02-linkedin-draft.md`에 남아 있습니다.

## 고른 개념: IAM (권한 관리)

- **내용 리마인드**: 에이전트에게 허용(allow)·거부(deny)할 행동을 settings.json permissions로 선언하는 권한 체계. allow/deny/ask 리스트와 permission mode로 구성.
- **나에게 어떤 의미였나**: 내 글로벌 설정에 deny 21건(`rm -rf`, `sudo`, `git push --force`, `DROP TABLE`, 토큰 export 차단)을 먼저 등록해두고, 그 위에서 allow를 폭넓게 열어 권한 프롬프트를 줄이고 있었다. 책을 읽고 이 구조가 "자율성은 권한 설계 다음"이라는 순서였음을 정리하게 됐다. deny가 단단할수록 allow를 과감하게 넓힐 수 있다. (상세 정리: [README.md](README.md) 5절)
