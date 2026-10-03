// MADRE · impasto · vertex (webgl-artist)
//
// Un PlaneGeometry(1, 1) scalato con forma.ts/scalaPiano: x, y, z nella
// stessa unità "p" (1 = altezza del piano). Qui si alza la pagnotta larga
// (cupola, gonfiature, piega di chiusura), si scavano le fossette e si
// calcolano normale e curvatura della forma grande. Il dettaglio fine
// (alveoli, grana, crepe dello spolvero) è tutto nel fragment.
//
// Costanti MAD_* da forma.ts (ShaderMaterial.defines). Compila in GLSL ES 1.0
// (WebGL1) e, tramite three, in GLSL ES 3.0 (WebGL2).

uniform vec4 uFossette[3];      // u, v, profondità 0..1, segno 0..1
uniform float uRespiro;         // -1..1 (già spento dopo 30 s)
uniform vec3 uSegnoCliente;     // u, v, presente 0/1
uniform float uRidotto;         // 1 = reduced motion: i vertici non si muovono per le fossette
uniform float uAspetto;         // larghezza / altezza del piano
uniform vec4 uPagnotta;         // cx, cy, raggio, altezza (in "p")
uniform vec4 uGonfiature[3];    // cx, cy, raggio, ampiezza (in "p")
uniform vec4 uPiega;            // cx, cy, raggio, profondità del solco
uniform vec4 uPiegaArco;        // angolo centrale, semiampiezza, larghezza solco, rilievo labbro

varying vec2 vP;                // posizione in "p"
varying vec3 vNormale;          // normale della forma grande (+ fossette), spazio del piano
varying float vCurva;           // laplaciano dell'altezza: > 0 concavo, < 0 convesso
varying float vDistanza;        // distanza normalizzata dal centro della pagnotta (1 = bordo)
varying float vAltezza;         // altezza in "p"

float distanzaPagnotta(vec2 p) {
  vec2 q = p - uPagnotta.xy;
  float a = atan(q.y, q.x + 1e-5);
  float m = 1.0
    + MAD_BORDO_0.x * sin(MAD_BORDO_0.y * a + MAD_BORDO_0.z)
    + MAD_BORDO_1.x * sin(MAD_BORDO_1.y * a + MAD_BORDO_1.z)
    + MAD_BORDO_2.x * sin(MAD_BORDO_2.y * a + MAD_BORDO_2.z);
  float r = uPagnotta.z * (1.0 + MAD_RESPIRO_RAGGIO * uRespiro) * m;
  return length(q) / r;
}

float piega(vec2 p, float d) {
  vec2 q = p - uPiega.xy;
  float da = atan(q.y, q.x + 1e-5) - uPiegaArco.x;
  da = atan(sin(da), cos(da));
  float arco = 1.0 - smoothstep(uPiegaArco.y * 0.45, uPiegaArco.y, abs(da));
  float sopra = 1.0 - smoothstep(0.62, 0.9, d);
  float w = uPiegaArco.z;
  float sd = length(q) - uPiega.z;
  float solco = -uPiega.w * exp(-(sd / w) * (sd / w));
  float l = (sd + 1.7 * w) / (1.6 * w);
  float labbro = uPiegaArco.w * exp(-l * l);
  float lembo = uPiegaArco.w * 0.55 * smoothstep(-w * 1.2, -w * 6.0, sd);
  return (solco + labbro + lembo) * arco * sopra;
}

