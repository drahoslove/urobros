const avg = (p1, p2, t=0.5) => ({
  x: p1.x + (p2.x - p1.x)*t,
  y: p1.y + (p2.y - p1.y)*t,
})


class Snake {
  constructor(size, x, y) {
    this.x = x
    this.y = y
    this.maxVelocity = 4
    this.velocity = 8
    this.direction = -Math.PI/2
    this.rotation = 0
    this.backbone = Array.from({ length: size })
      .map((_, i) =>  new PIXI.Point(0, i * 10))
    this.g = new PIXI.Graphics()
    this.g.x = x
    this.g.y = y
    this.tick = 0
  }

  updateBones(t) {
    this.velocity *= 0.95
    this.velocity = Math.max(this.velocity, 0)

    const tick = (this.tick += t/10)
    const {x, y} = this.getVector()
    // const velocity = Math.sqrt(x*x, y*y)
    // make the snake
    const deltas = this.backbone.reduce((deltas, point, i, points) => {
      if (i === 0) {
        deltas.push({x, y})
      } else {
        // current pos
        const { x: x1, y: y1 } = point
        // pos of leading point
        const { x: x2, y: y2 } = points[i-1]
        // distance from leading point
        const dx2 = (x2-x1)
        const dy2 = (y2-y1)
        const distance = Math.sqrt(dx2*dx2 + dy2*dy2)

        // new pos of leading point
        const x3 = x2 + deltas[i-1].x 
        const y3 = y2 + deltas[i-1].y
        // direction form leading point to ???
        const {x: xm, y: ym} = avg(point, points[i-1], .58 )
        const dx3 = -(x3-xm)
        const dy3 = -(y3-ym)
        const direction = Math.atan2(dy3, dx3)

        // new abs pos
        const { x: dx, y: dy } = this.getVector(direction, distance)
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

  renderBones() {
    const g = this.g
    const backbone = this.backbone
    g.clear()

    g.lineStyle(2, 0x888888)
    g.moveTo( backbone[0].x,  backbone[0].y)
  
    for (let i = 1; i <  backbone.length; i++) {
      g.lineTo( backbone[i].x,  backbone[i].y)
    }
    for (let i = backbone.length-1; i >= 0; i--) { // tail first
      g.beginFill(0x999999)
      const r = (i == 0)
        ? 12
        : 10 - Math.max(0, Math.min(7, +7 - backbone.length+i))
      g.drawCircle(backbone[i].x,  backbone[i].y, r)
      g.endFill()
    }
  }

  turnRight(weight) {
    this.velocity += 0.4 * weight
    this.velocity = Math.min(this.velocity, this.maxVelocity)
    this.direction += 0.05 * this.velocity/2 * weight
  }

  turnLeft(weight) {
    this.velocity += 0.4 * weight
    this.velocity = Math.min(this.velocity, this.maxVelocity)
    this.direction -= 0.05 * this.velocity/2 * weight
  }
  
  getVector(direction=this.direction, velocity=this.velocity) {
    // direction = Math.atan2(y, x)
    // velocity = sqrt(x*x + y*y)
    const a = direction
    const r = velocity
    const x = r * Math.cos(a)
    const y = r * Math.sin(a)
    return {x, y}
  }
  
}