var debounce = require('debounce');
var ticker   = require('ticker');

var Vector   = require('./vector.js');
var Boid     = require('./boid.js');

var rules    = require('./rules.js');

var boidCount = 50;
var fps       = 60;
var canvas   = document.createElement('canvas');
var ctx      = canvas.getContext('2d');

var resizeCanvas = function() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.onresize = debounce(resizeCanvas, 200);
resizeCanvas();

var boids = [];
for(var i=0; i<boidCount; i++) {
  boids.push(new Boid(Math.random() * 400, Math.random() * 400));
}

var mouse = new Vector(0, 0);

document.addEventListener('mousemove', function(e) {
  mouse.x = e.clientX || e.pageX;
  mouse.y = e.clientY || e.pageY;
}, false);


document.body.style.margin  = '0';
document.body.style.padding = '0';
document.body.appendChild(canvas);

ticker(window, fps).on('tick', function() {

  boids.forEach(function(boid, i) {

    var apply = [];
    apply.push(rules.cohesion(boids, i));
    apply.push(rules.separation(boids, i));
    apply.push(rules.alignment(boids, i));
    apply.push(rules.wind(boids, i));

    apply.forEach(function(rule) {
      boid.vel.x = boid.vel.x + rule.x;
      boid.vel.y = boid.vel.y + rule.y;
    })

    boid.vel.normalize();

    boid.loc.x += boid.vel.x * boid.speed;
    boid.loc.y += boid.vel.y * boid.speed;

    if(boid.loc.y > canvas.height) {
      boid.loc.y = 0;
    }
    if(boid.loc.y < 0) {
      boid.loc.y = canvas.height;
    }
    if(boid.loc.x > canvas.width) {
      boid.loc.x = 0;
    }
    if(boid.loc.x < 0) {
      boid.loc.x = canvas.width;
    }
  });
  
}).on('draw', function() {
  var drawBoid = function(vec) {
    ctx.beginPath();
    ctx.arc(vec.x, vec.y, 5, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  var halfHeight = canvas.height/2
  var halfWidth  = canvas.width/2

  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  boids.forEach(function(boid, i) {
//      var cntr = center(boids, i);
//
//      ctx.beginPath();
//      ctx.strokeStyle = 'red';
//      ctx.moveTo(boid.loc.x,boid.loc.y);
//      ctx.lineTo(cntr.x,cntr.y);
//      ctx.stroke();
//      ctx.fillStyle = 'green';
//
//      drawBoid(cntr);

      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'red';
      drawBoid(boid.loc);
  })
});
