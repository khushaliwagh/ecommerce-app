import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { MotionConfig } from 'framer-motion';
import App from '@/App';
import { store } from '@/store';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* honours the OS "reduce motion" setting for every animation */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </Provider>
  </React.StrictMode>,
);
