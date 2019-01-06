import Phaser from 'phaser';
import {
  SCENE,
  IMAGE,
  SPRITE,
  PATH,
  TILESET,
  TILEMAP,
  ATLAS,
} from 'common/constants';
import Player from 'entities/Player';

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

  showLoadingBar() {
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

  preload() {
    this.loadImages();
    this.loadTilesets();
    this.loadTilemaps();
    this.loadSpritesheet([SPRITE.PLAYER], {
      frameWidth: 32,
      frameHeight: 32,
      margin: 1,
      spacing: 2,
    });

    this.showLoadingBar();
  }

  create() {
    Player.CreateAnimations(this);

    this.scene.start(SCENE.PLAY);
    // this.scene.start(SCENE.SCORE);
  }
}
