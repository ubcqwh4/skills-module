// this file is the front end and the main javascript for my code 

////////////////////////////IMPORT DEPENDENCIES AND LIBRARIES/////////////////////////////////////

var regl = require('regl')()                        // import regl library
var glm = require('gl-matrix')                      // import gl-matrix for matrix & vector math
var mat4 = glm.mat4                                 // create mat4 as a shortcut for glm.mat4  
var mat3 = glm.mat3                                 // create mat3 as a shortcut for glm.mat3
var vec3 = glm.vec3                                 // create vec3 as a shortcut for glm.vec3 
var loadObj = require('./utils/loadObj.js')         // import the loadObj tool to load 3d objects
var getAngle = require('./utils/getAngle.js')       // import the getAngle tool to calculate angle between the rings and the camera
const io = require('socket.io-client')              // import the socket.io library
const socket = io('http://192.168.0.3:9876')        // set up the socket connection with server ip

var cameraPos = [0, 0, -5]                          // declare and initialize camera position

// set up call back function for cameramove event
socket.on('cameramove', function (objReceived) {
  // o.view is the view matrix from the remote control, viewMatrix is local view matrix
  mat4.copy(viewMatrix, objReceived.view)           // copy objReceived.view (from server) to viewMatrix
  cameraPos = objReceived.cameraPos                 // cameraPos to use data received from server
})

////////////////////////////////IMPORT CODE FROM EXTERNAL FILES///////////////////////////////////

// import vertex and frag shaders for rings
var vertStr = require('./shaders/vertex.js')
var fragStr = require('./shaders/fragment.js')

// import vertex and frag shaders for text planes
var vertStrText = require('./shaders/vertex_text.js')
var fragStrText = require('./shaders/fragment_text.js')

// import position & size data
var positionOffsets = require('./positionOffsets')
// console.log(positionOffsets.positionsOffsetsYellow)
var circleSizes = require('./circleSize')
// console.log('circleSizes', circleSizes)

/////////////////////////////////SET PROJECTION AND VIEW MATRIX////////////////////////////////////

// create the projection matrix for field of view
var projectionMatrix = mat4.create()
var fov = 75 * Math.PI / 180
var aspect = window.innerWidth / window.innerHeight
var near = 0.01
var far = 1000
mat4.perspective(projectionMatrix, fov, aspect, near, far)

// create the view matrix to define where the camera is looking at
var viewMatrix = mat4.create()
var eye = [0, 1, 5] 
var center = [0, 0, 0]
var up = [0, 1, 0]
mat4.lookAt(viewMatrix, eye, center, up)

// create variable that cancels text perspective when camera rotates so text is always facing camera 
var inverseModelViewMatrix = mat3.create()

// clear the background
var clear = () => {
  regl.clear({
    color: [6.0 / 255.0, 24.0 / 255.0, 38.0 / 255.0, 1] // color of background is dark blue
  })
}

//*************THIS SECTION IS NOT USED ONCE REMOTE IS ADDED, KEPT FOR FUTURE REF****************//
//////////////////////////CREATE EVENT LISTENER TO GET MOUSE POSITION//////////////////////////////
/* 
// create a mapping function to map the mouse position to camera position
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

// create event listener for mousemove event in order to get mouse positions
window.addEventListener('mousemove', function (event) {
  var x = event.clientX // get the mouseX position from the event
  var y = event.clientY // get the mouseY position from the event

  // map mouseX positions from between 0 to window width to between -5 and 5
  mouseX = map(x, 0, window.innerWidth, -5, 5)
  // map mouseX positions from between 0 to window width to between -5 and 5
  mouseY = -map(y, 0, window.innerHeight, -5, 5)
})
*/

/////////////////////////////LOAD OBJ & CREATE UNIFORMS FOR EACH////////////////////////////////

// declare variables for draw calls
var drawRing
var drawTextPlane

