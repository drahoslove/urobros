let score = 0

const reposSweet = (sweet) => {
  const O = 10
  sweet.x = O+rand(app.view.width-2*O)
  sweet.y = O+rand(app.view.height-2*O)
}

const app = new PIXI.Application({
  width: 1024,
  height: 1024,
  transparent: true,
  antialias: true,
})
document.body.appendChild(app.view)

const X = app.view.width/2
const Y = app.view.height/2

const colors = [0x990000, 0x000099, 0x009900, 0x009999,  0x999900]

const snakes = Array.from({length: colors.length}).map((_, i) => {
  const snake = new Snake(15, X+ 10*(i-2), Y)
  snake.direction += (i-2)
  snake.color = colors[i%colors.length]
  return snake
})

const sweets = Array.from({length: colors.length*5})
  .map((_, i) => {
    const sweet = new PIXI.Graphics()
    sweet.color = colors[i%colors.length]
    reposSweet(sweet)
    return sweet
  })

const scoreText = new PIXI.Text('Score: 0', {
  fontSize: 26,
  fill: 0x666666,
})
scoreText.x = 10
scoreText.y = 10

app.stage.addChild(...snakes.map((({g}) => g)))
app.stage.addChild(...sweets)
app.stage.addChild(scoreText)

// keyboard controll
let keyboardDirection = 0
const LEFT_KEYS = ['ArrowLeft', 'd', 'j']
const RIGHT_KEYS = ['ArrowRight', 'f', 'k']
window.onkeydown = (e) => {
  if (LEFT_KEYS.includes(e.key)) {
    keyboardDirection = -1
  }
  if (RIGHT_KEYS.includes(e.key)) {
    keyboardDirection = 1
  }
}
window.onkeyup = (e) => {
  if (keyboardDirection === -1 && LEFT_KEYS.includes(e.key)) {
    keyboardDirection = 0
  }
  if (keyboardDirection === +1 && RIGHT_KEYS.includes(e.key)) {
    keyboardDirection = 0
  }
}
// wheel controll
let wheelDirection = 0
let wheelTimeout
document.body.addEventListener('wheel', (e) => {
  e.preventDefault()
  wheelDirection += e.deltaY/( e.deltaMode ? 3 : 100) * 0.8
  wheelDirection = Math.min(Math.abs(wheelDirection), 1) * Math.sign(wheelDirection)
  
  clearInterval(wheelTimeout)
  wheelTimeout = setInterval(() => {
    wheelDirection *= 0.8
    if (Math.abs(wheelDirection) < 0.01) {
      wheelDirection = 0
      clearInterval(wheelTimeout)
    }
  }, 50)
}, { passive: false})

// gamepad controll
const getGamepadDirection = (gamepadIndex=0) => {
  try {
    const gamepad = navigator.getGamepads()[gamepadIndex]
    if (gamepad) {
      // left stick
      const x1 = +gamepad.axes[0].toFixed(3)
      const y1 = +gamepad.axes[1].toFixed(3)
      // right stick
      const x2 = +gamepad.axes[2].toFixed(3)
      const y2 = +gamepad.axes[3].toFixed(3)
      // trigger buttons
      const lt = gamepad.buttons[6].value
      const rt = gamepad.buttons[7].value
      const tr = rt-lt
      // directionpad buttons
      const ld = gamepad.buttons[14].value
      const rd = gamepad.buttons[15].value
      const dp = rd-ld
      return x2 || x1 || tr || dp
    }
  } catch(e) {
    return 0
  }
}

let autoPilotDirection = 0
function autopilot() {
  autoPilotDirection += (0.5 - rand(10)/40)*4
  while (autoPilotDirection > 1) {
    autoPilotDirection -= 2
  }
  while(autoPilotDirection< -1) {
    autoPilotDirection += 2
  }
  autoPilotDirection *= 1.5
}
setInterval(autopilot, 150)


// start animating
app.ticker.add((t) => {
  // movement
  [
    keyboardDirection,
    autoPilotDirection,
    getGamepadDirection(),
    -autoPilotDirection,
    wheelDirection,
  ].forEach((direction, i) =>{
    if (direction > 0) {
      snakes[i].turnRight(+direction)
    }
    if (direction < 0) {
      snakes[i].turnLeft(-direction)
    }
  })

  // check eat
  snakes.forEach((snake, i) => {
    sweets.filter(({color}) => color === snake.color).forEach((sweet) => {
      const d = dist(snake.getHeadPos(), sweet)
      if (d < 22) {
        snake.grow(3)
        if (i % 2) {
          snake.grow(10)
        } else {
          score += 5
          scoreText.text = `Score: ${score}`
        }
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
      if (i % 2 === 0) {
        score--
        score = Math.max(score, 0)
        scoreText.text = `Score: ${score}`
      }
    }
  })

  sweets.forEach(updateSweet)


  snakes.forEach((s) => { s.updateBones(t) })
  sweets.forEach(renderSweet)
})


function updateSweet(sweet) {
  if (sweet.x > app.view.width/3) {
    sweet.x -= rand(sweet.x - app.view.width/5)/20000
  }
  if (sweet.x < app.view.width/3*2) {
    sweet.x += rand(app.view.width/5*4 - sweet.x)/20000
  }
  if (sweet.y > app.view.height/3) {
    sweet.y -= rand(sweet.y - app.view.height/5)/20000
  }
  if (sweet.y < app.view.height/3*2) {
    sweet.y += rand(app.view.height/5*4 - sweet.y)/20000
  }
}

function renderSweet(sweet) {
  sweet.clear()
  sweet.beginFill(sweet.color)
  sweet.drawCircle(0, 0, 8)
  sweet.endFill()
}
