const statusEl = document.getElementById("status");

const stepLanguage = document.getElementById("step-language");
const stepLevel = document.getElementById("step-level");
const stepTopic = document.getElementById("step-topic");
const stepMode = document.getElementById("step-mode");
const stepVoiceAvatar = document.getElementById("step-voice-avatar");
const languageCards = document.getElementById("languageCards");
const levelCards = document.getElementById("levelCards");
const topicCards = document.getElementById("topicCards");
const modeCards = document.getElementById("modeCards");
const voiceCardsEl = document.getElementById("voiceCards");
const avatarCardsEl = document.getElementById("avatarCards");
const backToLanguageBtn = document.getElementById("backToLanguage");
const backToLevelBtn = document.getElementById("backToLevel");
const backToTopicBtn = document.getElementById("backToTopic");
const backToModeBtn = document.getElementById("backToMode");
const startLessonBtn = document.getElementById("startLessonBtn");
const loadingOverlayEl = document.getElementById("loadingOverlay");
const restartBtn = document.getElementById("restartBtn");
const restartTopBtn = document.getElementById("restartTopBtn");

const wizardEl = document.getElementById("wizard");
const lessonAreaEl = document.getElementById("lessonArea");
const sessionTagsEl = document.getElementById("sessionTags");
const lessonTitleEl = document.getElementById("lessonTitle");
const lessonObjectiveEl = document.getElementById("lessonObjective");
const lessonChipsEl = document.getElementById("lessonChips");
const modeContentEl = document.getElementById("modeContent");

const visualImageEl = document.getElementById("visualImage");
const visualFallbackEl = document.getElementById("visualFallback");
const avatarOverlayEl = document.getElementById("avatarOverlay");
const subtitleLatestEl = document.getElementById("subtitleLatest");
const subtitleToggleEl = document.getElementById("subtitleToggle");
const subtitleHistoryWrapEl = document.getElementById("subtitleHistoryWrap");
const subtitleHistoryEl = document.getElementById("subtitleHistory");
const voiceSelectEl = document.getElementById("voiceSelect");
const avatarSelectEl = document.getElementById("avatarSelect");
const themeBtnEl = document.getElementById("themeBtn");
const avatarFallbackOrbEl = document.getElementById("avatarFallbackOrb");

const avatarVideoEl = document.getElementById("avatarVideo");

const languageEl = document.getElementById("language");
const levelEl = document.getElementById("level");
const modeEl = document.getElementById("mode");

let lesson = null;
let speechToken = null;
let speechRegion = null;
let avatarSynthesizer = null;
let avatarStarted = false;
const avatarProfile = { character: "lisa", style: "casual-sitting" };

const state = {
  language: "",
  level: "",
  topic: "",
  mode: "",
  selectedVoice: "",
  selectedAvatar: "lisa",
  conversationHistory: [],
  transcriptLines: [],
  subtitles: []
};

const topicOptions = [
  { value: "travel", icon: "✈️", label: "Travel", desc: "Airports, hotels, directions" },
  { value: "food", icon: "🍜", label: "Food & Dining", desc: "Ordering, restaurants, recipes" },
  { value: "friends", icon: "👫", label: "Friends & Family", desc: "Introductions, relationships" },
  { value: "hobbies", icon: "🎨", label: "Hobbies", desc: "Sports, music, reading" },
  { value: "shopping", icon: "🛍️", label: "Shopping", desc: "Stores, prices, bargaining" },
  { value: "work", icon: "💼", label: "Work & School", desc: "Office, studies, meetings" },
  { value: "health", icon: "🏥", label: "Health", desc: "Doctor, symptoms, pharmacy" },
  { value: "culture", icon: "🏛️", label: "Culture", desc: "Traditions, festivals, customs" },
  { value: "nature", icon: "🌿", label: "Nature & Weather", desc: "Seasons, outdoors, climate" },
  { value: "free", icon: "🎲", label: "Surprise me", desc: "AI picks the best topic" }
];

const localeMap = {
  english: "en-US",
  mandarin: "zh-CN",
  french: "fr-FR",
  japanese: "ja-JP",
  spanish: "es-ES"
};

const themePool = ["dark", "colorful", "clean"];

const universalVoiceOptions = [
  { id: "en-US-Jenny:DragonHDLatestNeural", label: "Jenny" },
  { id: "en-US-Ava:DragonHDLatestNeural", label: "Ava" },
  { id: "en-US-Emma:DragonHDLatestNeural", label: "Emma" },
  { id: "en-US-Andrew:DragonHDLatestNeural", label: "Andrew" },
  { id: "en-US-Brian:DragonHDLatestNeural", label: "Brian" },
  { id: "en-US-Davis:DragonHDLatestNeural", label: "Davis" },
  { id: "zh-CN-Xiaochen:DragonHDLatestNeural", label: "Xiaochen" },
  { id: "zh-CN-Yunfan:DragonHDLatestNeural", label: "Yunfan" },
  { id: "fr-FR-Vivienne:DragonHDLatestNeural", label: "Vivienne" },
  { id: "fr-FR-Remy:DragonHDLatestNeural", label: "Remy" },
  { id: "ja-JP-Nanami:DragonHDLatestNeural", label: "Nanami" },
  { id: "ja-JP-Masaru:DragonHDLatestNeural", label: "Masaru" },
  { id: "es-ES-Ximena:DragonHDLatestNeural", label: "Ximena" },
  { id: "es-ES-Tristan:DragonHDLatestNeural", label: "Tristan" }
];

