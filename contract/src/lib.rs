mod game;
use game::Game;
use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    env,
    near_bindgen,
    // serde::Serialize,
    store::{LookupMap, UnorderedMap},
    AccountId,
    BorshStorageKey,
    PanicOnDefault,
};

type GameId = u32;

const BOARD_SIZE: u32 = 11;

#[derive(BorshSerialize, BorshDeserialize, PanicOnDefault)]
#[near_bindgen]
pub struct HexGame {
    games: LookupMap<GameId, Game>,
    available_players: UnorderedMap<AccountId, Option<AccountId>>,
    available_games: UnorderedMap<GameId, (AccountId, AccountId)>,
    next_game_id: GameId,
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    Games,
    AvailablePlayers,
    AvailableGames,
}

#[near_bindgen]
impl HexGame {
    #[init(ignore_state)]
    pub fn new() -> Self {
        Self {
            games: LookupMap::new(StorageKey::Games),
            available_players: UnorderedMap::new(StorageKey::AvailablePlayers),
            available_games: UnorderedMap::new(StorageKey::AvailableGames),
            next_game_id: 0,
        }
    }

    pub fn add_available_player(&mut self, opponent: Option<AccountId>) {
        let account_id = env::predecessor_account_id();
        assert!(
            self.available_players.get(&account_id).is_none(),
            "Already in the waiting list"
        );
        self.check_if_game_started(&account_id);

        if let Some(opponent_id) = opponent.clone() {
            self.check_if_accounts_different(&account_id, &opponent_id);
        }

        self.available_players.insert(account_id, opponent);
    }

    pub fn start_game(&mut self, opponent_id: AccountId) -> GameId {
        if let Some(opponent) = self.available_players.get(&opponent_id) {
            let account_id = env::predecessor_account_id();

            self.check_if_accounts_different(&account_id, &opponent_id);
            self.check_if_game_started(&account_id);
            if let Some(player_id) = opponent {
                assert_eq!(*player_id, account_id, "Wrong account");
            }

            let game_id = self.next_game_id;

            let new_game = Game::new(opponent_id.clone(), account_id.clone(), BOARD_SIZE);

            self.games.insert(game_id, new_game);

            self.available_games
                .insert(game_id, (account_id.clone(), opponent_id.clone()));

            self.available_players.remove(&opponent_id);
            self.available_players.remove(&account_id);
            self.next_game_id += 1;

            game_id
        } else {
            panic!("No such opponent");
        }
    }

    pub fn make_move(&mut self, game_id: GameId, tile: u32) {
        let game = self.get_game_mut(&game_id);
        assert!(game.winner_index == 0, "Game already finished");

        let board_size = game.get_board_size();
        if tile >= board_size * board_size {
            panic!("Wrong tile");
        }

        let active_player = game.get_current_player_id();
        assert_eq!(
            *active_player,
            env::predecessor_account_id(),
            "Not your turn"
        );

        assert!(game.is_tile_free(tile), "Tile occupied");

        game.make_move(tile);
    }

    // pub fn declare_win(&mut self, game_id: GameId, tile: Option<u32>, path: Vec<u32>) {

    // }

    // pub fn give_up(&mut self, game_id: GameId) {

    // }

    fn check_if_game_started(&self, account_id: &AccountId) {
        let mut found = false;
        for (_, (player_1, player_2)) in self.available_games.iter() {
            if *player_1 == *account_id || *player_2 == *account_id {
                found = true;
                break;
            }
        }
        assert!(!found, "Another game already started");
    }

    fn check_if_accounts_different(&self, account_id1: &AccountId, account_id2: &AccountId) {
        assert_ne!(*account_id1, *account_id2, "Can't play with yourself");
    }

    // fn get_game(&mut self, game_id: &GameId) -> &Game {
    //     self.games.get(game_id).expect("Game not found")
    // }

    fn get_game_mut(&mut self, game_id: &GameId) -> &mut Game {
        self.games.get_mut(game_id).expect("Game not found")
    }
}
