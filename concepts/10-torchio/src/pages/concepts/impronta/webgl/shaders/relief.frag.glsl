// IMPRONTA · carta, fibra, rilievo, inchiostro, lamina, luce radente
// (webgl-artist)
//
// Un solo fragment shader su un solo piano a tutto schermo: 1 draw call.
// Il foglio è ovunque; dentro i rettangoli dei blocchi (max MAX_BLOCCHI)
// legge la mappa d'altezza cotta nell'atlante e ne ricava le normali.
//
// Regole di materiale (trend-researcher §5.2, creative-director §4.1):
// - carta opaca: SOLO diffusione, nessuno speculare sulla carta;
// - luce e ombra sono TINTE DELLA CARTA (colori "luce" e "ombra" dei token),
//   mai bianco o nero: la carta piatta resta esattamente il colore di fondo;
// - rilievo basso (1-4 px), ombra portata corta;
// - speculare solo sulla lamina, anisotropo, con tetto (niente bagliori);
// - niente post-processing, niente tempo: l'immagine cambia solo se cambia
//   un uniform (render on demand).
//
// Spazio "pagina": px del drawing buffer, origine in ALTO a sinistra, y in
// basso (come il DOM), z verso chi guarda. Si lavora in sRGB perché il fondo
// piatto deve coincidere al byte con lo sfondo CSS del fallback.
//
// ---------------------------------------------------------------------------
// Layout degli uniform (lo scrive materials.ts; vedi anche docs/webgl-artist.md)
//
//   uView        x,y = misura del buffer px, z = dpr, w = scrollY in px CSS
//   uMeta        x,y = misura dell'atlante in texel, z = numero blocchi, w = 0
//   uLight       xyz = direzione VERSO la luce (spazio pagina), w = intensità 0..1
//   uLightPos    xy = lampada del riflesso in px buffer, z = sua altezza px, w = peso
//   uPaper       x = pendenza fibra, y = sensibilità luce, z = ombra di contatto,
//                w = scurimento del fondo del solco
//   uLamina      rgb = argento (sRGB), a = 1
//   uLaminaParam x = rugosità lungo la venatura, y = attraverso, z = tetto riflesso,
//                w = satinato
//   uWave        xy = centro dell'onda di cambio carta px buffer, z = raggio, w = sfumatura
//   uCarteAttive x = carta del foglio (indice), y = carta che arriva, z = onda attiva 0/1
//   uCarte[16]   4 carte × (fondo, luce, ombra, inchiostro); gli alpha portano
//                fibra, luceForza, ombraForza, assorbimento della carta
//   uBlockRect[i] x,y,w,h px buffer del rettangolo NON ruotato (con il margine
//                 della maschera già aggiunto)
//   uBlockUv[i]   u0, v0 (bordo BASSO dello slot), du, dv nell'atlante
//   uBlockA[i]    x = pressione 0..~1.03, y = rotazione rad (oraria, come CSS),
//                 z = profondità px buffer a pressione 1, w = carta del pezzo (-1 = foglio)
//   uBlockB[i]    x = inchiostro 0/1, y = lamina 0/1, z = larghezza a pressione 0,
//                 w = spessore della costa px buffer
//
// Define (da materials.ts): MAX_BLOCCHI, HEIGHT_BIAS, FIBRA_LATO

uniform sampler2D tAtlas;
uniform sampler2D tFiber;

uniform vec4 uView;
uniform vec4 uMeta;
uniform vec4 uLight;
uniform vec4 uLightPos;
uniform vec4 uPaper;
uniform vec4 uLamina;
uniform vec4 uLaminaParam;
uniform vec4 uWave;
uniform vec4 uCarteAttive;
uniform vec4 uCarte[16];

uniform vec4 uBlockRect[MAX_BLOCCHI];
uniform vec4 uBlockUv[MAX_BLOCCHI];
uniform vec4 uBlockA[MAX_BLOCCHI];
uniform vec4 uBlockB[MAX_BLOCCHI];

varying vec2 vUv;

// Macchie di formazione della pasta: ±2% di albedo circa.
#define MACCHIE 0.02

