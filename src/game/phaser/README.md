# Phaser migration

This directory is the new game-rendering layer.

Stage 1 currently uses a procedural isometric test scene. The old Canvas renderer is kept as `GameCanvas.legacy.jsx` for rollback/reference.

Next stages:
1. Create the real isometric Tiled map.
2. Load Tiled JSON + tilesets in Phaser.
3. Move player sprite/animation into Phaser.
4. Port collision and interaction data.
5. Add NPC/dialogue/quest systems.
