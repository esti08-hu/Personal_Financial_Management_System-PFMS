import React, { useEffect, useRef } from 'react';
import { Message } from '../../app/types/ai';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Bot, User, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  className?: string;
}

interface MessageItemProps {
  message: Message;
}

function MessageItem({ message }: MessageItemProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard.",
        variant: "destructive",
      });
    }
  };

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn(
      "flex gap-3 p-4 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "flex flex-col gap-2 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className="flex items-center gap-2">
          <Badge variant={isUser ? "default" : "secondary"} className="text-xs">
            {isUser ? "You" : "AI Assistant"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(message.timestamp, 'HH:mm')}
          </span>
        </div>

        <Card className={cn(
          "p-3 relative group",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>

          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </Card>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-secondary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export function MessageList({ messages, isLoading, className }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn(
      "flex-1 overflow-y-auto p-4 space-y-1",
      className
    )}>
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full text-center">
          <div className="space-y-2">
            <div className="text-2xl">💬</div>
            <p className="text-muted-foreground">
              Start a conversation with your AI financial assistant
            </p>
            <p className="text-sm text-muted-foreground">
              Ask questions about your spending, budgeting, or financial goals
            </p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex gap-3 p-4">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="text-xs w-fit">
              AI Assistant
            </Badge>
            <Card className="p-3 bg-muted">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}