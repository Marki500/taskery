import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import EmpresasPage from './pages/EmpresasPage.jsx'
import ProyectosPage from './pages/ProyectosPage.jsx'

// Pequeño ruteo basado en la URL sin depender de react-router
const path = window.location.pathname
const params = new URLSearchParams(window.location.search)
let Page = App
let pageProps = {}

if (path.startsWith('/empresas')) {
  Page = EmpresasPage
} else if (path.startsWith('/proyectos')) {
  Page = ProyectosPage
  pageProps.empresaId = params.get('empresaId')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page {...pageProps} />
  </StrictMode>,
)

// Transición suave: fade-in al cargar y fade-out al navegar
document.body.classList.add('fade-in')

document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href]')
  if (anchor && anchor.target !== '_blank' && !anchor.hasAttribute('data-no-transition')) {
    e.preventDefault()
    document.body.classList.remove('fade-in')
    const url = anchor.href
    setTimeout(() => {
      window.location.href = url
    }, 200)
  }
})
