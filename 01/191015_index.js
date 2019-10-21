////all the requirements and files this code needs to load from
const regl = require('regl')()    									//import regl library
const strVertex = require('./shaders/191015_vertexShader.js')		//import vertex shader
const strFrag = require('./shaders/191015_fragShader.js')			//import fragment shader
const loadObj = require('./utils/loadObj.js')						//import loadObj tool
const glm = require('gl-matrix') 									//import gl-matrix for the matrix & vector math
var mat4=glm.mat4


//setting up camera stuff
// create the projection matrix for field of view
var projectionMatrix = mat4.create()
var fov = 45*Math.PI/180
var aspect= window.innerWidth / window.innerHeight
var near= 0.001
var far= 1000
mat4.perspective(projectionMatrix,fov,aspect,near,far)			//the distance in which the camera will render the image 

// create the view matrix for defining where the camera is looking at
var viewMatrix = mat4.create()
var eye = [0, 0, 10]
var center = [0, 0, 0]
var up = [0, 1, 0]
mat4.lookAt(viewMatrix, eye, near, far) 				//the position of the camera 




///////////////////////////////////////////////

//declare variables drawCube calls 
var drawCube;
var drawCube2;
var drawCube3;
var drawSpheres;

//assigning attributes to drawCube 
//load c4d file: webGL_model1.obj
loadObj('./assets/webGL_model1.obj',function(obj){
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
//load c4d file: webGL_model_cube1.obj
loadObj('./assets/webGL_model_cube1.obj',function(obj){
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
//load c4d file: webGL_model_frame.obj
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

//assigning attributes to drawSphere
//load c4d file: webGL_model_spheres.obj
loadObj('./assets/webGL_model_spheres.obj',function(obj){
	console.log('Model Loaded',obj)

	//create the attributes
	var attributes = { 					
	aPosition: regl.buffer(obj.positions),  
	aUV: regl.buffer(obj.uvs), 
	}

	//create draw call
	drawSpheres = regl({						  			
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

/////////////////////////////////////////////////////


//declare variables 
var currTime = 0; // create a variable for time
var mouseX = 0;
var mouseY = 0;

// create event listener for mouse move event to get mouse position
window.addEventListener('mousemove',function(e){

	var percentX=e.clientX / window.innerWidth // 0~1
	var percentY=e.clientY / window.innerHeight // 0~1

	percentX=percentX*2 - 1 // -1~1
	percentY=percentY*2 - 1 // -1~1

	var moveRange =20
	mouseX = -percentX *moveRange
	//mouseY = percentY *moveRange

	// console.log(percentX,percentY)
})
			
// create a clear function to clear the background		
const clear = () => { 
	regl.clear({    
		color: [0.0, 0.0, 0.0, 0.2]	//set the background color [r,g,b,transparency]
	})
}

function render (){         
	currTime+=0.01	//increase time						 					
	mat4.lookAt(viewMatrix, [mouseX,0,10], [0,0,0], [0,1,0]) //use mouseX position for camera position
	
	clear()

	//if drawCube exists, then call the function
	if (drawCube !=undefined){
		//var num = 3
		
		//for (var i=0; i<num; i++){
			//for (var j=0; j<num; j++){
				//for (var k=0; k<num; k++){
					
			//create object for uniform 
			var obj = {
			time:currTime,
			project: projectionMatrix,
			view:viewMatrix,
			translate: [0,-3.5,-4*2],
			color:[0.0,0.0,0.3]
			}
		drawCube(obj)
		//}
		//}
	//}
	}

	if (drawCube2 !=undefined){

			//create object for uniform 
			var obj = {
			time:currTime,
			project: projectionMatrix,
			view:viewMatrix,
			translate: [0,-3.5,-4*2.3],
			color:[1.0,0.0,0.0]
			}
		drawCube2(obj)
		}

	if (drawCube3 !=undefined){

			//create object for uniform 
			var obj = {
			time:currTime,
			project: projectionMatrix,
			view:viewMatrix,
			translate: [0,(Math.sin(currTime*5))-3.5,-4*2.6],
			color:[0.0,0.0,0.0]
			}
		drawCube3(obj)
		}

	if (drawSpheres !=undefined){

			//create object for uniform 
			var obj = {
			time:currTime,
			project: projectionMatrix,
			view:viewMatrix,
			translate: [0,(Math.sin(currTime*6))-2.5,-4*2.3],
			color:[1.0,0.0,0.0]
			}
		drawSpheres(obj)
		}	
			
	//loop 	
	window.requestAnimationFrame(render);   
}

render()