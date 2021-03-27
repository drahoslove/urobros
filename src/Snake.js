
class Snake {
  constructor(size, x, y) {
    this.spacing = 8
    this.maxVelocity = 3
    this.rattleFactor = 0.49  // 0.58
    this.x = x
    this.y = y
    this.velocity = 8
    this.direction = -Math.PI/2 // up
    this.backbone = Array.from({ length: size })
      .map((_, i) =>  new PIXI.Point(0, i * this.spacing))
    this.g = new PIXI.Graphics()
    this.g.alpha = 1
    this.g.x = x
    this.g.y = y
    this.prevTractions = []
  }

  updateBones(t=1) {
    if(t>2) {
      t=2
    }
    // slowing down naturally
    this.velocity *= Math.pow(0.96, t)
    this.velocity -= 0.015 * t
    if (this.velocity < 0.02) {
      this.velocity = 0
    }

    // this.rattleFactor *= 0.995
    this.rattleFactor -= 0.005*t
    this.rattleFactor = Math.max(this.rattleFactor, 0.49)

    const {x, y} = this.getVector()
    // make the snake
    const deltas = this.backbone.reduce((deltas, point, i, points) => {
      if (i === 0) { // head
        deltas.push({x, y})
      } else {
        // current point pos
        const { x: x1, y: y1 } = point
        // pos of leading point
        const { x: x2, y: y2 } = points[i-1]

        // new pos of leading point
        const x3 = x2 + deltas[i-1].x 
        const y3 = y2 + deltas[i-1].y
        // direction form leading point to new pos of current point
        const {x: xm, y: ym} = avg(point, points[i-1], this.rattleFactor)
        const dx3 = -(x3-xm)
        const dy3 = -(y3-ym)
        const direction = Math.atan2(dy3, dx3)

        // new abs pos
        const { x: dx, y: dy } = this.getVector(direction, this.spacing)
        const x = x3 + dx
        const y = y3 + dy
        deltas.push({
          x: x-x1,
          y: y-y1,
        })
      }
      return deltas
    }, [])

    this.backbone.forEach((point, i) => {
      point.x += deltas[i].x
      point.y += deltas[i].y
    })
    this.renderBones()
  }

  grow(n=1) {
    const {x, y} = this.backbone[this.backbone.length-1]
    while(n--) {
      this.backbone.push(new PIXI.Point(x, y))
      this.maxVelocity += 0.1
      this.velocity += .75
    }
    this.rattleFactor = 0.9
  }

  demage(n=1) {
    while(n-- && this.backbone.length > 7) {
      this.backbone.shift()
      this.maxVelocity -= 0.1
      this.velocity++
    }
  }

  renderBones() {
    const g = this.g
    const backbone = this.backbone
    g.clear()
    
    const radius = (i) => (i == 0)
      ? 11
      : 9 - Math.max(0, Math.min(7, +7 - backbone.length+i))
    
    const drawCircle = (i, outlined) => {
      g.lineStyle(outlined ? 2 : 0, 0x111111)
      g.drawCircle(backbone[i].x,  backbone[i].y, radius(i)+outlined*1)
    }
    
    const P = 1  // ofset of non-overlapped pieces
    g.beginFill(this.color || 0x999999)
    for (let i = backbone.length-1, j = i+P; j >= 0; i--, j--) { // tail first
      if (i >=0 && i < backbone.length)
        drawCircle(i, true)
      if (j >=0 && j < backbone.length)
        drawCircle(j, false)
    }
    g.endFill()
  }

  turnRight(weight) {
    this.velocity += 0.4 * weight * Math.min(1, this.getTraction())
    this.velocity = Math.min(this.velocity, this.maxVelocity)
    this.direction += 0.05 * this.velocity/2 * weight
  }

  turnLeft(weight) {
    this.velocity += 0.4 * weight * Math.min(1, this.getTraction())
    this.velocity = Math.min(this.velocity, this.maxVelocity)
    this.direction -= 0.05 * this.velocity/2 * weight
  }
  
  getVector(direction=this.direction, velocity=this.velocity) {
    // direction = Math.atan2(y, x)
    // velocity = sqrt(x*x + y*y)
    const a = normalizedAngle(direction)
    const r = velocity
    const x = r * Math.cos(a)
    const y = r * Math.sin(a)
    return {x, y}
  }

  getTraction() {
    const vector = this.getVector()

    // direction of each bone point
    const directions = this.backbone
      .filter((_, i) => i < 30) // only consider begining of of the snake
      .map((point, i, points) => {
        // current point pos
        const { x: x1, y: y1 } = point
        // pos of leading point
        const { x: x2, y: y2 } = points[i-1] || { x: x1+vector.x, y: y1+vector.y }

        const dx = (x2-x1)
        const dy = (y2-y1)
        const direction = Math.atan2(dy, dx)
        return (direction)
      })

    // angles between all pair of consecutive bone vectors
    const angles = directions.reduce((angles, dir, i, dirs) => {
      if (i > 0) {
        const weight = 1 // (dirs.length/2-i)/dirs.length + 0.25 // (1.25 - 0.75)
        angles.push(angleDiff(dir, dirs[i-1]) * weight)
      }
      return angles
    }, [])

    // return angles.reduce((sum, val) => sum+val, 0)/angles.length //avg

    const traction = (stDeviation(angles) * 10)-0.05
    // this.prevTractions.push(traction)
    // if (this.prevTractions.length > 4) {
    //   this.prevTractions.shift()
    // }
    // this.prevTractions.reduce((sum, val) => (sum+val), 0)/this.prevTractions.length // avg of last 4
    return traction
  }

  getHeadPos() {
    let {x, y} = this.backbone[0]
    x += this.x
    y += this.y
    return {x, y}
  }

  getBonesPos() {
    return this.backbone.map(({x, y}) => ({
      x: x+this.x,
      y: y+this.y,
    }))
  }
  
}