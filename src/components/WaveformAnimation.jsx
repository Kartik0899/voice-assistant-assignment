import './WaveformAnimation.css';

const WaveformAnimation = () => {
  return (
    <div className="waveform-container">
      <div className="waveform-bar" style={{ animationDelay: '0s' }}></div>
      <div className="waveform-bar" style={{ animationDelay: '0.1s' }}></div>
      <div className="waveform-bar" style={{ animationDelay: '0.2s' }}></div>
      <div className="waveform-bar" style={{ animationDelay: '0.3s' }}></div>
      <div className="waveform-bar" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};

export default WaveformAnimation;

