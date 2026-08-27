// AI Assistant Types - Aligned with Backend Contracts

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  conversationId: string;
  isError?: boolean; // Optional flag to indicate error messages
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

// Request/Response types aligned with contracts

export interface CreateMessageRequest {
  message: string;
  conversationId?: string;
  forceRefresh?: boolean; // Force refresh the response, bypassing cache
  skipCache?: boolean;    // Skip caching this response
}

export interface CreateMessageResponse {
  response: string; // The AI assistant response message
  conversationId: string;
  cached: boolean; // Whether the response came from cache
  fallback: boolean; // Whether this was a fallback response due to an error
  processingTime: number; // Processing time in milliseconds
  intent?: any; // Intent analysis result
  aggregates?: any; // Aggregated financial data used in the response
  anomalies?: any[]; // Any anomalies detected in the financial data
  formattedResponse?: any; // Formatted response metadata
}

export interface ListHistoryRequest {
  conversationId: string;
  cursor?: string;
  limit?: number;
}

export interface ConversationTurn {
  turnId: string;
  createdAt: string;
  userQuery: string;
  assistantText: string;
  fallback: boolean;
  cacheHit: boolean;
  model: string;
}

export interface ListHistoryResponse {
  conversationId: string;
  turns: ConversationTurn[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
  };
  meta: {
    totalTurns: number;
    truncated: boolean;
  };
}

export interface ResetContextRequest {
  conversationId?: string;
  preserveHistory?: boolean;
}

export interface ResetContextResponse {
  previousConversationId: string | null;
  newConversationId: string;
  preserved: boolean;
}

export interface QuotaResponse {
  daily: {
    used: number;
    limit: number;
    remaining: number;
    resetAt: string;
  };
  minute: {
    used: number;
    limit: number;
    remaining: number;
    resetAt: string;
  };
}

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  services: {
    database: boolean;
    ai: boolean;
    cache: boolean;
  };
}

// Hook state types
export interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

export interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface QuotaState {
  daily: {
    used: number;
    limit: number;
    remaining: number;
    resetAt: Date | null;
  };
  minute: {
    used: number;
    limit: number;
    remaining: number;
    resetAt: Date | null;
  };
  isLoading: boolean;
  error: string | null;
}

// API Error types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  code?: string;
}