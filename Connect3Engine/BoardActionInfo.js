"use strict";

function BoardAction() {}
BoardAction.prototype = Object.create(null);
BoardAction.prototype.constructor = BoardAction;

Object.defineProperties(SwapAction.prototype, {
  type: {
    value: "unknown"
  }
});

function SwapAction(piece1, piece2) {
  this.firstPieceInfo = {
    piece: piece1,
    col: piece1.columnNumber,
    row: piece1.rowNumber
  };
  this.secondPieceInfo = {
    piece: piece2,
    col: piece2.columnNumber,
    row: piece2.rowNumber
  };
}
SwapAction.prototype = Object.create(BoardAction.prototype);
SwapAction.prototype.constructor = SwapAction;

Object.defineProperties(SwapAction.prototype, {
  type: {
    value: "swap"
  }
});

function DeadPieceAction(cascadeCount, deadPieces, deadPieceScores) {
  this.cascadeCount = cascadeCount;
  this.deadPieces = deadPieces;
  this.deadPieceScores = deadPieceScores;
}
DeadPieceAction.prototype = Object.create(BoardAction.prototype);
DeadPieceAction.prototype.constructor = DeadPieceAction;

Object.defineProperties(DeadPieceAction.prototype, {
  type: {
    value: "deadPieces"
  }
});

function UpdatePieceAction(cascadeCount, updatedPieces) {
  this.cascadeCount = cascadeCount;
  this.updatedPieces = updatedPieces;
}
UpdatePieceAction.prototype = Object.create(BoardAction.prototype);
UpdatePieceAction.prototype.constructor = UpdatePieceAction;

Object.defineProperties(UpdatePieceAction.prototype, {
  type: {
    value: "updatedPieces"
  }
});

function NewPieceAction(cascadeCount, newPieces) {
  this.cascadeCount = cascadeCount;
  this.newPieces = newPieces;
}
NewPieceAction.prototype = Object.create(BoardAction.prototype);
NewPieceAction.prototype.constructor = NewPieceAction;

Object.defineProperties(NewPieceAction.prototype, {
  type: {
    value: "newPieces"
  }
});
