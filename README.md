# Chattitude - Chat with an attitude!
A Real-Time Chat Application with AI Bot Integration


## Introduction

Chattitude is a sophisticated real-time chat application that combines modern web technologies with artificial intelligence. The application features a unique AI bot character named "Chatititue" (a chat with an attitude) that provides intelligent, humorous, and sometimes sarcastic responses based on previous conversations and a built-in knowledge base.

The project is implementing a full-stack TypeScript solution using Angular 20 for the frontend and Node.js with Express for the backend. The application leverages WebSocket technology for real-time communication, OpenAI's GPT models for intelligent responses.

Key features include:
- **Real-time messaging** with instant synchronization across all connected clients
- **AI-powered bot** that learns from conversation history and provides contextual responses
- **User management** with persistent user sessions and onboarding flow
- **Message editing capabilities** allowing users to modify their sent messages
- **Knowledge base system** that the bot uses to answer previously discussed questions
- **Responsive design** optimized for various screen sizes and devices

## Code Structure

The Chattitude project implements a well-architected monorepo structure that demonstrates smart division of components according to business logic and follows established patterns for maintainable, scalable applications.


<img width="1407" height="698" alt="Screenshot 2025-08-04 at 22 51 38" src="https://github.com/user-attachments/assets/193d43ce-d08e-48b3-9c37-c667f45254e5" />


### Project Architecture Overview

```
Chattitude/
├── apps/
│   ├── frontend/          # Angular 20 application
│   └── backend/           # Node.js Express server

```

### File Organization

**Frontend Structure:**
- `core/` - Contains models, services, and shared functionality
- `features/` - Feature modules organized by business domain
- `shared/` - Reusable UI components and utilities
- `environments/` - Environment-specific configurations

**Backend Structure:**
- `services/` - Business logic and external integrations
- `models/` - Data models and type definitions
- `main.ts` - Application entry point and server configuration




## Frontend Architecture

The frontend is built using Angular 20 with standalone components. The architecture follows reactive programming principles using RxJS observables for state management and real-time data flow.



### Core Components

ChatComponent - The main container component that orchestrates the entire chat experience. It manages user state, initializes services, and coordinates between child components. 

MessagesPanelComponent - Responsible for displaying the conversation history and managing message interactions.
MessageItemComponent - A pure component that renders individual messages with user-specific styling and interaction capabilities.
InputBarComponent - Handles message composition and submission.


### Core Services

SocketService - Manages WebSocket connections using Socket.IO client. Establishes and maintains a persistent connection to backend.
MessagesService - Centralized message state management
UsersService - User management and authentication.




## Backend Architecture

The backend is implemented using Node.js with Express, providing WebSocket support for real-time communication.

### Core Services


BotService - The heart of the AI functionality, implementing sophisticated conversation analysis.
DatabaseService - File-based data persistence layer providing storage of messages and question-answer pairs for bot learning.
LLMService - OpenAI integration service managing GPT model communication and response processing.
ChatSocketService  - WebSocket management for real-time features.
MessagesService - Business logic for message operations.



## Monorepo and NX

The project uses NX as a monorepo management tool. Using single configuration for building both frontend and backend applications.

### NX Configuration

```json
{
  "build": "nx run-many --target=build --projects=backend,frontend --parallel",
  "build:backend": "nx build backend --prod",
  "build:frontend": "nx build frontend --prod",
  "test": "nx run-many --target=test --all"
}
```



## Real-Time Synchronization

The application implements real-time synchronization using WebSocket through Socket.IO, ensuring instant communication and state consistency across all connected clients.

### Synchronization Features

1. **Instant Message Delivery**: Messages appear immediately across all connected clients
2. **User Presence Updates**: Real-time indication of users joining and leaving
3. **Message Editing Sync**: Live updates when users edit their messages
4. **Bot Response Distribution**: AI responses broadcast to all participants



## AI Bot and LLM Integration

### Knowledge Center and Learning System

Chattitude features an advanced AI bot named "Chatititue" that implements a sophisticated knowledge management system.

#### Dynamic Knowledge Base
- **Question-Answer Extraction**: Automatically identifies when users ask questions and when others provide answers
- **Historical Learning**: References past conversations to provide informed responses

#### Bot Personality and Character
Chatititue is designed with a distinctive personality, responds with sarcasm and technical humor.

#### LLM Integration Architecture
The system integrates with OpenAI's GPT models through a prompt engineering system.

```typescript
private static readonly SYSTEM_PROMPT_TEMPLATE = `
You are a bot that is talking to user in a chat room where the users are asking questions and answering questions. 
Your name is Chatititue (a chat with an attitude).
You are answering the user's questions if they already been answered by users in the past, BUT ONLY when they were already answered.
You have attitude, so responses should be a bit toxic, smart and funny, while also answering the questions from past knowledge where the users already answered.
`;
```

#### Funny Message Generation
Beyond answering questions, the bot generates spontaneous humorous messages.



## Database Strategy

### File-Based Database Approach

The application implements a strategic decision to use JSON file-based storage instead of traditional relational or NoSQL databases, to keep it simple for this project.
The current file-based approach provides a clear migration path to production databases and can be easily swapped with other database implementations.

#### Implementation Details

```typescript
interface DatabaseStructure {
  messages: ChatMessage[];
  pastQuestionsAndAnswers: QuestionAnswer[];
}
```



## Performance Optimizations

The application implements several performance optimization strategies to ensure smooth user experience and efficient resource utilization:


#### Angular Performance Features
1. **OnPush Change Detection**: Optimized change detection strategy for message components
2. **Standalone Components**: Reduced bundle size with tree-shakable components
3. **Track By Functions**: Optimized @For rendering for message lists

#### Memory Management
- **Observable Cleanup**: Proper subscription management to prevent memory leaks
- **Component Lifecycle**: Efficient initialization and destruction patterns
- **Event Handler Cleanup**: Automatic socket event unsubscription



## Modern Technologies

### Angular 20 Features and Innovations

The application leverages cutting-edge Angular features.

#### Signals Implementation
More efficient change detection and reduced unnecessary re-render

#### Standalone Components
The application fully embraces Angular's standalone component architecture.

#### Modern Dependency Injection
```typescript
private zone = inject(NgZone);
private usersService = inject(UsersService);
```


## Application Design

### Design Philosophy - Figma Inspiration

The Chattitude application draws inspiration from modern design systems and Figma design patterns.


#### User Experience Refinements
1. **Auto-scroll Behavior**
2. **Smooth State Transitions**



## Responsive Design

### Mobile-First Approach

The application implements comprehensive responsive design, ensuring optimal user experience across all device types and screen sizes:

#### Breakpoint Strategy
```scss
// Responsive breakpoints
$mobile: 480px;
$tablet: 768px;
$desktop: 1024px;
$large-desktop: 1440px;
```


## Unit & Integration Tests

The project uses Jest with Angular Testing Utilities for comprehensive testing. Frontend tests cover component interactions, service mocking, and real-time messaging flows. 

## Bonus Features

### Message Editing Capability

A message editing feature that allows users to modify their messages with real-time synchronization across all connected clients.
The message editing feature demonstrates the attention to user experience details.

---
