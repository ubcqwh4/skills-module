// module.exports is the preserved word for exporting
// copy & paste the vertex shader from javascript file

module.exports = `
precision mediump float;

// setup attributes for position
attribute vec3 aPosition;

// setup the uniforms for projection / view matrix
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

// setup the uniforms 
uniform float uTime;
uniform float uSize;
uniform vec3 uTranslate;
uniform vec3 uTranslateStem;

// setup varying to pass normal to the fragment shader
varying vec3 vNormal;

void main() {
  vec3 pos = aPosition;

  // apply size to rings and make imported 3d model smaller
  pos = pos * uSize * 0.000003;

  // apply position to rings and make distance between them smaller 
  pos += uTranslate.xzy *0.02;

  // apply position to clusters of rings and make distance between the clusters smaller
  pos += uTranslateStem.xzy * 0.15;

  // 
  gl_Position = uProjectionMatrix * uViewMatrix * vec4(pos, 1.0);

  
  vNormal = normalize(aPosition);
}`