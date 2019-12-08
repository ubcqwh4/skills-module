// this fragment shader is for text planes 

// module.exports is the preserved word for exporting
// copy & paste the frag shader from javascript file
module.exports = `
precision mediump float;

// pass uv and normal into frag shader
varying vec2 vUV;
varying vec3 vNormal;

// set up uniform for texture
uniform sampler2D uTexture;

// set up uniform uYOffset and use it later for transparency of text
uniform float uYOffset;

void main() {
	vec2 uv = vUV;

	// flip texture vertically so the text is right side up 
	uv.y = 1.0 - uv.y;			

	// add texture to color 
	vec4 color = texture2D(uTexture, uv);
	
	// add smoothstep (min, max, input#) to control transparency of color 
	// color.alpha means transparency of color
	color.a *= smoothstep(0.0, 2.0, uYOffset);

	// don't render transparent part of texture so only the text part is visible 
	// if transparency is smaller than a very small number, don't render it
	if(color.a <= 0.01) {
		discard;			
	}

	// use this new color to calculate the final color
	gl_FragColor = color;
}`