// Forma grande: identica a forma.ts/altezzaMacro (serve al raycast su CPU).
float altezzaMacro(vec2 p, out float d) {
  float H = uPagnotta.w * (1.0 + MAD_RESPIRO_ALTEZZA * uRespiro);
  d = distanzaPagnotta(p);
  // cupola: calotta arrotondata (pagnotta rilassata). Il max(1 − d², 0) è
  // morbido (k = MAD_RACCORDO): il bordo scende a ~40° e si allarga in un
  // piede basso sul tavolo, senza parete verticale.
  float s = 1.0 - d * d;
  float k = MAD_RACCORDO;
  float sm = 0.5 * (s + sqrt(s * s + k * k));
  float g = max(pow(sm, MAD_ESPONENTE) - MAD_PIEDE, 0.0) / (1.0 - MAD_PIEDE);
  float h = H * g;
  float cupola = 1.0 - smoothstep(0.55, 0.97, d);
  for (int i = 0; i < 3; i++) {
    vec4 g = uGonfiature[i];
    vec2 dg = p - g.xy;
    h += g.w * exp(-dot(dg, dg) / (g.z * g.z)) * cupola;
  }
  h += piega(p, d);
  return h;
}

// Fossetta a polpastrello: ritorna l'altezza (negativa) per un vec4(u, v, prof, segno).
float fossetta(vec2 p, vec4 f, float profSegno) {
  vec2 c = vec2((f.x - 0.5) * uAspetto, f.y - 0.5);
  vec2 q = p - c;
  float cs = cos(MAD_FOSSETTA_ROTAZIONE);
  float sn = sin(MAD_FOSSETTA_ROTAZIONE);
  q = vec2(cs * q.x + sn * q.y, -sn * q.x + cs * q.y);
  vec2 e = q / MAD_FOSSETTA_SEMIASSI;
  float r2 = dot(e, e);
  // conca morbida: pareti che scendono piano (impasto lievitato, non argilla)
  float conca = exp(-2.6 * r2) * (1.0 - smoothstep(1.0, 1.6, r2));
  conca *= clamp(1.0 + MAD_FOSSETTA_ASIMMETRIA * e.y, 0.0, 2.0);
  float r = sqrt(r2);
  float rb = (r - 1.12) / 0.34;
  float bordo = exp(-rb * rb);
  float prof = f.z;
  float giu = prof * (conca - MAD_FOSSETTA_BORDO * bordo) + profSegno * f.w * conca;
  return -MAD_FOSSETTA_PROFONDITA * giu;
}

float fossette(vec2 p) {
  float h = 0.0;
  for (int i = 0; i < 3; i++) {
    vec4 f = uFossette[i];
    if (f.z + f.w > 0.0005) h += fossetta(p, f, MAD_FOSSETTA_SEGNO);
  }
  if (uSegnoCliente.z > 0.5) {
    h += fossetta(p, vec4(uSegnoCliente.xy, 0.0, 1.0), MAD_FOSSETTA_SEGNO_CLIENTE);
  }
  return h;
}

float altezza(vec2 p, out float d) {
  return altezzaMacro(p, d) + fossette(p);
}

void main() {
  vec2 p = vec2((uv.x - 0.5) * uAspetto, uv.y - 0.5);
  float d;
  float hMacro = altezzaMacro(p, d);
  float hFoss = fossette(p);
  float h0 = hMacro + hFoss;

  // differenze centrali: passo poco sotto la cella della griglia più fitta
  float e = 0.0035;
  float dd;
  float hx1 = altezza(p + vec2(e, 0.0), dd);
  float hx0 = altezza(p - vec2(e, 0.0), dd);
  float hy1 = altezza(p + vec2(0.0, e), dd);
  float hy0 = altezza(p - vec2(0.0, e), dd);

  vNormale = normalize(vec3(-(hx1 - hx0) / (2.0 * e), -(hy1 - hy0) / (2.0 * e), 1.0));
  vCurva = (hx1 + hx0 + hy1 + hy0 - 4.0 * h0) / (e * e);
  vDistanza = d;
  vP = p;

  // reduced motion: la fossetta si vede solo nell'ombreggiatura, i vertici restano fermi
  float hVista = hMacro + hFoss * (1.0 - uRidotto);
  vAltezza = hVista;

  vec3 pos = vec3(position.xy, hVista);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
