////all the requirements and files this code needs to load from
const regl = require('regl')()    									//import regl library
const strVertex = require('./shaders/191015_vertexShader.js')		//import vertex shader
const strFrag = require('./shaders/191015_fragShader.js')			//import fragment shader
const loadObj = require('./utils/loadObj.js')						//import loadObj tool
const getDrawCall = require('./191021_getDrawCall.js')						//import loadObj tool
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
mat4.lookAt(viewMatrix, eye, center, up) 				//the position of the camera 

///////////////////////////////////////////////

//declare variables drawCube calls
var allDrawCalls = [];
var drawFrame;
var drawFront;
var drawTop;
var drawRight;
var drawBack;
var drawSpheres;
var drawLoopLine;
var drawLeftPlane;
var drawSmallBall;

getDrawCall('./assets/01_modelParts/webGL_model_cubeFaceBack.obj', 'Back', function(drawCall) {
	//allDrawCalls.push(drawCall);
	drawBack = drawCall;
});

getDrawCall('./assets/01_modelParts/webGL_model_cubeFaceTop.obj', 'Top', function(drawCall) {
	//allDrawCalls.push(drawCall);
	drawTop = drawCall;
});

getDrawCall('./assets/01_modelParts/webGL_model_cubeFaceRight.obj', 'Right', function(drawCall) {
	//allDrawCalls.push(drawCall);
	drawRight = drawCall;
});

getDrawCall('./assets/01_modelParts/webGL_model_cubeFaceFront.obj', 'Front', function(drawCall) {
	//allDrawCalls.push(drawCall);
	drawFront = drawCall;
});

getDrawCall('./assets/webGL_model1.obj', 'whatever', function(drawCall) {
	allDrawCalls.push(drawCall);
}); 


getDrawCall('./assets/webGL_model_frame.obj', 'Frame', function(drawCall) {
	// allDrawCalls.push(drawCall);
	drawFrame = drawCall;
});

// getDrawCall('./assets/webGL_model_spheres.obj', 'SPheres', function(drawCall) {
// 	//allDrawCalls.push(drawCall);
// 	drawSpheres = drawCall;
// });

getDrawCall('./assets/webGL_model_loopLine.obj', 'LoopLine', function(drawCall) {
	//allDrawCalls.push(drawCall);
	drawLoopLine = drawCall;
});

getDrawCall('./assets/webGL_model_leftPlane.obj', 'LeftPlane', function(drawCall) {
	//allDrawCalls.push(drawCall);
	drawLeftPlane = drawCall;
});

getDrawCall('./assets/webGL_model_smallBall.obj', 'SmallBall', function(drawCall) {
	//allDrawCalls.push(drawCall);
	drawSmallBall = drawCall;
});


//declare variables 
var currTime = 0; // create a variable for time
var mouseX = 0;
var mouseY = 0;
var percent = 0;
var percent1 = 0;

// create event listener for mouse move event to get mouse position
window.addEventListener('mousemove',function(e){

	var percentX=e.clientX / window.innerWidth // 0~1
	var percentY=e.clientY / window.innerHeight // 0~1

	percentX=percentX*2 - 1 // -1~1
	percentY=percentY*2 - 1 // -1~1

	var moveRange =30
	mouseX = -percentX * moveRange
	//mouseY = percentY * moveRange

	// console.log(percentX,percentY)

	//percent = e.clientX / window.innerWidth
	percent = e.clientX / window.innerWidth
	
})

			
// create a clear function to clear the background		
const clear = () => { 
	regl.clear({    
		color: [200/255, 182/255, 169/255, 1.0]	//set the background color [r,g,b,transparency]
	})
}

function render (){     
	// console.log('percent', percent);    
	currTime+=0.01	//increase time						 					
	mat4.lookAt(viewMatrix, [0,0,15], [0,0,0], [0,1,0]) //use mouseX position for camera position
	
	clear()

	for(var i=0; i<allDrawCalls.length; i++) {
		var drawCall = allDrawCalls[i];
		var color = [0.0, 0.0, 0.0];
		var translate = [0,-3.5,-4*2];

		if(drawCall.ID == 'Front') {
			color = [1.0, 0.0, 0.0]
		} else if(drawCall.ID == 'Back') {
			color = [0.0, 0.0, 1.0]
		} else if(drawCall.ID == 'Top') {
			color = [1.0, 1.0, 0.0]
		} else if(drawCall.ID == 'Right') {
			color = [1.0, 1.0, 0.0]
		} else if(drawCall.ID == 'whatever') {
			color = [1.0, 1.0, 1.0]
		} else if(drawCall.ID == 'Frame') {
			color = [1.0, 1.0, 1.0];
		}

		var obj = {
			time:currTime,
			projection: projectionMatrix,
			view:viewMatrix,
			translate:translate,
			color:color
		}
		drawCall(obj)
	}

	if(drawFrame) {
		var num = 4;
		for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				//translate:[0,-3.5,-4*2+i*percent*6+Math.sin(currTime*6)],
				translate:[0,-3.5,-4*2+i*percent*6],
				color:[0.0, 0.0, 0.0]
				//color:[1, 0.5, Math.random()]
			}
			drawFrame(obj)
		}
	}

	if(drawFront) {
		var num = 4;
		for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				//translate:[-i*percent*2,-3.5,-4*2+i*percent], //(-2*i+Math.sin(currTime*8))],
				translate:[0-i*percent*4,-3.5,-4*2],
				color:[166/255, 5/255, 5/255]
			}
			drawFront(obj)
		}
	}

	if(drawTop) {
		var num = 4;
		for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[0,-3.5+i*percent*2,-4*2+i*percent], //(-2*i+Math.sin(currTime*8))],
				//translate:[percent*4,-3.5+ -i*percent,-4*2+i*percent],
				color:[2/255, 15/255, 89/255]
			}
			drawTop(obj)
		}
	}

	if(drawRight) {
		var num = 4;
		for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[i*percent*4.5, -3.5,-4*2],
				color:[229/255, 144/255, 11/255]
		}
			drawRight(obj)
		}
	}

	if(drawBack) {
		var num = 4;
		for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[i*percent*5, -3.5,-4*2],
				color:[7/255, 23/255, 115/255]
			}
			drawBack(obj)
		}
	}
	
	if(drawSpheres) {
		var num = 1;
		for(var i=0; i<num; i++) {
				var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[0,-3.5+i*percent,-4*2+i*percent*2],
				color:[229/255, 144/255, 11/255]
				}
			drawSpheres(obj)
		}
	}

	if(drawLoopLine) {
		var num = 4;
		for(var i=0; i<num; i++) {
				var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[0-i*percent*5,-3.5,-4*2],
				color:[2/255, 15/255, 89/255]
				}
			drawLoopLine(obj)
		}
	}

	if(drawLeftPlane) {
		var num = 4;
		for(var i=0; i<num; i++) {
				var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[-i*percent*5,-3.5,-4*2],
				color:[2/255, 15/255, 89/255]
				}
			drawLeftPlane(obj)
		}
	}

	if(drawSmallBall) {
		var num = 4;
		for(var i=0; i<num; i++) {
				var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[0-i*percent*4,-3.5,-4*2],
				color:[229/255, 144/255, 11/255]
				}
			drawSmallBall(obj)
		}
	}
	
	
	//loop 	
	window.requestAnimationFrame(render);   
}

render()