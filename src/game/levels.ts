/**
 * World 1-1 Level Layout & Setup
 */

import { LevelData, TileType } from './types';

export function createWorld1_1(): LevelData {
  const widthInTiles = 224;
  const heightInTiles = 15; // 240px tall (15 * 16)

  // Initialize empty tilemap
  const tiles: number[][] = [];
  for (let r = 0; r < heightInTiles; r++) {
    tiles[r] = new Array(widthInTiles).fill(TileType.EMPTY);
  }

  // Helper to place ground
  const setGround = (startCol: number, endCol: number) => {
    for (let c = startCol; c <= endCol; c++) {
      tiles[13][c] = TileType.GROUND;
      tiles[14][c] = TileType.GROUND;
    }
  };

  // Helper to place a pipe
  const setPipe = (col: number, height: number) => {
    const topRow = 13 - height;
    tiles[topRow][col] = TileType.PIPE_TOP_LEFT;
    tiles[topRow][col + 1] = TileType.PIPE_TOP_RIGHT;
    for (let r = topRow + 1; r < 13; r++) {
      tiles[r][col] = TileType.PIPE_BODY_LEFT;
      tiles[r][col + 1] = TileType.PIPE_BODY_RIGHT;
    }
  };

  // Helper to place stairs / pyramid
  const setStairs = (startCol: number, height: number, direction: 'UP' | 'DOWN') => {
    for (let step = 0; step < height; step++) {
      const col = direction === 'UP' ? startCol + step : startCol + step;
      const stepH = direction === 'UP' ? step + 1 : height - step;
      for (let h = 0; h < stepH; h++) {
        tiles[12 - h][col] = TileType.HARD_BLOCK;
      }
    }
  };

  // 1. Solid Ground with iconic pits
  setGround(0, 68);
  // Pit 1: cols 69 to 71 (gap)
  setGround(72, 85);
  // Pit 2: cols 86 to 88 (gap)
  setGround(89, 152);
  // Pit 3: cols 153 to 154 (small gap)
  setGround(155, 223);

  // 2. Initial ? block and bricks
  // Single ? block with coin
  tiles[9][16] = TileType.QUESTION_COIN;

  // Brick - ? (Mushroom) - Brick - ? (Coin) - Brick
  tiles[9][20] = TileType.BRICK;
  tiles[9][21] = TileType.QUESTION_MUSHROOM;
  tiles[9][22] = TileType.BRICK;
  tiles[9][23] = TileType.QUESTION_COIN;
  tiles[9][24] = TileType.BRICK;

  // High ? block with coin
  tiles[5][22] = TileType.QUESTION_COIN;

  // 3. Pipes
  setPipe(28, 2); // 2-tile high pipe
  setPipe(38, 3); // 3-tile high pipe
  setPipe(46, 4); // 4-tile high pipe
  setPipe(57, 4); // 4-tile high pipe

  // 4. Floating platforms after pipes
  tiles[9][64] = TileType.BRICK;
  tiles[9][65] = TileType.QUESTION_MUSHROOM;
  tiles[9][66] = TileType.BRICK;

  // 5. Higher floating row over pit area
  for (let c = 80; c <= 87; c++) {
    tiles[5][c] = TileType.BRICK;
  }
  tiles[9][91] = TileType.BRICK;
  tiles[9][92] = TileType.QUESTION_COIN;
  tiles[9][93] = TileType.BRICK;

  // 6. Double question block row
  tiles[9][100] = TileType.QUESTION_COIN;
  tiles[9][101] = TileType.BRICK;
  tiles[9][102] = TileType.QUESTION_COIN;
  tiles[9][103] = TileType.BRICK;
  tiles[5][101] = TileType.QUESTION_COIN;

  // Pipes near pyramid
  setPipe(116, 2);
  setPipe(128, 2);

  // 7. Stepping pyramids
  setStairs(134, 4, 'UP');
  setStairs(138, 4, 'DOWN');

  setStairs(148, 4, 'UP');
  setStairs(152, 4, 'DOWN');

  // Final large flagpole pyramid stairs (8 steps up!)
  setStairs(181, 8, 'UP');
  // Pillar at top
  for (let h = 0; h < 8; h++) {
    tiles[12 - h][189] = TileType.HARD_BLOCK;
  }

  // Single block step before flagpole
  tiles[12][197] = TileType.HARD_BLOCK;

  // 8. Flagpole at col 198
  const flagX = 198 * 16;
  tiles[3][198] = TileType.FLAG_TOP;
  for (let r = 4; r <= 12; r++) {
    tiles[r][198] = TileType.FLAG_POLE;
  }

  // 9. Castle at cols 203 to 207
  const castleX = 203 * 16;
  for (let r = 8; r <= 12; r++) {
    for (let c = 203; c <= 207; c++) {
      tiles[r][c] = TileType.CASTLE_BRICK;
    }
  }
  // Castle battlements
  tiles[7][203] = TileType.CASTLE_BATTLEMENT;
  tiles[7][205] = TileType.CASTLE_BATTLEMENT;
  tiles[7][207] = TileType.CASTLE_BATTLEMENT;
  // Castle door
  tiles[11][205] = TileType.CASTLE_DOOR;
  tiles[12][205] = TileType.CASTLE_DOOR;
  // Windows
  tiles[9][204] = TileType.CASTLE_WINDOW;
  tiles[9][206] = TileType.CASTLE_WINDOW;

  // 10. Enemies
  const initialEnemies = [
    { type: 'GOOMBA' as const, x: 22 * 16, y: 12 * 16, vx: -0.6, vy: 0, width: 16, height: 16, facing: 'LEFT' as const, isGrounded: true },
    { type: 'GOOMBA' as const, x: 34 * 16, y: 12 * 16, vx: -0.6, vy: 0, width: 16, height: 16, facing: 'LEFT' as const, isGrounded: true },
    { type: 'GOOMBA' as const, x: 42 * 16, y: 12 * 16, vx: -0.6, vy: 0, width: 16, height: 16, facing: 'LEFT' as const, isGrounded: true },
    { type: 'KOOPA' as const,  x: 52 * 16, y: 11 * 16 + 8, vx: -0.5, vy: 0, width: 16, height: 24, facing: 'LEFT' as const, isGrounded: true },
    { type: 'GOOMBA' as const, x: 75 * 16, y: 12 * 16, vx: -0.6, vy: 0, width: 16, height: 16, facing: 'LEFT' as const, isGrounded: true },
    { type: 'GOOMBA' as const, x: 77 * 16, y: 12 * 16, vx: -0.6, vy: 0, width: 16, height: 16, facing: 'LEFT' as const, isGrounded: true },
    { type: 'KOOPA' as const,  x: 95 * 16, y: 11 * 16 + 8, vx: -0.5, vy: 0, width: 16, height: 24, facing: 'LEFT' as const, isGrounded: true },
    { type: 'GOOMBA' as const, x: 108 * 16, y: 12 * 16, vx: -0.6, vy: 0, width: 16, height: 16, facing: 'LEFT' as const, isGrounded: true },
    { type: 'GOOMBA' as const, x: 121 * 16, y: 12 * 16, vx: -0.6, vy: 0, width: 16, height: 16, facing: 'LEFT' as const, isGrounded: true },
    { type: 'KOOPA' as const,  x: 160 * 16, y: 11 * 16 + 8, vx: -0.5, vy: 0, width: 16, height: 24, facing: 'LEFT' as const, isGrounded: true },
  ];

  // 11. Initial floating coins
  const initialCoins = [
    { x: 33 * 16, y: 10 * 16 },
    { x: 34 * 16, y: 10 * 16 },
    { x: 35 * 16, y: 10 * 16 },
    { x: 81 * 16, y: 4 * 16 },
    { x: 82 * 16, y: 4 * 16 },
    { x: 83 * 16, y: 4 * 16 },
    { x: 84 * 16, y: 4 * 16 },
    { x: 85 * 16, y: 4 * 16 },
    { x: 112 * 16, y: 10 * 16 },
    { x: 113 * 16, y: 10 * 16 },
    { x: 114 * 16, y: 10 * 16 },
  ];

  return {
    widthInTiles,
    heightInTiles,
    tiles,
    initialEnemies,
    initialCoins,
    flagX,
    castleX,
  };
}
