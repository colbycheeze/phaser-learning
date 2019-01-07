import Phaser from 'phaser';
import Dungeon from '@mikewesthad/dungeon';
import {
  SCENE,
  TILESET,
} from 'common/constants';
import DUNGEON from 'common/tile-mapping';
import Player from 'entities/Player';
import TilemapVisibility from 'entities/TilemapVisibility';

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.PLAY });
  }

  startRoom

  dungeon

  player

  map

  level = 0

  groundLayer

  shadowLayer

  stuffLayer

  hasPlayerReachedStairs = false

  tilemapVisibility

  descendStairs = () => {
    const {
      stuffLayer, player, scene, cameras,
    } = this;
    stuffLayer.setTileIndexCallback(DUNGEON.STAIRS, null);
    this.hasPlayerReachedStairs = true;
    player.freeze();
    const cam = cameras.main;
    cam.fade(500, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => {
      player.destroy();
      scene.restart();
    });
  }

  createWorld() {
    this.level += 1;
    this.hasPlayerReachedStairs = false;

    // Generate a random world with a few extra options:
    //  - Rooms should only have odd number dimensions so that they have a center tile.
    //  - Doors should be at least 2 tiles away from corners, so that we can place a corner tile on
    //    either side of the door location
    const dungeon = new Dungeon({
      width: 50,
      height: 50,
      doorPadding: 2,
      rooms: {
        width: { min: 7, max: 15, onlyOdd: true },
        height: { min: 7, max: 15, onlyOdd: true },
      },
    });

    const map = this.make.tilemap({
      tileWidth: 48,
      tileHeight: 48,
      width: dungeon.width,
      height: dungeon.height,
    });


    const tileset = map.addTilesetImage(TILESET.DUNGEON, null, 48, 48, 1, 2);
    const groundLayer = map.createBlankDynamicLayer('Ground', tileset).fill(DUNGEON.BLANK);
    const stuffLayer = map.createBlankDynamicLayer('Stuff', tileset);
    const shadowLayer = map.createBlankDynamicLayer('Shadow', tileset).fill(DUNGEON.BLANK);

    this.tilemapVisibility = new TilemapVisibility(shadowLayer);

    dungeon.rooms.forEach((room) => {
      const {
        x, y, width, height, left, right, top, bottom,
      } = room;

      groundLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, DUNGEON.FLOOR);

      groundLayer.putTileAt(DUNGEON.WALL.TOP_LEFT, left, top);
      groundLayer.putTileAt(DUNGEON.WALL.TOP_RIGHT, right, top);
      groundLayer.putTileAt(DUNGEON.WALL.BOTTOM_RIGHT, right, bottom);
      groundLayer.putTileAt(DUNGEON.WALL.BOTTOM_LEFT, left, bottom);

      groundLayer.weightedRandomize(left + 1, top, width - 2, 1, DUNGEON.WALL.TOP);
      groundLayer.weightedRandomize(left + 1, bottom, width - 2, 1, DUNGEON.WALL.BOTTOM);
      groundLayer.weightedRandomize(left, top + 1, 1, height - 2, DUNGEON.WALL.LEFT);
      groundLayer.weightedRandomize(right, top + 1, 1, height - 2, DUNGEON.WALL.RIGHT);

      // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
      // room's location. Each direction has a different door to tile mapping.
      const doors = room.getDoorLocations(); // → Returns an array of {x, y} objects
      for (let i = 0; i < doors.length; i++) {
        if (doors[i].y === 0) {
          groundLayer.putTilesAt(DUNGEON.DOOR.TOP, x + doors[i].x - 1, y + doors[i].y);
        } else if (doors[i].y === room.height - 1) {
          groundLayer.putTilesAt(DUNGEON.DOOR.BOTTOM, x + doors[i].x - 1, y + doors[i].y);
        } else if (doors[i].x === 0) {
          groundLayer.putTilesAt(DUNGEON.DOOR.LEFT, x + doors[i].x, y + doors[i].y - 1);
        } else if (doors[i].x === room.width - 1) {
          groundLayer.putTilesAt(DUNGEON.DOOR.RIGHT, x + doors[i].x, y + doors[i].y - 1);
        }
      }
    });

    // Separate out the rooms into:
    //  - The starting room (index = 0)
    //  - A random room to be designated as the end room (with stairs and nothing else)
    //  - An array of 90% of the remaining rooms, for placing random stuff (leaving 10% empty)
    const rooms = dungeon.rooms.slice();
    this.startRoom = rooms.shift();
    const endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
    const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(0, rooms.length * 0.9);

    // Place the stairs
    stuffLayer.putTileAt(DUNGEON.STAIRS, endRoom.centerX, endRoom.centerY);

    // Place stuff in the 90% "otherRooms"
    otherRooms.forEach((room) => {
      const rand = Math.random();
      if (rand <= 0.25) {
        // 25% chance of chest
        stuffLayer.putTileAt(DUNGEON.CHEST, room.centerX, room.centerY);
      } else if (rand <= 0.5) {
        // 50% chance of a pot anywhere in the room... except don't block a door!
        const x = Phaser.Math.Between(room.left + 2, room.right - 2);
        const y = Phaser.Math.Between(room.top + 2, room.bottom - 2);
        stuffLayer.weightedRandomize(x, y, 1, 1, DUNGEON.POT);
      } else if (room.height >= 9) { // 25% of either 2 or 4 towers, depending on the room size
        stuffLayer.putTilesAt(DUNGEON.TOWER, room.centerX - 1, room.centerY + 1);
        stuffLayer.putTilesAt(DUNGEON.TOWER, room.centerX + 1, room.centerY + 1);
        stuffLayer.putTilesAt(DUNGEON.TOWER, room.centerX - 1, room.centerY - 2);
        stuffLayer.putTilesAt(DUNGEON.TOWER, room.centerX + 1, room.centerY - 2);
      } else {
        stuffLayer.putTilesAt(DUNGEON.TOWER, room.centerX - 1, room.centerY - 1);
        stuffLayer.putTilesAt(DUNGEON.TOWER, room.centerX + 1, room.centerY - 1);
      }
    });

    groundLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);
    stuffLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);

    stuffLayer.setTileIndexCallback(DUNGEON.STAIRS, this.descendStairs);

    this.dungeon = dungeon;
    this.map = map;
    this.groundLayer = groundLayer;
    this.stuffLayer = stuffLayer;
    this.shadowLayer = shadowLayer;
  }

  createHelpText() {
    this.add.text(16, 16, `Find the stairs. Go deeper.\nCurrent level: ${this.level}`, {
      font: '18px monospace',
      fill: '#000000',
      padding: { x: 20, y: 10 },
      backgroundColor: '#ffffff',
    }).setScrollFactor(0);
  }

  createPlayer() {
    this.player = new Player(this);
  }

  createDebugGraphic() {
    const {
      physics, input, groundLayer, stuffLayer,
    } = this;

    physics.world.createDebugGraphic();
    physics.world.drawDebug = false;

    const graphics = this.add
      .graphics()
      .setAlpha(0.75)
      .setDepth(20);

    input.keyboard.on('keydown_F1', () => {
      physics.world.drawDebug = !physics.world.drawDebug;
      if (!physics.world.drawDebug) {
        physics.world.debugGraphic.clear();
        graphics.clear();
      } else {
        groundLayer.renderDebug(graphics, {
          tileColor: null,
          collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
          faceColor: new Phaser.Display.Color(40, 39, 37, 255),
        });

        stuffLayer.renderDebug(graphics, {
          tileColor: null,
          collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
          faceColor: new Phaser.Display.Color(40, 39, 37, 255),
        });
      }
    });
  }

  createCamera() {
    const { player, map, cameras } = this;
    const camera = cameras.main;
    camera.startFollow(player.sprite);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  create() {
    this.createWorld();
    this.createHelpText();
    this.createPlayer();
    this.createCamera();
    this.createDebugGraphic();
  }

  update() {
    const {
      dungeon, tilemapVisibility, player, hasPlayerReachedStairs, groundLayer,
    } = this;
    if (hasPlayerReachedStairs) return;

    player.update();

    const playerTileX = groundLayer.worldToTileX(player.sprite.x);
    const playerTileY = groundLayer.worldToTileY(player.sprite.y);
    const playerRoom = dungeon.getRoomAt(playerTileX, playerTileY);

    tilemapVisibility.setActiveRoom(playerRoom);
  }
}
