// SOTTOPELLE · tessera della parete (fragment). GLSL ES 1.00: gira su WebGL1 e WebGL2.
// Le costanti INK_*, INC_*, ARR_*, BORDO_AA arrivano da presets.ts
// (programma.ts antepone i #define). Serve highp: senza, il concept va in fallback DOM.
//
// Tre effetti, un materiale:
//  - sboccio (uSboccio < 1): la nuvola d'inchiostro si apre dal punto
//    d'ingresso. Campo di distanza allungato nella direzione di corsa,
//    rimescolato da un campo a rotore (acqua), arrotolato da quattro vortici
//    sul fronte (volute), con lingue, fronte più denso e filamenti grigi
//    davanti. Dietro il fronte la foto arriva morbida, trascinata dal flusso,
//    poi si posa nitida. Luminosità monotona: dal nero alla foto, una volta.
//  - increspatura (uIncr.z >= 0): anello di rifrazione dal punto toccato,
//    spostamento <= 0,6% della tessera, luce <= ±3%, finita in 1,6 s.
//  - arretramento (uArretra > 0): la foto diventa un bicromo nero → grigio
//    sfumato, i bordi prima del centro.
// A posa finita (uSboccio = 1, niente increspatura, niente arretramento) il
// pixel è la foto e basta: nessun post-processing.

precision highp float;

varying vec2 vUv;
varying vec2 vPx;

uniform vec4 uRett;        // tessera in px fisici (x, y, w, h), origine in alto a sinistra
uniform float uModulo;     // px fisici di un modulo della parete (runtime.modulo × DPR)
uniform sampler2D uFoto;   // foto ritagliata alla proporzione esatta della tessera, UNPACK_FLIP_Y false
uniform float uSboccio;    // 0..1 LINEARE nel tempo; 1 = posata
uniform vec2 uIngresso;    // punto d'ingresso in uv della tessera (0,0 in alto a sinistra)
uniform float uSeme;       // 0..1, uno per foto
uniform vec3 uIncr;        // u, v, t in secondi dall'avvio (t < 0 = nessuna)
uniform float uArretra;    // 0..1
uniform float uOpacita;    // 0..1, di norma 1 (dissolvenza di 150 ms in reduced motion)
uniform vec3 uNero;        // fondo e inchiostro
uniform vec3 uGrigio;      // grigio sfumato: filamenti e arretramento

const float TAU = 6.28318530718;
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

// Hash senza seno (Hoskins): stabile in highp su GPU diverse.
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

// Rumore a gradiente con derivate analitiche: x = valore (circa ±0,7), yz = gradiente.
vec3 rumoreD(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  vec2 ga = hash22(i) * 2.0 - 1.0;
  vec2 gb = hash22(i + vec2(1.0, 0.0)) * 2.0 - 1.0;
  vec2 gc = hash22(i + vec2(0.0, 1.0)) * 2.0 - 1.0;
  vec2 gd = hash22(i + vec2(1.0, 1.0)) * 2.0 - 1.0;
  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  float k = va - vb - vc + vd;
  float v = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;
  vec2 g = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd)
         + du * (u.yx * k + vec2(vb, vc) - va);
  return vec3(v, g);
}

float rumore(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float va = dot(hash22(i) * 2.0 - 1.0, f);
  float vb = dot(hash22(i + vec2(1.0, 0.0)) * 2.0 - 1.0, f - vec2(1.0, 0.0));
  float vc = dot(hash22(i + vec2(0.0, 1.0)) * 2.0 - 1.0, f - vec2(0.0, 1.0));
  float vd = dot(hash22(i + vec2(1.0, 1.0)) * 2.0 - 1.0, f - vec2(1.0, 1.0));
  return mix(mix(va, vb, u.x), mix(vc, vd, u.x), u.y);
}

