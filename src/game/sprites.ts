/**
 * Pixel-perfect retro procedural sprite renderer for Mario, Enemies, Blocks, and Scenery
 */

import { Direction, MarioForm, TileType } from './types';

// Helper to draw a pixel block
export function drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
}

/**
 * Draw Mario (Small or Super)
 */
export function drawMario(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  form: MarioForm,
  facing: Direction,
  isGrounded: boolean,
  vx: number,
  walkFrame: number,
  isCrouching: boolean,
  isInvulnerable: boolean,
  isTransforming: boolean,
  isDying: boolean
) {
  // Flicker if invulnerable
  if (isInvulnerable && Math.floor(Date.now() / 60) % 2 === 0) {
    return;
  }

  // Flash between small and super if transforming
  const activeForm = isTransforming && Math.floor(Date.now() / 60) % 2 === 0 ? 'SMALL' : form;

  ctx.save();

  const px = Math.floor(x);
  const py = Math.floor(y);

  // If facing left, flip horizontally
  if (facing === 'LEFT') {
    ctx.translate(px + 16, py);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(px, py);
  }

  const RED = '#d82800';
  const BLUE = '#0058f8';
  const SKIN = '#fcbcb0';
  const BROWN = '#883800';
  const YELLOW = '#fcbc3c';
  const WHITE = '#ffffff';

  if (isDying) {
    // Mario Death Sprite (face forward, arms out, legs apart)
    ctx.fillStyle = RED;
    ctx.fillRect(4, 2, 8, 3); // hat
    ctx.fillRect(3, 5, 10, 2); // hat brim
    ctx.fillStyle = SKIN;
    ctx.fillRect(4, 7, 8, 4); // face
    ctx.fillStyle = BROWN;
    ctx.fillRect(4, 9, 8, 2); // mustache
    ctx.fillRect(5, 7, 2, 2); // eye L
    ctx.fillRect(9, 7, 2, 2); // eye R
    ctx.fillStyle = RED;
    ctx.fillRect(2, 11, 12, 3); // shirt
    ctx.fillStyle = BLUE;
    ctx.fillRect(4, 12, 8, 3); // overalls
    ctx.fillStyle = BROWN;
    ctx.fillRect(1, 14, 4, 2); // shoe L
    ctx.fillRect(11, 14, 4, 2); // shoe R
    ctx.restore();
    return;
  }

  if (activeForm === 'SMALL') {
    // Small Mario: 16x16
    // Hat
    ctx.fillStyle = RED;
    ctx.fillRect(4, 1, 7, 2);
    ctx.fillRect(3, 3, 11, 1);

    // Hair / Face
    ctx.fillStyle = BROWN;
    ctx.fillRect(3, 4, 3, 3); // sideburns
    ctx.fillRect(2, 6, 2, 2); // ear/hair

    ctx.fillStyle = SKIN;
    ctx.fillRect(6, 4, 6, 3); // forehead/nose
    ctx.fillRect(5, 6, 7, 2); // cheek/mouth

    // Eye & Mustache
    ctx.fillStyle = BROWN;
    ctx.fillRect(9, 4, 1, 2); // eye
    ctx.fillRect(7, 6, 5, 2); // mustache

    if (!isGrounded) {
      // JUMP POSE
      ctx.fillStyle = RED;
      ctx.fillRect(2, 8, 3, 3); // left arm back
      ctx.fillRect(11, 7, 3, 3); // right arm reach
      ctx.fillStyle = BLUE;
      ctx.fillRect(5, 8, 6, 5); // overalls
      ctx.fillStyle = RED;
      ctx.fillRect(4, 9, 2, 2); // chest red
      ctx.fillStyle = YELLOW;
      ctx.fillRect(9, 10, 1, 1); // button
      // Legs split
      ctx.fillStyle = BLUE;
      ctx.fillRect(2, 12, 4, 2);
      ctx.fillRect(10, 11, 4, 2);
      ctx.fillStyle = BROWN;
      ctx.fillRect(1, 13, 4, 2);
      ctx.fillRect(11, 12, 4, 2);
    } else if (Math.abs(vx) > 0.2 && ((vx > 0 && facing === 'LEFT') || (vx < 0 && facing === 'RIGHT'))) {
      // SKID POSE
      ctx.fillStyle = RED;
      ctx.fillRect(3, 8, 10, 2);
      ctx.fillStyle = BLUE;
      ctx.fillRect(4, 10, 8, 4);
      ctx.fillStyle = BROWN;
      ctx.fillRect(2, 14, 5, 2);
      ctx.fillRect(9, 14, 5, 2);
    } else if (Math.abs(vx) > 0.1) {
      // RUNNING ANIMATION (3 frames)
      ctx.fillStyle = RED;
      ctx.fillRect(4, 8, 8, 3); // shirt
      ctx.fillStyle = BLUE;
      ctx.fillRect(5, 9, 6, 5); // overalls
      ctx.fillStyle = YELLOW;
      ctx.fillRect(8, 10, 1, 1); // button

      if (walkFrame === 0) {
        // Legs stride 1
        ctx.fillStyle = BLUE;
        ctx.fillRect(4, 13, 3, 2);
        ctx.fillRect(9, 13, 3, 2);
        ctx.fillStyle = BROWN;
        ctx.fillRect(3, 14, 4, 2);
        ctx.fillRect(9, 14, 4, 2);
      } else if (walkFrame === 1) {
        // Legs stride 2
        ctx.fillStyle = BLUE;
        ctx.fillRect(2, 12, 4, 2);
        ctx.fillRect(8, 13, 4, 2);
        ctx.fillStyle = BROWN;
        ctx.fillRect(1, 13, 4, 2);
        ctx.fillRect(8, 14, 5, 2);
      } else {
        // Legs stride 3
        ctx.fillStyle = BLUE;
        ctx.fillRect(6, 12, 4, 2);
        ctx.fillRect(10, 12, 3, 2);
        ctx.fillStyle = BROWN;
        ctx.fillRect(4, 14, 4, 2);
        ctx.fillRect(11, 13, 4, 2);
      }
    } else {
      // STANDING
      ctx.fillStyle = RED;
      ctx.fillRect(4, 8, 8, 3);
      ctx.fillStyle = BLUE;
      ctx.fillRect(5, 9, 6, 5);
      ctx.fillStyle = YELLOW;
      ctx.fillRect(8, 10, 1, 1);
      ctx.fillStyle = BROWN;
      ctx.fillRect(3, 14, 4, 2);
      ctx.fillRect(8, 14, 5, 2);
    }
  } else {
    // SUPER MARIO: 16x32
    if (isCrouching) {
      // Super Mario Crouch (compact 16x22)
      ctx.fillStyle = RED;
      ctx.fillRect(4, 10, 8, 3);
      ctx.fillRect(3, 13, 11, 2);
      ctx.fillStyle = SKIN;
      ctx.fillRect(5, 15, 7, 4);
      ctx.fillStyle = BROWN;
      ctx.fillRect(8, 17, 5, 2);
      ctx.fillRect(9, 15, 2, 2);
      ctx.fillStyle = BLUE;
      ctx.fillRect(4, 19, 8, 9);
      ctx.fillStyle = BROWN;
      ctx.fillRect(3, 29, 10, 3);
    } else {
      // Hat
      ctx.fillStyle = RED;
      ctx.fillRect(4, 2, 8, 3);
      ctx.fillRect(3, 5, 11, 2);

      // Face
      ctx.fillStyle = BROWN;
      ctx.fillRect(3, 7, 3, 5); // hair
      ctx.fillRect(2, 10, 2, 3);

      ctx.fillStyle = SKIN;
      ctx.fillRect(6, 7, 7, 5); // face
      ctx.fillRect(5, 10, 8, 3);

      ctx.fillStyle = BROWN;
      ctx.fillRect(10, 7, 2, 3); // eye
      ctx.fillRect(8, 10, 6, 3); // mustache

      // Torso / Overalls
      ctx.fillStyle = RED;
      ctx.fillRect(3, 13, 10, 5); // shirt
      ctx.fillStyle = BLUE;
      ctx.fillRect(5, 15, 6, 11); // overalls
      ctx.fillStyle = YELLOW;
      ctx.fillRect(8, 18, 2, 2); // overalls button

      if (!isGrounded) {
        // Jump pose
        ctx.fillStyle = RED;
        ctx.fillRect(1, 13, 3, 6);
        ctx.fillRect(12, 11, 3, 6);
        ctx.fillStyle = BLUE;
        ctx.fillRect(2, 24, 5, 4);
        ctx.fillRect(9, 23, 5, 4);
        ctx.fillStyle = BROWN;
        ctx.fillRect(1, 27, 5, 3);
        ctx.fillRect(10, 26, 5, 3);
      } else if (Math.abs(vx) > 0.1) {
        // Running
        if (walkFrame === 0) {
          ctx.fillStyle = BLUE;
          ctx.fillRect(4, 25, 4, 4);
          ctx.fillRect(9, 25, 4, 4);
          ctx.fillStyle = BROWN;
          ctx.fillRect(2, 29, 6, 3);
          ctx.fillRect(9, 29, 6, 3);
        } else if (walkFrame === 1) {
          ctx.fillStyle = BLUE;
          ctx.fillRect(2, 24, 5, 4);
          ctx.fillRect(8, 25, 5, 4);
          ctx.fillStyle = BROWN;
          ctx.fillRect(1, 27, 5, 3);
          ctx.fillRect(9, 29, 6, 3);
        } else {
          ctx.fillStyle = BLUE;
          ctx.fillRect(5, 24, 5, 4);
          ctx.fillRect(10, 23, 4, 4);
          ctx.fillStyle = BROWN;
          ctx.fillRect(3, 29, 6, 3);
          ctx.fillRect(11, 27, 5, 3);
        }
      } else {
        // Standing
        ctx.fillStyle = BLUE;
        ctx.fillRect(4, 25, 4, 4);
        ctx.fillRect(9, 25, 4, 4);
        ctx.fillStyle = BROWN;
        ctx.fillRect(2, 29, 5, 3);
        ctx.fillRect(9, 29, 6, 3);
      }
    }
  }

  ctx.restore();
}

