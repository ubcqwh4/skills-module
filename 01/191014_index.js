const regl = require('regl')()    	//required libraries to put existing code into this code 
const glm = require('gl-matrix')

const strVertex = require('./shaders/vertexShader.js')
const strFrag = require('./shaders/fragShader.js')

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

	var moveRange = 10
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
	

///DRAW
const drawTriangle = regl(   			 //draw the triangle using the inbuilt function in regl, format is already fixed in the regl library
	{						  			 //compile all the attributes, frag shader, and vert shader to draw the triangle  	
	attributes: attributes,
	frag: strFrag,
	vert: strVertex,
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

	mat4.lookAt(viewMatrix, [mouseX,mouseY,5], [0,0,0], [0,1,0])
	
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
		translate: [i-2,j-1,m-4]
		}
		drawTriangle(obj) 		 
	    }}
				//draw the triangle 
	}
		
	window.requestAnimationFrame(render);   
}

render()    //draw the triangle 	