const avatarStylePool = {
  lisa: ["casual-sitting"],
  lori: ["casual", "graceful", "formal"],
  meg: ["casual", "business", "formal"]
};

const labelMap = {
  language: {
    english: "English",
    mandarin: "Chinese (Mandarin)",
    french: "French",
    japanese: "Japanese",
    spanish: "Spanish"
  },
  level: {
    basic: "Basic",
    intermediate: "Intermediate",
    pro: "Pro"
  },
  mode: {
    read: "Read Aloud",
    conversation: "Conversation"
  }
};

let teacherSpeechQueue = Promise.resolve();

const uiCopy = {
  english: {
    speak: "Speak",
    stop: "Stop",
    readyPressSpeak: "Ready when you are. Press Speak.",
    stoppedTryAgain: "Stopped. Press Speak to try again.",
    listeningPrompt: "Listening now. Speak, then press Stop.",
    cannotHear: "I still can't hear you clearly. Please try again.",
    completedTryAgain: "Done. Press Speak to try again.",
    scoreFailed: "Speech could not be scored. Please try again.",
    setupFailed: "Speech setup failed. Please try again.",
    noLowWords: "No low-score words to practice.",
    drillStarted: "Teacher drill started.",
    drillComplete: "Word drill complete. Run the full assessment again to confirm improvement.",
    drillStopped: "Word drill stopped due to audio recognition error.",
    avatarReplying: "Avatar tutor is replying...",
    yourTurn: "Your turn.",
    noSpeechDetected: "No speech detected. Press Speak and try again.",
    processingResponse: "Got it. Processing your response...",
    readyNextTurn: "Ready. Press Speak for your next turn.",
    turnFailed: "Turn failed. Press Speak and try again.",
    captureFailed: "Speech capture failed. Press Speak to retry."
  },
  mandarin: {
    speak: "开始说话",
    stop: "停止",
    readyPressSpeak: "准备好了，点击 Speak 开始。",
    stoppedTryAgain: "已停止。点击 Speak 再试一次。",
    listeningPrompt: "正在听，请开始说话，说完后点击 Stop。",
    cannotHear: "还是听不清，请再说一次。",
    completedTryAgain: "已完成。点击 Speak 可再试一次。",
    scoreFailed: "评分失败，请再试一次。",
    setupFailed: "语音初始化失败，请再试一次。",
    noLowWords: "没有需要重点练习的低分单词。",
    drillStarted: "老师带练已开始。",
    drillComplete: "单词练习完成。请再次进行完整测评，确认分数提升。",
    drillStopped: "由于识别错误，单词练习已中断。",
    avatarReplying: "老师正在回复...",
    yourTurn: "轮到你了。",
    noSpeechDetected: "未检测到语音。点击 Speak 重试。",
    processingResponse: "收到，正在处理你的回答...",
    readyNextTurn: "准备好了，点击 Speak 开始下一轮。",
    turnFailed: "本轮处理失败。点击 Speak 再试一次。",
    captureFailed: "语音采集失败。点击 Speak 重试。"
  }
};

function uiText(key, language = state.language) {
  const locale = language === "mandarin" ? "mandarin" : "english";
  return uiCopy[locale]?.[key] || uiCopy.english[key] || "";
}

function setStatus(message, isError = false) {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff8f8f" : "#99a0c8";
}

function applyTheme(themeName) {
  document.body.dataset.theme = themeName;
}

function generateTheme() {
  const current = document.body.dataset.theme || "dark";
  const choices = themePool.filter((t) => t !== current);
  const nextTheme = choices[Math.floor(Math.random() * choices.length)];
  applyTheme(nextTheme);
  setStatus(`Theme updated: ${nextTheme}.`);
}

