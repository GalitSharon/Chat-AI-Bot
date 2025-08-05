import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { join } from 'path';
import cors from 'cors';
import { ChatSocketService } from './services/chat-socket-service';
import { MessagesService } from './services/messages-service';
import { UserService } from './services/user-service';
import { BotService } from './services/bot-service';
import database from './services/database-service';


dotenv.config();

const app = express();
const main = createServer(app);

app.use(cors());
app.use(express.json());

const frontendPath = join(__dirname, '../../../../../apps/frontend');
app.use(express.static(frontendPath));

app.get('*', (req, res, next) => {
  res.sendFile(join(frontendPath, 'index.html'));
});

const chatService = new MessagesService(database);
const userService = new UserService();
const botService = new BotService(database);

new ChatSocketService(main, chatService, userService, botService);

const PORT = process.env.PORT || 3000;

main.listen(PORT, () => {
  console.log(`Chat server is running`);
});
