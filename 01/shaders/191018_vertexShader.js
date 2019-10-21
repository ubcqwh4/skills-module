module.exports = ` 			
	
	precision mediump float;      
	attribute vec3 aPosition;               
	attribute vec2 aUV;

  	uniform float uTime;
  	uniform mat4 uProjectionMatrix;
  	uniform mat4 uViewMatrix;
  	uniform vec3 uTranslate;
          
	varying vec2 vUV;	


	vec2 rotate(vec2 v, float a) {
		float s = sin(a);
		float c = cos(a);
		mat2 m = mat2(c, -s, s, c);
		return m * v;
	}

	void main() {  
    vec3 pos = aPosition;
    pos*=0.00005;
    pos+= uTranslate;

    pos.xz = rotate(pos.xz, uTime*0.8);
    console.log('hihi')

		gl_Position = uProjectionMatrix*uViewMatrix*vec4(pos, 1.0);            	
		vUV = aUV;
		}
	`