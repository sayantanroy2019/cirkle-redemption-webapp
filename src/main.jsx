import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// No StrictMode: it double-invokes effects in dev, which races two
// concurrent getUserMedia negotiations against the same html5-qrcode DOM
// node and reliably breaks camera start. Dev-only tradeoff — StrictMode's
// double-invoke has no effect on the production build.
createRoot(document.getElementById('root')).render(<App />)