struct Carta {
  vec4 fondo;
  vec4 luce;
  vec4 ombra;
  vec4 ink;
};

// In WebGL1 gli array uniform nel fragment si possono indicizzare solo con
// espressioni costanti: la scelta della carta passa da una catena di if.
Carta leggiCarta(float i) {
  Carta c;
  if (i < 0.5) {
    c.fondo = uCarte[0]; c.luce = uCarte[1]; c.ombra = uCarte[2]; c.ink = uCarte[3];
  } else if (i < 1.5) {
    c.fondo = uCarte[4]; c.luce = uCarte[5]; c.ombra = uCarte[6]; c.ink = uCarte[7];
  } else if (i < 2.5) {
    c.fondo = uCarte[8]; c.luce = uCarte[9]; c.ombra = uCarte[10]; c.ink = uCarte[11];
  } else {
    c.fondo = uCarte[12]; c.luce = uCarte[13]; c.ombra = uCarte[14]; c.ink = uCarte[15];
  }
  return c;
}

Carta mescolaCarta(Carta a, Carta b, float t) {
  Carta c;
  c.fondo = mix(a.fondo, b.fondo, t);
  c.luce = mix(a.luce, b.luce, t);
  c.ombra = mix(a.ombra, b.ombra, t);
  c.ink = mix(a.ink, b.ink, t);
  return c;
}

// Distanza con segno da un rettangolo centrato di semi-misure m (negativa dentro).
float sdRett(vec2 q, vec2 m) {
  vec2 e = abs(q) - m;
  return length(max(e, 0.0)) + min(max(e.x, e.y), 0.0);
}

// Tiene un campione dentro lo slot del blocco (mezzo texel di margine),
// così il filtro lineare non legge mai lo slot accanto.
vec2 nelloSlot(vec2 uv, vec4 U, vec2 tx) {
  return clamp(uv, U.xy + tx * 0.5, U.xy + U.zw - tx * 0.5);
}

