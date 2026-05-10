import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import apiClient from '../app/lib/axiosConfig';
import {
  CreateMessageRequest,
  CreateMessageResponse,
  ListHistoryRequest,
  ListHistoryResponse,
  ResetContextRequest,
  ResetContextResponse,
  QuotaResponse,
  HealthResponse,
  ApiError,
} from '../app/types/ai';

/**
 * Utility function to get a cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null; // Server-side rendering
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

class AiApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL || '/') {
    // Use the configured axios client that has token refresh logic
    this.client = apiClient;

    // Override baseURL if provided
    if (baseURL !== '/') {
      this.client.defaults.baseURL = baseURL;
    }
  }
  
  async sendMessage(request: CreateMessageRequest): Promise<CreateMessageResponse> {
    try {
      const response: AxiosResponse<CreateMessageResponse> = await this.client.post(
        '/ai/message',
        request
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleApiError(error);
    }
  }

  async getHistory(request: ListHistoryRequest): Promise<ListHistoryResponse> {
    try {
      const params: Record<string, string | number> = {};
      if (request.cursor) params.cursor = request.cursor;
      if (request.limit) params.limit = request.limit;

      const response: AxiosResponse<ListHistoryResponse> = await this.client.get(
        `/ai/history/${request.conversationId}`,
        { params }
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleApiError(error);
    }
  }

  async resetContext(request: ResetContextRequest): Promise<ResetContextResponse> {
    try {
      const response: AxiosResponse<ResetContextResponse> = await this.client.post(
        '/ai/reset',
        request
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleApiError(error);
    }
  }

  async getQuota(): Promise<QuotaResponse> {
    try {
      const response: AxiosResponse<QuotaResponse> = await this.client.get('/ai/quota');
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  async getHealth(): Promise<HealthResponse> {
    try {
      const response: AxiosResponse<HealthResponse> = await this.client.get('/ai/health');
      return response.data;
    } catch (error: unknown) {
      throw this.handleApiError(error);
    }
  }

  private handleApiError(error: unknown): ApiError {
    // Check if it's an Axios error
    const isAxiosError = (err: unknown): err is AxiosError => {
      return typeof err === 'object' && err !== null && 'response' in err && 'request' in err;
    };

    const isErrorWithMessage = (err: unknown): err is { message: string } => {
      return typeof err === 'object' && err !== null && 'message' in err && typeof (err as any).message === 'string';
    };

    if (isAxiosError(error) && error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      const data = error.response.data as Record<string, unknown> | undefined;

      let message = 'An error occurred';
      let code = 'unknown_error';

      // Map specific error codes from contracts
      switch (statusCode) {
        case 400:
          code = (data?.code as string) || 'invalid_body';
          message = (data?.message as string) || 'Invalid request data';
          break;
        case 401:
          code = 'unauthorized';
          message = 'Authentication required';
          break;
        case 403:
          code = 'quota_exhausted_daily';
          message = 'Daily quota exceeded';
          break;
        case 404:
          code = (data?.code as string) || 'conversation_not_found';
          message = (data?.message as string) || 'Resource not found';
          break;
        case 429:
          code = 'rate_limited';
          message = 'Rate limit exceeded';
          break;
        case 500:
          code = 'ai_failure';
          message = 'AI service temporarily unavailable';
          break;
        case 503:
          code = 'service_unavailable';
          message = 'Service temporarily unavailable';
          break;
        default:
          message = (data?.message as string) || message;
      }

      return {
        message,
        statusCode,
        error: data?.error as string,
        code,
      };
    } else if (isAxiosError(error) && error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        statusCode: 0,
        error: 'NetworkError',
        code: 'network_error',
      };
    } else {
      // Something else happened
      const message = isErrorWithMessage(error) ? error.message : 'An unexpected error occurred';
      return {
        message,
        statusCode: 0,
        error: 'UnknownError',
        code: 'unknown_error',
      };
    }
  }
}

// Export singleton instance
export const aiApiClient = new AiApiClient();
export default aiApiClient;