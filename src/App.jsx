import { Provider } from 'react-redux';
import { store } from './store/store';
import VoiceAssistant from './components/VoiceAssistant';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <VoiceAssistant />
    </Provider>
  );
}

export default App;

