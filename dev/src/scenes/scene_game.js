import Phaser from "phaser";
import Player from "Actors/player.js";
import Bullet from "Actors/bullet.js";
import Enemy from "Actors/enemy.js";

export default class SceneGame extends Phaser.Scene{
    constructor(){
        super({
            "key": "Game",
            "mapAdd" : {
                "game": "game"
            }
        });
    }

    init(){
        this.moveKeys;
        this.player;
        this.reticle;

        this.playerBullets;
        this.ammoPacks;
        this.numPacks = 0;
        this.maxPacks = 3;
        this.ammoPackSpawnRate = 20000;
        this.ammoPack

        this.ammoText;

        this.mapWidth = 2000;
        this.mapHeight = 2000;
        this.spawnX = [0, this.mapWidth];
        this.spawnY = [0, this.mapHeight];

        this.spawnPoints = [
            {x: 0, y: 0},
            {x: this.mapWidth, y: 0},
            {x: 0, y: this.mapHeight},
            {x: this.mapWidth, y: this.mapHeight}
        ];

        this.waveStats = {
            speed: {
                initialValue: 0.1,
                value: 0.1,
                change: 0.1,
                min: 0.1,
                max: 1
            },
            health: {
                initialValue: 2,
                value: 2,
                change: 2,
                min: 2,
                max: 20
            },
            rate:{
                initialValue: 3000,
                value: 3000,
                change: -500,
                max: 3000,
                min: 500
            }
        }

        this.waveUpgradeThreshold = 10;
        this.waveCounter = 0;
        this.spawnRate = 5000;
        this.enemiesKilled = 0;
        this.enemiesOnScreen = 0;
        this.maxEnemies = 5;
    }