function sanitizeForSpeech(text) {
  return String(text || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`{1,3}([^`]*)`{1,3}/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*#+\s*/gm, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getDefaultVoiceForLanguage(language) {
  return universalVoiceOptions[0]?.id || "en-US-Jenny:DragonHDLatestNeural";
}

function getVoiceLocaleFromId(voiceId) {
  const prefix = String(voiceId || "").split(":")[0];
  const parts = prefix.split("-");
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return null;
}

function isAvatarAudioPlayable() {
  const hasStream = !!avatarVideoEl?.srcObject;
  const hasAudioTrack = !!avatarVideoEl?.srcObject?.getAudioTracks?.().length;
  return avatarStarted && avatarSynthesizer && hasStream && hasAudioTrack && !avatarVideoEl.muted;
}

function refreshVoiceOptions() {
  voiceSelectEl.innerHTML = "";

  universalVoiceOptions.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.id;
    option.textContent = voice.label;
    voiceSelectEl.appendChild(option);
  });

  if (!universalVoiceOptions.find((v) => v.id === state.selectedVoice)) {
    state.selectedVoice = getDefaultVoiceForLanguage(state.language);
  }

  voiceSelectEl.value = state.selectedVoice;
}

function populateVoiceCards() {
  voiceCardsEl.innerHTML = "";
  const voices = universalVoiceOptions;

  voices.forEach((voice) => {
    const btn = document.createElement("button");
    btn.className = "choice-card" + (state.selectedVoice === voice.id ? " active" : "");
    btn.dataset.value = voice.id;
    btn.innerHTML = `<span class="card-label">${voice.label}</span>`;
    voiceCardsEl.appendChild(btn);
  });

  if (!state.selectedVoice || !voices.find((v) => v.id === state.selectedVoice)) {
    state.selectedVoice = voices[0].id;
    voiceCardsEl.querySelector(".choice-card")?.classList.add("active");
  }
}

function chooseLessonAvatarStyle() {
  const avatar = state.selectedAvatar || "lisa";
  const styles = avatarStylePool[avatar] || avatarStylePool.lisa;
  const index = Math.floor(Math.random() * styles.length);
  avatarProfile.character = avatar;
  avatarProfile.style = styles[index];
}

function populateTopicCards() {
  topicCards.innerHTML = "";
  topicOptions.forEach((t) => {
    const btn = document.createElement("button");
    btn.className = "choice-card" + (state.topic === t.value ? " active" : "");
    btn.dataset.value = t.value;
    btn.innerHTML = `<span class="card-icon">${t.icon}</span><span class="card-label">${t.label}</span><span class="card-desc">${t.desc}</span>`;
    topicCards.appendChild(btn);
  });
}

function addSubtitle(speaker, text) {
  const cleaned = String(text || "").trim();
  if (!cleaned) {
    return;
  }

  const line = `${speaker}: ${cleaned}`;
  state.subtitles.push(line);

  const item = document.createElement("li");
  item.textContent = line;
  subtitleHistoryEl.prepend(item);
}

function resetSubtitles() {
  state.subtitles = [];
  subtitleHistoryEl.innerHTML = "";
  subtitleHistoryWrapEl.classList.add("hidden");
  subtitleToggleEl.textContent = "Show full conversation";
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
  const selectedVoice = state.selectedVoice || getDefaultVoiceForLanguage(language);
  speechConfig.speechRecognitionLanguage = localeMap[language];
  speechConfig.speechSynthesisLanguage = getVoiceLocaleFromId(selectedVoice) || localeMap[language];
  speechConfig.speechSynthesisVoiceName = selectedVoice;
  return speechConfig;
}

function resetWizard() {
  state.language = "";
  state.level = "";
  state.topic = "";
  state.mode = "";
  state.selectedAvatar = "lisa";
  state.selectedVoice = getDefaultVoiceForLanguage("english");
  lesson = null;
  teacherSpeechQueue = Promise.resolve();
  avatarStarted = false;
  hideStep(stepLevel);
  hideStep(stepTopic);
  hideStep(stepMode);
  hideStep(stepVoiceAvatar);
  showStep(stepLanguage);
  wizardEl.classList.remove("hidden");
  lessonAreaEl.classList.add("hidden");
  if (loadingOverlayEl) loadingOverlayEl.classList.add("hidden");
  avatarOverlayEl.classList.remove("live");
  if (avatarFallbackOrbEl) {
    avatarFallbackOrbEl.style.opacity = "0.7";
  }
  avatarVideoEl.srcObject = null;
  modeContentEl.innerHTML = "";
  sessionTagsEl.innerHTML = "";
  lessonChipsEl.innerHTML = "";
  resetSubtitles();
  refreshVoiceOptions();
  populateTopicCards();
  setStatus("Pick language, level, and mode to begin.");
}

function showStep(stepEl) {
  stepEl.classList.remove("hidden");
}

function hideStep(stepEl) {
  stepEl.classList.add("hidden");
}

function markSelected(container, value) {
  const buttons = container.querySelectorAll(".choice-card");
  buttons.forEach((btn) => {
    if (btn.dataset.value === value) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function renderSessionTags() {
  sessionTagsEl.innerHTML = "";
  const topicLabel = topicOptions.find((t) => t.value === state.topic)?.label || state.topic;
  const parts = [
    `Language: ${labelMap.language[state.language]}`,
    `Level: ${labelMap.level[state.level]}`,
    topicLabel ? `Topic: ${topicLabel}` : null,
    `Mode: ${labelMap.mode[state.mode]}`
  ].filter(Boolean);

  for (const p of parts) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = p;
    sessionTagsEl.appendChild(chip);
  }
}

function setVisualScene(visualDirection, topic) {
  const prompt = `${visualDirection}. ${topic}. Clean 2D anime illustration, highly detailed masterpiece, sharp crisp lines, cool blue-green daylight lighting, desaturated warm tones, muted earth tones, no yellow, no orange, no brown, no warm cast, no sepia. IMPORTANT: absolutely no text, no letters, no words, no numbers, no signs, no posters, no written content, no captions, no labels anywhere in the image. Pure illustration only. Wide cinematic 16:9 scene.`;
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&model=flux&nologo=true&negative=text%2C+words%2C+letters%2C+signs%2C+typography%2C+yellow%2C+orange%2C+warm`;

  visualImageEl.src = imageUrl;
  visualImageEl.hidden = false;
  visualFallbackEl.hidden = true;

  visualImageEl.onerror = () => {
    visualImageEl.hidden = true;
    visualFallbackEl.hidden = false;
  };
}

