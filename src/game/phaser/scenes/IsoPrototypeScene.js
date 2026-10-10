import Phaser from 'phaser';
import spritesheetUrl from '../../../assets/tiled-map/spritesheet.png';
import charWalkUrl   from '../../../assets/lpc_male_animations_2026-10-01T09-47-27/standard/walk.png';
import charIdleUrl   from '../../../assets/lpc_male_animations_2026-10-01T09-47-27/standard/idle.png';
import charRunUrl    from '../../../assets/lpc_male_animations_2026-10-01T09-47-27/standard/run.png';
import charSlashUrl  from '../../../assets/lpc_male_animations_2026-10-01T09-47-27/standard/slash.png';

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
 *   Slash: frames 0–5  (6 frames)
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
    this.SLASH_FRAMES = 6;

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

    this.add.text(14, 50, 'WASD / Arrows · Space/J: Attack · E: Interact', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#94a3b8',
      backgroundColor: '#0f172acc',
      padding: { x: 8, y: 5 },
    }).setScrollFactor(0).setDepth(1000);

    this.posText = this.add.text(14, 80, '', {
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

    const moving = Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05;

    // ── Direction ────────────────────────────────────────────────
    if (moving) {
      if (Math.abs(dy) >= Math.abs(dx)) {
        if      (dy < 0) this.direction = 'up';
        else if (dy > 0) this.direction = 'down';
      } else {
        if      (dx < 0) this.direction = 'left';
        else if (dx > 0) this.direction = 'right';
      }
    }

    // ── Movement ─────────────────────────────────────────────────
    if (moving) {
      const len = Math.hypot(dx, dy) || 1;
      const speedScale = Math.min(1, Math.max(0.35, len));
      const newCol = Phaser.Math.Clamp(
        this.playerCol + (dx / len) * (this.speed * speedScale), 0.5, this.mapCols - 1.5);
      const newRow = Phaser.Math.Clamp(
        this.playerRow + (dy / len) * (this.speed * speedScale), 0.5, this.mapRows - 1.5);

      const tileGid = this.getTileAt(Math.floor(newCol), Math.floor(newRow));
      if (this.isWalkable(tileGid)) {
        this.playerCol = newCol;
        this.playerRow = newRow;
      }
    }

    this.isMoving = moving;

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

    // ── Walk / Idle animation timing ─────────────────────────────
    if (moving) {
      this.animTimer++;
      if (this.animTimer >= this.ANIM_SPEED) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % this.WALK_FRAMES;
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
    this.registry.events.off('set_virtual_axis');
    this.registry.events.off('trigger_virtual_attack');
    this.registry.events.off('trigger_virtual_interact');
  }
}