    create(){
        var background = this.add.image(0, 0, 'bg');
        background.setOrigin(0,0);
        background.setDisplaySize(this.mapWidth,this.mapHeight);

        this.physics.world.setBounds(0,0,this.mapWidth,this.mapHeight);

        this.playerBullets = this.physics.add.group({classType: Bullet, defaultKey: "enemy_bullet", runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({classType: Bullet, defaultKey: "player_bullet", runChildUpdate: true});
        this.ammoPacks = this.physics.add.group({defaultKey: "ammoPack"});

        this.player = new Player(this, 800, 600);
        this.enemyPool = this.physics.add.group({classType: Enemy, runChildUpdate: true });

        this.physics.add.overlap(this.ammoPacks, this.player, this.ammoPackGetCallback, null, this);
        this.physics.add.overlap(this.enemyBullets, this.player, this.playerBulletHitCallback, null, this);
        this.physics.add.overlap(this.enemyPool, this.playerBullets, this.enemyBulletHitCallback, null, this);

        this.ammoTimer = this.time.addEvent({
            delay: this.ammoPackSpawnRate,
            callback: this.spawnAmmoPack,
            callbackScope: this,
            loop: true
        });
        this.enemyTimer = this.time.addEvent({
            delay: this.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        this.reticle = this.physics.add.sprite(800, 700, "reticle");
        this.reticle.setDisplaySize(25,25).setCollideWorldBounds(true);
        
        this.setEvents();

        this.scene.launch("GameUI");

        this.spawnEnemy();
    }

    update(time, delta){
        this.player.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.reticle.x, this.reticle.y);
        this.reticle.body.velocity.x = this.player.body.velocity.x;
        this.reticle.body.velocity.y = this.player.body.velocity.y;

        if(this.player.active) this.player.update(time, delta);
        this.constrainReticle();
    }

    spawnEnemy(){
        if(this.enemiesOnScreen == this.maxEnemies) return;
        let enemy = this.enemyPool.get().setActive(true).setVisible(true);
        enemy.player = this.player;
        enemy.bulletPool = this.enemyBullets;

        let spawnPoint = this.spawnPoints[Phaser.Math.Between(0, this.spawnPoints.length-1)];

        enemy.x = spawnPoint.x;
        enemy.y = spawnPoint.y;
        enemy.speed = this.waveStats.speed.value;
        enemy.health = this.waveStats.health.value;
        enemy.fireRate = this.waveStats.rate.value;

        this.enemiesOnScreen++;
    }

    constrainReticle(){
        let distX = this.reticle.x-this.player.x;
        let distY = this.reticle.y-this.player.y;
        let w = this.cameras.main.width;
        let h = this.cameras.main.height;

        if(distX > w){
            this.reticle.x = this.player.x + w;
        }else if(distX < -w){
            this.reticle.x = this.player.x - w;
        }

        if(distY > h){
            this.reticle.y = this.player.y + h;
        }else if(distY < -h){
            this.reticle.y = this.player.y - h;
        }
    }

    ammoPackGetCallback(player, ammoPack){
        if(player.active && ammoPack.active){
            player.ammo = 50;
            ammoPack.setActive(false).setVisible(false);
            this.numPacks--;
            this.updateUI();
        }
    }

    playerBulletHitCallback(player, bullet){
        if(player.active && bullet.active){
            bullet.setActive(false).setVisible(false);
            player.health--;
            this.updateUI();

            if(player.health == 0){
                player.body.stop();
                player.setActive(false).setVisible(false);
                this.events.emit("gameOver");
            }
        }
    }

    enemyBulletHitCallback(enemy, bullet){
        if(enemy.active && bullet.active){
            bullet.setActive(false).setVisible(false);
            enemy.health--;

            if(enemy.health == 0){
                enemy.setActive(false).setVisible(false);
                this.enemiesKilled++;
                this.waveCounter++;
                if(this.waveCounter == this.waveUpgradeThreshold){
                    this.waveCounter = 0;
                    for(let stat of Object.values(this.waveStats)){
                        stat.value = Phaser.Math.Clamp(stat.value + stat.change, stat.min, stat.max);
                    }
                }
                this.updateUI();
                this.enemiesOnScreen--;
            }
        }
    }

    spawnAmmoPack(){
        if(this.numPacks >= this.maxPacks) return;

        let ammoPack = this.ammoPacks.get().setActive(true).setVisible(true);
        ammoPack.setDisplaySize(100,100);
        ammoPack.x = Phaser.Math.Between(0, this.mapWidth);
        ammoPack.y = Phaser.Math.Between(0, this.mapHeight);
        ammoPack.body.velocity.x = 0;
        ammoPack.body.velocity.y = 0;
        ammoPack.body.setAccelerationX(0);
        ammoPack.body.setAccelerationY(0);
        this.numPacks++;
    }

    playerKeyListener(func){
        if(this.player.active){
            func.call(this.player);
        }
    }

    setEvents(){
        this.moveKeys = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        });

        this.moveKeys['up'].on('down', function(event){
            this.playerKeyListener(this.player.onUpKeyDown);
        }, this);

        this.moveKeys['up'].on('up', function(event){
            this.playerKeyListener(this.player.onUpKeyUp);
        }, this);

        this.moveKeys['down'].on('down', function(event){
            this.playerKeyListener(this.player.onDownKeyDown);
        }, this);

        this.moveKeys['down'].on('up', function(event){
            this.playerKeyListener(this.player.onDownKeyUp);
        }, this);

        this.moveKeys['left'].on('down', function(event){
            this.playerKeyListener(this.player.onLeftKeyDown);
        }, this);

        this.moveKeys['left'].on('up', function(event){
            this.playerKeyListener(this.player.onLeftKeyUp);
        }, this);

        this.moveKeys['right'].on('down', function(event){
            this.playerKeyListener(this.player.onRightKeyDown);
        }, this);

        this.moveKeys['right'].on('up', function(event){
            this.playerKeyListener(this.player.onRightKeyUp);
        }, this);

        this.input.on('pointermove', function(pointer){
            if(this.input.mouse.locked){
                this.reticle.x += pointer.movementX;
                this.reticle.y += pointer.movementY;
            }
        },this);

        this.input.on("pointerdown", function(pointer){
            if(!this.input.mouse.locked){
                this.game.input.mouse.requestPointerLock();
                return;
            }
            this.playerFire();
        }, this);
    }

    playerFire(){
        if(!this.player.active) return;

        let bullet = this.playerBullets.get().setActive(true).setVisible(true);
        if(bullet && this.player.ammo > 0){
            this.player.ammo--;
            bullet.fire(this.player, this.reticle);
            this.updateUI();
        }
    }

    updateUI(){
        this.events.emit('updateUI', {
            ammo: this.player.ammo,
            health: this.player.health,
            score: this.enemiesKilled
        });
    }
}