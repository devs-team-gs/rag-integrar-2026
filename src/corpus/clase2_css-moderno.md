# CSS Moderno — Documentación de Clase 04

> Objetivo: al terminar de leer esta documentación vas a poder maquetar cualquier layout sin trucos ni hacks, usando Box Model, Flexbox, Grid y Tailwind.

---

## 1. 📺 Display: block, inline e inline-block

Todo elemento HTML tiene un valor de `display` por defecto que determina cómo se comporta como caja y cómo interactúa con los elementos que lo rodean. Entender esto es el punto de partida para dominar el layout.

### `display: block`

- Ocupa **todo el ancho disponible** de su contenedor.
- Siempre empieza en una **nueva línea**, apilándose verticalmente.
- Respeta `width`, `height`, `margin` y `padding` en los cuatro lados.
- Ejemplos nativos: `<div>`, `<p>`, `<h1>`–`<h6>`, `<section>`, `<article>`.

```css
.bloque {
  display: block;
  width: 300px;
  height: 100px;
  margin: 1rem;    /* funciona en todos los lados ✅ */
  padding: 1rem;   /* funciona en todos los lados ✅ */
}
```

### `display: inline`

- Solo ocupa el ancho que necesita su **contenido**.
- No rompe el flujo: los elementos se colocan uno al lado del otro, como palabras en un párrafo.
- **No respeta** `width` ni `height` — son ignoradas.
- El `margin` y `padding` en el eje vertical (arriba/abajo) no desplazan los elementos del entorno.
- Ejemplos nativos: `<span>`, `<a>`, `<strong>`, `<em>`.

```css
.en-linea {
  display: inline;
  width: 300px;   /* ignorado ❌ */
  height: 100px;  /* ignorado ❌ */
  padding: 1rem;  /* izquierda/derecha funcionan, arriba/abajo no desplazan ⚠️ */
}
```

### `display: inline-block`

El híbrido: se comporta como `inline` respecto al flujo (no rompe línea, se coloca al lado de otros elementos), pero como `block` para sus dimensiones.

- **Sí respeta** `width`, `height`, `margin` y `padding` en los cuatro lados.
- Útil para botones, badges o cualquier elemento alineado que necesite dimensiones explícitas.

```css
.hibrido {
  display: inline-block;
  width: 200px;   /* respetado ✅ */
  height: 50px;   /* respetado ✅ */
  padding: 0.5rem 1rem; /* funciona en todos los lados ✅ */
  /* se coloca al lado de otros inline/inline-block */
}
```

### Comparativa rápida

| Propiedad                       | `block` | `inline` | `inline-block` |
|---------------------------------|---------|----------|----------------|
| Nueva línea                     | ✅      | ❌       | ❌             |
| Ocupa todo el ancho             | ✅      | ❌       | ❌             |
| Respeta `width` / `height`      | ✅      | ❌       | ✅             |
| `padding` / `margin` vertical   | ✅      | ❌       | ✅             |

> 💡 **Regla práctica:** cuando algo no se ve como esperás, lo primero que checkeás es el `display` que tiene ese elemento por defecto.

---

## 2. 📦 Box Model y `box-sizing`

Todo elemento HTML es una caja. El **Box Model** describe cómo se calcula el espacio total que ocupa esa caja.

### El modelo tradicional (content-box)

Por defecto, `width` y `height` solo definen el tamaño del **contenido**. El padding y el borde se suman por fuera:

```css
.caja {
  width: 300px;
  padding: 20px;
  border: 2px solid black;
  /* Ancho total real = 300 + 20 + 20 + 2 + 2 = 344px ⚠️ */
}
```

Esto genera el bug clásico: definís un ancho y el elemento "se sale" del contenedor porque el padding lo agranda.

### La solución: `border-box`

Con `box-sizing: border-box`, el `width` incluye padding y borde. Lo que definís es el **tamaño total**:

```css
.caja {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  border: 2px solid black;
  /* Ancho total real = 300px ✅ */
}
```

### Reset global recomendado

Aplicá `border-box` a todos los elementos al inicio de tu CSS. Es una convención universal:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
}

body {
  min-height: 100vh;
  line-height: 1.5;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}
