import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Routes from "@/routes/routes";
import { store } from "@/store/store";

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  </Provider>
);

export default App;