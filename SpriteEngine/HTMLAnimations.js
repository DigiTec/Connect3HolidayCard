"use strict";

function HeightAnimation(
  sprite,
  currentHeight,
  targetHeight,
  delay,
  duration,
  callbackComplete
) {
  Animation.call(this, sprite, delay, duration, callbackComplete);

  this.startHeight = currentHeight;
  this.endHeight = targetHeight;
  this.deltaHeight = targetHeight - currentHeight;
}
HeightAnimation.prototype = Object.create(Animation.prototype);
HeightAnimation.prototype.constructor = HeightAnimation;

Object.defineProperties(HeightAnimation.prototype, {
  updateCore: {
    value: function updateCore(offset) {
      this.sprite.style.height =
        this.startHeight + this.deltaHeight * offset + "px";
    }
  }
});

function WidthAnimation(
  sprite,
  currentWidth,
  targetWidth,
  delay,
  duration,
  callbackComplete
) {
  Animation.call(this, sprite, delay, duration, callbackComplete);

  this.startWidth = currentWidth;
  this.endWidth = targetWidth;
  this.deltaWidth = targetWidth - currentWidth;
}
WidthAnimation.prototype = Object.create(Animation.prototype);
WidthAnimation.prototype.constructor = WidthAnimation;

Object.defineProperties(WidthAnimation.prototype, {
  updateCore: {
    value: function updateCore(offset) {
      this.sprite.style.width =
        this.startWidth + this.deltaWidth * offset + "px";
    }
  }
});

function CSSOpacityAnimation(
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
CSSOpacityAnimation.prototype = Object.create(Animation.prototype);
CSSOpacityAnimation.prototype.constructor = CSSOpacityAnimation;

Object.defineProperties(CSSOpacityAnimation.prototype, {
  updateCore: {
    value: function updateCore(offset) {
      this.sprite.style.opacity =
        this.startOpacity + this.deltaOpacity * offset;
    }
  }
});
