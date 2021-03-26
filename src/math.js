const rand = (n=2) => Math.floor(Math.random()*n)

const dist = (p1, p2) => {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx*dx + dy*dy)
}

const avg = (p1, p2, t=0.5) => ({
  x: p1.x + (p2.x - p1.x)*t,
  y: p1.y + (p2.y - p1.y)*t,
})

const normalizedAngle = (angle) => {
  while (angle < 0) {
    angle += Math.PI * 2
  }
  return angle % (Math.PI * 2)
}

const reflectionAngle = (angleIn, normalAngle) => {
  return normalizedAngle(normalAngle - (angleIn - normalAngle) + (Math.PI))
}


// TEST
[
  [0, 0, 0],
  [Math.PI/4, 0, -Math.PI/4],
  [-Math.PI/4, 0, Math.PI/4],

  [Math.PI/2, Math.PI/2, Math.PI/2],
  [Math.PI*3/4, Math.PI* 1/2, Math.PI*1/4],
  [Math.PI*1/4, Math.PI* 1/2, Math.PI*3/4],

  [Math.PI, Math.PI, Math.PI],
  [Math.PI + 0.01, Math.PI, Math.PI - 0.01],
  [Math.PI - 0.02, Math.PI, Math.PI + 0.02],

  [Math.PI * 1.5, Math.PI * 1.5, Math.PI * 1.5],
  [Math.PI * 1.5 + 0.1, Math.PI * 1.5, Math.PI * 1.5 - 0.1],
  [Math.PI * 1.5 - 0.2, Math.PI * 1.5, Math.PI * 1.5 + 0.2],

].forEach(([inAngle, normalAngle, expected], i) =>{
  if (reflectionAngle(inAngle,normalAngle) !== normalizedAngle(expected + Math.PI)) {
    console.log('expected', i, inAngle, normalAngle, reflectionAngle(inAngle,normalAngle), '!=', expected)
  }
})