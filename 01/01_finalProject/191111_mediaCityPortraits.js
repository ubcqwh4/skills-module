////////////////////////IMPORT DEPENDENCIES AND LIRBARIES////////////////////////////////

var regl = require('regl')()                  //import the regl library
var glm = require('gl-matrix')                //import gl-matrix for matrix & vector math 
var mat4 = glm.mat4                           
var loadObj = require('./utils/loadObj.js')   //import the loadObj tool to load objects from c4d
const io = require('socket.io-client')        //import the socket.io to connect to server
const socket = io('http:// 172.20.10.3:9876')


socket.on('cameramove', function (objReceived) {
  console.log('camera move')
  // o.view is the view matrix from the remote control, viewMatrix is local view matrix
  mat4.copy(viewMatrix, objReceived.view)
  // gl-matrix.net
})


////////////////////////IMPORT CODE FROM EXTERNAL FILES////////////////////////////////

// import shaders for rings 
var vertStr = require('./shaders/vertex.js')
var fragStr = require('./shaders/fragment.js')

// import shaders for text planes  
var vertStrText = require('./shaders/vertex_text.js')
var fragStrText = require('./shaders/fragment_text.js')

// import position & size data 
var positionOffsets = require('./positionOffsets')
// console.log(positionOffsets.positionsOffsetsYellow)
var circleSizes = require('./circleSize')
//console.log('circleSizes', circleSizes)


////////////////////////SET PROJECTION AND VIEW MATRIX////////////////////////////////

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

////////////////////////?????????????????//////////////////////////////// 

// clear the background 
var clear = () => {
  regl.clear({
    color: [6.0/255.0, 24.0/255.0, 38.0/255.0, 1]  //dark blue
  })
}

// declare and initialize some variables
var currTime = 0
var mouseX = 0
var mouseY = 0
var yOffset = 0

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

// create event listener for mouse move event in order to get mouse positions
window.addEventListener('mousemove', function (event) {
  var x = event.clientX   //get the mouseX position from the event
  var y = event.clientY   //get the mouseY position from the event

  // map mouse positions to be between -5 and 5
  mouseX = map(x, 0, window.innerWidth, -5, 5)
  mouseY = -map(y, 0, window.innerHeight, -5, 5)
  
  // map Y position of text according to mouseX
  yOffset = map(x, 0, window.innerWidth, 0, 1.0)
})


////////////////////////LOAD OBJ & CREATE ATTRIBUTES FOR EACH//////////////////////////////// 

// declare variables for draw calls
var drawRing;
var drawTextPlane;

// load the first 3d model: ring
loadObj('./assets/torus_xz.obj', function (obj) {
  console.log('Model Loaded', obj)

    // create attributes 
    const attributes = {
      aPosition: regl.buffer(obj.positions),
      aUV: regl.buffer(obj.uvs)
    }

    // create the draw call and assign to var drawRing so we can call drawRing in the render function
    drawRing = regl({
      //create uniforms for the object
      uniforms: {
        uTime: regl.prop('time'),                     // uTime is the uniform name for shader, regl.prop('time') means look for 'time' variable in the object of draw call
        uProjectionMatrix: regl.prop('projection'),   // look for variable 'projection' in the object of draw call  
        uViewMatrix: regl.prop('view'),               // look for variable 'view' in the object of draw call  
        uTranslate: regl.prop('translate'),           // look for variable 'translate' in the object of draw call 
        uTranslateStem: regl.prop('translateStem'),   // look for variable 'translateStem' in the object of draw call  
        uSize: regl.prop('size')                      // look for variable 'size' in the object of draw call 
      },
      //assign which shaders and attributes to use 
      vert: vertStr,
      frag: fragStr,
      attributes: attributes,
      count: obj.count 
    })
})

// load the second 3d model: textPlane
loadObj('./assets/text_plane.obj', function (obj) {
  console.log('Model Loaded', obj)

      // create attributes
      const attributes = {
        aPosition: regl.buffer(obj.positions),
        aUV: regl.buffer(obj.uvs)
      }

      // create the draw call and assign to var drawTextPlane so we can call drawTextPlane in the render function
      drawTextPlane = regl({
        //create uniforms for the object
        uniforms: {
          uTime: regl.prop('time'),
          uProjectionMatrix: regl.prop('projection'),
          uViewMatrix: regl.prop('view'),
          uTranslate: regl.prop('translate'),
          uTranslateStem: regl.prop('translateStem'),
          uSize: regl.prop('size'),
          uTexture: regl.prop('texture'), 
          uYOffset: regl.prop('yOffset')
        },
        //assign which shaders and attributes to use 
        vert: vertStrText,
        frag: fragStrText,
        attributes: attributes,
        //use blend function for the transparency of the textPlane 
        blend: {
          enable: true,
          func: {
            srcRGB: 'src alpha',
            srcAlpha: 'src alpha',
            dstRGB: 'one minus src alpha',
            dstAlpha: 'one minus src alpha',
          },
        },
        count: obj.count
      })
})

