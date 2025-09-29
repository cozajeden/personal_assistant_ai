import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DEBUG } from './config/settings.jsx'
import './index.css'
import App from './App.jsx'

if (!DEBUG) {
  console.debug = () => {};
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
