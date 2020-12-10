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

const colors = [0x990000, 0x000099, 0x009900]

const snakes = Array.from({length: colors.length}).map((_, i) => {
  const snake = new Snake(15, X+ 10*(i-1), Y)
  snake.direction += (i-1)
  snake.color = colors[i%colors.length]
  return snake
})

const sweets = Array.from({length: colors.length*2})
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
  wheelDirection += e.deltaY/100 * 0.666
  wheelDirection = Math.min(Math.abs(wheelDirection), 1) * Math.sign(wheelDirection)
  
  clearInterval(wheelTimeout)
  wheelTimeout = setInterval(() => {
    wheelDirection *= 0.9
    wheelDirection = +wheelDirection.toFixed(3)
    if (wheelDirection === 0) {
      clearInterval(0)
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


// start animating
app.ticker.add((t) => {
  // movement
  [keyboardDirection, getGamepadDirection(), wheelDirection].forEach((direction, i) =>{
    if (direction > 0) {
      snakes[i].turnRight(+direction)
    }
    if (direction < 0) {
      snakes[i].turnLeft(-direction)
    }
  })

  // check eat
  snakes.forEach((snake) => {
    sweets.filter(({color}) => color === snake.color).forEach((sweet) => {
      const d = dist(snake.getHeadPos(), sweet)
      if (d < 22) {
        snake.grow(3)
        reposSweet(sweet)
        score += 5
        scoreText.text = `Score: ${score}`
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
        console.log('xxx')
        snake.direction += Math.PI/2
      }
    })
  })

  // check borders
  snakes.forEach((snake) => {
    const E =  10 //distance from border where the bump happens
    const {x, y} = snake.getHeadPos()
    if (
      x < E || y < E ||
      x > app.view.width-E  || y > app.view.height-E
    ) {
      snake.demage()
      snake.direction += Math.PI/2
      score--
      score = Math.max(score, 0)
      scoreText.text = `Score: ${score}`
    }
  })


  snakes.forEach((s) => { s.updateBones(t) })
  sweets.forEach(renderSweet)
})


function renderSweet(sweet) {
  sweet.clear()
  sweet.beginFill(sweet.color)
  sweet.drawCircle(0, 0, 8)
  sweet.endFill()
}
