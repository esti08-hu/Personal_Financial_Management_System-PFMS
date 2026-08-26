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
          <div className="text-center text-slate-500 dark:text-slate-400 py-10 px-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 p-[1px] mx-auto mb-3 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
              <div className="w-full h-full bg-slate-100 dark:bg-[#0d1322] rounded-[15px] flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">👋 Hi! I'm MoneyMaster AI</p>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">Ask me anything about your budgets, transactions, or financial goals!</p>
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
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
              message.role === 'user'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                : 'bg-gradient-to-br from-sky-400 to-sky-600 text-slate-950 font-extrabold'
            )}>
              {message.role === 'user' ? 'U' : 'MM'}
            </div>

            {/* Message Content */}
            <div className={cn(
              "flex-1 space-y-1.5",
              message.role === 'user' ? 'items-end' : 'items-start'
            )}>
              <div className={cn(
                "rounded-2xl px-4 py-3 text-sm break-words shadow-sm",
                message.role === 'user'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-tr-xs'
                  : 'bg-white dark:bg-[#131b2e] border border-sky-400/20 text-slate-800 dark:text-slate-100 rounded-tl-xs'
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