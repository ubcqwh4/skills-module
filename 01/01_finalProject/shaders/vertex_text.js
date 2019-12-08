// this vertex shader is for text planes  

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

// set up the uniform inverting view matrix so that text is always facing the camera no matter the position 
uniform mat3 uInvertViewMatrix;

// set up the uniform for time and size
uniform float uTime;
uniform float uSize;

// set up the uniform for moving positions  
uniform vec3 uTranslate;
uniform vec3 uTranslateStem;
uniform float uYOffset; 

// set up varying to pass uv and normal to fragment shader
varying vec2 vUV;
varying vec3 vNormal;

void main() {
  // apply uInvertViewMatrix to position attribute 
  vec3 pos = uInvertViewMatrix * aPosition;

  // apply size to rings and make imported 3d model 0.00003 times smaller
  pos = pos * uSize * 0.00003;

  // apply position to textplanes and make distance between textplanes 0.02 times smaller
  // uTranslate.xzy inverts y and z positions to flatten perspective
  pos += uTranslate.xzy *0.02;
  // add uYOffset to the y position of text planes
  pos.y += uYOffset;

  // apply position to clusters of textplanes and make distance between textplanes 0.15 times smaller
  // uTranslateStem.xzy inverts y and z positions to flatten perspective
  pos += uTranslateStem.xzy * 0.15;

  // use this new position to calculate the final position  
  gl_Position = uProjectionMatrix * uViewMatrix * vec4(pos, 1.0);

  // pass uv and normal to fragment shader
  vUV = aUV;
  vNormal = normalize(aPosition);
}`
