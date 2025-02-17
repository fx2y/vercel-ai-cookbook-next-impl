# System Patterns

## Architecture
1. Next.js App Router Structure
   - /app directory for routes and components
   - API routes in /app/api
   - Layout and page components

2. Tools System
   - Tool definitions with Zod schemas
   - Human-in-the-loop confirmation flow
   - Client/server tool execution patterns

3. State Management
   - useChat hook for chat state
   - Real-time updates via streaming
   - Tool invocation state handling

## Key Technical Decisions
1. Vercel AI SDK Integration
   - Streaming text responses
   - Object streaming support
   - Tool-based architecture

2. Type Safety
   - TypeScript throughout
   - Zod schema validation
   - Strict error handling

3. UI/UX
   - Real-time updates
   - Loading states
   - Error feedback

## Architecture Patterns
1. Client-Server Communication
   - API routes for AI features
   - Streaming response handling
   - Type-safe request/response

2. Tool System
   - Server-defined tools
   - Client-side execution
   - HITL confirmation flow

3. Component Architecture
   - Modular chat interface
   - Tool-specific UI components
   - Shared constants and types