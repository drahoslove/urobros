
const app = new PIXI.Application({
  width: 1024,
  height: 1024,
  transparent: true,
  antialias: true,
})
document.body.appendChild(app.view)

const X = app.view.width/2
const Y = app.view.height/2

const snake = new Snake(15, X, Y)
const sweet = new PIXI.Graphics()
app.stage.addChild(snake.g)
app.stage.addChild(sweet)

const rand = (n=2) => Math.floor(Math.random()*n)

const generateSweet = () => {
  sweet.x = rand(app.view.width)
  sweet.y = rand(app.view.height)
}

generateSweet()


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

  if (e.key === 'b') {
    snake.grow(1)
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
  const direction = keyboardDirection || getGamepadDirection() || wheelDirection
  if (direction > 0) {
    snake.turnRight(+direction)
  }
  if (direction < 0) {
    snake.turnLeft(-direction)
  }
  // check eat
  const d = dist(snake.getHeadPos(), sweet)
  if (d < 22) {
    snake.grow(3)
    generateSweet()
  }

  // check borders

  const E =  10 //distance from border where the bump happens
  const {x, y} = snake.getHeadPos()
  if (
    x < E || y < E ||
    x > app.view.width-E  || y > app.view.height-E
  ) {
    snake.direction += Math.PI/2
  }

  snake.updateBones(t)
  renderSweet()
})


function renderSweet() {
  sweet.clear()
  sweet.beginFill(0x990000)
  sweet.drawCircle(0, 0, 8)
  sweet.endFill()
}
