/**
 * Core type definitions for Super Plumber Retro Run
 */

export type GameStatus = 'TITLE' | 'PLAYING' | 'PAUSED' | 'DYING' | 'LEVEL_CLEAR' | 'GAME_OVER';

export type MarioForm = 'SMALL' | 'SUPER';

export type Direction = 'LEFT' | 'RIGHT';

export enum TileType {
  EMPTY = 0,
  GROUND = 1,
  BRICK = 2,
  QUESTION_COIN = 3,
  QUESTION_MUSHROOM = 4,
  QUESTION_EMPTY = 5,
  HARD_BLOCK = 6,
  PIPE_TOP_LEFT = 7,
  PIPE_TOP_RIGHT = 8,
  PIPE_BODY_LEFT = 9,
  PIPE_BODY_RIGHT = 10,
  FLAG_POLE = 11,
  FLAG_TOP = 12,
  CASTLE_BRICK = 13,
  CASTLE_DOOR = 14,
  CASTLE_WINDOW = 15,
  CASTLE_BATTLEMENT = 16,
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: Direction;
  isGrounded: boolean;
  isJumping: boolean;
  isCrouching: boolean;
  form: MarioForm;
  isInvulnerable: boolean;
  invulnerableTimer: number; // in frames
  isTransforming: boolean;
  transformTimer: number;
  deadTimer: number;
  walkFrame: number;
  walkAnimCounter: number;
}

export type EnemyType = 'GOOMBA' | 'KOOPA';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: Direction;
  isGrounded: boolean;
  isDead: boolean;
  deadTimer: number; // for squished goomba
  isShell: boolean;  // for koopa in shell
  isShellMoving: boolean;
  walkFrame: number;
  walkAnimCounter: number;
}

export interface Collectible {
  id: number;
  type: 'COIN_POP' | 'MUSHROOM' | 'WORLD_COIN';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  collected: boolean;
  animTimer: number;
  targetY?: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  life: number;
}

export interface BumpedTile {
  col: number;
  row: number;
  originalType: TileType;
  newType: TileType;
  offsetY: number;
  vy: number;
  timer: number;
}

export interface LevelData {
  widthInTiles: number;
  heightInTiles: number;
  tiles: number[][]; // [row][col]
  initialEnemies: Omit<Enemy, 'id' | 'isDead' | 'deadTimer' | 'isShell' | 'isShellMoving' | 'walkFrame' | 'walkAnimCounter'>[];
  initialCoins: { x: number; y: number }[];
  flagX: number;
  castleX: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  down: boolean;
  jump: boolean;
  run: boolean;
}
