import Phaser from "phaser";
import SceneLoad from "./scenes/scene_load.js";
import SceneGame from "./scenes/scene_game.js";
import SceneGameUI from "./scenes/scene_gameUI.js";

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics:{
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [SceneLoad, SceneGame, SceneGameUI]
};

let game = new Phaser.Game(config);