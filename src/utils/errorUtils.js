// Utility function to format error messages for user display
export function formatErrorMessage(error) {
  if (!error) {
    return "An error occurred while processing your message.";
  }

  const errorMessage = error?.message || error?.toString() || String(error);
  const errorString = errorMessage.toLowerCase();

  // Check for quota exceeded errors
  if (
    errorString.includes("quota") ||
    errorString.includes("exceeded") ||
    errorString.includes("rate limit")
  ) {
    return "You exceeded your current quota, please check your plan and billing details.";
  }

  // Check for API key errors
  if (
    errorString.includes("api key") ||
    errorString.includes("authentication") ||
    errorString.includes("unauthorized")
  ) {
    return "Invalid API key. Please check your configuration.";
  }

  // Check for network errors
  if (
    errorString.includes("network") ||
    errorString.includes("fetch") ||
    errorString.includes("connection")
  ) {
    return "Network error. Please check your internet connection and try again.";
  }

  // For other errors, try to extract a meaningful message
  // Look for common error patterns and extract the first sentence
  const firstSentence = errorMessage.split(/[.!?]/)[0];
  if (firstSentence && firstSentence.length < 100) {
    return (
      firstSentence.trim() || "An error occurred while processing your message."
    );
  }

  // Default fallback
  return "An error occurred while processing your message. Please try again.";
}
