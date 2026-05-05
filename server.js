import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const languageMap = {
  english: { label: "English", locale: "en-US", voice: "en-US-Jenny:DragonHDLatestNeural" },
  mandarin: { label: "Chinese (Mandarin)", locale: "zh-CN", voice: "zh-CN-Xiaochen:DragonHDLatestNeural" },
  french: { label: "French", locale: "fr-FR", voice: "fr-FR-Vivienne:DragonHDLatestNeural" },
  japanese: { label: "Japanese", locale: "ja-JP", voice: "ja-JP-Nanami:DragonHDLatestNeural" },
  spanish: { label: "Spanish", locale: "es-ES", voice: "es-ES-Ximena:DragonHDLatestNeural" }
};

const levelMap = {
  basic: "Basic (zero knowledge)",
  intermediate: "Intermediate (daily conversation)",
  pro: "Pro (near-native)"
};

const foundryConfig = {
  targetUri: process.env.AZURE_FOUNDRY_TARGET_URI,
  apiKey: process.env.AZURE_FOUNDRY_KEY,
  model: process.env.AZURE_FOUNDRY_MODEL || process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || ""
};

function createAzureOpenAIClient() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";

  if (!endpoint || !apiKey || !deployment) {
    return null;
  }

  return new OpenAI({
    apiKey,
    baseURL: `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}`,
    defaultQuery: { "api-version": apiVersion },
    defaultHeaders: { "api-key": apiKey }
  });
}

const aiClient = createAzureOpenAIClient();

function hasFoundry() {
  return Boolean(foundryConfig.targetUri && foundryConfig.apiKey);
}

function extractResponseText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const contentItems = (data?.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item?.text);

  if (contentItems.length > 0) {
    return contentItems.map((item) => item.text).join("\n");
  }

  return "";
}

function buildFoundryInput(messages) {
  return messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");
}

async function callFoundryResponses(messages, temperature = 0.7) {
  const body = {
    input: buildFoundryInput(messages),
    temperature
  };

  if (foundryConfig.model) {
    body.model = foundryConfig.model;
  }

  const response = await fetch(foundryConfig.targetUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": foundryConfig.apiKey,
      Authorization: `Bearer ${foundryConfig.apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Foundry call failed: ${errText}`);
  }

  const data = await response.json();
  const text = extractResponseText(data);

  if (!text) {
    throw new Error("Foundry returned an empty response.");
  }

  return text;
}

async function callChat(messages, temperature = 0.7) {
  if (hasFoundry()) {
    return callFoundryResponses(messages, temperature);
  }

  if (!aiClient) {
    throw new Error("Neither Azure Foundry nor Azure OpenAI is configured.");
  }

  const model = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
  const completion = await aiClient.chat.completions.create({
    model,
    messages,
    temperature
  });

  return completion.choices?.[0]?.message?.content || "";
}

function parseJsonOrFallback(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = String(text || "")
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      return fallback;
    }
  }
}

app.get("/api/config", (req, res) => {
  res.json({
    languages: languageMap,
    levels: levelMap,
    hasAzureOpenAI: Boolean(aiClient),
    hasFoundry: hasFoundry(),
    llmProvider: hasFoundry() ? "foundry" : aiClient ? "azure-openai" : "none",
    hasSpeech: Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION)
  });
});

