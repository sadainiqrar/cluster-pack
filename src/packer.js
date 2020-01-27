/* eslint-disable */

// ===========================
// ancillary geometric classes
// ===========================
var Point = function(x, y) {
  this.x = x;
  this.y = y;
};

Point.prototype = {
  dist: function(p) {
    return this.vect(p).norm();
  },
  vect: function(p) {
    return new Point(p.x - this.x, p.y - this.y);
  },
  norm: function(p) {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },
  add: function(v) {
    return new Point(this.x + v.x, this.y + v.y);
  },
  mult: function(a) {
    return new Point(this.x * a, this.y * a);
  }
};
var Circle = function(radius, center) {
  this.r = radius;
  this.c = center;
};

Circle.prototype = {
  surface: function() {
    return Math.PI * this.r * this.r;
  },
  distance: function(circle) {
    return this.c.dist(circle.c) - this.r - circle.r;
  }
};

// =========================
// circle packer lives here!


function compute(surface, circles, ratio) {
  // deduce starting dimensions from surface
  var bounding_r = Math.sqrt(surface) * 100; // "infinite" radius
  var w = Math.sqrt(surface * ratio);
  var h = w / ratio;
  console.log('orientation: ', w, h)

  // place our bounding circles
  var placed = [
    bounding_circle(1, 1, 1, -1, w, h, bounding_r),
    bounding_circle(1, -1, -1, -1, w, h, bounding_r),
    bounding_circle(-1, -1, -1, 1, w, h, bounding_r),
    bounding_circle(-1, 1, 1, 1, w, h, bounding_r)
  ];

  // Initialize our rectangles list
  var unplaced = circles.slice(0); // clones the array
  while (unplaced.length > 0) {
    // compute all possible placements of the unplaced circles
    var lambda = {};
    var circle = {};
    for (var i = 0; i != unplaced.length; i++) {
      var lambda_min = 1e10;
      lambda[i] = -1e10;
      // match current circle against all possible pairs of placed circles
      for (var j = 0; j < placed.length; j++)
        for (var k = j + 1; k < placed.length; k++) {
          var corners = corner(unplaced[i], placed[j], placed[k], w, h);

          // check each placement
          for (var c = 0; c != corners.length; c++) {
            // check for overlap and compute min distance
            var d_min = 1e10;
            for (var l = 0; l != placed.length; l++) {
              // skip the two circles used for the placement
              if (l == j || l == k) continue;

              // compute distance from current circle
              var d = placed[l].distance(corners[c]);
              if (d < 0) break; // circles overlap

              if (d < d_min) d_min = d;
            }
            if (l == placed.length) {
              // no overlap
              if (d_min < lambda_min) {
                lambda_min = d_min;
                lambda[i] = 1 - d_min / unplaced[i];
                circle[i] = corners[c];
              }
            }
          }
        }
    }

    // select the circle with maximal gain
    var lambda_max = -1e10;
    var i_max = -1;
    for (var i = 0; i != unplaced.length; i++) {
      if (lambda[i] > lambda_max) {
        lambda_max = lambda[i];
        i_max = i;
      }
    }

    // failure if no circle fits
    if (i_max == -1) break;

    // place the selected circle
    unplaced.splice(i_max, 1);
    placed.push(circle[i_max]);
  }
  placed.splice(0, 4);
  return placed;
}

function solve(circles, ratio) {
  // compute total surface of the circles
  var surface = 0;
  for (var i = 0; i != circles.length; i++) {
    surface += Math.PI * Math.pow(circles[i], 2);
  }

  // set a suitable precision
  var limit = surface / 1000;

  var step = surface / 2;
  var res = [];
  while (step > limit) {
    var placement = compute(surface, circles, ratio);
    if (placement.length != circles.length) {
      surface += step;
    } else {
      res = placement;
      surface -= step;
    }
    step /= 2;
  }
  return res;
}

// approximate a segment with an "infinite" radius circle
function bounding_circle(x0, y0, x1, y1, w, h, bounding_r) {
  var xm = Math.abs((x1 - x0) * w);
  var ym = Math.abs((y1 - y0) * h);
  var m = xm > ym ? xm : ym;
  var theta = Math.asin(m / 4 / bounding_r);
  var r = bounding_r * Math.cos(theta);
  return new Circle(
    bounding_r,
    new Point(
      (r * (y0 - y1)) / 2 + ((x0 + x1) * w) / 4,
      (r * (x1 - x0)) / 2 + ((y0 + y1) * h) / 4
    )
  );
}

// return the corner placements for two circles
function corner(radius, c1, c2, w, h) {
  var u = c1.c.vect(c2.c); // c1 to c2 vector
  var A = u.norm();
  if (A == 0) return []; // same centers
  u = u.mult(1 / A); // c1 to c2 unary vector
  // compute c1 and c2 intersection coordinates in (u,v) base
  var B = c1.r + radius;
  var C = c2.r + radius;
  if (A > B + C) return []; // too far apart
  var x = (A + (B * B - C * C) / A) / 2;
  var y = Math.sqrt(B * B - x * x);
  var base = c1.c.add(u.mult(x));

  var res = [];
  var p1 = new Point(base.x - u.y * y, base.y + u.x * y);
  var p2 = new Point(base.x + u.y * y, base.y - u.x * y);
  if (in_rect(radius, p1, w,h)) res.push(new Circle(radius, p1));
  if (in_rect(radius, p2,w,h)) res.push(new Circle(radius, p2));
  return res;
}

// check if a circle is inside our rectangle
function in_rect(radius, center, w, h) {
  if (center.x - radius < -w / 2) return false;
  if (center.x + radius > w / 2) return false;
  if (center.y - radius < -h / 2) return false;
  if (center.y + radius > h / 2) return false;
  return true;
}

export default function(width, height) {

  var circles = 100;
  var ratio = width / height;
  var min_r = 20;
  var max_r = 80;
  var radiuses = [];
   const margin_factor = 0.0;
  const dx = width/2;
  const dy = height/2;
  const zx = width  * (1-margin_factor) / width;
  const zy = height * (1-margin_factor) / height;
  const zoom = zx < zy ? zx : zy;
  for (var i = 0; i != circles; i++)
    radiuses.push(Math.random() * (max_r - min_r) + min_r);
  var packer = new Packer(radiuses, ratio);
  var solved = solve(radiuses, ratio);
  const list2 = solved.map(circle=> {
    const {r,c} = circle
    const {x,y} = c
    const cx = (x+dx)*zoom
    const cy = (y+dy)*zoom
    const cr = r*zoom
    return {
      x: cx,y: cy,r: cr,
    }
  })
  return list2;
}
