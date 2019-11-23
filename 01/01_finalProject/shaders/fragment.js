// module.exports is the preserved word for exporting
// copy & paste the frag shader from javascript file

module.exports = `
precision mediump float;

varying vec2 vUV;
varying vec3 vNormal;

// uniform vec3 uColor;

float diffuse(vec3 N, vec3 L) {
	float d = dot(normalize(N), normalize(L));
	return max(d, 0.0);
}

#define LIGHT vec3(1.0, 1.0, 1.0)

void main() {

	// get diffused lighting
	float d = diffuse(vNormal, LIGHT); // 0 ~ 1
	d = d * 0.5 + 0.5; // 0.5 ~ 1


	vec3 uColor = vec3(143.0/255.0, 164.0/255.0, 191.0/255.0);
	vec3 colorLighting = uColor * d;

	gl_FragColor = vec4(colorLighting, 1.0);
	// gl_FragColor = vec4(vUV, 0.0, 0.8);
}`


// uniform vec3 uTranslate;

// void main() {
//   // the position of our square goes from -10 ~ 10
//   // now map it to 0 ~ 1
//   float r = map(uTranslate.x, -10.0, 10.0, 0.0, 1.0);
//   float g = map(uTranslate.y, -10.0, 10.0, 0.0, 1.0);
//   float b = map(uTranslate.z, -10.0, 10.0, 0.0, 1.0);

//   gl_FragColor = vec4(r, g, b, 1.0);
// }`
