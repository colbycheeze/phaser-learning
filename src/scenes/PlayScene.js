import Phaser from 'phaser';
import {
  SCENE,
  TILEMAP,
  IMAGE,
  TILESET,
} from 'common/constants';
import Player from 'entities/Player';
import MouseTileMarker from 'entities/TileMarker';

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.PLAY });
  }

  marker

  player

  map

  isPlayerDead = false

  spikeGroup

  groundLayer

  createWorld() {
    this.map = this.make.tilemap({ key: TILEMAP.PLATFORMER });
    const { map } = this;
    const tileset = map.addTilesetImage(TILESET.INDUSTRIAL, TILESET.INDUSTRIAL);
    map.createDynamicLayer('Background', tileset);
    this.groundLayer = map.createDynamicLayer('Ground', tileset);
    const { groundLayer } = this;
    map.createDynamicLayer('Foreground', tileset);

    groundLayer.setCollisionByProperty({ collides: true });

    this.spikeGroup = this.physics.add.staticGroup();
    groundLayer.forEachTile((tile) => {
      if (tile.index === 77) {
        const spike = this.spikeGroup.create(tile.getCenterX(), tile.getCenterY(), IMAGE.SPIKE);

        spike.rotation = tile.rotation;
        if (spike.angle === 0) spike.body.setSize(32, 6).setOffset(0, 26);
        else if (spike.angle === -90) spike.body.setSize(6, 32).setOffset(26, 0);
        else if (spike.angle === 90) spike.body.setSize(6, 32).setOffset(0, 0);

        groundLayer.removeTileAt(tile.x, tile.y);
      }
    });
  }

  createHelpText() {
    this.add.text(16, 16, 'Arrow/WASD to move & jump\nLeft click to draw platforms', {
      font: '18px monospace',
      fill: '#000000',
      padding: { x: 20, y: 10 },
      backgroundColor: '#ffffff',
    }).setScrollFactor(0);
  }

  createPlayer() {
    const { map, physics, groundLayer } = this;
    const { x, y } = map.findObject('Objects', ({ name }) => name === 'Spawn Point');

    this.player = new Player(this, x, y);

    physics.add.collider(this.player.sprite, groundLayer);
  }

  createInput() {
    const { groundLayer, input } = this;

    // Debug graphics
    input.keyboard.once('keydown_F1', () => {
      this.physics.world.createDebugGraphic();

      // Create worldLayer collision graphic above the player, but below the help text
      const graphics = this.add
        .graphics()
        .setAlpha(0.75)
        .setDepth(20);

      groundLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
      });
    });
  }

  handleSpikeCollision() {
    const {
      scene, player, physics, groundLayer, spikeGroup, cameras,
    } = this;

    if (
      player.sprite.y > groundLayer.height
      || physics.world.overlap(player.sprite, spikeGroup)
    ) {
      this.isPlayerDead = true;

      const cam = cameras.main;
      cam.shake(100, 0.05);
      cam.fade(550, 0, 0, 0);

      player.freeze();

      cam.once('camerafadeoutcomplete', () => {
        player.destroy();
        scene.restart();
      });
    }
  }

  create() {
    this.isPlayerDead = false;

    this.createWorld();
    this.createHelpText();
    this.createPlayer();
    const { player, map, cameras } = this;
    const camera = cameras.main;
    camera.startFollow(player.sprite);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.marker = new MouseTileMarker(this, map);
    this.createInput();
  }

  update() {
    const { player, isPlayerDead, marker } = this;
    if (isPlayerDead) return;

    player.update();
    marker.update();

    this.handleSpikeCollision();
  }
}
