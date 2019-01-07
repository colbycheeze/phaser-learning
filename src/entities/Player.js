import { SPRITE } from 'common/constants';

export default class Player {
  static texture = SPRITE.BUCH

  static ANIMS = {
    WALK: 'player-walk',
    WALK_BACK: 'player-walk-back',
  }

  static CreateAnimations(scene) {
    const { anims } = scene;

    anims.create({
      key: Player.ANIMS.WALK,
      frames: anims.generateFrameNumbers(Player.texture, { start: 46, end: 49 }),
      frameRate: 8,
      repeat: -1,
    });
    anims.create({
      key: Player.ANIMS.WALK_BACK,
      frames: anims.generateFrameNumbers(Player.texture, { start: 65, end: 68 }),
      frameRate: 8,
      repeat: -1,
    });
  }

  scene

  sprite

  constructor(scene) {
    this.scene = scene;
    const {
      physics, groundLayer, stuffLayer, map, startRoom,
    } = scene;
    const x = map.tileToWorldX(startRoom.centerX);
    const y = map.tileToWorldY(startRoom.centerY);
    const sprite = physics.add
      .sprite(x, y, Player.texture, 0)
      .setSize(22, 33)
      .setOffset(23, 27);

    sprite.anims.play(Player.ANIMS.WALK_BACK);

    this.scene.keys = scene.input.keyboard.createCursorKeys();

    physics.add.collider(sprite, groundLayer);
    physics.add.collider(sprite, stuffLayer);

    this.sprite = sprite;
  }

  freeze() {
    this.sprite.body.moves = false;
  }

  destroy() {
    this.sprite.destroy();
  }

  update() {
    const { sprite, scene: { keys } } = this;
    const speed = 300;
    const prevVelocity = sprite.body.velocity.clone();

    sprite.body.setVelocity(0);

    // Horizontal movement
    if (keys.left.isDown) {
      sprite.body.setVelocityX(-speed);
      sprite.setFlipX(true);
    } else if (keys.right.isDown) {
      sprite.body.setVelocityX(speed);
      sprite.setFlipX(false);
    }

    // Vertical movement
    if (keys.up.isDown) {
      sprite.body.setVelocityY(-speed);
    } else if (keys.down.isDown) {
      sprite.body.setVelocityY(speed);
    }

    sprite.body.velocity.normalize().scale(speed);

    if (keys.left.isDown || keys.right.isDown || keys.down.isDown) {
      sprite.anims.play(Player.ANIMS.WALK, true);
    } else if (keys.up.isDown) {
      sprite.anims.play(Player.ANIMS.WALK_BACK, true);
    } else {
      sprite.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.y < 0) sprite.setTexture(Player.texture, 65);
      else sprite.setTexture(Player.texture, 46);
    }
  }
}
