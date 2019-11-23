//all the requirements and files this code needs to load from
const regl = require('regl')()    																
const glm = require('gl-matrix') 									
const io = require('socket.io-client')
const loadObj = require('./utils/loadObj.js')	
var mat4=glm.mat4

//setting up camera stuff
var projectionMatrix = mat4.create()
var fov = 75 * Math.PI / 180
var aspect= window.innerWidth / window.innerHeight
var near= 0.001
var far= 1000.0
mat4.perspective(projectionMatrix,fov,aspect,near,far)			//the distance in which the camera will render the image 

// create the view matrix for defining where the camera is looking at
var viewMatrix = mat4.create()
var eye = [0, 0, 10]
var center = [0, 0, 0]
var up = [0, 1, 0]
mat4.lookAt(viewMatrix, eye, center, up)

///////////////////////////////////////////////

//assigning attributes to drawCube 
//load c4d file: webGL_model1.obj
loadObj('./assets/02_cityPortrait/sphere.obj',function(obj){
	console.log('Model Loaded',obj)

	//create the attributes
	var attributes = { 					
	aPosition: regl.buffer(obj.positions),  
	aUV: regl.buffer(obj.uvs), 
	}

	//create draw call
	drawSphere = regl({						  			
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

////////////////////////////////////////////////

var currTime = 0
var mouseX = 0
var mouseY = 0 				

const clear = () => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
}

var strFrag = `
precision mediump float;
varying vec3 vColor;
varying vec2 vUV;
uniform vec3 uTranslate;

void main() {
  
  gl_FragColor = vec4(1.0);
}`

var vertStr = `
precision mediump float;
attribute vec3 aPosition;
attribute vec3 color;
attribute vec2 aUV;

uniform float uTime;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

uniform vec3 uTranslate;

varying vec3 vColor;
varying vec2 vUV;

void main() {
  // create holder for position
  vec3 pos = aPosition + uTranslate;

  gl_Position = uProjectionMatrix * uViewMatrix * vec4(pos, 1.0);
  vColor = color;
  vUV = aUV;
}`

var r = 0.8
var positions = [
  [-r, r, 0.0],
  [r, r, 0.0],
  [r, -r, 0.0],

  [-r, r, 0.0],
  [r, -r, 0.0],
  [-r, -r, 0.0]
]

var colors = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],

  [1, 0, 0],
  [0, 0, 1],
  [1, 1, 0]
]

var uvs = [
  [0, 0],
  [1, 0],
  [1, 1],

  [0, 0],
  [1, 1],
  [0, 1]
]

var circleSize = [
	67, 43, 33, 27, 22, 20, 19, 17
]

var positionsOffsets = [
	[0, 0, 0],
	[42, 26, 0],
]

const attributes = {
  aPosition: regl.buffer(positions),
  color: regl.buffer(colors),
  aUV: regl.buffer(uvs)
}

const drawTriangle = regl({
  uniforms: {
    uTime: regl.prop('time'),
    uProjectionMatrix: projectionMatrix,
    uViewMatrix: regl.prop('view'),
    uTranslate: regl.prop('translate')
  },
  frag: fragStr,
  vert: vertStr,
  attributes: attributes,

  depth: {
    enable: false
  },

  blend: {
    enable: true,
    func: {
      srcRGB: 'src alpha',
      srcAlpha: 'src alpha',
      dstRGB: 'one minus src alpha',
      dstAlpha: 'one minus src alpha'
    }
  },
  count: 6
})

let trace = true

function render () {
  currTime += 0.01
  mat4.lookAt(viewMatrix, [mouseX, mouseY, 10], [0, 0, 0], [0, 1, 0])

  // console.log('Time :', obj)
  clear()

  var num = 10
  var start = -num / 2

  /*

	
	for(var i=0; i<8; i++) {
		var circleSize = circleSizes[i];
		var posOffset = positionsOffsets[i];

		var obj = {
		  time: currTime,
		  view: viewMatrix,
		  size: circleSize,
		  translate: posOffset
		}

		drawTriangle(obj)
	}

	// vert shader 

	vec3 pos = aPosition * uSize * 0.01;
	pos += uTranslate * 0.01;

  */

  for (var i = 0; i < num; i++) {
    for (var j = 0; j < num; j++) {
      var obj = {
        time: currTime,
        view: viewMatrix,
        translate: [start + i, start + j, 0]
      }

      if (trace) {
        console.log(obj.translate[0], obj.translate[1])
      }

      drawTriangle(obj)
    }
  }
  trace = false
  window.requestAnimationFrame(render)
}

render()