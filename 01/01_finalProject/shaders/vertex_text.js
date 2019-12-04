// module.exports is the preserved word for exporting
// copy & paste the vertex shader from javascript file

module.exports = `
precision mediump float;
attribute vec3 aPosition;
attribute vec2 aUV;

// setup the uniforms for projection / view matrix
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat3 uInvertViewMatrix;

// setup the uniform for time
uniform float uTime;
uniform float uSize;

// setup the uniform for moving positions  
uniform vec3 uTranslate;
uniform vec3 uTranslateStem;
uniform float uYOffset;

// setup varying to pass uv to fragment shader
varying vec2 vUV;
varying vec3 vNormal;

void main() {
  // 
  vec3 pos = uInvertViewMatrix * aPosition;

  // apply size to sphere to make imported 3d model smaller
  pos = pos * uSize * 0.00003;

  // add translate to the position of text plane to
  pos += uTranslate.xzy *0.02;
  pos.y += uYOffset;

  // add the uTranslateStem to the position to change the relative position of 
  pos += uTranslateStem.xzy * 0.15;

  gl_Position = uProjectionMatrix * uViewMatrix * vec4(pos, 1.0);

  vUV = aUV;

  vNormal = normalize(aPosition);
}`
