uniform int fragmentShaderMode;

uniform int textureCount;
uniform sampler2D textures[4];

varying vec2 texture1Coord;
varying vec2 texture2Coord;

varying float cameraDistance;

varying vec3 vertexWorldNormal;

varying vec4 vertexColor;

uniform float animatedTransparencies[4];

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

vec4 fragCombinersWotlkSingle(sampler2D texture1, vec2 uv1) {
  vec4 texture1Color = texture2D(texture1, uv1);

  if (alphaKey == 1.0 && texture1Color.a <= 0.5) {
    discard;
  }

  vec4 c1 = texture1Color;

  // Apply animated transparency (defaults to 1.0)
  c1.a *= animatedTransparencies[0];

  // Blend with vertex color
  c1.rgb *= (vertexColor.rgb * vertexColor.a);

  // Restore full color intensity after blending with vertexColor
  c1.rgb *= 2.0;

  vec4 outputColor = c1;

  return outputColor;
}

vec4 fragCombinersWotlkMulti2(sampler2D texture1, vec2 uv1, sampler2D texture2, vec2 uv2) {
  vec4 texture1Color = texture2D(texture1, uv1);
  vec4 texture2Color = texture2D(texture2, uv2);

  if (alphaKey == 1.0 && texture1Color.a <= 0.5) {
    discard;
  }

  vec4 c1 = texture1Color;
  vec4 c2 = texture2Color;

  // Apply animated transparencies (defaults to 1.0)
  c1.a *= animatedTransparencies[0];
  c2.a *= animatedTransparencies[1];

  // Blend texture alphas
  c1.a *= c2.a;

  // Blend with vertex color
  c1.rgb *= (vertexColor.rgb * vertexColor.a);

  // Restore full color intensity after blending with vertexColor
  c1.rgb *= 2.0;

  vec4 outputColor = c1;

  return outputColor;
}

vec4 fragCombinersOpaque(sampler2D texture1, vec2 uv1) {
  vec4 texture1Color = texture2D(texture1, uv1);

  if (alphaKey == 1.0 && texture1Color.a <= 0.5) {
    discard;
  }

  vec4 c1 = texture1Color;

  // Apply animated transparency (defaults to 1.0)
  c1.a *= animatedTransparencies[0];

  // Blend with vertex color
  c1.rgb *= (vertexColor.rgb * vertexColor.a);

  // Restore full color intensity after blending with vertexColor
  c1.rgb *= 2.0;

  vec4 outputColor = c1;

  return outputColor;
}

vec4 fragCombinersOpaqueAlpha(sampler2D texture1, vec2 uv1, sampler2D texture2, vec2 uv2) {
  vec4 texture1Color = texture2D(texture1, uv1);
  vec4 texture2Color = texture2D(texture2, uv2);

  if (alphaKey == 1.0 && texture1Color.a <= 0.5) {
    discard;
  }

  vec4 c1 = texture1Color;
  vec4 c2 = texture2Color;

  // Apply animated transparencies (defaults to 1.0)
  c1.a *= animatedTransparencies[0];
  c2.a *= animatedTransparencies[1];

  c2.rgb = -c1.rgb + c2.rgb;
  c1.rgb = c2.a * c2.rgb + c1.rgb;

  // Blend with vertex color
  c1.rgb *= (vertexColor.rgb * vertexColor.a);

  // Restore full color intensity after blending with vertexColor
  c1.rgb *= 2.0;

  vec4 outputColor = c1;

  return outputColor;
}

vec4 applyDiffuseLighting(vec4 color) {
  vec3 lightDirection = vec3(1, 1, -1);

  float light = saturate(dot(vertexWorldNormal, normalize(-lightDirection)));

  vec3 diffusion = diffuseLight.rgb * light;
  diffusion += ambientLight.rgb;
  diffusion = saturate(diffusion);

  color.rgb *= diffusion;

  return color;
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
  vec2 uv1 = vec2(texture1Coord);
  vec2 uv2 = vec2(texture2Coord);

  vec4 color;

  // -1 = unknown / unhandled
  // Stopgap until all shaders are implemented and verified

  if (fragmentShaderMode == -1) {
    color = texture2D(textures[0], uv1);
  } else if (fragmentShaderMode == 0) {
    color = fragCombinersWotlkSingle(textures[0], uv1);
  } else if (fragmentShaderMode == 1) {
    color = fragCombinersWotlkMulti2(textures[0], uv1, textures[1], uv2);
  }

  // Apply lighting and fog.
  color = finalizeColor(color);

  gl_FragColor = color;
}
