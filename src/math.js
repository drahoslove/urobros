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


const stDeviation = (values) => {
  const mean = values.reduce((sum, val) => sum+val, 0)/values.length
  return Math.sqrt(
    (1/(values.length-1)) * values.reduce((sum, val) => sum + (val-mean)*(val-mean), 0)
  )
}
  
const angleDiff = (a, b) => { // 0 to +pi
  a = normalizedAngle(a)
  b = normalizedAngle(b)
  const diff = (a > b)
    ? a-b
    : b-a
  return Math.abs(
    (diff > Math.PI)
      ? diff-Math.PI*2
      : diff
  )
}

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
;[
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
    console.log('reflectionAngle expected', i, inAngle, normalAngle, reflectionAngle(inAngle,normalAngle), '!=', expected)
  }
})

;[
  [0, 0, 0],
  [0, Math.PI, Math.PI],
  [Math.PI, Math.PI, 0],
  [0+ 0.01, Math.PI*2 - 0.01, 0.02],
  [Math.PI*5/4+ 0.01, Math.PI*5/4 - 0.01, 0.02],
  [Math.PI*3/4+ 0.01, Math.PI*3/4 - 0.01, 0.02],
  [Math.PI*6/4+ 0.01, Math.PI*6/4 - 0.01, 0.02],
  [Math.PI*-3/4+ 0.01, Math.PI*-3/4 - 0.01, 0.02],
].forEach(([a, b, expected], i) =>{
  if (angleDiff(a,b).toFixed(6) !== expected.toFixed(6)) {
    console.log('angleDiff expected', i, a, b, angleDiff(a,b), '!=', expected)
  }
})