async function generateLesson() {
  setStatus("Generating your lesson...");
  if (loadingOverlayEl) loadingOverlayEl.classList.remove("hidden");
  try {
    lesson = await fetchJSON("/api/generate-content", {
      method: "POST",
      body: JSON.stringify({
        language: state.language,
        level: state.level,
        mode: state.mode,
        topic: state.topic || "free"
      })
    });

    languageEl.value = state.language;
    levelEl.value = state.level;
    modeEl.value = state.mode;

    lessonTitleEl.textContent = lesson.title;
    lessonObjectiveEl.textContent = lesson.objective;

    lessonChipsEl.innerHTML = "";
    for (const text of [`Topic: ${lesson.topic}`]) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = text;
      lessonChipsEl.appendChild(chip);
    }

    setVisualScene(lesson.visualDirection, lesson.topic);
    renderSessionTags();
    chooseLessonAvatarStyle();

    wizardEl.classList.add("hidden");
    lessonAreaEl.classList.remove("hidden");
    if (loadingOverlayEl) loadingOverlayEl.classList.add("hidden");
    modeContentEl.innerHTML = "";

    if (lesson.mode === "read") {
      renderReadMode(lesson);
      await tryAutoStartAvatar();
      // Speak reference text in target language only
      speakByAvatarOrTts(lesson.readMode.referenceText, lesson.language, "Teacher").catch(() => {});
    } else {
      renderConversationMode(lesson);
      await tryAutoStartAvatar();
      // Speak AI opening line in target language only — no English intro
      speakByAvatarOrTts(lesson.conversationMode.openingLine, lesson.language, "Teacher").catch(() => {});
    }

    setStatus("Lesson ready.");
  } catch (error) {
    if (loadingOverlayEl) loadingOverlayEl.classList.add("hidden");
    setStatus(error.message || "Failed to generate lesson.", true);
  }
}

