import { stageBadgeStyle, stageLabel } from "../usePipelineStages";

export default function LeadStatusBadge({ status, stages }) {
  const style = stageBadgeStyle(stages, status);
  const label = stageLabel(stages, status);
  return (
    <span className="badge" style={style}>
      {label}
    </span>
  );
}
