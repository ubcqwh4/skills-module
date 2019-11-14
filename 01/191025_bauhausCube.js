////all the requirements and files this code needs to load from
const regl = require('regl')()    									
const strVertex = require('./shaders/191015_vertexShader.js')		
const strFrag = require('./shaders/191015_fragShader.js')			
const loadObj = require('./utils/loadObj.js')						
const getDrawCall = require('./191021_getDrawCall.js')						
const glm = require('gl-matrix') 									
var mat4=glm.mat4

//setting up camera stuff
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

//declare variables allDrawCalls calls
var allDrawCalls = [];
var drawMasterModel;
var drawFrame;
var drawNShapedPiece;
var drawPieceWithSquare;
var drawPieceWithSlit;
var drawPieceWithSlitCopy;
var drawDecor1;
var drawSphere;
var drawHelix;

// getDrawCall('./assets/bauhaus_2/masterModel.obj', 'masterModel', function(drawCall) {
// 	//allDrawCalls.push(drawCall);
// 	drawMasterModel = drawCall;
// });

getDrawCall('./assets/bauhaus_2/frame.obj', 'frame', function(drawCall) {
	//allDrawCalls.push(drawCall);
	drawFrame = drawCall;
});

getDrawCall('./assets/bauhaus_2/nShapedPiece.obj', 'nShapedPiece', function(drawCall) {
	drawNShapedPiece = drawCall;
});

getDrawCall('./assets/bauhaus_2/pieceWithSquare.obj', 'pieceWithSquare', function(drawCall) {
	drawPieceWithSquare = drawCall;
});

getDrawCall('./assets/bauhaus_2/pieceWithSlit.obj', 'pieceWithSlit', function(drawCall) {
	drawPieceWithSlit = drawCall;
});

getDrawCall('./assets/bauhaus_2/pieceWithSlitCopy.obj', 'pieceWithSlitCopy', function(drawCall) {
	drawPieceWithSlitCopy = drawCall;
});


getDrawCall('./assets/bauhaus_2/decor1.obj', 'decor1', function(drawCall) {
	drawDecor1 = drawCall;
});

getDrawCall('./assets/bauhaus_2/sphere.obj', 'sphere', function(drawCall) {
	drawSphere = drawCall;
});

getDrawCall('./assets/bauhaus_2/helix.obj', 'helix', function(drawCall) {
	drawHelix = drawCall;
});


//declare variables 
var currTime = 0; // create a variable for time
var mouseX = 0;
var mouseY = 0;
var percent = 0;
var boxIndex = 0;
var justGeneratedNew = false;

// create event listener for mouse move event to get mouse position
window.addEventListener('mousemove',function(e){
	var percentX=e.clientX / window.innerWidth // 0~1
	var percentY=e.clientY / window.innerHeight // 0~1

	percentX=percentX*2 - 1 // -1~1
	percentY=percentY*2 - 1 // -1~1

	var moveRange = 30
	// mouseX = -percentX * moveRange


	//percent = e.clientX / window.innerWidth

  	//mouseY = -map(y, 0, window.innerHeight, -25, 25)
})
			
// create a clear function to clear the background		
const clear = () => { 
	regl.clear({    
		color: [200/255, 182/255, 169/255, 1.0]	//set the background color [r,g,b,transparency]
	})
}

function render (){     
	// console.log('Percent', percent)

	console.log('Percent', percent)
	if(percent < 0.01) {

		if(justGeneratedNew) {
			console.log('just generated new index')
		} else {

			var oldIndex = boxIndex;
			boxIndex = Math.floor(Math.random() * 5) - 2

			console.log('new boxIndex', boxIndex);	
			justGeneratedNew = true;
		}
		
	} else {
		justGeneratedNew = false;
	}

	// console.log('justGeneratedNew', justGeneratedNew)

	percent = 0.5* Math.sin(currTime*4)+0.5;
	currTime+=0.01						 					
	mat4.lookAt(viewMatrix, [0,0,3], [0,0,0], [0,1,0]) //use mouseX position for camera position
	
	clear()

	for(var i=0; i<allDrawCalls.length; i++) {
		var drawCall = allDrawCalls[i];
		var translate = [3,-1,-4*2];

		// if(drawCall.ID == 'masterModel') {
		// 	color = [1.0, 1.0, 1.0]
		// } else if(drawCall.ID == 'face2') {
		// 	color = [0.0, 0.0, 1.0]
		// } else if(drawCall.ID == 'face2') {
		// 	color = [1.0, 1.0, 0.0]
		// } 

		var obj = {
			time:currTime,
			projection: projectionMatrix,
			view:viewMatrix,
			translate:translate,
			color:color
		}
		drawCall(obj)
	}

	if(drawMasterModel) {
		var num = 4;
		//for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[0,-1,-4*2],
				color:[1.0, 1.0, 1.0]
			}
			//drawMasterModel(obj)
		//}
	}

	if(drawFrame) {
		var num = 2;
		for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[0,-1,-4*2],
				color:[1.0, 1.0, 1.0]
			}
			drawFrame(obj)
		}
	}

	if(drawNShapedPiece) {
		var num = 3;
		for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[0+i*percent*2.5,-1,-4*2],
				color:[166/255, 5/255, 5/255]
			}
			drawNShapedPiece(obj)
		}
	}

	if(drawPieceWithSquare) {
		var num = 3;
		for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[0,-1,-4*2-i*percent*20],
				// color:[7/255, 23/255, 115/255]
				color:[229/255, 144/255, 11/255]
			}
			drawPieceWithSquare(obj)
		}
	}

	if(drawPieceWithSlit) {
		var num = 3;
		for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[0-i*percent*2.5,-1,-4*2],
				//color:[229/255, 144/255, 11/255]
				color:[7/255, 23/255, 115/255]
			}
			drawPieceWithSlit(obj)
		}
	}

	if(drawPieceWithSlitCopy) {
		var num = 3;
		for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[0-i*percent*3,-1,-4*2],
				//color:[229/255, 144/255, 11/255]
				color:[7/255, 23/255, 115/255]
			}
			//drawPieceWithSlitCopy(obj)
		}
	}

	if(drawDecor1) {
		var num = 2;
		//for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[0,-1,-4*2],
				color:[1.0, 1.0, 1.0]
			}
			drawDecor1(obj)
		//}
	}

	if(drawSphere) {
		var num = 1;
		// for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[boxIndex*percent*2.5,-1.4+Math.sin(currTime*5),-4*2],
				color:[1.0, 1.0, 1.0]
			}
			drawSphere(obj)
		// }
	}


	if(drawHelix) {
		var num = 1;
		//for(var i=0; i<num; i++) {
			var obj = {
				time:currTime,
				projection: projectionMatrix,
				view:viewMatrix,
				translate:[0,-1.5,-4*2],
				color:[1.0, 1.0, 1.0]
			}
			drawHelix(obj)
		//}
	}

	//loop 	
	window.requestAnimationFrame(render);   
}

render()