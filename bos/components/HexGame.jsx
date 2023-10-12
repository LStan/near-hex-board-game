// console.log("props", props);
let { componentAccountId, gameId } = props;

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
});

const game = Near.view(contract, "get_game", { game_id: Number(gameId) });
console.log("game", game);

const constractMatrixFiled = (field, size) => {
  let matrix = [];

  for (let i = 0; i < size; i++) {
    let row = [];
    for (let j = 0; j < size; j++) {
      row.push(field[i * size + j]);
      // row.push(1);
    }
    matrix.push(row);
  }
  // console.log("matrix", matrix);
  return matrix;
};

State.update({
  field: constractMatrixFiled(game.board.field, game.board.size),
  // field: Array(11)
  // .fill()
  // .map(() => Array(11).fill(0)),
  // curMove: { row: null, col: null },
  // curPlayer: 1,
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

const handleClick = (row, col) => {
  State.update({ curMove: { row, col } });
  // console.log("Before", state.field);
  // state.field[row][col] = 1;
  // console.log("After", state.field);
};

const move = (gameId, move, fieldSize) => {
  const tile = move.row * fieldSize + move.col;
  Near.call(contract, "make_move", { game_id: gameId, tile: tile });
};

const giveUp = (gameId) => {
  Near.call(contract, "give_up", { game_id: gameId });
};

// console.log("main", state.field);

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
    <button
      disabled={!state.isYourTurn}
      onClick={() => {
        move(gameId, state.curMove, state.field.length);
      }}
    >
      Move
    </button>
    <button
      disabled={!state.isPlayer}
      style={{ background: "red" }}
      onClick={() => {
        giveUp(gameId);
      }}
    >
      Give Up
    </button>
  </>
);
