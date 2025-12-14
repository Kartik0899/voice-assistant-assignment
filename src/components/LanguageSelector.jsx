import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedLanguage } from "../store/slices/uiSlice";
import "./LanguageSelector.css";

// Helper function to get language code from voice lang (e.g., "en-US" from "en-US-x-local")
const getLanguageCode = (lang) => {
  const parts = lang.split("-");
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return parts[0];
};

// Helper function to format language name from code (e.g., "en-US" -> "English (US)")
const formatLanguageName = (code) => {
  const parts = code.split("-");
  const langCode = parts[0].toLowerCase();
  const countryCode = parts[1]?.toUpperCase() || "";

  // Language name mapping
  const langNames = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    hi: "Hindi",
    ar: "Arabic",
    ru: "Russian",
    nl: "Dutch",
    pl: "Polish",
    tr: "Turkish",
  };

  const langName = langNames[langCode] || langCode.toUpperCase();
  return countryCode ? `${langName} (${countryCode})` : langName;
};

const getFlagEmoji = (code) => {
  const parts = code.split("-");
  const countryCode = parts[1]?.toLowerCase() || parts[0]?.toLowerCase() || "";

  const flagMap = {
    us: "🇺🇸",
    gb: "🇬🇧",
    au: "🇦🇺",
    ca: "🇨🇦",
    in: "🇮🇳",
    es: "🇪🇸",
    mx: "🇲🇽",
    fr: "🇫🇷",
    de: "🇩🇪",
    it: "🇮🇹",
    pt: "🇵🇹",
    br: "🇧🇷",
    jp: "🇯🇵",
    kr: "🇰🇷",
    cn: "🇨🇳",
    tw: "🇹🇼",
    sa: "🇸🇦",
    ru: "🇷🇺",
    nl: "🇳🇱",
    pl: "🇵🇱",
    tr: "🇹🇷",
  };

  return flagMap[countryCode] || "🌐";
};

const LanguageSelector = () => {
  const dispatch = useDispatch();
  const selectedLanguage =
    useSelector((state) => state.ui.selectedLanguage) || "en-US";
  const [isOpen, setIsOpen] = useState(false);
  const [languages, setLanguages] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    const loadLanguages = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const languageMap = new Map();
      availableVoices.forEach((voice) => {
        const langCode = getLanguageCode(voice.lang);
        if (langCode && !languageMap.has(langCode)) {
          languageMap.set(langCode, {
            code: langCode,
            name: formatLanguageName(langCode),
            flag: getFlagEmoji(langCode),
          });
        }
      });

      const availableLanguages = Array.from(languageMap.values()).sort(
        (a, b) => {
          return a.name.localeCompare(b.name);
        }
      );

      setLanguages(availableLanguages);

      if (!selectedLanguage && availableLanguages.length > 0) {
        const defaultLang =
          availableLanguages.find((lang) => lang.code === "en-US") ||
          availableLanguages[0];
        dispatch(setSelectedLanguage(defaultLang.code));
      }
    };

    loadLanguages();

    window.speechSynthesis.onvoiceschanged = loadLanguages;
  }, [selectedLanguage, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (languageCode) => {
    dispatch(setSelectedLanguage(languageCode));
    setIsOpen(false);
  };

  const selectedLang =
    languages.find((lang) => lang.code === selectedLanguage) ||
    (languages.length > 0
      ? languages[0]
      : { code: "en-US", name: "English (US)", flag: "🇺🇸" });

  return (
    <>
      <button
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
            fill="currentColor"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="language-modal-overlay"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="language-modal"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="language-modal-header">
              <h3>Select Language</h3>
              <button
                className="language-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="language-modal-content">
              {languages.length === 0 ? (
                <div className="language-option">No languages available</div>
              ) : (
                languages.map((language) => (
                  <button
                    key={language.code}
                    className={`language-option ${
                      selectedLanguage === language.code ? "selected" : ""
                    }`}
                    onClick={() => handleLanguageChange(language.code)}
                  >
                    <span className="language-flag">{language.flag}</span>
                    <span className="language-name">{language.name}</span>
                    {selectedLanguage === language.code && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
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
          </div>
        </div>
      )}
    </>
  );
};

export default LanguageSelector;
