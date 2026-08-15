# Roadmap de Desarrollo: La Casa de Kuki 🏠

Este documento define las tareas técnicas y de contenido para las próximas versiones del sitio web. 

---

## 🚀 VERSIÓN 1.0: MVP & Lanzamiento Comercial
**Objetivo:** Tener una web rápida, funcional, estéticamente norteña y lista para recibir tráfico real y medirlo.

### 1. Métricas y Analytics (Tracking)
- [ ] **Google Analytics (GA4):** Integrar GA4 utilizando `@astrojs/partytown` para ejecutar el script `gtag.js` en un web worker y no penalizar el rendimiento en celulares.
- [ ] Configurar la lectura del 'Measurement ID' desde las variables de entorno (`.env`).

### 2. Optimización de Imágenes y Rendimiento
- [ ] Convertir todas las imágenes de `/public/images/` a formato **WebP**.
- [ ] Implementar el componente nativo `<Image />` de Astro para garantizar lazy loading y compresión automática.
- [ ] **Hero Section Fijo:** Configurar una imagen determinística (fija y de alto impacto) para el Hero, asegurando que cargue de inmediato (sin lazy loading).

### 3. Refactor UI/UX (Mobile-First)
- [ ] **Hero Rediseñado:** Ajustar el Hero para que ocupe el 100% del alto (h-screen), con un *overlay* oscuro que permita leer perfectamente el H1 principal y el botón CTA ("Ver disponibilidad"). Eliminar textos largos de esta sección.
- [ ] **Estilos Norteños:** Ajustar la paleta de colores en Tailwind. Reemplazar marrones planos por tonos terracota/arcilla y agregar texturas sutiles si es posible para darle un aspecto más orgánico y menos corporativo.
- [ ] **Prueba Social / Trust:** Agregar un enlace directo al perfil de Google Mi Negocio en el Footer y en la sección de Contacto.
- [ ] **Restricciones UX:** Poner un limite en las fechas del formulario. Nadie deberia entrar a boludear con fechas muy largas, pero bueno... mejor prevenir boludeces en el bot de automatizaciones. ademas, agregar el apartado para que elijan el departamento, de esta forma podemos facilitar el tema con la automatización.


### 4. Tareas de Gestión (Fuera del scope del agente)
- [ ] *Lisandro:* Comprar y conectar el dominio `lacasadekuki.com`.
- [ ] *Lisandro:* Generar el ID de medición en GA4 y agregarlo a Vercel/entorno.

---

## 🧗‍♂️ VERSIÓN 2.0: Crecimiento, SEO y Experiencia
**Objetivo:** Posicionar la marca en buscadores, mejorar la retención del usuario y ofrecer una experiencia integral de turismo en la Quebrada.

### 1. Arquitectura de Contenido y SEO (Guías Locales)
- [ ] Crear el layout y las rutas dinámicas (`/guias/[destino]`) para publicar contenido sobre atracciones locales (Tilcara, Purmamarca, Humahuaca, Maimará).
- [ ] Optimizar meta-etiquetas (títulos, descripciones, Open Graph) de todas las páginas para mejorar el CTR en Google y redes sociales.

### 2. Ecosistema Local (Partnerships)
- [ ] Desarrollar una nueva sección/componente de "Recomendaciones Locales" (comercios asociados).
- [ ] Integrar tarjetas de contacto rápido para: Remís Turístico (Sergio) y Gastronomía (Peña Marito / Tío Dani).

### 3. Polish de UI e Interacciones
- [ ] **Micro-interacciones:** Mejorar las animaciones CSS (hover states, transiciones, bounce sutil) en botones interactivos principales (WhatsApp, Instagram, CTA de reservas).
- [ ] **FAQ Dinámico:** Refactorizar la sección de Preguntas Frecuentes para que soporte una estructura de datos más robusta, permitiendo agregar consultas recurrentes basadas en el feedback de los clientes.
- [ ] **Refinamiento de Textos:** Actualización general del *copywriting* en componentes internos para asegurar un tono 100% humano y cálido.

### 4. Tareas de Gestión (Fuera del scope del agente)
- [ ] *Lisandro:* Conectar Meta Business y configurar el Píxel de Meta (se solicitará al agente la inyección del script en su momento).
- [ ] *Lisandro:* Redactar el contenido de las guías turísticas.