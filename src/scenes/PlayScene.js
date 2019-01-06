import Phaser from 'phaser';
import {
  SCENE,
  TILEMAP,
  ATLAS,
  TILESET,
} from 'common/constants';

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.PLAY });
  }

  player

  maxSpeed = 175

  map

  cursors

  createWorld() {
    this.map = this.make.tilemap({ key: TILEMAP.TUXMON });

    const { map } = this;
    const tileset = map.addTilesetImage(TILESET.TUXMON, TILESET.TUXMON);
    map.createStaticLayer('Below Player', tileset, 0, 0);
    const worldLayer = map.createStaticLayer('World', tileset, 0, 0);
    const aboveLayer = map.createStaticLayer('Above Player', tileset, 0, 0);

    worldLayer.setCollisionByProperty({ collides: true });
    aboveLayer.setDepth(10);
  }

  createPlayer() {
    const { map, physics } = this;
    const { x, y } = map.findObject('Objects', ({ name }) => name === 'Spawn Point');
    const worldLayer = map.layers.find(({ name }) => name === 'World').tilemapLayer;
    this.player = physics.add
      .sprite(x, y, ATLAS.TUXMON[0], 'misa-front')
      .setSize(30, 20)
      .setOffset(0, 44);

    physics.add.collider(this.player, worldLayer);
  }

  createInput() {
    const { map } = this;
    const worldLayer = map.layers.find(({ name }) => name === 'World').tilemapLayer;

    this.cursors = this.input.keyboard.createCursorKeys();

    // Debug graphics
    this.input.keyboard.once('keydown_D', () => {
      this.physics.world.createDebugGraphic();

      // Create worldLayer collision graphic above the player, but below the help text
      const graphics = this.add
        .graphics()
        .setAlpha(0.75)
        .setDepth(20);

      worldLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
      });
    });
  }

  handlePlayerInput() {
    const { player, cursors, maxSpeed } = this;
    const prevVelocity = player.body.velocity.clone();
    player.body.setVelocity(0);

    // Horizontal movement
    if (cursors.left.isDown) player.body.setVelocityX(-100);
    else if (cursors.right.isDown) player.body.setVelocityX(100);

    // Vertical movement
    if (cursors.up.isDown) player.body.setVelocityY(-100);
    else if (cursors.down.isDown) player.body.setVelocityY(100);

    player.body.velocity.normalize().scale(maxSpeed);

    if (cursors.left.isDown) player.anims.play('misa-left-walk', true);
    else if (cursors.right.isDown) player.anims.play('misa-right-walk', true);
    else if (cursors.up.isDown) player.anims.play('misa-back-walk', true);
    else if (cursors.down.isDown) player.anims.play('misa-front-walk', true);
    else {
      player.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.x < 0) player.setTexture(ATLAS.TUXMON[0], 'misa-left');
      else if (prevVelocity.x > 0) player.setTexture(ATLAS.TUXMON[0], 'misa-right');
      else if (prevVelocity.y < 0) player.setTexture(ATLAS.TUXMON[0], 'misa-back');
      else if (prevVelocity.y > 0) player.setTexture(ATLAS.TUXMON[0], 'misa-front');
    }
  }

  create() {
    this.createWorld();
    this.createPlayer();
    this.createInput();

    const camera = this.cameras.main;
    const { player, map } = this;

    camera.startFollow(player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  update() {
    this.handlePlayerInput();
  }
}
