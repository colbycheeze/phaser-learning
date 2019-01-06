export default class MouseTileMarker {
  map

  scene

  graphics

  constructor(scene, map) {
    this.map = map;
    this.scene = scene;
    this.graphics = scene.add.graphics();
    const { graphics } = this;
    graphics.lineStyle(5, 0xffffff, 1);
    graphics.strokeRect(0, 0, map.tileWidth, map.tileHeight);
    graphics.lineStyle(3, 0xff4f78, 1);
    graphics.strokeRect(0, 0, map.tileWidth, map.tileHeight);
  }

  handleInput() {
    const { cameras, groundLayer, input } = this.scene;

    const pointer = input.activePointer;
    const worldPoint = pointer.positionToCamera(cameras.main);
    if (pointer.isDown) {
      const tile = groundLayer.putTileAtWorldXY(6, worldPoint.x, worldPoint.y);
      tile.setCollision(true);
    }
  }

  update() {
    const pointer = this.scene.input.activePointer;
    const worldPoint = pointer.positionToCamera(this.scene.cameras.main);
    const pointerTileXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
    const snappedWorldPoint = this.map.tileToWorldXY(pointerTileXY.x, pointerTileXY.y);
    this.graphics.setPosition(snappedWorldPoint.x, snappedWorldPoint.y);

    this.handleInput();
  }

  destroy() {
    this.graphics.destroy();
  }
}
