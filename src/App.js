import React from "react";
import "./App.css";

import packer from "./packer";

function App() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  var circles = 100;

  var min_r = 20;
  var max_r = 80;
  var radiuses = [];

  for (var i = 0; i !== circles; i++)
    radiuses.push(Math.random() * (max_r - min_r) + min_r);
  const list = packer(radiuses, width, height);
  return (
    <svg width={width} height={height}>
      <g>
        {list.map(circle => {
          const { r, x, y } = circle;
          return <circle cx={x} cy={y} r={r} fill="black" />;
        })}
      </g>
    </svg>
  );
}

export default App;