function renderReadMode(data) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="card">
      <h3>Read Aloud Challenge</h3>
      <p class="reading-text">${data.readMode.referenceText}</p>
      <p class="small">Tips: ${(data.readMode.hints || []).join(" | ")}</p>
      <div class="row">
        <button class="btn pron-speak-btn" id="startPronunciationBtn" type="button">Speak</button>
        <span class="inline-note" id="pronInlineNote">${uiText("readyPressSpeak", data.language)}</span>
      </div>
      <div id="pronunciationResult" class="card" hidden></div>
      <div id="wordDrillPanel" class="card" hidden>
        <h3>Teacher Pronunciation Drill</h3>
        <p id="wordDrillHint" class="small"></p>
        <div class="row">
          <button class="btn secondary" id="startWordDrillBtn">Practice Incorrect Words</button>
        </div>
        <p id="wordDrillProgress" class="small"></p>
      </div>
    </div>
  `;

  modeContentEl.appendChild(wrap);

  const startBtn = document.getElementById("startPronunciationBtn");
  const resultEl = document.getElementById("pronunciationResult");
  const pronInlineNoteEl = document.getElementById("pronInlineNote");
  const wordDrillPanelEl = document.getElementById("wordDrillPanel");
  const wordDrillHintEl = document.getElementById("wordDrillHint");
  const wordDrillProgressEl = document.getElementById("wordDrillProgress");
  const startWordDrillBtn = document.getElementById("startWordDrillBtn");
  let lowWords = [];
  let activePronRecognizer = null;
  let isPronListening = false;
  let pronCancelled = false;
  let noSpeechReminderTimer = null;

  function setPronunciationButtonState(listening) {
    isPronListening = listening;
    startBtn.classList.toggle("listening", listening);
    startBtn.textContent = listening ? uiText("stop", data.language) : uiText("speak", data.language);
    startBtn.setAttribute("aria-pressed", listening ? "true" : "false");
  }

  function stopPronunciationListening() {
    pronCancelled = true;
    setPronunciationButtonState(false);
    pronInlineNoteEl.textContent = uiText("stoppedTryAgain", data.language);

    if (noSpeechReminderTimer) {
      clearTimeout(noSpeechReminderTimer);
      noSpeechReminderTimer = null;
    }

    if (activePronRecognizer) {
      activePronRecognizer.close();
      activePronRecognizer = null;
    }
  }

  startBtn.addEventListener("click", async () => {
    if (isPronListening) {
      stopPronunciationListening();
      return;
    }

    pronCancelled = false;
    setPronunciationButtonState(true);
    pronInlineNoteEl.textContent = uiText("listeningPrompt", data.language);

    noSpeechReminderTimer = setTimeout(async () => {
      if (!isPronListening || pronCancelled) {
        return;
      }

      pronInlineNoteEl.textContent = uiText("cannotHear", data.language);
      await speakByAvatarOrTts(uiText("cannotHear", data.language), data.language, "Teacher");
    }, 20000);

    try {
      const tokenData = await ensureSpeechToken();
      const speechConfig = createSpeechConfig(tokenData, data.language);
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      activePronRecognizer = recognizer;

      const pronConfig = new SpeechSDK.PronunciationAssessmentConfig(
        data.readMode.referenceText,
        SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
        SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
        true
      );
      pronConfig.applyTo(recognizer);

      recognizer.recognizeOnceAsync(
        (result) => {
          if (pronCancelled) {
            recognizer.close();
            return;
          }

          const rawJson = result.properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult);
          const parsed = rawJson ? JSON.parse(rawJson) : {};
          const pa = parsed?.NBest?.[0]?.PronunciationAssessment || {};

          const accuracy = Math.round(pa.AccuracyScore || 0);
          const fluency = Math.round(pa.FluencyScore || 0);
          const completeness = Math.round(pa.CompletenessScore || 0);
          const prosody = Math.round(pa.ProsodyScore || 0);
          const overall = Math.round((accuracy + fluency + completeness + prosody) / 4);
          const words = parsed?.NBest?.[0]?.Words || [];

          lowWords = words
            .map((w) => ({
              word: String(w?.Word || "").trim(),
              score: Math.round(w?.PronunciationAssessment?.AccuracyScore || 0)
            }))
            .filter((w) => w.word && w.score < 75)
            .slice(0, 8);

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
            ${lowWords.length > 0 ? `<p><strong>Needs practice:</strong> ${lowWords.map((x) => `${x.word} (${x.score})`).join(", ")}</p>` : "<p><strong>Great work:</strong> No low-score words detected in this attempt.</p>"}
          `;

          if (noSpeechReminderTimer) {
            clearTimeout(noSpeechReminderTimer);
            noSpeechReminderTimer = null;
          }

          pronInlineNoteEl.textContent = uiText("completedTryAgain", data.language);
          const summarySpeech = `Assessment completed. Overall score ${overall}. Accuracy ${accuracy}, fluency ${fluency}, completeness ${completeness}, prosody ${prosody}.`;

          if (lowWords.length > 0) {
            wordDrillPanelEl.hidden = false;
            wordDrillHintEl.textContent = "I found a few words with low pronunciation scores. I will coach you to repeat each one until your score improves.";
            wordDrillProgressEl.textContent = "Ready for guided word drill.";
            speakByAvatarOrTts(`${summarySpeech} Words to improve are: ${lowWords.map((x) => x.word).join(", ")}.`, data.language, "Teacher").catch(() => {});
          } else {
            wordDrillPanelEl.hidden = true;
            speakByAvatarOrTts(`${summarySpeech} Great work. No low-score words detected.`, data.language, "Teacher").catch(() => {});
          }

          activePronRecognizer = null;
          setPronunciationButtonState(false);
          recognizer.close();
        },
        (error) => {
          if (pronCancelled) {
            return;
          }

          if (noSpeechReminderTimer) {
            clearTimeout(noSpeechReminderTimer);
            noSpeechReminderTimer = null;
          }

          pronInlineNoteEl.textContent = uiText("scoreFailed", data.language);
          activePronRecognizer = null;
          setPronunciationButtonState(false);
          recognizer.close();
        }
      );
    } catch (error) {
      if (noSpeechReminderTimer) {
        clearTimeout(noSpeechReminderTimer);
        noSpeechReminderTimer = null;
      }

      pronInlineNoteEl.textContent = uiText("setupFailed", data.language);
      activePronRecognizer = null;
      setPronunciationButtonState(false);
    }
  });

  startWordDrillBtn.addEventListener("click", async () => {
    if (lowWords.length === 0) {
      wordDrillProgressEl.textContent = uiText("noLowWords", data.language);
      return;
    }

    startWordDrillBtn.disabled = true;
    setStatus(uiText("drillStarted", data.language));

    try {
      for (let i = 0; i < lowWords.length; i += 1) {
        const item = lowWords[i];
        let best = item.score;
        let attempt = 0;

        while (best < 80 && attempt < 4) {
          attempt += 1;
          wordDrillProgressEl.textContent = `Word ${i + 1}/${lowWords.length}: ${item.word}. Attempt ${attempt}.`;
          await speakByAvatarOrTts(`Repeat after me. ${item.word}. Say it three times clearly.`, data.language, "Teacher");

          const wordScore = await assessSingleWord(item.word, data.language);
          best = Math.max(best, wordScore);

          if (wordScore >= 80) {
            await speakByAvatarOrTts(`Great. ${item.word} is now clearer.`, data.language, "Teacher");
          } else {
            await speakByAvatarOrTts(`Good try. Let's repeat ${item.word} again. Focus on each syllable.`, data.language, "Teacher");
          }
        }
      }

      wordDrillProgressEl.textContent = uiText("drillComplete", data.language);
      await speakByAvatarOrTts("Great job. Word drill completed. Please run pronunciation assessment one more time to see your improved score.", data.language, "Teacher");
    } catch (error) {
      wordDrillProgressEl.textContent = uiText("drillStopped", data.language);
      setStatus(error.message || "Word drill failed.", true);
    } finally {
      startWordDrillBtn.disabled = false;
    }
  });
}

