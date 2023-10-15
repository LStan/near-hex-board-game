// console.log("props", props);
let { componentAccountId, gameId } = props;

gameId = Number(gameId);

const contract = "dev-1697106352382-19350097980010";
const PLAYER1_COLOR = "#0057B7";
const PLAYER2_COLOR = "#FFDD00";

State.init({
  field: [],
  curMove: { row: null, col: null },
  curPlayer: 1,
  isYourTurn: false,
  isPlayer: false,
  winnerIndex: 0,
  path: null,
});

const constructMatrixField = (field, size) => {
  let matrix = [];

  for (let i = 0; i < size; i++) {
    let row = [];
    for (let j = 0; j < size; j++) {
      row.push(field[i * size + j]);
    }
    matrix.push(row);
  }
  return matrix;
};

const getGame = () => {
  //const game = Near.view(contract, "get_game", { game_id: gameId }, null, null, {ignoreCache: true});
  // console.log("game", game);
  Near.asyncView(contract, "get_game", { game_id: gameId })
    .then((game) => {
      // console.log("game", game);
      State.update({
        field: constructMatrixField(game.board.field, game.board.size),
        players: [game.player_id1, game.player_id2],
        curPlayer: game.is_first_player_turn ? 1 : 2,
        isYourTurn: game.is_first_player_turn
          ? context.accountId == game.player_id1
          : context.accountId == game.player_id2,
        isPlayer:
          context.accountId == game.player_id1 ||
          context.accountId == game.player_id2,
        winnerIndex: game.winner_index,
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

getGame();

const findPath = (grid, size, player) => {
  const rows = size;
  const cols = size;
  const visited = Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(false));
  let path = [];

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, 1],
    [1, -1],
  ];

  function bfs(x, y) {
    let queue = [[x, y, path]];

    while (queue.length > 0) {
      let [x, y, path] = queue.shift();

      if (
        x < 0 ||
        x >= rows ||
        y < 0 ||
        y >= cols ||
        visited[x][y] ||
        grid[x][y] != player
      ) {
        continue;
      }

      visited[x][y] = true;
      path.push([x, y]);

      if (player == 1) {
        if (x === rows - 1) {
          return path;
        }
      } else {
        if (y === rows - 1) {
          return path;
        }
      }

      for (let [dx, dy] of directions) {
        let pathCopy = path.slice(); // create a copy of path
        queue.push([x + dx, y + dy, pathCopy]);
      }
    }

    return null;
  }

  if (player == 1) {
    for (let y = 0; y < cols; y++) {
      path = []; // Reset the path for each starting point
      let result = bfs(0, y);
      if (result) {
        return result;
      }
    }
  } else {
    for (let x = 0; x < rows; x++) {
      path = []; // Reset the path for each starting point
      let result = bfs(x, 0);
      if (result) {
        return result;
      }
    }
  }
  return null; // If no path was found after all starting points were attempted
};

const handleClick = (row, col) => {
  if (!state.isYourTurn || state.winnerIndex != 0) {
    return;
  }
  if (state.field[row][col] == 0) {
    State.update({ curMove: { row, col } });

    //   const grid = [
    //     [2, 0, 0, 2, 0, 0, 2, 0, 2, 2, 2],
    //     [2, 2, 2, 2, 0, 0, 2, 2, 0, 2, 0],
    //     [2, 0, 2, 0, 2, 0, 2, 2, 2, 2, 0],
    //     [0, 0, 0, 2, 2, 2, 2, 0, 2, 0, 0],
    //     [2, 0, 0, 2, 0, 2, 0, 0, 0, 2, 2],
    //     [0, 2, 2, 0, 2, 2, 2, 0, 2, 2, 0],
    //     [0, 0, 0, 2, 0, 2, 0, 2, 0, 0, 2],
    //     [2, 0, 2, 2, 0, 0, 2, 0, 0, 2, 0],
    //     [2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0],
    //     [2, 2, 2, 2, 0, 2, 0, 0, 2, 0, 0],
    //     [2, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2]
    // ];
    let grid = state.field.map((row) => [...row]);
    grid[row][col] = state.curPlayer;
    const path = findPath(grid, state.field.length, state.curPlayer);
    // console.log("path", path);
    State.update({ path: path });
  }
};

const move = (gameId, move, fieldSize) => {
  const tile = move.row * fieldSize + move.col;
  Near.call(contract, "make_move", { game_id: gameId, tile: tile });
};

const win = (gameId, move, fieldSize, path) => {
  const tile = move.row * fieldSize + move.col;
  path = path.map(([row, col]) => row * fieldSize + col);
  // console.log("flatten path", path);
  Near.call(contract, "declare_win", { game_id: gameId, tile: tile, path: path });
};

const giveUp = (gameId) => {
  Near.call(contract, "give_up", { game_id: gameId });
};

// console.log("main", state.field);

const code = `
<script>
window.addEventListener("message", (event) => {
  setInterval(() => event.source.postMessage("update", "*"), event.data.timeout);
});
</script>
`;

function onUpdate() {
  if (!state.isYourTurn) {
    getGame();
  }
}

return (
  <>
    {state.winnerIndex == 0 ? (
      <h2
        style={{ color: state.curPlayer == 1 ? PLAYER1_COLOR : PLAYER2_COLOR }}
      >
        Current turn:{" "}
        {state.curPlayer == 1 ? state.players[0] : state.players[1]}
      </h2>
    ) : (
      <h2
        style={{
          color: state.winnerIndex == 1 ? PLAYER1_COLOR : PLAYER2_COLOR,
        }}
      >
        Game ended.{" "}
        {state.winnerIndex == 1 ? state.players[0] : state.players[1]} won
      </h2>
    )}
    <Widget
      src={`${componentAccountId}/widget/HexField`}
      props={{
        componentAccountId: componentAccountId,
        field: state.field,
        rows: state.field.length,
        cols: state.field.length,
        curMove: state.curMove,
        handleClick: handleClick,
        curPlayer: state.curPlayer,
      }}
    />
    {state.path ? (
      <button
        disabled={!state.isYourTurn || state.winnerIndex != 0}
        onClick={() => {
          win(gameId, state.curMove, state.field.length, state.path);
        }}
      >
        Win
      </button>
    ) : (
      <button
        disabled={!state.isYourTurn || (state.curMove.row == null)}
        onClick={() => {
          move(gameId, state.curMove, state.field.length);
        }}
      >
        Move
      </button>
    )}
    <button
      disabled={!state.isPlayer || state.winnerIndex != 0}
      style={{ background: "red" }}
      onClick={() => {
        giveUp(gameId);
      }}
    >
      Give Up
    </button>
    <iframe
      style={{ display: "none" }}
      srcDoc={code}
      onMessage={onUpdate}
      message={{ timeout: 1000 }}
    />
  </>
);
