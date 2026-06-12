import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// 1. Load Bootstrap minified CSS stylesheet
import 'bootstrap/dist/css/bootstrap.min.css';

// 2. Load custom CSS tweaks and fonts
import './index.css';

// 3. Mount React App
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
