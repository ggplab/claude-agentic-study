import "./ProgressBar.css";

interface Props {
  done: number;
  total: number;
  inProgress?: number;
}

/** 스터디 챕터 진행 현황을 시각화하는 가로 막대 컴포넌트. */
export function ProgressBar({ done, total, inProgress = 0 }: Props) {
  const donePercent = total > 0 ? (done / total) * 100 : 0;
  const progressPercent = total > 0 ? (inProgress / total) * 100 : 0;
  const planned = total - done - inProgress;

  return (
    <div className="progress-bar-wrap">
      <div className="progress-bar-header">
        <span className="progress-bar-title">챕터 진행 현황</span>
        <span>
          완료 {done} / 전체 {total}
        </span>
      </div>

      {/* 완료 막대 */}
      <div
        className="progress-bar-track"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`전체 ${total}개 챕터 중 ${done}개 완료`}
      >
        <div
          className="progress-bar-fill is-done"
          style={{ width: `${donePercent}%` }}
        />
      </div>

      {/* 진행중 막대 */}
      {inProgress > 0 && (
        <div
          className="progress-bar-track"
          role="progressbar"
          aria-valuenow={inProgress}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`전체 ${total}개 챕터 중 ${inProgress}개 진행중`}
        >
          <div
            className="progress-bar-fill is-progress"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="progress-bar-legend" aria-hidden>
        <span className="progress-bar-legend-item">
          <span className="progress-legend-dot is-done" />
          완료 {done}개
        </span>
        {inProgress > 0 && (
          <span className="progress-bar-legend-item">
            <span className="progress-legend-dot is-progress" />
            진행중 {inProgress}개
          </span>
        )}
        {planned > 0 && (
          <span className="progress-bar-legend-item">
            <span className="progress-legend-dot is-planned" />
            예정 {planned}개
          </span>
        )}
      </div>
    </div>
  );
}
