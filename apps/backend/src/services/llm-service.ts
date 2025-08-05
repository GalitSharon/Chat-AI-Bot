import OpenAI from 'openai';

class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not provided');
      return;
    }

    try {
      this.client = new OpenAI({ apiKey });
      console.log('OpenAI client initialized');
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
    }
  }


  async generateResponse(systemPrompt: string, message = ''): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4.1-2025-04-14',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        max_tokens: 200, // I just tested few times, seems like a good message response length
        response_format: { type: 'json_object' }

      });

      const response = completion.choices[0]?.message?.content?.trim();
      return response || 'No response from OpenAI';
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }
}

const openaiService = new OpenAIService();
export default openaiService;