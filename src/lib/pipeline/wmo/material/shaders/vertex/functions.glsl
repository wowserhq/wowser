float saturate(float value) {
  return clamp(value, 0.0, 1.0);
}

vec3 saturate(vec3 value) {
  return clamp(value, 0.0, 1.0);
}

vec4 saturate(vec4 value) {
  return clamp(value, 0.0, 1.0);
}

vec3 createLight(in vec3 normal, in vec3 direction, in vec3 diffuseColor, in vec3 ambientColor) {
  float factor = saturate(dot(-direction.xyz, normalize(normal.xyz)));

  vec3 light = saturate((diffuseColor.rgb * factor) + ambientColor.rgb);

  return light;
}

vec4 createFog(in float cameraDistance) {
  float f1 = (cameraDistance * fogParams.x) + fogParams.y;
  float f2 = max(f1, 0.0);
  float f3 = pow(f2, fogParams.z);
  float f4 = min(f3, 1.0);

  float fogFactor = 1.0 - f4;

  vec4 fog;

  fog.rgb = fogColor.rgb;
  fog.a = fogFactor;

  return fog;
}
