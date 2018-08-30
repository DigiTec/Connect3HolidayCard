"use strict";

function Iterator() {}
Iterator.prototype = Object.create(null);
Iterator.prototype.constructor = Iterator;

// Static constructor properties
Object.defineProperties(Iterator, {
  TYPE_VERT_DOWN: { value: 1 },
  TYPE_VERT_UP: { value: 2 },
  TYPE_HORZ_RIGHT: { value: 3 },
  TYPE_HORZ_LEFT: { value: 4 },
  TYPE_DIAG_LEFTTORIGHT_FORWARD: { value: 5 },
  TYPE_DIAG_LEFTTORIGHT_BACKWARD: { value: 6 },
  TYPE_DIAG_RIGHTTOLEFT_FORWARD: { value: 7 },
  TYPE_DIAG_RIGHTTOLEFT_BACKWARD: { value: 8 }
});

Object.defineProperties(Iterator.prototype, {
  moveNext: {
    value: function moveNext() {
      return this.internalNav();
    }
  },
  moveNextVertical: {
    value: function moveNextVertical() {
      if (this.complete) {
        return false;
      }

      this.currentRow += this.rowOffset;
      if (this.currentRow >= this.rowCount || this.currentRow < 0) {
        this.complete = true;
      }
      return !this.complete;
    }
  },
  moveNextHorizontal: {
    value: function moveNextHorizontal() {
      if (this.complete) {
        return false;
      }

      this.currentCol += this.colOffset;
      if (this.currentCol >= this.colCount || this.currentCol < 0) {
        this.complete = true;
      }
      return !this.complete;
    }
  },
  indexOutOfBounds: {
    value: function indexOutOfBounds() {
      if (
        this.currentRow >= 0 &&
        this.currentCol >= 0 &&
        this.currentRow < this.board.rowCount &&
        this.currentCol < this.board.columnCount
      ) {
        return false;
      } else {
        return true;
      }
    }
  },
  setPiece: {
    value: function setPiece(piece) {
      if (piece !== null) {
        piece.columnNumber = this.currentCol;
        piece.rowNumber = this.currentRow;
      }
      this.board.columnArray[this.currentCol][this.currentRow] = piece;
    }
  }
});

function PositionIterator() {}
PositionIterator.prototype = Object.create(Iterator.prototype);
PositionIterator.prototype.constructor = PositionIterator;

Object.defineProperties(PositionIterator.prototype, {
  setCurrentOffset: {
    value: function setCurrentOffset(columnOffset, rowOffset) {
      this.currentCol = columnOffset;
      this.currentRow = rowOffset;
    }
  },
  moveNext: {
    value: function moveNext() {
      this.complete = false;
      this.internalNav();
    }
  },
  indexOutOfBounds: {
    value: function indexOutOfBounds() {
      return false;
    }
  }
});

Iterator.prototype.Initialize = function(board, type, iteratorIndex) {
  this.board = board;
  this.rowCount = this.board.rowCount;
  this.colCount = this.board.columnCount;
  this.type = type;
  switch (type) {
    case Iterator.TYPE_VERT_DOWN:
      this.internalNav = this.moveNextVertical;
      this.rowOffset = 1;
      this.currentCol = iteratorIndex;
      this.currentRow = -1;
      break;
    case Iterator.TYPE_VERT_UP:
      this.internalNav = this.moveNextVertical;
      this.rowOffset = -1;
      this.currentCol = iteratorIndex;
      this.currentRow = this.rowCount;
      break;
    case Iterator.TYPE_HORZ_RIGHT:
      this.internalNav = this.moveNextHorizontal;
      this.colOffset = 1;
      this.currentCol = -1;
      this.currentRow = iteratorIndex;
      break;
    case Iterator.TYPE_HORZ_LEFT:
      this.internalNav = this.moveNextHorizontal;
      this.colOffset = -1;
      this.currentCol = this.colCount;
      this.currentRow = iteratorIndex;
      break;
    case Iterator.TYPE_DIAG_LEFTTORIGHT_FORWARD:
      this.internalNav = this.MoveNextDiagonal;
      this.colOffset = 1;
      this.rowOffset = -1;
      this.currentCol = -1;
      this.currentRow = iteratorIndex;
      break;
    case Iterator.TYPE_DIAG_LEFTTORIGHT_BACKWARD:
      this.internalNav = this.MoveNextDiagonal;
      this.colOffset = -1;
      this.rowOffset = 1;
      this.currentCol = this.colCount;
      this.currentRow = iteratorIndex;
      break;
    case Iterator.TYPE_DIAG_RIGHTTOLEFT_FORWARD:
      this.internalNav = this.MoveNextDiagonal;
      this.colOffset = -1;
      this.rowOffset = -1;
      this.currentCol = this.colCount;
      this.currentRow = iteratorIndex + 1;
      break;
    case Iterator.TYPE_DIAG_RIGHTTOLEFT_BACKWARD:
      this.internalNav = this.MoveNextDiagonal;
      this.colOffset = 1;
      this.rowOffset = 1;
      this.currentCol = -1;
      this.currentRow = iteratorIndex + 1;
      break;
  }
  this.initialized = true;
  this.complete = false;
};

Iterator.prototype.Current = function() {
  if (!this.complete) {
    var currentPiece;
    if (!this.indexOutOfBounds()) {
      currentPiece = this.board.columnArray[this.currentCol][this.currentRow];
      if (currentPiece) {
        return currentPiece; // current piece can be null or a piece
      } else {
        return null;
      }
    } else {
      return undefined;
    }
  } else {
    throw "Access to iterator after complete";
  }
};

Iterator.prototype.MoveNextVertical = function() {
  if (this.complete) {
    return false;
  }

  this.currentRow += this.rowOffset;
  if (this.currentRow >= this.rowCount || this.currentRow < 0) {
    this.complete = true;
  }
  return !this.complete;
};

Iterator.prototype.MoveNextDiagonal = function() {
  if (this.complete) {
    return false;
  }

  do {
    this.currentCol += this.colOffset;
    if (
      this.type == Iterator.TYPE_DIAG_LEFTTORIGHT_FORWARD ||
      this.type == Iterator.TYPE_DIAG_RIGHTTOLEFT_FORWARD
    ) {
      this.currentRow += this.currentCol % 2 ? this.rowOffset : 0;
    } else {
      this.currentRow += this.currentCol % 2 ? 0 : this.rowOffset;
    }
    if (this.currentCol >= this.colCount || this.currentCol < 0) {
      this.complete = true;
    }
  } while (this.indexOutOfBounds() && !this.complete);

  return !this.complete;
};
