"use strict";

function CanvasConnect3Engine(
  boardSprite,
  boardRowCount,
  boardColumnCount,
  pieceSize,
  boardType
) {
  this.pieceSize = pieceSize;
  this.piecePadding = 5;
  this.boardSprite = boardSprite;

  Connect3Engine.call(this, boardRowCount, boardColumnCount, boardType);
}
CanvasConnect3Engine.prototype = Object.create(Connect3Engine.prototype);
CanvasConnect3Engine.prototype.constructor = CanvasConnect3Engine;

Object.defineProperties(CanvasConnect3Engine.prototype, {
  createPiece: {
    value: function createPiece(col, row, board) {
      var piece = Connect3Engine.prototype.createPiece.call(
        this,
        col,
        row,
        board
      );
      piece.sprite = new BoardSprite(piece, pieceFrame, this.pieceSize, this.piecePadding);
      return piece;
    }
  },
  initializeBoard: {
    value: function initializeBoard() {
      Connect3Engine.prototype.initializeBoard.call(this);

      // Once the board is ready, we can add the UI parts
      for (var i = 0; i < this.board.columnCount; i++) {
        var rowArray = this.board.columnArray[i];
        for (var j = 0; j < this.board.rowCount; j++) {
          var piece = rowArray[j];
          if (piece != null) {
            var sprite = piece.sprite;

            sprite.updatePositionFromPiece();
            this.boardSprite.children.push(sprite);
          }
        }
      }
    }
  },
  getUpdatedPositionFromIndex: {
    value: function getUpdatedPositionFromPiece(column, row) {
      return {
        x: column * this.pieceSize + column * this.piecePadding,
        y: row * this.pieceSize + row * this.piecePadding
      };
    }
  },
  processActionArray: {
    value: function processActionArray(actionArray, callbackComplete) {
      function _chainAnimations(activeAnimation, newAnimation) {
        if (activeAnimation) {
          var callbackComplete = activeAnimation.callbackComplete;
          activeAnimation.callbackComplete = function() {
            AnimationManager.addAnimation(newAnimation);
            if (callbackComplete) {
              callbackComplete.apply(null, arguments);
            }
          };
        } else {
          AnimationManager.addAnimation(newAnimation);
        }
        return newAnimation;
      }

      var activeAnimation;
      var lastCascade = -1;
      for (var i = 0; i < actionArray.length; i++) {
        var action = actionArray[i];
        switch (action.type) {
          case "swap":
            activeAnimation = _chainAnimations(
              activeAnimation,
              new SwapAnimation(
                this,
                action.firstPieceInfo,
                action.secondPieceInfo,
                0,
                250,
                null
              )
            );
            break;

          case "deadPieces":
            var animations = [];
            var duration = 500;
            for (
              var deadIndex = 0;
              deadIndex < action.deadPieces.length;
              deadIndex++
            ) {
              var deadPiece = action.deadPieces[deadIndex];
              var sprite = deadPiece.sprite;
              animations.push(
                new OpacityAnimation(
                  deadPiece.sprite,
                  1,
                  0,
                  0,
                  duration,
                  function(sprite) {
                    return function() {
                      this.boardSprite.children = this.boardSprite.children.filter(
                        function(elem) {
                          return elem !== sprite;
                        }
                      );
                    }.bind(this);
                  }.call(this, sprite)
                )
              );
            }
            activeAnimation = _chainAnimations(
              activeAnimation,
              new AnimationGroup(animations, null)
            );
            break;

          case "updatedPieces":
            var animations = [];
            lastCascade = action.cascadeCount;
            for (
              var updateIndex = 0;
              updateIndex < action.updatedPieces.length;
              updateIndex++
            ) {
              var updatedPieceInfo = action.updatedPieces[updateIndex];
              var sprite = updatedPieceInfo.piece.sprite;

              var startPosition = this.getUpdatedPositionFromIndex(
                updatedPieceInfo.sCol,
                updatedPieceInfo.sRow
              );
              var endPosition = this.getUpdatedPositionFromIndex(
                updatedPieceInfo.dCol,
                updatedPieceInfo.dRow
              );

              animations.push(
                new TranslationAnimation(
                  sprite,
                  startPosition.x,
                  startPosition.y,
                  endPosition.x,
                  endPosition.y,
                  0,
                  0,
                  null
                )
              );
            }
            activeAnimation = _chainAnimations(
              activeAnimation,
              new AnimationGroup(animations, null)
            );
            break;

          case "newPieces":
            var animations = [];
            for (
              var newIndex = 0;
              newIndex < action.newPieces.length;
              newIndex++
            ) {
              var newPieceInfo = action.newPieces[newIndex];
              var sprite = newPieceInfo.piece.sprite;

              var startPosition = this.getUpdatedPositionFromIndex(
                newPieceInfo.sCol,
                newPieceInfo.sRow
              );
              var endPosition = this.getUpdatedPositionFromIndex(
                newPieceInfo.dCol,
                newPieceInfo.dRow
              );

              var dropInAnimation = new TranslationAnimation(
                sprite,
                startPosition.x,
                startPosition.y,
                endPosition.x,
                endPosition.y,
                0,
                0,
                null
              );
              dropInAnimation.startCallback(
                function(sprite) {
                  return function() {
                    this.boardSprite.children.push(sprite);
                  }.bind(this);
                }.call(this, sprite)
              );
              animations.push(dropInAnimation);
            }
            if (action.cascadeCount === lastCascade) {
              activeAnimation.animations = activeAnimation.animations.concat(
                animations
              );
            } else {
              activeAnimation = _chainAnimations(
                activeAnimation,
                new AnimationGroup(animations, null)
              );
            }
            break;
        }
      }
      activeAnimation = _chainAnimations(
        activeAnimation,
        new Animation(null, 0, 0, callbackComplete)
      );
    }
  }
});
