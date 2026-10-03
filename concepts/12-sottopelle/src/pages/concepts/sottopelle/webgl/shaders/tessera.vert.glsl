// SOTTOPELLE · tessera della parete (vertex). GLSL ES 1.00: gira su WebGL1 e WebGL2.
// BORDO_AA arriva da presets.ts (programma.ts antepone i #define).
//
// Un solo quad unitario (aAngolo in 0..1, TRIANGLE_STRIP) disegnato una volta
// per tessera visibile. uRett è la tessera in px fisici con origine in alto a
// sinistra; il quad si allarga di BORDO_AA px per lato così il fragment può
// fare l'antialias dello spigolo (le tessere distano almeno M/6: mai sovrapposte).

attribute vec2 aAngolo;

uniform vec2 uRisoluzione;
uniform vec4 uRett;

varying vec2 vUv;
varying vec2 vPx;

void main() {
  vec2 px = aAngolo * (uRett.zw + 2.0 * BORDO_AA) - BORDO_AA;
  vec2 schermo = (uRett.xy + px) / uRisoluzione;
  gl_Position = vec4(schermo.x * 2.0 - 1.0, 1.0 - schermo.y * 2.0, 0.0, 1.0);
  vPx = px;
  vUv = px / uRett.zw;
}
