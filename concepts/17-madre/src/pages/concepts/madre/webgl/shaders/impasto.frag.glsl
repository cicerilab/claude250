// MADRE · impasto · fragment (webgl-artist)
//
// Impasto opaco spolverato di farina su un tavolo infarinato.
// - Niente speculare: solo diffuso "avvolto" (la luce gira attorno alle
//   gonfiature come in una materia un po' traslucida) + luce d'ambiente.
// - Superficie piatta = colore esatto dei token (normalizzazione della luce).
// - Ombre tinte verso uFarinaOmbra, più calde sull'impasto: mai grigio, mai nero.
// - Spolvero: chiazze, grana fine a puntini, crepe dove la pelle si tende.
// - Alveoli: bolle sotto la pelle (rilievo, meno farina, un filo traslucide)
//   e qualche bolla scoppiata; sul tavolo lo stesso canale fa i grumi di farina.
// - Fossetta: lo spolvero si apre (le crepe si allargano, al centro la pelle
//   resta nuda, un tono più caldo) e si richiude per ultimo (segno).
// Lavora in rgb lineare; l'uscita passa da <colorspace_fragment> di three.

uniform sampler2D uSpolvero;    // 256², RepeatWrapping: R grana, G alveoli, B chiazze/onde, A crepe
uniform vec3 uFarina;           // lineare
uniform vec3 uFarinaOmbra;      // lineare
uniform vec3 uImpastoNudo;      // lineare
uniform vec2 uRisoluzione;      // px del drawing buffer
uniform float uAspetto;
uniform float uRespiro;
uniform vec4 uFossette[3];
uniform vec3 uSegnoCliente;
uniform vec4 uPagnotta;
uniform vec4 uGonfiature[3];

varying vec2 vP;
varying vec3 vNormale;
varying float vCurva;
varying float vDistanza;
varying float vAltezza;

const float TEXEL = 1.0 / 256.0;
// rotazioni fisse dei livelli di texture (la ripetizione non si allinea)
const mat2 R_ALVEOLI = mat2(0.8628, 0.5055, -0.5055, 0.8628);
const mat2 R_ONDE = mat2(0.5898, -0.8076, 0.8076, 0.5898);
const mat2 R_CREPE = mat2(-0.5048, 0.8632, -0.8632, -0.5048);
const mat2 R_STRISCE = mat2(0.9455, 0.3256, -0.3256, 0.9455);

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Apertura dello spolvero di una fossetta: x = quanto è aperta (0..1),
// y = distanza ellittica dal centro (1 = bordo della conca).
vec2 apertura(vec2 p, vec4 f, float quanto) {
  vec2 c = vec2((f.x - 0.5) * uAspetto, f.y - 0.5);
  vec2 q = p - c;
  float cs = cos(MAD_FOSSETTA_ROTAZIONE);
  float sn = sin(MAD_FOSSETTA_ROTAZIONE);
  q = vec2(cs * q.x + sn * q.y, -sn * q.x + cs * q.y);
  float r = length(q / MAD_FOSSETTA_SEMIASSI);
  return vec2(quanto, r);
}

