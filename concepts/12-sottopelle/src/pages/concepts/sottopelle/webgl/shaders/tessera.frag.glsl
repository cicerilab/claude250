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

// Foto appena arrivata: centro + due anelli di 6 campioni sfalsati di 30 gradi
// (con un anello solo le linee fini si sdoppiano). r = raggio in uv per asse.
vec3 fotoMorbida(vec2 uv, vec2 r) {
  vec2 m = r * 0.5;
  vec3 s = texture2D(uFoto, uv).rgb;
  s += texture2D(uFoto, uv + m * vec2(0.866, 0.5)).rgb;
  s += texture2D(uFoto, uv + m * vec2(0.0, 1.0)).rgb;
  s += texture2D(uFoto, uv + m * vec2(-0.866, 0.5)).rgb;
  s += texture2D(uFoto, uv + m * vec2(-0.866, -0.5)).rgb;
  s += texture2D(uFoto, uv + m * vec2(0.0, -1.0)).rgb;
  s += texture2D(uFoto, uv + m * vec2(0.866, -0.5)).rgb;
  s += texture2D(uFoto, uv + r * vec2(1.0, 0.0)).rgb;
  s += texture2D(uFoto, uv + r * vec2(0.5, 0.866)).rgb;
  s += texture2D(uFoto, uv + r * vec2(-0.5, 0.866)).rgb;
  s += texture2D(uFoto, uv + r * vec2(-1.0, 0.0)).rgb;
  s += texture2D(uFoto, uv + r * vec2(-0.5, -0.866)).rgb;
  s += texture2D(uFoto, uv + r * vec2(0.5, -0.866)).rgb;
  return s / 13.0;
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

// Un vortice: ruota P attorno a c, di "giro" radianti al centro, a campana di raggio sig.
vec2 vortice(vec2 P, vec2 c, float sig, float giro) {
  vec2 d = P - c;
  return c + ruota(d, giro * exp(-dot(d, d) / (sig * sig)));
}

// Un velo davanti al fronte: foglio traslucido con l'orlo ripiegato più denso.
// Ha un suo piccolo moto (campo a rotore proprio) e lingue sue, così non è
// una copia concentrica del fronte.
float velo(vec2 P, vec2 fine, vec2 sem, float ka, float Rv) {
  vec3 n = rumoreD(P * INK_VELI_FREQ + sem);
  vec2 Q = P + vec2(n.z, -n.y) * INK_VELI_MOSSA + fine;
  vec2 pa = vec2(Q.x / ka, Q.y);
  float s = length(pa);
  vec2 versore = s > 0.0001 ? pa / s : vec2(1.0, 0.0);
  float l = rumore(versore * INK_VELI_LINGUE + sem.yx);
  float D = Rv - s / (1.0 + INK_DITA * 1.6 * l);
  // Orlo asimmetrico: netto fuori, si scioglie verso l'interno (bordo d'attacco
  // di un foglio d'inchiostro, non un tubo).
  float foglio = smoothstep(-INK_VELI_SFUMA, INK_VELI_SFUMA, D) * (0.55 + 0.6 * n.x);
  float orlo = smoothstep(-INK_ORLO_NETTO, INK_ORLO_NETTO, D) * exp(-max(D, 0.0) / INK_ORLO_SCIOGLIE);
  return foglio * INK_VELI_ALFA + orlo * INK_ORLO_ALFA;
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
  // Il fronte frena; verso la fine l'inchiostro satura la tessera (gli angoli
  // si chiudono prima della dissolvenza finale).
  float R = f * (portata * (1.0 + INK_DITA) + INK_MARGINE)
          + INK_SATURA * portata * smoothstep(0.45, INK_CHIUDE, t);

  vec2 rel = uv * dim - o;
  vec2 P = vec2(dot(rel, dir), dot(rel, per));
  vec2 P0 = P;
  vec2 sem = vec2(uSeme * 71.3, uSeme * 37.9) + 11.0;

  // 1. Rimescolamento: avvezione all'indietro in un campo a rotore (senza
  //    divergenza, come l'acqua) che scorre in avanti con la nuvola.
  float agita = INK_AGITA * (0.35 + 0.65 * f);
  vec2 scorre = vec2(-f * INK_DERIVA, 0.0);
  for (int i = 0; i < 2; i++) {
    vec3 n = rumoreD(P * INK_RIM_FREQ + sem + scorre);
    P += vec2(n.z, -n.y) * agita;
  }
  vec2 P1 = P;

  // 2. Il cappello: la testa della goccia è un anello di vortice. In sezione,
  //    due vortici controrotanti sulle spalle del fronte arrotolano i lati
  //    all'indietro (il fungo dell'inchiostro che cade in acqua).
  float rotola = smoothstep(0.0, 0.6, f);
  for (int k = 0; k < 2; k++) {
    float segno = k == 0 ? -1.0 : 1.0;
    float h = hash11(uSeme * 53.0 + float(k) * 7.0);
    float ang = segno * (INK_SPALLA + (h - 0.5) * 0.35);
    vec2 c = vec2(cos(ang) * ka, sin(ang)) * R * INK_ANELLO_POS;
    float sig = min(INK_ANELLO_RAGGIO * R + 0.02, INK_ANELLO_MAX);
    P = vortice(P, c, sig, segno * INK_ANELLO_VERSO * INK_ANELLO_GIRO * rotola * (0.8 + 0.4 * h));
  }

  // 3. Riccioli: vortici piccoli lungo il fronte (instabilità del bordo),
  //    versi alterni, posizioni dal seme.
  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    float h = hash11(uSeme * 97.0 + fk * 13.0);
    float g = hash11(uSeme * 31.0 + fk * 5.0);
    float ang = (fk - 1.5) * INK_VENTAGLIO + (h - 0.5) * 0.5;
    vec2 c = vec2(cos(ang) * ka, sin(ang)) * R * (0.93 + 0.14 * g);
    float sig = INK_RICCIOLO_RAGGIO * (0.4 + 0.6 * f) * (0.7 + 0.6 * g);
    float verso = mod(fk, 2.0) < 0.5 ? 1.0 : -1.0;
    P = vortice(P, c, sig, verso * INK_RICCIOLO_GIRO * rotola);
  }

  // 4. Lingue: il fronte non è un cerchio, avanza a dita.
  vec2 pa = vec2(P.x / ka, P.y);
  float s = length(pa);
  vec2 versore = s > 0.0001 ? pa / s : vec2(1.0, 0.0);
  float lingue = rumore(versore * INK_DITA_FREQ + sem.yx);
  float D = R - s / (1.0 + INK_DITA * lingue * 1.4);

  // 5. Corpo con il bordo definito e il fronte più denso; davanti, due veli
  //    traslucidi di grigio sfumato con l'orlo ripiegato (densità che cala).
  float corpo = smoothstep(-INK_NITIDO, INK_NITIDO, D);
  float xr = (D - INK_RIM) / INK_RIM_LARGO;
  float fronte = exp(-xr * xr) * corpo;
  float veli = 0.0;
  if (D < INK_NITIDO) {
    // Sfrangiatura fine comune ai veli: piccola scala, piccola ampiezza.
    vec3 nf = rumoreD(P * INK_FINE_FREQ + sem.yx * 1.3 + scorre * 2.0);
    vec2 fine = vec2(nf.z, -nf.y) * INK_FINE_MOSSA;
    float apre = 0.35 + 0.65 * f;
    veli = velo(P, fine, sem + 5.3, ka, R + INK_VELI_PASSO * apre)
         + 0.7 * velo(P, fine * 1.6, sem + 9.1, ka, R + 2.1 * INK_VELI_PASSO * apre);
  }

  // 6. La foto dietro il fronte: arriva morbida, trascinata dal flusso, poi si posa.
  float dietro = smoothstep(0.0, INK_POSA, D);
  float morbido = clamp(1.0 - dietro * smoothstep(0.1, 0.8, t), 0.0, 1.0)
                * (1.0 - smoothstep(0.65, 1.0, t));
  // Solo il rimescolamento trascina la foto (i vortici la strapperebbero).
  vec2 flusso = dir * (P1.x - P0.x) + per * (P1.y - P0.y);
  vec2 uvW = uvF - flusso / dim * INK_TRASCINA * morbido;
  vec3 foto = fotoMorbida(uvW, INK_SFOCA * morbido / dim);
  foto = mix(foto, vec3(dot(foto, LUMA)), INK_DESATURA * morbido);
  foto = mix(foto, uNero, INK_VELO * morbido);
  foto = mix(foto, uNero, INK_FRONTE * fronte);

  vec3 inchiostro = mix(uNero, uGrigio, clamp(veli, 0.0, 1.0));
  vec3 col = mix(inchiostro, foto, corpo);

  // Durante lo sboccio i lati della tessera sono morbidi; a posa finita, spigolo vivo.
  vec2 lato = min(uv, 1.0 - uv) * dim;
  float bordoLati = smoothstep(0.0, INK_LATI * (1.0 - smoothstep(0.3, 0.75, t)) + 0.0001, min(lato.x, lato.y));
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
