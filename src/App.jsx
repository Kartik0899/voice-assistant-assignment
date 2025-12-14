import { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import LoadingFallback from './components/LoadingFallback';
import './App.css';

// Lazy load main components for code splitting
const VoiceAssistant = lazy(() => import('./components/VoiceAssistant'));

function App() {
  return (
    <Provider store={store}>
      <Suspense fallback={<LoadingFallback />}>
        <VoiceAssistant />
      </Suspense>
    </Provider>
  );
}

export default App;

