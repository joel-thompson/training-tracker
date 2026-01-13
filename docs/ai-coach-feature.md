# AI Training Coach

An AI-powered conversational assistant that helps BJJ practitioners gain insights from their training history, spot patterns, and get personalized guidance.

## Overview

The AI Training Coach is a chat interface where users can have conversations about their training. The AI has access to the user's training sessions, goals, and statistics, allowing it to provide personalized insights and answer questions about their BJJ journey.

## Problem Statement

BJJ practitioners train frequently (often 3-5x per week) and log detailed session notes, but:
- Patterns across sessions are hard to spot manually
- Recurring problems may go unnoticed for weeks
- Rich reflection data (successes, problems, questions) is underutilized
- Goals are set but rarely connected back to actual training progress
- Questions logged during sessions often go unexplored

## User Stories

### Core Conversations

1. **As a user**, I want to ask "What have I been struggling with lately?" so I can identify recurring problems to address.

2. **As a user**, I want to ask "What did I work on last month?" so I can get a summary of my training focus.

3. **As a user**, I want to ask "How am I progressing on my goals?" so I can see how my recent sessions connect to my stated objectives.

4. **As a user**, I want to ask "What should I focus on next?" so I can get personalized training suggestions based on my history.

5. **As a user**, I want to ask "When did I last train [technique]?" so I can quickly search my training history.

### Pattern Recognition

6. **As a user**, I want the AI to notice when I've logged the same problem multiple times so I can address persistent issues.

7. **As a user**, I want the AI to connect my logged questions with relevant past sessions so I can find answers in my own history.

8. **As a user**, I want the AI to identify my strengths (recurring successes) so I can understand what's working.

### Accountability & Motivation

9. **As a user**, I want to ask "How consistent has my training been?" so I can understand my training habits.

10. **As a user**, I want the AI to acknowledge my progress when I've been training consistently.

## Functional Requirements

### Chat Interface

- **FR-1**: Users can send text messages to the AI coach
- **FR-2**: AI responses stream in real-time (not waiting for full response)
- **FR-3**: Conversation history persists within a session (cleared on page refresh initially)
- **FR-4**: Users can start a new conversation / clear history
- **FR-5**: Mobile-friendly chat interface

### AI Capabilities

- **FR-6**: AI can access the user's training sessions (last 90 days by default)
- **FR-7**: AI can access the user's active and completed goals
- **FR-8**: AI can access the user's training statistics (streak, frequency, class type split)
- **FR-9**: AI can search sessions by technique, date range, or content
- **FR-10**: AI provides BJJ-relevant responses (understands terminology, positions, techniques)

### Data Access (What the AI can see)

The AI should have access to:

| Data | Fields | Notes |
|------|--------|-------|
| Sessions | date, classType, techniqueCovered, generalNotes | Core session info |
| Session Items | type (success/problem/question), content | User reflections |
| Goals | goalText, category, notes, isActive, completedAt | Training objectives |
| Stats | streak, monthly count, gi/nogi split | Aggregated metrics |

### Out of Scope (for v1)

- Persistent conversation history (saved to database)
- Multiple conversation threads
- Voice input
- Image/video analysis
- External BJJ knowledge base (instructionals, etc.)
- Game plan integration (hidden feature)

## Non-Functional Requirements

- **NFR-1**: Works on mobile and desktop
- **NFR-2**: Graceful handling of API errors

## Technical Approach

### Tech Stack

- **AI SDK**: Vercel AI SDK (`ai` package)
- **LLM Provider**: OpenAI (GPT-4o or GPT-4o-mini) - can swap providers later
- **Backend**: New Hono route for chat endpoint
- **Frontend**: React chat component with streaming support

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │     Backend     │     │   OpenAI API    │
│                 │     │                 │     │                 │
│  Chat UI with   │────▶│  /api/v1/coach  │────▶│   GPT-4o-mini   │
│  useChat hook   │◀────│                 │◀────│                 │
│                 │     │  - Auth check   │     │                 │
│                 │     │  - Fetch user   │     │                 │
│                 │     │    data         │     │                 │
│                 │     │  - Stream resp  │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### API Design

