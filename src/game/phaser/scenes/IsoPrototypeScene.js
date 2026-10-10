import Phaser from 'phaser';
import spritesheetUrl from '../../../assets/tiled-map/spritesheet.png';
import charWalkUrl   from '../../../assets/lpc_male_animations_2026-10-01T09-47-27/standard/walk.png';
import charIdleUrl   from '../../../assets/lpc_male_animations_2026-10-01T09-47-27/standard/idle.png';
import charRunUrl    from '../../../assets/lpc_male_animations_2026-10-01T09-47-27/standard/run.png';
import charSlashUrl  from '../../../assets/lpc_male_animations_2026-10-01T09-47-27/standard/slash.png';
import IsoPathfinder from '../pathfinding/IsoPathfinder';

/**
 * Valley Isometric Campus Scene
 *
 * ── Map ───────────────────────────────────────────────────────────
 *   orientation = isometric  •  tilewidth=32  tileheight=16
 *   30 × 30 tiles  •  tileset: spritesheet.png (32×32, 11 cols)
 *   Tileset 1: firstgid=1   (GIDs  1–121)
 *   Tileset 2: firstgid=122 (GIDs 122–242)  ← same image, offset
 *
 * ── Character & Movement ──────────────────────────────────────────
 *   LPC standard layout: 64×64 px / frame  •  13 cols × 4 rows
 *   Row 0 = UP  •  Row 1 = LEFT  •  Row 2 = DOWN  •  Row 3 = RIGHT
 *   Walk:  frames 0–8  (9 frames)
 *   Idle:  frames 0–1  (2 frames)
 *   Slash: frames 0–5  (6 frames)
 *
 * Movement:
 * - 8-directional A* Click-to-Move with diagonal cost √2
 * - Line-of-sight path smoothing across open plazas and sidewalks
 * - Continuous smooth character movement with acceleration & deceleration
 * - Visual click destination marker & real-time path trail
 * - Real-time hover cursor tile highlighting (walkable vs blocked)
 * - Direction-aware LPC sprite animations (walk / idle / attack)
 * - Dynamic isometric depth sorting
 * - Optional manual WASD / Arrow key override & mobile virtual joystick
 */
export default class IsoPrototypeScene extends Phaser.Scene {
  constructor() {
    super('IsoPrototypeScene');

    // ── Tile dimensions (scaled ×2 from TMX source) ─────────────
    this.tileW = 64;   // diamond footprint width  (TMX tilewidth=32  × 2)
    this.tileH = 32;   // diamond footprint height (TMX tileheight=16 × 2)

    // Source spritesheet tile
    this.srcTileW  = 32;
    this.srcTileH  = 32;
    this.srcCols   = 11;

    // Map dimensions
    this.mapCols = 30;
    this.mapRows = 30;

    // ── Character config ─────────────────────────────────────────
    this.FRAME_W  = 64;  // LPC frame pixel width
    this.FRAME_H  = 64;  // LPC frame pixel height
    this.WALK_FRAMES = 9;
    this.IDLE_FRAMES = 2;
    this.SLASH_FRAMES = 6;

    // Offscreen canvas for character frame extraction
    this._charCanvas = document.createElement('canvas');
    this._charCanvas.width  = this.FRAME_W;
    this._charCanvas.height = this.FRAME_H;
    this._charCtx = this._charCanvas.getContext('2d');
    this._charCtx.imageSmoothingEnabled = false;

    // Direction row mapping (LPC standard)
    this.DIR_ROW = { up: 0, left: 1, down: 2, right: 3 };

    // Player state (start in center plaza)
    this.playerCol = 15.5;
    this.playerRow = 15.5;
    this.direction = 'down';
    this.isMoving  = false;

    // Movement speed physics (units in tiles per frame)
    this.maxSpeed     = 0.085;
    this.currentSpeed = 0;
    this.accel        = 0.007;
    this.decelDist    = 0.7; // distance in tiles to begin deceleration

    // Pathfinding state
    this.pathfinder        = null;
    this.currentPath       = null;
    this.pathWaypointIndex = 0;

    // Tactical Cursor & Visual Feedback
    this.hoverCursorContainer = null;
    this.hoverCursorGfx       = null;
    this.destMarkerContainer  = null;
    this.destMarkerGfx        = null;
    this.hoverPulseTween      = null;
    this.destPulseTween       = null;
    this.lastHoverWalkable    = null;

    // Animation counters
    this.animTimer  = 0;
    this.animFrame  = 0;
    this.ANIM_SPEED = 7; // ticks per frame advance

    // Attack state
    this.isAttacking = false;
    this.attackFrame = 0;
    this.attackTimer = 0;
    this.ATTACK_ANIM_SPEED = 4;
    this.lastAttackTime = 0;
    this.attackCooldown = 350; // ms

    // Virtual axis (from on-screen joystick)
    this.virtualAxis = { x: 0, y: 0 };

    this.onInteract = null;
  }

  // ═══════════════════════════════════════════════════════════════
  preload() {
    this.load.image('spritesheet', spritesheetUrl);
    this.load.image('char_walk',   charWalkUrl);
    this.load.image('char_idle',   charIdleUrl);
    this.load.image('char_run',    charRunUrl);
    this.load.image('char_slash',  charSlashUrl);
  }

