import Phaser from 'phaser';
import {
  SCENE,
  IMAGE,
  SPRITE,
  PATH,
} from 'common/constants';

export default class LoadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.LOAD });
  }

  loadImages() {
    this.load.setPath(PATH.IMAGE);

    Object.values(IMAGE).forEach((prop) => {
      this.load.image(prop, prop);
    });
  }

  loadSpritesheet(keys, frameConfig) {
    this.load.setPath(PATH.SPRITE);

    keys.forEach((sprite) => {
      this.load.spritesheet(sprite, sprite, frameConfig);
    });
  }

  createAnimations() {
    this.anims.create({
      key: 'player-idle',
      frames: [{ key: SPRITE.DUDE, frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: 'player-run',
      frames: this.anims.generateFrameNumbers(SPRITE.DUDE, { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  preload() {
    this.loadImages();
    this.loadSpritesheet([SPRITE.DUDE], { frameWidth: 32, frameHeight: 48 });

    const loadingBar = this.add.graphics({
      fillStyle: {
        color: 0xffffff,
      },
    });

    const halfScreenWidth = this.game.renderer.width / 2;
    const halfScreenHeight = this.game.renderer.height / 2;
    const maxBarLength = this.game.renderer.width * 0.80;
    this.load.on('progress', (percent) => {
      const barWidth = maxBarLength * percent;

      loadingBar.fillRect(halfScreenWidth - barWidth / 2, halfScreenHeight - 25, barWidth, 50);
    });
  }

  create() {
    this.createAnimations();
    this.scene.start(SCENE.PLAY);
    this.scene.start(SCENE.SCORE);
  }
}
