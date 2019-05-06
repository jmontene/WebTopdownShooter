import Phaser from "phaser";

export default class Player extends Phaser.GameObjects.Image{
    constructor(scene, x, y){
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.baseAcceleration = 800;
        this.maxVelocity = 500;

        this.setDisplaySize(132, 120)
        this.body.setCollideWorldBounds(true)
        this.body.setDrag(500,500);

        scene.cameras.main.zoom = 0.5;
        scene.cameras.main.startFollow(this);

        this.health = 10;
        this.ammo = 50;

        this.moving = {
            "up": false,
            "down" : false,
            "left" : false,
            "right" : false
        }
    }

    update(time, delta){
        this.constrainVelocity();
    }

    constrainVelocity(){
        let angle, velSqr, vx, vy;
        vx = this.body.velocity.x;
        vy = this.body.velocity.y;
        velSqr = vx*vx + vy*vy;

        if(velSqr > this.maxVelocity * this.maxVelocity){
            angle = Math.atan2(vy, vx);
            vx = Math.cos(angle) * this.maxVelocity;
            vy = Math.sin(angle) * this.maxVelocity;
            this.body.velocity.x = vx;
            this.body.velocity.y = vy;
        }
    }

    onUpKeyDown(){
        this.body.setAccelerationY(-this.baseAcceleration);
        this.moving.up = true;
        this.moving.down = false;
    }

    onDownKeyDown(){
        this.body.setAccelerationY(this.baseAcceleration);
        this.moving.down = true;
        this.moving.up = false;
    }

    onLeftKeyDown(){
        this.body.setAccelerationX(-this.baseAcceleration);
        this.moving.left = true;
        this.moving.right = false;
    }

    onRightKeyDown(){
        this.body.setAccelerationX(this.baseAcceleration);
        this.moving.right = true;
        this.moving.left = false;
    }

    onUpKeyUp(){
        if(!this.moving.down){
            this.body.setAccelerationY(0);
            this.moving.up = false;
        }
    }

    onDownKeyUp(){
        if(!this.moving.up){
            this.body.setAccelerationY(0);
            this.moving.down = false;
        }
    }

    onLeftKeyUp(){
        if(!this.moving.right){
            this.body.setAccelerationX(0);
            this.moving.left = false;
        }
    }

    onRightKeyUp(){
        if(!this.moving.left){
            this.body.setAccelerationX(0);
            this.moving.right = false;
        }
    }
}