/**
 * Draw Goomba
 */
export function drawGoomba(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isDead: boolean,
  walkFrame: number
) {
  ctx.save();
  const px = Math.floor(x);
  const py = Math.floor(y);
  ctx.translate(px, py);

  const BROWN = '#b84400';
  const TAN = '#fcbc7c';
  const BLACK = '#000000';
  const WHITE = '#ffffff';

  if (isDead) {
    // Squished Goomba (flat 16x8)
    ctx.fillStyle = BROWN;
    ctx.fillRect(2, 10, 12, 3);
    ctx.fillRect(1, 13, 14, 3);
    ctx.fillStyle = BLACK;
    ctx.fillRect(4, 12, 3, 2);
    ctx.fillRect(9, 12, 3, 2);
    ctx.restore();
    return;
  }

  // Mushroom head
  ctx.fillStyle = BROWN;
  ctx.fillRect(5, 1, 6, 2);
  ctx.fillRect(3, 3, 10, 2);
  ctx.fillRect(2, 5, 12, 4);
  ctx.fillRect(1, 7, 14, 2);

  // Eyes & Eyebrows
  ctx.fillStyle = BLACK;
  ctx.fillRect(4, 5, 3, 1); // eyebrow L
  ctx.fillRect(9, 5, 3, 1); // eyebrow R
  ctx.fillStyle = WHITE;
  ctx.fillRect(4, 6, 2, 3); // eye L
  ctx.fillRect(10, 6, 2, 3); // eye R
  ctx.fillStyle = BLACK;
  ctx.fillRect(5, 7, 1, 2); // pupil L
  ctx.fillRect(10, 7, 1, 2); // pupil R

  // Stem / body
  ctx.fillStyle = TAN;
  ctx.fillRect(5, 9, 6, 4);

  // Feet walking animation
  ctx.fillStyle = BLACK;
  if (walkFrame === 0) {
    ctx.fillRect(1, 13, 5, 3); // left foot out
    ctx.fillRect(10, 13, 4, 3);
  } else {
    ctx.fillRect(2, 13, 4, 3);
    ctx.fillRect(10, 13, 5, 3); // right foot out
  }

  ctx.restore();
}

