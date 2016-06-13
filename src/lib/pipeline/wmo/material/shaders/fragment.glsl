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
  #ifdef USE_WORLD_LIGHT
    #ifdef BATCH_TYPE
      #if BATCH_TYPE == 1
        color.rgb *= mix(vColor0.rgb * 2.0, vWorldLight.rgb, vColor0.a);
      #endif

      #if BATCH_TYPE == 2
        color.rgb *= mix(vColor0.rgb * 2.0, vWorldLight.rgb + (vColor0.rgb * 2.0), vColor0.a);
      #endif

      #if BATCH_TYPE == 3
        color.rgb *= mix(vColor0.rgb * 2.0, vWorldLight.rgb, 1.0);
      #endif
    #else
      color.rgb *= mix(vColor0.rgb * 2.0, vWorldLight.rgb, 1.0);
    #endif
  #endif

  // Fog
  color.rgb = mix(color.rgb, fogColor.rgb, vFogFactor);

  // Clean up
  #ifdef BLENDING_MODE
    // Force transparent pixels to opaque in blending mode 0
    #if BLENDING_MODE == 0
      color.a = 1.0;
    #endif

    // Scale pixel transparency with fog factor in blending mode 1
    #if BLENDING_MODE == 1
      color.a = mix(color.a, 1.0, vFogFactor);
    #endif
  #endif

  gl_FragColor = color;
}