////////////////////////LOAD TEXT AS TEXTURE ONTO TEXTPLANE//////////////////////////////// 

//declare variables and assign false to start with  
var texture;
var imageBlueLoaded = false;
var imageYellowLoaded = false;
var imageRedLoaded = false;
var imageGreenLoaded = false;

//declare array for each cluster and use words to complete file names later
var imagesBlueToLoad = ['trump','minister','mayor','leader','celebrities','media','rating','university','hotel','district']
var imagesYellowToLoad = ['election', 'united', 'protests','headlines','sports'];
var imagesRedToLoad = ['city','centre','ayodhya'];
var imagesGreenToLoad = ['zealand','delhi','kansas','australia','wales','india','american','morales'];

//declare array for 
var texturesBlue = [];
var texturesYellow = [];
var texturesRed = [];
var texturesGreen = [];

// LOAD BLUE IMAGES
// go through each item in the imagesBlueToLoad array
for(var i=0; i< imagesBlueToLoad.length; i++) {
  //declare each item in imagesBlueToLoad[] as a filename to use later  
  var fileName = imagesBlueToLoad[i];
  
  //create a holder for each image
  var img = new Image()   

  //load image into the image holder 
  img.onload = function () {
    var texture = regl.texture(this)
    texturesBlue.push(texture);
    // imageBlueLoaded is "true" when texturesBlue array is the same length as imagesBlueToLoad array 
    if(texturesBlue.length == imagesBlueToLoad.length) {
      imageBlueLoaded = true; 
      console.log('all blue images loaded')
    }
  }

  // set the source of the image and load the image onto GPU as texture
  img.src = './assets/mediaPortrait/blueFlower/' + fileName + '.png';
  console.log(i, './assets/mediaPortrait/blueFlower/' + fileName + '.png')
}


// LOAD YELLOW IMAGES
for(var i=0; i< imagesYellowToLoad.length; i++) {
  var fileName = imagesYellowToLoad[i];
  
  //create holder for the image
  var img = new Image()   

  img.onload = function () {
    // console.log('loaded', this.src)
    var texture = regl.texture(this)
    texturesYellow.push(texture);
    if(texturesYellow.length == imagesYellowToLoad.length) {
      imageYellowLoaded = true;
      console.log('all yellow images loaded')
    }
  }

  img.src = './assets/mediaPortrait/yellowFlower/' + fileName + '.png';
}


// LOAD RED IMAGES
for(var i=0; i< imagesRedToLoad.length; i++) {
  var fileName = imagesRedToLoad[i];
  
  var img = new Image()

  img.onload = function () {
    // console.log('loaded', this.src)
    var texture = regl.texture(this)
    texturesRed.push(texture);
    if(texturesRed.length == imagesRedToLoad.length) {
      imageRedLoaded = true;
      console.log('all red images loaded')
    }
  }

  img.src = './assets/mediaPortrait/redFlower/' + fileName + '.png';
}


// LOAD GREEN IMAGES
for(var i=0; i< imagesGreenToLoad.length; i++) {
  var fileName = imagesGreenToLoad[i];
  
  var img = new Image()  

  img.onload = function () {
    // console.log('loaded', this.src)
    var texture = regl.texture(this)
    texturesGreen.push(texture);
    if(texturesGreen.length == imagesGreenToLoad.length) {
      imageGreenLoaded = true;
      console.log('all green images loaded')
    }
  }

  img.src = './assets/mediaPortrait/greenFlower/' + fileName + '.png';
}

////////////////////////RENDER RINGS AND TEXTPLANES//////////////////////////////// 

