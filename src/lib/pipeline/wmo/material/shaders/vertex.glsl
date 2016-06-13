precision highp float;

// THREE's built-in color attribute is a vec3, but Wowser needs RGBA.
attribute vec4 acolor;

varying float vFogFactor;
varying vec2 vCoord0;
varying vec4 vColor0;

uniform float fogModifier;
uniform float fogStart;
uniform float fogEnd;
#ifdef USE_LIGHTING
  uniform vec3 diffuseColor;
  uniform vec3 ambientColor;
  uniform float lightModifier;
#endif

float saturate(float value) {
  return clamp(value, 0.0, 1.0);
}

vec3 saturate(vec3 value) {
  return clamp(value, 0.0, 1.0);
}

vec4 saturate(vec4 value) {
  return clamp(value, 0.0, 1.0);
}

void main() {
  // Varyings
  vCoord0 = uv;
  vColor0 = acolor;

  vec4 vertexLocal = vec4(position, 1.0);
  vec3 vertexWorld = (modelMatrix * vertexLocal).xyz;
  vec4 normalLocal = vec4(normal, 0.0);
  vec3 normalWorld = (modelMatrix * normalLocal).xyz;

  // Calculate distance from camera to this vertex
  float cameraDistance = distance(cameraPosition, vertexWorld);

  // Fog
  // 0.0 = no fog; 1.0 = max fog
  vFogFactor = saturate((cameraDistance - fogStart) / (fogEnd - fogStart));
  vFogFactor *= fogModifier;

  // Lighting
  #ifdef USE_LIGHTING
    vec3 lightDirection = vec3(1, 1, 1);
    float lightFactor = dot(normalize(lightDirection), normalize(normalWorld));

    // Saturate + amplify brighter light
    if (lightFactor < 0.0) {
      lightFactor = 0.0;
    } else if (lightFactor > 0.5) {
      lightFactor = 0.5 + ((lightFactor - 0.5) * 0.65);
    }

    vec3 light = saturate((diffuseColor * lightFactor) + ambientColor);

    #if BATCH_TYPE == 1
      // Transition between vertex color and light
      vColor0.rgb = mix(vColor0.rgb * 2.0, light, vColor0.a);
    #elif BATCH_TYPE == 2
      // Transition between vertex color and vertex color added to light
      vColor0.rgb = mix(vColor0.rgb * 2.0, light + (vColor0.rgb * 2.0), vColor0.a);
    #elif BATCH_TYPE == 3
      // Only light
      vColor0.rgb = light;
    #endif

    // Apply light modifier
    vColor0.rgb = mix(vec3(1.0), vColor0.rgb, lightModifier);
  #else
    // Fallback: only vertex color
    vColor0.rgb = vColor0.rgb * 2.0;
  #endif

  gl_Position = projectionMatrix * modelViewMatrix * vertexLocal;
}
