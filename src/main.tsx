import { Buffer } from 'buffer'
import { StrictMode } from 'react'

globalThis.Buffer = Buffer
import { createRoot } from 'react-dom/client'
import '@solana/wallet-adapter-react-ui/styles.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
