uniform int layerCount;
uniform sampler2D alphaMaps[4];
uniform sampler2D textures[4];

varying vec2 vUv;
varying vec2 vUvAlpha;

void main() {
  vec4 color = texture2D(textures[0], vUv);

  vec4 layer;
  vec4 blend;

  if (layerCount > 1) {
    layer = texture2D(textures[1], vUv);
    blend = texture2D(alphaMaps[0], vUvAlpha);
    color = mix(color, layer, blend);
  }

  if (layerCount > 2) {
    layer = texture2D(textures[2], vUv);
    blend = texture2D(alphaMaps[1], vUvAlpha);
    color = mix(color, layer, blend);
  }

  if (layerCount > 3) {
    layer = texture2D(textures[3], vUv);
    blend = texture2D(alphaMaps[2], vUvAlpha);
    color = mix(color, layer, blend);
  }

  gl_FragColor = color;
}
