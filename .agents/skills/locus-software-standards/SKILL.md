---
name: locus-software-standards
description: Primary and mandatory standard for 90%+ of all development prompts in the Locus/ReflectAI repository. Use whenever designing, writing, modifying, debugging, or reviewing any backend endpoints, AI generation logic, Firestore queries/mutations, auth checks, error handling, or full-stack features. Enforces agentic threat modeling (5 Threat Zones), Gemini model fallback ladders, defensive payload ingestion, strict undefined-stripping, and guaranteed persistence hygiene.
---

# Locus Software Standards & Production Directives

This is the primary operational skill for engineering in Locus / ReflectAI. Apply these rules across all feature implementations, refactors, and bug fixes.

---

## 1. Agentic Threat Modeling (5 Threat Zones)
Prior to outputting code or system architecture for any non-trivial feature, generate a **Threat Summary Table**:

| Threat Zone | Potential Vulnerability | Mitigation / Countermeasure |
|---|---|---|
| **Input Surfaces** | Untrusted user payloads, prompt injections, oversized inputs | Strict schema validation, body parser size limits, input stripping |
| **Planning & Reasoning** | Prompt injection overriding system prompts | System instruction separation, untrusted context quoting |
| **Tool Execution** | SSRF, privilege escalation, unvalidated parameters | Scoped parameter validation, no raw shell/dynamic execution |
| **Memory & State** | Insecure Firestore access, session leaks, cross-user data exposure | User-bound paths (`request.auth.uid == userId`), strict authentication |
| **Inter-System Communication** | Leaking tokens, logging API keys, external service downtime | Dynamic secret retrieval via env/Secret Manager, sanitized error logs |

---

## 2. Secure Coding & Firestore Auth Standards

1. **Zero Insecure Defaults in Firestore Rules**:
   Never deploy open permissions (`allow read, write: if true;`). All user records must be owner-scoped:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
2. **Federated Identity**: Prefer Google Sign-In via Firebase Auth. Never store raw passwords or build bespoke auth mechanisms.
3. **Zero Hardcoded Secrets**: Prohibit any hardcoded API keys (`AIzaSy...`). Always access credentials dynamically from environment variables or Google Cloud Secret Manager.

---

## 3. Gemini Model Resilience & Fallback Protocol

Whenever invoking Gemini models via `@google/genai`:
1. **Never hardcode a single model string** for content generation.
2. Use the **standard fallback ladder**:
   - Primary: `"gemini-3.6-flash"`
   - High-Availability Fallback: `"gemini-3.1-flash-lite"`
   - Dynamic Alias: `"gemini-flash-latest"`
   - Deep Reasoning Fallback: `"gemini-3.7-flash"`
   - Legacy Fallback: `"gemini-2.5-flash"`
3. Sequentially catch recoverable errors (`503`, `429`, `404`, `500`) and attempt the next model in the fallback chain.
4. Route all generation through the centralized helper in backend services:
   ```typescript
   export async function generateContentWithFallback(options: {
     systemInstruction?: string;
     temperature?: number;
     contents: any[];
   }): Promise<{ text: string; modelUsed: string }>
   ```

---

## 4. Server-Side Robustness & Payload Ingestion Standards

1. **Top-Level Request Deserialization (Ordering Guarantee)**:
   Mount body parsers (`express.json({ limit: '10mb' })`, `express.urlencoded()`) *before* registering any endpoint routes.
2. **Defensive Payload Ingestion (Null-Safe Destructuring)**:
   Never assume incoming request bodies exist. Always sanitize and guard input sources:
   ```typescript
   const data = (req.body && typeof req.body === 'object') ? req.body : {};
   ```
   If required parameters are missing, return a clean `400 Bad Request` with an actionable JSON message.

---

## 5. Database Persistence & Transaction Integrity

1. **Strict Undefined-Stripping (Zero-Crash Payload Hygiene)**:
   Firestore crashes if passed `undefined` fields. Always sanitize documents before writing:
   ```typescript
   export function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
     return Object.entries(obj).reduce((acc, [key, value]) => {
       if (value !== undefined) {
         acc[key as keyof T] = (value && typeof value === 'object' && !Array.isArray(value))
           ? stripUndefined(value)
           : value;
       }
       return acc;
     }, {} as Partial<T>);
   }
   ```
2. **Guaranteed Transaction Verification (Input-to-Save Completeness)**:
   When user input is submitted, both the user turn and any model response must be confirmed written to persistence. Never fail silently.
3. **Explicit Error Escalation**:
   Catch database rejections and display clear UI retry options. Never discard user input state upon a persistence failure.

---

## 6. Functional Walkthroughs
In the absence of automated tests, produce concrete, step-by-step verification walkthroughs covering:
- Every interactive button, input field, and modal state.
- Expected backend response and persistence behavior.
- Failure/retry conditions.
