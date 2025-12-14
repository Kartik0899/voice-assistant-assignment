import './StatusIndicator.css';

const StatusIndicator = ({ connectionStatus, isListening, isSpeaking, isProcessing }) => {
  const getStatusText = () => {
    if (isListening) return 'Listening';
    if (isSpeaking) return 'Speaking';
    if (isProcessing) return 'Processing';
    if (connectionStatus === 'connected') return 'Ready';
    if (connectionStatus === 'connecting') return 'Connecting...';
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (isListening) return 'var(--color-listening)';
    if (isSpeaking) return 'var(--color-speaking)';
    if (isProcessing) return 'var(--color-processing)';
    if (connectionStatus === 'connected') return 'var(--color-success)';
    if (connectionStatus === 'connecting') return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  return (
    <div className="status-indicator">
      <div
        className="status-dot"
        style={{ backgroundColor: getStatusColor() }}
      ></div>
      <span className="status-text">{getStatusText()}</span>
    </div>
  );
};

export default StatusIndicator;

