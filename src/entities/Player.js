import Phaser from 'phaser';
import { SPRITE } from 'common/constants';

export default class Player {
  scene

  sprite

  keys

  static CreateAnimations(scene) {
    const { anims } = scene;

    anims.create({
      key: 'player-idle',
      frames: anims.generateFrameNumbers(SPRITE.PLAYER, { start: 0, end: 3 }),
      frameRate: 3,
      repeat: -1,
    });
    anims.create({
      key: 'player-run',
      frames: anims.generateFrameNumbers(SPRITE.PLAYER, { start: 8, end: 15 }),
      frameRate: 12,
      repeat: -1,
    });
  }

  constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = scene.physics.add
      .sprite(x, y, SPRITE.PLAYER, 0)
      .setDrag(1000, 0)
      .setMaxVelocity(300, 400)
      .setSize(18, 24)
      .setOffset(7, 9);

    const {
      LEFT, RIGHT, UP, W, A, D,
    } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard.addKeys({
      left: LEFT,
      right: RIGHT,
      up: UP,
      w: W,
      a: A,
      d: D,
    });
  }

  freeze() {
    this.sprite.body.moves = false;
  }

  destroy() {
    this.sprite.destroy();
  }

  update() {
    const { JustDown } = Phaser.Input.Keyboard;
    const { keys, sprite } = this;
    const onGround = sprite.body.blocked.down;
    const acceleration = onGround ? 600 : 200;

    if (keys.left.isDown || keys.a.isDown) {
      sprite.setAccelerationX(-acceleration);
      sprite.setFlipX(true);
    } else if (keys.right.isDown || keys.d.isDown) {
      sprite.setAccelerationX(acceleration);
      sprite.setFlipX(false);
    } else {
      sprite.setAccelerationX(0);
    }

    if (onGround && (JustDown(keys.up) || JustDown(keys.w))) {
      sprite.setVelocityY(-500);
    }

    if (onGround) {
      if (sprite.body.velocity.x !== 0) sprite.anims.play('player-run', true);
      else sprite.anims.play('player-idle', true);
    } else {
      sprite.anims.stop();
      sprite.setTexture(SPRITE.PLAYER, 10);
    }
  }
}
