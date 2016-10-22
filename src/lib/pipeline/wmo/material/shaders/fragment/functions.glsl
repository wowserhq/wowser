vec4 finalizeResult(in vec4 result) {
  // Fog
  result.rgb = mix(result.rgb, fog.rgb, fog.a * materialParams.z);

  // Opacity
  result.a *= materialParams.w;

  return result;
}