/**
 * Draw Koopa Troopa
 */
export function drawKoopa(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: Direction,
  isShell: boolean,
  walkFrame: number
) {
  ctx.save();
  const px = Math.floor(x);
  const py = Math.floor(y);

  if (facing === 'LEFT') {
    ctx.translate(px + 16, py);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(px, py);
  }

  const GREEN = '#00a800';
  const SHELL_RIM = '#ffffff';
  const SKIN = '#fcbc3c';
  const BLACK = '#000000';

  if (isShell) {
    // Shell 16x16
    ctx.fillStyle = GREEN;
    ctx.fillRect(3, 4, 10, 8);
    ctx.fillRect(4, 2, 8, 12);
    ctx.fillStyle = SHELL_RIM;
    ctx.fillRect(2, 12, 12, 3);
    ctx.fillStyle = BLACK;
    ctx.fillRect(6, 6, 4, 4);
    ctx.restore();
    return;
  }

  // Head (Koopa 16x24)
  ctx.fillStyle = SKIN;
  ctx.fillRect(8, 2, 6, 5);
  ctx.fillRect(10, 6, 5, 2);
  ctx.fillStyle = BLACK;
  ctx.fillRect(12, 3, 2, 2); // eye

  // Shell
  ctx.fillStyle = GREEN;
  ctx.fillRect(3, 8, 9, 8);
  ctx.fillRect(4, 7, 7, 10);
  ctx.fillStyle = SHELL_RIM;
  ctx.fillRect(2, 16, 11, 2);

  // Feet
  ctx.fillStyle = SKIN;
  if (walkFrame === 0) {
    ctx.fillRect(3, 18, 4, 4);
    ctx.fillRect(9, 19, 4, 3);
  } else {
    ctx.fillRect(3, 19, 4, 3);
    ctx.fillRect(8, 18, 5, 4);
  }

  ctx.restore();
}

