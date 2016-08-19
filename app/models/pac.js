import Ember from 'ember'
import Shared from '../mixins/shared'

export default Ember.Object.extend(Shared, {
  direction: 'down',
  intent: 'down',
  x: null,
  y: null,
  level: null,

  move() {
    if (this.animationComplete()) {
      this.finalizeMove()
      this.changeDirection()
    } else if (this.get('direction') === 'stopped') {
      this.changeDirection()
    } else {
      this.incrementProperty('frameCycle')
    }
  },

  animationComplete() {
    return this.get('frameCycle') === this.get('framesPerMovement')
  },

  finalizeMove() {
    let direction = this.get('direction')
    this.set('x', this.nextCoordinate('x', direction))
    this.set('y', this.nextCoordinate('y', direction))
    this.set('frameCycle', 1)
  },

  draw() {
    let x = this.get('x')
    let y = this.get('y')
    let radiusDivisor = 2
    this.drawCircle(x, y, radiusDivisor, this.get('direction'))
  },

  changeDirection() {
    let intent = this.get('intent')
    if (this.pathBlocked(intent)) {
      this.set('direction', 'stopped')
    } else {
      this.set('direction', intent)
    }
  },

  pathBlocked(direction) {
    let cellType = this.cellType(direction)
    let result = Ember.isEmpty(cellType) || cellType === 1
    return result
  },

  cellType(direction) {
    let nextX = this.nextCoordinate('x', direction)
    let nextY = this.nextCoordinate('y', direction)

    let result = this.get(`level.grid.${nextY}.${nextX}`)
    return result
  },

  nextCoordinate(coordinate, direction) {
    return this.get(coordinate) + this.get(`directions.${direction}.${coordinate}`)
  },

  restart() {
    this.set('x', this.get('level.startingPac.x'))
    this.set('y', this.get('level.startingPac.y'))
    this.set('frameCycle', 0)
    this.set('direction', 'stopped')
  }
});