  // ═══════════════════════════════════════════════════════════════
  create() {
    this.onInteract = this.registry.get('onInteract');
    this.cameras.main.setBackgroundColor('#0b1622');

    this.mapData = this.getTmxData();
    this.initNavigationGrid();
    this.buildMapCanvas();

    // Visual layers: Tactical tile cursors for hover and click-to-move
    this.createTacticalCursors();

    this.createCharacter();
    this.createHud();

    // ── Input: Keyboard ──────────────────────────────────────────
    this.keys = this.input.keyboard.addKeys({
      up:    'W',
      left:  'A',
      down:  'S',
      right: 'D',
    });
    this.cursors     = this.input.keyboard.createCursorKeys();
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Attack shortcuts on desktop
    this.attackKeyJ     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.attackKeySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // ── Event Bus for On-Screen / Mobile Controls ─────────────────
    this.registry.events.on('set_virtual_axis', (axis) => {
      if (axis) this.setVirtualAxis(axis.x, axis.y);
    });
    this.registry.events.on('trigger_virtual_attack', () => {
      this.triggerAttack();
    });
    this.registry.events.on('trigger_virtual_interact', () => {
      this.tryInteraction();
    });

    // ── Input: Mouse Click-to-Move ───────────────────────────────
    this.input.on('pointerdown', this.handlePointerDown, this);

    // ── Camera ───────────────────────────────────────────────────
    this.cameras.main.startFollow(this.charSprite, true, 0.1, 0.1);

    // Responsive scaling & mobile portrait framing
    this.scale.on('resize', this.handleResize, this);
    this.handleResize(this.scale.gameSize);
  }

  // ═══════════════════════════════════════════════════════════════
  // Navigation Grid & Data-Driven Walkability
  // ═══════════════════════════════════════════════════════════════

  initNavigationGrid() {
    // 1 = walkable, 0 = blocked
    this.navGrid = new Uint8Array(this.mapCols * this.mapRows);

    for (let r = 0; r < this.mapRows; r++) {
      for (let c = 0; c < this.mapCols; c++) {
        const gid = this.getTileAt(c, r);
        const walkable = this.isWalkable(gid);
        this.navGrid[r * this.mapCols + c] = walkable ? 1 : 0;
      }
    }

    // Initialize 8-directional A* with line-of-sight smoothing
    this.pathfinder = new IsoPathfinder(
      this.mapCols,
      this.mapRows,
      (col, row) => this.isCellWalkable(col, row)
    );
  }

  isCellWalkable(col, row) {
    if (col < 0 || row < 0 || col >= this.mapCols || row >= this.mapRows) return false;
    return this.navGrid[row * this.mapCols + col] === 1;
  }

  // ═══════════════════════════════════════════════════════════════
  // Map Data (first-trial-map.tmx CSV)
  // ═══════════════════════════════════════════════════════════════