```

### Propiedades de dimensión útiles

```css
.elemento {
  /* Mínimos y máximos */
  min-width: 300px;
  max-width: 600px;
  min-height: 200px;
  max-height: 50vh;

  /* Funciones de medida */
  width: min(100%, 800px);       /* El menor entre los dos valores */
  font-size: clamp(1rem, 2.5vw, 2rem); /* Mín, preferido, máx */
}
```

---

## 3. 🎨 Variables CSS (Custom Properties)

Las variables CSS permiten definir valores reutilizables directamente en el navegador, sin preprocesadores. Son más potentes que las variables de SASS porque reaccionan al DOM en tiempo real.

### Definición y uso

```css
/* Se definen con -- y se recomiendan en :root para alcance global */
:root {
  --color-primary: #3b82f6;
  --color-bg: #ffffff;
  --color-text: #1f2937;

  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;

  --radius: 0.5rem;
}

/* Se usan con var() */
.card {
  background: var(--color-bg);
  color: var(--color-text);
  padding: var(--space-md);
  border-radius: var(--radius);
}

/* Fallback: si la variable no existe, usa el segundo valor */
.card {
  color: var(--color-text, black);
}
```

### Temas claro/oscuro con variables

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1f2937;
  --color-primary: #3b82f6;
}

/* Sobreescribir variables en un scope diferente */
.dark-theme {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-primary: #60a5fa;
}

/* Los componentes no cambian, solo las variables */
body {
  background: var(--color-bg);
  color: var(--color-text);
}
```

### Combinando con `calc()`

```css
:root {
  --spacing-unit: 8px;
}

.button {
  padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3);
  /* padding: 16px 24px */
}
```

---

## 4. 🔛 Flexbox

Flexbox es el sistema de layout para **una dimensión**: alineás elementos en una fila *o* en una columna, pero no en las dos al mismo tiempo.

> 💡 **Regla de oro:** Flexbox es para componentes. Grid es para layouts de página.

### Conceptos clave

- **Eje principal**: la dirección en la que se acomodan los elementos (`row` = horizontal, `column` = vertical).
- **Eje cruzado**: perpendicular al eje principal.
- **Flex container**: el elemento padre con `display: flex`.
- **Flex items**: los hijos directos del container.

### Propiedades del contenedor

```css
.contenedor {
  display: flex;

  /* Dirección del eje principal */
  flex-direction: row;       /* row | row-reverse | column | column-reverse */

  /* Alineación en el eje principal */
  justify-content: flex-start; /* flex-start | flex-end | center | space-between | space-around | space-evenly */

  /* Alineación en el eje cruzado */
  align-items: stretch;     /* stretch | flex-start | flex-end | center | baseline */

  /* Espacio entre elementos */
  gap: 1rem;
  /* o por separado: */
  row-gap: 0.5rem;
  column-gap: 1rem;

  /* ¿Los elementos saltan a la siguiente fila si no entran? */
  flex-wrap: nowrap;        /* nowrap | wrap | wrap-reverse */

  /* Alineación de filas cuando hay wrap */
  align-content: flex-start;
}
```

### Propiedades de los hijos (flex items)

```css
.hijo {
  /* Cuánto crece para ocupar espacio disponible */
  flex-grow: 0;

  /* Cuánto se encoge si no hay espacio */
  flex-shrink: 1;

  /* Tamaño base antes de distribuir el espacio */
  flex-basis: auto;

  /* Shorthand: flex-grow flex-shrink flex-basis */
  flex: 1;          /* equivale a: 1 1 0% */
  flex: 0 0 200px;  /* tamaño fijo de 200px, no crece ni se encoge */

  /* Alineación individual (sobreescribe align-items del padre) */
  align-self: center;

  /* Orden visual (sin cambiar el HTML) */
  order: 0;
}
```

### Caso práctico 1: Navbar

Logo a la izquierda, links a la derecha.

```html
<nav class="navbar">
  <a class="logo" href="/">Mi Sitio</a>
  <ul class="links">
    <li><a href="/sobre">Sobre mí</a></li>
    <li><a href="/proyectos">Proyectos</a></li>
    <li><a href="/contacto">Contacto</a></li>
  </ul>
</nav>
```

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}
```

### Caso práctico 2: Card con imagen + contenido que se apila en mobile

```html
<article class="card">
  <img src="foto.jpg" alt="Imagen">
  <div class="card__content">
    <h2>Título</h2>
    <p>Descripción del contenido de la tarjeta.</p>
  </div>
</article>
```

```css
.card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.card img {
  width: 200px;
  flex-shrink: 0; /* La imagen no se encoge */
}

