# La Casa de Kuki — Sitio Web Oficial (MVP V1)

Landing page oficial del hospedaje "La Casa de Kuki" en Purmamarca, Jujuy. 
Diseñada para captar reservas directas, posicionar en motores de búsqueda/IA y brindar confianza a los viajeros.

## 1. Stack Recomendado
- **Framework:** Astro + Tailwind CSS (Carga ultra rápida, SEO optimizado y mobile-first).

## 2. Identidad Visual
- **Estilo:** Cálido, rústico-moderno, limpio y profesional.
- **Colores:** Tonos terracota, arena, blanco cálido y texto carbón.

## 3. Secciones de la Landing Page
1. **Hero Section:** Foto principal impactante, título claro ("Hospedaje en Purmamarca, Jujuy") y botón directo a consulta.
2. **Sobre el Hospedaje / Galería:** Muestra dinámica de departamentos, quincho, estacionamiento y vistas.
3. **Servicios y Comodidades:** Wi-Fi, estacionamiento, info sobre traslados/excursiones.
4. **Reseñas de Huéspedes:** Testimonios destacados y puntuación.
5. **Formulario de Consulta (CTA Principal):**
   - Campos: Nombre, Cantidad de huéspedes, Fecha de ingreso/egreso, Teléfono.
   - Acción: Redirección con mensaje preformateado a WhatsApp Business.
6. **Footer:** Redes sociales (Instagram, Google Maps) y contacto directo.

## 4. Estructura de Proyecto Esperada (Astro)

```text
/
├── public/
│   └── images/
│       ├── deptos/
│       ├── quincho/
│       ├── estacionamiento/
│       └── vistas/
├── src/
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── Gallery.astro
│   │   ├── Amenities.astro
│   │   ├── Reviews.astro
│   │   ├── ContactForm.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
├── package.json
└── README.md
