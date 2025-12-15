import { useRef, useEffect, useState } from 'react';
import { Message } from '@/types/simulation';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Mic, MicOff } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { cn } from '@/lib/utils';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onSendAudio?: (audioBlob: Blob) => void;
  placeholder?: string;
}

export function ChatArea({ messages, isLoading, onSendMessage, onSendAudio, placeholder }: ChatAreaProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isRecording, toggleRecording } = useAudioRecorder();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMicClick = async () => {
    const audioBlob = await toggleRecording();
    if (audioBlob && onSendAudio) {
      onSendAudio(audioBlob);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Commencez la conversation
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {placeholder || "Envoyez un message pour démarrer la simulation d'entretien managérial."}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Enregistrement en cours..." : "Écrivez votre message..."}
            disabled={isLoading || isRecording}
            className="flex-1"
          />
          {onSendAudio && (
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              onClick={handleMicClick}
              disabled={isLoading}
              className={cn(
                "px-3 transition-all",
                isRecording && "animate-pulse"
              )}
              title={isRecording ? "Arrêter l'enregistrement" : "Enregistrer un message vocal"}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isLoading || isRecording}
            className="px-6"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Envoyer</span>
          </Button>
        </form>
        {isRecording && (
          <p className="text-sm text-destructive mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            Enregistrement... Cliquez sur le micro pour arrêter et envoyer.
          </p>
        )}
      </div>
    </div>
  );
}