// load the first 3d model: ring
loadObj('./assets/torus_xz.obj', function (obj) {
  console.log('Model Loaded', obj)

  // create attribute aPosition to use for vertex shader
  const attributes = {
    aPosition: regl.buffer(obj.positions)
  }

  // create the draw call and assign to drawRing so we can call drawRing in the render function
  drawRing = regl({
    // create uniforms for the object
    uniforms: {
      uTime: regl.prop('time'),                   // uTime is the uniform name for shader, regl.prop('time') means look for variable 'time' in drawRing inside the render function
      uProjectionMatrix: regl.prop('projection'), // for uniform uProjectionMatrix, look for variable 'projection' in drawRing inside the render function
      uViewMatrix: regl.prop('view'),             // for uniform uViewMatrix, look for variable 'view' in drawRing inside the render function
      uTranslate: regl.prop('translate'),         // for uniform uTranslate, look for variable 'translate' in drawRing inside the render function
      uTranslateStem: regl.prop('translateStem'), // for uniform uTranslateStem, look for variable 'translateStem' in drawRing inside the render function
      uSize: regl.prop('size'),                   // for uniform uSize, look for variable 'size' in drawRing inside the render function
      uRingColor: regl.prop('ringColor'),         // for uniform uRingColor, look for variable 'ringColor' in drawRing inside the render function
      uRingColorBlue: regl.prop('ringColorBlue')  // for uniform uRingColorBlue, look for variable 'ringColorBlue' in drawRing inside the render function
    },
    // assign which shaders and attributes to use
    vert: vertStr,
    frag: fragStr,
    attributes: attributes,
    count: obj.count
  })
})

// load the second 3d model: textPlane (to use as an object to apply text onto)
loadObj('./assets/text_plane.obj', function (obj) {
  console.log('Model Loaded', obj)

  // create attributes aPosition and aUV to use in vertex shader
  const attributes = {
    aPosition: regl.buffer(obj.positions),
    aUV: regl.buffer(obj.uvs)
  }

  // create the draw call and assign to var drawTextPlane so we can call drawTextPlane in the render function
  drawTextPlane = regl({
    // create uniforms for the object
    uniforms: {
      uTime: regl.prop('time'),                   // uTime is the uniform name for shader, regl.prop('time') means look for 'time' variable in drawTextPlane inside the render function 
      uProjectionMatrix: regl.prop('projection'), // for uniform uProjectionMatrix, look for variable 'projection' in drawTextPlane inside the render function
      uViewMatrix: regl.prop('view'),             // for uniform uViewMatrix, look for variable 'view' in drawTextPlane inside the render function
      uInvertViewMatrix: regl.prop('invert'),     // for uniform uInvertViewMatrix, look for variable 'invert' in drawTextPlane inside the render function
      uTranslate: regl.prop('translate'),         // for uniform uTranslate, look for variable 'translate' in drawTextPlane inside the render function
      uTranslateStem: regl.prop('translateStem'), // for uniform uTranslateStem, look for variable 'translateStem' in drawTextPlane inside the render function  
      uSize: regl.prop('size'),                   // for uniform uSize, look for variable 'size' in drawTextPlane inside the render function 
      uTexture: regl.prop('texture'),             // for uniform uTexture, look for variable 'texture' in drawTextPlane inside the render function 
      uYOffset: regl.prop('yOffset')              // for uniform uYOffset, look for variable 'yOffset' in drawTextPlane inside the render function  
    },
    // assign which shaders and attributes to use
    vert: vertStrText,
    frag: fragStrText,
    attributes: attributes,
    count: obj.count,
    // use blend function for the transparency of the textPlane
    blend: {
      enable: true,
      func: {
        srcRGB: 'src alpha',
        srcAlpha: 'src alpha',
        dstRGB: 'one minus src alpha',
        dstAlpha: 'one minus src alpha'
      }
    },
  })
})

////////////////////////////////LOAD TEXT AS TEXTURES ONTO TEXTPLANES////////////////////////////////////

// declare variables and assign false to start with
var texture
var imageBlueLoaded = false
var imageYellowLoaded = false
var imageRedLoaded = false
var imageGreenLoaded = false

