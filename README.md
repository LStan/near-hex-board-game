# Hex Board Game on NEAR blockchain

This is a simple implementation of [Hex Board Game](<https://en.wikipedia.org/wiki/Hex_(board_game)>) on the NEAR blockchain. The smart contract is deployed [here](https://explorer.testnet.near.org/accounts/dev-1697106352382-19350097980010).
BOS componets are published [here](https://test.near.org/discom.testnet/widget/ProfilePage?accountId=lso.testnet&tab=apps).

## Smart Contract

### Interface

`new`: Constructor function that initializes the states.

`add_available_player`: This function allows a player to add themselves to the list of available players. The function ensures the player isn't already in the list or involved in an ongoing game. If an opponent is specified, it also checks that the player and the opponent are not the same account.

`start_game`: This function starts a game with the specified opponent, provided that the opponent is in the available players list.

`make_move`: This function allows a player to make a move in an ongoing game. In order to save gas, the function doesn't check whether a player has won with the move, only that the move is correct.

`declare_win`: A player can declare that they've won. The win declaration includes the winning path and a possible move before the win.

`give_up`: If a player gives up, they can use this function specifying the game id. The function ensures the game hasn't finished. The game is then removed from the available games.

`get_available_players` and `get_available_games`: These are two getter functions that retrieve a list of available players and games respectively, given a start and limit. This allows for paginated retrieval of these lists.

`get_game`: This function returns a game instance given a game id.

`get_active_player`: Given a game id, this function returns the AccountId of the active player.

### Compile and Deploy

```console
cargo build --release --target wasm32-unknown-unknown
near dev-deploy --wasmFile ./target/wasm32-unknown-unknown/release/hex_game.wasm
near call <account_id> new '{}' --accountId <account_id>
```

## BOS Frontend

![image](https://github.com/LStan/near-hex-board-game/assets/10183269/ca363295-32b1-4e9b-8fba-9e5a348ad4c5)

Frontend consists of the following components:

`HexGameMain`: the main page of the game, where a player can create a game (`add_available_player` in the smart contract), join a created game (`start_game` in the smart contract) and open a game in progress to play or watch.

`HexGame`: a component with a game process. It uses the `HexField` component to draw the field (which in turn uses `Hex` to draw the hexes). When an active player selects an empty hex they can submit the move (`make_move` in the smart contract). The function `findPath` is also called which uses BFS to find out if there is a winning path. If there is, the button `move` changes to `win`. By pressing it `declare_win` function in the smart contract is called with the found path. <br>
If the current turn is not of the current account, the game data is read from the contract (`get_game` in the smart contract) every second so that the player does not have to reload the page while waiting for the opponent's turn.
