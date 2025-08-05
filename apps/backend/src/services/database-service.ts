import { promises as fs } from 'fs';
import path from 'path';

type SenderType = 'USER' | 'BOT';

interface ChatMessage {
  id?: string;
  text: string;
  senderType: SenderType;
  senderName: string;
  type: 'text' | 'image';
  createdAt: Date;
  senderId?: string;
}

interface QuestionAnswer {
  question: string;
  answer: string;
  createdAt: Date;
}

interface DatabaseStructure {
  messages: ChatMessage[];
  pastQuestionsAndAnswers: QuestionAnswer[];
}

class DatabaseService {
  private dataFile: string;

  constructor(dataFile = 'apps/backend/database.json') {
    this.dataFile = path.resolve(dataFile);
  }

  private async ensureDataFile(): Promise<void> {
    try {
      await fs.access(this.dataFile);
    } catch (error) {
      const dir = path.dirname(this.dataFile);
      await fs.mkdir(dir, { recursive: true });

      const initialData: DatabaseStructure = {
        messages: [],
        pastQuestionsAndAnswers: [],
      };
      await fs.writeFile(this.dataFile, JSON.stringify(initialData, null, 2));
    }
  }

  private async loadData(): Promise<DatabaseStructure> {
    await this.ensureDataFile();
    const data = await fs.readFile(this.dataFile, 'utf-8');
    const parsed = JSON.parse(data);

    const messages = parsed.messages.map((msg: ChatMessage) => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
    }));

    const questionAnswers = parsed.pastQuestionsAndAnswers.map((qa: QuestionAnswer) => ({
      ...qa,
      createdAt: new Date(qa.createdAt),
    }));

    return {
      messages,
      pastQuestionsAndAnswers: questionAnswers,
    };
  }

  private async saveData(data: DatabaseStructure): Promise<void> {
    await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
  }

  async getAllMessages(): Promise<ChatMessage[]> {
    const data = await this.loadData();
    return [...data.messages];
  }

  async addMessage(message: ChatMessage): Promise<ChatMessage> {
    const data = await this.loadData();

    const newMessage = {
      ...message,
      createdAt: new Date(),
    };

    data.messages.push(newMessage);
    await this.saveData(data);
    return newMessage;
  }

  async UpdateMessage(id: string, text: string): Promise<ChatMessage[]> {
    const data = await this.loadData();
    const messages = data.messages.map(msg => {
      if (msg.id === id) {
        return { ...msg, text, createdAt: new Date() };
      }
      return msg;
    });
    await this.saveData({ ...data, messages });
    return messages;
  }

  async getAllQuestionAnswers(): Promise<QuestionAnswer[]> {
    const data = await this.loadData();
    return [...data.pastQuestionsAndAnswers];
  }

  async addQuestionAnswer(qa: QuestionAnswer): Promise<QuestionAnswer> {
    const data = await this.loadData();

    const newQA = {
      ...qa,
      createdAt: new Date()
    };

    data.pastQuestionsAndAnswers.push(newQA);
    await this.saveData(data);

    return newQA;
  }
}

const database = new DatabaseService();

export {
  ChatMessage,
  SenderType as MessageSender,
  QuestionAnswer,
  DatabaseStructure,
  DatabaseService,
};
export default database;
