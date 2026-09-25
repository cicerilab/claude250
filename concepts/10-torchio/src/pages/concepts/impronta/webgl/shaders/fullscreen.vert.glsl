// IMPRONTA · vertex a schermo intero (webgl-artist)
//
// Usato da tutti e tre i materiali (rilievo, blur, composite) con una
// PlaneGeometry(2, 2): i vertici sono già in clip space, nessuna camera.
// `position` e `uv` li dichiara three (ShaderMaterial non raw), così lo
// stesso sorgente vale in WebGL2 e in WebGL1.

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