  getTmxData() {
    return [
      242,242,242,242,242,242,242,242,242,242, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41,242,203,242,242,242,242,242,242,242,242,
      194,242,242,242,242,242,242,242,242,242, 41, 41, 41,166, 41, 41,149, 41, 41, 41,242,242,242,242,242,242,242,242,242,242,
      242,242,242,242,242,242,242,242,242,242, 41, 41, 41,180, 41, 41, 41, 41,166, 41,242,242,242,242,242,242,242,242,242,242,
      242,242,242,242,242,242,242,242,242,242, 41,181, 41,166, 41, 41,166, 41, 41, 41,242,242,242,242,242,242,242,194,242,242,
      242,242,242,242,242,242,242,242,242,242, 41, 41, 41, 41, 41, 41, 41,151, 41, 41,242,242,242,242,202,242,242,242,242,242,
      242,242,242,242,242,242,242,242,242,242, 41, 41, 41,151,151, 41, 41,166, 41, 41,242,242,242,242,242,242,242,242,242,242,
      242,242,242,242,242,242,242,242,242,242, 41, 41, 41, 41,180, 41,166,149, 41, 41,242,242,242,242,242,242,242,242,242,242,
      242,242,242,242,194,242,242,242,202,242, 41,166, 41, 41, 41,173, 41,149, 41, 41,242,242,242,242,203,242,242,242,242,242,
      242,242,242,242,242,242,242,242,242,242, 41, 41,166,171, 41, 41, 41, 41, 41, 41,242,242,242,242,242,242,242,242,242,242,
      242,242,242,242,242,242,242,242,242,242, 41,180, 41, 41, 41, 41, 41, 41, 41, 41,242,242,242,242,242,242,242,242,242,242,
       41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41,173, 41, 41, 41,166, 41, 41,166, 41, 41, 41, 41, 41, 41, 41, 41,
       41, 41,151,166, 41, 41,166, 41,149,149,149, 41, 41, 41, 41, 41, 41, 41,166, 41, 41, 41, 41, 41, 41, 41,149,149, 41, 41,
       41, 41,151, 41,167, 41, 41, 41,149,149,149, 41, 41, 41, 41, 41, 41,171, 41, 41,167, 41, 41,167, 41, 41,166, 41, 41,149,
       41, 41, 41, 41, 41, 41, 41,166,149, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41,181, 41, 41, 41, 41,149, 41,149,149,
       41, 41, 41,166, 41,181, 41, 41, 41, 41, 41,166, 41, 41, 41,182,182, 41, 41,149,149, 41, 41, 41, 41,180,149,151,149, 41,
       41, 41, 41, 41, 41, 41, 41, 41,166, 41, 41, 41, 41, 41, 41,182,182, 41, 41,149,149, 41, 41,166, 41, 41, 41, 41, 41, 41,
       41,149, 41,166, 41,167,166, 41,151,151, 41, 41,166, 41, 41,166, 41, 41, 41, 41,166, 41,167, 41, 41,151,151, 41, 41, 41,
       41, 41, 41,166, 41, 41, 41, 41, 41,151, 41, 41, 41, 41,173, 41, 41, 41, 41,166,166, 41, 41, 41,151, 41,167, 41, 41, 41,
       41, 41, 41, 41, 41,180, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41,
       41, 41, 41, 41, 41, 41, 41, 41, 41, 41,149,149, 41,167,181, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41,
      242,242,242,242,242,242,242,242,242,242,149,149, 41, 41, 41, 41,167, 41, 41, 41,242,242,242,242,242,242,242,242,242,242,
      242,242,242,242,242,242,242,242,242,242, 41, 41, 41, 41, 41, 41, 41,151, 41, 41,242,242,242,242,242,242,242,242,242,242,
      242,242,202,242,242,242,203,242,242,242,149,149, 41,166, 41, 41, 41,166, 41, 41,242,242,194,242,242,202,242,242,242,242,
      242,242,242,242,242,242,242,242,242,242,149,149, 41, 41, 41, 41, 41, 41, 41, 41,242,242,242,242,242,242,242,242,242,242,
      242,242,242,242,242,242,203,242,242,242, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41,242,242,242,242,242,242,242,242,242,242,
      242,242,242,242,242,242,242,242,242,242, 41, 41, 41,166, 41,166,180,180, 41, 41,242,242,242,242,199,199,242,242,242,242,
      242,242,242,242,242,242,242,242,242,242, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41,242,242,242,242,242,242,242,242,242,242,
      242,242,242,242,242,242,194,242,242,242, 41,166,166, 41, 41, 41, 41, 41, 41, 41,242,242,242,242,242,242,242,242,242,242,
      242,242,242,242,242,242,242,242,242,242, 41, 41, 41, 41, 41, 41, 41,166, 41, 41,242,242,242,242,242,242,242,242,242,242,
      242,242,242,242,242,242,242,242,242,242, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41,242,242,242,242,242,242,242,242,242,242,
    ];
  }

  // ═══════════════════════════════════════════════════════════════
  // Isometric Math & Projection
  // ═══════════════════════════════════════════════════════════════

  gidToSrc(gid) {
    if (!gid) return null;
    const localId = gid <= 121 ? gid - 1 : gid - 122;
    return {
      x: (localId % this.srcCols)           * this.srcTileW,
      y: Math.floor(localId / this.srcCols) * this.srcTileH,
    };
  }

  /** Isometric grid (col, row) to relative screen position */
  gridToScreen(col, row) {
    return {
      x: (col - row) * (this.tileW / 2),
      y: (col + row) * (this.tileH / 2),
    };
  }

  /** Grid (col, row) to absolute world coordinates */
  toWorldPos(col, row) {
    const sp = this.gridToScreen(col, row);
    return { x: this.originX + sp.x, y: this.originY + sp.y };
  }

