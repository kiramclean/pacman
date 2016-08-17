import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Ember.Component.extend(KeyboardShortcuts, {
  x: 1,
  y: 2,
  squareSize: 30,
  score: 0,
  level: 1,

  didInsertElement() {
    this.drawGrid();
    this.drawPac();
  },

  directions: {
    'up':      { x:  0, y: -1 },
    'down':    { x:  0, y:  1 },
    'right':   { x:  1, y:  0 },
    'left':    { x: -1, y:  0 },
    'stopped': { x:  0, y:  0 }
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

  // dimensionMap: {
  //   x: 'screenWidth',
  //   y: 'screenHeight'
  // },
  //
  screenPixelWidth: Ember.computed(function() {
    return this.get('screenWidth') * this.get('squareSize');
  }),

  screenPixelHeight: Ember.computed(function() {
    return this.get('screenHeight') * this.get('squareSize');
  }),

  clearScreen() {
    let ctx = this.get('ctx');
    ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'));
  },

  keyboardShortcuts: {
    up() {
      this.movePacMan('up');
    },
    down() {
      this.movePacMan('down');
    },
    right() {
      this.movePacMan('right');
    },
    left() {
      this.movePacMan('left');
    },
  },

  movePacMan(direction, amount) {
    if (!this.pathBlocked(direction)) {
      this.set('x', this.nextCoordinate('x', direction));
      this.set('y', this.nextCoordinate('y', direction));

      this.processPellets();
    }

    this.clearScreen();
    this.drawGrid();
    this.drawPac();
  },

  pathBlocked(direction) {
    let cellType = this.cellType(direction);
    return Ember.isEmpty(cellType) || cellType === 1;
  },

  cellType(direction) {
    let nextX = this.nextCoordinate('x', direction);
    let nextY = this.nextCoordinate('y', direction);

    return this.get(`grid.${nextY}.${nextX}`)
  },

  nextCoordinate(coordinate, direction) {
    return this.get(coordinate) + this.get(`directions.${direction}.${coordinate}`);
  },

  // collidedWithBorder(direction) {
  //   let position = this.get(direction);
  //   let dimension = this.get('dimensionMap')[direction];
  //   let size = this.get(dimension);
  //   let pacOutOfBounds = position < 0 || position >= size;
  //   return pacOutOfBounds;
  // },
  //
  // loopAmount(direction, amount) {
  //   let dimension = this.get('dimensionMap')[direction];
  //   let heightOrWidth = this.get(dimension);
  //   return amount * heightOrWidth;
  // },
  //
  // collidedWithWall() {
  //   let x = this.get('x');
  //   let y = this.get('y');
  //   let grid = this.get('grid');
  //
  //   let hitWall = grid[y][x] === 1;
  //   return hitWall;
  // },
  //
  // 0 is empty, 1 is a wall, 2 is a pellet
  grid: [
    [1,2,2,2,2,2,2,1],
    [2,1,2,1,2,2,2,2],
    [1,2,1,2,2,2,2,1],
    [1,2,2,2,2,2,2,1],
    [2,2,2,2,2,2,2,2],
    [1,2,2,2,2,2,2,1]
  ],

  drawGrid() {
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

  drawWall(x, y) {
    let ctx = this.get('ctx');
    let squareSize = this.get('squareSize');

    ctx.fillStyle = '#000';
    ctx.fillRect(x * squareSize,
                 y * squareSize,
                 squareSize,
                 squareSize);
  },

  drawCircle(x, y, fraction) {
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

  drawPellet(x, y) {
    this.drawCircle(x, y, 6);
  },

  drawPac() {
    let x = this.get('x');
    let y = this.get('y');

    this.drawCircle(x, y, 2);
  },

  processPellets() {
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

  levelComplete() {
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

  restartLevel() {
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
