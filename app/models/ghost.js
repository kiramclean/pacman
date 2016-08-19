import Ember from 'ember'
import Shared from '../mixins/shared'

export default Ember.Object.extend(Shared, {
  x: null,
  y: null,
  direction: 'stopped',

  draw() {
    let x = this.get('x')
    let y = this.get('y')
    let radiusDivisor = 2
    this.drawCircle(x, y, radiusDivisor, this.get('direction'), '#f55')
    console.log('calling ghost draw')
  }
})
