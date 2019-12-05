// module.exports is the preserved word for exporting
// copy & paste the frag shader from javascript file

module.exports = `
precision mediump float;

// pass into frag shader
varying vec2 vUV;
varying vec3 vNormal;

// declare new uniform
uniform float uRingColor;

// set up diffuse lighting
float diffuse(vec3 N, vec3 L) {
	float d = dot(normalize(N), normalize(L));
	return max(d, 0.0);
}

#define LIGHT vec3(1.0, 1.0, 1.0)

void main() {
	// get diffused lighting
	float d = diffuse(vNormal, LIGHT); // 0 ~ 1
	d = d * 0.5 + 0.5; // 0.5 ~ 1

	
	vec3 uColor = vec3(219.0/255.0, 235.0/255.0, 192.0/255.0); //light green
	vec3 colorLighting = uColor * d + (uRingColor*0.4); //color lighting has color, diffusion, and changing transparency with uRingColor

	// 
	gl_FragColor = vec4(colorLighting, 1.0);
}`
