"use strict";

Object.defineProperties(this, {
  AnimationManager: {
    value: (function() {
      var _animations = [];
      var _newAnimations = [];
      var _animationManager = {};

      Object.defineProperties(_animationManager, {
        addAnimation: {
          value: function addAnimation(animation) {
            _newAnimations.push(animation);
          }
        },
        update: {
          value: function update() {
            var currentTime = new Date().getTime();
            if (_newAnimations.length > 0) {
              for (var i = 0; i < _newAnimations.length; i++) {
                _newAnimations[i].start(currentTime);
              }
              _animations = _animations.concat(_newAnimations);
              _newAnimations = [];
            }

            for (var i = _animations.length - 1; i >= 0; i--) {
              if (_animations[i].update(currentTime)) {
                _animations.splice(i, 1);
              }
            }
          }
        },
        clear: {
          value: function clear() {
            _animations = [];
            _newAnimations = [];
          }
        }
      });

      return _animationManager;
    })()
  }
});

function Animation(sprite, delay, duration, callbackComplete, options) {
  this.sprite = sprite;
  this.delay = delay;
  this.duration = duration;
  this.callbackComplete = callbackComplete;
  this.callbackStart = null;

  this.loop = false;
  if (options) {
    if (typeof options.loop !== "undefined") {
      this.loop = options.loop;
    }
  }
}

Animation.prototype = Object.create(null);
Animation.prototype.constructor = Animation;

Object.defineProperties(Animation.prototype, {
  start: {
    value: function start(currentTime) {
      this.startTime = currentTime + this.delay;
    }
  },
  startCallback: {
    value: function startCallback(callback) {
      this.callbackStart = callback;
    }
  },
  cancel: {
    value: function cancel(finalize) {
      if (finalize) {
        this.updateCore(1.0);
      }
      this.cancelled = true;
    }
  },
  update: {
    value: function update(currentTime) {
      if (this.cancelled) {
        return true;
      }
      if (currentTime >= this.startTime) {
        if (this.callbackStart) {
          this.callbackStart(this);
          this.callbackStart = null;
        }

        var offset = 1.0;
        if (this.duration > 0) {
          offset = Math.min(
            1.0,
            (currentTime - this.startTime) / this.duration
          );
        }
        this.updateCore(offset);

        if (offset >= 1.0) {
          if (!this.loop) {
            if (this.callbackComplete) {
              this.callbackComplete(this);
            }
            return true;
          } else {
            this.startTime += this.duration;
          }
        }
      }
      return false;
    }
  },
  updateCore: {
    value: function updateCore(offset) {}
  }
});

function AnimationGroup(animations, callbackComplete) {
  Animation.call(this, null, 0, 0, callbackComplete);

  this.animations = animations;
}

AnimationGroup.prototype = Object.create(Animation.prototype);
AnimationGroup.prototype.constructor = AnimationGroup;

Object.defineProperties(AnimationGroup.prototype, {
  start: {
    value: function start(currentTime) {
      for (var i = 0; i < this.animations.length; i++) {
        this.animations[i].start(currentTime);
      }
    }
  },
  update: {
    value: function update(currentTime) {
      for (var i = this.animations.length - 1; i >= 0; i--) {
        if (this.animations[i].update(currentTime)) {
          this.animations.splice(i, 1);
        }
      }
      if (this.animations.length === 0) {
        if (this.callbackComplete) {
          this.callbackComplete(this);
        }
        return true;
      }
      return false;
    }
  }
});

function OpacityAnimation(
  sprite,
  startOpacity,
  endOpacity,
  delay,
  duration,
  callbackComplete
) {
  Animation.call(this, sprite, delay, duration, callbackComplete);

  this.startOpacity = startOpacity;
  this.endOpacity = endOpacity;
  this.deltaOpacity = endOpacity - startOpacity;
}

OpacityAnimation.prototype = Object.create(Animation.prototype);
OpacityAnimation.prototype.constructor = OpacityAnimation;

Object.defineProperties(OpacityAnimation.prototype, {
  updateCore: {
    value: function updateCore(offset) {
      this.sprite.opacity = this.startOpacity + this.deltaOpacity * offset;
    }
  }
});

