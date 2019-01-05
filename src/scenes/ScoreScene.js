import Phaser from 'phaser';
import {
  SCENE,
} from 'common/constants';

export default class ScoreScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.SCORE });
  }

  score = 0

  createScore() {
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
  }

  updateScore() {
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  resetScore() {
    this.score = 0;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  create() {
    const playScene = this.scene.get(SCENE.PLAY);

    this.createScore();

    playScene.events.on('collectStar', this.updateScore, this);
    playScene.events.on('restartGame', this.resetScore, this);
  }
}
