<!-- /taste · https://rain-on-glass-production.up.railway.app · catturato 26/09/2026 con Playwright (Chromium 1440x900) + references/extract.js -->

# Design Map

## Spacing Scale
12px, 16px, 30px, 44px (unità base: 4)

## Font Hierarchy
- hint: 15px / 500 / ui-sans-serif
- link-pill: 12.5px / 500 / ui-sans-serif
- title: 12px / 600 / ui-sans-serif
- keys: 11px / 400 / ui-sans-serif

## Color Palette
- page/frame: `#040507`
- window-frame (wood): `#1A140F`
- ink: `#E8E3DA`
- pill-surface: `rgba(12,12,16,0.52)`
- fog-tint (shader): `vec3(.82,.86,.95) x scene`

## Image Ratios
- single full-viewport canvas: viewport (1440x900)

## Component Tokens
- raggi: 999px
- ombre: 0 2px 10px rgba(0,0,0,.35) | inset 0 0 0 1px rgba(255,232,200,.07), inset 0 0 0 5px #0A0806 (window frame)
- griglia: {"max_width": "none", "columns": 0, "gutter": "30px frame inset"}
- interazione: brush_radius_px = 36
- interazione: clear_hold = 1.9
- interazione: decay_per_s = 0.15
- interazione: full_clear_plateau_s = 6
- interazione: refog_s = 6.7
- interazione: refog = patchy, fbm nucleation mask
- interazione: drips = max 40, spawn at stroke edge, 22-60px run
- interazione: wipe_trigger = press + drag only (no hover wipe)
- interazione: cursor = custom gloved hand SVG, body{cursor:none}
- interazione: touch_action = none on body
- interazione: dpr_cap = 2 desktop / 1.5 coarse pointer
- interazione: reduced_motion = not handled
- interazione: fallback = text 'This demo needs WebGL2' only
- interazione: sound = optional, key M

---

# Taste DNA

### Il vapore torna come un fenomeno, non come un timer
- **Trigger**: Quando la zona pulita deve ricoprirsi
- **Decision**: Scelto un ritorno a chiazze (maschera fbm di nucleazione) dopo un plateau di pulito pieno, invece di una dissolvenza uniforme di opacità
- **Reason**: Una dissolvenza uniforme si legge come animazione CSS; le chiazze che nascono prima in certi punti si leggono come condensa vera, e il plateau lascia il tempo di guardare cosa si è scoperto
- **Evidence**: HOLD = 1.9, DECAY = .15/s: ~6 s pieno pulito, poi ~6.7 s di ritorno; commento sorgente: 're-fogging nucleates in patches'; screenshot a 300 ms, 10 s, 20 s: la traccia resta leggibile a 20 s in headless

### La traccia ha un bordo e un peso
- **Trigger**: Quando il dito passa sul vetro
- **Decision**: Scelto un pennello di 36 px con bordo netto e goccia che parte dal bordo basso della traccia, invece di un gradiente morbido 'a gomma'
- **Reason**: Il bordo netto con il labbro d'acqua è ciò che distingue un vetro pulito da una maschera di trasparenza; la goccia dà gravità al gesto
- **Evidence**: BRUSH = 36; wipe-300ms.jpeg: bordo della traccia definito, una goccia scende dal bordo inferiore a x≈470; drips.push max 22-60 px di corsa

### Tutto il resto tace
- **Trigger**: Quando l'interfaccia convive con una superficie interattiva a tutto schermo
- **Decision**: Scelti testi di 11-15 px in un solo colore #E8E3DA ai margini (titolo in alto a sinistra, suggerimento centrato in basso, tasti in basso a destra) invece di pannelli o titoli sopra la scena
- **Reason**: Il vetro è il contenuto; ogni pixel di UI sopra la scena sporca l'illusione
- **Evidence**: 4 dimensioni di testo, tutte <= 15px; un solo colore di testo; unico raggio 999px sulle due pillole di link

### Il gimmick che resta (da non copiare)
- **Trigger**: Quando si vuole rendere 'fisico' il puntatore
- **Decision**: Scelto un cursore custom (mano guantata disegnata) con cursor:none, nessuna gestione di prefers-reduced-motion e nessun contenuto senza WebGL2
- **Reason**: Funziona per una demo di 30 secondi, non per un sito che deve farsi usare: il cursore disegnato copre ciò che scopri e la pagina senza GL è vuota
- **Evidence**: body { cursor: none }; #cursor .palm 84px; reducedMotion: false nel DOM extractor; fallback: 'This demo needs WebGL2.'
