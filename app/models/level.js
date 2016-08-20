import Ember from 'ember'

export default Ember.Object.extend({
  squareSize: 40,

  startingGhosts: [{
    x: 3,
    y: 3
  }, {
    x: 5,
    y:5
  }],

  startingPac: {
    x: 1,
    y: 0
  },

  ghostRetreat: {
    x: 2,
    y: 2
  },

  // 0 is empty, 1 is a wall, 2 is a pellet
  layout: [
    [2,2,2,2,2,2,1],
    [1,2,2,1,2,2,1],
    [1,2,1,1,2,2,1],
    [2,2,2,2,1,2,1],
    [2,2,2,1,1,2,1],
    [1,2,2,3,2,2,1],
  ],

  width:       Ember.computed(function() { return this.get('layout.firstObject.length')         } ),
  height:      Ember.computed(function() { return this.get('layout.length')                     } ),
  pixelWidth:  Ember.computed(function() { return this.get('width')  * this.get('squareSize') } ),
  pixelHeight: Ember.computed(function() { return this.get('height') * this.get('squareSize') } ),

  isComplete() {
    let hasPelletsLeft = false
    let grid = this.get('layout')

    grid.forEach((row) => {
      row.forEach((cell) => {
        if (this.isPellet(cell)) {
          hasPelletsLeft = true
        }
      })
    })
    return !hasPelletsLeft
  },

  isPellet(cell) {
    return cell === 2
  },

  restart() {
    var newLayout = jQuery.extend(true, [], this.get('layout'))
    this.set('layout', newLayout)
  }
})
