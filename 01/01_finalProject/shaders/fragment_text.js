// module.exports is the preserved word for exporting
// copy & paste the frag shader from javascript file

module.exports = `
precision mediump float;

varying vec2 vUV;
varying vec3 vNormal;

uniform sampler2D uTexture;
uniform float uYOffset;


float diffuse(vec3 N, vec3 L) {
	float d = dot(normalize(N), normalize(L));
	return max(d, 0.0);
}

#define LIGHT vec3(1.0, 1.0, 1.0)

void main() {
	vec2 uv = vUV;
	uv.y = 1.0 - uv.y;		// flip texture vertically	

	vec4 color = texture2D(uTexture, uv);
	color.a *= smoothstep(0.0, 2.0, uYOffset);

	if(color.a <= 0.01) {
		discard;			// stop rendering for transparent part
	}
	gl_FragColor = color;
}`
