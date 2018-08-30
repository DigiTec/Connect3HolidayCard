"use strict";

function Piece(colorCode, columnNumber, rowNumber, board) {
  this.rowNumber = rowNumber;
  this.columnNumber = columnNumber;
  this.board = board;
  this.colorCode = colorCode;
  this._isDead = false;
}
Piece.prototype = Object.create(null);
Piece.prototype.constructor = Piece;

Object.defineProperties(Piece.prototype, {
  isEqual: {
    value: function isEqual(piece) {
      return this.colorCode === piece.colorCode;
    }
  },
  mark: {
    value: function mark(engine, source) {
      this._isDead = true;
    }
  },
  isDead: {
    get: function get_isDead() {
      return this._isDead;
    }
  }
});
