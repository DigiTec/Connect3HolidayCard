"use strict";

function createSpanForMessage(enabled, message, alignment) {
  var spanMessage = null;
  if (enabled) {
    spanMessage = document.createElement("span");
    spanMessage.style.display = "inline-block";
    spanMessage.style.width = "100%";
    spanMessage.style.marginBottom = "10px";
    switch (alignment) {
      case "Center":
        spanMessage.style.textAlign = "center";
        break;
      case "Right":
        spanMessage.style.textAlign = "right";
        break;
    }
    spanMessage.innerText = message;
  }
  return spanMessage;
}
