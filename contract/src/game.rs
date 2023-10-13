use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    serde::{Deserialize, Serialize},
    AccountId,
};

const TILE_EMPTY: u8 = 0;
const TILE_PLAYER1: u8 = 1;
const TILE_PLAYER2: u8 = 2;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Board {
    size: u32,
    field: Vec<u8>, // 0 - empty hex; 1, 2 - player's hex
}

impl Board {
    pub fn new(size: u32) -> Board {
        let len: u32 = size * size;
        Board {
            size,
            field: vec![0; len as usize],
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Game {
    player_id1: AccountId,
    player_id2: AccountId,
    board: Board,
    is_first_player_turn: bool,
    winner_index: u32,
}

impl Game {
    pub fn new(player_id1: AccountId, player_id2: AccountId, size: u32) -> Game {
        Game {
            player_id1,
            player_id2,
            board: Board::new(size),
            is_first_player_turn: true,
            winner_index: 0,
        }
    }

    pub fn get_board_size(&self) -> u32 {
        self.board.size
    }

    pub fn get_board(&self) -> &Board {
        &self.board
    }

    pub fn get_current_player_id(&self) -> AccountId {
        if self.is_first_player_turn {
            self.player_id1.clone()
        } else {
            self.player_id2.clone()
        }
    }

    fn is_tile_free(&self, tile: u32) -> bool {
        *self.board.field.get(tile as usize).unwrap() == TILE_EMPTY
    }

    pub fn make_move(&mut self, tile: u32, player_id: &AccountId) {
        let board_size = self.get_board_size();
        assert!(tile < board_size * board_size, "Wrong tile");

        let active_player = self.get_current_player_id();
        assert_eq!(active_player, *player_id, "Not your turn");

        assert!(self.is_tile_free(tile), "Tile occupied");

        self.board.field[tile as usize] = if self.is_first_player_turn {
            TILE_PLAYER1
        } else {
            TILE_PLAYER2
        };

        self.is_first_player_turn = !self.is_first_player_turn;
    }

    pub fn is_path_correct(&self, path: &Vec<u32>, player_id: &AccountId) -> bool {
        let tile_type = if player_id == &self.player_id1 {
            TILE_PLAYER1
        } else if player_id == &self.player_id2 {
            TILE_PLAYER2
        } else {
            panic!("Wrong account")
        };

        let board_size = self.get_board_size();
        if path.len() < board_size as usize {
            return false;
        }

        let board_size_full = board_size * board_size;

        let mut first_tile = true;
        let mut prev_tile_col = 0;
        let mut prev_tile_row = 0;

        for tile in path {
            if *tile >= board_size_full {
                return false;
            }
            let cur_tile_type = self.board.field[*tile as usize];
            if cur_tile_type != tile_type {
                return false;
            }
            let tile_col = (tile % board_size) as i32;
            let tile_row = (tile / board_size) as i32;

            if !first_tile {
                if !(tile_col - 1 == prev_tile_col && tile_row == prev_tile_row
                    || tile_col + 1 == prev_tile_col && tile_row == prev_tile_row
                    || tile_col == prev_tile_col && tile_row - 1 == prev_tile_row
                    || tile_col == prev_tile_col && tile_row + 1 == prev_tile_row
                    || tile_col + 1 == prev_tile_col && tile_row - 1 == prev_tile_row
                    || tile_col - 1 == prev_tile_col && tile_row + 1 == prev_tile_row)
                {
                    return false;
                }
            } else {
                if tile_type == TILE_PLAYER1 {
                    if tile_row != 0 {
                        return false;
                    }
                } else {
                    if tile_col != 0 {
                        return false;
                    }
                }
            }
            prev_tile_col = tile_col;
            prev_tile_row = tile_row;

            first_tile = false;
        }

        let last_tile = path.last().unwrap();
        let last_tile_col = last_tile % board_size;
        let last_tile_row = last_tile / board_size;
        if tile_type == TILE_PLAYER1 {
            if last_tile_row != board_size - 1 {
                return false;
            }
        } else {
            if last_tile_col != board_size - 1 {
                return false;
            }
        }

        true
    }

    pub fn win(&mut self, player_id: &AccountId) {
        let winner_index = if *player_id == self.player_id1 {
            1
        } else if *player_id == self.player_id2 {
            2
        } else {
            panic!("Wrong account")
        };
        self.winner_index = winner_index;
    }

    pub fn give_up(&mut self, player_id: &AccountId) {
        let winner_index = if *player_id == self.player_id1 {
            2
        } else if *player_id == self.player_id2 {
            1
        } else {
            panic!("Wrong account")
        };
        self.winner_index = winner_index;
    }

    pub fn is_not_finished(&self) -> bool {
        self.winner_index == 0
    }
}

#[cfg(test)]
impl Board {
    pub fn set_field(&mut self, new_field: Vec<u8>) {
        self.field = new_field;
    }

    pub fn new_with_field(size: u32, field: Vec<u8>) -> Board {
        Board { size, field: field }
    }
}

#[cfg(test)]
impl Game {
    // pub fn set_board(&mut self, new_board: Board) {
    //     self.board = new_board;
    // }

    pub fn new_with_field(
        player_id1: AccountId,
        player_id2: AccountId,
        size: u32,
        field: Vec<u8>,
    ) -> Game {
        Game {
            player_id1,
            player_id2,
            board: Board::new_with_field(size, field),
            is_first_player_turn: true,
            winner_index: 0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test() {
        let player_id1 = AccountId::new_unchecked("player_id1".to_string());
        let player_id2 = AccountId::new_unchecked("player_id2".to_string());
        let size = 5;
        // 0,  1,  2,  3,  4,
        //  5,  6,  7,  8,  9,
        //   10, 11, 12, 13, 14,
        //    15, 16, 17, 18, 19,
        //     20, 21, 22, 23, 24,
        #[rustfmt::skip]
        let field = vec![
            0, 0, 0, 1, 0,
             0, 0, 1, 0, 0,
              0, 0, 1, 1, 0,
               0, 0, 0, 1, 0,
                0, 1, 1, 0, 0,
        ];
        let game = Game::new_with_field(player_id1.clone(), player_id2.clone(), size, field);
        let path = vec![3, 7, 12, 13, 18, 22];
        assert!(game.is_path_correct(&path, &player_id1));

        let path = vec![3, 7, 12, 13, 18, 23];
        assert!(!game.is_path_correct(&path, &player_id1));

        let path = vec![3, 7, 12, 13, 18];
        assert!(!game.is_path_correct(&path, &player_id1));

        let path = vec![3, 7, 12, 13, 18, 21];
        assert!(!game.is_path_correct(&path, &player_id1));
    }

    #[test]
    fn test2() {
        let player_id1 = AccountId::new_unchecked("player_id1".to_string());
        let player_id2 = AccountId::new_unchecked("player_id2".to_string());
        let size = 5;
        // 0,  1,  2,  3,  4,
        //  5,  6,  7,  8,  9,
        //   10, 11, 12, 13, 14,
        //    15, 16, 17, 18, 19,
        //     20, 21, 22, 23, 24,
        #[rustfmt::skip]
        let field = vec![
            0, 0, 0, 1, 1,
             0, 1, 1, 0, 1,
              1, 0, 1, 1, 0,
               1, 0, 0, 0, 0,
                1, 0, 1, 0, 0,
        ];
        let game = Game::new_with_field(player_id1.clone(), player_id2.clone(), size, field);
        let path = vec![3, 4, 9, 13, 12, 7, 6, 10, 15, 20];
        assert!(game.is_path_correct(&path, &player_id1));
    }

    #[test]
    fn test3() {
        let player_id1 = AccountId::new_unchecked("player_id1".to_string());
        let player_id2 = AccountId::new_unchecked("player_id2".to_string());
        let size = 7;
        // 0,  1,  2,  3,  4,  5,  6
        //  7,  8,  9, 10, 11, 12, 13
        //   14, 15, 16, 17, 18, 19, 20
        //    21, 22, 23, 24, 25, 26, 27
        //     28, 29, 30, 31, 32, 33, 34
        //      35, 36, 37, 38, 39, 40, 41
        //       42, 43, 44, 45, 46, 47, 48
        #[rustfmt::skip]
        let field = vec![
            0, 0, 0, 0, 0, 0, 0,
             0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 2, 2,
               2, 2, 0, 0, 2, 0, 0,
                0, 2, 0, 2, 0, 0, 0,
                 0, 2, 2, 0, 0, 0, 0,
                  0, 0, 0, 0, 0, 0, 0,
        ];
        let game = Game::new_with_field(player_id1.clone(), player_id2.clone(), size, field);
        let path = vec![21, 22, 29, 36, 37, 31, 25, 19, 20];
        assert!(game.is_path_correct(&path, &player_id2));
    }

    #[test]
    fn test_make_move() {
        let player_id1 = AccountId::new_unchecked("player_id1".to_string());
        let player_id2 = AccountId::new_unchecked("player_id2".to_string());
        let size = 7;
        let mut game = Game::new(player_id1.clone(), player_id2.clone(), size);
        game.make_move(0, &player_id1);
        game.make_move(1, &player_id2);
    }

    #[test]
    #[should_panic]
    fn test_make_move_fail1() {
        let player_id1 = AccountId::new_unchecked("player_id1".to_string());
        let player_id2 = AccountId::new_unchecked("player_id2".to_string());
        let size = 7;
        let mut game = Game::new(player_id1.clone(), player_id2.clone(), size);
        game.make_move(0, &player_id2);
    }

    #[test]
    #[should_panic]
    fn test_make_move_fail2() {
        let player_id1 = AccountId::new_unchecked("player_id1".to_string());
        let player_id2 = AccountId::new_unchecked("player_id2".to_string());
        let size = 7;
        let mut game = Game::new(player_id1.clone(), player_id2.clone(), size);
        game.make_move(0, &player_id1);
        game.make_move(1, &player_id1);
    }

    #[test]
    #[should_panic]
    fn test_make_move_fail3() {
        let player_id1 = AccountId::new_unchecked("player_id1".to_string());
        let player_id2 = AccountId::new_unchecked("player_id2".to_string());
        let size = 7;
        let mut game = Game::new(player_id1.clone(), player_id2.clone(), size);
        game.make_move(1, &player_id1);
        game.make_move(1, &player_id2);
    }
}
