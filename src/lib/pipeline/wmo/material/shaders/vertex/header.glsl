// THREE's built-in color attribute is a vec3, but Wowser needs RGBA.
attribute vec4 acolor;

uniform vec4 fogParams;
uniform vec4 fogColor;

uniform vec4 sunParams;
uniform vec4 sunDiffuseColor;
uniform vec4 sunAmbientColor;

uniform vec4 materialParams;
uniform vec4 emissiveColor;

varying vec2 coords[2];
varying vec4 colors[2];
varying vec4 fog;
