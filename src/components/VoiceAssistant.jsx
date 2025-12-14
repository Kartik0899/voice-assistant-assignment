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
  clearError,
  updateLastMessage,
} from "../store/slices/chatSlice";
import {
  setConnectionStatus,
  setOnboardingComplete,
} from "../store/slices/uiSlice";
import { Suspense, lazy } from "react";
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
import { formatErrorMessage } from "../utils/errorUtils";
import LoadingFallback from "./LoadingFallback";
import "./VoiceAssistant.css";

// Lazy load components for code splitting
const VoiceSelector = lazy(() => import("./VoiceSelector"));
const OnboardingScreen = lazy(() => import("./OnboardingScreen"));
const ChatInterface = lazy(() => import("./ChatInterface"));
const ErrorMessage = lazy(() => import("./ErrorMessage"));

const VoiceAssistant = () => {
  const dispatch = useDispatch();
  const {
    isListening,
    isSpeaking,
    isProcessing,
    error: audioError,
  } = useSelector((state) => state.audio);
  const {
    messages,
    isLoading,
    error: chatError,
  } = useSelector((state) => state.chat);
  const { connectionStatus, selectedVoice, userName, isOnboardingComplete } =
    useSelector((state) => state.ui);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const speechRecognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const isStreamingRef = useRef(false);
  const greetingTimeoutRef = useRef(null);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

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
    isStreamingRef.current = false;
    // Clear any previous errors when starting a new message
    dispatch(clearError());
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
      const errorMessage = formatErrorMessage(error);
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      dispatch(setProcessing(false));
      isStreamingRef.current = false;
    }
  };

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
          (err) => dispatch(setError(formatErrorMessage(err))),
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

        setIsInitialized(true);
      } catch (error) {
        dispatch(setError(formatErrorMessage(error)));
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
  }, [isInitialized, dispatch, selectedVoice, handleTranscript, isListening]);

  // Auto-greet user on app launch (only once when initialized and no messages)
  useEffect(() => {
    if (
      isInitialized &&
      isOnboardingComplete &&
      messages.length === 0 &&
      connectionStatus === "connected"
    ) {
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
    }

    return () => {
      if (greetingTimeoutRef.current) {
        clearTimeout(greetingTimeoutRef.current);
        greetingTimeoutRef.current = null;
      }
    };
  }, [
    isInitialized,
    isOnboardingComplete,
    messages.length,
    connectionStatus,
    dispatch,
    selectedVoice,
  ]);

  const handleOnboardingComplete = () => {
    dispatch(setOnboardingComplete(true));
  };

  // Show onboarding screen if not completed
  if (!isOnboardingComplete) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  return (
    <div className="voice-assistant-container">
      <Suspense fallback={null}>
        {(audioError || chatError) && (
          <ErrorMessage
            message={audioError || chatError}
            onDismiss={() => {
              if (audioError) dispatch(setAudioError(null));
              if (chatError) dispatch(setError(null));
            }}
          />
        )}
      </Suspense>

      {/* Greeting Section */}
      <div className="greeting-section">
        <div className="profile-section">
          <div className="profile-picture">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="30" cy="30" r="30" fill="#FF6B35" />
              <circle cx="30" cy="22" r="10" fill="white" opacity="0.9" />
              <path
                d="M15 45 C15 38, 20 33, 30 33 C40 33, 45 38, 45 45"
                fill="white"
                opacity="0.9"
              />
            </svg>
          </div>
          <div className="greeting-text">
            <h2 className="greeting">{getGreeting()},</h2>
            <h2 className="user-name">{userName || "User"}</h2>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="chat-section">
        <Suspense fallback={<LoadingFallback />}>
          <ChatInterface
            messages={messages}
            onSendMessage={processUserInput}
            isLoading={isLoading}
            isInputVisible={isInputVisible}
          />
        </Suspense>
      </div>

      {/* Voice Input Button */}
      <div className="voice-input-section">
        <button
          className={`voice-button ${isListening ? "listening" : ""} ${
            isProcessing ? "processing" : ""
          }`}
          onClick={isListening ? handleStopRecording : handleStartRecording}
          disabled={connectionStatus !== "connected" || isProcessing}
          aria-label={isListening ? "Stop recording" : "Start recording"}
        >
          <div className="voice-button-rings">
            {isListening && (
              <>
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>
              </>
            )}
          </div>
          <div className="voice-button-core">
            {isListening ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
                  fill="white"
                />
                <path
                  d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H3V12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12V10H19Z"
                  fill="white"
                />
              </svg>
            )}
          </div>
        </button>
        <button
          className={`keyboard-button ${isInputVisible ? "active" : ""}`}
          onClick={() => setIsInputVisible(!isInputVisible)}
          aria-label={isInputVisible ? "Hide keyboard" : "Show keyboard"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 5H4C2.9 5 2.01 5.9 2.01 7L2 17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5ZM20 17H4V7H20V17ZM18 8H16V10H18V8ZM18 11H16V13H18V11ZM15 8H13V10H15V8ZM15 11H13V13H15V11ZM12 8H10V10H12V8ZM12 11H10V13H12V11ZM9 8H7V10H9V8ZM9 11H7V13H9V11ZM6 8H4V10H6V8ZM6 11H4V13H6V11ZM18 14H6V16H18V14Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {/* Settings Button (Voice Selector) */}
      <div className="settings-button">
        <Suspense fallback={null}>
          <VoiceSelector />
        </Suspense>
      </div>
    </div>
  );
};

export default VoiceAssistant;
