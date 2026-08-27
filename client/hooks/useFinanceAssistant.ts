import { useState, useCallback, useEffect, useRef } from "react";
import { aiApiClient } from "../lib/ai-client";
import {
  Message,
  Conversation,
  CreateMessageRequest,
  CreateMessageResponse,
  ListHistoryRequest,
  ListHistoryResponse,
  ResetContextRequest,
  ResetContextResponse,
  QuotaResponse,
  ConversationState,
  MessageState,
  QuotaState,
  ApiError,
} from "../app/types/ai";

interface UseFinanceAssistantOptions {
  conversationId?: string;
  autoLoadHistory?: boolean;
  autoLoadQuota?: boolean;
}

interface MessageOptions {
  forceRefresh?: boolean;
  skipCache?: boolean;
}

interface UseFinanceAssistantReturn {
  // State
  conversationState: ConversationState;
  messageState: MessageState;
  quotaState: QuotaState;

  // Actions
  sendMessage: (
    content: string,
    options?: MessageOptions
  ) => Promise<CreateMessageResponse>;
  loadHistory: (
    conversationId: string,
    cursor?: string,
    limit?: number
  ) => Promise<void>;
  resetContext: (
    conversationId?: string,
    preserveHistory?: boolean
  ) => Promise<ResetContextResponse>;
  loadQuota: () => Promise<void>;
  createNewConversation: () => void;
  setCurrentConversation: (conversation: Conversation | null) => void;

  // Utilities
  clearError: () => void;
  retryLastAction: () => void;
}

