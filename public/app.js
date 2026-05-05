const statusEl = document.getElementById("status");
const languageEl = document.getElementById("language");
const levelEl = document.getElementById("level");
const modeEl = document.getElementById("mode");
const generateBtn = document.getElementById("generateBtn");

const lessonPanel = document.getElementById("lessonPanel");
const lessonTitle = document.getElementById("lessonTitle");
const lessonObjective = document.getElementById("lessonObjective");
const topicChip = document.getElementById("topicChip");
const visualChip = document.getElementById("visualChip");
const modeContent = document.getElementById("modeContent");

const avatarCharacterEl = document.getElementById("avatarCharacter");
const avatarStyleEl = document.getElementById("avatarStyle");
const startAvatarBtn = document.getElementById("startAvatarBtn");
const avatarVideoEl = document.getElementById("avatarVideo");

let lesson = null;
let speechToken = null;
let speechRegion = null;
let avatarSynthesizer = null;

const state = {
  conversationHistory: [],
  transcriptLines: []
};

const localeMap = {
  english: "en-US",
  mandarin: "zh-CN",
  french: "fr-FR",
  japanese: "ja-JP",
  spanish: "es-ES"
};

const voiceMap = {
  english: "en-US-JennyNeural",
  mandarin: "zh-CN-XiaoxiaoNeural",
  french: "fr-FR-DeniseNeural",
  japanese: "ja-JP-NanamiNeural",
  spanish: "es-ES-ElviraNeural"
};

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#b8391f" : "#58574f";
}

async function fetchJSON(url, options) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

async function ensureSpeechToken() {
  if (speechToken && speechRegion) {
    return { token: speechToken, region: speechRegion };
  }

  const tokenData = await fetchJSON("/api/speech/token");
  speechToken = tokenData.token;
  speechRegion = tokenData.region;
  return tokenData;
}

function createSpeechConfig(tokenData, language) {
  const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenData.token, tokenData.region);
  speechConfig.speechRecognitionLanguage = localeMap[language];
  speechConfig.speechSynthesisLanguage = localeMap[language];
  speechConfig.speechSynthesisVoiceName = voiceMap[language];
  return speechConfig;
}

function renderLessonContent(data) {
  lessonTitle.textContent = data.title;
  lessonObjective.textContent = data.objective;
  topicChip.textContent = `Topic: ${data.topic}`;
  visualChip.textContent = `Visual idea: ${data.visualDirection}`;
  lessonPanel.hidden = false;
  modeContent.innerHTML = "";

  if (data.mode === "read") {
    renderReadMode(data);
  } else {
    renderConversationMode(data);
  }
}

