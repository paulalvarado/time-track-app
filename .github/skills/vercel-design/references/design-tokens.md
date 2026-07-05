# Vercel Design System — Tokens de Diseño

> Especificación completa del sistema de diseño inspirado en Vercel (Geist).
> Versión: alpha

---

## Colores

### Token map
| Token | Hex | Uso |
|---|---|---|
| `primary` | `#171717` | CTA primario, fondo de bandas oscuras |
| `on-primary` | `#ffffff` | Texto sobre fondo primary |
| `ink` | `#171717` | Texto principal (headings, body) |
| `body` | `#4d4d4d` | Texto secundario |
| `mute` | `#888888` | Texto de baja prioridad (placeholders) |
| `hairline` | `#ebebeb` | Bordes de 1px, separadores |
| `hairline-strong` | `#a1a1a1` | Divisores más fuertes |
| `canvas` | `#ffffff` | Fondo de cards, modales, dialogs |
| `canvas-soft` | `#fafafa` | Fondo de página por defecto |
| `canvas-soft-2` | `#f5f5f5` | Fondo de inset (código, dropdowns) |
| `link` | `#0070f3` | Enlaces inline |
| `link-deep` | `#0761d1` | Enlace presionado/visited |
| `link-bg-soft` | `#d3e5ff` | Fondo de badges informacionales |
| `success` | `#0070f3` | Indicador de éxito |
| `error` | `#ee0000` | Error / acción destructiva |
| `error-soft` | `#f7d4d6` | Fondo de estado destructivo |
| `error-deep` | `#c50000` | Estado destructivo presionado |
| `warning` | `#f5a623` | Precaución / pendiente |
| `warning-soft` | `#ffefcf` | Fondo de warning |
| `warning-deep` | `#ab570a` | Warning presionado |
| `violet` | `#7928ca` | Acento púrpura |
| `violet-soft` | `#d8ccf1` | Fondo violeta suave |
| `violet-deep` | `#4c2889` | Violeta profundo |
| `cyan` | `#50e3c2` | Cyan del gradient |
| `cyan-soft` | `#aaffec` | Fondo cyan suave |
| `cyan-deep` | `#29bc9b` | Cyan profundo |
| `highlight-pink` | `#ff0080` | Magenta del gradient |
| `highlight-magenta` | `#eb367f` | Magenta secundario |

### Brand Gradient (mesh gradient)

Tres pares de gradientes que se colapsan en un solo mesh gradient:

| Par | Start | End |
|---|---|---|
| Develop | `#007cf0` (azul) | `#00dfd8` (teal) |
| Preview | `#7928ca` (violeta) | `#ff0080` (rosa) |
| Ship | `#ff4d4d` (coral) | `#f9cb28` (ámbar) |

**Reglas:**
- Usar SOLO a escala hero (atmospheric backdrop)
- No miniaturizar a icono
- No reducir a un solo color
- No reordenar los stops
- Tratar como un objeto unificado

---

## Tipografía

### Fuentes
- **Geometric Sans (Geist)**: todas las narrativas (display, body, button)
- **Geist Mono**: capa técnica (código, terminal, etiquetas)
- **Sustitutos open-source**: Inter (sans) · JetBrains Mono (mono)

### Token hierarchy

| Token | Size | Weight | Line H | Letter Spacing | Uso |
|---|---|---|---|---|---|
| `display-xl` | 48px | 600 | 48px | -2.4px | Hero headline |
| `display-lg` | 32px | 600 | 40px | -1.28px | Section headlines |
| `display-md` | 24px | 600 | 32px | -0.96px | Card headlines, pricing |
| `display-sm` | 20px | 600 | 28px | -0.6px | Micro-headings |
| `body-lg` | 18px | 400 | 28px | 0 | Lead paragraphs |
| `body-md` | 16px | 400 | 24px | 0 | Body por defecto |
| `body-md-strong` | 16px | 500 | 24px | 0 | Body enfatizado |
| `body-sm` | 14px | 400 | 20px | -0.28px | Secundario, nav-links |
| `body-sm-strong` | 14px | 500 | 20px | -0.28px | Nav CTAs, tablas |
| `caption` | 12px | 400 | 16px | 0 | Footer, badges |
| `caption-mono` | 12px | 400 | 16px | 0 | Eyebrows técnicos |
| `code` | 13px | 400 | 20px | 0 | Código inline, terminal |
| `button-md` | 14px | 500 | 20px | 0 | Botones in-app/nav |
| `button-lg` | 16px | 500 | 24px | 0 | Botones marketing |

