// Initialize speech recognition -
// params:
// onResult: callback when speech recognition results are available
// onError: callback when speech recognition error occurs
// onEnd: callback when speech recognition ends
// returns the recognition object
export function initializeSpeechRecognition(onResult, onError, onEnd) {
  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    throw new Error("Speech recognition not supported in this browser");
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    if (onResult) {
      onResult({
        interim: interimTranscript,
        final: finalTranscript.trim(),
      });
    }
  };

  recognition.onerror = (event) => {
    let errorMessage = "Speech recognition error";
    if (event.error === "no-speech") {
      errorMessage = "No speech detected";
    } else if (event.error === "audio-capture") {
      errorMessage = "No microphone found";
    } else if (event.error === "not-allowed") {
      errorMessage = "Microphone access denied";
    } else if (event.error) {
      errorMessage = `Speech recognition error: ${event.error}`;
    }

    if (onError) {
      onError(errorMessage);
    }
  };

  recognition.onend = () => {
    if (onEnd) {
      onEnd();
    }
  };

  return recognition;
}

// params:
// text: text to speak
// onStart: callback when speech starts
// onEnd: callback when speech ends
// voiceName: optional voice name to use
// returns the utterance object
export function speakText(text, onStart, onEnd, voiceName = null) {
  if (!("speechSynthesis" in window)) {
    throw new Error("Speech synthesis not supported in this browser");
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Get available voices
  const voices = window.speechSynthesis.getVoices();

  // Use specified voice or find a default
  let selectedVoice = null;
  if (voiceName) {
    selectedVoice = voices.find((voice) => voice.name === voiceName);
  }

  // Fallback to preferred voice if specified voice not found
  if (!selectedVoice) {
    selectedVoice =
      voices.find((voice) => voice.name.includes("Google")) ||
      voices.find((voice) => voice.name.includes("Samantha")) ||
      voices.find((voice) => voice.lang.startsWith("en"));
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onstart = () => {
    if (onStart) {
      onStart();
    }
  };

  utterance.onend = () => {
    if (onEnd) {
      onEnd();
    }
  };

  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event);
  };

  window.speechSynthesis.speak(utterance);

  return utterance;
}

// function to stop speaking
export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

// function to check if speech recognition is available
export function isSpeechRecognitionAvailable() {
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

// function to check if speech synthesis is available
export function isSpeechSynthesisAvailable() {
  return "speechSynthesis" in window;
}
