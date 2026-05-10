"use client";

import React, { useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '../../types/ai';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, className }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = React.useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      // Silently handle clipboard errors
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(timestamp);
  };

  return (
    <ScrollArea ref={scrollAreaRef} className={cn("flex-1 p-4", className)}>
      <div className="space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">👋 Hi! I'm your AI financial assistant.</p>
            <p className="text-xs mt-2">Ask me anything about your finances!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              message.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}>
              {message.role === 'user' ? 'U' : 'AI'}
            </div>

            {/* Message Content */}
            <div className={cn(
              "flex-1 space-y-2",
              message.role === 'user' ? 'items-end' : 'items-start'
            )}>
              <div className={cn(
                "rounded-lg px-3 py-2 text-sm break-words",
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}>
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        // Customize markdown elements
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 last:mb-0">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 last:mb-0">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        code: ({ className, children, ...props }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs" {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className={`block bg-muted-foreground/20 p-2 rounded text-xs overflow-x-auto ${className}`} {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children }) => <pre className="mb-2 last:mb-0 overflow-x-auto">{children}</pre>,
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        a: ({ children, href }) => (
                          <a href={href} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>

              {/* Message Actions */}
              <div className={cn(
                "flex items-center gap-2 text-xs text-muted-foreground",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}>
                <span>{formatTimestamp(message.timestamp)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(message.content, message.id)}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy message"
                >
                  {copiedMessageId === message.id ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator for new message */}
        {isLoading && messages.length > 0 && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
              AI
            </div>
            <div className="flex-1">
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessageList;