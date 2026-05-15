# Nova Hub Color System v1.0

## Philosophy

Blue is the primary — the vastness, the calm, the depth. Gold is the accent — the warmth, the pulse, the intelligence. Gradients create motion, life, the breathing of the system.

---

## Core Palette

### Primary Blues (The Ocean)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `nova-deep` | `#0a1628` | 10, 22, 40 | Background base, darkest depth |
| `nova-midnight` | `#0f1a3a` | 15, 26, 58 | Card backgrounds, panels |
| `nova-primary` | `#1a3a5c` | 26, 58, 92 | Primary surfaces, active states |
| `nova-bright` | `#2563eb` | 37, 99, 235 | Interactive elements, links |
| `nova-cyan` | `#06b6d4` | 6, 182, 212 | Highlights, data viz, glow accents |
| `nova-sky` | `#7dd3fc` | 125, 211, 252 | Light accents, hover states |

### Accent Golds (The Pulse)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `gold-muted` | `#78350f` | 120, 53, 15 | Subtle warmth, borders |
| `gold-soft` | `#a16207` | 161, 98, 7 | Secondary accents |
| `gold-warm` | `#ca8a04` | 202, 138, 4 | Primary gold, highlights |
| `gold-bright` | `#fbbf24` | 251, 191, 36 | Active gold, pulses, stars |
| `gold-glow` | `#fde047` | 253, 224, 71 | Glow effects, strongest accent |

### Neutrals (The Void)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `ink-darkest` | `#020617` | 2, 6, 23 | Deepest void, shadows |
| `ink-dark` | `#1e293b` | 30, 41, 59 | Text primary, borders |
| `ink-mid` | `#475569` | 71, 85, 105 | Text secondary |
| `ink-light` | `#94a3b8` | 148, 163, 184 | Text tertiary, muted |
| `nova-white` | `#f8fafc` | 248, 250, 252 | Primary text, stars |

---

## Gradient System

### Hero Gradients (Backgrounds, Large Surfaces)

```css
/* Deep Ocean — Default background */
--gradient-ocean: linear-gradient(
  135deg,
  #0a1628 0%,
  #0f1a3a 50%,
  #1a3a5c 100%
);

/* Twilight Pulse — Active/selected states */
--gradient-twilight: linear-gradient(
  160deg,
  #1a3a5c 0%,
  #2563eb 60%,
  #06b6d4 100%
);

/* Golden Hour — Special moments, achievements */
--gradient-gold: linear-gradient(
  135deg,
  #78350f 0%,
  #ca8a04 50%,
  #fbbf24 100%
);

/* Nova Core — The pulsing center */
--gradient-nova: radial-gradient(
  circle at center,
  #fde047 0%,
  #fbbf24 20%,
  #ca8a04 40%,
  transparent 70%
);
```

### Animation Gradients (Breathing, Motion)

```css
/* Aurora — Subtle background shift */
--gradient-aurora: linear-gradient(
  90deg,
  #0a1628 0%,
  #1a3a5c 25%,
  #2563eb 50%,
  #1a3a5c 75%,
  #0a1628 100%
);
background-size: 200% 200%;
animation: aurora 15s ease infinite;

/* Pulse — Active element glow */
--gradient-pulse: radial-gradient(
  circle at center,
  rgba(251, 191, 36, 0.3) 0%,
  rgba(202, 138, 4, 0.1) 50%,
  transparent 70%
);

/* Horizon — Card surfaces */
--gradient-horizon: linear-gradient(
  180deg,
  rgba(15, 26, 58, 0.9) 0%,
  rgba(10, 22, 40, 0.95) 100%
);
```

---

## Animation Specifications

### Aurora Shift (Background)
```css
@keyframes aurora {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
duration: 15s;
easing: ease;
```

### Nova Pulse (The Glow)
```css
@keyframes nova-pulse {
  0%, 100% { 
    opacity: 0.6;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.05);
  }
}
duration: 4s;
easing: ease-in-out;
iteration: infinite;
```

### Gold Shimmer (Accents)
```css
@keyframes gold-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
background: linear-gradient(
  90deg,
  transparent 0%,
  rgba(251, 191, 36, 0.3) 50%,
  transparent 100%
);
background-size: 200% 100%;
duration: 3s;
easing: linear;
```

---

## Usage Patterns

### Background Layers
1. **Base:** `nova-deep` (#0a1628) solid
2. **Aurora:** `gradient-aurora` with animation (subtle, slow)
3. **Stars:** White dots at 10-30% opacity, twinkling
4. **Nebula:** Soft `gradient-nova` at focal points

### UI Surfaces
- **Cards:** `gradient-horizon` with `nova-midnight` border
- **Active Card:** `gradient-twilight` with `gold-warm` glow border
- **Buttons:** `nova-primary` → `nova-bright` on hover, `gold-bright` text
- **Input Fields:** `ink-darkest` background, `nova-cyan` focus ring

### The Neural Graph
- **Nodes (inactive):** `nova-midnight` fill, `ink-mid` stroke
- **Nodes (hover):** `nova-primary` fill, `nova-cyan` stroke
- **Nodes (active):** `gradient-twilight` fill, `gold-bright` stroke, `gradient-pulse` glow
- **Edges:** Gradient from `nova-midnight` to `nova-cyan` based on activity
- **Pulses:** `gold-glow` traveling along edges toward active nodes

### Typography
- **Primary:** `nova-white` (#f8fafc)
- **Secondary:** `ink-light` (#94a3b8)
- **Accent:** `gold-bright` (#fbbf24) for highlights, names
- **Links:** `nova-cyan` (#06b6d4), `gold-bright` on hover

### Nova Avatar Presence
- **Idle:** Soft `gradient-nova` halo, subtle `nova-pulse` animation
- **Speaking/Active:** Intensified glow, `gold-shimmer` edge
- **Thinking:** `nova-cyan` pulse waves radiating outward

---

## Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        nova: {
          deep: '#0a1628',
          midnight: '#0f1a3a',
          primary: '#1a3a5c',
          bright: '#2563eb',
          cyan: '#06b6d4',
          sky: '#7dd3fc',
        },
        gold: {
          muted: '#78350f',
          soft: '#a16207',
          warm: '#ca8a04',
          bright: '#fbbf24',
          glow: '#fde047',
        },
        ink: {
          darkest: '#020617',
          dark: '#1e293b',
          mid: '#475569',
          light: '#94a3b8',
        },
      },
      animation: {
        'aurora': 'aurora 15s ease infinite',
        'nova-pulse': 'nova-pulse 4s ease-in-out infinite',
        'gold-shimmer': 'gold-shimmer 3s linear infinite',
      },
      keyframes: {
        aurora: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'nova-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'gold-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
}
```

---

## Implementation Priority

1. **Phase 1:** Update `tailwind.config.js` with new color tokens
2. **Phase 2:** Replace background with `gradient-aurora`
3. **Phase 3:** Apply `gradient-horizon` to cards
4. **Phase 4:** Add `nova-pulse` animation to active elements
5. **Phase 5:** Implement gold shimmer on Nova Avatar presence

---

*Designed for Nova Hub v2.0 — Blue vastness, gold intelligence.*
