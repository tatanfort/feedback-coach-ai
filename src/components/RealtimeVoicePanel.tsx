import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, Volume2, Loader2 } from 'lucide-react';
import { RealtimeStatus } from '@/hooks/useRealtimeVoice';
import { cn } from '@/lib/utils';

interface RealtimeVoicePanelProps {
  status: RealtimeStatus;
  error: string | null;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function RealtimeVoicePanel({
  status,
  error,
  isConnected,
  onConnect,
  onDisconnect,
}: RealtimeVoicePanelProps) {
  const getStatusLabel = () => {
    switch (status) {
      case 'idle': return 'Prêt à démarrer';
      case 'connecting': return 'Connexion en cours...';
      case 'connected': return 'Connecté';
      case 'listening': return 'À l\'écoute...';
      case 'speaking': return 'IA en train de parler...';
      case 'error': return 'Erreur de connexion';
      default: return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connecting':
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      case 'listening':
        return <Mic className="h-8 w-8 text-success animate-pulse" />;
      case 'speaking':
        return <Volume2 className="h-8 w-8 text-primary animate-pulse" />;
      case 'error':
        return <PhoneOff className="h-8 w-8 text-destructive" />;
      default:
        return <Phone className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-background">
      {/* Status visualization */}
      <div className="relative mb-8">
        {/* Pulse rings for active states */}
        {(status === 'listening' || status === 'speaking') && (
          <>
            <div className={cn(
              "absolute inset-0 rounded-full animate-ping opacity-20",
              status === 'listening' ? 'bg-success' : 'bg-primary'
            )} style={{ animationDuration: '2s' }} />
            <div className={cn(
              "absolute inset-0 rounded-full animate-ping opacity-10",
              status === 'listening' ? 'bg-success' : 'bg-primary'
            )} style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          </>
        )}
        
        {/* Main circle */}
        <div className={cn(
          "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
          status === 'idle' && "bg-muted",
          status === 'connecting' && "bg-primary/10",
          status === 'connected' && "bg-primary/20",
          status === 'listening' && "bg-success/20",
          status === 'speaking' && "bg-primary/20",
          status === 'error' && "bg-destructive/20",
        )}>
          {getStatusIcon()}
        </div>
      </div>

      {/* Status text */}
      <h3 className={cn(
        "text-lg font-semibold mb-2",
        status === 'error' ? 'text-destructive' : 'text-foreground'
      )}>
        {getStatusLabel()}
      </h3>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive mb-4 text-center max-w-sm">
          {error}
        </p>
      )}

      {/* Instructions */}
      {status === 'listening' && (
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
          Parlez naturellement. L'IA vous répondra automatiquement.
        </p>
      )}

      {status === 'speaking' && (
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
          Attendez que l'IA finisse de parler...
        </p>
      )}

      {status === 'idle' && (
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
          Démarrez une conversation vocale en temps réel avec l'IA.
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!isConnected ? (
          <Button
            size="lg"
            onClick={onConnect}
            disabled={status === 'connecting'}
            className="px-8 py-6 text-lg gap-2"
          >
            {status === 'connecting' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Phone className="h-5 w-5" />
            )}
            Démarrer l'appel
          </Button>
        ) : (
          <Button
            size="lg"
            variant="destructive"
            onClick={onDisconnect}
            className="px-8 py-6 text-lg gap-2"
          >
            <PhoneOff className="h-5 w-5" />
            Terminer l'appel
          </Button>
        )}
      </div>

      {/* Duration indicator (optional enhancement) */}
      {isConnected && (
        <div className="mt-8 text-sm text-muted-foreground">
          Appel en cours...
        </div>
      )}
    </div>
  );
}