export function useFinanceAssistant(
  options: UseFinanceAssistantOptions = {}
): UseFinanceAssistantReturn {
  const {
    conversationId,
    autoLoadHistory = true,
    autoLoadQuota = false,
  } = options;

  // State management
  const [conversationState, setConversationState] = useState<ConversationState>(
    {
      conversations: [],
      currentConversation: null,
      isLoading: false,
      error: null,
    }
  );

  const [messageState, setMessageState] = useState<MessageState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const [quotaState, setQuotaState] = useState<QuotaState>({
    daily: {
      used: 0,
      limit: 100,
      remaining: 100,
      resetAt: null,
    },
    minute: {
      used: 0,
      limit: 10,
      remaining: 10,
      resetAt: null,
    },
    isLoading: false,
    error: null,
  });

  // Refs for tracking last actions for retry
  const lastMessageRef = useRef<{
    content: string;
    options?: MessageOptions;
  } | null>(null);
  const lastHistoryRef = useRef<{
    conversationId: string;
    cursor?: string;
    limit?: number;
  } | null>(null);
  const lastResetRef = useRef<{
    conversationId?: string;
    preserveHistory?: boolean;
  } | null>(null);

  // Initialize conversation if conversationId is provided
  useEffect(() => {
    if (conversationId && autoLoadHistory) {
      loadHistory(conversationId);
    }
  }, [conversationId, autoLoadHistory]);

  // Send message with optimistic updates
  const sendMessage = useCallback(
    async (
      content: string,
      options?: MessageOptions
    ): Promise<CreateMessageResponse> => {
      if (!content.trim()) {
        throw new Error("Message content cannot be empty");
      }

      const tempMessageId = `temp_${Date.now()}`;
      const userMessage: Message = {
        id: tempMessageId,
        content: content.trim(),
        role: "user",
        timestamp: new Date(),
        conversationId: conversationState.currentConversation?.id || "",
      };
      // Store for retry
      lastMessageRef.current = { content, options };

      // Optimistic update - add user message immediately
      setMessageState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      try {
        const request: CreateMessageRequest = {
          message: content.trim(),
          conversationId: conversationState.currentConversation?.id,
          forceRefresh: options?.forceRefresh,
          skipCache: options?.skipCache,
        };

        const response = await aiApiClient.sendMessage(request);
        // Create assistant message from response
        const assistantMessage: Message = {
          id: `${response.conversationId}_${Date.now()}`, // Generate unique ID
          content: response.response, // Use response string directly
          role: "assistant",
          timestamp: new Date(),
          conversationId: response.conversationId,
        };

        // Add assistant message to state (keep the user message)
        setMessageState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));

        // Update conversation if new one was created
        if (
          !conversationState.currentConversation ||
          conversationState.currentConversation.id !== response.conversationId
        ) {
          const newConversation: Conversation = {
            id: response.conversationId,
            userId: '', // Will be set by auth context
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: [assistantMessage],
          };
          setConversationState((prev) => ({
            ...prev,
            currentConversation: newConversation,
            conversations: [
              newConversation,
              ...prev.conversations.filter(
                (c) => c.id !== response.conversationId
              ),
            ],
          }));
        }

        return response;
      } catch (error) {
        // Remove optimistic message on error and add error message
        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          content: 'Sorry, I encountered an error. Please try again.',
          role: "assistant",
          timestamp: new Date(),
          conversationId: conversationState.currentConversation?.id || "",
          isError: true,
        };

        setMessageState((prev) => ({
          ...prev,
          messages: [...prev.messages.filter((msg) => msg.id !== tempMessageId), errorMessage],
          isLoading: false,
          error: (error as ApiError).message,
        }));
        throw error;
      }
    },
    [conversationState.currentConversation]
  );

  // Load conversation history
  const loadHistory = useCallback(
    async (
      conversationId: string,
      cursor?: string,
      limit: number = 50
    ): Promise<void> => {
      lastHistoryRef.current = { conversationId, cursor, limit };

      setMessageState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const request: ListHistoryRequest = {
          conversationId,
          cursor,
          limit,
        };

        const response = await aiApiClient.getHistory(request);

        // Convert turns to messages
        const messages: Message[] = [];
        response.turns.forEach((turn) => {
          messages.push({
            id: turn.turnId,
            content: turn.userQuery,
            role: "user" as const,
            timestamp: new Date(turn.createdAt),
            conversationId,
          });
          messages.push({
            id: `${turn.turnId}_assistant`,
            content: turn.assistantText,
            role: "assistant" as const,
            timestamp: new Date(turn.createdAt),
            conversationId,
          });
        });

        setMessageState((prev) => ({
          ...prev,
          messages: cursor ? [...prev.messages, ...messages] : messages,
          isLoading: false,
        }));
      } catch (error) {
        setMessageState((prev) => ({
          ...prev,
          isLoading: false,
          error: (error as ApiError).message,
        }));
        throw error;
      }
    },
    []
  );

  // Reset conversation context
  const resetContext = useCallback(
    async (
      conversationId?: string,
      preserveHistory: boolean = true
    ): Promise<ResetContextResponse> => {
      const targetConversationId =
        conversationId || conversationState.currentConversation?.id;

      if (!targetConversationId) {
        throw new Error("No conversation to reset");
      }

      lastResetRef.current = {
        conversationId: targetConversationId,
        preserveHistory,
      };

      setConversationState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const request: ResetContextRequest = {
          conversationId: targetConversationId,
          preserveHistory,
        };

        const response = await aiApiClient.resetContext(request);

        // Update conversation state
        if (
          conversationState.currentConversation?.id === targetConversationId
        ) {
          setMessageState({
            messages: [],
            isLoading: false,
            error: null,
          });
        }

        setConversationState((prev) => ({
          ...prev,
          isLoading: false,
          currentConversation:
            prev.currentConversation?.id === targetConversationId
              ? {
                  ...prev.currentConversation,
                  id: response.newConversationId,
                  messages: [],
                  updatedAt: new Date(),
                }
              : prev.currentConversation,
          conversations: prev.conversations.map((conv) =>
            conv.id === targetConversationId
              ? {
                  ...conv,
                  id: response.newConversationId,
                  messages: [],
                  updatedAt: new Date(),
                }
              : conv
          ),
        }));

        return response;
      } catch (error) {
        setConversationState((prev) => ({
          ...prev,
          isLoading: false,
          error: (error as ApiError).message,
        }));
        throw error;
      }
    },
    [conversationState.currentConversation]
  );

  // Load quota information
  const loadQuota = useCallback(async (): Promise<void> => {
    setQuotaState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await aiApiClient.getQuota();

      setQuotaState({
        daily: {
          used: response.daily.used,
          limit: response.daily.limit,
          remaining: response.daily.remaining,
          resetAt: new Date(response.daily.resetAt),
        },
        minute: {
          used: response.minute.used,
          limit: response.minute.limit,
          remaining: response.minute.remaining,
          resetAt: new Date(response.minute.resetAt),
        },
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setQuotaState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as ApiError).message,
      }));
      throw error;
    }
  }, []);

  // Create new conversation
  const createNewConversation = useCallback((): void => {
    setConversationState((prev) => ({
      ...prev,
      currentConversation: null,
    }));
    setMessageState({
      messages: [],
      isLoading: false,
      error: null,
    });
  }, []);

  // Set current conversation
  const setCurrentConversation = useCallback(
    (conversation: Conversation | null): void => {
      setConversationState((prev) => ({
        ...prev,
        currentConversation: conversation,
      }));

      if (conversation) {
        setMessageState({
          messages: conversation.messages,
          isLoading: false,
          error: null,
        });
      } else {
        setMessageState({
          messages: [],
          isLoading: false,
          error: null,
        });
      }
    },
    []
  );

  // Clear error state
  const clearError = useCallback((): void => {
    setConversationState((prev) => ({ ...prev, error: null }));
    setMessageState((prev) => ({ ...prev, error: null }));
    setQuotaState((prev) => ({ ...prev, error: null }));
  }, []);

  // Retry last failed action
  const retryLastAction = useCallback(async (): Promise<void> => {
    if (lastMessageRef.current) {
      await sendMessage(
        lastMessageRef.current.content,
        lastMessageRef.current.options
      );
    } else if (lastHistoryRef.current) {
      await loadHistory(
        lastHistoryRef.current.conversationId,
        lastHistoryRef.current.cursor,
        lastHistoryRef.current.limit
      );
    } else if (lastResetRef.current) {
      await resetContext(
        lastResetRef.current.conversationId,
        lastResetRef.current.preserveHistory
      );
    }
  }, [sendMessage, loadHistory, resetContext]);

  // Auto-load quota if requested
  useEffect(() => {
    if (autoLoadQuota) {
      loadQuota();
    }
  }, [autoLoadQuota, loadQuota]);

  return {
    conversationState,
    messageState,
    quotaState,
    sendMessage,
    loadHistory,
    resetContext,
    loadQuota,
    createNewConversation,
    setCurrentConversation,
    clearError,
    retryLastAction,
  };
}