void main() {
  float dpr = uView.z;
  vec2 p = vec2(gl_FragCoord.x, uView.y - gl_FragCoord.y);

  // --- Il foglio (con l'onda del cambio carta) -----------------------------
  Carta foglio = leggiCarta(uCarteAttive.x);
  if (uCarteAttive.z > 0.5) {
    float d = distance(p, uWave.xy);
    float arrivo = 1.0 - smoothstep(uWave.z - uWave.w, uWave.z, d);
    foglio = mescolaCarta(foglio, leggiCarta(uCarteAttive.y), arrivo);
  }
  Carta carta = foglio;

  // --- Fibra: ancorata al documento, scorre con la pagina ------------------
  vec2 pCss = p / dpr + vec2(0.0, uView.w);
  vec4 fib = texture2D(tFiber, pCss / FIBRA_LATO);
  vec2 fibN = fib.rg * 2.0 - 1.0;
  float formazione = fib.b - 0.5;
  float assorb = fib.a - 0.5;

  // --- Luce ----------------------------------------------------------------
  vec3 L = uLight.xyz;
  float lxy = max(length(L.xy), 1e-4);
  vec2 Ld = L.xy / lxy;
  float tanEl = L.z / lxy;

  // --- Stato della superficie nel pixel ------------------------------------
  vec2 grad = vec2(0.0);      // pendenza del solco nello spazio pagina
  vec2 venatura = vec2(1.0, 0.0);
  vec2 locale = vec2(0.0);    // px CSS nel riferimento del blocco (per la spazzolatura della lamina)
  float ombraPortata = 0.0;
  float fondoSolco = 0.0;
  float inkMorbido = 0.0;
  float inkQuota = 0.0;
  float foil = 0.0;
  float contatto = 0.0;
  float costa = 0.0;
  // Bordo dei pezzi con antialias: copertura del pezzo nel pixel e ombra
  // di contatto che si vedrebbe sotto (per la fascia di 1 px del bordo).
  float coperturaPezzo = 1.0;
  float contattoSotto = 0.0;

  vec2 tx = 1.0 / uMeta.xy;
  float scalaH = 1.0 / (1.0 - HEIGHT_BIAS);

  for (int i = 0; i < MAX_BLOCCHI; i++) {
    if (float(i) >= uMeta.z) break;

    vec4 R = uBlockRect[i];
    vec4 U = uBlockUv[i];
    vec4 A = uBlockA[i];
    vec4 B = uBlockB[i];

    vec2 meta = R.zw * 0.5;
    vec2 d = p - (R.xy + meta);
    // Scarto veloce: fuori dal cerchio che contiene il blocco ruotato più la
    // sua ombra di contatto non serve nemmeno la rotazione.
    float raggio = length(meta) + 2.5 * dpr + B.w * 1.5 + 9.0 * dpr;
    if (dot(d, d) > raggio * raggio) continue;
    float cr = cos(A.y);
    float sr = sin(A.y);
    // Dal foglio al riferimento del blocco (rotazione inversa).
    vec2 q = vec2(cr * d.x + sr * d.y, -sr * d.x + cr * d.y);
    vec2 LdLoc = vec2(cr * Ld.x + sr * Ld.y, -sr * Ld.x + cr * Ld.y);

    // --- Pezzo con carta propria, appoggiato sul foglio --------------------
    if (A.w > -0.5) {
      float sd = sdRett(q, meta);
      // Ombra di contatto: la stessa sagoma spostata lontano dalla luce.
      vec2 qs = q + LdLoc * (2.5 * dpr + B.w * 1.5);
      float sds = sdRett(qs, meta);
      float morb = 9.0 * dpr;
      float ombraSagoma = 1.0 - smoothstep(-0.4 * morb, morb, sds);
      if (sd < 0.5) {
        coperturaPezzo = clamp(0.5 - sd, 0.0, 1.0);
        contattoSotto = ombraSagoma;
        carta = leggiCarta(A.w);
        grad = vec2(0.0);
        ombraPortata = 0.0;
        fondoSolco = 0.0;
        inkMorbido = 0.0;
        inkQuota = 0.0;
        foil = 0.0;
        contatto = 0.0;
        // Costa: una fascia larga quanto lo spessore; la faccia verso la luce
        // si schiarisce, quella opposta scurisce.
        vec2 e = abs(q) - meta;
        vec2 nl = e.x > e.y ? vec2(sign(q.x), 0.0) : vec2(0.0, sign(q.y));
        vec2 np = vec2(cr * nl.x - sr * nl.y, sr * nl.x + cr * nl.y);
        float fascia = 1.0 - smoothstep(0.0, max(B.w, 1.0), -sd);
        costa = fascia * dot(np, Ld);
      } else {
        contatto = max(contatto, ombraSagoma);
      }
    }

    // --- Rilievo dalla mappa d'altezza -------------------------------------
    float press = A.x;
    float s = mix(B.z, 1.0, clamp(press, 0.0, 1.0));
    vec2 l = (q + meta) / R.zw;
    l.x /= s;
    if (l.x < 0.0 || l.x > 1.0 || l.y < 0.0 || l.y > 1.0) continue;

    vec2 uv = nelloSlot(vec2(U.x + l.x * U.z, U.y + (1.0 - l.y) * U.w), U, tx);
    vec4 h0 = texture2D(tAtlas, uv);
    float hL = texture2D(tAtlas, nelloSlot(uv - vec2(tx.x, 0.0), U, tx)).r;
    float hR = texture2D(tAtlas, nelloSlot(uv + vec2(tx.x, 0.0), U, tx)).r;
    float hU = texture2D(tAtlas, nelloSlot(uv + vec2(0.0, tx.y), U, tx)).r;
    float hD = texture2D(tAtlas, nelloSlot(uv - vec2(0.0, tx.y), U, tx)).r;

    // Px del buffer coperti da un texel dell'atlante (x ristretto dalla pressa).
    vec2 pxTex = vec2(R.z * s / (U.z * uMeta.x), R.w / (U.w * uMeta.y));
    float prof = A.z * max(press, 0.0);

    // Superficie z = -h * prof (il solco scende): normale = (prof dh/dx, prof dh/dy, 1).
    vec2 g = vec2((hR - hL) / (2.0 * pxTex.x), (hD - hU) / (2.0 * pxTex.y)) * scalaH * prof;
    grad = vec2(cr * g.x - sr * g.y, sr * g.x + cr * g.y);
    venatura = vec2(cr, sr);
    locale = q / dpr;

    // Ombra portata: si cammina verso la luce; se il bordo del solco sta
    // sopra il raggio radente, il punto è in ombra. Giro 2: con la luce a
    // 12-18° l'ombra geometrica sarebbe lunga 3-4 volte la profondità e
    // sembrerebbe un'estrusione; la si ferma a 2 profondità (quattro passi
    // di mezza profondità): piena e corta, come nella foto di bottega.
    float passo = max(0.5 * dpr, prof * 0.5);
    float occ = 0.0;
    for (int k = 1; k <= 4; k++) {
      float dist = float(k) * passo;
      vec2 o = LdLoc * dist;
      vec2 uvk = nelloSlot(uv + vec2(o.x / pxTex.x * tx.x, -o.y / pxTex.y * tx.y), U, tx);
      float hk = texture2D(tAtlas, uvk).r;
      float sopra = (h0.r - hk) * scalaH * prof - dist * tanEl;
      occ = max(occ, smoothstep(0.0, 0.6 * dpr, sopra));
    }
    ombraPortata = occ;
    fondoSolco = h0.a * clamp(press, 0.0, 1.0);

    // Inchiostro e lamina passano sulla carta solo quando la forma la tocca.
    inkMorbido = h0.g;
    inkQuota = B.x * smoothstep(0.05, 0.35, press);
    foil = h0.b * B.y * smoothstep(0.15, 0.55, press);
  }

  // --- Copertura dell'inchiostro (serve già alla luce) ----------------------
  float cop = 0.0;
  if (inkQuota > 0.0) {
    // La fibra sposta la soglia: il bordo diventa irregolare come sulla carta
    // vera. Limitata a 0,3..0,7: il bordo trema di qualche decimo di px, non cola.
    float soglia = clamp(0.5 - assorb * carta.ink.a * 0.6, 0.3, 0.7);
    cop = smoothstep(soglia - 0.12, soglia + 0.12, inkMorbido) * inkQuota;
  }

  // --- Luce diffusa tinta della carta --------------------------------------
  // La lamina e l'inchiostro riempiono la fibra (sotto si vede appena) e il
  // fondo del solco è carta schiacciata, più liscia del foglio.
  vec2 pendFibra = fibN * uPaper.x * carta.fondo.a
    * (1.0 - 0.9 * foil) * (1.0 - 0.6 * cop) * (1.0 - 0.5 * fondoSolco);
  vec3 n = normalize(vec3(grad + pendFibra, 1.0));
  // 0 sul foglio piatto: la carta piatta resta il suo colore esatto.
  float t = (dot(n, L) - L.z) * uPaper.y * uLight.w;
  float verso = 1.0 - exp(-max(t, 0.0) * 1.6);
  float contro = 1.0 - exp(-max(-t, 0.0) * 1.8);

  vec3 base = carta.fondo.rgb * (1.0 + formazione * MACCHIE * carta.fondo.a);
  vec3 col = base;
  col = mix(col, carta.luce.rgb, verso * carta.luce.a);
  col = mix(col, carta.ombra.rgb, contro * carta.ombra.a);
  // Fondo del solco: la carta schiacciata è un poco più scura.
  col = mix(col, carta.ombra.rgb, fondoSolco * uPaper.w * carta.ombra.a);
  // Ombra portata, corta e tinta.
  // Giro 2: ombra piena (la parete del solco sul lato in ombra arriva al
  // colore "ombra" della carta, non a metà strada).
  col = mix(col, carta.ombra.rgb, ombraPortata * 0.9 * carta.ombra.a * uLight.w);

  // Costa del pezzo e ombra di contatto sul foglio.
  col = mix(col, carta.luce.rgb, max(costa, 0.0) * 0.9 * carta.luce.a);
  col = mix(col, carta.ombra.rgb, max(-costa, 0.0) * 0.9 * carta.ombra.a);
  col = mix(col, carta.ombra.rgb, contatto * uPaper.z * carta.ombra.a);

  // --- Inchiostro opaco, bevuto dalla fibra --------------------------------
  if (cop > 0.0) {
    // Film pieno e uniforme: segue un quinto della luce del solco (le pareti
    // restano leggibili) e niente altro. Giro 2: tolte la densità variabile e
    // la formazione dentro il pieno, che in WebKit davano una grana chiara.
    vec3 inkCol = carta.ink.rgb + (col - base) * 0.2;
    col = mix(col, inkCol, cop);
  }

  // --- Lamina argento anisotropa -------------------------------------------
  if (foil > 0.002) {
    vec3 nf = normalize(vec3(grad + pendFibra, 1.0));
    // Spazzolatura: la fibra stirata lungo la venatura dà righe sottili e
    // lunghe, il segno del rullo della lamina. Un solo campione in più, solo qui.
    float spazz = texture2D(tFiber, vec2(locale.x / FIBRA_LATO * 3.0, locale.y / (FIBRA_LATO * 12.0))).a - 0.5;
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 Lp = normalize(vec3(uLightPos.xy - p, max(uLightPos.z, 1.0)));
    vec3 H = normalize(Lp + V);
    // Venatura lungo l'asse y del blocco (giro 2), appena mossa dalla fibra:
    // il riflesso stretto diventa una banda orizzontale sotto la lampada.
    vec3 T = vec3(vec2(-venatura.y, venatura.x) + fibN * 0.08, 0.0);
    T = normalize(T - nf * dot(nf, T));
    vec3 Bt = cross(nf, T);
    float hn = max(dot(H, nf), 0.05);
    float ht = dot(H, T) / uLaminaParam.x;
    float hb = dot(H, Bt) / uLaminaParam.y;
    // Ward anisotropo: lobo stretto (il riflesso che scorre sugli spigoli)...
    float stretto = exp(-(ht * ht + hb * hb) / (hn * hn));
    // ...e lobo largo, quattro volte più ruvido (il satinato del metallo).
    float lt = ht * 0.25;
    float lb = hb * 0.25;
    float largo = exp(-(lt * lt + lb * lb) / (hn * hn));
    float riflesso = min(stretto, 1.0) * uLaminaParam.z + largo * uLaminaParam.w * 0.35 * (1.0 + spazz * 0.75);
    riflesso *= mix(0.6, 1.0, uLightPos.w) * uLight.w;

    float diff = clamp(dot(nf, L) * 0.5 + 0.5, 0.0, 1.0);
    // Metallo: poca diffusione, il resto è riflesso (così "legge" come argento
    // e non come grigio stampato).
    vec3 metallo = uLamina.rgb * (0.42 + 0.26 * diff) * (1.0 + spazz * 0.1);
    metallo += vec3(riflesso) * (0.55 + 0.45 * uLamina.rgb);
    // Il metallo riflette un poco la carta attorno (ambiente), niente di più.
    metallo = mix(metallo, metallo * carta.fondo.rgb * 1.15, 0.1);
    // Filo scuro: le pareti della lamina lontane dalla luce e l'ombra portata
    // scuriscono il metallo. Tiene il contorno leggibile anche su Citrino,
    // dove argento e carta hanno la stessa luminanza.
    metallo = mix(metallo, uLamina.rgb * 0.3, max(contro, ombraPortata * 0.8) * 0.85);
    col = mix(col, min(metallo, vec3(0.97)), foil);
  }

  // Antialias del bordo del pezzo: nella fascia di 1 px si mescola con il
  // foglio sotto (fondo più la sua ombra di contatto).
  if (coperturaPezzo < 1.0) {
    vec3 sotto = mix(foglio.fondo.rgb, foglio.ombra.rgb, contattoSotto * uPaper.z * foglio.ombra.a);
    col = mix(sotto, col, coperturaPezzo);
  }

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
