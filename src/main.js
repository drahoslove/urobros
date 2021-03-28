const scores = Array.from({length: SNAKE_COUNT}).map(() => 0)

const SWEET_PER_SNAKE = 5

const app = new PIXI.Application({
  width: 1024,
  height: 1024,
  transparent: true,
  antialias: true,
})

document.querySelector('#app').appendChild(app.view)

const reposSweet = (sweet) => {
  const O = 10
  sweet.x = O+rand(app.view.width-2*O)
  sweet.y = O+rand(app.view.height-2*O)
}

// x goes left to right
// y goes top to bottom

const X = app.view.width/2
const Y = app.view.height/2

const snakes = Array.from({length: SNAKE_COUNT}).map((_, i, { length }) => {
  const half = (length-1)/2
  const snake = new Snake(15, X+ 20*(i-half), Y + Math.abs(10*(i-half)))
  snake.direction += (i-half) * 5/length
  snake.color = colors[i%SNAKE_COUNT]
  return snake
})

const sweets = Array.from({length: SNAKE_COUNT*SWEET_PER_SNAKE})
  .map((_, i) => {
    const sweet = new PIXI.Graphics()
    sweet.color = colors[i%SNAKE_COUNT]
    reposSweet(sweet)
    return sweet
  })
sweets.forEach(function renderSweet(sweet) {
  sweet.clear()
  sweet.beginFill(sweet.color)
  sweet.lineStyle(1, 0x111111)
  sweet.drawCircle(0, 0, 9)
  sweet.lineStyle(0, 0)
  sweet.drawCircle(0, 0, 8)
  sweet.endFill()
})


const board = new PIXI.Graphics()
{
  board.clear()
  board.beginFill(0xdddddd, 0.66)
  board.drawRect(0, 0, 320, 130)
  board.endFill()
}
const scoreText = new PIXI.Text('Score: 0', {
  fontSize: 26,
  fontFamily: 'monospace',
  fill: 0x444444,
})
scoreText.x = 10
scoreText.y = 10

app.stage.addChild(...snakes.map((({g}) => g)))
app.stage.addChild(...sweets)
app.stage.addChild(board, scoreText)



let activeSnakeIndex = 0

// start animating
app.ticker.add((t) => {
  // movement
  const controls = getSelectedControls()
  snakes.forEach((snake, i) => {
      const direction =  getDirection(controls[i], i)
      if (direction > 0) {
        snakes[i].turnRight(+direction)
      }
      if (direction < 0) {
        snakes[i].turnLeft(-direction)
      }
      if (direction && controls[i] !== 'auto') {
        activeSnakeIndex = i
      }
      if (activeSnakeIndex === i) {
        scoreText.text = ''
          + `Scores:    ${scores.join(':')}\n`
          + `Direction: ${(normalizedAngle(snakes[i].direction) / Math.PI /2 * 360).toFixed(0)}°\n`
          + `Velocity:  ${snakes[i].velocity.toFixed(3)}\n`
          + `Traction:  ${snakes[i].getTraction().toFixed(3)}\n`
      }
    })

  // check food
  snakes.forEach((snake, i) => {
    sweets.filter(({color}) => color === snake.color).forEach((sweet) => {
      const d = dist(snake.getHeadPos(), sweet)
      if (d < 22) {
        snake.grow(3)
        if (controls[i] === 'auto') {
          snake.grow(9)
        }
        scores[i] += 5
        scoreText.text = `Scores: ${scores.join(':')}`
        reposSweet(sweet)
      }
    })
  })

  // check mates
  snakes.forEach((snake) => {
    snakes.forEach(s => {
      if (s === snake) {
        return
      }
      const head = snake.getHeadPos()
      if (s.getBonesPos().some(point => dist(head, point) < 8)) {
        snake.direction += Math.PI
      }
    })
  })

  // check borders
  snakes.forEach((snake, i) => {
    const E =  10 //distance from border where the bump happens
    const {x, y} = snake.getHeadPos()
    if (
      x < E || y < E ||
      x > app.view.width-E  || y > app.view.height-E
    ) {
      const walls = [ // 0 deg is right direction, going clockwise
        x > app.view.width-E, // right
        y > app.view.height-E, // bottom
        x < E, // left
        y < E, // top
      ]
      // normal direction from wall towards to room
      const wallDirection = walls.indexOf(true) * Math.PI/2

      snake.demage()
      snake.direction = reflectionAngle(snake.direction, wallDirection)
      scores[i]--
      scores[i] = Math.max(scores[i], 0)
      scoreText.text = `Scores: ${scores.join(':')}`
    }
  })

  sweets.forEach((s) => updateSweet(t, s))
  snakes.forEach((s) => { s.updateBones(t) })
})


function updateSweet(sweet, t) {
  if (sweet.x > app.view.width/3) {
    sweet.x -= rand(sweet.x - app.view.width/5)/20000 * t
  }
  if (sweet.x < app.view.width/3*2) {
    sweet.x += rand(app.view.width/5*4 - sweet.x)/20000 * t
  }
  if (sweet.y > app.view.height/3) {
    sweet.y -= rand(sweet.y - app.view.height/5)/20000 * t
  }
  if (sweet.y < app.view.height/3*2) {
    sweet.y += rand(app.view.height/5*4 - sweet.y)/20000 * t
  }
}
