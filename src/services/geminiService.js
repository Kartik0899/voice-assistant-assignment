import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatErrorMessage } from "../utils/errorUtils";

let apiKey = null;
let genAI = null;
let model = null;
let conversationHistory = [];
let onTranscript = null;
let onError = null;

// The below function is used to connect to the Gemini API
// params:
// onTranscriptCallback: callback when transcript is available
// onErrorCallback: callback when error occurs
// onConnectionChange: callback when connection status changes
// returns the connection status
async function connect(
  onTranscriptCallback,
  onErrorCallback,
  onConnectionChange
) {
  const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!envApiKey) {
    throw new Error(
      "Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file."
    );
  }

  apiKey = envApiKey;
  onTranscript = onTranscriptCallback;
  onError = onErrorCallback;
  conversationHistory = [];

  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  onConnectionChange("connected");
}

// This function is used to send a text message to the Gemini API
// params:
// text: text to send
// returns the full response
async function sendTextMessage(text) {
  if (!apiKey || !model) {
    if (!genAI) {
      genAI = new GoogleGenerativeAI(apiKey);
      model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
      });
    }
  }

  try {
    // Build prompt with conversation history
    let prompt = text;
    if (conversationHistory.length > 0) {
      const context = conversationHistory
        .slice(-4)
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Assistant"}: ${
              msg.parts[0].text
            }`
        )
        .join("\n");
      prompt = context + `\nUser: ${text}\nAssistant:`;
    }

    const result = await model.generateContent(prompt);
    const fullResponse = result.response.text();

    // Save to history
    conversationHistory.push({ role: "user", parts: [{ text }] });
    conversationHistory.push({
      role: "model",
      parts: [{ text: fullResponse }],
    });

    // Simulate streaming
    if (onTranscript) {
      const words = fullResponse.split(" ");
      let accumulated = "";
      for (let i = 0; i < words.length; i++) {
        accumulated += (i > 0 ? " " : "") + words[i];
        onTranscript({
          delta: words[i] + (i < words.length - 1 ? " " : ""),
          text: accumulated,
        });
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      // Only send final if we have content and it's different from last accumulated
      if (fullResponse.trim()) {
        onTranscript({ text: fullResponse, isFinal: true });
      }
    }

    return fullResponse;
  } catch (error) {
    const errorMessage = formatErrorMessage(error);
    if (onError) onError(errorMessage);
    throw new Error(errorMessage);
  }
}

// This function is used to disconnect from the Gemini API
function disconnect() {
  conversationHistory = [];
}

// Exporting the functions
export { connect, sendTextMessage, disconnect };
