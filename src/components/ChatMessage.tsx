import { Message } from '@/types/simulation';
import { cn } from '@/lib/utils';
import { User, Bot, Volume2, Mic } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  // Auto-play audio response when it arrives
  useEffect(() => {
    if (message.audioUrl && !isUser && !hasAutoPlayed && audioRef.current) {
      audioRef.current.play().catch(console.error);
      setHasAutoPlayed(true);
    }
  }, [message.audioUrl, isUser, hasAutoPlayed]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };
  
  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary" : "bg-secondary"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-secondary-foreground" />
        )}
      </div>
      
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 shadow-bubble",
          isUser 
            ? "bg-chat-user-bubble text-chat-user-text rounded-tr-md" 
            : "bg-chat-ai-bubble text-chat-ai-text rounded-tl-md"
        )}
      >
        {/* Audio indicator for user voice messages */}
        {message.isAudioMessage && isUser && (
          <div className="flex items-center gap-2 mb-1 text-primary-foreground/80">
            <Mic className="h-3 w-3" />
            <span className="text-xs">Message vocal</span>
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}

        {/* Audio player for assistant responses */}
        {message.audioUrl && !isUser && (
          <div className="mt-2 flex items-center gap-2">
            <audio
              ref={audioRef}
              src={message.audioUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <button
              onClick={handlePlayPause}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                isPlaying 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
              )}
            >
              <Volume2 className={cn("h-3 w-3", isPlaying && "animate-pulse")} />
              {isPlaying ? "En cours..." : "Écouter"}
            </button>
          </div>
        )}

        <span className={cn(
          "text-[10px] mt-1 block",
          isUser ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