function renderReadMode(data) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="card">
      <h3>Read aloud</h3>
      <p>${data.readMode.referenceText}</p>
      <p class="small">Tips: ${(data.readMode.hints || []).join(" | ")}</p>
      <div class="row">
        <button class="btn" id="startPronunciationBtn">Start Pronunciation Assessment</button>
      </div>
      <div id="pronunciationResult" class="card" hidden></div>
    </div>
  `;

  modeContent.appendChild(wrap);

  const startBtn = document.getElementById("startPronunciationBtn");
  const resultEl = document.getElementById("pronunciationResult");

  startBtn.addEventListener("click", async () => {
    startBtn.disabled = true;
    setStatus("Listening... please read the paragraph clearly.");

    try {
      const tokenData = await ensureSpeechToken();
      const speechConfig = createSpeechConfig(tokenData, data.language);
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

      const pronConfig = new SpeechSDK.PronunciationAssessmentConfig(
        data.readMode.referenceText,
        SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
        SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
        true
      );
      pronConfig.applyTo(recognizer);

      recognizer.recognizeOnceAsync(
        (result) => {
          const rawJson = result.properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult);
          const parsed = rawJson ? JSON.parse(rawJson) : {};
          const pa = parsed?.NBest?.[0]?.PronunciationAssessment || {};

          const accuracy = Math.round(pa.AccuracyScore || 0);
          const fluency = Math.round(pa.FluencyScore || 0);
          const completeness = Math.round(pa.CompletenessScore || 0);
          const prosody = Math.round(pa.ProsodyScore || 0);
          const overall = Math.round((accuracy + fluency + completeness + prosody) / 4);

          resultEl.hidden = false;
          resultEl.innerHTML = `
            <h3>Pronunciation Score</h3>
            <div class="score">
              <div class="kpi"><strong>Overall</strong><br/>${overall}</div>
              <div class="kpi"><strong>Accuracy</strong><br/>${accuracy}</div>
              <div class="kpi"><strong>Fluency</strong><br/>${fluency}</div>
              <div class="kpi"><strong>Completeness</strong><br/>${completeness}</div>
              <div class="kpi"><strong>Prosody</strong><br/>${prosody}</div>
            </div>
          `;

          setStatus("Pronunciation assessment complete.");
          recognizer.close();
          startBtn.disabled = false;
        },
        (error) => {
          setStatus(`Assessment failed: ${error}`, true);
          recognizer.close();
          startBtn.disabled = false;
        }
      );
    } catch (error) {
      setStatus(error.message, true);
      startBtn.disabled = false;
    }
  });
}

function pushBubble(container, text, role) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

async function speakText(text, language) {
  const tokenData = await ensureSpeechToken();
  const speechConfig = createSpeechConfig(tokenData, language);
  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);

  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      () => {
        synthesizer.close();
        resolve();
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
}

async function captureOneUtterance(language) {
  const tokenData = await ensureSpeechToken();
  const speechConfig = createSpeechConfig(tokenData, language);
  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      (result) => {
        const text = result.text?.trim();
        recognizer.close();
        if (!text) {
          reject(new Error("No speech recognized. Please try again."));
          return;
        }
        resolve(text);
      },
      (error) => {
        recognizer.close();
        reject(error);
      }
    );
  });
}

function renderConversationMode(data) {
  state.conversationHistory = [];
  state.transcriptLines = [];

  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="card">
      <h3>Conversation practice</h3>
      <p><strong>Scenario:</strong> ${data.conversationMode.scenario}</p>
      <p class="small">Tips: ${(data.conversationMode.tips || []).join(" | ")}</p>
      <div class="chat-box" id="chatBox"></div>
      <div class="row" style="margin-top: 10px;">
        <button class="btn" id="speakTurnBtn">Speak Your Turn</button>
        <button class="btn secondary" id="evaluateBtn">Finish and Score</button>
      </div>
      <label style="margin-top: 12px;">
        Fallback text input
        <textarea id="textTurn" rows="2" placeholder="Type your response if needed"></textarea>
      </label>
      <button class="btn" id="sendTextBtn">Send Text Turn</button>
      <div id="conversationScore" class="card" hidden></div>
    </div>
  `;

  modeContent.appendChild(wrap);

  const chatBox = document.getElementById("chatBox");
  const speakTurnBtn = document.getElementById("speakTurnBtn");
  const sendTextBtn = document.getElementById("sendTextBtn");
  const textTurn = document.getElementById("textTurn");
  const evaluateBtn = document.getElementById("evaluateBtn");
  const conversationScore = document.getElementById("conversationScore");

  const aiOpening = data.conversationMode.openingLine;
  pushBubble(chatBox, aiOpening, "ai");
  state.conversationHistory.push({ role: "assistant", content: aiOpening });
  state.transcriptLines.push(`AI: ${aiOpening}`);

  const processUserTurn = async (userText) => {
    pushBubble(chatBox, userText, "user");
    state.conversationHistory.push({ role: "user", content: userText });
    state.transcriptLines.push(`User: ${userText}`);

    setStatus("AI is replying...");

    const turn = await fetchJSON("/api/conversation-turn", {
      method: "POST",
      body: JSON.stringify({
        language: data.language,
        level: data.level,
        topic: data.topic,
        userMessage: userText,
        history: state.conversationHistory
      })
    });

    pushBubble(chatBox, turn.reply, "ai");
    state.conversationHistory.push({ role: "assistant", content: turn.reply });
    state.transcriptLines.push(`AI: ${turn.reply}`);
    await speakText(turn.reply, data.language);

    setStatus("Your turn again.");
  };

  speakTurnBtn.addEventListener("click", async () => {
    speakTurnBtn.disabled = true;
    try {
      setStatus("Listening for your turn...");
      const userSpeech = await captureOneUtterance(data.language);
      await processUserTurn(userSpeech);
    } catch (error) {
      setStatus(error.message || "Speech capture failed.", true);
    } finally {
      speakTurnBtn.disabled = false;
    }
  });

  sendTextBtn.addEventListener("click", async () => {
    const text = textTurn.value.trim();
    if (!text) {
      setStatus("Please type a message first.", true);
      return;
    }

    sendTextBtn.disabled = true;
    textTurn.value = "";
    try {
      await processUserTurn(text);
    } catch (error) {
      setStatus(error.message || "Turn failed.", true);
    } finally {
      sendTextBtn.disabled = false;
    }
  });

  evaluateBtn.addEventListener("click", async () => {
    evaluateBtn.disabled = true;
    try {
      setStatus("Scoring your conversation...");
      const transcript = state.transcriptLines.join("\n");
      const result = await fetchJSON("/api/evaluate-conversation", {
        method: "POST",
        body: JSON.stringify({
          language: data.language,
          level: data.level,
          transcript,
          topic: data.topic
        })
      });

      conversationScore.hidden = false;
      conversationScore.innerHTML = `
        <h3>Conversation Assessment</h3>
        <div class="score">
          <div class="kpi"><strong>Overall</strong><br/>${result.overallScore}</div>
          <div class="kpi"><strong>Fluency</strong><br/>${result.fluency}</div>
          <div class="kpi"><strong>Accuracy</strong><br/>${result.accuracy}</div>
          <div class="kpi"><strong>Vocabulary</strong><br/>${result.vocabulary}</div>
          <div class="kpi"><strong>Pronunciation</strong><br/>${result.pronunciation}</div>
        </div>
        <p><strong>Strengths:</strong> ${(result.strengths || []).join("; ")}</p>
        <p><strong>Improvements:</strong> ${(result.improvements || []).join("; ")}</p>
        <p><strong>Next Exercise:</strong> ${result.nextExercise || "Keep practicing with a new topic."}</p>
      `;

      setStatus("Conversation scored.");
    } catch (error) {
      setStatus(error.message || "Failed to score conversation.", true);
    } finally {
      evaluateBtn.disabled = false;
    }
  });
}