### Reglas tipográficas
- **Tracking negativo obligatorio** en display sizes
- **Sentence-case, con punto final** — "Build and deploy on the AI Cloud."
- **Weight 600 es el techo** — nunca usar 700+
- **Mono solo para capa técnica** — nunca body paragraphs
- **Nunca all-caps** (excepto etiquetas mono)

---

## Spacing

| Token | px | Uso |
|---|---|---|
| `xxs` | 4 | Base unit |
| `xs` | 8 | Gap pequeños |
| `sm` | 12 | Gap inline, padding buttons |
| `md` | 16 | Gap entre elementos |
| `lg` | 24 | Padding cards, gutters |
| `xl` | 32 | Padding cards grandes |
| `2xl` | 40 | — |
| `3xl` | 48 | — |
| `4xl` | 64 | Padding secciones |
| `5xl` | 96 | Padding secciones grandes |
| `6xl` | 128 | — |
| `section` | 192 | Hero bands |

Base unitaria: **4px**. Todos los valores son múltiplos de 4.

---

## Border Radius

| Token | px | Uso |
|---|---|---|
| `none` | 0 | Bandas full-bleed |
| `xs` | 4 | — |
| `sm` | 6 | Inputs, botones in-app, nav CTAs |
| `md` | 8 | Cards marketing, feature cards |
| `lg` | 12 | Pricing cards |
| `xl` | 16 | Cards con hero image cap |
| `pill-sm` | 64 | Tab pills |
| `pill` | 100 | CTAs marketing |
| `full` | 9999 | Badges, icon buttons |

---

## Elevation (Sombras apiladas)

| Level | Tratamiento | Uso |
|---|---|---|
| Level 0 | Sin sombra, sin borde | Bandas full-bleed, secciones oscuras |
| Level 1 | `0 0 0 1px #00000014` inset | Card chrome por defecto |
| Level 2 | `0px 1px 1px #00000005, 0px 2px 2px #0000000a` + inset hairline | Template-grid, marketing-card |
| Level 3 | `0px 2px 2px #0000000a, 0px 8px 8px -8px #0000000a` + inset hairline | Feature-grid cards |
| Level 4 | `0px 2px 2px #0000000a, 0px 8px 16px -4px #0000000a` + inset hairline | Pricing cards, callout panels |
| Level 5 | `0px 1px 1px #00000005, 0px 8px 16px -4px #0000000a, 0px 24px 32px -8px #0000000f` + inset hairline | Modales, dialogs, dropdowns |

**Siempre usar sombras apiladas** (múltiples offsets), nunca una sola drop-shadow pesada. Incluir inset hairline para bordes nítidos.

---

## Componentes

### Botones

#### Marketing scale
| Componente | BG | Texto | Radius | Padding | Height |
|---|---|---|---|---|---|
| `button-primary` | primary | on-primary | pill (100px) | 0 sm | ~48px |
| `button-secondary` | canvas | ink | pill (100px) | 0 sm | ~48px |

#### In-app / Nav scale
| Componente | BG | Texto | Radius | Padding | Height |
|---|---|---|---|---|---|
| `button-primary-sm` | primary | on-primary | pill (100px) | 0 xs | ~32px |
| `button-secondary-sm` | canvas | ink | pill (100px) | 0 xs | ~32px |
| `nav-cta-signup` | primary | on-primary | sm (6px) | 0 xs | 28px |
| `nav-cta-login` | canvas | ink | sm (6px) | 0 xs | 28px |
| `nav-cta-ask-ai` | canvas | ink | sm (6px) | 0 xs | 28px |

#### Otros
| Componente | BG | Texto | Radius | Padding |
|---|---|---|---|---|
| `tab-ghost` | canvas | ink | pill-sm (64px) | 0 md |
| `icon-button-circular` | canvas | ink | full | — |

