import ErrorBoundary from "./components/ErrorBoundary";
import GeneralRouter from './components/GeneralRouter';
import './App.css';
import { Provider } from "react-redux";
import store, {persistor} from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from "react-router-dom";



function App() {
  return (
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter> {/* Wrap GeneralRouter here */}
        <div className="font-customFont">
          <ErrorBoundary>
            <GeneralRouter />
          </ErrorBoundary>
        </div>
      </BrowserRouter>
    </PersistGate>
  </Provider>
  );
}

export default App;
