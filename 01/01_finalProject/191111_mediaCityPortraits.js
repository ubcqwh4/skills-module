var regl = require('regl')()
var glm = require('gl-matrix')
var mat4 = glm.mat4
var loadObj = require('./utils/loadObj.js')   // import the loadObj tool
const io = require('socket.io-client')
const socket = io('http://192.168.182.10:9876')

socket.on('cameramove', function (objReceived) {
  console.log('camera move')
  // o.view is the view matrix from the remote control
  // viewMatrix is our local view matrix

  // console.log('obj received :', objReceived.viewMatrix, objReceived.view)
  mat4.copy(viewMatrix, objReceived.view)
  // gl-matrix.net
})


// import the shader from external files
// we are going to use different shader here because the 3D model doesn't have 'color' attributes
// we are going to use the 'uv' attribute instead
var vertStr = require('./shaders/vertex.js')
var fragStr = require('./shaders/fragment.js')
var vertStrText = require('./shaders/vertex_text.js')
var fragStrText = require('./shaders/fragment_text.js')

// position & size data
var positionOffsets = require('./positionOffsets')
// console.log(positionOffsets.positionsOffsetsYellow)
var circleSizes = require('./circleSize')
console.log('circleSizes', circleSizes)


/////////////////////////////////////////////////////////

// create the projection matrix for field of view
var projectionMatrix = mat4.create()
var fov = 75 * Math.PI / 180
var aspect = window.innerWidth / window.innerHeight
var near = 0.01
var far = 1000
mat4.perspective(projectionMatrix, fov, aspect, near, far)

// create the view matrix for defining where the camera is looking at
var viewMatrix = mat4.create()
var eye = [0, 1, 5]
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
var yOffset = 0

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

  yOffset = map(x, 0, window.innerWidth, 0, 1)
})


////////////////////////////////////////////////////////

// create a variable for draw call
var drawSphere;
var drawTextPlane;

// instead of creating the attributes ourselves, now loading the 3d model instead
loadObj('./assets/torus_xz.obj', function (obj) {
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


loadObj('./assets/text_plane.obj', function (obj) {
  console.log('Model Loaded', obj)

  // create attributes
  const attributes = {
    aPosition: regl.buffer(obj.positions),
    aUV: regl.buffer(obj.uvs)
  }

  // create the draw call and assign to the drawCube variable that we created
  // so we can call the drawCube in the render function
  drawTextPlane = regl({
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
    vert: vertStrText,
    frag: fragStrText,
    attributes: attributes,
    blend: {
      enable: true,
      func: {
        srcRGB: 'src alpha',
        srcAlpha: 'src alpha',
        dstRGB: 'one minus src alpha',
        dstAlpha: 'one minus src alpha',
      },
    },
    count: obj.count // don't forget to use obj.count as count
  })
})

var texture;
var imageLoaded = false;
var imageBlueLoaded = false;
var imageYellowLoaded = false;
var imageRedLoaded = false;
var imageGreenLoaded = false;

var imagesBlueToLoad = ['trump','minister','mayor','leader','celebrities','media','rating','university','hotel','district']
var imagesYellowToLoad = ['election', 'united', 'protests','headlines','sports'];
var imagesRedToLoad = ['city','centre','ayodhya'];
var imagesGreenToLoad = ['zealand','delhi','kansas','australia','wales','india','american','morales'];

var texturesBlue = [];
var texturesYellow = [];
var texturesRed = [];
var texturesGreen = [];


// LOAD BLUE IMAGES
for(var i=0; i< imagesBlueToLoad.length; i++) {
  var fileName = imagesBlueToLoad[i];
  
  var img = new Image()   //create holder for the image

  img.onload = function () {
    // console.log('loaded', this.src)
    var texture = regl.texture(this)
    texturesBlue.push(texture);
    if(texturesBlue.length == imagesBlueToLoad.length) {
      imageBlueLoaded = true;
      console.log('all blue images loaded')
    }
  }

  // console.log('Set the source of the image, this will load the image' onto GPU as texture)
  // console.log(i, './assets/mediaPortrait/yellowFlower/' + fileName + '.png')
  img.src = './assets/mediaPortrait/blueFlower/' + fileName + '.png';
}


// LOAD YELLOW IMAGES
for(var i=0; i< imagesYellowToLoad.length; i++) {
  var fileName = imagesYellowToLoad[i];
  
  var img = new Image()   //create holder for the image

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
  
  var img = new Image()   //create holder for the image

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
  
  var img = new Image()   //create holder for the image

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

/////////////////////////////////////////////////////////////////

function render () {
  if(drawSphere == undefined 
    || drawTextPlane == undefined 
    || imageYellowLoaded == false) {

    console.log('waiting obj to load')
    window.requestAnimationFrame(render)
    return;
  }
  currTime += 0.01

  // clear the background
  clear()

  // recalculate the view matrix because we are constantly moving the camera position now
  // use mouseX, mouseY for the position of camera
  var eye = [mouseX, mouseY, 7]
  var center = [0, 0, 0]
  var up = [0, 1, 0]
  // mat4.lookAt(viewMatrix, eye, center, up)


  // 3d model takes time to load, therefore check if drawCube is exist first before calling it
  
      var relativePosToStem = positionOffsets.positionsOffsetsStem[0]   //loop through array for the relative position of flowers to each other
      
      for(var i=0; i<10; i++) {
        var circleSize = circleSizes.circleSizesBlue[i];      //loop through array for the size of circles
        var posOffset = positionOffsets.positionsOffsetsBlue[i];  //loop through array for the position of circles
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

         var obj = {
           time: currTime,
           view: viewMatrix,
           projection: projectionMatrix,
           size: circleSize * 0.05,
           translate: posOffset,
           translateStem: relativePosToStem,
           texture: texturesBlue[i],
           yOffset: yOffset
    } 

    drawTextPlane(obj)

       }
    
  
      
      for(var i=0; i<5; i++) {
        var circleSize = circleSizes.circleSizesYellow[i];      //loop through array for the size of circles
        var posOffset = positionOffsets.positionsOffsetsYellow[i];  //loop through array for the position of circles
        var relativePosToStem = positionOffsets.positionsOffsetsStem[1];
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
        var circleSize = circleSizes.circleSizesRed[i];      //loop through array for the size of circles
        var posOffset = positionOffsets.positionsOffsetsRed[i];  //loop through array for the position of circles
        var relativePosToStem = positionOffsets.positionsOffsetsStem[2];
        var obj = {
          time: currTime,
          view: viewMatrix,
          projection: projectionMatrix,
          size: circleSize,
          translate: posOffset,
          translateStem: relativePosToStem,
         }
         // draw the sphere and pass the obj in for uniform
         drawSphere(obj)

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
    var circleSize = circleSizes.circleSizesGreen[i];      //loop through array for the size of circles
    var posOffset = positionOffsets.positionsOffsetsGreen[i];  //loop through array for the position of circles
    var relativePosToStem = positionOffsets.positionsOffsetsStem[3];
    var obj = {
      time: currTime,
      view: viewMatrix,
      projection: projectionMatrix,
      size: circleSize,
      translate: posOffset,
      translateStem: relativePosToStem,
      
    }
    // draw the sphere and pass the obj in for uniform
    drawSphere(obj)

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
