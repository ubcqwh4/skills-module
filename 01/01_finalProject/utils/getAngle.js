var glm = require('gl-matrix') // import gl-matrix for matrix & vector math
var mat4 = glm.mat4 // create a holder for glm as a shortcut
var mat3 = glm.mat3 // create a holder for glm as a shortcut
var vec3 = glm.vec3 // create a holder for glm as a shortcut

const DEG = 180 / Math.PI


function getAngle (stemPos, cameraPos) {
  var dir = vec3.fromValues(stemPos[0], 0, stemPos[2])
  vec3.normalize(dir, dir)
  var front = [cameraPos[0], 0, cameraPos[2]]
  vec3.normalize(front, front)
  var dotValue = vec3.dot(dir, front)
  var angle = Math.acos(dotValue) * DEG

  return angle
}

module.exports = getAngle
