// this fragment shader is for rings 

// module.exports is the preserved word for exporting
// copy & paste the frag shader from javascript file
module.exports = `
precision mediump float;

// pass uv and normal into frag shader
varying vec2 vUV;
varying vec3 vNormal;

// declare new uniform for changing ring brightness and color when it's in front of camera
uniform float uRingColor;
uniform float uRingColorBlue;

// set up diffuse lighting
float diffuse(vec3 N, vec3 L) {
	float d = dot(normalize(N), normalize(L));
	return max(d, 0.0);
}

#define LIGHT vec3(1.0, 1.0, 1.0)

void main() {
	// get diffused lighting, range is from 0 to 1, which is creates harsh shadows
	float d = diffuse(vNormal, LIGHT); 
	// make range go from 0.5 to 1 to make shadows softer
	d = d * 0.5 + 0.5; 

	// create color to add to light
	vec3 uColor = vec3(243.0/255.0, 167.0/255.0, 51.0/255.0); // yellow

	// create blueish color to add to rings 
	vec3 uRingColorBlue = vec3(0.0/255.0, 63.0/255.0, 145.0/255.0); // light blue

	// color lighting has color, diffusion, changing transparency with uRingColor
	// add blueish color to rings when camera faces that ring cluster 
	vec3 colorLighting = uColor * d + (uRingColor+0.1) * uRingColorBlue;  

	// use this new color to calculate the final color  
	gl_FragColor = vec4(colorLighting, 1.0);
}`
