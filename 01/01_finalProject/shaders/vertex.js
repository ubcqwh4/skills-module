// module.exports is the preserved word for exporting
// copy & paste the vertex shader from javascript file
module.exports = `
precision mediump float;

// set up attributes for position
attribute vec3 aPosition;

// set up uniforms for projection / view matrix
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

// set up uniforms 
uniform float uTime;
uniform float uSize;
uniform vec3 uTranslate;
uniform vec3 uTranslateStem;

// set up varying to pass normal to fragment shader
varying vec3 vNormal;

void main() {
  vec3 pos = aPosition;

  // apply size to rings and make imported 3d model 0.000003 times smaller
  pos = pos * uSize * 0.000003;

  // apply position to rings and make distance between rings 0.02 times smaller
  // uTranslate.xzy inverts y and z positions to flatten perspective
  pos += uTranslate.xzy *0.02;

  // apply position to clusters of rings and make distance between clusters 0.15 times smaller
  // uTranslateStem.xzy inverts y and z positions to flatten perspective
  pos += uTranslateStem.xzy * 0.15;

  // 
  gl_Position = uProjectionMatrix * uViewMatrix * vec4(pos, 1.0);


  vNormal = normalize(aPosition);
}`