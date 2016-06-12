precision highp float;

// THREE's built-in color attribute is a vec3, but Wowser needs RGBA.
attribute vec4 acolor;

varying float vFogFactor;
varying vec2 vCoord0;
varying vec4 vColor0;
#ifdef USE_WORLD_LIGHT
  varying vec3 vWorldLight;
#endif

uniform float fogModifier;
uniform float fogStart;
uniform float fogEnd;
#ifdef USE_WORLD_LIGHT
  uniform vec3 diffuseColor;
  uniform vec3 ambientColor;
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
  vec4 vertexLocal = vec4(position, 1.0);
  vec3 vertexWorld = (modelMatrix * vertexLocal).xyz;
  vec4 normalLocal = vec4(normal, 0.0);
  vec3 normalWorld = (modelMatrix * normalLocal).xyz;

  // Calculate distance from camera to this vertex
  float cameraDistance = distance(cameraPosition, vertexWorld);

  // 1.0 = max fog, 0.0 = no fog
  vFogFactor = saturate((cameraDistance - fogStart) / (fogEnd - fogStart));
  vFogFactor *= fogModifier;

  #ifdef USE_WORLD_LIGHT
    vec3 worldLightDirection = vec3(1, 1, 1);
    float worldLightFactor = dot(normalize(worldLightDirection), normalize(normalWorld));

    // Saturate + amplify brighter light
    if (worldLightFactor < 0.0) {
      worldLightFactor = 0.0;
    } else if (worldLightFactor > 0.5) {
      worldLightFactor = 0.5 + ((worldLightFactor - 0.5) * 0.65);
    }

    vWorldLight = saturate((diffuseColor * worldLightFactor) + ambientColor);
  #endif

  vCoord0 = uv;
  vColor0 = acolor;

  gl_Position = projectionMatrix * modelViewMatrix * vertexLocal;
}
