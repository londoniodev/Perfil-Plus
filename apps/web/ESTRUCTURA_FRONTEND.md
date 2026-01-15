# Estructura del Frontend - Mauro Mera Web

A continuación se detalla la organización actual de la aplicación web (Next.js 16+ Turbopack) después de la migración completa a **Tailwind CSS v4**.

## 📂 Directorio Padre: `apps/web/src`

El código fuente principal reside en `src`, siguiendo las convenciones de Next.js App Router.

### 1. `app/` (Rutas y Páginas)
Contiene la lógica de navegación y puntos de entrada de la aplicación.
- **`(auth)/`**: Rutas de autenticación (Login, Registro, Recuperar contraseña).
- **`(dashboard)/`**: Área privada del usuario.
  - `admin/`: Paneles de administración (Ebooks, Cursos, Blog, Usuarios).
  - `perfil/`: Configuración y datos del usuario.
- **`blog/`**: Listado de artículos y páginas individuales de blog.
- **`cursos/`**: Catálogo de formación y visualizador de lecciones.
- **`ebooks/`**: Tienda y detalle de recursos digitales.
- **`portafolio/`**: Casos de éxito y visualizaciones de impacto.
- **`servicios/`**: Landing focalizada en las líneas de negocio.

### 2. `components/` (Arquitectura de Componentes)
Dividido por responsabilidad para facilitar el mantenimiento.
- **`admin/`**: Componentes específicos para el panel de gestión.
- **`layout/`**: Componentes compartidos de estructura (Navbar, Footer, Sidebars).
- **`sections/`**: Secciones modulares de la Landing Page (Hero, Testimonios, CTA).
- **`ui/`**: **Base de Diseño**. Contiene componentes atómicos basados en **Shadcn UI** (Buttons, Cards, Inputs, Icons). Todos usan Tailwind nativo.
- **`portfolio/`** y **`servicios/`**: Componentes visuales específicos para estas áreas.

### 3. `styles/` (Hojas de Estilo)
Simplificado al máximo tras la eliminación de CSS Modules.
- **`index.css`**: Punto de entrada global. Importa Tailwind y las variables.
- **`variables.css`**: **El motor visual**. Aquí residen:
  - Definiciones de colores HSL.
  - Configuración del tema (Shadcn semantics).
  - **Animaciones Custom**: Todas las animaciones (scroll, float, etc.) están definidas aquí mediante `@theme inline`.

### 4. `lib/` y `context/` (Lógica y Estado)
- **`lib/`**: Utilidades (`utils.ts`), constantes de diseño y configuraciones de API.
- **`context/`**: Proveedores de estado global (Autenticación, Carrito, etc.).

---

> [!NOTE]
> **Estado de la Migración**: 100% Tailwind CSS. No se deben crear nuevos archivos `.module.css`. Toda la estilización nueva debe realizarse mediante clases de utilidad o extendiendo el bloque `@theme` en `variables.css`.
