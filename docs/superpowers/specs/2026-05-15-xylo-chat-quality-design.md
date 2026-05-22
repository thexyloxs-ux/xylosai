# XYLO Chat Quality Upgrade Design

## Goal

Upgrade XYLO's chat system end to end so the product delivers:

- better academic answer quality
- better study-mode behavior
- lower average inference cost
- faster perceived responses for simple turns
- stronger resilience when a provider fails or rate-limits

The system should preserve the current frontend contract and upgrade the backend orchestration behind `/api/chat`.

## Current State

The current chat path is:

1. `POST /api/chat`
2. auth + request validation
3. profile/org load
4. free-tier quota enforcement
5. one Groq call using a single hardcoded model
6. stream plain text back to the client
7. persist conversation + activity

Current strengths:

- simple flow
- streaming already works
- conversation persistence already works
- quota control already exists

Current gaps:

- one provider only
- one model only
- no task-aware routing
- no quality-vs-speed strategy
- no provider fallback
- prompt builder is not fully session-aware in the live request path
- no structured chat telemetry for quality tuning

## Product Outcome

After this upgrade, XYLO should feel like one coherent AI tutor with better judgment:

- quick replies feel fast
- deeper study questions feel more thoughtful
- quiz sessions behave like quizzes
- study-plan sessions produce actionable plans
- exam-prep sessions prioritize likely/high-yield areas
- failures degrade gracefully instead of breaking the chat

Students should never need to know which provider answered them.

## Non-Goals

This phase will not include:

- frontend model picker
- multi-agent workflows
- RAG or curriculum document ingestion
- teacher/student live messaging
- voice or multimodal features
- large UX redesign of the chat page

## Recommended Architecture

Use a provider-agnostic orchestration layer behind the existing API route.

### Core Components

#### 1. Chat Orchestrator

Responsible for:

- classifying the turn
- selecting the provider/model
- applying fallback rules
- normalizing stream output
- returning provider metadata for server-side observability

The orchestrator owns routing decisions. The route handler should remain thin.

#### 2. Provider Interface

Define a common interface for all model providers:

- provider name
- model name
- streaming chat execution
- normalized error handling

Initial implementations:

- `GroqProvider`
- `GeminiProvider`

Future implementations:

- `OpenRouterProvider`
- `CerebrasProvider`

#### 3. Turn Classifier

A lightweight classifier that decides the type of work required for the current turn using:

- explicit study mode if available
- message length
- keywords and phrasing
- recent conversation context
- whether the user is asking for planning, step-by-step teaching, or rapid back-and-forth checking

The classifier does not need a separate model call. It should be heuristic and deterministic for phase 1.

#### 4. Prompt Builder

Expand the prompt system into composable layers:

- XYLO identity layer
- personalization layer
- organization/curriculum layer
- session-type layer
- response-style layer

This keeps provider changes separate from tutoring behavior.

#### 5. Persistence and Activity Layer

Keep the existing conversation and activity repositories. Do not change the DB contract in phase 1 unless new telemetry requires a small additive field.

## Provider Strategy

## Recommended Initial Strategy: Groq + Gemini Hybrid

### Groq

Use Groq as the fast path for:

- short factual answers
- quick follow-up tutoring
- lightweight quiz turns
- brief clarifications
- low-latency conversational continuity

Rationale:

- Groq is already integrated
- streaming is already wired
- latency is a strong fit for chat responsiveness

### Gemini

Use Gemini as the quality path for:

- deep explanations
- study plans
- exam prep
- multi-step reasoning
- more emotionally sensitive coaching turns
- cases where we need stronger instruction following and structured teaching

Rationale:

- stronger educational reasoning ceiling
- free-tier access exists for some Gemini models
- good complement to Groq instead of replacing it

### Fallback

Fallback policy for phase 1:

- if the selected provider fails before streaming begins, retry once using the secondary provider
- if the stream begins and then fails mid-response, do not silently stitch providers together in the same response
- instead, return a warm retry message or surface a safe failure state to the user

No more than one retry per request.

## Routing Policy

Routing should optimize for quality first, while protecting speed and cost.

### Route to Groq When

- user asks a short, direct question
- user is in a rapid quiz flow
- user asks for a small clarification
- the turn is a continuation of an already fast-paced exchange

### Route to Gemini When

- user asks for explanation "step by step"
- user asks for a study plan
- user says an exam is coming up
- user asks for breakdowns, comparisons, or longer teaching
- the turn is emotionally loaded and needs more careful framing
- the requested output format is inherently more complex

### Fallback Rules

- primary choice fails: retry secondary provider once
- secondary fails: return a friendly platform error
- log the failure path

## Study-Mode Quality Rules

Study modes must become first-class behavior in the live chat path.

### Understand Mode

Behavior:

- explain in simple steps
- use examples
- check understanding after explanation
- avoid giant dumps of text

Preferred structure:

1. what it means
2. simple example
3. what students usually confuse
4. quick check question

### Quiz Mode

Behavior:

- ask one question at a time
- wait for answer before continuing
- give short correctness feedback
- increase or decrease difficulty gradually

Preferred structure:

- question
- student reply
- correctness + why
- next question

### Study Plan Mode

Behavior:

