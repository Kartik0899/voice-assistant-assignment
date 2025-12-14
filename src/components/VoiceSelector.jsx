import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedVoice } from "../store/slices/uiSlice";
import "./VoiceSelector.css";

const VoiceSelector = () => {
  const dispatch = useDispatch();
  const selectedVoice = useSelector((state) => state.ui.selectedVoice);
  const [voices, setVoices] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter English voices and sort by name
      const englishVoices = availableVoices
        .filter((voice) => voice.lang.startsWith("en"))
        .sort((a, b) => a.name.localeCompare(b.name));
      setVoices(englishVoices);

      // Set default voice if none selected
      if (!selectedVoice && englishVoices.length > 0) {
        dispatch(setSelectedVoice(englishVoices[0].name));
      }
    };

    loadVoices();
    // Voices might load asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleVoiceChange = (voiceName) => {
    dispatch(setSelectedVoice(voiceName));
    setIsOpen(false);
  };

  const selectedVoiceObj =
    voices.find((v) => v.name === selectedVoice) || voices[0];

  return (
    <div className="voice-selector" ref={dropdownRef}>
      <button
        className="voice-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select voice"
      >
        <span>{selectedVoiceObj?.name || "Default Voice"}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isOpen ? "rotated" : ""}
        >
          <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
        </svg>
      </button>

      {isOpen && (
        <div className="voice-selector-dropdown">
          {voices.length === 0 ? (
            <div className="voice-option">No voices available</div>
          ) : (
            voices.map((voice) => (
              <button
                key={voice.name}
                className={`voice-option ${
                  selectedVoice === voice.name ? "selected" : ""
                }`}
                onClick={() => handleVoiceChange(voice.name)}
              >
                <span>{voice.name}</span>
                {voice.name === selectedVoice && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;
