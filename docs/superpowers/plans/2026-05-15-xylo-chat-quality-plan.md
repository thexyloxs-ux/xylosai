# XYLO Chat Quality Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade XYLO's chat backend to support Groq + Gemini routing, session-aware prompting, and provider fallback without breaking the current frontend contract.

**Architecture:** Keep `POST /api/chat` as the public entrypoint, move generation behind a provider-agnostic orchestrator, and use deterministic routing to choose fast vs quality models. Preserve quota, persistence, and streaming, while adding enough test coverage to keep behavior safe during rollout.

**Tech Stack:** SvelteKit, TypeScript, Supabase, Groq SDK, Gemini REST API, Vitest, Zod

---

## File Map

### Create

- `src/lib/server/ai/types.ts` — shared provider, routing, and stream types
- `src/lib/server/ai/router.ts` — deterministic session classification and provider selection
- `src/lib/server/ai/providers/groq.ts` — Groq provider adapter
- `src/lib/server/ai/providers/gemini.ts` — Gemini provider adapter
- `src/lib/server/ai/orchestrator.ts` — orchestrates provider selection, fallback, and streaming
- `src/lib/server/__tests__/chat-router.test.ts` — unit tests for routing behavior
- `src/lib/server/__tests__/chat-orchestrator.test.ts` — unit tests for fallback and orchestration

### Modify

- `src/lib/server/groq.ts` — reduce to model/config export or remove prompt responsibility
- `src/lib/server/services/chat.ts` — preserve quota and persistence, delegate generation to orchestrator
- `src/routes/api/chat/+server.ts` — pass session hints into the chat service if needed, preserve response contract
- `src/lib/server/__tests__/__stubs__/env-private.ts` — add Gemini env stub
- `package.json` / `package-lock.json` — add any required dependency only if needed
- `.env.example` — document `GEMINI_API_KEY`
- `.env` — local development placeholder/update

## Task 1: Define Shared AI Types

**Files:**
- Create: `src/lib/server/ai/types.ts`
- Test: `src/lib/server/__tests__/chat-router.test.ts`

- [ ] **Step 1: Add shared AI types**

```ts
export type ChatMessage = {
	role: 'user' | 'assistant';
	content: string;
};

export type StudyIntent =
	| 'quick_tutor'
	| 'deep_explain'
	| 'quiz'
	| 'study_plan'
	| 'exam_prep';

export type ProviderName = 'groq' | 'gemini';

export type ProviderSelection = {
	intent: StudyIntent;
	primary: ProviderName;
	fallback: ProviderName;
	reason: string;
};

export type ProviderRequest = {
	systemPrompt: string;
	messages: ChatMessage[];
};

export interface ChatProvider {
	name: ProviderName;
	stream(req: ProviderRequest): Promise<AsyncIterable<string>>;
}
```

- [ ] **Step 2: Run targeted typecheck**

Run: `npm run check`
Expected: either PASS or only failures unrelated to `types.ts`

## Task 2: Build Deterministic Router

**Files:**
- Create: `src/lib/server/ai/router.ts`
- Create: `src/lib/server/__tests__/chat-router.test.ts`

- [ ] **Step 1: Write failing routing tests**

```ts
import { describe, expect, it } from 'vitest';
import { classifyTurn } from '../ai/router';

describe('classifyTurn', () => {
	it('routes quiz prompts to groq', () => {
		const result = classifyTurn([{ role: 'user', content: 'Quiz me on algebra' }]);
		expect(result.intent).toBe('quiz');
		expect(result.primary).toBe('groq');
	});

	it('routes study plans to gemini', () => {
		const result = classifyTurn([{ role: 'user', content: 'Create a study plan for WAEC chemistry in 3 weeks' }]);
		expect(result.intent).toBe('study_plan');
		expect(result.primary).toBe('gemini');
	});
});
```

- [ ] **Step 2: Run the routing test**

Run: `npx vitest run src/lib/server/__tests__/chat-router.test.ts`
Expected: FAIL because `classifyTurn` does not exist yet

