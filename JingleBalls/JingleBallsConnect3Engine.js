"use strict";

function JingleBallsConnect3Engine(boardSprite, boardRowCount, boardColumnCount, pieceSize, boardType, deadZones) {
    this.deadZones = deadZones;
    this.score = 0;

    CanvasConnect3Engine.call(this, boardSprite, boardRowCount, boardColumnCount, pieceSize, boardType);

    this.score = 0;
    this.targetScore = 50000;
}
JingleBallsConnect3Engine.prototype = Object.create(CanvasConnect3Engine.prototype);
JingleBallsConnect3Engine.prototype.constructor = JingleBallsConnect3Engine;

Object.defineProperties(JingleBallsConnect3Engine.prototype, {
    createPiece: {
        value: function createPiece(col, row, board) {
            for (var i = 0; i < this.deadZones.length; i++) {
                var deadZone = this.deadZones[i];
                if (deadZone.col === col && deadZone.row === row) {
                    return null;
                }
            }
            return CanvasConnect3Engine.prototype.createPiece.call(this, col, row, board);
        }
    },
    processPieces: {
        value: function processPieces(pieceArray, cascadeCount) {
            this.score += pieceArray.length * 100 * cascadeCount;

            return CanvasConnect3Engine.prototype.processPieces.call(this, pieceArray, cascadeCount);
        }
    },
    completion: {
        get: function get_completion() {
            return Math.min(1.0, (this.score / this.targetScore));
        }
    }
});

