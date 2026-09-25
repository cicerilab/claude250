// IMPRONTA · blur separabile a quattro raggi (webgl-artist)
//
// Serve alla "cottura" di una maschera, una volta per versione del blocco:
// non gira mai durante lo scroll. Si chiama due volte:
//
//   passaggio 0 (orizzontale): legge la MASCHERA (R altezza, G inchiostro)
//     e scrive  R = blur(altezza, r1)
//               G = blur(altezza, r2)
//               B = blur(altezza, r3)
//               A = blur(inchiostro, rInk)
//   passaggio 1 (verticale): legge il risultato del passaggio 0 e sfuoca
//     ogni canale con il SUO raggio (R con r1, G con r2, B con r3, A con rInk).
//
// Tre raggi crescenti sommati nel composite danno il profilo "a gradini"
// del piombo: spigolo netto, spalla, coda morbida nella carta.
//
// Kernel: 13 campioni per raggio distribuiti su ±2,5 sigma, pesi gaussiani.
// Con filtro lineare della sorgente 13 campioni bastano anche per sigma
// piccoli (i campioni si sovrappongono, nessun buco).
//
// Uniform:
//   tSrc         sorgente (maschera o passaggio 0), wrap CLAMP_TO_EDGE
//   uTexel       1 / dimensione della sorgente in texel
//   uDir         (1,0) orizzontale, (0,1) verticale
//   uRaggi       sigma in texel: x = r1, y = r2, z = r3, w = inchiostro
//   uPassaggio   0.0 o 1.0

uniform sampler2D tSrc;
uniform vec2 uTexel;
uniform vec2 uDir;
uniform vec4 uRaggi;
uniform float uPassaggio;

varying vec2 vUv;

#define LATO 6

// Legge il canale di ingresso per ciascuna uscita: al passaggio 0 le prime
// tre uscite leggono tutte l'altezza (R) e la quarta l'inchiostro (G).
vec4 sorgente(vec2 uv) {
  vec4 t = texture2D(tSrc, uv);
  return uPassaggio < 0.5 ? vec4(t.r, t.r, t.r, t.g) : t;
}

void main() {
  vec4 somma = vec4(0.0);
  float pesi = 0.0;
  vec2 passo = uDir * uTexel * (2.5 / float(LATO));

  for (int k = -LATO; k <= LATO; k++) {
    float fk = float(k);
    float t = fk * (2.5 / float(LATO));
    float w = exp(-0.5 * t * t);
    vec2 o = passo * fk;
    // Un campione per raggio: stesso peso, distanza scalata dal proprio sigma.
    somma.r += sorgente(vUv + o * uRaggi.x).r * w;
    somma.g += sorgente(vUv + o * uRaggi.y).g * w;
    somma.b += sorgente(vUv + o * uRaggi.z).b * w;
    somma.a += sorgente(vUv + o * uRaggi.w).a * w;
    pesi += w;
  }

  gl_FragColor = somma / pesi;
}