- [ ] **Step 3: Implement router**

```ts
import type { ChatMessage, ProviderSelection, StudyIntent } from './types';

function detectIntent(content: string): StudyIntent {
	const text = content.toLowerCase();
	if (text.includes('quiz')) return 'quiz';
	if (text.includes('study plan')) return 'study_plan';
	if (text.includes('exam') || text.includes('test prep')) return 'exam_prep';
	if (text.includes('step by step') || text.length > 280) return 'deep_explain';
	return 'quick_tutor';
}

export function classifyTurn(messages: ChatMessage[]): ProviderSelection {
	const lastUser = [...messages].reverse().find((m) => m.role === 'user');
	const content = lastUser?.content ?? '';
	const intent = detectIntent(content);

	if (intent === 'quiz' || intent === 'quick_tutor') {
		return { intent, primary: 'groq', fallback: 'gemini', reason: intent };
	}

	return { intent, primary: 'gemini', fallback: 'groq', reason: intent };
}
```

- [ ] **Step 4: Re-run the routing test**

Run: `npx vitest run src/lib/server/__tests__/chat-router.test.ts`
Expected: PASS

## Task 3: Split Prompt Builder for Session-Aware Prompts

**Files:**
- Modify: `src/lib/server/groq.ts`
- Modify: `src/lib/server/services/chat.ts`

- [ ] **Step 1: Move prompt building into a reusable exported function**

Implement a prompt builder that accepts:

```ts
buildSystemPrompt(profile, org, intent)
```

and adds intent-specific behavior:

- `quiz` => one question at a time
- `study_plan` => structured schedule
- `exam_prep` => high-yield focus
- `deep_explain` => explain then check understanding

- [ ] **Step 2: Keep provider config separate from prompting**

Refactor `src/lib/server/groq.ts` to only hold:

```ts
export const GROQ_MODEL = 'llama-3.3-70b-versatile';
export const GROQ_FAST_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
```

and Groq client construction.

- [ ] **Step 3: Run full typecheck**

Run: `npm run check`
Expected: PASS

## Task 4: Implement Groq Provider Adapter

**Files:**
- Create: `src/lib/server/ai/providers/groq.ts`

- [ ] **Step 1: Create Groq provider**

