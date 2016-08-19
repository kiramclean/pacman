import Ember from 'ember'
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component'
import Shared from '../mixins/shared'
import Pac from '../models/pac'
import Level1 from '../models/level'
import Level2 from '../models/level2'
import Level3 from '../models/level3'
import Ghost from '../models/ghost'

export default Ember.Component.extend(KeyboardShortcuts, Shared, {
  didInsertElement() {
    this.startNewLevel()
    this.loop()
  },

  score: 0,
  levelNumber: 1,
  lives: 3,

  startNewLevel() {
    let level = this.loadNewLevel()
    level.restart()
    this.set('level', level)

    let pac = Pac.create({
      level: level,
      x: this.get('level.startingPac.x'),
      y: this.get('level.startingPac.y')
    })
    this.set('pac', pac)

    let ghosts = level.get('startingGhosts').map((startingPosition) => {
      return Ghost.create({
        level: level,
        x: startingPosition.x,
        y: startingPosition.y,
        pac: pac
      })
    })
    this.set('ghosts', ghosts)
  },

  levels: [Level3, Level1, Level2],
  loadNewLevel() {
    let levelIndex = (this.get('levelNumber') - 1) % this.get('levels.length')
    let levelClass = this.get('levels')[levelIndex]
    return levelClass.create()
  },

  clearScreen() {
    let ctx = this.get('ctx')
    ctx.clearRect(0, 0, this.get('level.pixelWidth'), this.get('level.pixelHeight'))
  },

  keyboardShortcuts: {
    up()    { this.set('pac.intent', 'up');    },
    down()  { this.set('pac.intent', 'down');  },
    right() { this.set('pac.intent', 'right'); },
    left()  { this.set('pac.intent', 'left');  }
  },

  loop() {
    this.get('pac').move()
    this.get('ghosts').forEach(ghost => ghost.move() )

    this.processPellets()

    this.clearScreen()
    this.drawGrid()
    this.get('pac').draw()
    this.get('ghosts').forEach(ghost => ghost.draw() )

    let ghostCollisions = this.detectGhostCollisions()
    if (ghostCollisions.length > 0) {
      if (this.get('pac.powerMode')) {
        ghostCollisions.forEach( ghost => ghost.retreat() )
      } else {
        this.decrementProperty('lives')
        this.restart()
      }
    }
    Ember.run.later(this, this.loop, 1000/60)
  },

  drawGrid() {
    let ctx = this.get('ctx')
    ctx.fillStyle = '#000'

    let grid = this.get('level.grid')
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell === 1) {
          this.drawWall(columnIndex, rowIndex)
        }
        if (cell === 2) {
          this.drawPellet(columnIndex, rowIndex)
        }
        if (cell === 3) {
          this.drawPowerPellet(columnIndex, rowIndex)
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

  drawPellet(x, y) {
    let radiusDivisor = 6
    this.drawCircle(x, y, radiusDivisor, 'stopped')
  },

  drawPowerPellet(x, y) {
    let radiusDivisor = 4
    this.drawCircle(x, y, radiusDivisor, 'stopped', 'green')
  },

  processPellets() {
    let x = this.get('pac.x')
    let y = this.get('pac.y')
    let grid = this.get('level.grid')

    if (grid[y][x] === 2) {
      grid[y][x] = 0
      this.incrementProperty('score')

      if (this.get('level').isComplete()) {
        this.incrementProperty('levelNumber')
        this.startNewLevel()
      }
    } else if (grid[y][x] === 3) {
      grid[y][x] = 0
      this.set('pac.powerMode', true)
    }
  },

  detectGhostCollisions() {
    return this.get('ghosts').filter((ghost) => {
      return (this.get('pac.x') === ghost.get('x') &&
        this.get('pac.y') === ghost.get('y'))
    })
  },

  restart() {
    if (this.get('lives') <= 0) {
      this.set('score', 0)
      this.set('lives', 3)
      this.set('levelNumber', 1)
      this.startNewLevel()
    }
    this.get('pac').restart()
    this.get('ghosts').forEach( ghost => ghost.restart() )
  }
})
