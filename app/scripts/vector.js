
function Vector(x, y) {
  this.x = x;
  this.y = y;

  this.normalize = function() {
    var length = this.length();
    this.x = this.x / length;
    this.y = this.y / length;
    return this;
  }

  this.scale = function(factor) {
    this.x *= factor;
    this.y *= factor;
    return this;
  }

  this.divide = function(divisor) {
    this.x /= divisor;
    this.y /= divisor;
    return this;
  }

  this.subtract = function(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  this.add = function(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  this.length = function() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  this.clone = function() {
    return new Vector(this.x, this.y);
  }

  this.distanceTo = function(anotherVector) {
    return Math.sqrt(Math.pow(this.x - anotherVector.x, 2) + Math.pow(this.y - anotherVector.y, 2));
  }
}

module.exports = Vector
