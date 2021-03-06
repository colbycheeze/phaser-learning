import Phaser from 'phaser';
import { LoadScene, PlayScene, ScoreScene } from 'scenes';

new Phaser.Game({ // eslint-disable-line no-new
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
  scene: [LoadScene, PlayScene, ScoreScene],
});
