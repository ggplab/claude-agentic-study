import { Card } from "../Card";
import "./StatCard.css";

interface Props {
  icon: string;
  value: number | string;
  label: string;
}

/** 단일 통계 수치를 강조 표시하는 카드. 아이콘·숫자·라벨 구성. */
export function StatCard({ icon, value, label }: Props) {
  return (
    <Card className="stat-card">
      <span className="stat-card-icon" aria-hidden>
        {icon}
      </span>
      <span className="stat-card-value">{value}</span>
      <span className="stat-card-label">{label}</span>
    </Card>
  );
}
