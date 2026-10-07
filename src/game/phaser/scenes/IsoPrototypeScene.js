import Phaser from 'phaser';
import spritesheetUrl from '../../../assets/tiled-map/spritesheet.png';
import charWalkUrl   from '../../../assets/lpc_male_animations_2026-10-01T09-47-27/standard/walk.png';
import charIdleUrl   from '../../../assets/lpc_male_animations_2026-10-01T09-47-27/standard/idle.png';
import charRunUrl    from '../../../assets/lpc_male_animations_2026-10-01T09-47-27/standard/run.png';

/**
 * Renders first-trial-map.tmx with the real LPC character sprite.
 *
 * ── Map ───────────────────────────────────────────────────────────
 *   orientation = isometric  •  tilewidth=32  tileheight=16
 *   30 × 30 tiles  •  tileset: spritesheet.png (32×32, 11 cols)
 *   Tileset 1: firstgid=1   (GIDs  1–121)
 *   Tileset 2: firstgid=122 (GIDs 122–242)  ← same image, offset
 *
 * ── Character ─────────────────────────────────────────────────────
 *   LPC standard layout: 64×64 px / frame  •  13 cols × 4 rows
 *   Row 0 = UP  •  Row 1 = LEFT  •  Row 2 = DOWN  •  Row 3 = RIGHT
 *   Walk:  frames 0–8  (9 frames)
 *   Idle:  frames 0–1  (2 frames)
 */
export default class IsoPrototypeScene extends Phaser.Scene {
  constructor() {
    super('IsoPrototypeScene');

    // ── Tile dimensions (scaled up ×2 from TMX source) ──────────
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

    // Offscreen canvas for character frame extraction
    this._charCanvas = document.createElement('canvas');
    this._charCanvas.width  = this.FRAME_W;
    this._charCanvas.height = this.FRAME_H;
    this._charCtx = this._charCanvas.getContext('2d');
    this._charCtx.imageSmoothingEnabled = false;

    // Direction row mapping (LPC standard)
    this.DIR_ROW = { up: 0, left: 1, down: 2, right: 3 };

    // Player state
    this.playerCol = 15.0;
    this.playerRow = 15.0;
    this.speed     = 0.07;
    this.direction = 'down';
    this.isMoving  = false;

    // Animation counters
    this.animTimer  = 0;
    this.animFrame  = 0;
    this.ANIM_SPEED = 8; // game ticks per frame advance

    this.onInteract = null;
  }

  // ═══════════════════════════════════════════════════════════════
  preload() {
    this.load.image('spritesheet', spritesheetUrl);
    this.load.image('char_walk',   charWalkUrl);
    this.load.image('char_idle',   charIdleUrl);
    this.load.image('char_run',    charRunUrl);
  }

