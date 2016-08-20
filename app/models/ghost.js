import Ember from 'ember'
import Shared from '../mixins/shared'
import Movement from '../mixins/movement'

export default Ember.Object.extend(Shared, Movement, {
  init() {
    this.set('startingX', this.get('x'))
    this.set('startingY', this.get('y'))
    return this._super(...arguments)
  },

  x: null,
  y: null,
  removed: Ember.computed.gt('retreatTime', 0),
  retreatTime: 0,
  maxRetreatTime: 500,
  timers: ['retreatTime'],

  draw() {
    let x = this.get('x')
    let y = this.get('y')
    let radiusDivisor = 2
    this.drawCircle(x, y, radiusDivisor, this.get('direction'), this.get('color'))
  },

  color: Ember.computed('retreatTime', function() {
    let timerPercentage = this.get('retreatTime') / this.get('maxRetreatTime')
    let retreated = {r: 0, g:0, b:0}
    let normal = {r:100, g:40, b:40}
    let [r, g, b] = ['r', 'g', 'b'].map(function(rgbSelector) {
      let color = retreated[rgbSelector] * timerPercentage +
                  normal[rgbSelector] * (1 - timerPercentage)
      return Math.round(color)
    })
    return `rgb(${r}%,${g}%,${b}%)`
  }),

  changeDirection() {
    let directions = ['left', 'right', 'up', 'down']
    let directionWeights = directions.map((direction) => {
      return this.chanceOfPacMan(direction)
    })

    let bestDirection = this.getRandomItem(directions, directionWeights)
    this.set('direction', bestDirection)
  },

  chanceOfPacMan(direction) {
    if (this.pathBlocked(direction)) {
      return 0
    } else {
      let desirabilityOfDirection = ((this.get('pac.y') - this.get('y')) * this.get(`directions.${direction}.y`)) +
      ((this.get('pac.x') - this.get('x')) * this.get(`directions.${direction}.x`))

      if (this.get('pac.powerMode')) {
        desirabilityOfDirection *= -1
      }
      return Math.max(desirabilityOfDirection, 0) + 0.2
    }
  },

  getRandomItem(list, weights) {
    var totalWeight = weights.reduce(function(prev, curr) {
      return prev + curr
    })

    var randomNum = Math.random() * totalWeight
    var weightSum = 0

    for (var i = 0; i < list.length; i++) {
      weightSum += weights[i]
      weightSum = Number(weightSum.toFixed(2))

      if (randomNum < weightSum) {
        return list[i]
      }
    }
  },

  restart() {
    this.set('x', this.get('startingX'))
    this.set('y', this.get('startingY'))
    this.set('frameCycle', 0)
    this.set('direction', 'stopped')
  },

  retreat() {
    this.set('retreatTime', this.get('maxRetreatTime'))
    this.set('frameCycle', 0)
    this.set('x', this.get('level.ghostRetreat.x'))
    this.set('y', this.get('level.ghostRetreat.y'))
  }
})
