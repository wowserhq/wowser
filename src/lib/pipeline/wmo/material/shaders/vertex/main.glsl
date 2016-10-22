#pragma glslify: import('./header.glsl')
#pragma glslify: import('./functions.glsl')

void main() {
  vec3 objectPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vec3 objectNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

  float cameraDistance = length(modelViewMatrix * vec4(position, 1.0));

  // t1 coordinate
  coords[0] = uv;

  // Fog
  fog = createFog(cameraDistance);

  #if USE_LIGHTING == 1
    vec3 light = createLight(objectNormal.xyz, sunParams.xyz, sunDiffuseColor.rgb, sunAmbientColor.rgb);
    light = mix(light, vec3(1.0, 1.0, 1.0), 1.0 - materialParams.y);
  #else
    vec3 light = vec3(1.0, 1.0, 1.0);
  #endif

  #if USE_VERTEX_COLOR == 1
    vec4 vertexColor = vec4(acolor.rgb, acolor.a);
  #else
    vec4 vertexColor = vec4(0.5, 0.5, 0.5, 1.0);
  #endif

  #if BATCH_TYPE == 1
    // Transition between vertex color and light based on vertex alpha
    colors[0].rgb = saturate(mix(vertexColor.rgb, light.rgb * 0.5, vertexColor.a) + emissiveColor.rgb);
    colors[0].a = vertexColor.a;
  #endif

  #if BATCH_TYPE == 2
    // Transition between vertex color and light added to vertex color
    colors[0].rgb = saturate(mix(vertexColor.rgb, (light.rgb * 0.5) + vertexColor.rgb, vertexColor.a));
    colors[0].a = vertexColor.a;
  #endif

  #if BATCH_TYPE == 3
    // Multiply vertex color and light
    colors[0].rgb = saturate((vertexColor.rgb * light.rgb) + emissiveColor.rgb);
    colors[0].a = vertexColor.a;
  #endif

  colors[1] = vec4(0.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
