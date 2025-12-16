import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimulationMode, SimulationType } from '@/types/simulation';
import { Drama, BarChart3, MessageCircle, Phone } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: SimulationMode;
  simulationType: SimulationType;
  onModeChange: (mode: SimulationMode) => void;
  onSimulationTypeChange: (type: SimulationType) => void;
}

const simulationTypes: { value: SimulationType; label: string }[] = [
  { value: 'manager_feedback', label: 'Manager Feedback' },
  { value: 'peer_feedback', label: 'Peer Feedback' },
  { value: 'sales_simulation', label: 'Simulation Vente' },
  { value: 'interview_simulation', label: 'Simulation Entretien' },
];

export function ModeSelector({ 
  currentMode, 
  simulationType, 
  onModeChange, 
  onSimulationTypeChange 
}: ModeSelectorProps) {
  return (
    <div className="bg-card border-b border-border px-6 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={currentMode === 'simulation' ? 'modeActive' : 'mode'}
            onClick={() => onModeChange('simulation')}
            className="flex-1 sm:flex-none"
          >
            <Drama className="h-4 w-4" />
            Simulation
          </Button>
          <Button
            variant={currentMode === 'realtime' ? 'modeActive' : 'mode'}
            onClick={() => onModeChange('realtime')}
            className="flex-1 sm:flex-none"
          >
            <Phone className="h-4 w-4" />
            Temps Réel
          </Button>
          <Button
            variant={currentMode === 'analysis' ? 'modeActive' : 'mode'}
            onClick={() => onModeChange('analysis')}
            className="flex-1 sm:flex-none"
          >
            <BarChart3 className="h-4 w-4" />
            Analyse
          </Button>
          <Button
            variant={currentMode === 'chat' ? 'modeActive' : 'mode'}
            onClick={() => onModeChange('chat')}
            className="flex-1 sm:flex-none"
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Type :</span>
          <Select value={simulationType} onValueChange={(v) => onSimulationTypeChange(v as SimulationType)}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {simulationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
