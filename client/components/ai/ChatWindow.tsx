import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { StatusIndicator, ErrorAlert, ConnectionIndicator } from './Indicator';
import { useFinanceAssistant } from '../../hooks/useFinanceAssistant';
import { aiApiClient } from '../../lib/ai-client';
import { Message, Conversation } from '../../app/types/ai';
import { MessageSquare, RotateCcw, Plus, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatWindowProps {
  conversationId?: string;
  className?: string;
  height?: string;
  showHeader?: boolean;
  showControls?: boolean;
}

export function ChatWindow({
  conversationId,
  className,
  height = "600px",
  showHeader = true,
  showControls = true,
}: ChatWindowProps) {
  const {
    conversationState,
    messageState,
    sendMessage,
    loadHistory,
    resetContext,
    createNewConversation,
    clearError,
    retryLastAction,
  } = useFinanceAssistant({
    conversationId,
    autoLoadHistory: !!conversationId,
  });

  const [isConnected, setIsConnected] = useState(true);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date>(new Date());

  // Health check effect
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await aiApiClient.getHealth();
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
      setLastHealthCheck(new Date());
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!isConnected) {
      // Could show a toast or alert here
      return;
    }
    await sendMessage(content);
  };

  const handleResetContext = async () => {
    if (conversationState.currentConversation?.id) {
      await resetContext(conversationState.currentConversation.id);
    }
  };

  const handleNewConversation = () => {
    createNewConversation();
  };

  return (
    <Card className={cn("flex flex-col", className)} style={{ height }}>
      {showHeader && (
        <>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h2 className="font-semibold">AI Financial Assistant</h2>
              </div>
              <ConnectionIndicator
                isConnected={isConnected}
                lastConnected={lastHealthCheck}
              />
            </div>

            {showControls && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewConversation}
                  disabled={conversationState.isLoading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Chat
                </Button>

                {conversationState.currentConversation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetContext}
                    disabled={conversationState.isLoading}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                )}

                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Error Alert */}
      {(conversationState.error || messageState.error) && (
        <ErrorAlert
          error={conversationState.error || messageState.error || ''}
          onRetry={retryLastAction}
          onDismiss={clearError}
        />
      )}

      {/* Status Bar */}
      <div className="px-4 py-2 border-b bg-muted/50">
        <StatusIndicator
          status={
            messageState.isLoading ? 'loading' :
            !isConnected ? 'offline' :
            conversationState.error || messageState.error ? 'error' : 'online'
          }
          message={
            messageState.isLoading ? 'AI is thinking...' :
            !isConnected ? 'Check your connection' :
            conversationState.currentConversation ?
              `Conversation: ${conversationState.currentConversation.id.slice(-8)}` :
              'Ready to chat'
          }
          onRetry={!isConnected ? retryLastAction : undefined}
        />
      </div>

      {/* Messages */}
      <MessageList
        messages={messageState.messages}
        isLoading={messageState.isLoading}
        className="flex-1"
      />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={messageState.isLoading}
        disabled={!isConnected}
      />
    </Card>
  );
}