// declare array for each cluster and use words to complete file names later
var imagesBlueToLoad = ['trump', 'minister', 'mayor', 'leader', 'celebrities', 'media', 'rating', 'university', 'hotel', 'district']
var imagesYellowToLoad = ['election', 'united', 'protests', 'headlines', 'sports']
var imagesRedToLoad = ['city', 'centre', 'ayodhya']
var imagesGreenToLoad = ['zealand', 'delhi', 'kansas', 'australia', 'wales', 'india', 'american', 'morales']

// declare arrays to push textures into
var texturesBlue = []
var texturesYellow = []
var texturesRed = []
var texturesGreen = []

// LOAD BLUE IMAGES
// go through each item in the imagesBlueToLoad array
for (var i = 0; i < imagesBlueToLoad.length; i++) {
  // declare each item in imagesBlueToLoad[] as a filename to use later
  var fileName = imagesBlueToLoad[i]

  // create a holder for each image
  var img = new Image()

  // load image into the image holder
  img.onload = function () {
    var texture = regl.texture(this)
    texturesBlue.push(texture)
    // all the images are loaded when texturesBlue array is the same length as imagesBlueToLoad array
    if (texturesBlue.length == imagesBlueToLoad.length) {
      imageBlueLoaded = true
      console.log('all blue images loaded')
    }
  }

  // set the source of the image and load the image onto GPU as texture
  img.src = './assets/mediaPortrait/blueFlower/' + fileName + '.png'
  console.log(i, './assets/mediaPortrait/blueFlower/' + fileName + '.png')
}

// LOAD YELLOW IMAGES
// same comments as LOAD BLUE IMAGES
for (var i = 0; i < imagesYellowToLoad.length; i++) {
  var fileName = imagesYellowToLoad[i]

  var img = new Image()

  img.onload = function () {
    // console.log('loaded', this.src)
    var texture = regl.texture(this)
    texturesYellow.push(texture)
    if (texturesYellow.length == imagesYellowToLoad.length) {
      imageYellowLoaded = true
      console.log('all yellow images loaded')
    }
  }

  img.src = './assets/mediaPortrait/yellowFlower/' + fileName + '.png'
}

// LOAD RED IMAGES
// same comments as LOAD BLUE IMAGES
for (var i = 0; i < imagesRedToLoad.length; i++) {
  var fileName = imagesRedToLoad[i]

  var img = new Image()

  img.onload = function () {
    // console.log('loaded', this.src)
    var texture = regl.texture(this)
    texturesRed.push(texture)
    if (texturesRed.length == imagesRedToLoad.length) {
      imageRedLoaded = true
      console.log('all red images loaded')
    }
  }

  img.src = './assets/mediaPortrait/redFlower/' + fileName + '.png'
}

// LOAD GREEN IMAGES
// same comments as LOAD BLUE IMAGES
for (var i = 0; i < imagesGreenToLoad.length; i++) {
  var fileName = imagesGreenToLoad[i]

  var img = new Image()

  img.onload = function () {
    // console.log('loaded', this.src)
    var texture = regl.texture(this)
    texturesGreen.push(texture)
    if (texturesGreen.length == imagesGreenToLoad.length) {
      imageGreenLoaded = true
      console.log('all green images loaded')
    }
  }

  img.src = './assets/mediaPortrait/greenFlower/' + fileName + '.png'
}

/////////////////////////RENDER RINGS AND TEXTPLANES////////////////////////////////

