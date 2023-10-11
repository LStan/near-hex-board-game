let { center_x, center_y, size, row, col, onClick, color } = props;

const x = center_x;
const y = center_y;

const PI = 3.1415926;

const points = [
  { x: x + Math.cos(PI / 6) * size, y: y + Math.sin(PI / 6) * size },
  {
    x: x + Math.cos(PI / 2) * size,
    y: y + Math.sin(PI / 2) * size,
  },
  {
    x: x + Math.cos((5 / 6) * PI) * size,
    y: y + Math.sin((5 / 6) * PI) * size,
  },
  {
    x: x + Math.cos((7 / 6) * PI) * size,
    y: y + Math.sin((7 / 6) * PI) * size,
  },
  {
    x: x + Math.cos((9 / 6) * PI) * size,
    y: y + Math.sin((9 / 6) * PI) * size,
  },
  {
    x: x + Math.cos((11 / 6) * PI) * size,
    y: y + Math.sin((11 / 6) * PI) * size,
  },
];

return (
  <polygon
    points={points.map((p) => `${p.x},${p.y}`).join(" ")}
    stroke="black"
    fill={color}
    onClick={() => onClick(row, col)}
  />
);