function TranslationAnimation(
  sprite,
  sx,
  sy,
  dx,
  dy,
  delay,
  duration,
  callbackComplete
) {
  this.sx = sx;
  this.sy = sy;
  this.dx = dx;
  this.dy = dy;

  this.deltaX = this.dx - this.sx;
  this.deltaY = this.dy - this.sy;

  var realDuration = duration;
  if (duration === 0) {
    // Velocity is 1 pixel per millisecond. A scale factor is applied to speed up or slow down the animation.
    // Values greater than 1 increase the duration and make the animation slower.
    // Values less than 1 decrease the duration and make the animation faster.
    realDuration = Math.sqrt(
      this.deltaX * this.deltaX + this.deltaY * this.deltaY
    );
  }

  Animation.call(this, sprite, delay, realDuration, callbackComplete);
}

TranslationAnimation.prototype = Object.create(Animation.prototype);
TranslationAnimation.prototype.constructor = TranslationAnimation;

Object.defineProperties(TranslationAnimation.prototype, {
  updateCore: {
    value: function updateCore(offset) {
      this.sprite.x = this.sx + this.deltaX * offset;
      this.sprite.y = this.sy + this.deltaY * offset;
    }
  }
});

function ArcAnimation(
  sprite,
  sx,
  sy,
  deltaX,
  deltaY,
  delay,
  duration,
  callbackComplete
) {
  this.sx = sx;
  this.sy = sy;

  this.deltaX = deltaX;
  this.deltaY = deltaY;

  Animation.call(this, sprite, delay, duration, callbackComplete);
}

ArcAnimation.prototype = Object.create(Animation.prototype);
ArcAnimation.prototype.constructor = ArcAnimation;

Object.defineProperties(ArcAnimation.prototype, {
  updateCore: {
    value: function updateCore(offset) {
      var arcX = (Math.cos(Math.PI * offset) - 1) / 2;
      var arcY = Math.sin(Math.PI * offset);

      this.sprite.x = this.sx + this.deltaX * -arcX;
      this.sprite.y = this.sy + this.deltaY * arcY;
    }
  }
});

function SwapAnimation(
  engine,
  p1Info,
  p2Info,
  delay,
  duration,
  callbackComplete
) {
  Animation.call(this, p1Info.piece.sprite, delay, duration, callbackComplete);

  this.sprite1 = p1Info.piece.sprite;
  this.sprite2 = p2Info.piece.sprite;

  this.piece1Start = engine.getUpdatedPositionFromIndex(p1Info.col, p1Info.row);
  this.piece2Start = engine.getUpdatedPositionFromIndex(p2Info.col, p2Info.row);

  this.delta1X = this.piece2Start.x - this.piece1Start.x;
  this.delta1Y = this.piece2Start.y - this.piece1Start.y;
  this.delta2X = -this.delta1X;
  this.delta2Y = -this.delta1Y;
}

SwapAnimation.prototype = Object.create(Animation.prototype);
SwapAnimation.prototype.constructor = SwapAnimation;

Object.defineProperties(SwapAnimation.prototype, {
  updateCore: {
    value: function updateCore(offset) {
      this.sprite1.x = this.piece1Start.x + this.delta1X * offset;
      this.sprite1.y = this.piece1Start.y + this.delta1Y * offset;
      this.sprite2.x = this.piece2Start.x + this.delta2X * offset;
      this.sprite2.y = this.piece2Start.y + this.delta2Y * offset;
    }
  }
});

function KeyFrameAnimation(
  keyFrameSprite,
  delay,
  duration,
  callbackComplete,
  options
) {
  Animation.call(
    this,
    keyFrameSprite,
    delay,
    duration,
    callbackComplete,
    options
  );

  this.startFrame = 0;
  this.frameCount = this.sprite.frame.frameCount;
  this.frameOffset = 1;

  if (options) {
    if (typeof options.startFrame !== "undefined") {
      this.startFrame = options.startFrame;
    }
    if (typeof options.frameCount !== "undefined") {
      this.frameCount = options.frameCount;
    }
    if (typeof options.frameOffset !== "undefined") {
      this.frameOffset = options.frameOffset;
    }
  }
}

KeyFrameAnimation.prototype = Object.create(Animation.prototype);
KeyFrameAnimation.prototype.constructor = KeyFrameAnimation;

Object.defineProperties(KeyFrameAnimation.prototype, {
  start: {
    value: function start(currentTime) {
      Animation.prototype.start.call(this, currentTime);

      this.currentFrameId = this.startFrame;
      this.sprite.setFrame(this.startFrame);
    }
  },
  updateCore: {
    value: function updateCore(offset) {
      var newFrameId =
        this.startFrame + parseInt(this.frameCount * offset) * this.frameOffset;
      if (this.currentFrameId !== newFrameId) {
        this.currentFrameId = newFrameId;
        this.sprite.setFrame(this.currentFrameId);
      }
    }
  }
});
