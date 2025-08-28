import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import EmpresasPage from './pages/EmpresasPage.jsx'
import ProyectosPage from './pages/ProyectosPage.jsx'

// Pequeño ruteo basado en la URL sin depender de react-router
const path = window.location.pathname
let Page = App
let pageProps = {}

if (path.startsWith('/empresas')) {
  Page = EmpresasPage
} else if (path.startsWith('/proyectos')) {
  const parts = path.split('/').filter(Boolean)
  if (parts.length > 1) {
    Page = ProyectosPage
    pageProps.empresaId = parts[1]
  } else {
    window.location.href = '/empresas'
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page {...pageProps} />
  </StrictMode>,
)