/* En pantallas chicas, los elementos se apilan */
@media (max-width: 600px) {
  .card {
    flex-direction: column;
  }

  .card img {
    width: 100%;
  }
}
```

### Referencia visual interactiva

🐸 [Flexbox Froggy](https://flexboxfroggy.com) — aprendé Flexbox jugando.

---

## 5. 🔲 CSS Grid

Grid es el sistema de layout para **dos dimensiones**: controlás filas Y columnas al mismo tiempo. Es ideal para estructurar el layout completo de una página.

> 💡 **Combinación recomendada:** Grid para el layout de página → Flex para los componentes dentro.

### Conceptos clave

- **Grid Container**: el padre con `display: grid`.
- **Grid Items**: los hijos directos.
- **Grid Line**: las líneas divisorias (numeradas desde 1).
- **Grid Track**: el espacio entre dos líneas (una fila o columna).
- **Grid Cell**: la intersección entre una fila y una columna.
- **Grid Area**: un conjunto rectangular de celdas.

### Propiedades del contenedor

```css
.grilla {
  display: grid;

  /* Define columnas */
  grid-template-columns: 1fr 2fr 1fr;  /* 3 columnas con fracciones */
  grid-template-columns: 240px 1fr;    /* Sidebar fija + contenido flexible */
  grid-template-columns: repeat(3, 1fr); /* Shorthand: 3 columnas iguales */

  /* Define filas */
  grid-template-rows: 60px 1fr 50px;  /* Header, contenido, footer */
  grid-template-rows: auto 1fr auto;  /* Se adaptan al contenido */

  /* Espacio entre celdas */
  gap: 1.5rem;
  row-gap: 1rem;
  column-gap: 2rem;

  /* Alineación de los items dentro de sus celdas */
  justify-items: stretch; /* start | end | center | stretch */
  align-items: stretch;

  /* Alineación del grid completo dentro del contenedor */
  justify-content: start;
  align-content: start;
}
```

### El combo mágico: `repeat()` + `minmax()`

Grids responsivos **sin media queries**:

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

- `minmax(250px, 1fr)` → cada columna tiene mínimo 250px y máximo 1fr.
- `auto-fit` → colapsa columnas vacías y estira las existentes ✅ (lo más común).
- `auto-fill` → mantiene columnas vacías (útil si querés reservar espacio).

### Propiedades de los Grid Items

```css
.item {
  /* Posicionamiento por número de línea */
  grid-column: 1 / 3;   /* de la línea 1 a la 3 (ocupa 2 columnas) */
  grid-row: 2 / 4;      /* de la línea 2 a la 4 (ocupa 2 filas) */

  /* Con span: "ocupá N tracks" */
  grid-column: 1 / span 2;  /* equivalente al ejemplo de arriba */
  grid-column: 1 / -1;      /* de la primera a la última línea (todo el ancho) */

  /* Alineación individual */
  justify-self: center;
  align-self: center;
}
```

### Layout con `grid-template-areas`

Una forma visual y semántica de definir el layout:

```html
<div class="layout">
  <header class="header">Header</header>
  <nav class="sidebar">Sidebar</nav>
  <main class="main">Contenido</main>
  <footer class="footer">Footer</footer>
</div>
```

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 60px 1fr 50px;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  min-height: 100vh;
  gap: 1rem;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

### Layout responsivo combinando Grid + Media Queries

```css
.layout {
  display: grid;
  gap: 1rem;

  /* Mobile: todo en una sola columna */
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
}

/* Tablet */
@media screen and (min-width: 768px) {
  .layout {
    grid-template-columns: 1fr 2fr;
    grid-template-areas:
      "header  header"
      "sidebar main"
      "footer  footer";
  }
}

/* Desktop */
@media screen and (min-width: 1024px) {
  .layout {
    grid-template-columns: 240px 1fr;
    grid-template-rows: 60px 1fr 50px;
  }
}
```

### Referencia visual interactiva

🌱 [CSS Grid Garden](https://cssgridgarden.com) — aprendé Grid jugando.

---

## 6. 🍃 Tailwind CSS — utility-first

Tailwind es un framework CSS donde en vez de escribir clases semánticas (`.card`, `.navbar`), aplicás clases de utilidad directamente en el HTML. Cada clase hace **una sola cosa**.

### El problema que resuelve

Con CSS clásico necesitás saltar entre el HTML y el archivo CSS constantemente. Con Tailwind, el estilo está en el mismo lugar que el markup.

```html
<!-- CSS clásico: necesitás ir al .css para ver el estilo -->
<div class="card">
  <h2 class="card__title">Título</h2>
  <p class="card__body">Texto</p>
