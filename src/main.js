import Phaser from 'phaser';
import { LoadScene, PlayScene, ScoreScene } from 'scenes';

new Phaser.Game({ // eslint-disable-line no-new
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
      pixelArt: true,
    },
  },
  scene: [LoadScene, PlayScene, ScoreScene],
});
