# 📂 Estructura del Proyecto (App Router)

Bienvenido a **Taskery**. He estructurado la aplicación siguiendo las mejores prácticas de Next.js 14+:

## 🗺️ Grupos de Rutas (Route Groups)
Los paréntesis `(nombre)` indican que esa carpeta **no afecta a la URL**, solo sirve para organizar y compartir Layouts.

### `(auth)`
- **Propósito**: Contiene las páginas de acceso público/seguridad.
- **Rutas**:
  - `/login`: Iniciar sesión.
  - `/register`: Crear nueva cuenta.
- **Layout**: Compartido para centrar los formularios en pantalla.

### `(dashboard)`
- **Propósito**: La aplicación principal para el equipo (Admins/Miembros).
- **Protección**: Requiere sesión activa en Supabase.
- **Rutas**:
  - `/`: Redirige al dashboard.
  - `/projects`: Lista de proyectos.
  - `/tracking`: Vista de tiempos.
- **Layout**: Incluye la Sidebar lateral y el Topbar.

### `(client)`
- **Propósito**: Portal exclusivo para los clientes externos.
- **Protección**: Acceso limitado por token o login simplificado.
- **Rutas**:
  - `/portal/[token]`: Vista única del proyecto del cliente.
- **Layout**: Diseño minimalista, sin navegación compleja.

## 📝 Estándares de Código
> "Verbose Commenting": Cada archivo complejo incluirá comentarios explicando el **POR QUÉ** y el **CÓMO**.
