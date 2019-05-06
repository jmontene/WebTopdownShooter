import Phaser from "phaser";

export default class SceneLoad extends Phaser.Scene{
    constructor(){
        super("Load");
    }

    preload(){
        this.load.image("bg", "assets/img/bg.png");
        this.load.image("player", "assets/img/player.png");
        this.load.image("reticle", "assets/img/reticle.png");
        this.load.image("player_bullet", "assets/img/player_bullet.png");
        this.load.image("enemy_bullet", "assets/img/enemy_bullet.png");
        this.load.image("ammoPack", "assets/img/ammoPack.png");
        this.load.image("heart", "assets/img/heart.png");
        this.load.image("overlay", "assets/img/overlay.png");
    }

    create(){
        this.scene.start("Game");
    }
}