import Phaser from "phaser";

export default class Enemy extends Phaser.GameObjects.Image{
    constructor(scene, x, y){
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.vx = 0;
        this.vy = 0;
        this.canFire = true;
        this.scene = scene;

        this.setDisplaySize(132, 120);
        this.body.setCollideWorldBounds(true);

        this.health = 1;
        this.fireRate = 3000;
        this.speed = 0.1;
        this.shootRange = 500;
        this.player;
        this.bulletPool;
    }

    update(time, delta){
        if(!this.player) return;

        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
        let dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
        if(dist <= this.shootRange){
            this.fire();
        }else{
            this.moveTowardsPlayer(delta);
        }
    }

    fire(){
        if(!this.canFire) return;

        let bullet = this.bulletPool.get().setActive(true).setVisible(true);
        if(bullet){
            bullet.fire(this, this.player);
        }

        this.canFire = false;
        this.scene.time.addEvent({
            delay: this.fireRate,
            callback: this.resetFire,
            callbackScope: this
        });
    }

    resetFire(){
        this.canFire = true;
    }

    moveTowardsPlayer(delta){
        let direction = Math.atan((this.player.x-this.x) / (this.player.y-this.y));

        if(this.player.y >= this.y){
            this.vx = this.speed*Math.sin(direction);
            this.vy = this.speed*Math.cos(direction);
        }else{
            this.vx = -this.speed*Math.sin(direction);
            this.vy = -this.speed*Math.cos(direction);
        }

        this.x += this.vx * delta;
        this.y += this.vy * delta;
    }
}