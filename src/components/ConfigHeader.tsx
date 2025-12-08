import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimulationConfig } from '@/types/simulation';
import { Settings } from 'lucide-react';

interface ConfigHeaderProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
}

export function ConfigHeader({ config, onConfigChange }: ConfigHeaderProps) {
  const updateConfig = (key: keyof SimulationConfig, value: string) => {
    onConfigChange({ ...config, [key]: value });
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
    </div>
  );
}