vec2 ruota(vec2 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

float metrica(vec2 v, vec2 dir, vec2 per, float ka) {
  return length(vec2(dot(v, dir) / ka, dot(v, per)));
}

// Foto appena arrivata: disco di 7 campioni, raggio in uv per asse.
vec3 fotoMorbida(vec2 uv, vec2 r) {
  vec3 s = texture2D(uFoto, uv).rgb * 2.0;
  s += texture2D(uFoto, uv + r * vec2(1.0, 0.0)).rgb;
  s += texture2D(uFoto, uv + r * vec2(0.5, 0.866)).rgb;
  s += texture2D(uFoto, uv + r * vec2(-0.5, 0.866)).rgb;
  s += texture2D(uFoto, uv + r * vec2(-1.0, 0.0)).rgb;
  s += texture2D(uFoto, uv + r * vec2(-0.5, -0.866)).rgb;
  s += texture2D(uFoto, uv + r * vec2(0.5, -0.866)).rgb;
  return s * 0.125;
}

// Increspatura: restituisce le uv spostate e la variazione di luce.
vec2 increspa(vec2 uv, out float luce) {
  luce = 0.0;
  float t = uIncr.z;
  if (t < 0.0 || t >= INC_DURATA) return uv;
  vec2 dim = uRett.zw / uModulo;
  vec2 d = (uv - uIncr.xy) * dim;
  float r = length(d);
  float k = clamp(t / INC_ESPANDE, 0.0, 1.0);
  float raggio = INC_RAGGIO * (1.0 - (1.0 - k) * (1.0 - k));
  float x = (r - raggio) / INC_LARGO;
  float inv = exp(-x * x);
  float sx = sin(x * INC_CRESTE);
  float onda = sx * inv;
  float pendenza = (cos(x * INC_CRESTE) * INC_CRESTE - 2.0 * x * sx) * inv;
  float fine = 1.0 - t / INC_DURATA;
  float amp = smoothstep(0.0, INC_ATTACCO, t) * fine * fine / (1.0 + r * INC_SMORZA);
  vec2 rad = r > 0.0001 ? d / r : vec2(0.0);
  float spost = INC_SPOSTAMENTO * min(dim.x, dim.y) * amp * onda;
  luce = clamp(-pendenza * amp * INC_LUCE, -INC_LUCE_MAX, INC_LUCE_MAX);
  return uv - rad * spost / dim;
}

// Arretramento: bicromo nero → grigio sfumato, i bordi arretrano prima del centro.
vec3 arretra(vec3 c, vec2 uv) {
  if (uArretra <= 0.0) return c;
  vec2 b = min(uv, 1.0 - uv) * 2.0;
  float centro = clamp(min(b.x, b.y), 0.0, 1.0);
  float k = clamp(uArretra * (1.0 + ARR_ONDA) - centro * ARR_ONDA, 0.0, 1.0);
  float l = smoothstep(ARR_NERO, ARR_LUCE, dot(c, LUMA));
  return mix(c, mix(uNero, uGrigio, l), k);
}

// Lo sboccio.
vec3 sboccio(vec2 uv, vec2 uvF) {
  float t = clamp(uSboccio, 0.0, 1.0);
  float f = 1.0 - pow(1.0 - t, INK_FRENATA);

  // Sistema della nuvola, in moduli: P.x lungo la direzione di corsa, P.y di traverso.
  vec2 dim = uRett.zw / uModulo;
  vec2 o = uIngresso * dim;
  vec2 dv = 0.5 * dim - o;
  float ld = length(dv);
  float semeA = uSeme * TAU;
  bool orientata = ld > 0.04;
  vec2 dir = orientata ? dv / ld : vec2(cos(semeA), sin(semeA));
  vec2 per = vec2(-dir.y, dir.x);
  float ka = mix(orientata ? INK_ANISO : 1.0, 1.0, f * INK_ARROTONDA);

  // Portata: l'angolo più lontano dal punto d'ingresso, nella metrica della nuvola.
  float portata = metrica(-o, dir, per, ka);
  portata = max(portata, metrica(vec2(dim.x, 0.0) - o, dir, per, ka));
  portata = max(portata, metrica(vec2(0.0, dim.y) - o, dir, per, ka));
  portata = max(portata, metrica(dim - o, dir, per, ka));
  float R = f * (portata * (1.0 + INK_DITA) + INK_MARGINE);

  vec2 rel = uv * dim - o;
  vec2 P = vec2(dot(rel, dir), dot(rel, per));
  vec2 P0 = P;
  vec2 sem = vec2(uSeme * 71.3, uSeme * 37.9) + 11.0;

  // 1. Rimescolamento: avvezione all'indietro in un campo a rotore (senza divergenza,
  //    come l'acqua), che scorre in avanti con la nuvola.
  float agita = INK_AGITA * (0.35 + 0.65 * f);
  vec2 scorre = vec2(-f * INK_DERIVA, 0.0);
  for (int i = 0; i < 3; i++) {
    vec3 n = rumoreD(P * INK_RIM_FREQ + sem + scorre);
    P += vec2(n.z, -n.y) * agita;
  }

  // 2. Volute: quattro vortici sul fronte arrotolano il bordo della nuvola
  //    (sezione di un anello di vortice: i lati girano in verso opposto).
  float giro = INK_VOLUTA * smoothstep(0.0, 0.75, f);
  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    float h = hash11(uSeme * 97.0 + fk * 13.0);
    float ang = (fk - 1.5) * INK_VENTAGLIO + (h - 0.5) * 0.45;
    vec2 c = vec2(cos(ang) * ka, sin(ang)) * R * INK_VORT_POS;
    float sig = INK_VORT_RAGGIO * (0.45 + 0.55 * f) * (0.75 + 0.5 * h);
    vec2 d = P - c;
    float verso = fk < 1.5 ? -1.0 : 1.0;
    P = c + ruota(d, verso * giro * exp(-dot(d, d) / (sig * sig)));
  }

  // 3. Lingue: il fronte non è un cerchio, avanza a dita.
  vec2 pa = vec2(P.x / ka, P.y);
  float s = length(pa);
  vec2 versore = s > 0.0001 ? pa / s : vec2(1.0, 0.0);
  float lingue = rumore(versore * INK_DITA_FREQ + sem.yx);
  float sE = s / (1.0 + INK_DITA * lingue * 1.4);

  // 4. Corpo, fronte più denso, filamenti davanti.
  float wIn = INK_BORDO * (0.45 + 0.55 * f);
  float corpo = 1.0 - smoothstep(R - wIn, R, sE);
  float fronte = smoothstep(R - wIn * 2.6, R - wIn * 0.55, sE) * corpo;
  float avanti = (sE - R) / INK_FIL_LUNGO;
  float fil = 0.0;
  if (avanti > -0.3 && avanti < 1.0) {
    float arco = atan(pa.y, pa.x) * max(R, 0.25);
    float n = rumore(vec2(arco * INK_FIL_FREQ, sE * INK_FIL_FREQ * INK_FIL_STIRA) + sem * 1.7);
    float filo = clamp(1.0 - abs(n) * INK_FIL_SOTTILE, 0.0, 1.0);
    float coda = clamp(1.0 - avanti, 0.0, 1.0);
    fil = filo * filo * filo * coda * coda * smoothstep(-0.3, 0.05, avanti);
  }

  // 5. La foto dietro il fronte: arriva morbida, trascinata dal flusso, poi si posa.
  float dietro = smoothstep(0.0, INK_POSA, R - sE);
  float morbido = clamp(1.0 - dietro * smoothstep(0.1, 0.8, t), 0.0, 1.0)
                * (1.0 - smoothstep(0.65, 1.0, t));
  vec2 flusso = dir * (P.x - P0.x) + per * (P.y - P0.y);
  vec2 uvW = uvF - flusso / dim * INK_TRASCINA * morbido;
  vec3 foto = fotoMorbida(uvW, INK_SFOCA * morbido / dim);
  foto = mix(foto, vec3(dot(foto, LUMA)), INK_DESATURA * morbido);
  foto = mix(foto, uNero, INK_VELO * morbido);
  foto = mix(foto, uNero, INK_FRONTE * fronte);

  vec3 inchiostro = mix(uNero, uGrigio, fil * INK_FIL_ALFA);
  vec3 col = mix(inchiostro, foto, corpo);

  // Durante lo sboccio i lati della tessera sono morbidi; a posa finita, spigolo vivo.
  vec2 lato = min(uv, 1.0 - uv) * dim;
  float bordoLati = smoothstep(0.0, INK_LATI, min(lato.x, lato.y));
  col = mix(uNero, col, bordoLati);

  // Chiusura: la nuvola si posa nella foto nitida (continua con il ramo t = 1).
  float chiude = smoothstep(INK_CHIUDE, 1.0, t);
  return mix(col, texture2D(uFoto, uvF).rgb, chiude);
}

void main() {
  vec2 uv = clamp(vUv, 0.0, 1.0);
  float luce = 0.0;
  vec2 uvF = increspa(uv, luce);
  vec3 col;
  if (uSboccio >= 1.0) {
    col = texture2D(uFoto, uvF).rgb;
  } else {
    col = sboccio(uv, uvF);
  }
  col *= 1.0 + luce;
  col = arretra(col, uv);

  // Antialias dello spigolo: copertura del pixel dentro il rettangolo.
  vec2 dentro = min(vPx, uRett.zw - vPx) + 0.5;
  float copertura = clamp(dentro.x, 0.0, 1.0) * clamp(dentro.y, 0.0, 1.0);
  gl_FragColor = vec4(mix(uNero, col, copertura * clamp(uOpacita, 0.0, 1.0)), 1.0);
}
