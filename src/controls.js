const SNAKE_COUNT = window.location.hash
  ? (+window.location.hash.substr(1) || 0)
  : 5

const colors = []

for (let i = 0, hue = 0; i < SNAKE_COUNT; i++, hue += 360/SNAKE_COUNT) {
  colors.push(hsl2rgb(hue, 60, 50))
}
  
const toCSS = (color) => '#'+color.toString(16).padStart(6, '0')

// controls
const controls = {
  'k': '⌨ ← →',
  'kAD': '⌨ A D',
  'kDF': '⌨ D F',
  'kJK': '⌨ J K',
  'kJL': '⌨ J L',
  'w': '🖱 wheel',
  'gT': '🎮 trigger buttons',
  'gDP': '🎮 d-pad',
  'gLS': '🎮 left stick',
  'gRS': '🎮 right stick',
  'auto': '👾 autopilot',
  'none': '⛔ none',
}

const defaultControls = ['k', 'auto', 'gT', 'auto', 'w']


const createSelector = (parent, defaultVal, color) => {
  const selector = document.createElement('select')
  Object.entries(controls)
    .map(([key, name]) => {
      const option = document.createElement('option')
      option.value = key
      option.innerHTML = name
      selector.appendChild(option)
    })
  selector.value = defaultVal
  selector.style.setProperty('--color', toCSS(color))
  selector.onchange = function() {
    this.blur()
  }
  document.querySelector(parent).appendChild(selector)
  return selector
}
const createAddButton = (parent, name, count) => {
  const button = document.createElement('button')
  button.innerHTML = name
  button.style.setProperty('--color', toCSS(hsl2rgb(0, 0, 50)))
  button.onclick = () => {
    window.location.hash = SNAKE_COUNT+count
    window.location.reload()
  }
  document.querySelector(parent).appendChild(button)
  return button
}

const controlSelectors = colors.map((color, i) =>
  createSelector('#settings', defaultControls[i] || 'auto', color),
)
createAddButton('#settings', '➕ add snake', 1)
if (SNAKE_COUNT) {
  createAddButton('#settings', '❌ remove', -1)
}


const getSelectedControls = () =>
  controlSelectors.map((controlSelector,  i) =>
    controlSelector.value || defaultControls[i],
  )


const getDirection = (controlName, i) => ({
  'k': keyboardDirections[0],
  'kAD': keyboardDirections[1],
  'kDF': keyboardDirections[2],
  'kJK': keyboardDirections[3],
  'kJL': keyboardDirections[4],
  'w': wheelDirection,
  'auto': autoPilotDirections[i],
  'gT': getGamepadDirection(0, 'TR'),
  'gLS': getGamepadDirection(0, 'LS'),
  'gRS': getGamepadDirection(0, 'RS'),
  'gDP': getGamepadDirection(0, 'DP'),
  'none': 0,
}[controlName])


// keyboard controll
const KEY_PAIRS = [
  ['ArrowLeft', 'ArrowRight'],
  ['a', 'd'],
  ['d', 'f'],
  ['j', 'k'],
  ['j', 'l'],
]
const keyboardDirections = KEY_PAIRS.map(() => 0)

window.onkeydown = (e) => {
  KEY_PAIRS.forEach(([left, right], i) => {
    if (e.key === left) {
      keyboardDirections[i] = -1
    }
    if (e.key === right) {
      keyboardDirections[i] = 1
    }
  })
}
window.onkeyup = (e) => {
  KEY_PAIRS.forEach(([left, right], i) => {
    if (keyboardDirections[i] === -1 && e.key === left) {
      keyboardDirections[i] = 0
    }
    if (keyboardDirections[i] === +1 && e.key === right) {
      keyboardDirections[i] = 0
    }
  })
}

// wheel controll
let wheelDirection = 0
let wheelTimeout
document.body.addEventListener('wheel', (e) => {
  e.preventDefault()
  wheelDirection += e.deltaY/( e.deltaMode ? 3 : 100) * .8
  wheelDirection = Math.min(Math.abs(wheelDirection), 1.2) * Math.sign(wheelDirection)
  
  clearInterval(wheelTimeout)
  wheelTimeout = setInterval(() => {
    wheelDirection *= 0.8
    // wheelDirection -= 0.1 * Math.sign(wheelDirection)
    if (Math.abs(wheelDirection) < 0.01) {
      wheelDirection = 0
      clearInterval(wheelTimeout)
    }
  }, 50)
}, { passive: false})

// gamepad controll
const getGamepadDirection = (gamepadIndex=0, what) => {
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
      if (what === 'LS') {
        return x1
      }
      if (what === 'RS') {
        return x2
      }
      if (what == 'TR') {
        return tr
      }
      if (what == 'DP') {
        return dp
      }
      return x2 || x1 || tr || dp
    }
  } catch(e) {
    return 0
  }
}

let autoPilotDirections = colors.map(() => 0)
function autopilot() {
  autoPilotDirections.forEach((_,i) => {
    autoPilotDirections[i] += (0.5 - rand(10)/40)*4
    while (autoPilotDirections[i] > 1) {
      autoPilotDirections[i] -= 2
    }
    while(autoPilotDirections[i]< -1) {
      autoPilotDirections[i] += 2
    }
    autoPilotDirections[i] *= 1.5
  })
}
setTimeout(() => {
  setInterval(autopilot, 150)
}, 400)