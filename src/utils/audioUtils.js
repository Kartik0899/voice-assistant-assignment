// This function is used to request microphone access
export async function requestMicrophoneAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 24000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    return { success: true, stream };
  } catch (error) {
    console.error("Microphone access error:", error);
    let errorMessage = "Failed to access microphone";

    if (error.name === "NotAllowedError") {
      errorMessage =
        "Microphone access denied. Please allow microphone access.";
    } else if (error.name === "NotFoundError") {
      errorMessage = "No microphone found. Please connect a microphone.";
    } else if (error.name === "NotReadableError") {
      errorMessage = "Microphone is already in use by another application.";
    }

    return { success: false, error: errorMessage };
  }
}
