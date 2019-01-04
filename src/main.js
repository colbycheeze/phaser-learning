import Phaser from 'phaser';

let player;
let bombs;
let stars;
let platforms;
let score = 0;
let scoreText;
let particles;
let game;
let keys;
let gameOver = false;

function createBomb() {
  const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
  const bomb = bombs.create(x, 16, 'bomb');
  bomb.setBounce(1);
  bomb.setCollideWorldBounds(true);
  bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  bomb.allowGravity = false;

  const emitter = particles.createEmitter({
    speed: 100,
    scale: { start: 0.5, end: 0 },
    blendMode: 'ADD',
    maxParticles: 10,
    lifespan: 200,
  });

  emitter.startFollow(bomb);
}
function collectStar(dude, star) {
  star.disableBody(true, true);

  score += 10;
  scoreText.setText(`Score: ${score}`);

  if (stars.countActive(true) === 0) {
    stars.children.iterate((child) => {
      child.enableBody(true, child.x, 0, true, true);
    });

    createBomb();
  }
}

const restartGame = () => {
  gameOver = false;
  game.physics.world.timeScale = 1;
  game.scene.restart();
};
function hitBomb(dude, bomb) {
  if (gameOver) return;
  game.physics.world.timeScale = 4;
  gameOver = true;

  dude.setTint(0xff0000);
  dude.anims.play('player-idle');
  dude.setMaxVelocity(5000, 5000);
  dude.setVelocity(bomb.body.velocity.x * 2, bomb.body.velocity.x * 2);

  game.cameras.main.shake(250, 0.05, false);
  game.time.delayedCall(3000, restartGame);
}

function createEntities() {
  game.physics.world.setBounds(0, 0, 1600, 1200);
  game.add.image(0, 0, 'sky').setOrigin(0, 0);
  game.add.image(800, 0, 'sky').setOrigin(0, 0);
  game.add.image(0, 600, 'sky').setOrigin(0, 0);
  game.add.image(800, 600, 'sky').setOrigin(0, 0);

  platforms = game.physics.add.staticGroup();

  platforms.create(400, 550, 'ground').setScale(2, 1).refreshBody();
  platforms.create(1400, 550, 'ground').setScale(2, 1).refreshBody();
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  player = game.physics.add.sprite(100, 450, 'dude');

  const { KeyCodes } = Phaser.Input.Keyboard;
  keys = game.input.keyboard.addKeys({
    left: KeyCodes.LEFT,
    right: KeyCodes.RIGHT,
    up: KeyCodes.UP,
    w: KeyCodes.W,
    a: KeyCodes.A,
    d: KeyCodes.D,
  });

  stars = game.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  bombs = game.physics.add.group();
  particles = game.add.particles('red');

  game.cameras.main.setBounds(0, 0, 1600, 1200);
  game.cameras.main.startFollow(player);
  game.cameras.main.setDeadzone(200, 0);
}

function setupPhysics() {
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(400, 400);
  player.setDrag(1000, 0);

  stars.children.iterate((child) => {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    child.setVelocityX(Phaser.Math.FloatBetween(-200, 200));
    child.setCollideWorldBounds(true);
    child.setDrag(20, 0);
  });

  game.physics.add.collider(player, platforms);
  game.physics.add.collider(stars, platforms);
  game.physics.add.collider(bombs, platforms);
  game.physics.add.overlap(player, stars, collectStar, null, game);
  game.physics.add.collider(player, bombs, hitBomb, null, game);
}

function createScore() {
  scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}

function createAnimations() {
  game.anims.create({
    key: 'player-idle',
    frames: [{ key: 'dude', frame: 4 }],
    frameRate: 20,
  });

  game.anims.create({
    key: 'player-run',
    frames: game.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });
}

function handleInput() {
  if (gameOver) return;

  const { JustDown, JustUp } = Phaser.Input.Keyboard;
  const onGround = player.body.blocked.down || player.body.touching.down;
  const acceleration = onGround ? 600 : 200;

  if (keys.left.isDown || keys.a.isDown) {
    // if (JustUp(keys.right || keys.d)) player.setVelocityX(player.body.velocity.x / 4);
    if (JustUp(keys.right || keys.d)) player.setVelocityX(0);

    player.setAccelerationX(-acceleration);
    player.setFlipX(true);
  } else if (keys.right.isDown || keys.d.isDown) {
    if (JustUp(keys.left || keys.a)) player.setVelocityX(0);

    player.setAccelerationX(acceleration);
    player.setFlipX(false);
  } else {
    player.setAccelerationX(0);
  }

  if ((JustDown(keys.up) || JustDown(keys.w)) && onGround) {
    player.setVelocityY(-450);
    player.setAccelerationY(-500);
  } else if ((JustUp(keys.up) || JustUp(keys.w))) {
    player.setAccelerationY(0);
  }

  if (onGround) {
    if (player.body.velocity.x !== 0) player.anims.play('player-run', true);
    else player.anims.play('player-idle', true);
  } else {
    player.anims.stop();
    if (player.body.velocity.x === 0) player.setTexture('dude', 4);
    else player.setTexture('dude', 6);
  }
}

function preload() {
  game = this;

  game.load.setPath('assets');
  game.load.image('red', 'red.png');
  game.load.image('sky', 'sky.png');
  game.load.image('ground', 'platform.png');
  game.load.image('star', 'star.png');
  game.load.image('bomb', 'bomb.png');
  game.load.spritesheet(
    'dude',
    'dude.png',
    { frameWidth: 32, frameHeight: 48 },
  );
}

function create() {
  createEntities();
  createAnimations();
  setupPhysics();
  createScore();
  createBomb();
}

function update() {
  handleInput();
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

new Phaser.Game(config); // eslint-disable-line no-new
