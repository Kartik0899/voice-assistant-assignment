import "./LoadingFallback.css";

const LoadingFallback = () => {
  return (
    <div className="loading-fallback">
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
            <linearGradient id="spinnerGradient" x1="0" y1="0" x2="60" y2="60">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default LoadingFallback;
