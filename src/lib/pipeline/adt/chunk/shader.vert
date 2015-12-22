precision highp float;

attribute vec2 uvAlpha;

varying vec2 vUv;
varying vec2 vUvAlpha;

void main() {
  vUv = uv;
  vUvAlpha = uvAlpha;

  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);
}
