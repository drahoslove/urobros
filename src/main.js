
const app = new PIXI.Application({
  width: 1024,
  height: 1024,
  transparent: true,
  antialias: true,
})
document.body.appendChild(app.view)

const X = app.view.width/2
const Y = app.view.height/2

const snake = new Snake(60, X, Y)

app.stage.addChild(snake.g)



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
  const direction = keyboardDirection || getGamepadDirection() || wheelDirection

  if (direction > 0) {
    snake.turnRight(+direction)
  }
  if (direction < 0) {
    snake.turnLeft(-direction)
  }
  snake.updateBones(t)
})
