import Ember from 'ember';

export default Ember.Mixin.create({
  frameCycle: 1,
  framesPerMovement: 30,
  squareSize: 40,

  ctx: Ember.computed(function() {
    let canvas = document.getElementById('canvas')
    let ctx = canvas.getContext('2d')
    return ctx
  }),

  drawCircle(x, y, radiusDivisor, direction) {
    let ctx = this.get('ctx')
    let squareSize = this.get('squareSize')

    let pixelX = (x + 1/2 + this.offsetFor('x', direction)) * squareSize
    let pixelY = (y + 1/2 + this.offsetFor('y', direction)) * squareSize

    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.arc(pixelX, pixelY, squareSize/radiusDivisor, 0, Math.PI * 2, false)
    ctx.closePath()
    ctx.fill()
  },

  offsetFor(coordinate, direction) {
    let frameRatio = this.get('frameCycle') / this.get('framesPerMovement')
    return this.get(`directions.${direction}.${coordinate}`) * frameRatio
  },

  directions: {
    'up':      { x:  0, y: -1 },
    'down':    { x:  0, y:  1 },
    'right':   { x:  1, y:  0 },
    'left':    { x: -1, y:  0 },
    'stopped': { x:  0, y:  0 }
  }
});