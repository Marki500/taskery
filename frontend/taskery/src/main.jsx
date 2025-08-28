import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import EmpresasPage from './pages/EmpresasPage.jsx'
import ProyectosPage from './pages/ProyectosPage.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/empresas" element={<EmpresasPage />} />
        <Route path="/proyectos" element={<ProyectosPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
