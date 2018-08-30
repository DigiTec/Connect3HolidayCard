function ImageMap(source) {
  var img = new Image();
  img.src = source;
  return img;
}

ImageMap.prototype = Object.create(null);
ImageMap.prototype.constructor = ImageMap;
