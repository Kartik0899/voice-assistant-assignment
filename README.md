# Real-Time Voice Assistant

A modern, real-time voice assistant application built with React, Vite, and Redux Toolkit, leveraging Google's Gemini API for intelligent conversations with browser-native speech recognition and synthesis.

## Features

- 🎤 **Real-time Voice Interaction**: Use your microphone to interact with the assistant via browser's Speech Recognition API
- 💬 **Text-Based Chat**: Type messages as an alternative input method
- 🔊 **Audio Responses**: Listen to the assistant's voice responses using browser's Speech Synthesis API
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface with visual feedback
- ⚡ **Streaming Responses**: Real-time streaming text responses from Gemini API
- 🔄 **Conversation Context**: Maintains context throughout the conversation
- 🌐 **Browser-Native**: Uses Web Speech API - no complex WebRTC setup required

## Technologies Used

### Core Framework & Build Tools

- **React 18.2.0** - UI library for building the user interface
- **React DOM 18.2.0** - React rendering library for web
- **Vite 5.0.8** - Build tool and development server
- **@vitejs/plugin-react 4.2.1** - Vite plugin for React support

### State Management

- **Redux Toolkit 2.0.1** - State management library
- **React Redux 9.0.4** - React bindings for Redux

### API Integration

- **@google/generative-ai** - Official Google Gemini API SDK for AI conversations

### Browser APIs

- **Web Speech API** - Browser-native speech recognition (SpeechRecognition) and synthesis (SpeechSynthesis)
- **MediaDevices API** - For microphone access

### Language & Standards

