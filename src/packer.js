/* eslint-disable */

function normalize(point) {
  return Math.sqrt(point.x * point.x + point.y * point.y);
}

function vector(point1, point2) {
  return { x: point2.x - point1.x, y: point2.y - point1.y };
}

function point(x, y) {
  return { x, y };
}

function circle(r, p) {
  return { r, c: p };
}

export function pointDistance(point1, point2) {
  return normalize(vector(point1, point2));
}

export function circleDistance(circle1, circle2) {
  return pointDistance(circle1.c, circle2.c) - circle1.r - circle2.r;
}

function surfaceArea(r) {
  return Math.PI * Math.pow(r, 2);
}

export function multiply(p, n) {
  return { x: p.x * n, y: p.y * n };
}

export function add(point1, point2) {
  return { x: point1.x + point2.x, y: point1.y + point2.y };
}

// approximate a segment with an "infinite" radius circle
function bounding_circle(x0, y0, x1, y1, w, h, bounding_r) {
  const xm = Math.abs((x1 - x0) * w);
  const ym = Math.abs((y1 - y0) * h);
  const m = xm > ym ? xm : ym;
  const theta = Math.asin(m / 4 / bounding_r);
  const r = bounding_r * Math.cos(theta);
  return circle(
    bounding_r,
    point(
      (r * (y0 - y1)) / 2 + ((x0 + x1) * w) / 4,
      (r * (x1 - x0)) / 2 + ((y0 + y1) * h) / 4
    )
  );
}

// return the corner placements for two circles
function corner(radius, c1, c2, w, h) {
  let u = vector(c1.c, c2.c); // c1 to c2 vector
  const A = normalize(u);
  if (A == 0) return []; // same centers
  u = multiply(u, 1 / A); // c1 to c2 unary vector
  // compute c1 and c2 intersection coordinates in (u,v) base
  const B = c1.r + radius;
  const C = c2.r + radius;
  if (A > B + C) return []; // too far apart
  const x = (A + (B * B - C * C) / A) / 2;
  const y = Math.sqrt(B * B - x * x);
  const base = add(c1.c, multiply(u, x));

  const res = [];
  const p1 = point(base.x - u.y * y, base.y + u.x * y);
  const p2 = point(base.x + u.y * y, base.y - u.x * y);
  if (in_rect(radius, p1, w, h)) res.push(circle(radius, p1));
  if (in_rect(radius, p2, w, h)) res.push(circle(radius, p2));
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

function compute(surface, circles, ratio) {
  // deduce starting dimensions from surface
  var bounding_r = Math.sqrt(surface) * 100; // "infinite" radius
  var w = Math.sqrt(surface * ratio);
  var h = w / ratio;

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
    var circle = [];
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
              var d = circleDistance(placed[l], corners[c]);
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
  return { placed, w, h };
}

function solve(circles, ratio) {
  // compute total surface of the circles
  let surface = circles.reduce((final, radii) => {
    return final + surfaceArea(radii);
  }, 0);

  // set a suitable precision
  const limit = surface / 1000;

  let step = surface / 2;

  var res = [];

  while (step > limit) {
    var placement = compute(surface, circles, ratio);
    if (placement.placed.length != circles.length) {
      surface += step;
    } else {
      res = placement;
      surface -= step;
    }
    step /= 2;
  }
  return res;
}

export default function(radiuses = [], width, height, spacingFactor = 0) {
  const ratio = width / height;
  const { placed, w, h } = solve(radiuses, ratio);
  const dx = w / 2;
  const dy = h / 2;
  const list2 = placed.map(circle => {
    const { r, c } = circle;
    const { x, y } = c;
    const cx = (x + dx) * (1 + spacingFactor);
    const cy = (y + dy) * (1 + spacingFactor);
    const cr = r;
    return {
      x: cx,
      y: cy,
      r: cr
    };
  });
  return list2;
}
