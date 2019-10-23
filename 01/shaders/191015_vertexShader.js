// use module.exports as syntax when exporting

module.exports = ` 			
	
	precision mediump float;      
	attribute vec3 aPosition;               
	attribute vec2 aUV;

	// setup uniforms for time, translate, projection and view matrix
  	uniform float uTime;
  	uniform mat4 uProjectionMatrix;
  	uniform mat4 uViewMatrix;
  	uniform vec3 uTranslate;
    
    // setup varying to pass uv to fragment shader      
	varying vec2 vUV;	

	//rotation of the model
	
	vec2 rotate(vec2 v, float a) {
		float s = sin(a);
		float c = cos(a);
		mat2 m = mat2(c, -s, s, c);
		return m * v;
	}

	
	void main() {  
    vec3 pos = aPosition;
    pos*=0.00005;	  //increase position
    pos+= uTranslate; //add translate to position

    //pos.xz = rotate(pos.xz, uTime * 1.8);

	gl_Position = uProjectionMatrix*uViewMatrix*vec4(pos, 1.0);            	
	vUV = aUV;
}
`