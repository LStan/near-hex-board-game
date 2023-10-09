use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    AccountId,
};

// pub enum PlayerType {
//     First,
//     Second,
// }

#[derive(BorshDeserialize, BorshSerialize)]
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

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Game {
    player_id1: AccountId,
    player_id2: AccountId,
    board: Board,
    is_cur_player2: bool,
    pub winner_index: u32,
}

impl Game {
    pub fn new(player_id1: AccountId, player_id2: AccountId, size: u32) -> Game {
        Game {
            player_id1,
            player_id2,
            board: Board::new(size),
            is_cur_player2: false,
            winner_index: 0,
        }
    }

    pub fn get_board_size(&self) -> u32 {
        self.board.size
    }

    pub fn get_current_player_id(&self) -> &AccountId {
        if self.is_cur_player2 {
            &self.player_id2
        } else {
            &self.player_id1
        }
    }

    pub fn is_tile_free(&self, tile: u32) -> bool {
        *self.board.field.get(tile as usize).unwrap() == 0
    }

    pub fn make_move(&mut self, tile: u32) {
        self.board.field[tile as usize] = if self.is_cur_player2 { 2 } else { 1 };
    }
}
