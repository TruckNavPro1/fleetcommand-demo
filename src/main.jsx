import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initMonitoring } from './services/monitoringService'
import './i18n/index.js'
import './index.css'

// Initialize production error tracking (Sentry fallback)
initMonitoring()

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