void main() {
  vec2 p = vP;
  float sullImpasto = 1.0 - smoothstep(0.985, 1.03, vDistanza);

  // ---------------------------------------------------------------- dettaglio
  // alveoli (G): rilievo in "p", gradiente con differenze in avanti di un texel
  vec2 ta = R_ALVEOLI * p * MAD_S_ALVEOLI + vec2(0.37, 0.11);
  vec4 sA = texture2D(uSpolvero, ta);
  float gx = texture2D(uSpolvero, ta + vec2(TEXEL, 0.0)).g;
  float gy = texture2D(uSpolvero, ta + vec2(0.0, TEXEL)).g;
  vec2 gradA = vec2(gx - sA.g, gy - sA.g) / TEXEL * MAD_S_ALVEOLI * (2.0 * MAD_RILIEVO_ALVEOLI);
  gradA = gradA * R_ALVEOLI; // ritorno nello spazio del piano (trasposta)

  // onde della pelle (B, scala fine)
  float sOnde = MAD_S_CHIAZZE * 2.3;
  vec2 to = R_ONDE * p * sOnde + vec2(0.71, 0.29);
  float o0 = texture2D(uSpolvero, to).b;
  float ox = texture2D(uSpolvero, to + vec2(TEXEL, 0.0)).b;
  float oy = texture2D(uSpolvero, to + vec2(0.0, TEXEL)).b;
  vec2 gradO = vec2(ox - o0, oy - o0) / TEXEL * sOnde * MAD_RILIEVO_ONDE;
  gradO = gradO * R_ONDE;

  float bolla = clamp((sA.g - 0.5) * 2.0, 0.0, 1.0);    // cima di un alveolo
  float cratere = clamp((0.5 - sA.g) * 2.0, 0.0, 1.0);  // bolla scoppiata

  // sul tavolo gli alveoli diventano grumi di farina, più bassi; le onde spariscono
  vec2 grad = gradA * mix(0.55, 1.0, sullImpasto) + gradO * sullImpasto;
  vec3 N = normalize(vNormale + vec3(-grad, 0.0) * vNormale.z);

  // ---------------------------------------------------------------- spolvero
  float chiazze = texture2D(uSpolvero, p * MAD_S_CHIAZZE + vec2(0.13, 0.57)).b;
  float grana = texture2D(uSpolvero, p * MAD_S_GRANA + vec2(0.5, 0.25)).r;
  float crepe = texture2D(uSpolvero, R_CREPE * p * MAD_S_CREPE + vec2(0.21, 0.83)).a;
  float strisce = texture2D(uSpolvero, (R_STRISCE * p) * vec2(MAD_S_CHIAZZE * 0.25, MAD_S_CHIAZZE * 3.2) + vec2(0.4, 0.9)).b;

  // tensione della pelle: più sulle gonfiature e sulla spalla della cupola
  float tensione = 0.0;
  for (int i = 0; i < 3; i++) {
    vec4 g = uGonfiature[i];
    vec2 dg = p - g.xy;
    tensione += exp(-dot(dg, dg) / (g.z * g.z * 0.8));
  }
  tensione = clamp(tensione * 0.8 + smoothstep(0.55, 0.85, vDistanza) * 0.6, 0.0, 1.0) * sullImpasto;
  float crepa = MAD_CREPA_RIPOSO * tensione * (1.0 + MAD_RESPIRO_CREPE * uRespiro);

  // fossette: lo spolvero si apre (crepe larghe sulle pareti, pelle nuda al centro)
  float nudo = 0.0;
  float tirato = 0.0;
  for (int i = 0; i < 3; i++) {
    vec4 f = uFossette[i];
    float quanto = max(f.z, f.w * 0.85);
    if (quanto > 0.0005) {
      vec2 a = apertura(p, f, quanto);
      tirato = max(tirato, a.x * (1.0 - smoothstep(0.35, 1.45, a.y)));
      nudo = max(nudo, a.x * (1.0 - smoothstep(0.12, 0.78, a.y)));
    }
  }
  if (uSegnoCliente.z > 0.5) {
    vec2 a = apertura(p, vec4(uSegnoCliente.xy, 0.0, 1.0), 0.45);
    tirato = max(tirato, a.x * (1.0 - smoothstep(0.35, 1.3, a.y)));
    nudo = max(nudo, a.x * 0.6 * (1.0 - smoothstep(0.1, 0.7, a.y)));
  }
  crepa += MAD_CREPA_FOSSETTA * tirato;

  // densità della farina: un velo continuo a chiazze, più sottile sui fianchi
  // ripidi e sulle bolle (pelle tesa); sul tavolo quasi pieno, con i grumi
  float pendenza = 1.0 - vNormale.z;
  float macchie = smoothstep(0.3, 0.72, chiazze);
  float densImpasto = 0.22 + macchie * 0.8 - pendenza * 1.1 - bolla * 0.3;
  float densTavolo = 0.86 + (chiazze - 0.5) * 0.3 + (strisce - 0.5) * 0.14 + bolla * 0.4;
  float densita = clamp(mix(densTavolo, densImpasto, sullImpasto), 0.0, 1.0);

  // grana: modula il velo e, dove è sottile, lo rompe in granelli
  float pxTexel = uRisoluzione.y / (MAD_S_GRANA * 256.0);
  float contrasto = smoothstep(0.55, 1.3, pxTexel);
  float rottura = (1.0 - densita) * densita * 4.0;           // massima a metà densità
  float modula = mix(1.0, 0.55 + 0.9 * grana, 0.35 + 0.65 * rottura * contrasto);
  float farina = clamp(densita * modula, 0.0, 1.0);
  farina = max(farina, smoothstep(0.9, 0.985, grana) * 0.75 * contrasto * (0.3 + densita));

  // crepe (tensione e fossette) e pelle nuda nella fossetta
  float crepaM = 1.0 - smoothstep(crepa, crepa + 0.03, crepe);
  farina *= 1.0 - crepaM * sullImpasto * 0.8;
  farina *= 1.0 - nudo * (1.0 - smoothstep(0.7, 0.95, grana));
  farina *= 1.0 - cratere * 0.8 * sullImpasto;

  // ------------------------------------------------------------------ albedo
  vec3 farinaPiena = min(uFarina * vec3(1.05, 1.06, 1.08), vec3(1.0));
  vec3 pelle = mix(uImpastoNudo, uFarina, 0.28 - nudo * 0.28);
  pelle = mix(pelle, uImpastoNudo * 1.03, bolla * 0.3 * sullImpasto); // bolla: pelle tesa, traslucida
  vec3 tavolo = mix(uFarina, uFarinaOmbra, 0.3);
  vec3 sotto = mix(tavolo, pelle, sullImpasto);
  vec3 albedo = mix(sotto, farinaPiena, farina);

  // ------------------------------------------------------------------- luce
  vec3 L = MAD_LUCE;
  float w = MAD_AVVOLGIMENTO;
  float diff = max((dot(N, L) + w) / (1.0 + w), 0.0);
  float diffPiatto = (L.z + w) / (1.0 + w);
  float luce = (MAD_AMBIENTE + (1.0 - MAD_AMBIENTE) * diff) / (MAD_AMBIENTE + (1.0 - MAD_AMBIENTE) * diffPiatto);

  // traslucenza dei bordi convessi (labbro della fossetta, gonfiature) e occlusione nelle conche
  luce += clamp(-vCurva * MAD_BORDO_CHIARO, 0.0, 0.1) * sullImpasto;
  luce *= 1.0 - clamp(vCurva * MAD_OCCLUSIONE, 0.0, 0.35);
  luce *= 1.0 - cratere * 0.22 * sullImpasto;
  // cielo: le parti basse della pagnotta vedono meno cielo
  float quota = clamp(vAltezza / max(uPagnotta.w, 1e-3), 0.0, 1.0);
  luce *= mix(0.9, 1.0, smoothstep(0.0, 0.3, quota)) * sullImpasto + (1.0 - sullImpasto);
  // contatto col tavolo: ombra morbida e stretta attorno al piede della pagnotta
  float fuori = max(vDistanza - 1.0, 0.0) * uPagnotta.z;
  luce *= 1.0 - 0.3 * exp(-fuori / 0.012) * (1.0 - sullImpasto);

  vec3 tintaOmbra = mix(uFarinaOmbra, uImpastoNudo, 0.45 * sullImpasto);
  vec3 rapporto = pow(tintaOmbra / max(uFarina, vec3(0.001)), vec3(MAD_PROFONDITA_OMBRA));
  vec3 col = albedo * mix(rapporto, vec3(1.0), clamp(luce, 0.0, 1.0));
  col += (vec3(1.0) - col) * clamp(luce - 1.0, 0.0, 1.0) * MAD_SCHIARITA;

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  // dithering di mezzo livello: niente bande nei gradienti chiarissimi
  gl_FragColor.rgb += (hash12(gl_FragCoord.xy) - 0.5) / 255.0;
}