- produce a realistic, structured plan
- adapt to level, subjects, and exam horizon
- avoid vague productivity advice

Preferred structure:

- goal
- weekly focus
- daily schedule
- checkpoints
- what to do if student falls behind

### Exam Prep Mode

Behavior:

- focus on high-yield topics
- emphasize likely exam patterns
- prioritize weak areas
- keep explanations exam-useful, not merely interesting

Preferred structure:

- top priority topics
- quick review sequence
- practice plan
- likely mistakes to avoid

## Teaching Quality Rules

These rules apply across providers.

- default to concise sections
- adapt language to the learner level
- use African school context naturally, not performatively
- never shame the student
- acknowledge stress briefly, then redirect to action
- prefer worked examples over abstract explanation
- if uncertain, hedge honestly instead of hallucinating
- end many answers with a next-best action or a check-for-understanding question

## API Design

Keep the existing route:

- `POST /api/chat`

### Request Contract

Preserve the current request shape in phase 1:

- `messages`
- optional `conversationId`

Do not require frontend changes to unlock the backend upgrade.

### Response Contract

Preserve streaming plain text for now so the current frontend remains intact.

Optional response headers may include non-sensitive metadata like:

- conversation id
- routing id for debugging

Do not expose provider/model names to the student UI in phase 1.

## Error Handling

### User-Facing Behavior

If a provider fails before a response starts:

- transparently try the fallback provider

If both fail:

- return a warm, human error message
- avoid raw provider messages

Example tone:

"XYLO is having trouble thinking clearly right now. Please try again in a moment."

### Internal Handling

Normalize provider errors into categories:

- auth/config error
- rate limit
- timeout
- upstream provider failure
- invalid request

These categories should drive logs and future dashboards.

## Observability

Add server-side telemetry for each chat request:

- selected provider
- selected model
- routing reason
- fallback used or not
- latency
- response length
- quota state
- request type

This can start as structured logs. A database table is optional for phase 2, not required for phase 1.

## Cost Strategy

To satisfy "best quality" without runaway cost:

- send cheap/simple work to Groq
- reserve Gemini for higher-value turns
- keep no more than one fallback retry
- avoid secondary model calls for classification
- avoid post-processing model passes in phase 1

This gives better quality than single-model Groq while preserving cost discipline.

## Reliability Strategy

- provider timeouts must be explicit
- fallback should happen only before the stream starts
- do not attempt multi-provider merge in one response
- keep persistence behavior unchanged even when routing changes

If response saving fails after generation, log it clearly and do not fail the student response.

## File-Level Design

Suggested new/updated backend layout:

- `src/lib/server/ai/types.ts`
  - provider interfaces
  - routing types
- `src/lib/server/ai/providers/groq.ts`
  - Groq adapter
- `src/lib/server/ai/providers/gemini.ts`
  - Gemini adapter
- `src/lib/server/ai/router.ts`
  - deterministic turn classification
  - provider/model selection
- `src/lib/server/ai/orchestrator.ts`
  - fallback-aware stream orchestration
- `src/lib/server/ai/prompt.ts`
  - layered prompt builder
- `src/lib/server/services/chat.ts`
  - keep quota + conversation logic
  - delegate generation to orchestrator
- `src/routes/api/chat/+server.ts`
  - stay thin

## Environment Variables

Phase 1 adds Gemini configuration.

Required:

- `GROQ_API_KEY`
- `GEMINI_API_KEY`

Optional later:

- `OPENROUTER_API_KEY`
- `CEREBRAS_API_KEY`

## Security and Privacy

- no provider secrets on the client
- keep Supabase auth and quota enforcement server-side
- do not log raw student message content unless explicitly needed and approved
- preserve school privacy boundary: admins never see student chat content

## Testing Strategy

### Unit Tests

Add tests for:

- turn classification
- provider selection
- fallback decisions
- prompt layer composition

### Integration Tests

Add tests for:

- `/api/chat` with Groq selected
- `/api/chat` with Gemini selected
- fallback from Groq to Gemini
- free-tier limit still enforced
- conversation persistence still works

### Manual QA

Use transcripts covering:

- short factual tutoring
- quiz mode
- study plan mode
- exam prep mode
- frustrated student tone
- provider failure simulation

## Delivery Plan

### Phase 1

- provider abstraction
- Groq adapter
- Gemini adapter
- deterministic routing
- improved prompt builder
- one-step fallback
- no frontend contract changes

### Phase 2

- transcript-based quality tuning
- richer telemetry
- optional third provider fallback

### Phase 3

- frontend study-mode upgrades
- quality eval harness
- admin-side AI performance analytics if needed

## Recommendation

Implement Phase 1 only right now.

It gives the highest ratio of quality gain to engineering complexity:

- major answer quality improvement
- minimal frontend disruption
- future-ready provider abstraction
- room for later fallback expansion

## Acceptance Criteria

The phase is successful when:

1. `/api/chat` still works with the current frontend
2. XYLO can route requests between Groq and Gemini
3. study modes behave differently in the live chat path
4. fallback works when a provider fails before streaming
5. free-tier limits still work exactly as before
6. conversation persistence still works
7. logs show provider choice, fallback usage, and latency
8. student-visible response quality improves measurably in manual QA

