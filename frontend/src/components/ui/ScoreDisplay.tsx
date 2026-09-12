interface ScoreDisplayProps {
  score: number;
  max?: number;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function scoreClass(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 80) return 'score-high';
  if (pct >= 60) return 'score-mid';
  return 'score-low';
}

export function ScoreDisplay({ score, max = 100, showBar = false, size = 'md' }: ScoreDisplayProps) {
  const cls = scoreClass(score, max);
  const pct = (score / max) * 100;
  const fontSize = size === 'lg' ? '1.75rem' : size === 'sm' ? '1rem' : '1.35rem';

  return (
    <div className={`score-display-wrap ${cls}`}>
      <div className="score-display">
        <span className="score-value" style={{ fontSize }}>{score}</span>
        <span className="score-max">/{max}</span>
      </div>
      {showBar && (
        <div className="score-bar-wrap">
          <div className="score-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
