import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SimulationConfig, SimulationScenario } from '@/types/simulation';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfigHeaderProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  scenario: SimulationScenario | null;
  onScenarioChange: (scenario: SimulationScenario | null) => void;
}

export function ConfigHeader({ config, onConfigChange, scenario, onScenarioChange }: ConfigHeaderProps) {
  const [contextExpanded, setContextExpanded] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonValue, setJsonValue] = useState(() => 
    scenario ? JSON.stringify(scenario, null, 2) : ''
  );

  const updateConfig = (key: keyof SimulationConfig, value: string) => {
    onConfigChange({ ...config, [key]: value });
  };

  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    
    if (!value.trim()) {
      setJsonError(null);
      onScenarioChange(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      onScenarioChange(parsed as SimulationScenario);
    } catch (e) {
      setJsonError('JSON invalide');
    }
  };

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Configuration API</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="apiUrl" className="text-xs font-medium text-muted-foreground">
            API Base URL
          </Label>
          <Input
            id="apiUrl"
            placeholder="http://localhost:8000"
            value={config.apiBaseUrl}
            onChange={(e) => updateConfig('apiBaseUrl', e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="apiKey" className="text-xs font-medium text-muted-foreground">
            X-API-Key
          </Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Votre clé API"
            value={config.apiKey}
            onChange={(e) => updateConfig('apiKey', e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="myUserId" className="text-xs font-medium text-muted-foreground">
            Mon User ID
          </Label>
          <Input
            id="myUserId"
            placeholder="ID du manager"
            value={config.myUserId}
            onChange={(e) => updateConfig('myUserId', e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="counterpartId" className="text-xs font-medium text-muted-foreground">
            Counterpart User ID
          </Label>
          <Input
            id="counterpartId"
            placeholder="ID du collaborateur"
            value={config.counterpartUserId}
            onChange={(e) => updateConfig('counterpartUserId', e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>

      {/* Context JSON Section */}
      <div className="mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setContextExpanded(!contextExpanded)}
          className="flex items-center gap-2 p-0 h-auto text-muted-foreground hover:text-foreground"
        >
          {contextExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="text-xs font-medium">Context JSON (optionnel)</span>
          {scenario && <span className="text-xs text-primary">• Configuré</span>}
        </Button>

        {contextExpanded && (
          <div className="mt-3 space-y-1.5">
            <Textarea
              placeholder='{"simulation_id": "...", "title_simulation": "...", "contact": {...}, "context": "...", "objectives": [...], "evaluation_criteria": [...]}'
              value={jsonValue}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`min-h-[120px] font-mono text-xs ${jsonError ? 'border-destructive' : ''}`}
            />
            {jsonError && (
              <p className="text-xs text-destructive">{jsonError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Ce JSON sera envoyé dans le champ "context" des appels simulation et analyse.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
