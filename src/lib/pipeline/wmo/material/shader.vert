precision highp float;

varying vec2 vUv;

varying vec3 vertexWorldNormal;
varying float cameraDistance;

attribute vec3 color;
attribute float alpha;

varying vec4 vertexColor;

uniform int indoor;

uniform int useBaseColor;
uniform vec3 baseColor;
uniform float baseAlpha;

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

void main() {
  vUv = uv;

  vertexColor = vec4(color, alpha);

  if (indoor == 1 && useBaseColor == 1) {
    vertexColor.rgb = saturate(vertexColor.rgb + baseColor.rgb);
    vertexColor.a = saturate(mod(vertexColor.a, 1.0) + (1.0 - baseAlpha));
  }

  vec3 vertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  cameraDistance = distance(cameraPosition, vertexWorldPosition);

  vertexWorldNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);
}
