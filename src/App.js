import React from "react";
import "./App.css";

import packer from "./packer";

function App() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const list = packer(width, height);
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