  // ═══════════════════════════════════════════════════════════════
  create() {
    this.onInteract = this.registry.get('onInteract');
    this.cameras.main.setBackgroundColor('#0b1622');

    this.mapData = this.getTmxData();
    this.buildMapCanvas();

    this.createCharacter();
    this.createHud();

    // ── Input ────────────────────────────────────────────────────
    this.keys = this.input.keyboard.addKeys({
      up:    'W',
      left:  'A',
      down:  'S',
      right: 'D',
    });
    this.cursors     = this.input.keyboard.createCursorKeys();
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // ── Camera ───────────────────────────────────────────────────
    this.cameras.main.startFollow(this.charSprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(2.0);

    this.scale.on('resize', () => {}, this);
  }

  // ═══════════════════════════════════════════════════════════════
  // Map data (from first-trial-map.tmx CSV)
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
  // Map Rendering
  // ═══════════════════════════════════════════════════════════════

  gidToSrc(gid) {
    if (!gid) return null;
    const localId = gid <= 121 ? gid - 1 : gid - 122;
    return {
      x: (localId % this.srcCols)              * this.srcTileW,
      y: Math.floor(localId / this.srcCols)    * this.srcTileH,
    };
  }

  gridToScreen(col, row) {
    return {
      x: (col - row) * (this.tileW / 2),
      y: (col + row) * (this.tileH / 2),
    };
  }

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

    // Origin: top vertex of the diamond sits at (mapRows * tileW/2, padding)
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
  // Character Sprite (LPC)
  // ═══════════════════════════════════════════════════════════════

  createCharacter() {
    const wp = this.toWorldPos(this.playerCol, this.playerRow);

    // Build the walk/idle images into named textures sliced per-frame.
    // We use a canvas texture that we update each tick.
    this._buildCharTexture();

    // Phaser Image that shows our canvas texture
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

  /** Initialise the char_frame canvas texture (first call) */
  _buildCharTexture() {
    if (this.textures.exists('char_frame')) this.textures.remove('char_frame');
    this.textures.addCanvas('char_frame', this._charCanvas);
    this.drawCharFrame();
  }

  /**
   * Crops the correct frame from walk/idle spritesheet onto the
   * shared _charCanvas, then refreshes the 'char_frame' texture.
   */
  drawCharFrame() {
    const row       = this.DIR_ROW[this.direction] ?? 2;
    const texKey    = this.isMoving ? 'char_walk' : 'char_idle';
    const maxFrames = this.isMoving ? this.WALK_FRAMES : this.IDLE_FRAMES;
    const frame     = this.animFrame % maxFrames;

    const srcImg = this.textures.get(texKey).getSourceImage();

    const sx = frame * this.FRAME_W;
    const sy = row   * this.FRAME_H;

    const ctx = this._charCtx;
    ctx.clearRect(0, 0, this.FRAME_W, this.FRAME_H);
    ctx.drawImage(srcImg, sx, sy, this.FRAME_W, this.FRAME_H, 0, 0, this.FRAME_W, this.FRAME_H);

    // Refresh the canvas texture so Phaser sees the new pixels
    this.textures.get('char_frame').refresh();
  }

  // ═══════════════════════════════════════════════════════════════
  // HUD
  // ═══════════════════════════════════════════════════════════════

  createHud() {
    this.add.text(14, 14, '🗺  Valley — Isometric Campus Map', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#7dd3fc',
      backgroundColor: '#0f172aee',
      padding: { x: 10, y: 7 },
    }).setScrollFactor(0).setDepth(1000);

    this.add.text(14, 52, 'WASD / Arrows  ·  E to interact', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#94a3b8',
      backgroundColor: '#0f172acc',
      padding: { x: 8, y: 5 },
    }).setScrollFactor(0).setDepth(1000);

    this.posText = this.add.text(14, 82, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#475569',
      backgroundColor: '#0f172a99',
      padding: { x: 6, y: 4 },
    }).setScrollFactor(0).setDepth(1000);
  }

  // ═══════════════════════════════════════════════════════════════
  // Update
  // ═══════════════════════════════════════════════════════════════

  update() {
    let dx = 0, dy = 0;

    if (this.keys.left.isDown  || this.cursors.left.isDown)  dx -= 1;
    if (this.keys.right.isDown || this.cursors.right.isDown) dx += 1;
    if (this.keys.up.isDown    || this.cursors.up.isDown)    dy -= 1;
    if (this.keys.down.isDown  || this.cursors.down.isDown)  dy += 1;

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryInteraction();
    }

    const moving = dx !== 0 || dy !== 0;

    // ── Direction ────────────────────────────────────────────────
    // Vertical (W/S) takes priority over horizontal (A/D) for the sprite
    // frame, so A+W shows the 'up' frame (same as W alone).
    if (moving) {
      if      (dy < 0) this.direction = 'up';
      else if (dy > 0) this.direction = 'down';
      else if (dx < 0) this.direction = 'left';
      else             this.direction = 'right';
    }

    // ── Movement ─────────────────────────────────────────────────
    if (moving) {
      const len    = Math.hypot(dx, dy) || 1;
      const newCol = Phaser.Math.Clamp(
        this.playerCol + (dx / len) * this.speed, 0.5, this.mapCols - 1.5);
      const newRow = Phaser.Math.Clamp(
        this.playerRow + (dy / len) * this.speed, 0.5, this.mapRows - 1.5);

      const tileGid = this.getTileAt(Math.floor(newCol), Math.floor(newRow));
      if (this.isWalkable(tileGid)) {
        this.playerCol = newCol;
        this.playerRow = newRow;
      }
    }

    this.isMoving = moving;

    // ── Animation timing ─────────────────────────────────────────
    if (moving) {
      this.animTimer++;
      if (this.animTimer >= this.ANIM_SPEED) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % (this.isMoving ? this.WALK_FRAMES : this.IDLE_FRAMES);
      }
    } else {
      this.animTimer = 0;
      this.animFrame = 0;
    }

    // ── Sync sprite position ──────────────────────────────────────
    const wp = this.toWorldPos(this.playerCol, this.playerRow);
    this.charSprite.setPosition(wp.x, wp.y);
    this.charShadow.setPosition(wp.x, wp.y + 4);
    this.nameLabel.setPosition(wp.x, wp.y - 46);

    // ── Depth sort ────────────────────────────────────────────────
    const depth = 600 + this.playerCol + this.playerRow;
    this.charSprite.setDepth(depth);
    this.charShadow.setDepth(depth - 1);
    this.nameLabel.setDepth(depth + 1);

    // ── Redraw character frame ────────────────────────────────────
    this.drawCharFrame();

    // ── HUD ──────────────────────────────────────────────────────
    if (this.posText) {
      this.posText.setText(`col ${Math.floor(this.playerCol)}  row ${Math.floor(this.playerRow)}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════════════════════════

  toWorldPos(col, row) {
    const sp = this.gridToScreen(col, row);
    return { x: this.originX + sp.x, y: this.originY + sp.y };
  }

  getTileAt(col, row) {
    if (col < 0 || row < 0 || col >= this.mapCols || row >= this.mapRows) return 0;
    return this.mapData[row * this.mapCols + col];
  }

  /** GIDs that the character can walk on */
  isWalkable(gid) {
    return [41, 149, 151, 166, 167, 171, 173, 180, 181, 182].includes(gid);
  }

  tryInteraction() {
    if (this.onInteract) this.onInteract('nexus');
  }

  shutdown() {
    this.scale.off('resize', () => {}, this);
  }
}
