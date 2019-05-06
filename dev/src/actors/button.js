import Phaser from "phaser";

export default class Button extends Phaser.GameObjects.Container{
    constructor(scene, x, y, key, buttonText, textArgs, buttonArgs){
        super(scene, x, y);
        scene.add.existing(this);

        this.buttonImg = scene.add.image(0,0,key);
        this.buttonImg.setDisplaySize(buttonArgs.width, buttonArgs.height);
        this.add(this.buttonImg);

        this.buttonText = scene.add.text(textArgs.x,textArgs.y,buttonText, textArgs);
        this.buttonText.setOrigin(textArgs.originX, textArgs.originY);
        this.add(this.buttonText);

        this.onClickCallback = {
            callback: null,
            context: null
        };

        this.buttonImg.setInteractive()
        .on('pointerdown', this.onClick, this);
    }

    setClickCallback(callback, context){
        this.onClickCallback.callback = callback;
        this.onClickCallback.context = context;
    }

    onClick(){
        this.onClickCallback.callback.call(this.onClickCallback.context);
    }
}