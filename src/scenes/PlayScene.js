import Phaser from 'phaser';
import {
  SCENE,
  IMAGE,
  SPRITE,
} from 'common/constants';

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.PLAY });
  }

  dude

  bombs

  stars

  platforms

  ground

  particles

  game

  keys

  gameOver = false

  worldWidth = 1280

  worldHeight = 960

  createPlatform(x, y, type = IMAGE.GRASS) {
    this.platforms.create(x, y, type)
      .setSize(132, 30)
      .setOffset(4, 1);
  }

  createPlatforms() {
    const grassPlatformWidth = 142;
    const maxJump = 150;

    this.platforms = this.physics.add.staticGroup();

    // Create full ground layer
    this.ground = this.add.zone(0, this.worldHeight - 10).setSize(this.worldWidth, 32);
    this.physics.world.enable(this.ground);
    this.ground.body.setAllowGravity(false);
    this.ground.body.immovable = true;
    for (let x = grassPlatformWidth / 2; x < this.worldWidth; x += grassPlatformWidth) {
      this.add.image(x, this.worldHeight + 5, IMAGE.GRASS);
    }


    this.createPlatform(71, this.worldHeight - maxJump);
    this.createPlatform(71 + 200, this.worldHeight - (maxJump * 2));
    this.createPlatform(71 + 400, this.worldHeight - (maxJump * 3));
    this.createPlatform(71 + 200, this.worldHeight - (maxJump * 4));
    this.createPlatform(71, this.worldHeight - (maxJump * 5));

    this.createPlatform(71 + 550, this.worldHeight - maxJump);
    this.createPlatform(71 + 550, this.worldHeight - (maxJump * 5));

    this.createPlatform(this.worldWidth - 71, this.worldHeight - maxJump);
    this.createPlatform(this.worldWidth - 71 - 200, this.worldHeight - (maxJump * 2));
    this.createPlatform(this.worldWidth - 71 - 400, this.worldHeight - (maxJump * 3));
    this.createPlatform(this.worldWidth - 71 - 200, this.worldHeight - (maxJump * 4));
    this.createPlatform(this.worldWidth - 71, this.worldHeight - (maxJump * 5));
  }

  createDude() {
    this.dude = this.physics.add.sprite(100, this.worldHeight - 200, SPRITE.DUDE)
      .setSize(16, 40)
      .setOffset(8, 8)
      .setCollideWorldBounds(true)
      .setMaxVelocity(400, 400)
      .setDrag(1000, 0);
    this.cameras.main.startFollow(this.dude);
    this.cameras.main.setDeadzone(200, 0);
  }

  createStars() {
    const numStars = 11;

    this.stars = this.physics.add.group({
      key: IMAGE.STAR,
      repeat: numStars,
      setXY: { x: 12, y: 0, stepX: this.worldWidth / numStars },
    });

    this.stars.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      child.setVelocityX(Phaser.Math.FloatBetween(-20, 20));
      child.setCollideWorldBounds(true);
      child.setDrag(20, 0);
    });
  }

  createEntities() {
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight + 32);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.add.image(0, 0, IMAGE.BACKGROUND).setOrigin(0, 0).setScale(2);

    this.createPlatforms();
    this.createDude();
    this.createStars();

    this.bombs = this.physics.add.group();
    this.particles = this.add.particles(IMAGE.RED);
    this.createBomb();
    this.createBomb();
  }

  createBomb() {
    const x = (this.dude.x < this.worldWidth / 2)
      ? Phaser.Math.Between(this.worldWidth, this.worldHeight)
      : Phaser.Math.Between(0, this.worldWidth);
    const bomb = this.bombs.create(x, 16, IMAGE.BOMB);
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.setMaxVelocity(1000, 1000);
    bomb.body.allowGravity = false;
    bomb.setCircle(7);

    const emitter = this.particles.createEmitter({
      speed: 100,
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      maxParticles: 10,
      lifespan: 200,
    });

    emitter.startFollow(bomb);
  }

  createInput() {
    const { KeyCodes } = Phaser.Input.Keyboard;

    this.keys = this.input.keyboard.addKeys({
      left: KeyCodes.LEFT,
      right: KeyCodes.RIGHT,
      up: KeyCodes.UP,
      w: KeyCodes.W,
      a: KeyCodes.A,
      d: KeyCodes.D,
    });
  }

  setupPhysics() {
    this.physics.add.collider(this.ground, this.dude);
    this.physics.add.collider(this.ground, this.stars);
    this.physics.add.collider(this.ground, this.bombs);
    this.physics.add.collider(this.dude, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.bombs, this.bombs);
    this.physics.add.overlap(this.dude, this.stars, this.collectStar, null, this);
    this.physics.add.collider(this.dude, this.bombs, this.hitBomb, null, this);
  }

  collectStar(dude, star) {
    star.disableBody(true, true);

    this.events.emit('collectStar');

    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate((child) => {
        child.enableBody(true, child.x, 0, true, true);
      });

      this.createBomb();
    }
  }

  restartGame() {
    this.gameOver = false;
    this.physics.world.timeScale = 1;
    this.scene.restart();
  }

  hitBomb(dude) {
    if (this.gameOver) return;
    this.physics.world.timeScale = 4;
    this.gameOver = true;

    dude.setTint(0xff0000);
    dude.anims.play('player-idle');
    dude.setMaxVelocity(5000, 5000);

    this.cameras.main.shake(250, 0.05, false);
    this.time.delayedCall(3000, this.restartGame);
  }

  restartGame = () => {
    this.events.emit('restartGame');
    this.gameOver = false;
    this.physics.world.timeScale = 1;
    this.scene.restart();
  }

  handlePlayerInput() {
    if (this.gameOver) return;

    const { JustDown, JustUp } = Phaser.Input.Keyboard;
    const onGround = this.dude.body.blocked.down || this.dude.body.touching.down;
    const acceleration = onGround ? 600 : 200;

    if (this.keys.left.isDown || this.keys.a.isDown) {
      if (JustUp(this.keys.right) || JustUp(this.keys.d)) {
        this.dude.setVelocityX(this.dude.body.velocity.x / 3);
      }

      this.dude.setAccelerationX(-acceleration);
      this.dude.setFlipX(true);
    } else if (this.keys.right.isDown || this.keys.d.isDown) {
      if (JustUp(this.keys.left) || JustUp(this.keys.a)) {
        this.dude.setVelocityX(this.dude.body.velocity.x / 3);
      }

      this.dude.setAccelerationX(acceleration);
      this.dude.setFlipX(false);
    } else {
      this.dude.setAccelerationX(0);
    }

    if ((JustDown(this.keys.up) || JustDown(this.keys.w)) && onGround) {
      this.dude.setVelocityY(-450);
      this.dude.setAccelerationY(-500);
    } else if ((JustUp(this.keys.up) || JustUp(this.keys.w))) {
      this.dude.setAccelerationY(0);
    }

    if (onGround) {
      if (this.dude.body.velocity.x !== 0) this.dude.anims.play('player-run', true);
      else this.dude.anims.play('player-idle', true);
    } else {
      this.dude.anims.stop();
      if (this.dude.body.velocity.x === 0) this.dude.setTexture(SPRITE.DUDE, 4);
      else this.dude.setTexture(SPRITE.DUDE, 6);
    }
  }

  // This fixes the bugginess when balls are on ledge corners or lose momentum on the ground
  updateBombs() {
    this.bombs.children.iterate((bomb) => {
      if (bomb.body.speed < 400) {
        bomb.setData('slowTime', (bomb.getData('slowTime') || 0) + 1);
        if (bomb.getData('slowTime') > 100) {
          bomb.body.reset(bomb.body.x, bomb.body.y - 10);
          bomb.setVelocity(bomb.body.velocity.x + 20, Phaser.Math.Between(-500, -400));
          bomb.setData('slowTime', 0);
        }
      } else {
        bomb.setData('slowTime', 0);
      }
    });
  }

  create() {
    this.createEntities();
    this.setupPhysics();
    this.createInput();
  }

  update() {
    this.handlePlayerInput();
    this.updateBombs();
  }
}
