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

  draw() {
    let x = this.get('x')
    let y = this.get('y')
    let radiusDivisor = 2
    this.drawCircle(x, y, radiusDivisor, this.get('direction'), '#f55')
  },

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
      let chances = ((this.get('pac.y') - this.get('y')) * this.get(`directions.${direction}.y`)) +
      ((this.get('pac.x') - this.get('x')) * this.get(`directions.${direction}.x`))

      return Math.max(chances, 0) + 0.2
    }
  },

  getRandomItem(list, weights) {
    var totalWeight = weights.reduce(function(prev, curr, i, arr) {
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
  }
})
