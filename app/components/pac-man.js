import Ember from 'ember'
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component'

export default Ember.Component.extend(KeyboardShortcuts, {
  x: 1,
  y: 2,
  squareSize: 30,
  score: 0,
  level: 1,

  didInsertElement() {
    this.movementLoop()
    //
    // this.drawGrid()
    // this.drawPac()
  },

  directions: {
    'up':      { x:  0, y: -1 },
    'down':    { x:  0, y:  1 },
    'right':   { x:  1, y:  0 },
    'left':    { x: -1, y:  0 },
    'stopped': { x:  0, y:  0 }
  },

  ctx: Ember.computed(function() {
    let canvas = document.getElementById('canvas')
    let ctx = canvas.getContext('2d')
    return ctx
  }),

  screenWidth: Ember.computed(function() {
    return this.get('grid.firstObject.length')
  }),

  screenHeight: Ember.computed(function() {
    return this.get('grid.length')
  }),

  screenPixelWidth: Ember.computed(function() {
    return this.get('screenWidth') * this.get('squareSize')
  }),

  screenPixelHeight: Ember.computed(function() {
    return this.get('screenHeight') * this.get('squareSize')
  }),

  clearScreen() {
    let ctx = this.get('ctx')
    ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'))
  },

  intent: 'down',
  keyboardShortcuts: {
    up()    { this.set('intent', 'up')    },
    down()  { this.set('intent', 'down')  },
    right() { this.set('intent', 'right') },
    left()  { this.set('intent', 'left')  }
  },

  direction: 'down',

  changePacDirection() {
    let intent = this.get('intent')
    if (this.pathBlocked(intent)) {
      this.set('direction', 'stopped')
    } else {
      this.set('direction', intent)
    }
  },

  frameCycle: 1,
  framesPerMovement: 30,
  movementLoop() {
    if (this.get('frameCycle') === this.get('framesPerMovement')) {
      let direction = this.get('direction')
      this.set('x', this.nextCoordinate('x', direction))
      this.set('y', this.nextCoordinate('y', direction))

      this.set('frameCycle', 1)

      this.processPellets()
      this.changePacDirection()
    } else if(this.get('direction') === 'stopped') {
      this.changePacDirection()
    } else {
      this.incrementProperty('frameCycle')
    }

    this.clearScreen()
    this.drawGrid()
    this.drawPac()

    Ember.run.later(this, this.movementLoop, 1000/60)
  },

  pathBlocked(direction) {
    let cellType = this.cellType(direction)
    return Ember.isEmpty(cellType) || cellType === 1
  },

  cellType(direction) {
    let nextX = this.nextCoordinate('x', direction)
    let nextY = this.nextCoordinate('y', direction)

    return this.get(`grid.${nextY}.${nextX}`)
  },

  nextCoordinate(coordinate, direction) {
    return this.get(coordinate) + this.get(`directions.${direction}.${coordinate}`)
  },

  // collidedWithBorder(direction) {
  //   let position = this.get(direction)
  //   let dimension = this.get('dimensionMap')[direction]
  //   let size = this.get(dimension)
  //   let pacOutOfBounds = position < 0 || position >= size
  //   return pacOutOfBounds
  // },
  //
  // loopAmount(direction, amount) {
  //   let dimension = this.get('dimensionMap')[direction]
  //   let heightOrWidth = this.get(dimension)
  //   return amount * heightOrWidth
  // },
  //
  // collidedWithWall() {
  //   let x = this.get('x')
  //   let y = this.get('y')
  //   let grid = this.get('grid')
  //
  //   let hitWall = grid[y][x] === 1
  //   return hitWall
  // },
  //
  // 0 is empty, 1 is a wall, 2 is a pellet
  grid: [
    [1,2,2,2,2,2,2,1],
    [2,1,2,1,2,2,2,2],
    [1,2,1,2,2,2,2,1],
    [1,2,2,2,2,2,2,1],
    [2,2,2,2,2,2,2,2],
    [1,2,2,2,2,2,2,1]
  ],

  drawGrid() {
    let ctx = this.get('ctx')
    ctx.fillStyle = '#000'

    let grid = this.get('grid')
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell === 1) {
          this.drawWall(columnIndex, rowIndex)
        }
        if (cell === 2) {
          this.drawPellet(columnIndex, rowIndex)
        }
      })
    })
  },

  drawWall(x, y) {
    let ctx = this.get('ctx')
    let squareSize = this.get('squareSize')

    ctx.fillStyle = '#000'
    ctx.fillRect(x * squareSize,
      y * squareSize,
      squareSize,
      squareSize)
    },

    drawCircle(x, y, fraction, direction) {
      let ctx = this.get('ctx')
      let squareSize = this.get('squareSize')

      let pixelX = (x + 1/2 + this.offsetFor('x', direction)) * squareSize
      let pixelY = (y + 1/2 + this.offsetFor('y', direction)) * squareSize

      ctx.fillStyle = '#333'
      ctx.beginPath()
      ctx.arc(pixelX, pixelY, squareSize/fraction, 0, Math.PI * 2, false)
      ctx.closePath()
      ctx.fill()
    },

    offsetFor(coordinate, direction) {
      let frameRatio = this.get('frameCycle') / this.get('framesPerMovement')
      return this.get(`directions.${direction}.${coordinate}`) * frameRatio
    },

    drawPellet(x, y) {
      this.drawCircle(x, y, 6, 'stopped')
    },

    drawPac() {
      let x = this.get('x')
      let y = this.get('y')

      this.drawCircle(x, y, 2, this.get('direction'))
    },

    processPellets() {
      let x = this.get('x')
      let y = this.get('y')
      let grid = this.get('grid')

      if (grid[y][x] === 2) {
        grid[y][x] = 0
        this.incrementProperty('score')

        if (this.levelComplete()) {
          this.incrementProperty('level')
          this.restartLevel()
        }
      }
    },

    levelComplete() {
      let hasPelletsLeft = false
      let grid = this.get('grid')

      grid.forEach((row) => {
        row.forEach((cell) => {
          if (cell === 2) {
            hasPelletsLeft = true
          }
        })
      })

      return !hasPelletsLeft
    },

    restartLevel() {
      this.set('x', 0)
      this.set('y', 0)

      let grid = this.get('grid')
      grid.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
          if (cell === 0) {
            grid[rowIndex][columnIndex] = 2
          }
        })
      })
    }
  })
