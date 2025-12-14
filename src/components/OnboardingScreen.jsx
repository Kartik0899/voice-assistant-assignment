import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUserName } from "../store/slices/uiSlice";
import "./OnboardingScreen.css";

const OnboardingScreen = ({ onComplete }) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setIsLoading(true);
      const trimmedName = name.trim();
      dispatch(setUserName(trimmedName));

      localStorage.setItem("userName", trimmedName);

      setTimeout(() => {
        localStorage.setItem("onboardingComplete", "true");
        onComplete();
      }, 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="onboarding-container loading-state">
        <div className="loading-content">
          <div className="loading-spinner">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="30"
                cy="30"
                r="26"
                stroke="url(#spinnerGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="120"
                strokeDashoffset="90"
                className="spinner-circle"
              />
              <defs>
                <linearGradient
                  id="spinnerGradient"
                  x1="0"
                  y1="0"
                  x2="60"
                  y2="60"
                >
                  <stop offset="0%" stopColor="#FB923C" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="loading-title">
            Initializing Voice Assistant session...
          </h2>
          <p className="loading-subtitle">
            Setting up your personalized experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <div className="onboarding-header">
          <div className="onboarding-icon">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="40" cy="40" r="40" fill="#FF6B35" />
              <circle cx="40" cy="32" r="12" fill="white" opacity="0.9" />
              <path
                d="M20 60 C20 52, 26 46, 40 46 C54 46, 60 52, 60 60"
                fill="white"
                opacity="0.9"
              />
            </svg>
          </div>
          <h1 className="onboarding-title">Welcome</h1>
          <p className="onboarding-description">
            Let's get started by entering your name
          </p>
        </div>

        <form className="onboarding-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              type="text"
              className="name-input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              minLength={2}
              maxLength={30}
            />
          </div>
          <button
            type="submit"
            className="continue-button"
            disabled={!name.trim() || name.trim().length < 2}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingScreen;
