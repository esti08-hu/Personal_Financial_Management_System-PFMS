"use client";

import React, { useState } from 'react';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Indicator from './Indicator';
import { useFinanceAssistant } from '../../../hooks/useFinanceAssistant';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, className = '' }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const {
    conversationState,
    messageState,
    sendMessage,
    clearError,
    retryLastAction
  } = useFinanceAssistant();

  const { isLoading: conversationLoading, error: conversationError } = conversationState;
  const { messages, isLoading: messageLoading, error: messageError } = messageState;

  const isLoading = conversationLoading || messageLoading;
  const error = conversationError || messageError;

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleRetry = () => {
    retryLastAction();
  };

  const handleClear = () => {
    clearError();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className={`w-96 max-w-[calc(100vw-2rem)] shadow-2xl border-2 transition-all duration-300 bg-white rounded-lg  py-0 ${
        isMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-2rem)]'
      } flex flex-col`}>
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-1 bg-primary text-primary-foreground rounded-t-lg flex-shrink-0 z-1000">
          <div className="flex items-center space-x-2">
            {!isMinimized && <MessageSquare className="h-5 w-5" />}
            <h3 className="font-semibold text-sm p-3">AI Financial Assistant</h3>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
              aria-label={isMinimized ? "Maximize chat window" : "Minimize chat window"}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
              aria-label="Close chat window"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Content */}
        {!isMinimized && (
          <CardContent className="flex flex-col flex-1 min-h-0 p-0 bg-white">
            {/* Status Indicator */}
            <div className="px-4 py-2 border-b flex-shrink-0">
              <Indicator
                isLoading={isLoading}
                error={error}
                onRetry={handleRetry}
                onClear={handleClear}
              />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden min-h-0">
              <MessageList
                messages={messages}
                isLoading={isLoading}
                className="h-full overflow-y-auto"
              />
            </div>

            {/* Input */}
            <div className="border-t p-4 flex-shrink-0">
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={isLoading}
                placeholder="Ask me about your finances..."
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ChatWindow;