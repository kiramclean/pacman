import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Ember.Component.extend(KeyboardShortcuts, {
  x: 1,
  y: 2,
  squareSize: 30,
  score: 0,
  level: 1,

  didInsertElement: function() {
    this.drawGrid();
    this.drawPac();
  },

  ctx: Ember.computed(function() {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    return ctx;
  }),

  screenWidth: Ember.computed(function() {
    return this.get('grid.firstObject.length');
  }),

  screenHeight: Ember.computed(function() {
    return this.get('grid.length');
  }),

  dimensionMap: {
    x: 'screenWidth',
    y: 'screenHeight'
  },

  screenPixelWidth: Ember.computed(function() {
    return this.get('screenWidth') * this.get('squareSize');
  }),

  screenPixelHeight: Ember.computed(function() {
    return this.get('screenHeight') * this.get('squareSize');
  }),

  clearScreen: function() {
    let ctx = this.get('ctx');
    ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'));
  },

  keyboardShortcuts: {
    up: function() {
      this.movePacMan('y', -1);
    },
    down: function() {
      this.movePacMan('y', 1);
    },
    right: function() {
      this.movePacMan('x', 1);
    },
    left: function() {
      this.movePacMan('x', -1);
    },
  },

  movePacMan: function(direction, amount) {
    this.incrementProperty(direction, amount);

    if (this.collidedWithBorder(direction)) {
      this.decrementProperty(direction, this.loopAmount(direction, amount));
    }

    if (this.collidedWithWall(direction, amount)) {
      this.decrementProperty(direction, amount);
    }

    this.processPellets();
    this.clearScreen();
    this.drawGrid();
    this.drawPac();
  },

  collidedWithBorder: function(direction) {
    let position = this.get(direction);
    let dimension = this.get('dimensionMap')[direction];
    let size = this.get(dimension);
    let pacOutOfBounds = position < 0 || position >= size;
    return pacOutOfBounds;
  },

  loopAmount: function(direction, amount) {
    let dimension = this.get('dimensionMap')[direction];
    let heightOrWidth = this.get(dimension);
    return amount * heightOrWidth;
  },

  collidedWithWall: function() {
    let x = this.get('x');
    let y = this.get('y');
    let grid = this.get('grid');

    let hitWall = grid[y][x] === 1;
    return hitWall;
  },

  // 0 is empty, 1 is a wall, 2 is a pellet
  grid: [
    [1,2,2,2,2,2,2,1],
    [2,1,2,1,2,2,2,2],
    [1,2,1,2,2,2,2,1],
    [1,2,2,2,2,2,2,1],
    [2,2,2,2,2,2,2,2],
    [1,2,2,2,2,2,2,1]
  ],

  drawGrid: function() {
    let ctx = this.get('ctx');
    ctx.fillStyle = '#000';

    let grid = this.get('grid');
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell === 1) {
          this.drawWall(columnIndex, rowIndex);
        }
        if (cell === 2) {
          this.drawPellet(columnIndex, rowIndex);
        }
      });
    });
  },

  drawWall: function(x, y) {
    let ctx = this.get('ctx');
    let squareSize = this.get('squareSize');

    ctx.fillStyle = '#000';
    ctx.fillRect(x * squareSize,
                 y * squareSize,
                 squareSize,
                 squareSize);
  },

  drawCircle: function(x, y, fraction) {
    let ctx = this.get('ctx');
    let squareSize = this.get('squareSize');

    let pixelX = (x + 1/2) * squareSize;
    let pixelY = (y + 1/2) * squareSize;

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, squareSize/fraction, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  },

  drawPellet: function(x, y) {
    this.drawCircle(x, y, 6);
  },

  drawPac: function() {
    let x = this.get('x');
    let y = this.get('y');

    this.drawCircle(x, y, 2);
  },

  processPellets: function() {
    let x = this.get('x');
    let y = this.get('y');
    let grid = this.get('grid');

    if (grid[y][x] === 2) {
      grid[y][x] = 0;
      this.incrementProperty('score');

      if (this.levelComplete()) {
        this.incrementProperty('level');
        this.restartLevel();
      }
    }
  },

  levelComplete: function() {
    let hasPelletsLeft = false;
    let grid = this.get('grid');

    grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell === 2) {
          hasPelletsLeft = true;
        }
      });
    });

    return !hasPelletsLeft;
  },

  restartLevel: function() {
    this.set('x', 0);
    this.set('y', 0);

    let grid = this.get('grid');
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell === 0) {
          grid[rowIndex][columnIndex] = 2;
        }
      });
    });
  }
});
