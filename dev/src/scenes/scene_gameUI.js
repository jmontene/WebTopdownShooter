import Phaser from "phaser";
import Button from "Actors/button.js";

export default class SceneGameUI extends Phaser.Scene{
    constructor(){
        super({
            key: 'GameUI',
            active: false
        });
    }

    init(){
        this.ammoText;
        this.scoreText;

        this.hearts = [];
        this.numHearts = 10;
        this.visibleHearts = 10;
        this.paused = false;
    }

    create(){
        for(let i = 0; i<this.numHearts;++i){
            let heart = this.add.image(10 + i*20, 10, "heart");
            this.hearts.push(heart);
            heart.setDisplaySize(20,20);
        }

        this.ammoText = this.add.text(0, 20, 'Ammo: 50', {
            fontSize: '30px',
            fontStyle: 'bold',
            fill: '#fff'
        });
        this.ammoText.setScrollFactor(0);
        this.scoreText = this.add.text(0, 50, 'Score: 0', {
            fontSize: '30px',
            fontStyle: 'bold',
            fill: '#fff'
        });
        this.scoreText.setScrollFactor(0);

        this.setPauseScreen();
        this.setGameOverScreen();
        this.setEvents();
    }

    setEvents(){
        this.keys = this.input.keyboard.addKeys({
            'pause': Phaser.Input.Keyboard.KeyCodes.P
        });
        this.keys['pause'].on("down", function(event){
            if(this.paused){
                this.resumeGame();
            }else{
                this.pauseGame();
            }
        },this);

        let gameScene = this.scene.get('Game');
        gameScene.events.on('updateUI', function(args){
            this.ammoText.setText("Ammo: " + args.ammo);
            this.scoreText.setText("Score: " + args.score);
            this.visibleHearts = args.health;
            this.updateHearts();
        }, this);
        gameScene.events.on('gameOver', function(args){
            this.onGameOver();
        }, this);
    }

    setPauseScreen(){
        let camera = this.cameras.main;
        let cx = camera.midPoint.x;
        let cy = camera.midPoint.y;

        this.pauseScreenContainer = this.add.container(cx, cy);

        this.overlay = this.add.image(0,0,"overlay");
        this.overlay.alpha = 0.4;
        this.overlay.setDisplaySize(camera.displayWidth, camera.displayHeight);
        this.pauseScreenContainer.add(this.overlay);

        this.pausedText = this.add.text(0, -100, 'PAUSE', {
            fontSize: '50px',
            fontStyle: 'bold',
            fill: '#fff',
        });
        this.pausedText.setOrigin(0.5,0.5);
        this.pauseScreenContainer.add(this.pausedText);

        this.continueButton = new Button(this, 0, -50, "player_bullet", "Continue", {
            fontSize: "30px",
            fontStyle: 'bold',
            fill: "#000",
            x: 0,
            y: 0,
            originX: 0.5,
            originY: 0.5
        },{
            width: 200,
            height: 50,
        });
        this.continueButton.setClickCallback(this.resumeGame, this);
        this.pauseScreenContainer.add(this.continueButton);

        this.restartButton = new Button(this, 0, 0, "player_bullet", "Restart", {
            fontSize: "30px",
            fontStyle: 'bold',
            fill: "#000",
            x: 0,
            y: 0,
            originX: 0.5,
            originY: 0.5
        },{
            width: 200,
            height: 50,
        });
        this.restartButton.setClickCallback(this.restartGame, this);
        this.pauseScreenContainer.add(this.restartButton);

        this.pauseScreenContainer.setActive(false).setVisible(false);
    }

    setGameOverScreen(){
        let camera = this.cameras.main;
        let cx = camera.midPoint.x;
        let cy = camera.midPoint.y;

        this.gameOverScreenContainer = this.add.container(cx, cy);

        this.gOverlay = this.add.image(0,0,"overlay");
        this.gOverlay.alpha = 0.4;
        this.gOverlay.setDisplaySize(camera.displayWidth, camera.displayHeight);
        this.gameOverScreenContainer.add(this.gOverlay);

        this.gameOverText = this.add.text(0, -100, 'GAME OVER', {
            fontSize: '50px',
            fontStyle: 'bold',
            fill: '#fff',
        });
        this.gameOverText.setOrigin(0.5,0.5);
        this.gameOverScreenContainer.add(this.gameOverText);

        this.gameOverRestartButton = new Button(this, 0, -50, "player_bullet", "Restart", {
            fontSize: "30px",
            fontStyle: 'bold',
            fill: "#000",
            x: 0,
            y: 0,
            originX: 0.5,
            originY: 0.5
        },{
            width: 200,
            height: 50,
        });
        this.gameOverRestartButton.setClickCallback(this.restartGame, this);
        this.gameOverScreenContainer.add(this.gameOverRestartButton);

        this.gameOverScreenContainer.setVisible(false).setActive(false);
    }

    updateHearts(){
        for(let i=this.visibleHearts;i<this.numHearts;++i){
            this.hearts[i].setVisible(false);
        }
    }

    onGameOver(){
        this.scene.pause("Game");
        if(this.input.mouse.locked){
            this.input.mouse.releasePointerLock();
        }

        this.paused = true;
        this.gameOverScreenContainer.setActive(true).setVisible(true);
    }

    pauseGame(){
        this.scene.pause("Game");
        this.pauseScreenContainer.setActive(true).setVisible(true);
        this.paused = true;

        if(this.input.mouse.locked){
            this.input.mouse.releasePointerLock();
        }
    }

    resumeGame(){
        this.scene.resume("Game");
        this.pauseScreenContainer.setActive(false).setVisible(false);
        this.paused = false;

        if(!this.input.mouse.locked){
            this.input.mouse.requestPointerLock();
        }
    }

    restartGame(){
        this.paused = false;
        if(!this.input.mouse.locked){
            this.input.mouse.requestPointerLock();
        }
        this.keys["pause"].removeAllListeners();
        this.scene.stop("GameUI");
        this.scene.start("Game");
    }

    resetUI(){
        this.visibleHearts = 10;
    }
}