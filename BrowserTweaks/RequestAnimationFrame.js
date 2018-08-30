"use strict";

if (typeof window.requestAnimationFrame === "undefined") {
  if (typeof window.webkitRequestAnimationFrame !== "undefined") {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  } else if (typeof window.msRequestAnimationFrame !== "undefined") {
    window.requestAnimationFrame = window.msRequestAnimationFrame;
  } else {
    window.requestAnimationFrame = function(callback) {
      window.setTimeout(callback, 15);
    };
  }
}
