var debounce = require('debounce');
var ticker   = require('ticker');

var Vector   = require('./vector.js');
var Boid     = require('./boid.js');

var rules    = require('./rules.js');

var boidCount = 50;
var predCount = 3;
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
  boids.push(new Boid());
}

var predators = [];
for(var i=0; i<predCount; i++) {
  predators.push(new Boid());
}

var mouse = new Vector(0, 0);

document.addEventListener('mousemove', function(e) {
  mouse.x = e.clientX || e.pageX;
  mouse.y = e.clientY || e.pageY;
}, false);


document.body.style.margin  = '0';
document.body.style.padding = '0';
document.body.appendChild(canvas);

var cohesion   = true;
var alignment  = true;
var separation = true;

var pause      = false;

var drawPredator = function(predator, pulse) {
  pulse = (pulse && (pulse + 3)) || 1;

  var spikes = 15
  var scale = 5;
  var outerRadius = 25 + Math.sin(pulse)*5;
  var innerRadius = 25 + Math.sin(pulse + Math.PI)*5;
  
  var rot=Math.PI/2*3;
  var x=predator.loc.x;
  var y=predator.loc.y;
  var cx=x;
  var cy=y
  var step=Math.PI/spikes;

  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#ff0000';
  ctx.fillStyle   = '#ff0000'
  ctx.beginPath();
  ctx.moveTo(cx,cy-outerRadius)
  for(i=0;i<spikes;i++){
    x=cx+Math.cos(rot)*outerRadius;
    y=cy+Math.sin(rot)*outerRadius;
    ctx.lineTo(x,y)
    rot+=step

    x=cx+Math.cos(rot)*innerRadius;
    y=cy+Math.sin(rot)*innerRadius;
    ctx.lineTo(x,y)
    rot+=step
  }
  ctx.lineTo(cx,cy-outerRadius);
  ctx.lineWidth = 4
  ctx.stroke();
  ctx.closePath();
}

var drawBoid = function(boid) {
  var scale = 5;

  var velocity = boid.vel;

  ctx.beginPath();
  ctx.lineWidth = 1;
  // 1) Move to front
  ctx.moveTo(boid.loc.x + velocity.x * scale, boid.loc.y + velocity.y * scale);
  // 2) Draw to the back
  ctx.lineTo(boid.loc.x - velocity.x * 2 * scale, boid.loc.y - velocity.y * 2 * scale);
  // 3) Draw to the left site
  ctx.lineTo(boid.loc.x + velocity.x * scale, boid.loc.y - velocity.y * scale);
  // 4) Draw to the front
  ctx.lineTo(boid.loc.x + velocity.x * scale, boid.loc.y + velocity.y * scale);
  // 5) Draw to the right site
  ctx.lineTo(boid.loc.x - velocity.x * scale, boid.loc.y + velocity.y * scale);
  // 6) Draw to the back
  ctx.lineTo(boid.loc.x - velocity.x * 2 * scale, boid.loc.y - velocity.y * 2 * scale);
  // 7) Move back to right site
  ctx.moveTo(boid.loc.x - velocity.x * scale, boid.loc.y + velocity.y * scale);
  // 8) Draw to left site
  ctx.lineTo(boid.loc.x + velocity.x * scale, boid.loc.y - velocity.y * scale);

  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#ff00ff';
  ctx.stroke();
}

var pattern;
var img = new Image();
img.src = 'http://subtlepatterns.com/patterns/subtle_carbon.png'

img.onload = function(){
    pattern = ctx.createPattern(img, 'repeat'); 
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

var wrap = function(boid) {
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
}

var pulse = 0;
ticker(window, fps).on('tick', function() {
  if(pause) return;

  predators.forEach(function(predator) {
    predator.loc.x += predator.vel.x;
    predator.loc.y += predator.vel.y;

    wrap(predator);
  })

  boids.forEach(function(boid, i) {

    var apply = [];
    if(cohesion)
      apply.push(rules.cohesion(boids, i));
    if(separation) 
      apply.push(rules.separation(boids, i));
    if(alignment)
      apply.push(rules.alignment(boids, i));

    predators.forEach(function(predator) {
      if(predator.loc.distanceTo(boids[i].loc) < 100) 
        apply.push(rules.tendAway(boids, i, predator.loc));
    });


    apply.forEach(function(rule) {
      boid.vel.x = boid.vel.x + rule.x;
      boid.vel.y = boid.vel.y + rule.y;
    })

    var len = boid.vel.length();
    if(len>3) {
      boid.vel.normalize().scale(3);
    }

    boid.loc.x += boid.vel.x
    boid.loc.y += boid.vel.y

    wrap(boid);
  });
  
}).on('draw', function() {
  if(pause) return;


  var halfHeight = canvas.height/2
  var halfWidth  = canvas.width/2

  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  boids.forEach(function(boid, i) {
    drawBoid(boid);
  })
  pulse += 0.1
  pulse = pulse % (Math.PI * 2);
  predators.forEach(function(predator, i) {
    drawPredator(predator, pulse);
  })
});

$("#cohesion").change(function () {
  cohesion = $(this).is(":checked");
}).change();
$("#alignment").change(function () {
  alignment = $(this).is(":checked");
}).change();
$("#separation").change(function () {
  separation = $(this).is(":checked");
}).change();

$("#menu-trigger").on('click', function() {
  $("body").toggleClass("active");
});
$("#pause-trigger").on('click', function() {
  var li = $("#pause-trigger > i");
  li.toggleClass("fa-pause");
  li.toggleClass("fa-play");
  pause = !pause;
});