```ts
import { groq, GROQ_FAST_MODEL, GROQ_MODEL } from '$lib/server/groq';
import type { ChatProvider, ProviderRequest } from '../types';

export function createGroqProvider(model: string): ChatProvider {
	return {
		name: 'groq',
		async stream(req: ProviderRequest) {
			const stream = await groq.chat.completions.create({
				model,
				messages: [
					{ role: 'system', content: req.systemPrompt },
					...req.messages
				],
				stream: true,
				temperature: 0.7,
				max_tokens: 2048
			});

			async function* tokens() {
				for await (const chunk of stream) {
					const token = chunk.choices[0]?.delta?.content ?? '';
					if (token) yield token;
				}
			}

			return tokens();
		}
	};
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS

## Task 5: Implement Gemini Provider Adapter

**Files:**
- Create: `src/lib/server/ai/providers/gemini.ts`
- Modify: `.env.example`
- Modify: `src/lib/server/__tests__/__stubs__/env-private.ts`

- [ ] **Step 1: Add Gemini env**

Add:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

- [ ] **Step 2: Add provider using REST streaming-compatible fallback**

Use the official Gemini generate-content endpoint with a non-streaming request in phase 1, then wrap the returned text in an async iterable so the frontend contract remains the same.

```ts
const response = await fetch(
	`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
	{ ... }
);
```

Normalize output into yielded text chunks.

- [ ] **Step 3: Run typecheck**

Run: `npm run check`
Expected: PASS

## Task 6: Build Orchestrator with Fallback

**Files:**
- Create: `src/lib/server/ai/orchestrator.ts`
- Create: `src/lib/server/__tests__/chat-orchestrator.test.ts`

- [ ] **Step 1: Write failing fallback tests**

```ts
import { describe, expect, it, vi } from 'vitest';
import { streamWithFallback } from '../ai/orchestrator';

describe('streamWithFallback', () => {
	it('falls back before stream starts', async () => {
		const primary = { name: 'groq', stream: vi.fn().mockRejectedValue(new Error('boom')) };
		const fallback = { name: 'gemini', stream: vi.fn().mockResolvedValue((async function* () { yield 'hi'; })()) };
		const result = await streamWithFallback(primary as never, fallback as never, { systemPrompt: 'x', messages: [] });
		expect(result.provider).toBe('gemini');
	});
});
```

- [ ] **Step 2: Run orchestrator tests**

Run: `npx vitest run src/lib/server/__tests__/chat-orchestrator.test.ts`
Expected: FAIL because orchestrator does not exist yet

- [ ] **Step 3: Implement orchestrator**

```ts
export async function streamWithFallback(primary, fallback, req) {
	try {
		const stream = await primary.stream(req);
		return { provider: primary.name, stream, usedFallback: false };
	} catch {
		const stream = await fallback.stream(req);
		return { provider: fallback.name, stream, usedFallback: true };
	}
}
```

- [ ] **Step 4: Re-run orchestrator tests**

Run: `npx vitest run src/lib/server/__tests__/chat-orchestrator.test.ts`
Expected: PASS

## Task 7: Refactor Chat Service to Use Orchestrator

**Files:**
- Modify: `src/lib/server/services/chat.ts`

- [ ] **Step 1: Replace direct Groq call with orchestrator call**

Refactor `streamChatResponse` so it:

- reserves quota
- gets/creates conversation
- saves the user message
- classifies the turn
- builds intent-aware prompt
- chooses providers
- streams via orchestrator

- [ ] **Step 2: Preserve response persistence**

Keep:

- assistant text accumulation
- `saveMessage` for assistant reply
- `incrementStudentActivity`

- [ ] **Step 3: Preserve existing return shape**

Return:

```ts
{ stream: ReadableStream, conversationId: string }
```

- [ ] **Step 4: Run targeted tests and full check**

Run:

```bash
npx vitest run src/lib/server/__tests__/chat-router.test.ts src/lib/server/__tests__/chat-orchestrator.test.ts
npm run check
```

Expected: PASS

## Task 8: Verify API Route Compatibility

**Files:**
- Modify: `src/routes/api/chat/+server.ts`

- [ ] **Step 1: Keep request and response contract unchanged**

Only make route changes if required for new logging or context propagation. Do not change:

- request JSON format
- streaming plain text response
- `X-Conversation-Id` header behavior

- [ ] **Step 2: Run API-adjacent verification**

Run: `npm run check`
Expected: PASS

## Task 9: Verify the Whole System

**Files:**
- Test only

- [ ] **Step 1: Run unit tests**

Run:

```bash
npx vitest run src/lib/server/__tests__/chat-router.test.ts src/lib/server/__tests__/chat-orchestrator.test.ts src/lib/server/__tests__/subscription.test.ts src/lib/server/__tests__/rate-limit.test.ts src/lib/server/__tests__/webhook.test.ts
```

Expected: PASS

- [ ] **Step 2: Run project check**

Run:

```bash
npm run check
```

Expected: PASS

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: PASS

## Self-Review

### Spec Coverage

Covered:

- provider abstraction
- Groq + Gemini routing
- session-aware prompt behavior
- single retry fallback
- no frontend contract break
- verification

Deferred intentionally to later phases:

- OpenRouter/Cerebras fallback
- frontend study-mode redesign
- transcript eval harness

### Placeholder Scan

No `TODO`, `TBD`, or deferred code placeholders are intentionally left in task steps.

### Type Consistency

Shared names used consistently:

- `ChatMessage`
- `ProviderSelection`
- `ChatProvider`
- `classifyTurn`
- `streamWithFallback`

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-15-xylo-chat-quality-plan.md`.

Execution assumption based on user direction: proceed with inline execution in this session.