/**
 * Draw Super Mushroom
 */
export function drawMushroom(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  const px = Math.floor(x);
  const py = Math.floor(y);
  ctx.translate(px, py);

  const RED = '#e40058';
  const WHITE = '#ffffff';
  const TAN = '#fce0a8';
  const BLACK = '#000000';

  // Cap
  ctx.fillStyle = RED;
  ctx.fillRect(4, 1, 8, 2);
  ctx.fillRect(2, 3, 12, 6);
  ctx.fillRect(1, 5, 14, 4);

  // White spots
  ctx.fillStyle = WHITE;
  ctx.fillRect(6, 2, 4, 3); // top spot
  ctx.fillRect(2, 5, 3, 3); // left spot
  ctx.fillRect(11, 5, 3, 3); // right spot

  // Stem
  ctx.fillStyle = TAN;
  ctx.fillRect(4, 9, 8, 6);

  // Eyes
  ctx.fillStyle = BLACK;
  ctx.fillRect(5, 11, 1, 3);
  ctx.fillRect(10, 11, 1, 3);

  ctx.restore();
}

/**
 * Draw Animated Coin
 */
export function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, animFrame: number) {
  ctx.save();
  const px = Math.floor(x);
  const py = Math.floor(y);
  ctx.translate(px, py);

  const GOLD = '#fcbc3c';
  const LIGHT_GOLD = '#ffffff';
  const DARK_GOLD = '#d85600';

  // 4 rotation frames: 0 (wide), 1 (medium), 2 (thin slit), 3 (medium)
  const step = animFrame % 4;

  if (step === 0) {
    ctx.fillStyle = DARK_GOLD;
    ctx.fillRect(4, 2, 8, 12);
    ctx.fillStyle = GOLD;
    ctx.fillRect(5, 3, 6, 10);
    ctx.fillStyle = LIGHT_GOLD;
    ctx.fillRect(7, 4, 2, 8);
  } else if (step === 1 || step === 3) {
    ctx.fillStyle = DARK_GOLD;
    ctx.fillRect(6, 2, 4, 12);
    ctx.fillStyle = GOLD;
    ctx.fillRect(7, 3, 2, 10);
  } else {
    // Thin slit
    ctx.fillStyle = DARK_GOLD;
    ctx.fillRect(7, 2, 2, 12);
    ctx.fillStyle = LIGHT_GOLD;
    ctx.fillRect(7, 4, 1, 8);
  }

  ctx.restore();
}

