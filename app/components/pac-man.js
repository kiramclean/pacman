import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Ember.Component.extend(KeyboardShortcuts, {
  didInsertElement: function() {
    this.drawCircle();
  },
  movePacMan: function(direction, amount) {
    this.incrementProperty(direction, amount);
    this.clearScreen();
    this.drawCircle();
  },
  ctx: Ember.computed(function() {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    return ctx;
  }),
  x: 50,
  y: 100,
  squareSize: 40,
  clearScreen: function() {
    let ctx = this.get('ctx');
    let screenWidth = 800;
    let screenHeight = 600;
    ctx.clearRect(0, 0, screenWidth, screenHeight);
  },
  drawCircle: function() {
    let ctx = this.get('ctx');
    let x = this.get('x');
    let y = this.get('y');
    let radius = this.get('squareSize')/2;

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  },
  keyboardShortcuts: {
    up: function() {
      this.movePacMan('y', -1 * this.get('squareSize'));
    },
    down: function() {
      this.movePacMan('y', this.get('squareSize'));
    },
    right: function() {
      this.movePacMan('x', this.get('squareSize'));
    },
    left: function() {
      this.movePacMan('x', -1 * this.get('squareSize'));
    },
  }
});
