"use strict";

function Connect3Engine(boardRowCount, boardColumnCount, boardType) {
  // Data storage
  this.board = new Board(boardRowCount, boardColumnCount, boardType);

  // Board update action array
  this.cascadeDirection = "vertical-TTB";

  // Initialize and stabilize the board
  this.initializeBoard();
}
Connect3Engine.prototype = Object.create(null);
Connect3Engine.prototype.constructor = Connect3Engine;

Object.defineProperties(Connect3Engine.prototype, {
  createPiece: {
    value: function createPiece(col, row, board) {
      var colorCode = parseInt(Math.random() * 5);
      return new Piece(colorCode, col, row, board);
    }
  },
  comparePieces: {
    value: function comparePieces(i, j, k) {
      if (k) {
        return i.isEqual(j) && i.isEqual(k);
      } else {
        return i.isEqual(j);
      }
    }
  },
  initializeBoard: {
    value: function initializeBoard() {
      for (var i = 0; i < this.board.columnCount; i++) {
        var rowArray = new Array();
        for (var j = 0; j < this.board.rowCount; j++) {
          rowArray[j] = this.createPiece(i, j, this.board);
        }

        this.board.columnArray.push(rowArray);
      }
      this.updateBoard([]);
      return this.board;
    }
  },
  clearSelectedPieces: {
    value: function clearSelectedPieces() {
      this.board.selectedPieceArray[0] = null;
      this.board.selectedPieceArray[1] = null;
    }
  },
  allowSwapBack: {
    value: function allowSwapBack() {
      return true;
    }
  },
  allowSwap: {
    value: function allowSwap(piece1, piece2) {
      if (this.board.boardType === "square") {
        var p1Col = piece1.columnNumber;
        var p1Row = piece1.rowNumber;
        var colDiff = Math.abs(p1Col - piece2.columnNumber);
        var rowDiff = Math.abs(p1Row - piece2.rowNumber);

        if (
          (colDiff === 1 || rowDiff === 1) &&
          (colDiff === 0 || rowDiff === 0)
        ) {
          return true;
        }
      }
      return false;
    }
  },
  swapPiece: {
    value: function swapPiece(piece1, piece2) {
      function _boardSwap(piece1, piece2) {
        var p1Col = piece1.columnNumber;
        var p1Row = piece1.rowNumber;

        piece1.columnNumber = piece2.columnNumber;
        piece1.rowNumber = piece2.rowNumber;
        piece2.columnNumber = p1Col;
        piece2.rowNumber = p1Row;

        this.board.columnArray[piece1.columnNumber][piece1.rowNumber] = piece1;
        this.board.columnArray[piece2.columnNumber][piece2.rowNumber] = piece2;
      }

      var boardActionArray = [];
      if (this.allowSwap(piece1, piece2)) {
        // Register the swap, swap the piece and update the board
        boardActionArray.push(new SwapAction(piece1, piece2));
        _boardSwap.call(this, piece1, piece2);
        var cascadeCount = this.updateBoard(boardActionArray);

        // Register a swap back and swap the pieces back if there are no matches
        if (cascadeCount === 0 && this.allowSwapBack()) {
          boardActionArray.push(new SwapAction(piece1, piece2));
          _boardSwap.call(this, piece1, piece2);
        }
      }
      return boardActionArray;
    }
  },
  processPieceClick: {
    value: function processPieceClick(columnNumber, rowNumber) {
      var data = new Object();
      data.columnNumber = columnNumber;
      data.rowNumber = rowNumber;

      //if no piece has selected yet
      if (
        this.board.selectedPieceArray[0] == null &&
        this.board.selectedPieceArray[1] == null
      ) {
        this.board.selectedPieceArray[0] = data;
      } else {
        //if one piece has selected already
        //if piece 0 is empty, move the piece 1 to piece 0
        if (
          this.board.selectedPieceArray[0] == null &&
          this.board.selectedPieceArray[1] != null
        ) {
          this.board.selectedPieceArray[0] = this.board.selectedPieceArray[1];
          this.board.selectedPieceArray[1] = null;
        } else {
          //if the clicked piece is the same as the selected piece, unselect the piece
          if (this.board.selectedPieceArray[0] == data) {
            this.board.selectedPieceArray[0] = null;
          } else {
            this.board.selectedPieceArray[1] = data;
            //now verify whether the two pieces are adjacent
            if (this.board.boardType === "hex") {
              var columnDiff =
                parseInt(data.columnNumber) -
                parseInt(this.board.selectedPieceArray[0].columnNumber);
              var rowDiff =
                parseInt(data.rowNumber) -
                parseInt(this.board.selectedPieceArray[0].rowNumber);

              if (
                (columnDiff == 0 && Math.abs(rowDiff) == 1) ||
                (rowDiff == 0 && Math.abs(columnDiff) == 1) ||
                (parseInt(data.columnNumber) % 2 == 1 &&
                  Math.abs(columnDiff) == 1 &&
                  rowDiff == -1) ||
                (parseInt(data.columnNumber) % 2 == 0 &&
                  Math.abs(columnDiff) == 1 &&
                  rowDiff == 1)
              ) {
                //1. first, swap and register swap in the action array
                var piece1ColumnNumber = parseInt(
                  this.board.selectedPieceArray[0].columnNumber
                );
                var piece1RowNumber = parseInt(
                  this.board.selectedPieceArray[0].rowNumber
                );
                var piece2ColumnNumber = parseInt(
                  this.board.selectedPieceArray[1].columnNumber
                );
                var piece2RowNumber = parseInt(
                  this.board.selectedPieceArray[1].rowNumber
                );

                //register
                this.boardActionArray.push(
                  new SwapAction(
                    this.board.selectedPieceArray[0],
                    this.board.selectedPieceArray[1]
                  )
                );

                //swap
                var piece1Copy = this.board.columnArray[piece1ColumnNumber][
                  piece1RowNumber
                ];
                this.board.columnArray[piece1ColumnNumber][
                  piece1RowNumber
                ] = this.board.columnArray[piece2ColumnNumber][piece2RowNumber];
                this.board.columnArray[piece2ColumnNumber][
                  piece2RowNumber
                ] = piece1Copy;

                this.board.columnArray[piece1ColumnNumber][
                  piece1RowNumber
                ].columnNumber = piece1ColumnNumber;
                this.board.columnArray[piece1ColumnNumber][
                  piece1RowNumber
                ].rowNumber = piece1RowNumber;
                this.board.columnArray[piece2ColumnNumber][
                  piece2RowNumber
                ].columnNumber = piece2ColumnNumber;
                this.board.columnArray[piece2ColumnNumber][
                  piece2RowNumber
                ].rowNumber = piece2RowNumber;

                //2. second, update board to see whether there is any possible cascade
                this.getCascadeDirection();
                var cascadeCount = this.updateBoard();

                // if no update happened to board, register swap back action
                if (cascadeCount === 0) {
                  // register
                  this.boardActionArray.push(
                    new SwapAction(
                      this.board.selectedPieceArray[0],
                      this.board.selectedPieceArray[1]
                    )
                  );

                  // swap
                  var piece1Copy = this.board.columnArray[piece1ColumnNumber][
                    piece1RowNumber
                  ];
                  this.board.columnArray[piece1ColumnNumber][
                    piece1RowNumber
                  ] = this.board.columnArray[piece2ColumnNumber][
                    piece2RowNumber
                  ];
                  this.board.columnArray[piece2ColumnNumber][
                    piece2RowNumber
                  ] = piece1Copy;

                  this.board.columnArray[piece1ColumnNumber][
                    piece1RowNumber
                  ].columnNumber = piece1ColumnNumber;
                  this.board.columnArray[piece1ColumnNumber][
                    piece1RowNumber
                  ].rowNumber = piece1RowNumber;
                  this.board.columnArray[piece2ColumnNumber][
                    piece2RowNumber
                  ].columnNumber = piece2ColumnNumber;
                  this.board.columnArray[piece2ColumnNumber][
                    piece2RowNumber
                  ].rowNumber = piece2RowNumber;
                }
                this.board.selectedPieceArray[0] = null;
                this.board.selectedPieceArray[1] = null;
              } else {
                this.board.selectedPieceArray[0] = null;
                this.board.selectedPieceArray[1] = null;
              }
            } else {
              alert("not hex board case!");
              this.board.selectedPieceArray[0] = null;
              this.board.selectedPieceArray[1] = null;
            }
          }
        }
      }
      return this.boardActionArray;
    }
  },
  eraseSingleColor: {
    value: function eraseSingleColor(color) {
      this.erasingSingleColor = color;
      this.cascadeDirection = "vertical-TTB";
      this.updateBoard();
      return this.boardActionArray;
    }
  },
  turnColorAToColorB: {
    value: function turnColorAToColorB(
      colorOriginal,
      colorBecome,
      updatedPieceInfoArray /*out*/
    ) {
      // scan through the entire board to switch one color to another
      var pieceArray = this.board.columnArray;
      for (var i = 0; i < pieceArray.length; i++) {
        for (var j = 0; j < pieceArray[i].length; j++) {
          if (
            pieceArray[i][j] != null &&
            pieceArray[i][j].colorCode == colorOriginal
          ) {
            pieceArray[i][j].colorCode = colorBecome;
            updatedPieceInfoArray.push([i, j, pieceArray[i][j].colorCode]);
          }
        }
      }

      // do cascade
      this.cascadeDirection = "vertical-TTB";
      this.updateBoard();
      return this.boardActionArray;
    }
  },
  getCascadeDirection: {
    value: function getCascadeDirection() {
      var piece1 = this.board.selectedPieceArray[0];
      var piece2 = this.board.selectedPieceArray[1];

      if (this.board.boardType === "square") {
        this.cascadeDirection = "vertical-TTB";
      } else if (this.board.boardType === "hex") {
        if (piece1.columnNumber % 2 == 0) {
          if (
            piece2.columnNumber == piece1.columnNumber &&
            piece2.rowNumber > piece1.rowNumber
          ) {
            this.cascadeDirection = "vertical-TTB";
          } else if (
            piece2.columnNumber == piece1.columnNumber &&
            piece2.rowNumber < piece1.rowNumber
          ) {
            this.cascadeDirection = "vertical-BTT";
          } else if (
            piece2.columnNumber > piece1.columnNumber &&
            piece2.rowNumber < piece1.rowNumber
          ) {
            this.cascadeDirection = "counterDiagnol-LTR";
          } else if (
            piece2.columnNumber > piece1.columnNumber &&
            piece2.rowNumber == piece1.rowNumber
          ) {
            this.cascadeDirection = "diagnol-LTR";
          } else if (
            piece2.columnNumber < piece1.columnNumber &&
            piece2.rowNumber < piece1.rowNumber
          ) {
            this.cascadeDirection = "diagnol-RTL";
          } else if (
            piece2.columnNumber < piece1.columnNumber &&
            piece2.rowNumber == piece1.rowNumber
          ) {
            this.cascadeDirection = "counterDiagnol-RTL";
          } else {
            alert("Error: can't decide cascadeDirection!");
          }
        } else {
          if (
            piece2.columnNumber == piece1.columnNumber &&
            piece2.rowNumber > piece1.rowNumber
          ) {
            this.cascadeDirection = "vertical-TTB";
          } else if (
            piece2.columnNumber == piece1.columnNumber &&
            piece2.rowNumber < piece1.rowNumber
          ) {
            this.cascadeDirection = "vertical-BTT";
          } else if (
            piece2.columnNumber > piece1.columnNumber &&
            piece2.rowNumber == piece1.rowNumber
          ) {
            this.cascadeDirection = "counterDiagnol-LTR";
          } else if (
            piece2.columnNumber > piece1.columnNumber &&
            piece2.rowNumber > piece1.rowNumber
          ) {
            this.cascadeDirection = "diagnol-LTR";
          } else if (
            piece2.columnNumber < piece1.columnNumber &&
            piece2.rowNumber == piece1.rowNumber
          ) {
            this.cascadeDirection = "diagnol-RTL";
          } else if (
            piece2.columnNumber < piece1.columnNumber &&
            piece2.rowNumber > piece1.rowNumber
          ) {
            this.cascadeDirection = "counterDiagnol-RTL";
          } else {
            alert("Error: can't decide cascadeDirection!");
          }
        }
      }
    }
  },
  updateBoard: {
    value: function updateBoard(boardActionArray) {
      var cascadeCount = 0;
      do {
        var deadPieceArray = this.markOffPiecesFromArray(cascadeCount + 1);
        if (deadPieceArray.length > 0) {
          cascadeCount++;

          // Register fade out action
          boardActionArray.push(
            new DeadPieceAction(
              cascadeCount,
              deadPieceArray,
              this.deadPieceScores
            )
          );

          // Compact the board column array
          this.compactBoardColumnArray(boardActionArray, cascadeCount);

          // Fill in the missing piece into the this.board
          this.fillNewPieces(boardActionArray, cascadeCount);
        }
      } while (deadPieceArray.length > 0);

      return cascadeCount;
    }
  },
  markOffPiecesFromArray: {
    value: function markOffPiecesFromArray(cascadeCount) {
      var deadPieceArray = new Array();
      this.deadPieceScores = new Array();

      // this is normal cascading loop, piece are dead because of 3 or more same colors in a row/column/diagnal/counter diagnal
      if (typeof this.erasingSingleColor === "undefined") {
        //now mark off piece from vertical point of view
        var directionArray;
        var endIndexArray;
        if (this.board.boardType === "hex") {
          directionArray = [
            Iterator.TYPE_VERT_DOWN,
            Iterator.TYPE_DIAG_LEFTTORIGHT_FORWARD,
            Iterator.TYPE_DIAG_RIGHTTOLEFT_FORWARD
          ];
          endIndexArray = [
            this.board.columnCount,
            this.board.rowCount + parseInt(this.board.columnCount / 2),
            this.board.rowCount + parseInt((this.board.columnCount - 1) / 2)
          ];
        } else {
          directionArray = [Iterator.TYPE_VERT_DOWN, Iterator.TYPE_HORZ_RIGHT];
          endIndexArray = [this.board.columnCount, this.board.rowCount];
        }

        //need to check all 3 directions
        for (var j = 0; j < directionArray.length; j++) {
          for (var i = 0; i < endIndexArray[j]; i++) {
            var iter = new Iterator();
            iter.Initialize(this.board, directionArray[j], i);

            var runArray = [];
            while (iter.moveNext()) {
              var curPiece = iter.Current();
              if (curPiece != null) {
                if (runArray.length > 0) {
                  if (!this.comparePieces(runArray[0], curPiece)) {
                    if (runArray.length >= 3) {
                      this.processPieces(runArray, cascadeCount);
                    }
                    runArray = [];
                  }
                }
                runArray.push(curPiece);
              } else if (runArray.length >= 3) {
                this.processPieces(runArray, cascadeCount);
              }
            }

            if (runArray.length >= 3) {
              this.processPieces(runArray, cascadeCount);
            }
          }
        }

        var columnArray = this.board.columnArray;
        for (var i = 0; i < columnArray.length; i++) {
          var rowArray = columnArray[i];
          for (var j = 0; j < rowArray.length; j++) {
            var piece = rowArray[j];
            if (piece != null) {
              delete piece.marked;
              if (piece.isDead) {
                rowArray[j] = null;
                deadPieceArray.push(piece);
              }
            }
          }
        }
      } else {
        // This is in erasing single color piece mode. Piece are dead because the board is getting rid of all pieces of a specific color
        var pieceArray = this.board.columnArray;

        //now test whether there is still empty space left
        for (var i = 0; i < pieceArray.length; i++) {
          for (var j = 0; j < pieceArray[i].length; j++) {
            if (
              pieceArray[i][j] != null &&
              pieceArray[i][j].colorCode == this.erasingSingleColor
            ) {
              pieceArray[i][j].markDead(this);
              deadPieceArray.push(pieceArray[i][j]);
            }
          }
        }
        this.deadPieceScores.push({
          lastColor: this.erasingSingleColor,
          currentCount: deadPieceArray.length
        });
        delete this.erasingSingleColor;
      }
      return deadPieceArray;
    }
  },
  processPieces: {
    value: function processPieces(pieces) {
      for (var i = 0; i < pieces.length; i++) {
        pieces[i].mark(this);
      }
    }
  },
  getCompactInfo: {
    value: function getCompactInfo() {
      var compactInfo = new Object();
      switch (this.cascadeDirection) {
        case "vertical-TTB":
          compactInfo.direction = Iterator.TYPE_VERT_UP;
          compactInfo.startIndex = 0;
          compactInfo.endIndex = this.board.columnCount;
          break;

        case "vertical-BTT":
          compactInfo.direction = Iterator.TYPE_VERT_DOWN;
          compactInfo.startIndex = 0;
          compactInfo.endIndex = this.board.columnCount;
          break;

        case "diagnol-LTR":
          compactInfo.direction = Iterator.TYPE_DIAG_RIGHTTOLEFT_FORWARD;
          compactInfo.startIndex = 0;
          compactInfo.endIndex =
            this.board.rowCount + parseInt((this.board.columnCount - 1) / 2);
          break;

        case "diagnol-RTL":
          compactInfo.direction = Iterator.TYPE_DIAG_RIGHTTOLEFT_BACKWARD;
          compactInfo.startIndex = -5;
          compactInfo.endIndex = this.board.rowCount;
          break;

        case "counterDiagnol-LTR":
          compactInfo.direction = Iterator.TYPE_DIAG_LEFTTORIGHT_BACKWARD;
          compactInfo.startIndex = -5;
          compactInfo.endIndex = this.board.rowCount;
          break;

        case "counterDiagnol-RTL":
          compactInfo.direction = Iterator.TYPE_DIAG_LEFTTORIGHT_FORWARD;
          compactInfo.startIndex = 0;
          compactInfo.endIndex =
            this.board.rowCount + parseInt(this.board.columnCount / 2);
          break;
      }

      return compactInfo;
    }
  },
  compactBoardColumnArray: {
    value: function compactBoardColumnArray(boardActionArray, cascadeCount) {
      var slideInPieceArray = [];

      var compactInfo = this.getCompactInfo();
      for (var i = compactInfo.startIndex; i < compactInfo.endIndex; i++) {
        var iterBefore = new Iterator();
        var iterAfter = new Iterator();

        // Start both iterators at the same location.
        iterBefore.Initialize(this.board, compactInfo.direction, i);
        iterAfter.Initialize(this.board, compactInfo.direction, i);

        // Advance equally until we find a null piece.
        iterAfter.moveNext();
        while (iterBefore.moveNext()) {
          if (iterBefore.Current() === null) {
            break;
          }
          iterAfter.moveNext();
        }

        // Compact the remaining slots
        while (iterBefore.moveNext()) {
          var pieceBefore = iterBefore.Current();
          if (pieceBefore != null) {
            slideInPieceArray.push({
              piece: pieceBefore,
              dCol: iterAfter.currentCol,
              dRow: iterAfter.currentRow,
              sCol: iterBefore.currentCol,
              sRow: iterBefore.currentRow
            });
            iterBefore.setPiece(null);
            iterAfter.setPiece(pieceBefore);
            iterAfter.moveNext();
          }
        }
      }

      //now make sure the pieces know their current position
      this.updatePositionInfoForAllPieces();

      // register slide in action
      boardActionArray.push(
        new UpdatePieceAction(cascadeCount, slideInPieceArray)
      );
    }
  },
  fillNewPieces: {
    value: function fillNewPieces(boardActionArray, cascadeCount) {
      var newPieceArray = new Array();
      var oldPieceArray = new Array();

      //now find out the mising pieces
      var compactInfo = this.getCompactInfo();
      var newPieceOffset = 0;

      for (var i = compactInfo.startIndex; i < compactInfo.endIndex; i++) {
        var iter = new Iterator();
        iter.Initialize(this.board, compactInfo.direction, i);

        while (iter.moveNext()) {
          var curPiece = iter.Current();
          if (curPiece === null) {
            curPiece = this.createPiece(
              iter.currentCol,
              iter.currentRow,
              this.board
            );
            iter.setPiece(curPiece);
            if (curPiece !== null) {
              newPieceArray.push({
                piece: curPiece,
                dCol: curPiece.columnNumber,
                dRow: curPiece.rowNumber
              });
            }
          }
        }
        if (newPieceOffset < newPieceArray.length) {
          var lastPiece = newPieceArray[newPieceArray.length - 1];
          var positionIterator = new PositionIterator();
          positionIterator.Initialize(this.board, compactInfo.direction, i);
          positionIterator.setCurrentOffset(lastPiece.dCol, lastPiece.dRow);

          for (; newPieceOffset < newPieceArray.length; newPieceOffset++) {
            positionIterator.moveNext();
            newPieceArray[newPieceOffset].sCol = positionIterator.currentCol;
            newPieceArray[newPieceOffset].sRow = positionIterator.currentRow;
          }
        }
      }

      // Register a board action for sliding in the new pieces.
      boardActionArray.push(new NewPieceAction(cascadeCount, newPieceArray));
    }
  },
  updatePositionInfoForAllPieces: {
    value: function updatePositionInfoForAllPieces() {
      for (var i = 0; i < this.board.columnArray.length; i++) {
        for (var j = 0; j < this.board.columnArray[i].length; j++) {
          if (this.board.columnArray[i][j] != null) {
            this.board.columnArray[i][j].columnNumber = i;
            this.board.columnArray[i][j].rowNumber = j;
          }
        }
      }
    }
  },
  getBoard: {
    value: function getBoard() {
      return this.board;
    }
  }
});
