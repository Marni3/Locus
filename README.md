# ReflectAI &mdash; User-Authenticated Reflection & Journal Companion

ReflectAI is a secure, user-authenticated journaling and multi-turn reflection workspace powered by **Google Firebase Authentication**, **Cloud Firestore**, and **Gemini 3.6 Flash**. 

---

## Architecture Overview

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, and Motion.
- **Backend Service**: Express.js with `@google/genai` TypeScript SDK and Vite SSR middleware.
- **Authentication**: Firebase Authentication (Google Sign-In with federated identity).
- **Persistent Database**: Google Cloud Firestore with user-isolated document paths (`/users/{userId}/interactions/{interactionId}`).
- **AI Engine**: Gemini 3.6 Flash with a 4-tier resilient fallback ladder (`gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash`).
- **Secret Management**: Google Cloud Secret Manager / Environment Variables for API key isolation.

---

## 1. Environment & Prerequisites

Ensure the following Google Cloud APIs are enabled in your target project:

```bash
# Set your active GCP project
gcloud config set project YOUR_PROJECT_ID

# Enable required Google Cloud Services
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

---

## 2. Secret Management Setup

ReflectAI strictly protects the Gemini API key by proxying all generation requests through the Express backend service. Never hardcode API keys in frontend bundles.

```bash
# 1. Create the Secret in Google Cloud Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add your Gemini API Key as a secret version
echo -n "YOUR_ACTUAL_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant the Cloud Run default compute service account permission to access the secret
export PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Database Security Configuration (Cloud Firestore)

ReflectAI implements Attribute-Based Access Control (ABAC) ensuring complete data isolation between authenticated users. Users can only read and write documents under their own authenticated UID path.

### `firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Strict user data isolation
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

To deploy Firestore security rules using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Local Development

```bash
# Install dependencies
npm install

# Start the full-stack dev server (Express + Vite on port 3000)
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

---

## 5. Cloud Run Deployment Flow

Deploy the application directly to Google Cloud Run from source:

```bash
# Build and deploy container to Cloud Run
gcloud run deploy reflect-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

---

## 6. Required Campaign Verification Binding

Apply the mandatory challenge label to register your Cloud Run service for automated verification:

```bash
gcloud run services update reflect-ai \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## Security Review & Compliance Checklist

- [x] **Zero Hardcoded Secrets**: Gemini API key injected strictly via server-side environment variable / Secret Manager.
- [x] **OWASP A01 (Broken Access Control)**: Strict owner-bound checking (`request.auth.uid == userId`) in Firestore.
- [x] **OWASP A03 / LLM02 (Input Validation)**: Defensive payload ingestion, null-safe destructuring, and payload undefined-stripping prior to persistence.
- [x] **OWASP LLM05 (Output Encoding)**: Markdown rendering sanitized through React component tree.
- [x] **Resilient AI Fallback Ladder**: Automated multi-tier retry across Gemini model tiers.