- **JavaScript (ES6+)** - Modern JavaScript features (ES modules, async/await, destructuring, etc.)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key (Get one from [Google AI Studio](https://aistudio.google.com/app/api-keys))
- Chrome, Edge, or Safari browser (for Speech Recognition support)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Jivi-Assignment
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Add your Gemini API key to the `.env` file:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
Jivi-Assignment/
├── src/
│   ├── components/          # React components
│   │   ├── VoiceAssistant.jsx
│   │   ├── ChatInterface.jsx
│   │   ├── WaveformAnimation.jsx
│   │   ├── StatusIndicator.jsx
│   │   └── ErrorMessage.jsx
│   ├── store/               # Redux store and slices
│   │   ├── store.js
│   │   └── slices/
│   │       ├── chatSlice.js
│   │       ├── audioSlice.js
│   │       └── uiSlice.js
│   ├── services/            # API services
│   │   └── geminiService.js
│   ├── utils/               # Utility functions
│   │   └── audioUtils.js, speechUtils.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Usage

1. **Start the application**: Run `npm run dev` and open the browser
2. **Grant microphone access**: When prompted, allow the browser to access your microphone
3. **Voice input**: Click the microphone button to start recording, click again to stop
4. **Text input**: Type your message in the text field and press Enter or click Send
5. **View conversation**: Scroll through the chat history to see previous messages

## Design Choices

### Framework Selection: React + Vite

**Why React?**

- Component-based architecture for reusable UI elements
- Large ecosystem and community support
- Excellent for building interactive user interfaces
- Hooks API for clean state and side effect management

**Why Vite?**

- Fast development server with Hot Module Replacement (HMR)
- Optimized production builds
- Modern ES modules support
- Better developer experience compared to Create React App

### State Management: Redux Toolkit

**Why Redux Toolkit?**

- Centralized state management for complex application state
- Predictable state updates with reducers
- DevTools support for debugging
- Three main slices for separation of concerns:
  - **chatSlice**: Manages messages, conversation context, and loading states
  - **audioSlice**: Handles audio recording, playback, and microphone access
  - **uiSlice**: Manages UI state like connection status and voice selection

**Alternative Considered**: Context API was considered but Redux Toolkit provides better tooling and scalability for this application.

### API Integration Approach: Google Gemini API

**Why Google Gemini API?**

- Cost-effective compared to OpenAI's API
- Good performance and response quality
- Simple REST API integration
- Official SDK support with `@google/generative-ai`

**Implementation Details:**

- Functional module pattern (no classes) for cleaner code
- RESTful API calls to Gemini's `generateContent` endpoint
- Streaming response simulation for real-time user experience
- Conversation history management for context-aware responses
- Error handling with user-friendly error messages

**Alternative Considered**: Initially attempted OpenAI Real-time API but switched to Gemini due to complexity and cost considerations.

### Audio Processing: Web Speech API

**Why Browser-Native APIs?**

- No external dependencies required
- Built-in browser support for speech recognition and synthesis
- Simpler implementation and maintenance
- No additional server-side processing needed

**Implementation:**

- Speech Recognition API for voice-to-text conversion
- Speech Synthesis API for text-to-speech output
- Voice profile selection for customizable assistant voices
- Works best in Chrome, Edge, or Safari

**Alternative Considered**: WebRTC with custom audio processing was considered but deemed too complex for the requirements.

### Code Architecture

- **Functional Components**: All components use React hooks (no class components)
- **Functional Modules**: Services use functional module pattern instead of classes
- **Separation of Concerns**: Clear separation between components, services, utils, and store
- **Error Handling**: Comprehensive error handling at all levels
- **Responsive Design**: Mobile-first approach with modern CSS

## Assumptions

1. **Browser Compatibility**: The application assumes users are using modern browsers (Chrome, Edge, or Safari) that support the Web Speech API.

2. **Microphone Access**: The application assumes users will grant microphone permissions when prompted. The app gracefully handles denial but requires microphone access for voice input functionality.

3. **API Key Availability**: The application assumes users have a valid Google Gemini API key and will configure it in the `.env` file.

4. **Network Connectivity**: The application assumes a stable internet connection for API calls. Offline functionality is not implemented.

5. **HTTPS in Production**: For production deployments, the application assumes HTTPS will be used, as some browsers require secure contexts for microphone access.

6. **English Language**: The application is primarily designed for English language interactions, though the underlying APIs support multiple languages.

7. **Single User**: The application is designed for single-user interactions. Multi-user or concurrent session handling is not implemented.

8. **No Authentication**: The application does not include user authentication. All conversations are local to the browser session.

## Technical Details

### State Management

The application uses Redux Toolkit for state management with three main slices:

- **chatSlice**: Manages messages, conversation context, and loading states
- **audioSlice**: Handles audio recording, playback, and microphone access
- **uiSlice**: Manages UI state like connection status and voice selection

### API Integration

The Gemini API integration includes:

- RESTful API calls to Gemini's generateContent endpoint
- Streaming response simulation for real-time feel
- Conversation history management
- Error handling and retry logic

### Audio Processing

- Uses browser's native Speech Recognition API (Web Speech API)
- Speech-to-text conversion handled by browser
- Text-to-speech using browser's Speech Synthesis API
- No complex audio processing required
- Works best in Chrome, Edge, or Safari

## Error Handling

The application gracefully handles:

- API connection errors
- Microphone access denials
- Network issues
- Invalid API keys
- Browser compatibility issues

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (with limitations)

**Note**: Some browsers may require HTTPS for microphone access in production.

## Environment Variables

- `VITE_GEMINI_API_KEY`: Your Google Gemini API key (required)

## Troubleshooting

### Microphone not working

- Ensure you've granted microphone permissions in your browser
- Check that no other application is using the microphone
- Try refreshing the page and granting permissions again

### Connection errors

- Verify your Gemini API key is correct
- Check your internet connection
- Ensure you have access to the Gemini API
- Get your API key from [Google AI Studio](https://aistudio.google.com/app/api-keys)

### Audio playback issues

- Check your system volume
- Ensure browser audio is not muted
- Try a different browser if issues persist

## Future Enhancements

Potential improvements and bonus features:

- [ ] Customizable voice profiles
- [ ] Offline support with cached responses
- [ ] Conversation history persistence
- [ ] Multiple language support

## License

This project is created for assignment purposes.
