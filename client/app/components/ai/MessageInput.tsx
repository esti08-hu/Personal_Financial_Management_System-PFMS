"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  className
}) => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled && !isComposing) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => setIsComposing(false);

  const isValidMessage = message.trim().length > 0 && message.trim().length <= 2000;

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Type your message"
          className={cn(
            "min-h-[44px] max-h-[120px] resize-none pr-12 rounded-xl bg-slate-100/80 dark:bg-[#070b14]/80 border-sky-400/20 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-sky-500/30 focus-visible:border-sky-400/50 transition-all text-xs sm:text-sm",
            !isValidMessage && message.length > 0 && "border-destructive focus-visible:ring-destructive/20"
          )}
          rows={1}
        />

        {/* Character count */}
        {message.length > 0 && (
          <div className={cn(
            "absolute bottom-2 right-3 text-xs",
            message.length > 2000 ? "text-destructive" : "text-muted-foreground"
          )}>
            {message.length}/2000
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={disabled || !isValidMessage}
        size="sm"
        className="h-10 w-10 p-0 flex-shrink-0 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_4px_15px_rgba(14,165,233,0.3)] hover:from-sky-400 hover:to-indigo-400 border-none transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
        aria-label="Send message"
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : (
          <Send className="h-4 w-4 text-white" />
        )}
      </Button>
    </form>
  );
};

export default MessageInput;