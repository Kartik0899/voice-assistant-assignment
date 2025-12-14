import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setListening,
  setSpeaking,
  setProcessing,
  setMicrophoneAccess,
  setAudioError,
} from "../store/slices/audioSlice";
import {
  addMessage,
  setLoading,
  setError,
  updateLastMessage,
} from "../store/slices/chatSlice";
import { setConnectionStatus } from "../store/slices/uiSlice";
import VoiceSelector from "./VoiceSelector";
import { requestMicrophoneAccess } from "../utils/audioUtils";
import {
  initializeSpeechRecognition,
  speakText,
  stopSpeaking,
  isSpeechRecognitionAvailable,
} from "../utils/speechUtils";
import {
  connect,
  sendTextMessage,
  disconnect,
} from "../services/geminiService";
import ChatInterface from "./ChatInterface";
import WaveformAnimation from "./WaveformAnimation";
import StatusIndicator from "./StatusIndicator";
import ErrorMessage from "./ErrorMessage";
import "./VoiceAssistant.css";

const VoiceAssistant = () => {
  const dispatch = useDispatch();
  const {
    isListening,
    isSpeaking,
    isProcessing,
    error: audioError,
  } = useSelector((state) => state.audio);
  const { messages, isLoading } = useSelector((state) => state.chat);
  const { connectionStatus, selectedVoice } = useSelector((state) => state.ui);

  const [isInitialized, setIsInitialized] = useState(false);
  const speechRecognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const isStreamingRef = useRef(false);
  const greetingTimeoutRef = useRef(null);

  // Handle streaming response, use of useCallback to prevent recreation
  const handleTranscript = useCallback(
    (data) => {
      if (!data || typeof data !== "object") return;

      if (data.isFinal && data.text) {
        if (isStreamingRef.current) {
          dispatch(
            updateLastMessage({ content: data.text, isStreaming: false })
          );
        } else {
          // here this will add a new message if no streaming message exists
          dispatch(
            addMessage({
              id: Date.now(),
              role: "assistant",
              content: data.text,
              timestamp: new Date().toISOString(),
              isStreaming: false,
            })
          );
        }
        isStreamingRef.current = false;
        dispatch(setLoading(false));
        dispatch(setProcessing(false));
        dispatch(setSpeaking(true));
        speakText(
          data.text,
          null,
          () => dispatch(setSpeaking(false)),
          selectedVoice
        );
      } else if (data.delta || data.text) {
        const text = data.text || data.delta || "";

        if (!isStreamingRef.current) {
          // Start new streaming message
          isStreamingRef.current = true;
          dispatch(
            addMessage({
              id: Date.now(),
              role: "assistant",
              content: text,
              timestamp: new Date().toISOString(),
              isStreaming: true,
            })
          );
        } else {
          dispatch(updateLastMessage({ content: text, isStreaming: true }));
        }
      }
    },
    [dispatch, selectedVoice]
  );

  const processUserInput = async (text) => {
    if (!text.trim()) return;
    // Here we are resetting the streaming state for new message
    isStreamingRef.current = false;
    dispatch(
      addMessage({
        id: Date.now(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      })
    );
    dispatch(setLoading(true));
    dispatch(setProcessing(true));

    try {
      await sendTextMessage(text);
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      dispatch(setProcessing(false));
      isStreamingRef.current = false;
    }
  };

  // Voice recording handlers, handleStartRecording is used to start the recording
  const handleStartRecording = () => {
    if (!speechRecognitionRef.current) {
      speechRecognitionRef.current = initializeSpeechRecognition(
        (result) => {
          if (result.final) finalTranscriptRef.current = result.final;
        },
        (err) => {
          dispatch(setAudioError(err));
          dispatch(setListening(false));
        },
        () => {
          if (isListening) handleStopRecording();
        }
      );
    }
    dispatch(setListening(true));
    speechRecognitionRef.current.start();
  };

  // This function handleStopRecording is used to stop the recording
  const handleStopRecording = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
    dispatch(setListening(false));
    setTimeout(async () => {
      const transcript = finalTranscriptRef.current.trim();
      finalTranscriptRef.current = "";
      if (transcript) {
        await processUserInput(transcript);
      } else {
        dispatch(setAudioError("No speech detected. Please try again."));
      }
    }, 300);
  };

  // This function is used to initialize the voice assistant
  useEffect(() => {
    if (isInitialized) return;

    const init = async () => {
      try {
        dispatch(setConnectionStatus("connecting"));
        if (!isSpeechRecognitionAvailable()) {
          throw new Error(
            "Speech recognition not supported. Please use Chrome, Edge, or Safari."
          );
        }

        await connect(
          handleTranscript,
          (err) => dispatch(setError(err)),
          (status) => dispatch(setConnectionStatus(status))
        );

        const micResult = await requestMicrophoneAccess();
        if (micResult.success) {
          dispatch(setMicrophoneAccess("granted"));
        } else {
          dispatch(setMicrophoneAccess("denied"));
          dispatch(setAudioError(micResult.error));
        }

        speechRecognitionRef.current = initializeSpeechRecognition(
          (result) => {
            if (result.final) finalTranscriptRef.current = result.final;
          },
          (err) => {
            dispatch(setAudioError(err));
            dispatch(setListening(false));
          },
          () => {
            if (isListening) handleStopRecording();
          }
        );

        greetingTimeoutRef.current = setTimeout(() => {
          const greeting = "Hello! How can I assist you today?";
          dispatch(
            addMessage({
              id: Date.now(),
              role: "assistant",
              content: greeting,
              timestamp: new Date().toISOString(),
            })
          );
          dispatch(setSpeaking(true));
          speakText(
            greeting,
            null,
            () => dispatch(setSpeaking(false)),
            selectedVoice
          );
        }, 1000);

        setIsInitialized(true);
      } catch (error) {
        dispatch(setError(error.message));
        dispatch(setConnectionStatus("disconnected"));
      }
    };

    init();
    return () => {
      if (greetingTimeoutRef.current) {
        clearTimeout(greetingTimeoutRef.current);
        greetingTimeoutRef.current = null;
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
          speechRecognitionRef.current.abort();
        } catch (e) {}
      }
      stopSpeaking();
      disconnect();
    };
  }, [isInitialized, dispatch, selectedVoice]);

  return (
    <div className="voice-assistant-container">
      <div className="voice-assistant-header">
        <h1>Voice Assistant</h1>
        <div className="header-controls">
          <VoiceSelector />
          <StatusIndicator
            connectionStatus={connectionStatus}
            isListening={isListening}
            isSpeaking={isSpeaking}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {(audioError || connectionStatus === "disconnected") && (
        <ErrorMessage
          message={audioError || "Disconnected from server"}
          onDismiss={() => dispatch(setAudioError(null))}
        />
      )}

      <div className="voice-assistant-main">
        <div className="voice-controls">
          <button
            className={`mic-button ${isListening ? "listening" : ""}`}
            onClick={isListening ? handleStopRecording : handleStartRecording}
            disabled={connectionStatus !== "connected" || isProcessing}
            aria-label={isListening ? "Stop recording" : "Start recording"}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
                fill="currentColor"
              />
              <path
                d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H3V12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12V10H19Z"
                fill="currentColor"
              />
            </svg>
            {isListening && <WaveformAnimation />}
          </button>
          <p className="mic-status">
            {isListening
              ? "Listening... Click to stop"
              : isSpeaking
              ? "Assistant is speaking..."
              : isProcessing
              ? "Processing..."
              : "Click to start voice input"}
          </p>
        </div>

        <ChatInterface
          messages={messages}
          onSendMessage={processUserInput}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default VoiceAssistant;