#### POST /api/v1/coach/chat

Streaming endpoint for chat messages.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What have I been working on?" }
  ]
}
```

**Response:** Server-Sent Events stream (Vercel AI SDK format)

### System Prompt Strategy

The system prompt will:
1. Define the AI's role as a supportive BJJ training coach
2. Inject the user's recent training context (sessions, goals, stats)
3. Set guidelines for response style (concise, encouraging, BJJ-aware)
4. Include current date for temporal awareness

Example structure:
```
You are a supportive BJJ training coach helping a practitioner reflect on their training.

## User's Training Context

### Recent Sessions (last 30 days)
[Injected session data]

### Active Goals
[Injected goals]

### Training Stats
- Current streak: X weeks
- Sessions this month: Y
- Gi/NoGi split: Z%/W%

## Guidelines
- Be encouraging but honest
- Reference specific sessions when relevant
- Keep responses concise (2-3 paragraphs max unless asked for detail)
- Use BJJ terminology naturally
- If asked about something not in the data, say so

Today's date is: [DATE]
```

### Context Window Management

To avoid exceeding context limits:
- Default to last 90 days of sessions
- Summarize older sessions if needed
- Limit session items to most recent N per session
- Consider chunking for users with extensive history

## UI/UX Design

### Page Location

New route: `/coach` - accessible from main navigation

### Chat Interface

```
┌────────────────────────────────────────┐
│  AI Training Coach                  ⟳  │  ← Header with reset button
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 🤖 Hey! I'm your AI training     │  │  ← AI welcome message
│  │    coach. Ask me anything about  │  │
│  │    your BJJ journey.             │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ What have I been struggling with │  │  ← User message
│  │ lately?                      You │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 🤖 Looking at your last 3 weeks  │  │  ← AI response (streaming)
│  │    of training, I notice...      │  │
│  │    ███████████░░░░░░░░░░░░░░░░░  │  │
│  └──────────────────────────────────┘  │
│                                        │
├────────────────────────────────────────┤
│  ┌────────────────────────────┐ [Send] │  ← Input area
│  │ Ask about your training... │        │
│  └────────────────────────────┘        │
└────────────────────────────────────────┘
```

### Suggested Prompts

Show starter prompts for new conversations:
- "What have I been working on lately?"
- "How am I progressing on my goals?"
- "What patterns do you see in my training?"
- "Summarize my last week of training"

## Implementation Phases

### Phase 1: Foundation (MVP)
- [ ] Set up Vercel AI SDK in backend
- [ ] Create `/api/v1/coach/chat` streaming endpoint
- [ ] Build basic chat UI component
- [ ] Implement session data retrieval for context
- [ ] Basic system prompt with user context
- [ ] Add route and navigation

### Phase 2: Enhanced Context
- [ ] Add goals to context
- [ ] Add training stats to context

### Phase 3: Polish
- [ ] Loading states and error handling
- [ ] Mobile optimization
- [ ] Add suggested prompts UI
- [ ] Improve system prompt with better guidelines

## Decisions

1. **Context Strategy**: Upfront data fetching for v1. Inject recent sessions, goals, and stats into the system prompt.
   - Future: Add function calling for actions like marking goals complete, or fetching sessions outside the default window.

2. **Model Selection**: GPT-4o-mini during development. Can upgrade to GPT-4o later if quality is insufficient.

3. **Conversation Persistence**: No database storage for v1. Conversations clear on page refresh.

4. **Mobile UX**: Full page chat interface.

## Security Considerations

- AI only has access to the authenticated user's data
- No PII in system prompts beyond what user has entered
- API key stored securely in environment variables
