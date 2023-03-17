import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import Loader from './component/Loader';
import './index.css';
import { configStore } from './redux/store';

const store = configStore();

const root = createRoot(document.getElementById('root') as Element);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
      <Loader />
    </BrowserRouter>
  </Provider>,
);
