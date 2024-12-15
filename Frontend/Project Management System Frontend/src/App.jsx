import ErrorBoundary from "./components/ErrorBoundary";
import GeneralRouter from './components/GeneralRouter';
import './App.css';
import { Provider } from "react-redux";
import store, {persistor} from './store/store';
import { PersistGate } from 'redux-persist/integration/react';


function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="font-customFont">
          <ErrorBoundary>
            <GeneralRouter />
          </ErrorBoundary>
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
