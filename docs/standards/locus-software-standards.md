# Locus Software Standards

## 1. Agentic Threat Modeling
* **Objective**: Perform a structured, scenario-driven threat analysis prior to outputting code or system architecture.
* **Scope Lens (The 5 Threat Zones)**:
  * **Input Surfaces**: Prompts, untrusted user uploads, external API payloads.
  * **Planning & Reasoning**: Prompt injection, system instruction bypass, tool routing hijacking.
  * **Tool Execution**: Privilege escalation via API functions, SSRF, dynamic code execution risks.
  * **Memory & State**: Firestore state persistence, session hijacking, cross-user data leaks.
  * **Inter-System Communication**: External API calls, token leakage.
* **Mandatory Execution Criteria**: Whenever asked to design or implement a feature, the model must first generate a Threat Summary Table mapping risks to countermeasures.

## 2. Secure Coding Standard
* **Objective**: Support mitigations corresponding with OWASP Top 10 (Web) and OWASP Top 10 for LLM Applications.
* **Core Principles Implemented**:
  * **Input Validation & Sanitization (OWASP A03 / LLM02)**: Strict schema validation for all incoming inputs; explicit parameterization to prevent SQLi, NoSQLi, and Command Injection.
  * **Indirect Prompt Injection Defense (OWASP LLM01)**: Treat data retrieved from untrusted sources as plain data, never executable instructions.
  * **Broken Access Control Mitigation (OWASP A01)**: Validate authorization headers and context-bound permissions at every API boundary.
  * **Output Handling (OWASP A03 / LLM05)**: Encode all dynamic LLM outputs prior to rendering in HTML/JS interfaces or executing downstream system commands.

## 3. Secure Firestore & Firebase Auth Configuration
* **Objective**: Limit data exposure and unauthorized database reads/writes in Firebase/Firestore architectures.
* **Core Security Rules**:
  * **Zero Insecure Defaults**: Never output `allow read, write: if true;`.
  * **User Data Isolation**: Support owner-bound path checking (`request.auth.uid == userId`) for personal documents.
  * **Role-Based Access Control (RBAC)**: Use custom claims or dynamic document lookups for elevated administrative operations.
  * **Auth State Integrity**: Verify JWT tokens on backend server environments using the Firebase Admin SDK.
  * **Passwordless/Federated Auth**: Prefer Federated Identity (Google Sign-In via Firebase Auth) to outsource credential management securely.

## 4. Secret Management & Zero-Hardcoding Hygiene
* **Objective**: Eliminate hardcoded credentials, API keys, service account JSON files, and tokens.
* **Mandatory Code Patterns**:
  * **Prohibit Hardcoded Strings**: Flag any pattern resembling `const API_KEY = "AIzaSy..."` as a critical flaw.
  * **Google Cloud Secret Manager Integration**: Force code to retrieve operational credentials dynamically using Secret Manager or environment variable injection.

## 5. Security Reviewer Persona
* **Objective**: Review any code for common security issues based on the threat model.
* **Review Methodology**:
  * Inspect for hardcoded credentials and unsafe default settings.
  * Map data flow from untrusted entry point to storage/execution sink.
  * Validate access control checks at every function boundary.
  * Provide a severity-ranked vulnerability list with concrete code diffs for remediation.

## 6. Functional Stability, Resilience, & Persistence Standards

* **Interactive Functionality**: Any buttons that submit an input must actually be wired and verified.
* **Gemini Model Resilience & Fallback Protocol**:
  1. **Resilient Model Fallback Ladder**:
     - Primary: `"gemini-3.6-flash"`
     - High-Availability Fallback: `"gemini-3.1-flash-lite"`
     - Dynamic Alias: `"gemini-flash-latest"`
     - Deep Reasoning Fallback: `"gemini-3.7-flash"`
     - Legacy Fallback: `"gemini-2.5-flash"`
  2. **Error Recovery Matrix**: Catch recoverable status codes (`503`, `429`, `404`, `500`) and sequentially attempt the next model.
  3. **Standard Helper Implementation**: Route AI calls through `generateContentWithFallback()`.
* **Server-Side Robustness & Payload Ingestion**:
  1. **Top-Level Request Deserialization**: Body parsers mounted before endpoint routes.
  2. **Defensive Payload Ingestion**: Guard and default input objects before destructuring.
  3. **Unified Dev Script**: `server.ts` boots Express + Vite together.
* **Database Persistence & Transaction Integrity**:
  1. **Strict Undefined-Stripping**: Sanitize all payloads to remove `undefined` properties before passing to Firestore.
  2. **Guaranteed Transaction Verification**: Ensure user input and model output are persisted. Never fail silently.
  3. **Explicit Error Escalation**: Catch rejections and display retry banner/toast. Never clear unsaved user buffers.

## 7. Functional Stability Walkthroughs
* Write step-by-step walkthroughs broken down into test cases for every process and user interaction.
