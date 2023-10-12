// console.log("props", props);
let { componentAccountId } = props;

const contract = "dev-1697106352382-19350097980010";

const players = Near.view(contract, "get_available_players", {
  from_index: 0,
  limit: 100,
});

const games = Near.view(contract, "get_available_games", {
  from_index: 0,
  limit: 100,
});

// console.log("players", players);

console.log("games", games);

const createGame = () => {
  Near.call(contract, "add_available_player");
};

const startGame = (opponent) => {
  Near.call(contract, "start_game", { opponent_id: opponent });
};

return (
  <div>
    <button
      style={{
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
      }}
      onClick={createGame}
    >
      Create game
    </button>
    <h1
      style={{
        textAlign: "center",
        marginTop: "50px",
      }}
    >
      List of available games to join
    </h1>
    <table
      style={{ marginLeft: "auto", marginRight: "auto", marginTop: "1em" }}
    >
      <tbody>
        {players &&
          players.map((player, index) => (
            <tr key={index}>
              <td style={{ paddingRight: "50px" }}>{player[0]}</td>
              <td>
                <button
                  onClick={() => {
                    startGame(player[0]);
                  }}
                >
                  Join
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
    <h1
      style={{
        textAlign: "center",
        marginTop: "50px",
      }}
    >
      List of games in progress
    </h1>
    <table
      style={{ marginLeft: "auto", marginRight: "auto", marginTop: "1em" }}
    >
      <tbody>
        {games &&
          games.map((game, index) => (
            <tr key={index}>
              <td style={{ paddingRight: "10px" }}>Game {game[0]}: </td>
              <td style={{ paddingRight: "100px" }}>
                {game[1][0]} VS {game[1][1]}
              </td>
              <td>
                <a
                  href={`/${componentAccountId}/widget/HexGame?gameId=${game[0]}`}
                >
                  Open
                </a>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);
