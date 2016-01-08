uniform int fragmentShaderMode;

uniform int textureCount;
uniform sampler2D textures[4];

varying vec2 vUv;

varying vec3 vertexNormal;
varying vec3 vertexWorldPosition;
varying float cameraDistance;

uniform float alphaKey;

uniform float lightModifier;
uniform vec3 ambientLight;
uniform vec3 diffuseLight;

uniform float fogModifier;
uniform float fogStart;
uniform float fogEnd;
uniform vec3 fogColor;

vec3 saturate(vec3 value) {
  vec3 result = clamp(value, 0.0, 1.0);
  return result;
}

float saturate(float value) {
  float result = clamp(value, 0.0, 1.0);
  return result;
}

vec4 fragCombinersOpaque(sampler2D texture1, vec2 uv1) {
  vec4 texture1Color = texture2D(texture1, uv1);

  if (alphaKey == 1.0 && texture1Color.a <= 0.5) {
    discard;
  }

  vec4 r0 = texture1Color;

  // TODO: Vertex color?
  // r0.rgb *= input.color.rgb;

  // TODO: Should this be 1.0? 2.0? Something else?
  r0.rgb *= 1.0;

  // TODO: Vertex alpha color?
  // combinedColor.a = input.color.a;

  vec4 outputColor = r0;

  return outputColor;
}

vec4 fragCombinersOpaqueOpaque(sampler2D texture1, vec2 uv1, sampler2D texture2, vec2 uv2) {
  vec4 texture1Color = texture2D(texture1, uv1);
  vec4 texture2Color = texture2D(texture2, uv2);

  if (alphaKey == 1.0 && texture1Color.a <= 0.5) {
    discard;
  }

  // TODO: Support transparency
  // textureColor1.a *= transparency.x;
  // textureColor2.a *= transparency.y;

  vec4 r0 = texture1Color;
  vec4 r1 = texture2Color;
  r0.rgb *= r1.rgb;

  // TODO: What's this? Input is vertex, so... vertex color? And only half?
  // r0.rgb *= input.color.rgb * 0.5f;

  r0.rgb *= 2.0;

  // TODO: Vertex color and alpha?
  // combinedColor.rgb = r0.rgb;
  // combinedColor.a = input.color.a;

  vec4 outputColor = r0;

  return outputColor;
}

vec4 applyDiffuseLighting(vec4 color) {
  vec3 lightDirection = vec3(-1, 1, -1);

  float light = saturate(dot(vertexNormal, normalize(-lightDirection)));

  vec3 diffusion = diffuseLight.rgb * light;
  diffusion += ambientLight.rgb;
  diffusion = saturate(diffusion);

  color.rgb *= diffusion;

  return color;
}

vec4 applyFog(vec4 color) {
  // Method A
  /*
    float fogRange = fogEnd - fogStart;
    float fogDepth = (cameraDistance - fogStart) / fogRange;
    float fogFactor = pow(saturate(fogDepth), 1.5) * fogModifier;

    vec3 fogged = (fogFactor * fogColor.rgb) + ((1.0 - fogFactor) * color.rgb);
    color.rgb = fogged.rgb;
  */

  // Method B
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

vec4 finalizeColor(vec4 color) {
  if (lightModifier > 0.0) {
    color = applyDiffuseLighting(color);
  }

  if (fogModifier > 0.0) {
    color = applyFog(color);
  }

  return color;
}

void main() {
  // For some reason, V is inverted?!
  vec2 uv1 = vec2(vUv[0], -vUv[1]);
  vec2 uv2 = vec2(vUv[0], -vUv[1]);

  vec4 color;

  // -1 = unknown / unhandled
  // Stopgap until all shaders are implemented and verified

  if (fragmentShaderMode == -1) {
    color = texture2D(textures[0], uv1);
  } else if (fragmentShaderMode == 0) {
    color = fragCombinersOpaque(textures[0], uv1);
  } else if (fragmentShaderMode == 1) {
    color = fragCombinersOpaqueOpaque(textures[0], uv1, textures[1], uv2);
  }

  // Apply lighting and fog.
  color = finalizeColor(color);

  gl_FragColor = color;
}