function render () {
  // clear the background
  clear()

  // declare and initialize some variables
  var currTime = 0
  var yOffset = 0
  
  // increase the time
  currTime += 0.01  

  // create variables for the angles between each cluster and camera position 
  var angleBlue = getAngle(positionOffsets.positionsOffsetsStem[0], cameraPos)
  var angleYellow = getAngle(positionOffsets.positionsOffsetsStem[1], cameraPos)
  var angleRed = getAngle(positionOffsets.positionsOffsetsStem[2], cameraPos)
  var angleGreen = getAngle(positionOffsets.positionsOffsetsStem[3], cameraPos)

  // for text always facing front no matter camera position
  mat3.fromMat4(inverseModelViewMatrix, viewMatrix)
  mat3.invert(inverseModelViewMatrix, inverseModelViewMatrix)

  // 3d models take time to load, check if all objects are loaded before calling them
  // use if statement to ensure render happens after all objects are loaded, only start drawing when models are loaded
  // if anything is undefined or false, return and keep waiting, don't render
  if (drawRing == undefined ||
    drawTextPlane == undefined ||
    imageYellowLoaded == false ||
    imageGreenLoaded == false ||
    imageRedLoaded == false ||
    imageBlueLoaded == false) {
    console.log('waiting for obj to load')
    window.requestAnimationFrame(render)
    return // return and keep waiting, don't render
  }

  // FOR LOOP FOR BLUE CLUSTER 
  for (var i = 0; i < 10; i++) {
    var circleSize = circleSizes.circleSizesBlue[i]                   // declare variable circleSize and assign size array for blue cluster
    var posOffset = positionOffsets.positionsOffsetsBlue[i]           // declare variable posOffset and assign position array for blue cluster
    var relativePosToStem = positionOffsets.positionsOffsetsStem[0]   // declare variable relativePosToStem and assign 1st item in positionsOffsetsStem[] as relative position to other clusters 
    var obj = {                           // create an object to hold all the variables for uniforms
      time: currTime,                     // create variable 'time' and assign 'currTime' to it
      view: viewMatrix,                   // create variable 'view' and assign 'viewMatrix' to it
      projection: projectionMatrix,       // create variable 'projection' and assign 'projectionMatrix' to it
      size: circleSize,                   // create variable 'size' and assign 'circleSize' to it, which goes through array 'circleSizes.circleSizesBlue[]'
      translate: posOffset,               // create variable 'translate' and assign 'posOffset' to it, which goes through array 'circleSizes.circleSizesBlue[]'
      translateStem: relativePosToStem,   // create variable 'translateStem' and assign 'relativePosToStem' to it, which uses 1st item in 'positionsOffsetsStem[]'
      ringColor: 1 - angleBlue / 180,     // create variable 'ringColor' and use angleBlue to determine brightness of ring color 
      ringColorBlue: 1 - angleBlue / 180  // create variable 'ringColorBlue' and use angleBlue to determine how much blue to add to ring 
    }
    drawRing(obj)                         // draw the ring and pass in the obj variable declared above

    var obj = {                           // create an object to hold all the variables for uniforms
      time: currTime,                     // create variable 'time' and assign 'currTime' to it
      view: viewMatrix,                   // create variable 'view' and assign 'viewMatrix' to it
      projection: projectionMatrix,       // create variable 'projection' and assign 'projectionMatrix' to it
      invert: inverseModelViewMatrix,     // create variable 'invert' and assign 'inverseModelViewMatrix' to it
      size: circleSize * 0.05,            // create variable 'size' and assign 'circleSize' to it, which goes through array 'circleSizes.circleSizesBlue[]', but make size small by 0.05x
      translate: posOffset,               // create variable 'translate' and assign 'posOffset' to it, which goes through array 'circleSizes.circleSizesBlue[]'
      translateStem: relativePosToStem,   // create variable 'translateStem'  and assign 'relativePosToStem' to it, which uses 1st item in 'positionsOffsetsStem[]'
      texture: texturesBlue[i],           // create variable 'texture' and assign array 'texturesBlue' to it
      yOffset: 1 - angleBlue / 180        // create variable 'yOffset' and use angleBlue to determine Y position of text
    }
    drawTextPlane(obj)                    // draw the text plane and pass in the obj variable declared above
  }

  // FOR LOOP FOR YELLOW CLUSTER
  // repeated comments as blue cluster
  for (var i = 0; i < 5; i++) {
    var circleSize = circleSizes.circleSizesYellow[i]                 // go through size array for yellow cluster
    var posOffset = positionOffsets.positionsOffsetsYellow[i]         // go through position array for yellow cluster
    var relativePosToStem = positionOffsets.positionsOffsetsStem[1]   // use 2nd item in positionsOffsetsStem[] as relative position to other clusters
    var obj = {
      time: currTime,
      view: viewMatrix,
      projection: projectionMatrix,
      size: circleSize,
      translate: posOffset,
      translateStem: relativePosToStem,
      ringColor: 1 - angleYellow / 180,
      ringColorBlue: 1 - angleBlue / 180
    }
    drawRing(obj)
    //console.log ('angleYellow', angleYellow)

    var obj = {
      time: currTime,
      view: viewMatrix,
      projection: projectionMatrix,
      invert: inverseModelViewMatrix,
      size: circleSize * 0.05,
      translate: posOffset,
      translateStem: relativePosToStem,
      texture: texturesYellow[i],
      yOffset: 1 - angleYellow / 180
    }
    drawTextPlane(obj)
  }

  // FOR LOOP FOR RED CLUSTER
  // repeated comments as blue cluster
  for (var i = 0; i < 3; i++) {
    var circleSize = circleSizes.circleSizesRed[i]                    // go through size array for red cluster
    var posOffset = positionOffsets.positionsOffsetsRed[i]            // go through position array for red cluster
    var relativePosToStem = positionOffsets.positionsOffsetsStem[2]   // use 3rd item in positionsOffsetsStem[] as relative position to other clusters
    var obj = {
      time: currTime,
      view: viewMatrix,
      projection: projectionMatrix,
      size: circleSize,
      translate: posOffset,
      translateStem: relativePosToStem,
      ringColor: 1 - angleRed / 180,
      ringColorBlue: 1 - angleBlue / 180
    }
    drawRing(obj)

    var obj = {
      time: currTime,
      view: viewMatrix,
      projection: projectionMatrix,
      invert: inverseModelViewMatrix,
      size: circleSize * 0.05,
      translate: posOffset,
      translateStem: relativePosToStem,
      texture: texturesRed[i],
      yOffset: 1 - angleRed / 180 
    }
    drawTextPlane(obj)
  }

  // FOR LOOP FOR GREEN CLUSTER
  // repeated comments as blue cluster
  for (var i = 0; i < 8; i++) {
    var circleSize = circleSizes.circleSizesGreen[i]                  // go through size array for green cluster
    var posOffset = positionOffsets.positionsOffsetsGreen[i]          // go through position array for green cluster
    var relativePosToStem = positionOffsets.positionsOffsetsStem[3]   // use 4th item in positionsOffsetsStem[] as relative position to other clusters
    var obj = {
      time: currTime,
      view: viewMatrix,
      projection: projectionMatrix,
      size: circleSize,
      translate: posOffset,
      translateStem: relativePosToStem,
      ringColor: 1 - angleGreen / 180,
      ringColorBlue: 1 - angleBlue / 180
    }
    drawRing(obj)

    var obj = {
      time: currTime,
      view: viewMatrix,
      projection: projectionMatrix,
      invert: inverseModelViewMatrix,
      size: circleSize * 0.05,
      translate: posOffset,
      translateStem: relativePosToStem,
      texture: texturesGreen[i],
      yOffset: 1 - angleGreen / 180
    }
    drawTextPlane(obj)
  }

 // NOT USING THIS SECTION ANYMORE BECAUSE VIEW MATRIX NEEDS TO BE RECALCULATED USING REMOTE CONTROL 
 // kept for future reference
    /*
    // declare and initialize values for mouseX and mouseX
    var mouseX = 0
    var mouseY = 0
    // use mouseX, mouseY for the position of camera
    var eye = [mouseX, mouseY, 7]
    var center = [0, 0, 0]
    var up = [0, 1, 0]
    // mat4.lookAt(viewMatrix, eye, center, up) 
    */  

  // loop the render function to update my animation
  window.requestAnimationFrame(render)
}

// call render function
render()
