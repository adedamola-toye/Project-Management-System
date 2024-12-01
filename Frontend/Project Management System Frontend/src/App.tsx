import ErrorBoundary from "./components/ErrorBoundary";
import GeneralRouter from './components/GeneralRouter'
import './App.css'
import { Provider } from "react-redux";
import store from './store/store'

function App(){
    return (
        <Provider store={store}>
          {/* <Header/> */}
          <div className="font-customFont">
        <ErrorBoundary>
        <GeneralRouter/>
        </ErrorBoundary>
        

          
          
          

        </div>
          {/* <Footer/> */}
    
          </Provider>
    
      )
}
export default App;