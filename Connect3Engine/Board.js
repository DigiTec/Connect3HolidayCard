"use strict";

function Board(rowCount, columnCount, boardType) {
  this.rowCount = rowCount;
  this.columnCount = columnCount;
  this.boardType = boardType;
  this.columnArray = new Array();
}
Board.prototype = Object.create(null);
Board.prototype.constructor = Board;
