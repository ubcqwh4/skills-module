// module.exports is the preserved word for exporting
// copy & paste the vertex shader from javascript file

module.exports = `
precision mediump float;
attribute vec3 aPosition;
attribute vec2 aUV;

// setup the uniforms for projection / view matrix
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

// setup the uniform for time
uniform float uTime;
uniform float uSize;

// setup the uniform for translate
uniform vec3 uTranslate;
uniform vec3 uTranslateStem;

// setup varying to pass the uv to the fragment
varying vec2 vUV;
varying vec3 vNormal;

void main() {
  vec3 pos = aPosition;

  // apply size to sphere
  pos = pos * uSize * 0.008;


  // add the translate to the position
  pos += uTranslate*0.015;


  pos += uTranslateStem * 0.12;

  gl_Position = uProjectionMatrix * uViewMatrix * vec4(pos, 1.0);

  vUV = aUV;

  vNormal = normalize(aPosition);
}`