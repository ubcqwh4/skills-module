var regl = require('regl')()
var glm = require('gl-matrix')
var mat4 = glm.mat4

// import the shader from external files
// we are going to use different shader here because the 3D model doesn't have 'color' attributes
// we are going to use the 'uv' attribute instead
var vertStr = require('./shaders/vertex.js')
var fragStr = require('./shaders/fragment.js')

// import the loadObj tool
var loadObj = require('./utils/loadObj.js')

// create the projection matrix for field of view
var projectionMatrix = mat4.create()
var fov = 75 * Math.PI / 180
var aspect = window.innerWidth / window.innerHeight
var near = 0.01
var far = 1000
mat4.perspective(projectionMatrix, fov, aspect, near, far)

// create the view matrix for defining where the camera is looking at
var viewMatrix = mat4.create()
var eye = [0, 0, 5]
var center = [0, 0, 0]
var up = [0, 1, 0]
mat4.lookAt(viewMatrix, eye, center, up)

////////////////////////////////////////////////////////

//clear the background 
var clear = () => {
  regl.clear({
    color: [0, 0, 0, 0.7] // white
  })
}

var currTime = 0
var r = 0.5
var mouseX = 0
var mouseY = 0

// create mapping function to map the mouse position to camera position
function map (value, start, end, newStart, newEnd) {
  var percent = (value - start) / (end - start)
  if (percent < 0) {
    percent = 0
  }
  if (percent > 1) {
    percent = 1
  }
  var newValue = newStart + (newEnd - newStart) * percent
  return newValue
}

// create event listener for mouse move event in order to get mouse position

window.addEventListener('mousemove', function (event) {
  var x = event.clientX // get the mosue position from the event
  var y = event.clientY

  mouseX = map(x, 0, window.innerWidth, -5, 5)
  mouseY = -map(y, 0, window.innerHeight, -5, 5)
})


////////////////////////////////////////////////////////

// create a variable for draw call
var drawSphere

// instead of creating the attributes ourselves, now loading the 3d model instead
loadObj('./assets/sphere.obj', function (obj) {
  console.log('Model Loaded', obj)

  // create attributes
  const attributes = {
    aPosition: regl.buffer(obj.positions),
    aUV: regl.buffer(obj.uvs)
  }

  // create the draw call and assign to the drawCube variable that we created
  // so we can call the drawCube in the render function
  drawSphere = regl({
    uniforms: {
      uTime: regl.prop('time'),
      uProjectionMatrix: regl.prop('projection'),
      uViewMatrix: regl.prop('view'),
      uTranslate: regl.prop('translate'),
      uTranslateStem: regl.prop('translateStem'),
      uSize: regl.prop('size')
    },
    vert: vertStr,
    frag: fragStr,
    attributes: attributes,
    count: obj.count // don't forget to use obj.count as count
  })
})

function render () {
  currTime += 0.01

  // clear the background
  clear()

  // recalculate the view matrix because we are constantly moving the camera position now
  // use mouseX, mouseY for the position of camera
  var eye = [mouseX, mouseY, 5]
  var center = [0, 0, 0]
  var up = [0, 1, 0]
  mat4.lookAt(viewMatrix, eye, center, up)

  var circleSizes = [
    47,
    34,
    28,
    24,
    22,
    21,
    21,
    21
  ]

  var positionsOffsets = [
    [0, 0, 0],
    [30,-6, 0],
    [-30, 49, 0],
    [3, 0, 0],
    [4, 0, 0],
    [5, 0, 0],
    [6, 0, 0],
    [7, 0, 0],
  ]

  var positionsOffsetsStem = [
    [0, 0, 0],
    [30,-6, 0],
    [-30, 49, 0],
    [3, 0, 0],
    [4, 0, 0],
    [4, 0, 0]
  ]

  // 3d model takes time to load, therefore check if drawCube is exist first before calling it
  
  if (drawSphere !== undefined) {
    
    // for loop for multiple flowers ( j )
    for(var j=0; j<6; j++) {
      var relativePosToStem = positionsOffsetsStem[j]
      
      for(var i=0; i<8; i++) {
        var circleSize = circleSizes[i];      //loop through array for the size of circles
        var posOffset = positionsOffsets[i];  //loop through array for the position of circles
        var obj = {
          time: currTime,
          view: viewMatrix,
          projection: projectionMatrix,
          size: circleSize,
          translate: posOffset,
          translateStem: relativePosToStem
         }
         // draw the sphere and pass the obj in for uniform
         drawSphere(obj)
       }
    }

    /*
    for(var i=0; i<8; i++) {
      var circleSize = circleSizes[i];      //loop through array for the size of circles
      var posOffset = positionsOffsets[i];  //loop through array for the position of circles
      var obj = {                           // create an object for uniform
        time: currTime,
        view: viewMatrix,
        projection: projectionMatrix,
        size: circleSize,
        translate: posOffset
       }
       // draw the sphere, pass the obj in for uniforms
       drawSphere(obj)
     }
     */
  }

  // make it loop
  window.requestAnimationFrame(render)
}

render()
