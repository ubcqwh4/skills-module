//all the requirements and files this code needs to load from
const regl = require('regl')()    								//regl library
const strVertex = require('./shaders/191018_vertexShader.js') 	//vertex shader
const strFrag = require('./shaders/191018_fragShader.js')		//fragment shader
const loadObj = require('./utils/loadObj.js')					//for loading c4d model
const glm = require('gl-matrix')				
var mat4=glm.mat4

console.log('hihi', strVertex)

//setting up camera angles 
var projectionMatrix = mat4.create()
var fov = 45*Math.PI/180
var aspect=window.innerWidth / window.innerHeight
mat4.perspective(projectionMatrix,fov,aspect,0.001, 1000)  		//the distance in which the camera will render the image 

var viewMatrix = mat4.create()
mat4.lookAt(viewMatrix, [0,0,10], [0,0,0], [0,1,0]) 			//the position of the camera 

var drawCube;
var drawCube2;
var drawCube3;

//assigning attributes to drawCube 
loadObj('./assets/webGL_model.obj',function(obj){
	console.log('Model Loaded',obj)

	//create the attributes
	var attributes = { 					
	aPosition: regl.buffer(obj.positions),  
	aUV: regl.buffer(obj.uvs), 
	}

	//create draw call
	drawCube = regl({						  			
	uniforms:{
		uTime: regl.prop('time'),
		uProjectionMatrix: projectionMatrix,
		uViewMatrix: regl.prop('view'),
		uTranslate:regl.prop('translate'),
		uColor:regl.prop('color')
	},
	attributes: attributes,
	frag: strFrag,
	vert: strVertex,
	count: obj.count
	})	
})

//assigning attributes to drawCube2 
loadObj('./assets/webGL_model_cube.obj',function(obj){
	console.log('Model Loaded',obj)

	//create the attributes
	var attributes = { 					
	aPosition: regl.buffer(obj.positions),  
	aUV: regl.buffer(obj.uvs), 
	}

	//create draw call
	drawCube2 = regl({						  			
	uniforms:{
		uTime: regl.prop('time'),
		uProjectionMatrix: projectionMatrix,
		uViewMatrix: regl.prop('view'),
		uTranslate:regl.prop('translate'),
		uColor:regl.prop('color')
	},
	attributes: attributes,
	frag: strFrag,
	vert: strVertex,
	count: obj.count
	})	
})

//assigning attributes to drawCube3 
loadObj('./assets/webGL_model_frame.obj',function(obj){
	console.log('Model Loaded',obj)

	//create the attributes
	var attributes = { 					
	aPosition: regl.buffer(obj.positions),  
	aUV: regl.buffer(obj.uvs), 
	}

	//create draw call
	drawCube3 = regl({						  			
	uniforms:{
		uTime: regl.prop('time'),
		uProjectionMatrix: projectionMatrix,
		uViewMatrix: regl.prop('view'),
		uTranslate:regl.prop('translate'),
		uColor:regl.prop('color')
	},
	attributes: attributes,
	frag: strFrag,
	vert: strVertex,
	count: obj.count
	})	
})

var currTime = 0;

var mouseX = 0;
var mouseY = 0;

window.addEventListener('mousemove',function(e){
	// console.log('Mouse move', e.clientX, e.clientY)

	var percentX=e.clientX / window.innerWidth // 0~1
	var percentY=e.clientY / window.innerHeight // 0~1

	percentX=percentX*2 - 1 // -1~1
	percentY=percentY*2 - 1 // -1~1

	var moveRange = 10
	mouseX = -percentX *moveRange
	mouseY = percentY *moveRange
	// console.log(percentX,percentY)
})
			
		
const clear = () => { 
	regl.clear({    
		color: [0.0, 0.0, 0.0, 0.2]  		//set the background color [r,g,b,transparency]
	})
}

function render (){         
	currTime+=0.01 					
	mat4.lookAt(viewMatrix, [mouseX,0,20], [0,0,0], [0,1,0])
	
	clear()

	//render the model from drawCube 
	if (drawCube !=undefined){
			var obj = {
			time:currTime,
			project: projectionMatrix,
			view:viewMatrix,
			//translate: [i*2-5*2,j*2-4*2,k*2-5*2]
			translate: [-5,-3.5,-4*2],
			color:[0.0,0.0,0.3]
			}
		drawCube(obj)
		}

	//render the model from drawCube2
	if (drawCube2 !=undefined){

			//create object for uniform 
			var obj = {
			time:currTime,
			project: projectionMatrix,
			view:viewMatrix,
			translate: [-5,-3.5,-4*2.15],
			color:[1.0,0.0,0.0]
			}
		drawCube2(obj)
		}

	//render the model from drawCube3	
	if (drawCube3 !=undefined){

			//create object for uniform 
			var obj = {
			time:currTime,
			project: projectionMatrix,
			view:viewMatrix,
			translate: [-5,(Math.sin(currTime*5))-3.5,-4*2.15],
			color:[0.0,0.0,0.0]
			}
		drawCube3(obj)
		}	

	window.requestAnimationFrame(render);   
}

render()