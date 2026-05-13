import React from 'react'
import ReactDOM from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import App from './App.jsx'

// Supabase client — disponível globalmente
export const supabase = createClient(
  'https://oxbqksqnxohfygprdxck.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YnFrc3FueG9oZnlncHJkeGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjkwMzUsImV4cCI6MjA5NDIwNTAzNX0.G9aVYlNJQkB64ztv1irdVc-AQBlmD5uqC1q-j_dUypg'
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App supabase={supabase} />
  </React.StrictMode>,
)
