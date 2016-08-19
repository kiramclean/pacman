import Ember from 'ember'
import Shared from '../mixins/shared'
import Movement from '../mixins/movement'

export default Ember.Object.extend(Shared, Movement, {
  direction: 'down',
  intent: 'down',
  powerMode: false,

  draw() {
    let x = this.get('x')
    let y = this.get('y')
    let radiusDivisor = 2
    let color = this.get('powerMode') ? '#AF0' : '#FE0'
    this.drawCircle(x, y, radiusDivisor, this.get('direction'), color)
  },

  changeDirection() {
    let intent = this.get('intent')
    if (this.pathBlocked(intent)) {
      this.set('direction', 'stopped')
    } else {
      this.set('direction', intent)
    }
  },

  restart() {
    this.set('x', this.get('level.startingPac.x'))
    this.set('y', this.get('level.startingPac.y'))
    this.set('frameCycle', 0)
    this.set('direction', 'stopped')
  }
});
