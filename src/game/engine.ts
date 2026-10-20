/**
 * Core Game Engine: Physics, AABB Collision Detection, Entities, Camera, Scoring
 */

import {
  BumpedTile,
  Collectible,
  Enemy,
  FloatingText,
  GameStatus,
  InputState,
  LevelData,
  Particle,
  Player,
  TileType,
} from './types';
import { createWorld1_1 } from './levels';
import { sound } from './sound';
import {
  drawCoin,
  drawGoomba,
  drawKoopa,
  drawMario,
  drawMushroom,
  drawScenery,
  drawTile,
} from './sprites';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public status: GameStatus = 'TITLE';
  public score: number = 0;
  public highScore: number = 0;
  public coins: number = 0;
  public lives: number = 3;
  public timeLeft: number = 400;
  public worldName: string = '1-1';

  public player: Player;
  public enemies: Enemy[] = [];
  public collectibles: Collectible[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public bumpedTiles: BumpedTile[] = [];

  public level: LevelData;
  public cameraX: number = 0;
  public flagY: number = 4 * 16;
  public targetFlagY: number = 12 * 16;
  public castleFlagRaised: boolean = false;
  public timeBonusTally: number = 0;

  // Frame timing
  private lastTime: number = 0;
  private animFrameId: number | null = null;
  private secondTimer: number = 0;
  private shimmerTimer: number = 0;
  private shimmerFrame: number = 0;

  // Active inputs
  public input: InputState = {
    left: false,
    right: false,
    down: false,
    jump: false,
    run: false,
  };

  private onStateChange?: (engine: GameEngine) => void;

  constructor(canvas: HTMLCanvasElement, onStateChange?: (engine: GameEngine) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStateChange = onStateChange;

    // Load high score
    const saved = localStorage.getItem('super_plumber_high_score');
    if (saved) {
      this.highScore = parseInt(saved, 10) || 0;
    }

    this.level = createWorld1_1();
    this.player = this.createDefaultPlayer();
  }

  private createDefaultPlayer(): Player {
    return {
      x: 40,
      y: 192,
      vx: 0,
      vy: 0,
      width: 12,
      height: 15,
      facing: 'RIGHT',
      isGrounded: true,
      isJumping: false,
      isCrouching: false,
      form: 'SMALL',
      isInvulnerable: false,
      invulnerableTimer: 0,
      isTransforming: false,
      transformTimer: 0,
      deadTimer: 0,
      walkFrame: 0,
      walkAnimCounter: 0,
    };
  }

  public init() {
    this.status = 'TITLE';
    this.resetLevel(false);
    this.startLoop();
  }

  public startNewGame() {
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.resetLevel(true);
    this.status = 'PLAYING';
    sound.startBgm();
    this.notifyState();
  }

  public resetLevel(resetTime: boolean = true) {
    this.level = createWorld1_1();
    this.player = this.createDefaultPlayer();
    this.cameraX = 0;
    this.flagY = 4 * 16;
    this.castleFlagRaised = false;
    this.timeBonusTally = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.bumpedTiles = [];

    if (resetTime) {
      this.timeLeft = 400;
    }

    // Populate enemies
    this.enemies = this.level.initialEnemies.map((e, idx) => ({
      ...e,
      id: idx + 1,
      isDead: false,
      deadTimer: 0,
      isShell: false,
      isShellMoving: false,
      walkFrame: 0,
      walkAnimCounter: 0,
    }));

    // Populate floating world coins
    this.collectibles = this.level.initialCoins.map((c, idx) => ({
      id: idx + 1,
      type: 'WORLD_COIN',
      x: c.x,
      y: c.y,
      vx: 0,
      vy: 0,
      width: 14,
      height: 14,
      collected: false,
      animTimer: Math.floor(Math.random() * 20),
    }));
  }

  public pauseGame() {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
      sound.stopBgm();
      this.notifyState();
    } else if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
      sound.startBgm();
      this.notifyState();
    }
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    sound.stopBgm();
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange(this);
    }
  }

  private addScore(points: number, x: number, y: number) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('super_plumber_high_score', this.highScore.toString());
    }
    this.floatingTexts.push({
      id: Date.now() + Math.random(),
      text: points.toString(),
      x,
      y,
      vy: -1.2,
      life: 35,
    });
    this.notifyState();
  }

  private addCoin(x: number, y: number) {
    this.coins++;
    sound.playCoin();
    this.addScore(200, x, y);
    if (this.coins >= 100) {
      this.coins -= 100;
      this.lives++;
      sound.playPowerUp();
      this.floatingTexts.push({
        id: Date.now() + Math.random(),
        text: '1UP',
        x,
        y: y - 10,
        vy: -1.2,
        life: 45,
      });
    }
  }

  // Check if tile is solid
  private isSolidTile(type: TileType): boolean {
    return (
      type === TileType.GROUND ||
      type === TileType.BRICK ||
      type === TileType.QUESTION_COIN ||
      type === TileType.QUESTION_MUSHROOM ||
      type === TileType.QUESTION_EMPTY ||
      type === TileType.HARD_BLOCK ||
      type === TileType.PIPE_TOP_LEFT ||
      type === TileType.PIPE_TOP_RIGHT ||
      type === TileType.PIPE_BODY_LEFT ||
      type === TileType.PIPE_BODY_RIGHT ||
      type === TileType.CASTLE_BRICK ||
      type === TileType.CASTLE_WINDOW ||
      type === TileType.CASTLE_BATTLEMENT
    );
  }

  private startLoop() {
    const loop = (timestamp: number) => {
      if (!this.lastTime) this.lastTime = timestamp;
      const dt = timestamp - this.lastTime;
      this.lastTime = timestamp;

      // Update game physics & state
      this.update(dt);

      // Render crisp canvas frame
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  /**
   * Main Game Update Step
   */
  private update(_dt: number) {
    // Shimmer timer for question blocks and coins
    this.shimmerTimer++;
    if (this.shimmerTimer % 8 === 0) {
      this.shimmerFrame = (this.shimmerFrame + 1) % 4;
    }

    if (this.status === 'PAUSED') {
      return;
    }

    // Update bumped tile animations
    this.updateBumpedTiles();

    // Update particles & floating texts
    this.updateParticles();
    this.updateFloatingTexts();

    if (this.status === 'PLAYING') {
      // Countdown timer
      this.secondTimer++;
      if (this.secondTimer >= 60) {
        this.secondTimer = 0;
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.killPlayer();
        }
        this.notifyState();
      }

      this.updatePlayer();
      this.updateEnemies();
      this.updateCollectibles();
      this.updateCamera();
    } else if (this.status === 'DYING') {
      this.updateDyingPlayer();
    } else if (this.status === 'LEVEL_CLEAR') {
      this.updateLevelClear();
    }
  }

  /**
   * Player Movement, Physics, & Tile Collisions
   */
  private updatePlayer() {
    const p = this.player;

    // Transformation freeze
    if (p.isTransforming) {
      p.transformTimer--;
      if (p.transformTimer <= 0) {
        p.isTransforming = false;
      }
      return;
    }

    // Invulnerability timer
    if (p.isInvulnerable) {
      p.invulnerableTimer--;
      if (p.invulnerableTimer <= 0) {
        p.isInvulnerable = false;
      }
    }

    // Crouch handling (Super Mario only)
    if (p.form === 'SUPER' && this.input.down && p.isGrounded) {
      p.isCrouching = true;
      p.height = 20;
    } else {
      p.isCrouching = false;
      p.height = p.form === 'SUPER' ? 30 : 15;
    }

    // Horizontal Movement Acceleration & Friction
    const accel = this.input.run ? 0.22 : 0.13;
    const maxSpeed = this.input.run ? 3.6 : 2.2;
    const friction = 0.12;

    if (!p.isCrouching) {
      if (this.input.left) {
        p.facing = 'LEFT';
        if (p.vx > 0) {
          p.vx -= accel * 2; // skid deceleration
        } else if (p.vx > -maxSpeed) {
          p.vx -= accel;
        }
      } else if (this.input.right) {
        p.facing = 'RIGHT';
        if (p.vx < 0) {
          p.vx += accel * 2; // skid deceleration
        } else if (p.vx < maxSpeed) {
          p.vx += accel;
        }
      } else {
        // Friction when no input
        if (p.vx > friction) {
          p.vx -= friction;
        } else if (p.vx < -friction) {
          p.vx += friction;
        } else {
          p.vx = 0;
        }
      }
    } else {
      // Crouch friction
      p.vx *= 0.85;
      if (Math.abs(p.vx) < 0.1) p.vx = 0;
    }

    // Walk frame animation counter
    if (Math.abs(p.vx) > 0.1 && p.isGrounded) {
      p.walkAnimCounter++;
      const speedDiv = this.input.run ? 4 : 7;
      if (p.walkAnimCounter >= speedDiv) {
        p.walkAnimCounter = 0;
        p.walkFrame = (p.walkFrame + 1) % 3;
      }
    } else {
      p.walkFrame = 0;
    }

    // Jump Physics
    const gravity = 0.38;
    const terminalVelocity = 6.5;

    if (this.input.jump && p.isGrounded && !p.isJumping) {
      p.isGrounded = false;
      p.isJumping = true;
      // Initial jump velocity
      p.vy = this.input.run ? -6.2 : -5.4;
      sound.playJump(p.form === 'SUPER');
    }

    // Variable jump: hold jump to soar higher
    if (this.input.jump && p.isJumping && p.vy < 0) {
      p.vy -= 0.12; // extra lift
    }

    if (!this.input.jump) {
      p.isJumping = false;
    }

    // Apply gravity
    p.vy += gravity;
    if (p.vy > terminalVelocity) p.vy = terminalVelocity;

    // Move horizontally and check collisions
    p.x += p.vx;
    this.checkHorizontalCollisions(p);

    // Keep player within left bound of camera
    if (p.x < this.cameraX) {
      p.x = this.cameraX;
      p.vx = 0;
    }

    // Move vertically and check collisions
    p.y += p.vy;
    this.checkVerticalCollisions(p);

    // Check pit fall
    if (p.y > 240) {
      this.killPlayer();
      return;
    }

    // Check flagpole touch!
    if (p.x >= this.level.flagX - 4 && p.x <= this.level.flagX + 12) {
      this.startFlagpoleSequence();
    }
  }

  /**
   * Horizontal collision handling with solid blocks
   */
  private checkHorizontalCollisions(p: Player) {
    const leftCol = Math.floor(p.x / 16);
    const rightCol = Math.floor((p.x + p.width) / 16);
    const topRow = Math.floor(p.y / 16);
    const bottomRow = Math.floor((p.y + p.height - 1) / 16);

    for (let r = topRow; r <= bottomRow; r++) {
      if (r < 0 || r >= this.level.heightInTiles) continue;

      if (p.vx > 0) {
        // Moving right
        const tile = this.level.tiles[r]?.[rightCol];
        if (tile && this.isSolidTile(tile)) {
          p.x = rightCol * 16 - p.width - 0.01;
          p.vx = 0;
          break;
        }
      } else if (p.vx < 0) {
        // Moving left
        const tile = this.level.tiles[r]?.[leftCol];
        if (tile && this.isSolidTile(tile)) {
          p.x = (leftCol + 1) * 16 + 0.01;
          p.vx = 0;
          break;
        }
      }
    }
  }

  /**
   * Vertical collision handling with ground and ceiling
   */
  private checkVerticalCollisions(p: Player) {
    const leftCol = Math.floor(p.x / 16);
    const rightCol = Math.floor((p.x + p.width) / 16);
    const topRow = Math.floor(p.y / 16);
    const bottomRow = Math.floor((p.y + p.height) / 16);

    p.isGrounded = false;

    if (p.vy >= 0) {
      // Falling down onto solid tiles
      for (let c = leftCol; c <= rightCol; c++) {
        if (c < 0 || c >= this.level.widthInTiles) continue;
        const tile = this.level.tiles[bottomRow]?.[c];
        if (tile && this.isSolidTile(tile)) {
          p.y = bottomRow * 16 - p.height;
          p.vy = 0;
          p.isGrounded = true;
          p.isJumping = false;
          break;
        }
      }
    } else if (p.vy < 0) {
      // Jumping up into blocks (ceiling hit!)
      for (let c = leftCol; c <= rightCol; c++) {
        if (c < 0 || c >= this.level.widthInTiles) continue;
        const tile = this.level.tiles[topRow]?.[c];
        if (tile && this.isSolidTile(tile)) {
          p.y = (topRow + 1) * 16;
          p.vy = 0;
          this.hitBlock(c, topRow, tile);
          break;
        }
      }
    }
  }

  /**
   * Hit a block from below
   */
  private hitBlock(col: number, row: number, tile: TileType) {
    // Bump enemies standing directly on top of this block!
    const blockTopY = row * 16;
    this.enemies.forEach((e) => {
      if (!e.isDead && Math.abs(e.y + e.height - blockTopY) < 4 && Math.abs(e.x - col * 16) < 14) {
        e.isDead = true;
        e.deadTimer = 40;
        e.vy = -3.5;
        this.addScore(100, e.x, e.y);
        sound.playStomp();
      }
    });

    if (tile === TileType.QUESTION_COIN) {
      this.level.tiles[row][col] = TileType.QUESTION_EMPTY;
      this.bumpTile(col, row, tile, TileType.QUESTION_EMPTY);
      // Spawn bouncing coin
      this.collectibles.push({
        id: Date.now() + Math.random(),
        type: 'COIN_POP',
        x: col * 16 + 1,
        y: (row - 1) * 16,
        vx: 0,
        vy: -5.2,
        width: 14,
        height: 14,
        collected: false,
        animTimer: 0,
        targetY: (row - 1) * 16,
      });
      this.addCoin(col * 16, (row - 1) * 16);
    } else if (tile === TileType.QUESTION_MUSHROOM) {
      this.level.tiles[row][col] = TileType.QUESTION_EMPTY;
      this.bumpTile(col, row, tile, TileType.QUESTION_EMPTY);
      // Spawn emerging mushroom
      this.collectibles.push({
        id: Date.now() + Math.random(),
        type: 'MUSHROOM',
        x: col * 16,
        y: row * 16,
        vx: 1.1,
        vy: -1.0,
        width: 16,
        height: 16,
        collected: false,
        animTimer: 0,
      });
      sound.playPowerUp();
    } else if (tile === TileType.BRICK) {
      if (this.player.form === 'SUPER') {
        // Shatter brick into 4 fragments!
        this.level.tiles[row][col] = TileType.EMPTY;
        sound.playBrickBreak();
        this.spawnBrickParticles(col * 16, row * 16);
        this.addScore(50, col * 16, row * 16);
      } else {
        // Small Mario bumps brick
        this.bumpTile(col, row, tile, TileType.BRICK);
        sound.playBlockBump();
      }
    } else {
      sound.playBlockBump();
    }
  }

  private bumpTile(col: number, row: number, orig: TileType, next: TileType) {
    this.bumpedTiles.push({
      col,
      row,
      originalType: orig,
      newType: next,
      offsetY: 0,
      vy: -2.8,
      timer: 10,
    });
  }

  private updateBumpedTiles() {
    for (let i = this.bumpedTiles.length - 1; i >= 0; i--) {
      const b = this.bumpedTiles[i];
      b.offsetY += b.vy;
      b.vy += 0.55;
      b.timer--;
      if (b.timer <= 0) {
        this.level.tiles[b.row][b.col] = b.newType;
        this.bumpedTiles.splice(i, 1);
      }
    }
  }

  private spawnBrickParticles(x: number, y: number) {
    const pieces = [
      { vx: -2.0, vy: -4.5 },
      { vx: 2.0, vy: -4.5 },
      { vx: -1.2, vy: -3.0 },
      { vx: 1.2, vy: -3.0 },
    ];
    pieces.forEach((p) => {
      this.particles.push({
        id: Math.random(),
        x: x + 4,
        y: y + 4,
        vx: p.vx,
        vy: p.vy,
        color: '#d85600',
        size: 5,
        life: 30,
        maxLife: 30,
      });
    });
  }

  /**
   * Update Enemies: Goombas and Koopas
   */
  private updateEnemies() {
    const p = this.player;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      // If squished, countdown to remove
      if (e.isDead) {
        e.deadTimer--;
        if (e.deadTimer <= 0) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      // Only activate enemies when within visible screen range
      if (e.x > this.cameraX + 440 || e.x < this.cameraX - 100) {
        continue;
      }

      // Shell mechanics
      if (e.isShell && e.isShellMoving) {
        e.x += e.vx;
        // Shell wall bounces
        const checkCol = e.vx > 0 ? Math.floor((e.x + e.width) / 16) : Math.floor(e.x / 16);
        const checkRow = Math.floor((e.y + 8) / 16);
        const tile = this.level.tiles[checkRow]?.[checkCol];
        if (tile && this.isSolidTile(tile)) {
          e.vx = -e.vx;
          sound.playBlockBump();
        }

        // Sliding shell knocks out other enemies
        this.enemies.forEach((other) => {
          if (other.id !== e.id && !other.isDead) {
            if (Math.abs(other.x - e.x) < 14 && Math.abs(other.y - e.y) < 14) {
              other.isDead = true;
              other.deadTimer = 30;
              other.vy = -3.5;
              this.addScore(200, other.x, other.y);
              sound.playStomp();
            }
          }
        });
      } else if (!e.isShell) {
        // Normal walking patrol
        e.x += e.vx;
        e.walkAnimCounter++;
        if (e.walkAnimCounter >= 12) {
          e.walkAnimCounter = 0;
          e.walkFrame = (e.walkFrame + 1) % 2;
        }

        // Turn around on obstacles / pipes
        const frontCol = e.vx > 0 ? Math.floor((e.x + e.width) / 16) : Math.floor(e.x / 16);
        const midRow = Math.floor((e.y + e.height / 2) / 16);
        const tile = this.level.tiles[midRow]?.[frontCol];
        if (tile && this.isSolidTile(tile)) {
          e.vx = -e.vx;
          e.facing = e.vx > 0 ? 'RIGHT' : 'LEFT';
        }
      }

      // Enemy gravity and vertical collisions
      e.vy += 0.35;
      if (e.vy > 6.0) e.vy = 6.0;
      e.y += e.vy;

      const leftCol = Math.floor(e.x / 16);
      const rightCol = Math.floor((e.x + e.width) / 16);
      const bottomRow = Math.floor((e.y + e.height) / 16);

      for (let c = leftCol; c <= rightCol; c++) {
        const tile = this.level.tiles[bottomRow]?.[c];
        if (tile && this.isSolidTile(tile)) {
          e.y = bottomRow * 16 - e.height;
          e.vy = 0;
          e.isGrounded = true;
          break;
        }
      }

      // Check collision with Player
      if (
        p.x + p.width > e.x &&
        p.x < e.x + e.width &&
        p.y + p.height > e.y &&
        p.y < e.y + e.height
      ) {
        // Did player stomp on top of the enemy?
        const isStomping = p.vy > 0 && p.y + p.height <= e.y + 12;

        if (isStomping) {
          // Bounce player upwards
          p.vy = -4.5;
          sound.playStomp();

          if (e.type === 'GOOMBA') {
            e.isDead = true;
            e.deadTimer = 25;
            this.addScore(100, e.x, e.y);
          } else if (e.type === 'KOOPA') {
            if (!e.isShell) {
              e.isShell = true;
              e.height = 16;
              e.y += 8;
              e.vx = 0;
              e.isShellMoving = false;
              this.addScore(100, e.x, e.y);
            } else if (e.isShell && !e.isShellMoving) {
              // Kick shell
              e.isShellMoving = true;
              e.vx = p.facing === 'RIGHT' ? 5.0 : -5.0;
              this.addScore(200, e.x, e.y);
            } else if (e.isShell && e.isShellMoving) {
              // Stop shell
              e.isShellMoving = false;
              e.vx = 0;
            }
          }
        } else {
          // Side contact with enemy
          if (e.isShell && !e.isShellMoving) {
            // Kick stationary shell
            e.isShellMoving = true;
            e.vx = p.x < e.x ? 5.0 : -5.0;
            sound.playBlockBump();
            this.addScore(100, e.x, e.y);
          } else {
            // Player takes damage!
            this.damagePlayer();
          }
        }
      }
    }
  }

  /**
   * Update Collectibles: Super Mushrooms and Popped Coins
   */
  private updateCollectibles() {
    const p = this.player;

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];

      if (c.type === 'COIN_POP') {
        c.y += c.vy;
        c.vy += 0.45;
        c.animTimer++;
        if (c.vy > 0 && c.y >= (c.targetY || 0)) {
          this.collectibles.splice(i, 1);
        }
        continue;
      }

      if (c.type === 'WORLD_COIN') {
        c.animTimer++;
        // Contact check with player
        if (
          p.x + p.width > c.x &&
          p.x < c.x + c.width &&
          p.y + p.height > c.y &&
          p.y < c.y + c.height
        ) {
          this.collectibles.splice(i, 1);
          this.addCoin(c.x, c.y);
        }
        continue;
      }

      if (c.type === 'MUSHROOM') {
        // Move mushroom
        c.x += c.vx;

        // Turn around on obstacles
        const frontCol = c.vx > 0 ? Math.floor((c.x + c.width) / 16) : Math.floor(c.x / 16);
        const midRow = Math.floor((c.y + 8) / 16);
        const tile = this.level.tiles[midRow]?.[frontCol];
        if (tile && this.isSolidTile(tile)) {
          c.vx = -c.vx;
        }

        // Apply gravity
        c.vy += 0.35;
        if (c.vy > 5) c.vy = 5;
        c.y += c.vy;

        const leftCol = Math.floor(c.x / 16);
        const rightCol = Math.floor((c.x + c.width) / 16);
        const bottomRow = Math.floor((c.y + c.height) / 16);

        for (let col = leftCol; col <= rightCol; col++) {
          const t = this.level.tiles[bottomRow]?.[col];
          if (t && this.isSolidTile(t)) {
            c.y = bottomRow * 16 - c.height;
            c.vy = 0;
            break;
          }
        }

        // Contact with player
        if (
          p.x + p.width > c.x &&
          p.x < c.x + c.width &&
          p.y + p.height > c.y &&
          p.y < c.y + c.height
        ) {
          this.collectibles.splice(i, 1);
          sound.playPowerUp();
          this.addScore(1000, c.x, c.y);

          // Power up to Super Mario!
          if (p.form === 'SMALL') {
            p.form = 'SUPER';
            p.height = 30;
            p.y -= 15; // adjust height upward so it doesn't clip into ground
            p.isTransforming = true;
            p.transformTimer = 35;
          }
        }
      }
    }
  }

  private damagePlayer() {
    const p = this.player;
    if (p.isInvulnerable || p.isTransforming) return;

    if (p.form === 'SUPER') {
      // Shrink to Small Mario with invulnerability frames
      p.form = 'SMALL';
      p.height = 15;
      p.isInvulnerable = true;
      p.invulnerableTimer = 120; // 2 seconds at 60fps
      p.isTransforming = true;
      p.transformTimer = 30;
      sound.playPowerDown();
      this.notifyState();
    } else {
      // Small Mario dies
      this.killPlayer();
    }
  }

  private killPlayer() {
    this.status = 'DYING';
    this.player.deadTimer = 0;
    this.player.vy = -6.5;
    sound.playDeath();
    this.notifyState();
  }

  private updateDyingPlayer() {
    const p = this.player;
    p.deadTimer++;

    // Small delay before flying up & off screen
    if (p.deadTimer > 15) {
      p.y += p.vy;
      p.vy += 0.35;
    }

    if (p.deadTimer > 120) {
      this.lives--;
      this.notifyState();
      if (this.lives > 0) {
        this.resetLevel(true);
        this.status = 'PLAYING';
        sound.startBgm();
      } else {
        this.status = 'GAME_OVER';
        sound.stopBgm();
      }
      this.notifyState();
    }
  }

  /**
   * Flagpole sequence & victory walk into castle
   */
  private startFlagpoleSequence() {
    this.status = 'LEVEL_CLEAR';
    sound.stopBgm();
    sound.playFlagpole();
    this.player.vx = 0;
    this.player.vy = 2.0; // slide down pole
    this.timeBonusTally = 0;
    this.notifyState();
  }

  private updateLevelClear() {
    const p = this.player;
    const flagBottom = 12 * 16;

    // Flag sliding down
    if (this.flagY < this.targetFlagY) {
      this.flagY += 2.0;
    }

    // Mario sliding down flagpole
    if (p.y < flagBottom) {
      p.y += 2.0;
      if (p.y >= flagBottom) {
        p.y = flagBottom;
        // Step to the right of flagpole
        p.x = this.level.flagX + 8;
        p.facing = 'RIGHT';
      }
    } else if (p.x < this.level.castleX + 24) {
      // Walk into the castle door!
      p.vx = 1.2;
      p.x += p.vx;
      p.walkAnimCounter++;
      if (p.walkAnimCounter >= 6) {
        p.walkAnimCounter = 0;
        p.walkFrame = (p.walkFrame + 1) % 3;
      }
    } else {
      // Inside castle: calculate time bonus!
      p.vx = 0;
      if (this.timeLeft > 0) {
        const deduct = Math.min(this.timeLeft, 5);
        this.timeLeft -= deduct;
        this.score += deduct * 50;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('super_plumber_high_score', this.highScore.toString());
        }
        if (this.timeLeft % 20 === 0) {
          sound.playCoin();
        }
        this.notifyState();
      } else {
        this.castleFlagRaised = true;
      }
    }
  }

  private updateCamera() {
    // Camera smoothly follows player to the right, never scrolls backwards (classic Mario!)
    const targetCameraX = Math.max(0, this.player.x - 140);
    if (targetCameraX > this.cameraX) {
      this.cameraX = targetCameraX;
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.35; // gravity
      pt.life--;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts() {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  /**
   * Main Render Canvas Method
   */
  public render() {
    const ctx = this.ctx;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    // Fixed virtual resolution: 384x240 for widescreen retro
    // Or 320x240 for 4:3 retro
    const V_WIDTH = 384;
    const V_HEIGHT = 240;

    ctx.save();
    // Scale context to fit actual canvas size while maintaining 384x240 internal resolution
    const scaleX = canvasWidth / V_WIDTH;
    const scaleY = canvasHeight / V_HEIGHT;
    ctx.scale(scaleX, scaleY);

    // 1. Draw Sky, Clouds, Hills, and Bushes
    drawScenery(ctx, this.cameraX, V_WIDTH, V_HEIGHT);

    // 2. Draw World Tiles
    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    const startCol = Math.max(0, Math.floor(this.cameraX / 16) - 1);
    const endCol = Math.min(this.level.widthInTiles - 1, Math.floor((this.cameraX + V_WIDTH) / 16) + 1);

    for (let r = 0; r < this.level.heightInTiles; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.level.tiles[r]?.[c];
        if (tile && tile !== TileType.EMPTY) {
          // Check if this tile is currently bumped
          const bumped = this.bumpedTiles.find((b) => b.col === c && b.row === r);
          const offsetY = bumped ? bumped.offsetY : 0;
          drawTile(ctx, tile, c * 16, r * 16 + offsetY, this.shimmerFrame);
        }
      }
    }

    // Draw Flag on Flagpole
    ctx.fillStyle = '#00a800';
    // Triangle green flag
    ctx.beginPath();
    ctx.moveTo(this.level.flagX - 14, this.flagY + 2);
    ctx.lineTo(this.level.flagX + 6, this.flagY + 8);
    ctx.lineTo(this.level.flagX + 6, this.flagY - 4);
    ctx.closePath();
    ctx.fill();

    // 3. Draw Collectibles (Coins, Mushrooms)
    this.collectibles.forEach((c) => {
      if (c.type === 'COIN_POP' || c.type === 'WORLD_COIN') {
        drawCoin(ctx, c.x, c.y, c.animTimer + this.shimmerFrame);
      } else if (c.type === 'MUSHROOM') {
        drawMushroom(ctx, c.x, c.y);
      }
    });

    // 4. Draw Enemies
    this.enemies.forEach((e) => {
      if (e.type === 'GOOMBA') {
        drawGoomba(ctx, e.x, e.y, e.isDead, e.walkFrame);
      } else if (e.type === 'KOOPA') {
        drawKoopa(ctx, e.x, e.y, e.facing, e.isShell, e.walkFrame);
      }
    });

    // 5. Draw Mario Player (unless hidden inside castle door)
    const isInsideCastle = this.status === 'LEVEL_CLEAR' && this.player.x >= this.level.castleX + 22;
    if (!isInsideCastle) {
      drawMario(
        ctx,
        this.player.x,
        this.player.y,
        this.player.form,
        this.player.facing,
        this.player.isGrounded,
        this.player.vx,
        this.player.walkFrame,
        this.player.isCrouching,
        this.player.isInvulnerable,
        this.player.isTransforming,
        this.status === 'DYING'
      );
    }

    // 6. Draw Particles (shattered bricks)
    this.particles.forEach((pt) => {
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.floor(pt.x), Math.floor(pt.y), pt.size, pt.size);
    });

    // 7. Draw Floating Points Text
    this.floatingTexts.forEach((ft) => {
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px monospace';
      ctx.fillText(ft.text, Math.floor(ft.x), Math.floor(ft.y));
    });

    ctx.restore(); // restore camera transform

    ctx.restore(); // restore scale
  }
}
