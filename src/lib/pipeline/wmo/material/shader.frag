varying vec2 vUv;

varying vec4 vertexColor;
varying vec3 vertexWorldNormal;
varying float cameraDistance;

uniform int textureCount;
uniform sampler2D textures[4];
uniform int blendingMode;

uniform float lightModifier;
uniform vec3 ambientLight;
uniform vec3 diffuseLight;

uniform float fogModifier;
uniform float fogStart;
uniform float fogEnd;
uniform vec3 fogColor;

uniform int indoor;

vec4 saturate(vec4 value) {
  vec4 result = clamp(value, 0.0, 1.0);
  return result;
}

vec3 saturate(vec3 value) {
  vec3 result = clamp(value, 0.0, 1.0);
  return result;
}

float saturate(float value) {
  float result = clamp(value, 0.0, 1.0);
  return result;
}

// Given a light direction and normal, return a directed diffuse light.
vec3 createGlobalLight(vec3 lightDirection, vec3 lightNormal, vec3 diffuseLight, vec3 ambientLight) {
  float light = dot(lightNormal, -lightDirection);

  if (light < 0.0) {
    light = 0.0;
  } else if (light > 0.5) {
    light = 0.5 + ((light - 0.5) * 0.65);
  }

  vec3 directedDiffuseLight = diffuseLight.rgb * light;

  directedDiffuseLight.rgb += ambientLight.rgb;
  directedDiffuseLight = saturate(directedDiffuseLight);

  return directedDiffuseLight;
}

vec4 applyFog(vec4 color) {
  float fogFactor = (fogEnd - cameraDistance) / (fogEnd - fogStart);
  fogFactor = fogFactor * fogModifier;
  fogFactor = clamp(fogFactor, 0.0, 1.0);
  color.rgb = mix(fogColor.rgb, color.rgb, fogFactor);

  // Ensure alpha channel is gone once a sufficient distance into the fog is reached. Prevents
  // texture artifacts from overlaying alpha values.
  if (cameraDistance > fogEnd * 1.5) {
    color.a = 1.0;
  }

  return color;
}

vec4 lightIndoor(vec4 color, vec4 vertexColor, vec3 light) {
  vec3 groupColor = vertexColor.rgb;

  vec3 indoorLight;

  indoorLight = (vertexColor.a * light.rgb) + ((1.0 - vertexColor.a) * groupColor);
  indoorLight.rgb = saturate(indoorLight.rgb);

  color.rgb *= indoorLight;

  return color;
}

vec4 lightOutdoor(vec4 color, vec4 vertexColor, vec3 light) {
  vec3 outdoorLight = light.rgb += (vertexColor.rgb * 2.0);
  outdoorLight.rgb = saturate(outdoorLight.rgb);

  color.rgb *= outdoorLight;

  return color;
}

void main() {
  vec3 lightDirection = normalize(vec3(-1, -1, -1));
  vec3 lightNormal = normalize(vertexWorldNormal);
  vec3 globalLight = createGlobalLight(lightDirection, lightNormal, diffuseLight, ambientLight);

  // Base layer
  vec4 color = texture2D(textures[0], vUv);

  // Knock out transparent pixels in blending mode 1
  if (blendingMode == 1 && color.a < (10.0 / 255.0)) {
    discard;
  }

  // Force transparent pixels to fully opaque if in opaque blending mode. Needed to prevent fog
  // from causing textures with transparent pixels to appear too bright in the distance.
  if (blendingMode == 0 && color.a < 1.0) {
    color.a = 1.0;
  }

  if (lightModifier > 0.0) {
    if (indoor == 1) {
      color = lightIndoor(color, vertexColor, globalLight);
    } else {
      color = lightOutdoor(color, vertexColor, globalLight);
    }
  }

  color = applyFog(color);

  gl_FragColor = color;
}
