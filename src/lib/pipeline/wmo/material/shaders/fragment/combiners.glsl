vec4 combinersOpaque() {
  vec4 sampled0 = texture2D(textures[0], coords[0]);

  vec4 result;

  result.rgb = colors[0].rgb * sampled0.rgb * 2.0;
  result.a = colors[0].a;

  return result;
}

vec4 combinersDiffuse() {
  vec4 sampled0 = texture2D(textures[0], coords[0]);

  vec4 result;

  result.rgb = colors[0].rgb * sampled0.rgb * 2.0;
  result.a = colors[0].a * sampled0.a;

  return result;
}
