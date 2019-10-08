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

const r=0.5;

var currTime = 0;


const points = [                   	//position of the 6 vertices to draw a square 
[-r, r, 0],         
[r, r, 0],
[r,-r,0],

[-r, r, 0],         
[r, -r, 0],
[-r, -r, 0],
]


const colors = [                   	//color of each vertex [red, green, blue] 
[1, 0, 0],
[0, 1, 0],
[0, 0, 1],

[1, 0, 0],
[0, 0, 1],
[0, 0, 1],
]

var attributes = { 					//to make a triangle you need attribute and vertexshader and frag shader 
	position: regl.buffer(points),  //make buffer for point position from regl and call it position
	aColor: regl.buffer(colors),    //make buffer for colors from regl and call it aColor
	}
	
var vertexShader = ` 			//make vertexShader with medium precision using the attributes specified above
	precision mediump float;      	// vec3 means it has 3 vectors  
	attribute vec3 position;       
	attribute vec3 aColor;          

	varying vec3 vColor;            //make a name 'vColor' to prepare to pass aColor to fragShader as vColor
	
	uniform float uTime;
	uniform mat4 uProjectionMatrix;
	uniform mat4 uViewMatrix;

	void main() {  
		vec3 pos=position;				   //create a holder for position
		//add the time to the 'x' only 
		//pos.x +=uTime; 
		float movingRange = 0.5;
		pos.x +=sin(uTime)*movingRange;
		pos.y +=cos(uTime)*movingRange;
		gl_Position = uProjectionMatrix*uViewMatrix*vec4(pos, 1.0); //vec3 changed to vec4 because there's an added argument, 1.0 means scale 
  										   //using the position attribute that was specfied above
		vColor = aColor;             	   //passing aColor to fragShader as vColor
		}
	`
		
var fragShader =`                	   	   //make fragmentShader with medium precision using the attributes specified above
	precision mediump float;

	varying vec3 vColor;                   //why vary vColor again when we are not passing it this time?

	void main(){
		gl_FragColor = vec4(vColor, 0.3); //vec3 changed to vec4 because there's an added argument, 0.3 means transparency 
		}
		`	

const drawTriangle = regl(   			 //draw the triangle using the inbuilt function in regl, format is already fixed in the regl library
	{						  			 //compile all the attributes, frag shader, and vert shader to draw the triangle  	
	attributes: attributes,
	frag: fragShader,
	vert: vertexShader,
	uniforms:{
		uTime: regl.prop('time'),
		uProjectionMatrix: projectionMatrix,
		uViewMatrix: regl.prop('view'),

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
	const cameraX = Math.sin(currTime)*cameraRadius
	const cameraZ = Math.cos(currTime)*cameraRadius
	// console.log(cameraX)

	mat4.lookAt(viewMatrix, [cameraX,0,cameraZ], [0,0,0], [0,1,0])

	var obj = {
		time:currTime,
		view: viewMatrix
	}
	
	clear() 							//clear the background 
	drawTriangle(obj) 					//draw the triangle 	
		
	window.requestAnimationFrame(render);   
}

render()    //draw the triangle 	