/**
 * Draw Level Tiles (Ground, Bricks, Question Blocks, Pipes, Flag, Castle)
 */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileType,
  x: number,
  y: number,
  shimmerFrame: number = 0
) {
  const px = Math.floor(x);
  const py = Math.floor(y);

  switch (tile) {
    case TileType.GROUND: {
      // Brown brick dirt with green grassy top
      ctx.fillStyle = '#00a800'; // grass top
      ctx.fillRect(px, py, 16, 3);
      ctx.fillStyle = '#d85600'; // dirt body
      ctx.fillRect(px, py + 3, 16, 13);
      // Dirt texture specks
      ctx.fillStyle = '#943200';
      ctx.fillRect(px + 2, py + 5, 3, 2);
      ctx.fillRect(px + 9, py + 8, 3, 2);
      ctx.fillRect(px + 4, py + 12, 3, 2);
      ctx.fillRect(px + 12, py + 13, 2, 2);
      ctx.fillStyle = '#fcbcb0';
      ctx.fillRect(px + 3, py + 3, 2, 1);
      ctx.fillRect(px + 11, py + 3, 2, 1);
      break;
    }
    case TileType.BRICK: {
      // Classic Terracotta Brick
      ctx.fillStyle = '#d85600';
      ctx.fillRect(px, py, 16, 16);
      ctx.fillStyle = '#000000';
      // Mortar lines
      ctx.fillRect(px, py + 7, 16, 1);
      ctx.fillRect(px + 7, py, 1, 7);
      ctx.fillRect(px + 3, py + 8, 1, 8);
      ctx.fillRect(px + 12, py + 8, 1, 8);
      // Highlight brick bevels
      ctx.fillStyle = '#fcbcb0';
      ctx.fillRect(px + 1, py + 1, 6, 1);
      ctx.fillRect(px + 8, py + 1, 7, 1);
      ctx.fillRect(px + 1, py + 8, 2, 1);
      ctx.fillRect(px + 4, py + 8, 7, 1);
      ctx.fillRect(px + 13, py + 8, 2, 1);
      break;
    }
    case TileType.QUESTION_COIN:
    case TileType.QUESTION_MUSHROOM: {
      // Animated Question Mark Block
      const colors = ['#fc9838', '#fcbc3c', '#d85600'];
      const baseCol = colors[shimmerFrame % 3];

      ctx.fillStyle = baseCol;
      ctx.fillRect(px, py, 16, 16);

      // Border and corner rivets
      ctx.fillStyle = '#000000';
      ctx.strokeRect(px + 0.5, py + 0.5, 15, 15);
      ctx.fillRect(px + 1, py + 1, 2, 2);
      ctx.fillRect(px + 13, py + 1, 2, 2);
      ctx.fillRect(px + 1, py + 13, 2, 2);
      ctx.fillRect(px + 13, py + 13, 2, 2);

      // Question Mark "?"
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 5, py + 3, 6, 2);
      ctx.fillRect(px + 9, py + 5, 2, 3);
      ctx.fillRect(px + 7, py + 7, 2, 2);
      ctx.fillRect(px + 7, py + 11, 2, 2); // dot
      break;
    }
    case TileType.QUESTION_EMPTY: {
      // Inactive brown block with corner dots
      ctx.fillStyle = '#943200';
      ctx.fillRect(px, py, 16, 16);
      ctx.fillStyle = '#000000';
      ctx.strokeRect(px + 0.5, py + 0.5, 15, 15);
      ctx.fillRect(px + 2, py + 2, 2, 2);
      ctx.fillRect(px + 12, py + 2, 2, 2);
      ctx.fillRect(px + 2, py + 12, 2, 2);
      ctx.fillRect(px + 12, py + 12, 2, 2);
      break;
    }
    case TileType.HARD_BLOCK: {
      // Pyramid stone / solid block
      ctx.fillStyle = '#943200';
      ctx.fillRect(px, py, 16, 16);
      ctx.fillStyle = '#fcbcb0'; // light top bevel
      ctx.fillRect(px, py, 16, 2);
      ctx.fillRect(px, py, 2, 16);
      ctx.fillStyle = '#000000';
      ctx.fillRect(px + 14, py, 2, 16);
      ctx.fillRect(px, py + 14, 16, 2);
      break;
    }
    case TileType.PIPE_TOP_LEFT: {
      ctx.fillStyle = '#00a800';
      ctx.fillRect(px, py, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 2, py, 3, 16); // shine
      ctx.fillStyle = '#006800';
      ctx.fillRect(px, py, 1, 16);
      ctx.fillRect(px, py, 16, 2);
      break;
    }
    case TileType.PIPE_TOP_RIGHT: {
      ctx.fillStyle = '#00a800';
      ctx.fillRect(px, py, 16, 16);
      ctx.fillStyle = '#006800';
      ctx.fillRect(px + 11, py, 5, 16); // shadow
      ctx.fillRect(px, py, 16, 2);
      break;
    }
    case TileType.PIPE_BODY_LEFT: {
      ctx.fillStyle = '#00a800';
      ctx.fillRect(px + 2, py, 14, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 4, py, 3, 16);
      ctx.fillStyle = '#006800';
      ctx.fillRect(px + 2, py, 1, 16);
      break;
    }
    case TileType.PIPE_BODY_RIGHT: {
      ctx.fillStyle = '#00a800';
      ctx.fillRect(px, py, 14, 16);
      ctx.fillStyle = '#006800';
      ctx.fillRect(px + 9, py, 5, 16);
      break;
    }
    case TileType.FLAG_POLE: {
      ctx.fillStyle = '#00a800';
      ctx.fillRect(px + 7, py, 2, 16);
      break;
    }
    case TileType.FLAG_TOP: {
      ctx.fillStyle = '#00a800';
      ctx.fillRect(px + 5, py + 4, 6, 6);
      ctx.fillRect(px + 7, py + 10, 2, 6);
      break;
    }
    case TileType.CASTLE_BRICK: {
      ctx.fillStyle = '#943200';
      ctx.fillRect(px, py, 16, 16);
      ctx.fillStyle = '#fcbcb0';
      ctx.fillRect(px + 1, py + 1, 14, 1);
      ctx.fillStyle = '#000000';
      ctx.fillRect(px, py + 7, 16, 1);
      ctx.fillRect(px + 7, py, 1, 8);
      break;
    }
    case TileType.CASTLE_DOOR: {
      ctx.fillStyle = '#000000';
      ctx.fillRect(px, py, 16, 16);
      break;
    }
    case TileType.CASTLE_WINDOW: {
      ctx.fillStyle = '#943200';
      ctx.fillRect(px, py, 16, 16);
      ctx.fillStyle = '#000000';
      ctx.fillRect(px + 4, py + 3, 8, 10);
      break;
    }
    case TileType.CASTLE_BATTLEMENT: {
      ctx.fillStyle = '#943200';
      ctx.fillRect(px + 1, py + 4, 14, 12);
      ctx.fillStyle = '#fcbcb0';
      ctx.fillRect(px + 1, py + 4, 14, 2);
      break;
    }
    default:
      break;
  }
}

