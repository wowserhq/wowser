precision highp float;

varying float vFogFactor;
varying vec2 vCoord0;
varying vec4 vColor0;

uniform int textureCount;
uniform sampler2D textures[4];
uniform vec3 fogColor;

void main() {
  vec4 color = texture2D(textures[0], vCoord0);

  // Alpha test in blending mode 1
  #if BLENDING_MODE == 1
    if (color.a < 25.0 / 255.0) {
      discard;
    }
  #endif

  // Lighting
  color.rgb *= vColor0.rgb;

  // Fog
  color.rgb = mix(color.rgb, fogColor.rgb, vFogFactor);

  // Force transparent pixels to opaque in blending mode 0
  #if BLENDING_MODE == 0
    color.a = 1.0;
  #endif

  gl_FragColor = color;
}
