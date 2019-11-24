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
    color: [242.0/255.0, 223.0/255.0, 223.0/255.0, 1] // white
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
var drawSphere;
//var drawSphereYellow;
var drawStem1

// instead of creating the attributes ourselves, now loading the 3d model instead

loadObj('./assets/torus.obj', function (obj) {
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


loadObj('./assets/stem1.obj', function (obj) {
  console.log('Model Loaded', obj)

  // create attributes
  const attributes = {
    aPosition: regl.buffer(obj.positions),
    aUV: regl.buffer(obj.uvs)
  }

  // create the draw call and assign to the drawCube variable that we created
  // so we can call the drawCube in the render function
  drawStem1 = regl({
    uniforms: {
      uTime: regl.prop('time'),
      uProjectionMatrix: regl.prop('projection'),
      uViewMatrix: regl.prop('view'),
      uTranslate: regl.prop('translate'),
      uSize: regl.prop('size')
    },
    vert: vertStr,
    frag: fragStr,
    attributes: attributes,
    count: obj.count // don't forget to use obj.count as count
  })
})


/////////////////////////////////////////////////////////////////

function render () {
  currTime += 0.01

  // clear the background
  clear()

  // recalculate the view matrix because we are constantly moving the camera position now
  // use mouseX, mouseY for the position of camera
  var eye = [0, 5, 3]
  var center = [0, 0, 0]
  var up = [0, 1, 0]
  mat4.lookAt(viewMatrix, eye, center, up)

  //declare array for size of balls
  var circleSizesBlue = [
    34,
    24,
    22,
    12,
    12,
    10,
    7,
    5,
    5,
    5,
  ]

  var circleSizesYellow = [
    17,
    15,
    10,
    9,
    8,
    0,
    0,
    0,
    0,
    0,
  ]

  var circleSizesRed = [
    15,
    14,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ]

  var circleSizesGreen = [
    47,
    21,
    13,
    12,
    11,
    11,
    9,
    7,
    0,
    0,
  ]

  //declare array for position of balls relative to each other
  var positionsOffsetsBlue = [
    [0, 0, 80],
    [82,-48, 80],//9*Math.sin(currTime*20)],
    [152, 7,80],
    [66, 11, 80],
    [49,-9, 80],
    [92, 35, 80],
    [52, 22, 80],
    [74,-19, 80],
    [20,-26, 80],
    [27,-37, 80],
  ]

  var positionsOffsetsYellow = [
    [0, 0, 100],
    [-58,-26, 100],
    [6, -17, 100],
    [-70, -44, 100],
    [-50, -46, 100],
  ]

  var positionsOffsetsRed = [
    [0, 0, 0],
    [21,41, 0],
    [13, 20, 0],
  ]

  var positionsOffsetsGreen = [
    [0, 0, -50],
    [6,-54, -50],
    [-34, -46, -50],
    [-118,4,-50],
    [123,18,-50],
    [-67,-97,-50],
    [3,53,-50],
    [53,107,-50],
  ]


  //declare array for position of groups of balls/flowers relative to each other
  var positionsOffsetsStem = [
    [-20, -10, 0],//3*Math.sin(currTime*10)],
    [-15, 20, 0],
    [0, 0, 0],
    [20, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]


  // 3d model takes time to load, therefore check if drawCube is exist first before calling it
  if (drawSphere !== undefined) {
    
    // for loop for multiple flowers ( j )
    //for(var j=0; j<6; j++) {
      var relativePosToStem = positionsOffsetsStem[0]   //loop through array for the relative position of flowers to each other
      
      for(var i=0; i<10; i++) {
        var circleSize = circleSizesBlue[i];      //loop through array for the size of circles
        var posOffset = positionsOffsetsBlue[i];  //loop through array for the position of circles
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
   // }
  }
 
  if (drawSphere !== undefined) {
    
    //for loop for multiple flowers ( j )
    //for(var j=0; j<6; j++) {
      //var relativePosToStem = positionsOffsetsStem[1]   //loop through array for the relative position of flowers to each other
      
      for(var i=0; i<5; i++) {
        var circleSize = circleSizesYellow[i];      //loop through array for the size of circles
        var posOffset = positionsOffsetsYellow[i];  //loop through array for the position of circles
        var relativePosToStem = positionsOffsetsStem[1];
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
    //}
    }
  }

  if (drawSphere !== undefined) {
          
      for(var i=0; i<3; i++) {
        var circleSize = circleSizesRed[i];      //loop through array for the size of circles
        var posOffset = positionsOffsetsRed[i];  //loop through array for the position of circles
        var relativePosToStem = positionsOffsetsStem[2];
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
       //}
    }
  }

  if (drawSphere !== undefined) {      
      for(var i=0; i<8; i++) {
        var circleSize = circleSizesGreen[i];      //loop through array for the size of circles
        var posOffset = positionsOffsetsGreen[i];  //loop through array for the position of circles
        var relativePosToStem = positionsOffsetsStem[3];
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
    //}
  }
}
  
  if (drawStem1 !== undefined) {     
        var obj = {
          time: currTime,
          view: viewMatrix,
          projection: projectionMatrix,
          size: 0.01,
          translate: [0.0,0.0,0.0]
         }
         // draw the sphere and pass the obj in for uniform
         //drawStem1(obj)
       }
    

  // make it loop
  window.requestAnimationFrame(render)
}

render()
