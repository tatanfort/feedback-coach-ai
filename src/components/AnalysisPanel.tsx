import { AnalysisResult } from '@/types/simulation';
import { ScoreBadge } from './ScoreBadge';
import { CheckCircle2, Target, Lightbulb, Quote } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AnalysisPanelProps {
  analysis: AnalysisResult;
}

// Helper to format score keys into readable labels
const formatScoreLabel = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Score Global</h3>
          <ScoreBadge score={analysis.overall_score} size="lg" />
        </div>

        {/* Summary */}
        <div className="bg-secondary/50 rounded-xl p-4">
          <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Detailed Scores */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Scores Détaillés</h4>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(analysis.scores).map(([key, score]) => (
              <ScoreBadge 
                key={key} 
                score={score} 
                size="sm" 
                showLabel 
                label={formatScoreLabel(key)} 
              />
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <h4 className="text-sm font-semibold text-foreground">Points Forts</h4>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-success mt-0.5">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-warning" />
            <h4 className="text-sm font-semibold text-foreground">Axes d'Amélioration</h4>
          </div>
          <ul className="space-y-2">
            {analysis.areas_for_improvement.map((area, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                {area}
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Tips */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Conseils Pratiques</h4>
          </div>
          <ul className="space-y-2">
            {analysis.actionable_tips.map((tip, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">💡</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Key Moments */}
        {analysis.key_moments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Quote className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">Moments Clés</h4>
            </div>
            <div className="space-y-3">
              {analysis.key_moments.map((moment, index) => (
                <div key={index} className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-sm italic text-foreground mb-2">"{moment.moment}"</p>
                  <p className="text-xs text-muted-foreground">{moment.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
