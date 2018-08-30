"use strict";

function Sprite(x, y, scale, rotation) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.opacity = 1;
    this.rotation = rotation;
    this.children = [];
}

Sprite.prototype = Object.create(null);
Sprite.prototype.constructor = Sprite;

Object.defineProperties(Sprite.prototype, {
    update: {
        value: function update(time) {
        }
    },
    draw: {
        value: function draw(ctx) {
            this.pushTransform(ctx);
            this.drawCore(ctx);
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].draw(ctx);
            }
            this.popTransform(ctx);
        }
    },
    drawCore: {
        value: function drawCore(ctx) {
        }
    },
    pushTransform: {
        value: function pushTransform(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            if (this.rotation !== 0) {
                ctx.rotate(this.rotation);
            }
            if (this.scale !== 1) {
                ctx.scale(this.scale, this.scale);
            }
            if (this.opacity !== 1) {
                ctx.globalAlpha = this.opacity;
            }
        }
    },
    popTransform: {
        value: function popTransform(ctx) {
            ctx.restore();
        }
    }
});

function FrameSprite(frame, x, y, scale, rotation) {
    Sprite.call(this, x, y, scale, rotation);

    this.frame = frame;
}

FrameSprite.prototype = Object.create(Sprite.prototype);
FrameSprite.prototype.constructor = FrameSprite;

Object.defineProperties(FrameSprite.prototype, {
    update: {
        value: function update(time) {
        }
    },
    drawCore: {
        value: function drawCore(ctx) {
            ctx.drawImage(this.frame, 0, 0);
        }
    }
});

function KeyFrameSprite(frame, x, y, scale, rotation) {
    Sprite.call(this, x, y, scale, rotation);

    this.frame = frame;
    this.setFrame(0);
}
KeyFrameSprite.prototype = Object.create(Sprite.prototype);
KeyFrameSprite.prototype.constructor = KeyFrameSprite;

Object.defineProperties(KeyFrameSprite.prototype, {
    update: {
        value: function update(elapsedTime) {
        }
    },
    setFrame: {
        value: function setFrame(frameId) {
            if (frameId >= 0 && frameId < this.frame.frameCount) {
                this.frameId = frameId;
                this.frameSourceX = frameId * this.frame.width % this.frame.totalWidth;
                this.frameSourceY = parseInt((frameId * this.frame.width) / this.frame.totalWidth) * this.frame.height;
            }
        }
    },
    drawCore: {
        value: function drawCore(ctx) {
            ctx.drawImage(this.frame.image, this.frameSourceX, this.frameSourceY, this.frame.width, this.frame.height, 0, 0, this.frame.width, this.frame.height);
        }
    }
});

function BoardSprite(piece, frame, pieceSize, piecePadding) {
    this.piece = piece;
    this.pieceSize = pieceSize;
    this.piecePadding = piecePadding;
    this.piece.sprite = this;
    this.updatePositionFromPiece();

    KeyFrameSprite.call(this, frame, this.x, this.y, 1, 0);
    this.setFrame(this.piece.colorCode);
}
BoardSprite.prototype = Object.create(KeyFrameSprite.prototype);
BoardSprite.prototype.constructor = BoardSprite;

Object.defineProperties(BoardSprite.prototype, {
    getUpdatedPositionFromPiece: {
        value: function getUpdatedPositionFromPiece() {
            return {
                "x": this.piece.columnNumber * this.pieceSize + this.piece.columnNumber * this.piecePadding,
                "y": this.piece.rowNumber * this.pieceSize + this.piece.rowNumber * this.piecePadding
            };
        }
    },
    updatePositionFromPiece: {
        value: function updatePositionFromPiece() {
            this.x = this.piece.columnNumber * this.pieceSize + this.piece.columnNumber * this.piecePadding;
            this.y = this.piece.rowNumber * this.pieceSize + this.piece.rowNumber * this.piecePadding;
        }
    }
});