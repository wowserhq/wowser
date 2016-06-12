precision highp float;

varying float vFogFactor;
varying vec2 vCoord0;
varying vec4 vColor0;
#ifdef USE_WORLD_LIGHT
  varying vec3 vWorldLight;
#endif

uniform int textureCount;
uniform sampler2D textures[4];
uniform vec3 fogColor;

void main() {
  vec4 color = texture2D(textures[0], vCoord0);

  // Lighting
  #ifdef BATCH_TYPE
    #if BATCH_TYPE == 1
      color.rgb *= mix(vColor0.rgb, vWorldLight.rgb, vColor0.a);
    #endif

    #if BATCH_TYPE == 2
      color.rgb *= mix(vColor0.rgb, vWorldLight.rgb + vColor0.rgb, vColor0.a);
    #endif

    #if BATCH_TYPE == 3
      color.rgb *= mix(vColor0.rgb, vWorldLight.rgb, 1.0);
    #endif
  #else
    color.rgb *= mix(vColor0.rgb, vWorldLight.rgb, 1.0);
  #endif

  // Fog
  color.rgb = mix(color.rgb, fogColor.rgb, vFogFactor);

  #ifdef BLENDING_MODE
    #if BLENDING_MODE == 1
      color.a = mix(color.a, 1.0, vFogFactor);
    #endif
  #endif

  gl_FragColor = color;
}