function render () {

  // clear the background
  clear()

  // 3d models take time to load, check if all objects are loaded before calling them
  // use if statement to ensure render happens after all objects are loaded 
  // only start drawing when models are loaded 
  if(drawRing == undefined 
    || drawTextPlane == undefined 
    || imageBlueLoaded == false) {

    console.log('waiting for obj to load')
    window.requestAnimationFrame(render)
    return;
  }

  //increase the time 
  currTime += 0.01  

  // recalculate the view matrix using remote control instead because camera position is now constantly moving
  // use mouseX, mouseY for the position of camera
  var eye = [mouseX, mouseY, 7]
  var center = [0, 0, 0]
  var up = [0, 1, 0]
  mat4.lookAt(viewMatrix, eye, center, up)

   
      for(var i=0; i<10; i++) {
        var circleSize = circleSizes.circleSizesBlue[i];                  // for variable circleSize, go through size array for blue cluster 
        var posOffset = positionOffsets.positionsOffsetsBlue[i];          // for variable posOffset, go through position array for blue cluster
        var relativePosToStem = positionOffsets.positionsOffsetsStem[0];  // for variable relativePosToStem, use 1st item in positionsOffsetsStem[] as relative position to other clusters
        var obj = {                           // create an object for uniforms                                                   
          time: currTime,                     // create variable 'time' and assign 'currTime' to it 
          view: viewMatrix,                   // create variable 'view' and assign 'viewMatrix' to it
          projection: projectionMatrix,       // create variable 'projection' and assign 'projectionMatrix' to it
          size: circleSize,                   // create variable 'size' and assign 'circleSize' to it, which goes through array 'circleSizes.circleSizesBlue[]'
          translate: posOffset,               // create variable 'translate' and assign 'posOffset' to it, which goes through array 'circleSizes.circleSizesBlue[]'
          translateStem: relativePosToStem    // create variable 'translateStem'  and assign 'relativePosToStem' to it, which uses 1st item in 'positionsOffsetsStem[]'
        }
        drawRing(obj)   // draw the ring and pass obj in for uniforms 

        var obj = {                           // create an object for uniforms        
          time: currTime,                     // create variable 'time' and assign 'currTime' to it 
          view: viewMatrix,                   // create variable 'view' and assign 'viewMatrix' to it
          projection: projectionMatrix,       // create variable 'projection' and assign 'projectionMatrix' to it
          size: circleSize * 0.05,            // create variable 'size' and assign 'circleSize' to it, which goes through array 'circleSizes.circleSizesBlue[]', but make size small by 0.05x 
          translate: posOffset,               // create variable 'translate' and assign 'posOffset' to it, which goes through array 'circleSizes.circleSizesBlue[]'
          translateStem: relativePosToStem,   // create variable 'translateStem'  and assign 'relativePosToStem' to it, which uses 1st item in 'positionsOffsetsStem[]'  
          texture: texturesBlue[i],           // create variable 'texture' and assign array 'texturesBlue' to it
          yOffset: yOffset                    // create variable 'yOffset' and assign 'yOffset' to it
        } 
        drawTextPlane(obj)    // draw the text plane and pass obj in for uniforms
      }
  
      
      for(var i=0; i<5; i++) {
        var circleSize = circleSizes.circleSizesYellow[i];                //go through size array for yellow cluster 
        var posOffset = positionOffsets.positionsOffsetsYellow[i];        //go through position array for yellow cluster
        var relativePosToStem = positionOffsets.positionsOffsetsStem[1];  //use 2nd item in positionsOffsetsStem[] as relative position with other clusters
        var obj = {
          time: currTime,
          view: viewMatrix,
          projection: projectionMatrix,
          size: circleSize,
          translate: posOffset,
          translateStem: relativePosToStem
         }
         drawRing(obj)

        var obj = {
          time: currTime,
          view: viewMatrix,
          projection: projectionMatrix,
          size: circleSize * 0.05,
          translate: posOffset,
          translateStem: relativePosToStem,
          texture: texturesYellow[i],
          yOffset: yOffset
        }
         drawTextPlane(obj)
      }

          
      for(var i=0; i<3; i++) {
        var circleSize = circleSizes.circleSizesRed[i];                   //go through size array for red cluster      
        var posOffset = positionOffsets.positionsOffsetsRed[i];           //go through position array for red cluster
        var relativePosToStem = positionOffsets.positionsOffsetsStem[2];  //use 3rd item in positionsOffsetsStem[] as relative position with other clusters
        var obj = {
          time: currTime,
          view: viewMatrix,
          projection: projectionMatrix,
          size: circleSize,
          translate: posOffset,
          translateStem: relativePosToStem,
         }
         drawRing(obj)

        var obj = {
          time: currTime,
          view: viewMatrix,
          projection: projectionMatrix,
          size: circleSize * 0.05,
          translate: posOffset,
          translateStem: relativePosToStem,
          texture: texturesRed[i],
          yOffset: yOffset
         }
         drawTextPlane(obj)
      }  


      for(var i=0; i<8; i++) {
        var circleSize = circleSizes.circleSizesGreen[i];                 //go through size array for green cluster   
        var posOffset = positionOffsets.positionsOffsetsGreen[i];         //go through position array for green cluster
        var relativePosToStem = positionOffsets.positionsOffsetsStem[3];  //use 4th item in positionsOffsetsStem[] as relative position with other clusters
        var obj = {
          time: currTime,
          view: viewMatrix,
          projection: projectionMatrix,
          size: circleSize,
          translate: posOffset,
          translateStem: relativePosToStem,
        }
        drawRing(obj)

        var obj = {
          time: currTime,
          view: viewMatrix,
          projection: projectionMatrix,
          size: circleSize * 0.05,
          translate: posOffset,
          translateStem: relativePosToStem,
          texture: texturesGreen[i],
          yOffset: yOffset
        }
        drawTextPlane(obj)
      }

  // make it loop
  window.requestAnimationFrame(render)
}

render()
