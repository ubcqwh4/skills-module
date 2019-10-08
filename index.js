const regl = require('regl')()    	//required libraries to put existing code into this code 
const glm = require('gl-matrix')

var mat4=glm.mat4
var projectionMatrix = mat4.create()

var fov = 45*Math.PI/180
var aspect=window.innerWidth / window.innerHeight
mat4.perspective(projectionMatrix,fov,aspect,0.001, 1000)

var viewMatrix = mat4.create()
mat4.lookAt(viewMatrix, [0,0,5], [0,0,0], [0,1,0]);    

// console.log(projectionMatrix)

const r=0.2;

var currTime = 0;

var mouseX = 0;
var mouseY = 0;

window.addEventListener('mousemove',function(e){
	console.log('Mouse move', e.clientX, e.clientY)

	var percentX=e.clientX / window.innerWidth // 0~1
	var percentY=e.clientY / window.innerHeight // 0~1

	percentX=percentX*2 - 1 // -1~1
	percentY=percentY*2 - 1 // -1~1

	var moveRange = 2
	mouseX = -percentX *moveRange
	mouseY = percentY *moveRange

	console.log(percentX,percentY)
})


const points = [                   	//position of the 6 vertices to draw a square 
	[-r, r, 0],         
	[r, r, 0],
	[r,-r,0],

	[-r, r, 0],         
	[r, -r, 0],
	[-r, -r, 0],
]


const colors = [                   	//color of each vertex [red, green, blue] 
	[199/255, 130/255, 131/255],
	[243/255, 217/255, 220/255],
	[215/255, 190/255, 168/255],

	[199/255, 130/255, 131/255],
	[215/255, 190/255, 168/255],
	[180/255, 146/255, 134/255],
]

var uvs = [
	[0,0],
	[1,0],
	[1,1],

	[0,0],
	[1,1],
	[0,1],
]


///ATTRIBUTES
var attributes = { 					//to make a triangle you need attribute and vertexshader and frag shader 
	position: regl.buffer(points),  //make buffer for point position from regl and call it position
	aColor: regl.buffer(colors),    //make buffer for colors from regl and call it aColor
	aUV: regl.buffer(uvs), 
	}
	


///VERT SHADER
var vertexShader = ` 			//make vertexShader with medium precision using the attributes specified above
	precision mediump float;      	// vec3 means it has 3 vectors  
	attribute vec3 position;       
	attribute vec3 aColor;          
	attribute vec2 aUV;

	varying vec3 vColor;            //make a name 'vColor' to prepare to pass aColor to fragShader as vColor
	varying vec2 vUV;

	uniform float uTime;
	uniform mat4 uProjectionMatrix;
	uniform mat4 uViewMatrix;

	uniform vec3 uTranslate;

	void main() {  
		vec3 pos=position + uTranslate;				   //create a holder for position
		//add the time to the 'x' only 
		//pos.x +=uTime; 
		float movingRange = 0.3;
		// pos.x +=sin(uTime)*movingRange;
		// pos.y +=cos(uTime)*movingRange;
		gl_Position = uProjectionMatrix*uViewMatrix*vec4(pos, 1.0); //vec3 changed to vec4 because there's an added argument, 1.0 means scale 
  										   //using the position attribute that was specfied above
		vColor = aColor;             	   //passing aColor to fragShader as vColor
		vUV = aUV;
		}
	`


///FRAG SHADER		
var fragShader =`                	   	   //make fragmentShader with medium precision using the attributes specified above
	precision mediump float;

	varying vec3 vColor;                   //why vary vColor again when we are not passing it this time?
	varying vec2 vUV;

	void main(){
		vec2 center = vec2(0.5,0.5);
		float d = distance(vUV, center);  //0~0.5

		vec3 colorBg = vec3(1.0,1.0,1.0);
		vec3 colorDot = vec3(0.0,0.0,0.5);

		float gradient = smoothstep(0.49,0.45,d); 

		vec3 color = mix(colorDot,colorBg,gradient);
		gl_FragColor = vec4(color,1.0-gradient); //vec3 changed to vec4 because there's an added argument, 0.3 means transparency 
		}
		`	


///DRAW
const drawTriangle = regl(   			 //draw the triangle using the inbuilt function in regl, format is already fixed in the regl library
	{						  			 //compile all the attributes, frag shader, and vert shader to draw the triangle  	
	attributes: attributes,
	frag: fragShader,
	vert: vertexShader,
	uniforms:{
		uTime: regl.prop('time'),
		uProjectionMatrix: projectionMatrix,
		uViewMatrix: regl.prop('view'),
		uTranslate:regl.prop('translate')
	},
	
	depth:{
		enable:false,
	},

	blend: {
  		enable: true,
  		func: {
		    srcRGB: 'src alpha',
		    srcAlpha: 'src alpha',
		    dstRGB: 'one minus src alpha',
		    dstAlpha: 'one minus src alpha',
  			}
		},

	count: 6
	}
)
			
		
function clear () { 
	regl.clear({    
	color: [0.2, 0.4, 0.3, 0.5]  		//set the background color [r,g,b,transparency]
	})
}

function render (){         
	currTime+=0.01 						//time increase every frame	
	var cameraRadius=3.0
	// const cameraX = Math.sin(currTime)*cameraRadius
	// const cameraZ = Math.cos(currTime)*cameraRadius
	// console.log(cameraX)

	mat4.lookAt(viewMatrix, [0,0,5], [0,0,0], [0,1,0])
	
	clear() 							//clear the background 

	var num =6
	var start = -num/2 

	for (var i=0;i<num;i++){
		for (var j=0;j<num;j++){
			for (var m=0;m<num;m++){
		var obj = {
		time:currTime,
		view: viewMatrix,
		// translate: [start+i, (Math.sin(currTime*1.5)+start+j),0]
		translate: [j*(Math.sin(currTime*1.5))*0.4,i*(Math.sin(currTime*1.5))*0.4,(Math.cos(currTime*3))]
		}
		drawTriangle(obj) 		 
	    }}
				//draw the triangle 
	}
		
	window.requestAnimationFrame(render);   
}

render()    //draw the triangle 	