  /**
   * Inverts absolute world (x, y) back into continuous grid coordinates (col, row).
   * Exact mathematical inverse of toWorldPos.
   */
  worldToGrid(worldX, worldY) {
    const dx = (worldX - this.originX) / (this.tileW / 2);
    const dy = (worldY - this.originY) / (this.tileH / 2);
    return {
      col: (dx + dy) / 2,
      row: (dy - dx) / 2,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Map Canvas Building
  // ═══════════════════════════════════════════════════════════════

  buildMapCanvas() {
    const tex    = this.textures.get('spritesheet');
    const srcImg = tex.getSourceImage();

    const cw = (this.mapCols + this.mapRows) * (this.tileW / 2);
    const ch = (this.mapCols + this.mapRows) * (this.tileH / 2) + this.srcTileH * 2 + 20;

    const canvas = document.createElement('canvas');
    canvas.width  = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Origin: top vertex of diamond
    this.originX = this.mapRows * (this.tileW / 2);
    this.originY = 16;

    for (let row = 0; row < this.mapRows; row++) {
      for (let col = 0; col < this.mapCols; col++) {
        const gid = this.mapData[row * this.mapCols + col];
        if (!gid) continue;
        const src = this.gidToSrc(gid);
        if (!src) continue;

        const sp = this.gridToScreen(col, row);
        const dx = this.originX + sp.x - this.tileW / 2;
        const dy = this.originY + sp.y - (this.srcTileH - this.tileH);

        ctx.drawImage(
          srcImg,
          src.x, src.y, this.srcTileW, this.srcTileH,
          dx, dy, this.tileW, this.srcTileH * 2,
        );
      }
    }

    if (this.textures.exists('map_canvas')) this.textures.remove('map_canvas');
    this.textures.addCanvas('map_canvas', canvas);

    this.add.image(0, 0, 'map_canvas').setOrigin(0, 0).setDepth(0);
  }

  // ═══════════════════════════════════════════════════════════════
  // Character Sprite & LPC Textures
  // ═══════════════════════════════════════════════════════════════

  createCharacter() {
    const wp = this.toWorldPos(this.playerCol, this.playerRow);

    this._buildCharTexture();

    // LPC character sprite
    this.charSprite = this.add.image(wp.x, wp.y, 'char_frame')
      .setOrigin(0.5, 0.85)
      .setDepth(600);

    // Shadow ellipse
    this.charShadow = this.add.ellipse(wp.x, wp.y + 4, 28, 10, 0x000000, 0.35)
      .setDepth(599);

    // Name tag
    this.nameLabel = this.add.text(wp.x, wp.y - 46, '▲ YOU', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#e0f2fe',
      backgroundColor: '#0c1a2ecc',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5, 1).setDepth(601);
  }

  _buildCharTexture() {
    if (this.textures.exists('char_frame')) this.textures.remove('char_frame');
    this.textures.addCanvas('char_frame', this._charCanvas);
    this.drawCharFrame();
  }

  drawCharFrame() {
    const row = this.DIR_ROW[this.direction] ?? 2;
    let texKey;
    let maxFrames;
    let frame;

    if (this.isAttacking) {
      texKey = 'char_slash';
      maxFrames = this.SLASH_FRAMES;
      frame = Math.min(this.attackFrame, maxFrames - 1);
    } else if (this.isMoving) {
      texKey = 'char_walk';
      maxFrames = this.WALK_FRAMES;
      frame = this.animFrame % maxFrames;
    } else {
      texKey = 'char_idle';
      maxFrames = this.IDLE_FRAMES;
      frame = this.animFrame % maxFrames;
    }

    const tex = this.textures.get(texKey);
    if (!tex) return;
    const srcImg = tex.getSourceImage();

    const sx = frame * this.FRAME_W;
    const sy = row   * this.FRAME_H;

    const ctx = this._charCtx;
    ctx.clearRect(0, 0, this.FRAME_W, this.FRAME_H);
    ctx.drawImage(srcImg, sx, sy, this.FRAME_W, this.FRAME_H, 0, 0, this.FRAME_W, this.FRAME_H);

    this.textures.get('char_frame').refresh();
  }

  // ═══════════════════════════════════════════════════════════════
  // Tactical Tile Cursor & Click-To-Move Feedback
  // ═══════════════════════════════════════════════════════════════

  /**
   * Draws the tactical RPG isometric tile cursor matching the reference image:
   * - Soft warm golden translucent diamond fill
   * - Delicate glowing border
   * - 4 rounded glowing corner caps/brackets at top, right, bottom, left vertices
   * - Subtle outer corner glow halos
   */
  drawTacticalCursor(graphics, isWalkable = true) {
    graphics.clear();
    const halfW = this.tileW / 2; // 32
    const halfH = this.tileH / 2; // 16

    const topPt    = { x: 0,      y: -halfH };
    const rightPt  = { x: halfW,  y: 0      };
    const bottomPt = { x: 0,      y: halfH  };
    const leftPt   = { x: -halfW, y: 0      };

    const pts = [topPt, rightPt, bottomPt, leftPt];

    if (isWalkable) {
      // 1. Soft warm golden translucent diamond fill (unbordered)
      graphics.fillStyle(0xfde047, 0.18);
      graphics.fillPoints(pts, true);

      // Inset subtle glow
      const innerPts = [
        { x: 0,          y: -halfH + 2 },
        { x: halfW - 4,  y: 0          },
        { x: 0,          y: halfH - 2  },
        { x: -halfW + 4, y: 0          },
      ];
      graphics.fillStyle(0xfef9c3, 0.10);
      graphics.fillPoints(innerPts, true);

      // 2. Sharp corner brackets (open sides, no box outline)
      graphics.lineStyle(2.5, 0xffffff, 0.95);

      // Top sharp corner
      graphics.beginPath();
      graphics.moveTo(-10, -halfH + 5);
      graphics.lineTo(0, -halfH);
      graphics.lineTo(10, -halfH + 5);
      graphics.strokePath();

      // Bottom sharp corner
      graphics.beginPath();
      graphics.moveTo(-10, halfH - 5);
      graphics.lineTo(0, halfH);
      graphics.lineTo(10, halfH - 5);
      graphics.strokePath();

      // Right sharp corner
      graphics.beginPath();
      graphics.moveTo(halfW - 10, -5);
      graphics.lineTo(halfW, 0);
      graphics.lineTo(halfW - 10, 5);
      graphics.strokePath();

      // Left sharp corner
      graphics.beginPath();
      graphics.moveTo(-halfW + 10, -5);
      graphics.lineTo(-halfW, 0);
      graphics.lineTo(-halfW + 10, 5);
      graphics.strokePath();

      // Sharp pointed tips
      graphics.fillStyle(0xffffff, 1.0);
      graphics.fillRect(-1, -halfH - 1, 2, 2);
      graphics.fillRect(-1, halfH - 1, 2, 2);
      graphics.fillRect(halfW - 1, -1, 2, 2);
      graphics.fillRect(-halfW - 1, -1, 2, 2);

    } else {
      // Impassable / blocked tile: sharp muted rose corners (no side borders)
      graphics.fillStyle(0xf43f5e, 0.14);
      graphics.fillPoints(pts, true);

      graphics.lineStyle(2, 0xfecdd3, 0.9);

      graphics.beginPath();
      graphics.moveTo(-8, -halfH + 4);
      graphics.lineTo(0, -halfH);
      graphics.lineTo(8, -halfH + 4);
      graphics.strokePath();

      graphics.beginPath();
      graphics.moveTo(-8, halfH - 4);
      graphics.lineTo(0, halfH);
      graphics.lineTo(8, halfH - 4);
      graphics.strokePath();

      graphics.beginPath();
      graphics.moveTo(halfW - 8, -4);
      graphics.lineTo(halfW, 0);
      graphics.lineTo(halfW - 8, 4);
      graphics.strokePath();

      graphics.beginPath();
      graphics.moveTo(-halfW + 8, -4);
      graphics.lineTo(-halfW, 0);
      graphics.lineTo(-halfW + 8, 4);
      graphics.strokePath();
    }
  }

  createTacticalCursors() {
    // ── 1. Hover Cursor (snaps to hovered tile) ──────────────────
    this.hoverCursorContainer = this.add.container(0, 0).setDepth(510).setVisible(false);
    this.hoverCursorGfx = this.add.graphics();
    this.hoverCursorContainer.add(this.hoverCursorGfx);
    this.drawTacticalCursor(this.hoverCursorGfx, true);

    // Subtle breathing pulse
    this.hoverPulseTween = this.tweens.add({
      targets: this.hoverCursorContainer,
      alpha: 0.7,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── 2. Click Destination Target Marker ───────────────────────
    this.destMarkerContainer = this.add.container(0, 0).setDepth(520).setVisible(false);
    this.destMarkerGfx = this.add.graphics();
    this.destMarkerContainer.add(this.destMarkerGfx);
    this.drawTacticalCursor(this.destMarkerGfx, true);

    // Active destination pulse
    this.destPulseTween = this.tweens.add({
      targets: this.destMarkerContainer,
      scaleX: 1.05,
      scaleY: 1.05,
      alpha: 0.75,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  showDestinationMarker(worldX, worldY) {
    this.destMarkerContainer.setPosition(worldX, worldY);
    this.destMarkerContainer.setVisible(true);
    this.destMarkerContainer.setAlpha(1);

    // Punchy click confirmation pop
    this.destMarkerContainer.setScale(1.2);
    this.tweens.add({
      targets: this.destMarkerContainer,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 160,
      ease: 'Back.easeOut',
    });
  }

  hideDestinationMarker(animated = true) {
    if (!this.destMarkerContainer || !this.destMarkerContainer.visible) return;
    if (animated) {
      this.tweens.add({
        targets: this.destMarkerContainer,
        alpha: 0,
        scaleX: 0.6,
        scaleY: 0.6,
        duration: 180,
        onComplete: () => {
          this.destMarkerContainer.setVisible(false);
        },
      });
    } else {
      this.destMarkerContainer.setVisible(false);
    }
  }

  /** Visual indicator for invalid/blocked clicks */
  showBlockedClickEffect(worldX, worldY) {
    const flash = this.add.ellipse(worldX, worldY, 28, 14, 0xf43f5e, 0.7)
      .setDepth(570);

    this.tweens.add({
      targets: flash,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Pointer Input & Click-To-Move Handler
  // ═══════════════════════════════════════════════════════════════

  handlePointerDown(pointer) {
    if (pointer.button !== 0) return; // Left mouse only

    const worldX = pointer.worldX;
    const worldY = pointer.worldY;

    // Convert screen world coordinates to continuous grid coordinates
    const grid = this.worldToGrid(worldX, worldY);
    const targetCol = grid.col;
    const targetRow = grid.row;

    // Check map boundaries
    if (targetCol < 0 || targetCol >= this.mapCols || targetRow < 0 || targetRow >= this.mapRows) {
      this.showBlockedClickEffect(worldX, worldY);
      return;
    }

    // Run 8-directional A* with line-of-sight smoothing
    const path = this.pathfinder.findPath(this.playerCol, this.playerRow, targetCol, targetRow);

    if (path && path.length > 0) {
      // If clicked tile is walkable, align final destination with precise click location
      const destTileCol = Math.floor(targetCol);
      const destTileRow = Math.floor(targetRow);
      if (this.isCellWalkable(destTileCol, destTileRow)) {
        // Clamp slight margin to keep player inside tile boundaries
        const clampCol = destTileCol + Phaser.Math.Clamp(targetCol - destTileCol, 0.15, 0.85);
        const clampRow = destTileRow + Phaser.Math.Clamp(targetRow - destTileRow, 0.15, 0.85);
        path[path.length - 1] = { col: clampCol, row: clampRow };
      }

      this.currentPath = path;
      this.pathWaypointIndex = 0;

      // If already at or touching the first node, advance to node 1
      if (path.length > 1 && Math.hypot(path[0].col - this.playerCol, path[0].row - this.playerRow) < 0.25) {
        this.pathWaypointIndex = 1;
      }

      const finalWaypoint = path[path.length - 1];
      const targetTileCol = Math.floor(finalWaypoint.col);
      const targetTileRow = Math.floor(finalWaypoint.row);
      const destCenter = this.toWorldPos(targetTileCol + 0.5, targetTileRow + 0.5);
      this.showDestinationMarker(destCenter.x, destCenter.y);
    } else {
      this.showBlockedClickEffect(worldX, worldY);
    }
  }

  clearPath(arrived = false) {
    this.currentPath = null;
    this.pathWaypointIndex = 0;
    this.hideDestinationMarker(arrived);
  }

  // ═══════════════════════════════════════════════════════════════
  // HUD
  // ═══════════════════════════════════════════════════════════════

  createHud() {
    this.hudTitle = this.add.text(14, 14, '🗺  Valley — Isometric Campus Map', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#7dd3fc',
      backgroundColor: '#0f172aee',
      padding: { x: 10, y: 7 },
    }).setScrollFactor(0).setDepth(1000);

    this.hudSubtitle = this.add.text(14, 52, '🖱️ Click anywhere to move (A*) · WASD / Arrows · Space/J: Attack · E: Interact', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#94a3b8',
      backgroundColor: '#0f172acc',
      padding: { x: 8, y: 5 },
    }).setScrollFactor(0).setDepth(1000);

    this.posText = this.add.text(14, 80, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#38bdf8',
      backgroundColor: '#0f172a99',
      padding: { x: 6, y: 4 },
    }).setScrollFactor(0).setDepth(1000);
  }

  handleResize(gameSize) {
    if (!gameSize || !this.cameras?.main) return;
    const width = gameSize.width;
    const height = gameSize.height;

    this.updateCameraForViewport(width, height);
    this.updateHudLayout(width, height);
  }

  updateCameraForViewport(width, height) {
    const isPortrait = height > width;

    let targetZoom = 2.0;
    if (isPortrait) {
      // Dynamic zoom for portrait mobile screens
      targetZoom = Math.min(1.7, Math.max(1.3, width / 260));
    } else if (height <= 480) {
      // Mobile Landscape (height: 320px - 480px, width: 640px - 932px)
      // Calibrated so pixel art is crisp and terrain is widely visible
      targetZoom = Math.min(1.85, Math.max(1.4, height / 230));
    } else if (width < 960) {
      targetZoom = Math.min(2.0, Math.max(1.5, width / 520));
    } else {
      targetZoom = 2.0;
    }

    this.cameras.main.setZoom(targetZoom);
  }

  updateHudLayout(width, height) {
    if (!this.hudTitle || !this.hudSubtitle || !this.posText) return;

    const isPortrait = height > width;
    const isMobileLandscape = height <= 500 && width > height;

    if (isPortrait) {
      this.hudTitle
        .setPosition(10, 10)
        .setFontSize('11px')
        .setText('🗺 Valley RPG')
        .setPadding(8, 5);

      this.hudSubtitle
        .setPosition(10, 38)
        .setFontSize('8px')
        .setText('Tap map · Joystick & buttons')
        .setPadding(6, 4);

      this.posText
        .setPosition(10, 62)
        .setFontSize('8px')
        .setPadding(5, 3);
    } else if (isMobileLandscape) {
      this.hudTitle
        .setPosition(10, 8)
        .setFontSize('10px')
        .setText('🗺 Valley RPG')
        .setPadding(6, 4);

      this.hudSubtitle
        .setPosition(10, 30)
        .setFontSize('7.5px')
        .setText('Tap map · Joystick to move · Sword to attack')
        .setPadding(5, 3);

      this.posText
        .setPosition(10, 50)
        .setFontSize('7.5px')
        .setPadding(4, 2);
    } else {
      this.hudTitle
        .setPosition(14, 14)
        .setFontSize('13px')
        .setText('🗺  Valley — Isometric Campus Map')
        .setPadding(10, 7);

      this.hudSubtitle
        .setPosition(14, 52)
        .setFontSize('10px')
        .setText('🖱️ Click anywhere to move (A*) · WASD / Arrows · Space/J: Attack · E: Interact')
        .setPadding(8, 5);

      this.posText
        .setPosition(14, 80)
        .setFontSize('9px')
        .setPadding(6, 4);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Update Loop
  // ═══════════════════════════════════════════════════════════════

  update() {
    // ── 1. Manual Input Override (WASD / Arrows / Virtual Joystick) ──────────────
    let dx = 0, dy = 0;

    // Physical keyboard input
    if (this.keys.left.isDown  || this.cursors.left.isDown)  dx -= 1;
    if (this.keys.right.isDown || this.cursors.right.isDown) dx += 1;
    if (this.keys.up.isDown    || this.cursors.up.isDown)    dy -= 1;
    if (this.keys.down.isDown  || this.cursors.down.isDown)  dy += 1;

    // Virtual joystick input
    if (this.virtualAxis) {
      dx += this.virtualAxis.x;
      dy += this.virtualAxis.y;
    }

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryInteraction();
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.attackKeyJ) ||
      Phaser.Input.Keyboard.JustDown(this.attackKeySpace)
    ) {
      this.triggerAttack();
    }

    const manualMoving = Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05;

    if (manualMoving) {
      // Manual input cancels any active click-to-move path
      if (this.currentPath) {
        this.clearPath(false);
      }

      if (Math.abs(dy) >= Math.abs(dx)) {
        if      (dy < 0) this.direction = 'up';
        else if (dy > 0) this.direction = 'down';
      } else {
        if      (dx < 0) this.direction = 'left';
        else if (dx > 0) this.direction = 'right';
      }

      const len    = Math.hypot(dx, dy) || 1;
      const speedScale = Math.min(1, Math.max(0.35, len));
      const newCol = Phaser.Math.Clamp(
        this.playerCol + (dx / len) * (this.maxSpeed * speedScale), 0.5, this.mapCols - 1.5);
      const newRow = Phaser.Math.Clamp(
        this.playerRow + (dy / len) * (this.maxSpeed * speedScale), 0.5, this.mapRows - 1.5);

      if (this.isCellWalkable(Math.floor(newCol), Math.floor(newRow))) {
        this.playerCol = newCol;
        this.playerRow = newRow;
      }
      this.isMoving = true;
    }
    // ── 2. Click-to-Move Path Following ──────────────────────────
    else if (this.currentPath && this.pathWaypointIndex < this.currentPath.length) {
      const targetWaypoint = this.currentPath[this.pathWaypointIndex];
      const dc = targetWaypoint.col - this.playerCol;
      const dr = targetWaypoint.row - this.playerRow;
      const distToWaypoint = Math.hypot(dc, dr);

      // Calculate total remaining distance across all remaining nodes
      let totalDistRemaining = distToWaypoint;
      for (let i = this.pathWaypointIndex + 1; i < this.currentPath.length; i++) {
        const pA = this.currentPath[i - 1];
        const pB = this.currentPath[i];
        totalDistRemaining += Math.hypot(pB.col - pA.col, pB.row - pA.row);
      }

      // Smooth acceleration & deceleration
      if (totalDistRemaining < this.decelDist) {
        const speedRatio = Math.max(0.3, totalDistRemaining / this.decelDist);
        const targetSpeed = this.maxSpeed * speedRatio;
        this.currentSpeed = Math.max(targetSpeed, this.currentSpeed - this.accel * 1.6);
      } else {
        this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + this.accel);
      }

      if (distToWaypoint > 0.001) {
        const step = Math.min(this.currentSpeed, distToWaypoint);
        this.playerCol += (dc / distToWaypoint) * step;
        this.playerRow += (dr / distToWaypoint) * step;

        // Visual screen movement direction for LPC sprite animation
        const worldDx = (dc - dr) * (this.tileW / 2);
        const worldDy = (dc + dr) * (this.tileH / 2);

        if (Math.abs(worldDx) >= Math.abs(worldDy)) {
          this.direction = worldDx > 0 ? 'right' : 'left';
        } else {
          this.direction = worldDy > 0 ? 'down' : 'up';
        }

        this.isMoving = true;
      }

      // Advance waypoint when reached
      if (distToWaypoint <= 0.08) {
        this.pathWaypointIndex++;
        if (this.pathWaypointIndex >= this.currentPath.length) {
          // Arrived smoothly at destination
          this.playerCol = targetWaypoint.col;
          this.playerRow = targetWaypoint.row;
          this.clearPath(true);
          this.isMoving = false;
        }
      }
    } else {
      this.currentSpeed = 0;
      this.isMoving = false;
    }

    // ── Attack animation timing ──────────────────────────────────
    if (this.isAttacking) {
      this.attackTimer++;
      if (this.attackTimer >= this.ATTACK_ANIM_SPEED) {
        this.attackTimer = 0;
        this.attackFrame++;
        if (this.attackFrame >= this.SLASH_FRAMES) {
          this.isAttacking = false;
          this.attackFrame = 0;
        }
      }
    }

    // ── 3. Animation Timing ──────────────────────────────────────
    if (this.isMoving) {
      this.animTimer += (this.currentSpeed > 0 ? this.currentSpeed / this.maxSpeed : 1.0);
      if (this.animTimer >= this.ANIM_SPEED) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % this.WALK_FRAMES;
      }
    } else {
      this.animTimer = 0;
      this.animFrame = 0;
    }

    // ── 4. Position & Dynamic Depth Sorting ──────────────────────
    const wp = this.toWorldPos(this.playerCol, this.playerRow);
    this.charSprite.setPosition(wp.x, wp.y);
    this.charShadow.setPosition(wp.x, wp.y + 4);
    this.nameLabel.setPosition(wp.x, wp.y - 46);

    const depth = 600 + Math.floor(this.playerCol) + Math.floor(this.playerRow);
    this.charSprite.setDepth(depth);
    this.charShadow.setDepth(depth - 1);
    this.nameLabel.setDepth(depth + 1);

    this.drawCharFrame();

    // ── 5. Hover Cursor Tracking ─────────────────────────────────
    this.updateHoverCursor();

    // ── 6. HUD Status ────────────────────────────────────────────
    if (this.posText) {
      const modeText = this.currentPath
        ? `A* Navigating (${this.currentPath.length - this.pathWaypointIndex} waypoints)`
        : (this.isMoving ? 'Manual WASD' : 'Stationary');
      this.posText.setText(
        `Tile [${Math.floor(this.playerCol)}, ${Math.floor(this.playerRow)}] · ${modeText}`
      );
    }
  }

  updateHoverCursor() {
    if (!this.hoverCursorContainer) return;

    const pointer = this.input.activePointer;
    if (!pointer) return;

    const grid = this.worldToGrid(pointer.worldX, pointer.worldY);
    const col = Math.floor(grid.col);
    const row = Math.floor(grid.row);

    if (col >= 0 && col < this.mapCols && row >= 0 && row < this.mapRows) {
      const center = this.toWorldPos(col + 0.5, row + 0.5);
      this.hoverCursorContainer.setPosition(center.x, center.y);
      this.hoverCursorContainer.setVisible(true);

      const walkable = this.isCellWalkable(col, row);
      if (walkable !== this.lastHoverWalkable) {
        this.lastHoverWalkable = walkable;
        this.drawTacticalCursor(this.hoverCursorGfx, walkable);
      }
    } else {
      this.hoverCursorContainer.setVisible(false);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Combat & Virtual Controller APIs
  // ═══════════════════════════════════════════════════════════════

  setVirtualAxis(x, y) {
    this.virtualAxis = {
      x: Phaser.Math.Clamp(Number(x) || 0, -1, 1),
      y: Phaser.Math.Clamp(Number(y) || 0, -1, 1),
    };
  }

  triggerAttack() {
    const now = Date.now();
    if (this.isAttacking || (now - this.lastAttackTime < this.attackCooldown)) {
      return false;
    }

    this.lastAttackTime = now;
    this.isAttacking = true;
    this.attackFrame = 0;
    this.attackTimer = 0;

    this.drawCharFrame();
    this.playSlashEffect();
    return true;
  }

  playSlashEffect() {
    const wp = this.toWorldPos(this.playerCol, this.playerRow);
    const depth = 600 + this.playerCol + this.playerRow + 4;

    let offsetX;
    let offsetY;
    let baseAngle;

    switch (this.direction) {
      case 'up':
        offsetX = 0;
        offsetY = -24;
        baseAngle = -Math.PI / 2;
        break;
      case 'down':
        offsetX = 0;
        offsetY = 16;
        baseAngle = Math.PI / 2;
        break;
      case 'left':
        offsetX = -24;
        offsetY = -6;
        baseAngle = Math.PI;
        break;
      case 'right':
      default:
        offsetX = 24;
        offsetY = -6;
        baseAngle = 0;
        break;
    }

    const slashOriginX = wp.x + offsetX;
    const slashOriginY = wp.y + offsetY;

    const gfx = this.add.graphics();
    gfx.setDepth(depth);

    const drawArc = (progress) => {
      gfx.clear();
      const radius = 18 + progress * 8;
      const alpha = Math.max(0, 1 - progress);

      // Outer cyan glow arc
      gfx.lineStyle(4, 0x00f5ff, alpha * 0.85);
      gfx.beginPath();
      gfx.arc(slashOriginX, slashOriginY, radius, baseAngle - 0.75, baseAngle + 0.75, false);
      gfx.strokePath();

      // Inner sharp white arc
      gfx.lineStyle(2, 0xffffff, alpha);
      gfx.beginPath();
      gfx.arc(slashOriginX, slashOriginY, radius, baseAngle - 0.5, baseAngle + 0.5, false);
      gfx.strokePath();
    };

    drawArc(0);

    let step = 0;
    const timer = this.time.addEvent({
      delay: 25,
      repeat: 6,
      callback: () => {
        step++;
        const progress = step / 6;
        drawArc(progress);
        if (step >= 6) {
          gfx.destroy();
          timer.destroy();
        }
      },
    });

    // Subtle punchy camera kick
    this.cameras.main.shake(70, 0.0015);
  }

  // ═══════════════════════════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════════════════════════

  getTileAt(col, row) {
    if (col < 0 || row < 0 || col >= this.mapCols || row >= this.mapRows) return 0;
    return this.mapData[row * this.mapCols + col];
  }

  isWalkable(gid) {
    return [41, 149, 151, 166, 167, 171, 173, 180, 181, 182].includes(gid);
  }

  tryInteraction() {
    if (this.onInteract) this.onInteract('nexus');
  }

  shutdown() {
    this.scale.off('resize', this.handleResize, this);
    this.registry.events.off('set_virtual_axis');
    this.registry.events.off('trigger_virtual_attack');
    this.registry.events.off('trigger_virtual_interact');
    this.input.off('pointerdown', this.handlePointerDown, this);
    if (this.hoverPulseTween) this.hoverPulseTween.stop();
    if (this.destPulseTween) this.destPulseTween.stop();
  }
}
