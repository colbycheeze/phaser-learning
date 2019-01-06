import Phaser from 'phaser';
import {
  SCENE,
  IMAGE,
  // SPRITE,
  PATH,
  TILESET,
  TILEMAP,
  ATLAS,
} from 'common/constants';

export default class LoadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.LOAD });
  }

  loadImages() {
    this.load.setPath(PATH.IMAGE);

    Object.values(IMAGE).forEach((image) => {
      this.load.image(image, image);
    });
  }

  loadTilesets() {
    this.load.setPath(PATH.TILESET);

    Object.values(TILESET).forEach((tile) => {
      this.load.image(tile, tile);
    });
  }

  loadTilemaps() {
    this.load.setPath(PATH.TILEMAP);

    Object.values(TILEMAP).forEach((map) => {
      this.load.tilemapTiledJSON(map, map);
    });
  }

  loadSpritesheet(keys, frameConfig) {
    this.load.setPath(PATH.SPRITE);

    keys.forEach((sprite) => {
      this.load.spritesheet(sprite, sprite, frameConfig);
    });
  }

  loadAtlas() {
    this.load.setPath(PATH.ATLAS);

    Object.values(ATLAS).forEach(([path, config]) => {
      this.load.atlas(path, path, config);
    });
  }

  createAnimations() {
    const { anims } = this;

    anims.create({
      key: 'misa-left-walk',
      frames: anims.generateFrameNames(ATLAS.TUXMON[0], {
        prefix: 'misa-left-walk.', start: 0, end: 3, zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-right-walk',
      frames: anims.generateFrameNames(ATLAS.TUXMON[0], {
        prefix: 'misa-right-walk.', start: 0, end: 3, zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-front-walk',
      frames: anims.generateFrameNames(ATLAS.TUXMON[0], {
        prefix: 'misa-front-walk.', start: 0, end: 3, zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-back-walk',
      frames: anims.generateFrameNames(ATLAS.TUXMON[0], {
        prefix: 'misa-back-walk.', start: 0, end: 3, zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  preload() {
    this.loadImages();
    this.loadTilesets();
    this.loadTilemaps();
    this.loadAtlas();

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
    // this.scene.start(SCENE.SCORE);
  }
}
