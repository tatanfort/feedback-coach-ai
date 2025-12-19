import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { 
  SimulationConfig, 
  SimulationMode, 
  SimulationType, 
  Message, 
  ConversationState,
  AnalysisResult 
} from '@/types/simulation';
import { sendSimulationMessage, analyzeSimulation, sendClassicChatMessage, sendSimulationAudio } from '@/lib/api';
import { ConfigHeader } from './ConfigHeader';
import { ModeSelector } from './ModeSelector';
import { ChatArea } from './ChatArea';
import { SidePanel } from './SidePanel';
import { RealtimeVoicePanel } from './RealtimeVoicePanel';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import { Drama } from 'lucide-react';

const defaultConfig: SimulationConfig = {
  apiBaseUrl: 'http://localhost:8000',
  apiKey: '',
  myUserId: '',
  counterpartUserId: '',
};

export function SimulationTester() {
  const [config, setConfig] = useLocalStorage<SimulationConfig>('simulation-config', defaultConfig);
  const [currentMode, setCurrentMode] = useState<SimulationMode>('simulation');
  const [simulationType, setSimulationType] = useState<SimulationType>('manager_feedback');
  const [conversationState, setConversationState] = useState<ConversationState>({
    messages: [],
    conversationId: null,
    isLoading: false,
    analysisResult: null,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classicChatId] = useState(() => crypto.randomUUID());

  // Realtime voice hook
  const handleRealtimeConversationIdChange = useCallback((id: string) => {
    setConversationState(prev => ({ ...prev, conversationId: id }));
  }, []);

  const realtimeVoice = useRealtimeVoice({
    config,
    simulationType,
    conversationId: conversationState.conversationId,
    onConversationIdChange: handleRealtimeConversationIdChange,
  });

  const validateConfig = useCallback(() => {
    if (!config.apiBaseUrl.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez renseigner l\'URL de l\'API', variant: 'destructive' });
      return false;
    }
    if (!config.apiKey.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez renseigner la clé API', variant: 'destructive' });
      return false;
    }
    if (!config.myUserId.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez renseigner votre User ID', variant: 'destructive' });
      return false;
    }
    if ((currentMode === 'simulation' || currentMode === 'realtime') && !config.counterpartUserId.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez renseigner le Counterpart User ID', variant: 'destructive' });
      return false;
    }
    return true;
  }, [config, currentMode]);

  const handleSendMessage = useCallback(async (messageContent: string) => {
    if (!validateConfig()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setConversationState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      if (currentMode === 'simulation') {
        const response = await sendSimulationMessage(
          config,
          messageContent,
          simulationType,
          conversationState.conversationId
        );

        const aiMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        };

        setConversationState(prev => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          conversationId: response.conversation_id,
          isLoading: false,
        }));
      } else if (currentMode === 'chat') {
        const response = await sendClassicChatMessage(config, messageContent, classicChatId);
        console.log('Classic chat response:', response);

        // Handle various response formats from the API
        const responseText = 
          response.message || 
          (response as any).content || 
          (response as any).text || 
          (response as any).response ||
          JSON.stringify(response);

        const aiMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
        };

        setConversationState(prev => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de l\'envoi du message',
        variant: 'destructive',
      });
      setConversationState(prev => ({ ...prev, isLoading: false }));
    }
  }, [config, currentMode, simulationType, conversationState.conversationId, classicChatId, validateConfig]);

  const handleSendAudio = useCallback(async (audioBlob: Blob) => {
    if (!validateConfig()) return;
    if (currentMode !== 'simulation') {
      toast({ title: 'Erreur', description: 'Le mode audio n\'est disponible qu\'en simulation', variant: 'destructive' });
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: '🎤 Message vocal envoyé',
      timestamp: new Date(),
      isAudioMessage: true,
    };

    setConversationState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      const response = await sendSimulationAudio(
        config,
        audioBlob,
        simulationType,
        conversationState.conversationId
      );

      const audioUrl = URL.createObjectURL(response.audioBlob);

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '', // Audio response - no text content
        timestamp: new Date(),
        audioUrl,
      };

      setConversationState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        conversationId: response.conversationId,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error sending audio:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de l\'envoi de l\'audio',
        variant: 'destructive',
      });
      setConversationState(prev => ({ ...prev, isLoading: false }));
    }
  }, [config, currentMode, simulationType, conversationState.conversationId, validateConfig]);

  const handleAnalyze = useCallback(async () => {
    if (!conversationState.conversationId) {
      toast({ title: 'Erreur', description: 'Aucune conversation à analyser', variant: 'destructive' });
      return;
    }
    if (!validateConfig()) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeSimulation(config, conversationState.conversationId);
      setConversationState(prev => ({ ...prev, analysisResult: result }));
      setCurrentMode('analysis');
      toast({ title: 'Analyse terminée', description: 'Les résultats sont disponibles dans le panneau latéral.' });
    } catch (error) {
      console.error('Error analyzing:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de l\'analyse',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [config, conversationState.conversationId, validateConfig]);

  const handleReset = useCallback(() => {
    setConversationState({
      messages: [],
      conversationId: null,
      isLoading: false,
      analysisResult: null,
    });
    toast({ title: 'Conversation réinitialisée', description: 'Vous pouvez commencer une nouvelle simulation.' });
  }, []);

  const handleExport = useCallback(() => {
    const exportData = {
      conversationId: conversationState.conversationId,
      mode: currentMode,
      simulationType,
      messages: conversationState.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      })),
      analysisResult: conversationState.analysisResult,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-${conversationState.conversationId || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'Export réussi', description: 'Le fichier JSON a été téléchargé.' });
  }, [conversationState, currentMode, simulationType]);

  const getPlaceholder = () => {
    if (currentMode === 'simulation') {
      return "Exemple : \"Bonjour, je voulais qu'on fasse le point sur ton travail récent. Comment s'est passé ton dernier projet ?\"";
    }
    return "Posez votre question...";
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Drama className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Simulation Tester</h1>
            <p className="text-sm text-muted-foreground">Entraînez-vous aux entretiens managériaux</p>
          </div>
        </div>
      </header>

      {/* Config */}
      <ConfigHeader config={config} onConfigChange={setConfig} />

      {/* Mode Selector */}
      <ModeSelector
        currentMode={currentMode}
        simulationType={simulationType}
        onModeChange={setCurrentMode}
        onSimulationTypeChange={setSimulationType}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area or Realtime Panel */}
        <div className="flex-1 lg:flex-[2]">
          {currentMode === 'realtime' ? (
            <RealtimeVoicePanel
              status={realtimeVoice.status}
              error={realtimeVoice.error}
              isConnected={realtimeVoice.isConnected}
              onConnect={() => {
                if (validateConfig()) {
                  realtimeVoice.connect();
                }
              }}
              onDisconnect={realtimeVoice.disconnect}
            />
          ) : (
            <ChatArea
              messages={conversationState.messages}
              isLoading={conversationState.isLoading}
              onSendMessage={handleSendMessage}
              onSendAudio={currentMode === 'simulation' ? handleSendAudio : undefined}
              placeholder={getPlaceholder()}
            />
          )}
        </div>

        {/* Side Panel */}
        <div className="hidden lg:block w-80 xl:w-96">
          <SidePanel
            conversationId={conversationState.conversationId}
            messagesCount={conversationState.messages.length}
            currentMode={currentMode}
            analysisResult={conversationState.analysisResult}
            isAnalyzing={isAnalyzing}
            messages={conversationState.messages}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
}