async function assessSingleWord(word, language) {
  const tokenData = await ensureSpeechToken();
  const speechConfig = createSpeechConfig(tokenData, language);
  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

  const pronConfig = new SpeechSDK.PronunciationAssessmentConfig(
    word,
    SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
    SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
    true
  );
  pronConfig.applyTo(recognizer);

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      (result) => {
        const rawJson = result.properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult);
        const parsed = rawJson ? JSON.parse(rawJson) : {};
        const score = Math.round(parsed?.NBest?.[0]?.PronunciationAssessment?.AccuracyScore || 0);
        recognizer.close();
        resolve(score);
      },
      (error) => {
        recognizer.close();
        reject(error);
      }
    );
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

async function speakByAvatarOrTts(text, language, speaker = "Teacher") {
  const spokenText = sanitizeForSpeech(text);
  if (!spokenText) {
    return;
  }

  const speakTask = async () => {
    addSubtitle(speaker, spokenText);

    if (isAvatarAudioPlayable()) {
      try {
        await avatarSynthesizer.speakTextAsync(spokenText);
        return;
      } catch {
        // Silent fallback to keep teacher always on for user experience.
      }
    }

    await speakText(spokenText, language);
  };

  teacherSpeechQueue = teacherSpeechQueue.then(speakTask, speakTask);
  return teacherSpeechQueue;
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
          reject(new Error("No speech recognized. Try again."));
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
      <h3>Avatar Conversation Practice</h3>
      <p><strong>Scenario:</strong> ${data.conversationMode.scenario}</p>
      <p class="small">Tips: ${(data.conversationMode.tips || []).join(" | ")}</p>

      <div class="chat-box" id="chatBox"></div>

      <div class="row" style="margin-top: 12px;">
        <button class="btn pron-speak-btn" id="speakTurnBtn" type="button">Speak</button>
        <span class="inline-note" id="convoInlineNote">${uiText("readyPressSpeak", data.language)}</span>
        <button class="btn secondary" id="evaluateBtn">Finish and Score</button>
      </div>

      <label style="margin-top: 12px;">
        Text fallback
        <textarea id="textTurn" rows="2" placeholder="Type your response if speaking is unavailable"></textarea>
      </label>
      <button class="btn" id="sendTextBtn">Send Text Turn</button>

      <div id="conversationScore" class="card" hidden></div>
    </div>
  `;

  modeContentEl.appendChild(wrap);

  const chatBox = document.getElementById("chatBox");
  const speakTurnBtn = document.getElementById("speakTurnBtn");
  const convoInlineNoteEl = document.getElementById("convoInlineNote");
  const sendTextBtn = document.getElementById("sendTextBtn");
  const textTurn = document.getElementById("textTurn");
  const evaluateBtn = document.getElementById("evaluateBtn");
  const conversationScore = document.getElementById("conversationScore");
  let activeConversationRecognizer = null;
  let isConversationListening = false;
  let conversationCancelled = false;
  let conversationReminderTimer = null;

  function setConversationButtonState(listening) {
    isConversationListening = listening;
    speakTurnBtn.classList.toggle("listening", listening);
    speakTurnBtn.textContent = listening ? uiText("stop", data.language) : uiText("speak", data.language);
    speakTurnBtn.setAttribute("aria-pressed", listening ? "true" : "false");
  }

  function stopConversationListening() {
    conversationCancelled = true;
    if (conversationReminderTimer) {
      clearTimeout(conversationReminderTimer);
      conversationReminderTimer = null;
    }
    if (activeConversationRecognizer) {
      activeConversationRecognizer.close();
      activeConversationRecognizer = null;
    }
    setConversationButtonState(false);
    convoInlineNoteEl.textContent = uiText("stoppedTryAgain", data.language);
  }

  const aiOpening = data.conversationMode.openingLine;

  pushBubble(chatBox, aiOpening, "ai");
  state.conversationHistory.push({ role: "assistant", content: aiOpening });
  state.transcriptLines.push(`AI: ${aiOpening}`);

  const processUserTurn = async (userText) => {
    pushBubble(chatBox, userText, "user");
    state.conversationHistory.push({ role: "user", content: userText });
    state.transcriptLines.push(`User: ${userText}`);

    setStatus(uiText("avatarReplying", data.language));

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

    await speakByAvatarOrTts(turn.reply, data.language, "Teacher");

    setStatus(uiText("yourTurn", data.language));
  };

  speakTurnBtn.addEventListener("click", async () => {
    if (isConversationListening) {
      stopConversationListening();
      return;
    }

    conversationCancelled = false;
    setConversationButtonState(true);
    convoInlineNoteEl.textContent = uiText("listeningPrompt", data.language);

    conversationReminderTimer = setTimeout(async () => {
      if (!isConversationListening || conversationCancelled) {
        return;
      }

      convoInlineNoteEl.textContent = uiText("cannotHear", data.language);
      await speakByAvatarOrTts(uiText("cannotHear", data.language), data.language, "Teacher");
    }, 20000);

    try {
      const tokenData = await ensureSpeechToken();
      const speechConfig = createSpeechConfig(tokenData, data.language);
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      activeConversationRecognizer = recognizer;

      recognizer.recognizeOnceAsync(
        async (result) => {
          if (conversationCancelled) {
            recognizer.close();
            return;
          }

          if (conversationReminderTimer) {
            clearTimeout(conversationReminderTimer);
            conversationReminderTimer = null;
          }

          const userSpeech = result.text?.trim();
          recognizer.close();
          activeConversationRecognizer = null;
          setConversationButtonState(false);

          if (!userSpeech) {
            convoInlineNoteEl.textContent = uiText("noSpeechDetected", data.language);
            return;
          }

          convoInlineNoteEl.textContent = uiText("processingResponse", data.language);
          try {
            await processUserTurn(userSpeech);
            convoInlineNoteEl.textContent = uiText("readyNextTurn", data.language);
          } catch (error) {
            convoInlineNoteEl.textContent = uiText("turnFailed", data.language);
            setStatus(error.message || "Turn failed.", true);
          }
        },
        (error) => {
          if (conversationCancelled) {
            return;
          }
          if (conversationReminderTimer) {
            clearTimeout(conversationReminderTimer);
            conversationReminderTimer = null;
          }
          recognizer.close();
          activeConversationRecognizer = null;
          setConversationButtonState(false);
          convoInlineNoteEl.textContent = uiText("captureFailed", data.language);
        }
      );
    } catch (error) {
      if (conversationReminderTimer) {
        clearTimeout(conversationReminderTimer);
        conversationReminderTimer = null;
      }
      activeConversationRecognizer = null;
      setConversationButtonState(false);
      convoInlineNoteEl.textContent = uiText("setupFailed", data.language);
    }
  });

  sendTextBtn.addEventListener("click", async () => {
    const text = textTurn.value.trim();
    if (!text) {
      setStatus("Type a message first.", true);
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

      const summarySpeech = `Session summary. Overall score ${result.overallScore}. Fluency ${result.fluency}, accuracy ${result.accuracy}, vocabulary ${result.vocabulary}, pronunciation ${result.pronunciation}. Strong points: ${(result.strengths || []).join(". ")}. Improvements: ${(result.improvements || []).join(". ")}. Next exercise: ${result.nextExercise || "Keep practicing with a new topic."}.`;
      await speakByAvatarOrTts(summarySpeech, data.language, "Teacher");

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

  if (avatarSynthesizer) {
    try {
      avatarSynthesizer.close();
    } catch {
      // Ignore close failures and continue with a fresh session.
    }
    avatarSynthesizer = null;
  }

  avatarStarted = false;
  avatarOverlayEl.classList.remove("live");

  const tokenData = await ensureSpeechToken();
  const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenData.token, tokenData.region);
  const selectedVoice = state.selectedVoice || getDefaultVoiceForLanguage(state.language || "english");
  speechConfig.speechSynthesisLanguage = getVoiceLocaleFromId(selectedVoice) || localeMap[state.language] || "en-US";
  speechConfig.speechSynthesisVoiceName = selectedVoice;

  const relay = await fetchJSON("/api/avatar/relay");

  const peerConnection = new RTCPeerConnection({
    iceServers: [{
      urls: [relay.Urls?.[0] || relay.url],
      username: relay.Username || relay.username,
      credential: relay.Password || relay.password
    }]
  });

  peerConnection.ontrack = (event) => {
    const stream = event.streams[0];
    if (stream) {
      avatarVideoEl.srcObject = stream;
      avatarVideoEl.muted = false;
      avatarVideoEl.volume = 1;
      avatarVideoEl.play().catch(() => {});
    }
  };

  peerConnection.addTransceiver("video", { direction: "sendrecv" });
  peerConnection.addTransceiver("audio", { direction: "sendrecv" });

  const avatarConfig = new SpeechSDK.AvatarConfig(avatarProfile.character, avatarProfile.style, "fullbody");
  avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(speechConfig, avatarConfig);

  const result = await avatarSynthesizer.startAvatarAsync(peerConnection);
  if (result.reason !== SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
    throw new Error("Avatar failed to start. Check avatar capability on your Speech resource.");
  }

  avatarStarted = true;
  avatarOverlayEl.classList.add("live");
}

async function tryAutoStartAvatar() {
  try {
    await startAvatarSession();
    if (avatarFallbackOrbEl) {
      avatarFallbackOrbEl.style.opacity = "0";
    }
    setStatus("Avatar is live.");
  } catch (error) {
    const currentAvatar = avatarProfile.character;
    if (currentAvatar !== "lisa") {
      avatarProfile.character = "lisa";
      avatarProfile.style = "casual-sitting";
      try {
        await startAvatarSession();
        if (avatarFallbackOrbEl) {
          avatarFallbackOrbEl.style.opacity = "0";
        }
        setStatus("Avatar updated to default.");
        return;
      } catch (fallbackError) {
        // Silent fallback to voice only
      }
    }
    avatarStarted = false;
    avatarOverlayEl.classList.remove("live");
    if (avatarFallbackOrbEl) {
      avatarFallbackOrbEl.style.opacity = "0.7";
    }
  }
}

languageCards.addEventListener("click", (event) => {
  const card = event.target.closest(".choice-card");
  if (!card) {
    return;
  }

  state.language = card.dataset.value;
  refreshVoiceOptions();
  markSelected(languageCards, state.language);
  hideStep(stepLanguage);
  showStep(stepLevel);
});

levelCards.addEventListener("click", (event) => {
  const card = event.target.closest(".choice-card");
  if (!card) {
    return;
  }

  state.level = card.dataset.value;
  markSelected(levelCards, state.level);
  populateTopicCards();
  hideStep(stepLevel);
  showStep(stepTopic);
});

topicCards.addEventListener("click", (event) => {
  const card = event.target.closest(".choice-card");
  if (!card) return;
  state.topic = card.dataset.value;
  markSelected(topicCards, state.topic);
  hideStep(stepTopic);
  showStep(stepMode);
});

backToTopicBtn.addEventListener("click", () => {
  hideStep(stepMode);
  showStep(stepTopic);
});

modeCards.addEventListener("click", (event) => {
  const card = event.target.closest(".choice-card");
  if (!card) {
    return;
  }

  state.mode = card.dataset.value;
  markSelected(modeCards, state.mode);
  hideStep(stepMode);
  populateVoiceCards();
  // default avatar pre-select
  if (!state.selectedAvatar) state.selectedAvatar = "lisa";
  markSelected(avatarCardsEl, state.selectedAvatar);
  showStep(stepVoiceAvatar);
});

voiceCardsEl.addEventListener("click", (event) => {
  const card = event.target.closest(".choice-card");
  if (!card) return;
  state.selectedVoice = card.dataset.value;
  voiceSelectEl.value = state.selectedVoice;
  markSelected(voiceCardsEl, state.selectedVoice);
});

avatarCardsEl.addEventListener("click", (event) => {
  const card = event.target.closest(".choice-card");
  if (!card) return;
  state.selectedAvatar = card.dataset.value;
  avatarSelectEl.value = state.selectedAvatar;
  markSelected(avatarCardsEl, state.selectedAvatar);
});

backToModeBtn.addEventListener("click", () => {
  hideStep(stepVoiceAvatar);
  showStep(stepMode);
});

startLessonBtn.addEventListener("click", () => {
  hideStep(stepVoiceAvatar);
  generateLesson();
});

backToLanguageBtn.addEventListener("click", () => {
  hideStep(stepLevel);
  showStep(stepLanguage);
});

backToLevelBtn.addEventListener("click", () => {
  hideStep(stepTopic);
  showStep(stepLevel);
});

if (restartBtn) {
  restartBtn.addEventListener("click", resetWizard);
}

if (restartTopBtn) {
  restartTopBtn.addEventListener("click", resetWizard);
}

subtitleToggleEl.addEventListener("click", () => {
  const hidden = subtitleHistoryWrapEl.classList.contains("hidden");
  if (hidden) {
    subtitleHistoryWrapEl.classList.remove("hidden");
    subtitleToggleEl.textContent = "Hide conversation";
  } else {
    subtitleHistoryWrapEl.classList.add("hidden");
    subtitleToggleEl.textContent = "Show full conversation";
  }
});

voiceSelectEl.addEventListener("change", async () => {
  state.selectedVoice = voiceSelectEl.value;
  setStatus("Voice updated.");

  if (lesson) {
    try {
      await tryAutoStartAvatar();
      setStatus("Voice updated for current lesson.");
    } catch (error) {
      avatarStarted = false;
      avatarOverlayEl.classList.remove("live");
    }
  }
});

avatarSelectEl.addEventListener("change", async () => {
  state.selectedAvatar = avatarSelectEl.value;

  if (!lesson) {
    setStatus("Avatar updated.");
    return;
  }

  chooseLessonAvatarStyle();
  await tryAutoStartAvatar();
  setStatus("Avatar updated for current lesson.");
});

if (themeBtnEl) {
  themeBtnEl.addEventListener("click", generateTheme);
}

applyTheme("dark");

resetWizard();
