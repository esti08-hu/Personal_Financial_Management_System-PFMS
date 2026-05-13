import { GeminiClient } from './src/ai/gemini/gemini-client.service';
import { ConfigService } from '@nestjs/config';

async function testGeminiAPI() {
  // Create a mock config service
  const configService = {
    get: (key: string, defaultValue?: any) => {
      const envVars: Record<string, string | number> = {
        'GEMINI_API_KEY': '<GEMINI_API_KEY>',
        'GEMINI_MODEL': 'gemini-2.0-flash',
        'GEMINI_TEMPERATURE': 0.7,
        'GEMINI_MAX_TOKENS': 2048,
        'GEMINI_TIMEOUT': 30000,
        'GEMINI_RETRIES': 3,
        'GEMINI_RETRY_DELAY': 1000,
      };
      return envVars[key] || defaultValue;
    }
  };

  const geminiClient = new GeminiClient(configService as any);

  try {
    console.log('Testing Gemini API connection...');

    const response = await geminiClient.chat({
      messages: [
        { role: 'user', content: 'Hello! Can you help me test if this API is working?' }
      ]
    });

    console.log('✅ Gemini API test successful!');
    console.log('Response:', response.content);
    console.log('Finish reason:', response.finishReason);
    console.log('Usage:', response.usage);

  } catch (error) {
    console.error('❌ Gemini API test failed:', (error as Error).message);
    if (error instanceof Error) {
      console.error('Error details:', error);
    }
  }
}

testGeminiAPI();