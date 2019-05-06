import Phaser from "phaser";

export default class Bullet extends Phaser.GameObjects.Image{
    constructor(scene, x, y, key, frame){
        super(scene, -100, -100, key);
        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.timeToDie = 1800;
    }

    fire(shooter, target){
        this.setPosition(shooter.x, shooter.y);
        this.setDisplaySize(20, 20);
        this.direction = Math.atan((target.x-this.x) / (target.y-this.y));

        if(target.y >= this.y){
            this.xSpeed = this.speed*Math.sin(this.direction);
            this.ySpeed = this.speed*Math.cos(this.direction);
        }else{
            this.xSpeed = -this.speed*Math.sin(this.direction);
            this.ySpeed = -this.speed*Math.cos(this.direction);
        }

        this.rotation = shooter.rotation;
        this.born = 0;
    }

    update(time, delta){
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if(this.born > this.timeToDie){
            this.setActive(false);
            this.setVisible(false);
        }
    }
}