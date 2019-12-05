// module.exports is the preserved word for exporting
// copy & paste the vertex shader from javascript file
module.exports = `
precision mediump float;

// set up attributes for position and UV
attribute vec3 aPosition;
attribute vec2 aUV;

// set up the uniforms for projection / view matrix
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

// set up the uniform inverting view matrix so that text is always facing the camera no matter the rotation 
uniform mat3 uInvertViewMatrix;

// set up the uniform for time and size
uniform float uTime;
uniform float uSize;

// set up the uniform for moving positions  
uniform vec3 uTranslate;
uniform vec3 uTranslateStem;
uniform float uYOffset; 

// set up varying to pass uv to fragment shader
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
