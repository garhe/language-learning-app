# Language Learning Web App (Azure OpenAI + Azure Speech)

This project creates a web app for language learning with two study modes:

- Read aloud with pronunciation assessment
- AI conversation practice with final scoring

Supported languages:

- English
- Chinese (Mandarin)
- French
- Japanese
- Spanish

## Features

- Learner flow: language, level, mode
- AI-generated lesson content and suggested visuals
- Speech-to-text via Azure Speech SDK
- Text-to-speech via Azure Speech SDK
- Pronunciation assessment scoring
- Conversation loop with AI and end-of-session score
- Optional Azure Avatar (preview hook)

## Prerequisites

- Node.js 18+
- Azure AI Foundry deployment (or Azure OpenAI deployment)
- Azure Speech resource

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill in values.

Use one LLM option:

- Option A (Foundry): fill `AZURE_FOUNDRY_TARGET_URI`, `AZURE_FOUNDRY_KEY`, `AZURE_FOUNDRY_MODEL`
- Option B (Azure OpenAI): fill `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_CHAT_DEPLOYMENT`

Also fill Speech values:

- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`

3. Run the app:

```bash
npm run dev
```

4. Open browser:

- http://localhost:3000

## Notes

- For best pronunciation results, use a quality microphone.
- Avatar support depends on Azure Avatar availability in your region/resource.
