let {
  componentAccountId,
  field,
  rows,
  cols,
  curMove,
  handleClick,
  curPlayer,
  player1Color,
  player2Color,
} = props;

// console.log("field", field)

const PI = 3.1415926;
const PLAYER1_COLOR = player1Color ? player1Color : "#0057B7";
const PLAYER2_COLOR = player2Color ? player2Color : "#FFDD00";

const size = 20;
const width = Math.sqrt(3) * size;
const height = (2 - Math.sin(PI / 6)) * size;

const hexes = [];
hexes.push(
  <polygon
    points={`${width / 2 + width / 2},0 ${
      width * (cols - 1) + width / 2 + width / 2
    },0 ${width * (cols - 1) + width / 2 + width / 2},${size} ${
      width / 2 + width / 2
    },${size}`}
    stroke={PLAYER1_COLOR}
    fill={PLAYER1_COLOR}
  />
);

hexes.push(
  <polygon
    points={`${width * (cols - 1) + (width / 2) * rows + width / 2},${
      height * (rows + 1)
    } ${(width / 2) * rows + width / 2},${height * (rows + 1)} ${
      (width / 2) * rows + width / 2
    },${height * (rows + 1) - size} ${
      width * (cols - 1) + (width / 2) * rows + width / 2
    },${height * (rows + 1) - size}`}
    stroke={PLAYER1_COLOR}
    fill={PLAYER1_COLOR}
  />
);

hexes.push(
  <polygon
    points={`${0},${height} ${width},${height} ${
      (width / 2) * rows + width / 2
    },${height * rows} ${(width / 2) * rows - width / 2},${height * rows}`}
    stroke={PLAYER2_COLOR}
    fill={PLAYER2_COLOR}
  />
);

hexes.push(
  <polygon
    points={`${width * cols},${height} ${width * (cols + 1)},${height} ${
      width * cols + (width / 2) * rows + width / 2
    },${height * rows} ${width * (cols - 1) + (width / 2) * rows + width / 2},${
      height * rows
    }`}
    stroke={PLAYER2_COLOR}
    fill={PLAYER2_COLOR}
  />
);

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const x = width * col + (width / 2) * (row + 1) + width / 2;
    const y = height * row + height;

    let color;
    if (row == curMove.row && col == curMove.col) {
      color = curPlayer == 2 ? PLAYER2_COLOR : PLAYER1_COLOR;
    } else {
      if (field[row][col] == 1) {
        color = PLAYER1_COLOR;
      } else if (field[row][col] == 2) {
        color = PLAYER2_COLOR;
      } else {
        color = "white";
      }
    }
    hexes.push(
      <Widget
        src={`${componentAccountId}/widget/Hex`}
        props={{
          center_x: x,
          center_y: y,
          size: size,
          row: row,
          col: col,
          color: color,
          onClick: handleClick,
        }}
      />
    );
  }
}

return (
  <svg
    style={{
      width: width * cols + (width / 2) * rows + width / 2,
      height: height * (rows + 1),
    }}
  >
    {hexes}
  </svg>
);
