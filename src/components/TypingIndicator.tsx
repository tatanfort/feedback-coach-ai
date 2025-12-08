import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
        <Bot className="h-4 w-4 text-secondary-foreground" />
      </div>
      
      <div className="bg-chat-ai-bubble rounded-2xl rounded-tl-md px-4 py-3 shadow-bubble">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-typing" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-typing" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-typing" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
}