app.post("/api/generate-content", async (req, res) => {
  const { language, level, mode, topic } = req.body || {};

  if (!languageMap[language] || !levelMap[level] || !["read", "conversation"].includes(mode)) {
    return res.status(400).json({ error: "Invalid language, level, or mode." });
  }

  const topicInstruction = topic && topic !== "free"
    ? `- The lesson topic must be: ${topic}. Build all content around this theme.`
    : "- Choose a practical, everyday topic suitable for the learner's level.";

  try {
    const prompt = `You are a language coach. Generate lesson content as JSON only.
Schema:
{
  "title": "string",
  "objective": "string",
  "topic": "string",
  "visualDirection": "string",
  "readMode": {
    "referenceText": "string",
    "hints": ["string", "string"]
  },
  "conversationMode": {
    "openingLine": "string",
    "scenario": "string",
    "tips": ["string", "string"]
  }
}
Rules:
- Target language: ${languageMap[language].label}
- Learner level: ${levelMap[level]}
${topicInstruction}
- Keep text age-appropriate and practical.
- If mode is read, make referenceText 1 short paragraph.
- If mode is conversation, set openingLine and scenario for a natural dialogue.
- Use target language in generated lesson text, with light English support only if level is basic.
- Return valid JSON only.`;

    const raw = await callChat([
      { role: "system", content: "You create structured language-learning lessons." },
      { role: "user", content: prompt }
    ]);

    const fallback = {
      title: "Starter Lesson",
      objective: "Practice pronunciation and short responses.",
      topic: "Daily life",
      visualDirection: "Cafe scene, warm colors, friendly people",
      readMode: {
        referenceText: "Hello, I am learning this language. Today I will practice speaking clearly and confidently.",
        hints: ["Speak slowly", "Pause at punctuation"]
      },
      conversationMode: {
        openingLine: "Hello! How is your day going?",
        scenario: "A friendly conversation in a cafe",
        tips: ["Use complete sentences", "Ask one follow-up question"]
      }
    };

    const data = parseJsonOrFallback(raw, fallback);

    return res.json({
      ...data,
      language,
      level,
      mode,
      locale: languageMap[language].locale,
      voice: languageMap[language].voice
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to generate content." });
  }
});

app.post("/api/conversation-turn", async (req, res) => {
  const { language, level, topic, userMessage, history = [] } = req.body || {};

  if (!languageMap[language] || !levelMap[level] || !userMessage) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const messages = [
      {
        role: "system",
        content: `You are a supportive language tutor speaking ${languageMap[language].label}. Learner level: ${levelMap[level]}. Keep replies concise (2-4 sentences), natural, and focused on topic: ${topic || "general daily conversation"}. End with one short question to continue dialogue.`
      },
      ...history.slice(-8),
      { role: "user", content: userMessage }
    ];

    const reply = await callChat(messages, 0.6);

    return res.json({
      reply,
      suggestedFollowUp: "Respond naturally and add one extra detail."
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to process conversation turn." });
  }
});

app.post("/api/evaluate-conversation", async (req, res) => {
  const { language, level, transcript, topic } = req.body || {};

  if (!languageMap[language] || !levelMap[level] || !transcript) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const evalPrompt = `You are a strict but encouraging language examiner.
Evaluate this conversation transcript in ${languageMap[language].label} for a learner at ${levelMap[level]} level.
Topic: ${topic || "General"}
Transcript:
${transcript}
Return JSON only with this schema:
{
  "overallScore": number,
  "fluency": number,
  "accuracy": number,
  "vocabulary": number,
  "pronunciation": number,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "nextExercise": "string"
}
Scores are 0-100.`;

    const raw = await callChat([
      { role: "system", content: "You evaluate language speaking performance." },
      { role: "user", content: evalPrompt }
    ], 0.3);

    const fallback = {
      overallScore: 70,
      fluency: 68,
      accuracy: 72,
      vocabulary: 69,
      pronunciation: 71,
      strengths: ["Good effort maintaining conversation", "Useful everyday vocabulary"],
      improvements: ["Use more varied sentence structures", "Work on consistent verb forms"],
      nextExercise: "Retell your day in 8-10 sentences and ask 3 questions."
    };

    const evaluation = parseJsonOrFallback(raw, fallback);
    return res.json(evaluation);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to evaluate conversation." });
  }
});

app.get("/api/speech/token", async (req, res) => {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return res.status(400).json({ error: "Azure Speech is not configured." });
  }

  try {
    const tokenResponse = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return res.status(500).json({ error: `Speech token failed: ${errText}` });
    }

    const token = await tokenResponse.text();
    return res.json({ token, region });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to get speech token." });
  }
});

app.get("/api/avatar/relay", async (req, res) => {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return res.status(400).json({ error: "Azure Speech is not configured." });
  }

  try {
    const relayResponse = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": key
      }
    });

    if (!relayResponse.ok) {
      const errText = await relayResponse.text();
      return res.status(500).json({ error: `Avatar relay failed: ${errText}` });
    }

    const relay = await relayResponse.json();
    return res.json(relay);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to get avatar relay token." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Language learning app running at http://localhost:${port}`);
});