### Cards & Contenedores

| Componente | BG | Radius | Padding | Shadow |
|---|---|---|---|---|
| `card-marketing` | canvas | md (8px) | lg (24px) | Level 3 |
| `card-marketing-large` | canvas | lg (12px) | xl (32px) | Level 4 |
| `card-soft` | canvas-soft | md (8px) | lg (24px) | Level 1 |
| `template-card` | canvas | md (8px) | md (16px) | Level 2 |
| `code-editor-mockup` | primary | md (8px) | lg (24px) | — |
| `pricing-card` | canvas | lg (12px) | xl (32px) | Level 4 |
| `pricing-card-featured` | primary | lg (12px) | xl (32px) | Level 5 |

### Inputs

| Componente | Height | Font | Radius |
|---|---|---|---|
| `form-input` | 40px | body-sm (14px) | sm (6px) |
| `form-input-sm` | 32px | body-sm (14px) | sm (6px) |
| `form-input-lg` | 48px | body-md (16px) | sm (6px) |

### Navegación

| Componente | BG | Height | Padding |
|---|---|---|---|
| `nav-bar` | canvas | 64px | sm lg |
| `nav-link` | — | — | xs sm |
| `footer` | canvas | — | 4xl lg |

### Signature Components

| Componente | BG | Typography | Padding |
|---|---|---|---|
| `hero-band` | canvas | display-xl | 4xl lg |
| `feature-mesh-band` | canvas | display-lg | 5xl lg |
| `showcase-band-light` | canvas-soft | display-lg | 5xl lg |
| `showcase-band-dark` | primary | display-lg | 5xl lg |
| `logo-strip` | canvas | body-sm | lg xl |
| `badge-secondary` | canvas-soft | caption | 0 xs |
| `banner-marketing` | canvas-soft | body-sm | xs sm |
| `link-inline` | — | body-md | — |

### Ejemplos ilustrativos (app-shell)

| Componente | Uso | BG | Radius | Padding |
|---|---|---|---|---|
| `ex-auth-form-card` | Login / registro | canvas-soft | lg | xl |
| `ex-modal-card` | Modal / dialog | canvas | lg | xl |
| `ex-empty-state-card` | Estado vacío | canvas-soft | lg | 3xl |
| `ex-toast` | Notificación | canvas | md | sm md |
| `ex-data-table-cell` | Tabla (header canvas-soft) | — | — | xs sm |
| `ex-app-shell-row` | Sidebar row | canvas | sm | xs sm |

---

## Layout & Responsive

### Breakpoints
| Viewport | Width | Cambios |
|---|---|---|
| Mobile | < 600px | Hero stack, nav → hamburguesa, grids 3→1 |
| Tablet | 600–959px | Grids 3→2 |
| Desktop | 960–1199px | Full layout |
| Wide | 1200–1399px | Container max 1400px |
| Ultra-wide | ≥ 1400px | Centrado a 1400px |

### Max width
- **Marketing**: ~1400px (`--ds-page-width`)
- Gutters: `lg` (24px) desktop, `md` (16px) mobile

### Patrones de grid
- **3-up feature row**: 3 columnas desktop → 1 columna mobile
- **Tab pill row**: 5 pills centrados
- **Template grid**: 5 columnas → 1 columna
- **Pricing grid**: 3 columnas, tier medio destacado (polarity-flipped)
- **Logo strip**: ~5 logos, single row

---

## Do's and Don'ts

### ✅ Do
- Usar `primary` (#171717) para CTAs principales
- Usar `pill` (100px) para CTAs marketing y `sm` (6px) para nav
- Headings en weight 600, sentence-case, con punto final, tracking negativo
- Mesh gradient solo a escala hero
- Sombras apiladas (stacked shadows) con inset hairline
- Alternar fondos: `canvas-soft` → `canvas` → `primary` (dark band)
- Mono para código y etiquetas técnicas

### ❌ Don't
- No introducir colores de acento adicionales
- No usar all-caps en headings
- No usar drop-shadow simple (siempre apilada)
- No miniaturizar el mesh gradient
- No usar weight > 600 en la sans
- No mezclar pill 100px con sm 6px en la misma pantalla
- No usar mono en body paragraphs
