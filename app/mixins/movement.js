import Ember from 'ember';

export default Ember.Mixin.create({
  x: null,
  y: null,
  level: null,
  direction: 'down',
  powerMode: Ember.computed.gt('powerModeTime', 0),
  powerModeTime: 0,
  maxPowerModeTime: 400,
  timers: ['powerModeTime'],

  move() {
    if (this.get('removed')) {
      // do nothing, there is no ghost
    } else if (this.animationComplete()) {
      this.finalizeMove()
      this.changeDirection()
    } else if (this.get('direction') === 'stopped') {
      this.changeDirection()
    } else {
      this.incrementProperty('frameCycle')
    }
    this.tickTimers()
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

  pathBlocked(direction) {
    let cellType = this.cellType(direction)
    let result = Ember.isEmpty(cellType) || cellType === 1
    return result
  },

  cellType(direction) {
    let nextX = this.nextCoordinate('x', direction)
    let nextY = this.nextCoordinate('y', direction)

    let result = this.get(`level.layout.${nextY}.${nextX}`)
    return result
  },

  nextCoordinate(coordinate, direction) {
    let next = this.get(coordinate) + this.get(`directions.${direction}.${coordinate}`)
    if (this.get('level.teleport')) {
      if (direction === 'up' || direction === 'down') {
        return this.modulo(next, this.get('level.height'))
      } else {
        return this.modulo(next, this.get('level.width'))
      }
    } else {
      return next
    }
  },

  modulo(number, mod) {
    return ((number + mod) % mod)
  },

  tickTimers() {
    this.get('timers').forEach((timer) => {
      if (this.get(timer) > 0) {
          this.decrementProperty(timer)
      }
    })
  }
});
