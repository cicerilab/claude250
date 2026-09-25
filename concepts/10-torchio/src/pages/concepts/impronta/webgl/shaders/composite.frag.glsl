// IMPRONTA · composite nello slot dell'atlante (webgl-artist)
//
// Ultimo passo della cottura. Si disegna con il viewport/scissor sullo slot
// del blocco nell'atlante (lo imposta atlas.ts), blending SPENTO.
// vUv 0..1 copre sia la maschera sia i due passaggi di blur (stesse misure).
//
// Scrive nell'atlante (layout letto da relief.frag.glsl):
//   R  altezza del solco con il profilo a gradini, spostata di HEIGHT_BIAS
//      perché il "cuscinetto" (carta che si gonfia attorno al solco) è
//      un'altezza negativa e un render target a 8 bit non ha il segno.
//      Piano del foglio = HEIGHT_BIAS; fondo del solco = 1.0.
//   G  inchiostro morbido (bordo sfumato di pochi decimi di px): lo shader
//      principale lo taglia con la soglia della fibra, così beve nella carta.
//   B  lamina, netta (solo l'antialias della maschera).
//   A  altezza "stretta" (solo r1): serve allo scurimento del fondo del solco.
//
// Uniform:
//   tMask     maschera cotta da maskPainter (R altezza, G inchiostro, B lamina)
//   tBlur     uscita del passaggio 1 del blur
//   uProfilo  x,y,z = pesi di r1,r2,r3 (sommano a 1), w = cuscinetto
//
// Define (da materials.ts): HEIGHT_BIAS

uniform sampler2D tMask;
uniform sampler2D tBlur;
uniform vec4 uProfilo;

varying vec2 vUv;

void main() {
  vec4 m = texture2D(tMask, vUv);
  vec4 b = texture2D(tBlur, vUv);

  // Profilo: somma pesata dei tre raggi. Dentro la lettera tutti valgono
  // ~altezza (fondo piatto, come il piombo che schiaccia); verso il bordo
  // scendono uno dopo l'altro: il bordo si legge come due o tre gradini.
  float h = uProfilo.x * b.r + uProfilo.y * b.g + uProfilo.z * b.b;

  // Cuscinetto: dove il raggio largo "sente" la lettera ma lo spigolo no,
  // cioè subito fuori dal solco. Lo si attenua dentro la lettera.
  float cuscinetto = max(b.b - b.r, 0.0) * (1.0 - b.r);
  // In unità di profondità: con w = 0,12 il cuscinetto arriva al 5% circa
  // del solco, come la carta vera; resta sempre sopra lo zero del bias.
  float r = HEIGHT_BIAS + (h - cuscinetto * uProfilo.w * 2.0) * (1.0 - HEIGHT_BIAS);

  gl_FragColor = vec4(clamp(r, 0.0, 1.0), clamp(b.a, 0.0, 1.0), m.b, b.r);
}
