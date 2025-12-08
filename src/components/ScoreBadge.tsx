import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export function ScoreBadge({ score, maxScore = 5, size = 'md', showLabel, label }: ScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-success text-success-foreground';
    if (score >= 3) return 'bg-warning text-warning-foreground';
    return 'bg-danger text-danger-foreground';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold shadow-soft",
          getScoreColor(score),
          sizeClasses[size]
        )}
      >
        {score}
      </div>
      {showLabel && label && (
        <span className="text-xs text-muted-foreground text-center">{label}</span>
      )}
      {size === 'lg' && (
        <span className="text-sm text-muted-foreground">/ {maxScore}</span>
      )}
    </div>
  );
}