async function startAvatarSession() {
  if (!window.RTCPeerConnection) {
    throw new Error("WebRTC is not supported in this browser.");
  }

  const tokenData = await ensureSpeechToken();
  const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenData.token, tokenData.region);
  speechConfig.speechSynthesisVoiceName = voiceMap[languageEl.value];

  const relay = await fetchJSON("/api/avatar/relay");

  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: [relay.Urls?.[0] || relay.url], username: relay.Username || relay.username, credential: relay.Password || relay.password }]
  });

  peerConnection.ontrack = (event) => {
    const stream = event.streams[0];
    if (stream) {
      avatarVideoEl.srcObject = stream;
    }
  };

  peerConnection.addTransceiver("video", { direction: "sendrecv" });
  peerConnection.addTransceiver("audio", { direction: "sendrecv" });

  const avatarConfig = new SpeechSDK.AvatarConfig(avatarCharacterEl.value.trim(), avatarStyleEl.value.trim(), "fullbody");
  avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(speechConfig, avatarConfig);

  const result = await avatarSynthesizer.startAvatarAsync(peerConnection);
  if (result.reason !== SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
    throw new Error("Avatar failed to start. Check your Speech resource avatar capability.");
  }
}

generateBtn.addEventListener("click", async () => {
  generateBtn.disabled = true;
  setStatus("Generating lesson content...");

  try {
    lesson = await fetchJSON("/api/generate-content", {
      method: "POST",
      body: JSON.stringify({
        language: languageEl.value,
        level: levelEl.value,
        mode: modeEl.value
      })
    });

    renderLessonContent(lesson);
    setStatus("Lesson is ready. Start speaking.");
  } catch (error) {
    setStatus(error.message || "Failed to generate lesson.", true);
  } finally {
    generateBtn.disabled = false;
  }
});

startAvatarBtn.addEventListener("click", async () => {
  startAvatarBtn.disabled = true;
  try {
    setStatus("Starting avatar session...");
    await startAvatarSession();
    setStatus("Avatar started.");
  } catch (error) {
    setStatus(error.message || "Avatar could not start.", true);
  } finally {
    startAvatarBtn.disabled = false;
  }
});

setStatus("Choose language, level, and mode to begin.");
