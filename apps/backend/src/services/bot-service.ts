import { DatabaseService, ChatMessage } from './database-service';
import openaiService from './llm-service';

interface BotResponse {
  message: string;
  isAnswerForPastQuestion: boolean;
  newAnswer?: {
    question: string;
    answer: string;
  };
}

export class BotService {

  private static readonly SYSTEM_PROMPT_TEMPLATE = `
You are a bot that is talking to user in a chat room where the users are asking questions and answering questions. 
Your name is Chatititue (a chat with an attitude).
You are answering the user's questions if they already been answered by users in the past, BUT ONLY when they were already answered.
You will have a section in this context that has all the already answered questions and answers knowledge base, answer to questions only if they are in this section.
You have attitude, so responses should be a bit toxic, smart and funny, while also answering the questions from past knowledge where the users already answered.

You are going to get the latest messages on the chat, and you should process the last one, if it's a *question* that already been answered, if it's not, do nothing.
Don't react to answers, only to questions.

# Respond with a JSON object containing:
{
    "message": "answer", // only if the question already been answered - your toxic and funny answer, if not answered yet by knowledge base or past users, empty string
    "isAnswerForPastQuestion": true/false,
    "newAnswer": { // if the provided message is an answer from the user, which we should add to the knowledge base, otherwise omit this field
        "question": "question", // the question that was asked by user a
        "answer": "answer", // the answer to the question from user b
    }
}

# Already Answered Questions:
{{KNOWLEDGE_BASE}}`;

  constructor(private readonly database: DatabaseService) {}

  async processMessage(message: ChatMessage): Promise<BotResponse> {
    const systemPrompt = await this.buildPrompt(message);
    const response = await openaiService.generateResponse(systemPrompt, message.text);
    const jsonResponse = JSON.parse(response) as BotResponse;
    await this.handleBotResponse(jsonResponse);
    return jsonResponse;
  }

  async generateFunnyMessage(): Promise<string | null> {
    try {
      const prompt = await this.buildFunnyPrompt();
      const response = await openaiService.generateResponse(prompt);
      const jsonResponse = JSON.parse(response) as { message?: string };

      return jsonResponse.message || null;
    } catch (error) {
      console.error('Error generating funny message:', error);
      return null;
    }
  }

  private async buildPrompt(message: ChatMessage): Promise<string> {
    const systemPrompt = await this.buildSystemPrompt();
    const recentMessages = await this.formatRecentMessages(100);
    
    return `${systemPrompt}

# Last messages from users in the chatroom:
${recentMessages}

# New message you are asked about:
${message.text}

# Your JSON response:`;
  }

  private async buildSystemPrompt(): Promise<string> {
    const knowledgeBase = await this.formatKnowledgeBase();
    return BotService.SYSTEM_PROMPT_TEMPLATE.replace('{{KNOWLEDGE_BASE}}', knowledgeBase);
  }

  private async buildFunnyPrompt(): Promise<string> {
    const knowledgeBase = await this.formatKnowledgeBase();
    const recentMessages = await this.formatRecentMessages(50);
    
    return `
You are a funny bot that is talking to user in a chat room where the users are asking questions and answering questions.
Your name is Chatititue (a chat with an attitude).
You are answering the user's questions if they already been answered by users in the past, BUT ONLY when they were already answered.
Write a funny random message that will popout in the chatroom, make it funny and toxic about the users from their past messages.
Users are technical developer in Bank Hapoalim, so make it funny and toxic about them.

# Knowledge Base:
${knowledgeBase}

# Last messages from users in the chatroom:
${recentMessages}

# Respond with a JSON object containing:
{
    "message": "answer", 
}`;
  }

  private async handleBotResponse(response: BotResponse): Promise<void> {
    // In case where the user's message is the first answer to a question
    if (response.newAnswer) {
      await this.database.addQuestionAnswer({
        question: response.newAnswer.question,
        answer: response.newAnswer.answer,
        createdAt: new Date()
      });
    }
    // In case where the user's message is a question that has already been answered previously
    if (response.isAnswerForPastQuestion && response.message) {
      const botMessage: ChatMessage = {
        senderName: 'Bot',
        text: response.message,
        senderType: 'BOT',
        senderId: 'bot',
        id: crypto.randomUUID(),
        createdAt: new Date(),
        type: 'text'
      };
      await this.database.addMessage(botMessage);
    }
  }

  private async formatKnowledgeBase(): Promise<string> {
    const questionAnswers = await this.database.getAllQuestionAnswers();

    if (questionAnswers.length === 0) {
      return 'No questions have been answered yet.';
    }

    return questionAnswers
      .map(qa => `Q: "${qa.question}"\nA: "${qa.answer}"`)
      .join('\n\n---\n\n');
  }

  private async formatRecentMessages(count: number): Promise<string> {
    const messages = await this.database.getAllMessages();
    
    if (messages.length === 0) {
      return 'No recent messages.';
    }
    
    const recentMessages = messages.slice(-count);
    
    return recentMessages
      .map(message => `${message.senderName}: "${message.text}"`)
      .join('\n');
  }
}
