precision highp float;

attribute vec2 uvAlpha;

varying vec2 vUv;
varying vec2 vUvAlpha;

varying vec3 vertexNormal;
varying float cameraDistance;

void main() {
  vUv = uv;
  vUvAlpha = uvAlpha;

  // TODO: Potentially necessary for specular lighting
  vec3 vertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  cameraDistance = distance(cameraPosition, vertexWorldPosition);

  vertexNormal = vec3(normal);

  // TODO: Potentially unnecessary for ADT shading
  // vertexWorldNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);
}
