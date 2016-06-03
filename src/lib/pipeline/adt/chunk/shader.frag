uniform int layerCount;
uniform sampler2D alphaMaps[4];
uniform sampler2D textures[4];

varying vec2 vUv;
varying vec2 vUvAlpha;

varying vec3 vertexNormal;
varying float cameraDistance;

uniform float lightModifier;
uniform vec3 ambientLight;
uniform vec3 diffuseLight;

uniform float fogModifier;
uniform float fogStart;
uniform float fogEnd;
uniform vec3 fogColor;

vec4 applyFog(vec4 color) {
  float fogFactor = (fogEnd - cameraDistance) / (fogEnd - fogStart);
  fogFactor = fogFactor * fogModifier;
  fogFactor = clamp(fogFactor, 0.0, 1.0);
  color.rgb = mix(fogColor.rgb, color.rgb, fogFactor);

  // Ensure alpha channel is gone once a sufficient distance into the fog is reached.
  if (cameraDistance > fogEnd * 1.5) {
    color.a = 1.0;
  }

  return color;
}

vec4 finalizeColor(vec4 color) {
  if (fogModifier > 0.0) {
    color = applyFog(color);
  }

  return color;
}

// Given a light direction and normal, return a directed diffuse light.
vec3 getDirectedDiffuseLight(vec3 lightDirection, vec3 lightNormal, vec3 diffuseLight) {
  float light = dot(lightNormal, -lightDirection);

  if (light < 0.0) {
    light = 0.0;
  } else if (light > 0.5) {
    light = 0.5 + ((light - 0.5) * 0.65);
  }

  vec3 directedDiffuseLight = diffuseLight.rgb * light;

  return directedDiffuseLight;
}

// Given a layer, light it with diffuse and ambient light.
vec4 lightLayer(vec4 color, vec3 diffuse, vec3 ambient) {
  if (lightModifier > 0.0) {
    color.rgb *= diffuse + ambient;
    color.rgb = saturate(color.rgb);
  }

  return color;
}

// Given a color, light it, and blend it with a layer.
vec4 lightAndBlendLayer(vec4 color, vec4 layer, vec4 blend, vec3 diffuse, vec3 ambient) {
  layer = lightLayer(layer, diffuse, ambient);
  color = (layer * blend) + ((1.0 - blend) * color);

  return color;
}

void main() {
  vec3 lightDirection = normalize(vec3(-1, -1, -1));
  vec3 lightNormal = normalize(vertexNormal);

  vec3 directedDiffuseLight = getDirectedDiffuseLight(lightDirection, lightNormal, diffuseLight);

  vec4 layer;
  vec4 blend;

  // Base layer
  vec4 color = texture2D(textures[0], vUv);
  color = lightLayer(color, directedDiffuseLight, ambientLight);

  // 2nd layer
  if (layerCount > 1) {
    layer = texture2D(textures[1], vUv);
    blend = texture2D(alphaMaps[0], vUvAlpha);

    color = lightAndBlendLayer(color, layer, blend, directedDiffuseLight, ambientLight);
  }

  // 3rd layer
  if (layerCount > 2) {
    layer = texture2D(textures[2], vUv);
    blend = texture2D(alphaMaps[1], vUvAlpha);

    color = lightAndBlendLayer(color, layer, blend, directedDiffuseLight, ambientLight);
  }

  // 4th layer
  if (layerCount > 3) {
    layer = texture2D(textures[3], vUv);
    blend = texture2D(alphaMaps[2], vUvAlpha);

    color = lightAndBlendLayer(color, layer, blend, directedDiffuseLight, ambientLight);
  }

  color = finalizeColor(color);

  gl_FragColor = color;
}