/**
 * Background elements: Hills, Clouds, Bushes
 */
export function drawScenery(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  canvasWidth: number,
  canvasHeight: number
) {
  // Clear Sky
  ctx.fillStyle = '#5c94fc';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Parallax clouds (slow scroll)
  const cloudOffset = -(cameraX * 0.3) % 400;
  for (let x = cloudOffset - 100; x < canvasWidth + 100; x += 220) {
    drawCloud(ctx, x, 36);
    drawCloud(ctx, x + 110, 68);
  }

  // Parallax green hills (medium scroll)
  const hillOffset = -(cameraX * 0.5) % 360;
  for (let x = hillOffset - 80; x < canvasWidth + 100; x += 260) {
    drawHill(ctx, x, 176);
  }

  // Bushes (ground level)
  const bushOffset = -(cameraX * 1.0) % 240;
  for (let x = bushOffset - 50; x < canvasWidth + 80; x += 190) {
    drawBush(ctx, x, 184);
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  // Fluffy 3-bump cloud
  ctx.beginPath();
  ctx.arc(x + 16, y + 10, 10, 0, Math.PI * 2);
  ctx.arc(x + 28, y + 6, 14, 0, Math.PI * 2);
  ctx.arc(x + 42, y + 10, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + 10, y + 10, 38, 8);
  ctx.restore();
}

function drawHill(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = '#00a800';
  ctx.beginPath();
  ctx.arc(x + 36, y + 36, 40, Math.PI, 0, false);
  ctx.fill();

  // Highlight spots
  ctx.fillStyle = '#006800';
  ctx.fillRect(x + 24, y + 12, 4, 4);
  ctx.fillRect(x + 44, y + 18, 4, 4);
  ctx.fillRect(x + 32, y + 26, 4, 4);
  ctx.restore();
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = '#00a800';
  ctx.beginPath();
  ctx.arc(x + 10, y + 6, 8, 0, Math.PI * 2);
  ctx.arc(x + 20, y + 4, 10, 0, Math.PI * 2);
  ctx.arc(x + 30, y + 6, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + 4, y + 6, 32, 10);
  ctx.restore();
}
