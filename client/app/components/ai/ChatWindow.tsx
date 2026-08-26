"use client";

import React, { useState } from 'react';
import { MessageSquare, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <Card className={`w-[400px] max-w-[calc(100vw-2rem)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_40px_rgba(56,189,248,0.2)] border border-sky-400/20 transition-all duration-300 bg-white/95 dark:bg-[#0d1322]/95 backdrop-blur-2xl rounded-2xl py-0 ${
              isMinimized ? 'h-16' : 'h-[620px] max-h-[calc(100vh-2rem)]'
            } flex flex-col overflow-hidden text-slate-800 dark:text-slate-100`}>
              {/* Header */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3.5 bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 text-white rounded-t-2xl flex-shrink-0 z-20 border-b border-sky-400/20 shadow-md">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg shadow-inner">
                    <Sparkles className="h-4 w-4 text-sky-100" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide leading-tight">MoneyMaster AI</h3>
                    <p className="text-[10px] text-sky-100/80 font-medium">Financial Intelligence</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-lg transition-colors"
                    aria-label={isMinimized ? "Maximize chat window" : "Minimize chat window"}
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Close chat window"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Content */}
              {!isMinimized && (
                <CardContent className="flex flex-col flex-1 min-h-0 p-0 bg-slate-50/50 dark:bg-[#070b14]/50">
                  {/* Status Indicator */}
                  <div className="px-4 py-2 border-b border-sky-400/10 flex-shrink-0 bg-slate-100/50 dark:bg-[#0a0e1a]/50">
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
                  <div className="border-t border-sky-400/10 p-3.5 flex-shrink-0 bg-white/80 dark:bg-[#0d1322]/80 backdrop-blur-xl">
                    <MessageInput
                      onSendMessage={handleSendMessage}
                      disabled={isLoading}
                      placeholder="Ask MoneyMaster about your finances..."
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChatWindow;