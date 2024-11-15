import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store";
import ProductPage from "./pages/ProductPage";

const App = () => (
  <Provider store={store}>
    <ProductPage />
  </Provider>
);

export default App;
