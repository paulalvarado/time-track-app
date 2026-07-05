---
name: vercel-design
description: 'Aplicar el sistema de diseño inspirado en Vercel (Geist) a componentes frontend React/TypeScript con Tailwind CSS. Úsalo para: crear o actualizar UI con tokens de color, tipografía, spacing, bordes y sombras; auditar consistencia visual; convertir diseños a componentes con el design system Vercel. Incluye: /vercel-design audit — auditar consistencia visual de un componente/page. /vercel-design component — generar/actualizar un componente con los tokens correctos.'
user-invocable: true
argument-hint: 'describe qué componente o UI quieres diseñar, crear o auditar'
references:
  - tokens: ./references/design-tokens.md
---

# Vercel Design System Skill

Sistema de diseño inspirado en Vercel — una interpretación del lenguaje visual de Geist, el design system de Vercel. Proporciona tokens de color, tipografía, spacing, bordes, sombras y componentes predefinidos para crear interfaces consistentes con estética developer-platform.

## Cuándo usarlo

- **Crear** un nuevo componente y quieres que siga el diseño Vercel
- **Auditar** la consistencia visual de una página o componente existente
- **Refactorizar** UI actual para alinearla con los tokens del sistema
- **Generar** layouts (cards, formularios, navegación, pricing tables, hero sections)
- **Diseñar** estados empty, modales, toasts, data tables

## Procedimiento

### 1. Analizar el contexto
- Identifica el tipo de componente o página a diseñar
- Revisa la especificación completa de tokens en [design-tokens.md](./references/design-tokens.md)
- Determina qué variante aplicar (marketing-scale vs in-app, light vs dark/polarity-flipped)

### 2. Aplicar tokens de color
Usa los tokens de `colors` del reference. Reglas clave:
- **Fondo de página**: `canvas-soft` (`#fafafa`)
- **Fondo de card**: `canvas` (`#ffffff`)
- **Textos principales**: `ink` (`#171717`)
- **Textos secundarios**: `body` (`#4d4d4d`)
- **Textos mutados/placeholder**: `mute` (`#888888`)
- **Bordes/separadores**: `hairline` (`#ebebeb`)
- **CTAs primarios**: `primary` (`#171717`) con texto `on-primary` (`#ffffff`)
- **Enlaces**: `link` (`#0070f3`)
- **Estados semánticos**: usar `error`, `warning`, `success` con sus variantes soft/deep

### 3. Aplicar tipografía
Usa los tokens de `typography` del reference. Reglas clave:
- **Headings**: usar tokens `display-*` con weight 600, tracking negativo obligatorio
- **Body**: usar tokens `body-*` con weight 400
- **Botones marketing**: `button-lg` (16px/500)
- **Botones in-app/nav**: `button-md` (14px/500)
- **Etiquetas técnicas/code**: `caption-mono` o `code` (Geist Mono / JetBrains Mono)
- **NUNCA** usar weight > 600 en la sans geométrica
- **NUNCA** usar all-caps en headings
- **Headings en sentence-case, con punto final** (ej: "Build and deploy on the AI Cloud.")

### 4. Aplicar spacing
Usa los tokens de `spacing` del reference. Base unitaria: 4px.
- **Padding de cards marketing**: `lg` (24px) o `xl` (32px)
- **Padding de cards densas (grids)**: `md` (16px)
- **Separación entre secciones**: `4xl` (64px) a `5xl` (96px)
- **Gap entre elementos inline**: `sm` (12px) a `md` (16px)
- **Hero sections**: `section` (192px) de padding vertical

### 5. Aplicar border radius
Usa los tokens de `rounded` del reference.
- **CTAs marketing**: `pill` (100px)
- **CTAs in-app/nav**: `sm` (6px)
- **Cards marketing**: `md` (8px)
- **Cards grandes/pricing**: `lg` (12px)
- **Pills de tabs**: `pill-sm` (64px)
- **Inputs**: `sm` (6px)
- **Badges**: `full` (9999px)

### 6. Aplicar elevation (sombras)
Usa los niveles de elevación del reference.
- **Cards por defecto**: Level 1 — inset hairline
- **Cards elevadas (template-grid)**: Level 2
- **Feature cards**: Level 3 — soft stack
- **Pricing cards**: Level 4 — float stack
- **Modales/dialogs**: Level 5
- **Siempre usar sombras apiladas** (`box-shadow` con múltiples offsets), nunca una sola sombra heavy
- **Siempre incluir inset hairline** en cards para que el borde se vea nítido

### 7. Para marketing pages
- Alternar fondos de sección: `canvas-soft` → `canvas` → `primary` (banda oscura polarizada)
- El mesh gradient (gradiente multicolor cyan/blue/magenta/amber) se usa SOLO a escala hero
- NO miniaturizar el gradient, NO reducir a un solo color
- Usar mono (`caption-mono`) para eyebrows de sección y etiquetas técnicas

### 8. Para componentes in-app (dashboard)
- Usar `form-input` (height 40px) como input por defecto
- Usar `form-input-sm` (32px) para espacios ajustados
- Usar `nav-bar` (height 64px) para la barra de navegación superior
- Usar `nav-link` con `rounded.full` para links de navegación
- Tablas: header en `caption-mono` uppercase, body en `body-sm`

### 9. Auditar consistencia
Cuando se invoque con "audit" o "auditar":
- Revisar que todos los colores correspondan a tokens del sistema
- Verificar que no haya weights de fuente > 600 en la sans
- Verificar que headings usen tracking negativo
- Verificar que las sombras sean apiladas, no drop-shadows simples
- Verificar que los CTAs sigan la escala correcta (pill 100px marketing vs sm 6px in-app)
- Verificar que mono solo se use para capa técnica (no body paragraphs)

## Referencia rápida de componentes

| Componente | Background | Texto | Border Radius | Padding | Shadow |
|---|---|---|---|---|---|
| `button-primary` | primary | on-primary | pill (100px) | 0 sm | — |
| `button-secondary` | canvas | ink | pill (100px) | 0 sm | — |
| `card-marketing` | canvas | ink | md (8px) | lg | Level 3 |
| `card-marketing-large` | canvas | ink | lg (12px) | xl | Level 4 |
| `form-input` | canvas | ink | sm (6px) | 0 sm | hairline border |
| `pricing-card` | canvas | ink | lg (12px) | xl | Level 4 |
| `badge-secondary` | canvas-soft | body | full | 0 xs | — |

Para la especificación completa de todos los componentes, colores, tipografía, spacing y sombras, consulta [design-tokens.md](./references/design-tokens.md).