</div>

<!-- Tailwind: el estilo está acá mismo -->
<div class="rounded-xl bg-white p-6 shadow-md">
  <h2 class="text-xl font-semibold text-gray-800">Título</h2>
  <p class="mt-2 text-gray-600">Texto</p>
</div>
```

### Clases esenciales para empezar

| Categoría   | Ejemplos                                                      |
|-------------|---------------------------------------------------------------|
| Layout      | `flex`, `grid`, `block`, `hidden`, `inline-flex`             |
| Espaciado   | `p-4`, `px-6`, `py-2`, `m-2`, `mt-4`, `gap-4`, `space-x-3` |
| Tipografía  | `text-sm`, `text-xl`, `text-2xl`, `font-bold`, `leading-6`  |
| Color       | `bg-blue-500`, `text-gray-700`, `border-red-400`             |
| Bordes      | `rounded-lg`, `rounded-full`, `border`, `border-2`           |
| Sombras     | `shadow`, `shadow-md`, `shadow-xl`                           |
| Responsive  | `md:flex`, `lg:grid-cols-3`, `sm:hidden`                     |
| Hover/Focus | `hover:bg-blue-600`, `focus:ring-2`, `active:scale-95`       |

### Responsive en Tailwind

Tailwind usa prefijos de breakpoint con enfoque **mobile-first**:

```html
<!-- Oculto en mobile, visible como flex desde tablets -->
<nav class="hidden md:flex gap-4">
  <a href="/">Inicio</a>
  <a href="/sobre">Sobre mí</a>
</nav>

<!-- 1 columna en mobile, 2 en tablet, 3 en desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="bg-white rounded-xl p-4 shadow">Card 1</div>
  <div class="bg-white rounded-xl p-4 shadow">Card 2</div>
  <div class="bg-white rounded-xl p-4 shadow">Card 3</div>
</div>
```

| Prefijo | Breakpoint  |
|---------|-------------|
| (nada)  | 0px+ (mobile) |
| `sm:`   | 640px+      |
| `md:`   | 768px+      |
| `lg:`   | 1024px+     |
| `xl:`   | 1280px+     |

### Navbar completa con Tailwind

```html
<nav class="flex justify-between items-center px-8 py-4 bg-white shadow">
  <a href="/" class="text-xl font-bold text-blue-600">Mi Sitio</a>
  <ul class="hidden md:flex gap-6 list-none">
    <li><a href="/sobre" class="text-gray-600 hover:text-blue-600">Sobre mí</a></li>
    <li><a href="/proyectos" class="text-gray-600 hover:text-blue-600">Proyectos</a></li>
    <li>
      <a href="/contacto" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Contacto
      </a>
    </li>
  </ul>
</nav>
```

### Para probar sin instalar nada

🎮 [Tailwind Play](https://play.tailwindcss.com) — playground oficial en el navegador.

> **Importante:** Tailwind no reemplaza entender CSS. Es una capa de velocidad sobre el mismo modelo mental de siempre. Si no entendés Flexbox o Grid, las clases `flex` o `grid` de Tailwind tampoco van a tener sentido.

---

## 7. 🧠 Resumen y cuándo usar cada herramienta

| Herramienta         | Cuándo usarla                                                         |
|---------------------|-----------------------------------------------------------------------|
| **Box Model**       | Siempre. Entender cómo se calcula el espacio de cada elemento.        |
| **Variables CSS**   | Colores, spacings, tipografías — todo lo que se repite o puede variar.|
| **Flexbox**         | Componentes: navbar, cards, listas, alinear cosas en una dimensión.   |
| **Grid**            | Layout de página: header/sidebar/main/footer, grillas de cards.       |
| **Tailwind**        | Proyectos donde la velocidad de prototipado es prioridad.             |

### Combinación ideal

```css
/* Grid para el layout de página */
.page {
  display: grid;
  grid-template-areas:
    "header"
    "main"
    "footer";
}

/* Flex para los componentes dentro de cada zona */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

---

## 8. 📚 Recursos para seguir practicando

- 🐸 [Flexbox Froggy](https://flexboxfroggy.com) — Flexbox interactivo
- 🌱 [CSS Grid Garden](https://cssgridgarden.com) — Grid interactivo
- 🎮 [Tailwind Play](https://play.tailwindcss.com) — Tailwind sin instalación
- 📖 [MDN Web Docs — CSS](https://developer.mozilla.org/es/docs/Web/CSS)

---

#curso #css #flexbox #grid #tailwind
