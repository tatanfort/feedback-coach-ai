import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AnalysisResult, SimulationMode, Message } from '@/types/simulation';
import { AnalysisPanel } from './AnalysisPanel';
import { BarChart3, RefreshCw, Download, Info, Loader2 } from 'lucide-react';

interface SidePanelProps {
  conversationId: string | null;
  messagesCount: number;
  currentMode: SimulationMode;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  messages: Message[];
  onAnalyze: () => void;
  onReset: () => void;
  onExport: () => void;
}

export function SidePanel({
  conversationId,
  messagesCount,
  currentMode,
  analysisResult,
  isAnalyzing,
  messages,
  onAnalyze,
  onReset,
  onExport,
}: SidePanelProps) {
  const modeLabels: Record<SimulationMode, string> = {
    simulation: 'Simulation',
    analysis: 'Analyse',
    chat: 'Chat Classique',
  };

  return (
    <div className="h-full flex flex-col bg-panel-bg border-l border-panel-border">
      {/* Info Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Info className="h-4 w-4 text-primary" />
          Informations
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Conversation</span>
            <span className="font-mono text-xs text-foreground truncate max-w-[120px]">
              {conversationId || '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Messages</span>
            <span className="text-foreground font-medium">{messagesCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode</span>
            <span className="text-foreground font-medium">{modeLabels[currentMode]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Actions Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          ⚡ Actions
        </div>
        
        <div className="space-y-2">
          <Button
            variant="success"
            className="w-full justify-start"
            onClick={onAnalyze}
            disabled={!conversationId || isAnalyzing || messagesCount === 0}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            {isAnalyzing ? 'Analyse en cours...' : 'Analyser la Simulation'}
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onReset}
          >
            <RefreshCw className="h-4 w-4" />
            Nouvelle Conversation
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onExport}
            disabled={messagesCount === 0}
          >
            <Download className="h-4 w-4" />
            Exporter JSON
          </Button>
        </div>
      </div>

      <Separator />

      {/* Analysis Results */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            Résultats d'Analyse
          </div>
        </div>
        
        {analysisResult ? (
          <AnalysisPanel analysis={analysisResult} />
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {conversationId 
                ? "Cliquez sur \"Analyser la Simulation\" pour obtenir un feedback détaillé."
                : "Démarrez une conversation pour pouvoir l'analyser."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
