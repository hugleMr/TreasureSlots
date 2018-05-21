cc.Class({
    extends: cc.Component,

    properties: {
        item: cc.Sprite,
        atom : cc.ParticleSystem,
        flower : cc.ParticleSystem,
        round : cc.ParticleSystem,
        light: cc.ParticleSystem,
        round_x : cc.ParticleSystem,
        turtle : cc.Node,
        crown : cc.Node,
        list_frame: [cc.SpriteFrame]
    },
    
    init: function (index,callBack) {
        this.index = index;
        this.callBack = callBack;

        this.item.spriteFrame = this.list_frame[index];
        this.light.stopSystem();
        this.atom.stopSystem();
        this.flower.stopSystem();
        this.round.stopSystem();
        this.round_x.stopSystem();

        this.isRunning = true;
        this.deltaTime = 0;
        this.TIME = 2;
    },

    callGame : function () {
        this.callBack;
    },

    rectangleMove: function (index) {
        var count = 1/8;
        var c = index;
        var x = 0,y = 0;
        var r = this.node.width*0.425;
        var l = this.node.width*0.475;

        var angel = (index*360)*Math.PI/180;

        if(c >=0 && c < count){
            x = l*Math.tan(angel);
            y = r;
        }else if(c >= count && c < count*3){
            x = l;
            y = r/Math.tan(angel);
        }else if(c >= count*3 && c < count*5){
            x = -l*Math.tan(angel);
            y = -r;
        }else if(c >= count*5 && c < count*7){
            x = -l;
            y = -r/Math.tan(angel);
        }else if(c >= count*7 && c < count*8){
            x = l*Math.tan(angel);
            y = r;
        }

        //console.log("x/y",x,y);

        this.light.node.setPosition(cc.p(x,y));
    },

    update: function (dt) {
        if(this.isRunning){
            this.deltaTime += dt;
            if(this.deltaTime > this.TIME){
                this.deltaTime = 0;
            }
            this.rectangleMove(this.deltaTime/this.TIME);
        }
    },

    animate: function () {
        /*var scale = cc.scaleTo(0.5,1.1);
        var rotate1 = cc.rotateTo(0.2,-30);
        var rotate2 = cc.rotateTo(0.2,30);
        var rotate3 = cc.rotateTo(0.1,0);
        this.node.runAction(scale);
        this.node.runAction(cc.repeat(cc.sequence(rotate1,rotate2,rotate3),5));*/

        //var animation = this.node.getComponent(cc.Animation);
        //animation.play();

        this.reset();

        switch (this.index){
            case 0:
                this.flower.node.active = true;
                this.flower.resetSystem();
                break;
            case 1:
                this.light.node.active = true;
                this.light.resetSystem();
                this.isRunning = true;
                this.deltaTime = 0;
                break;
            case 2:
                this.light.node.active = true;
                this.light.resetSystem();
                this.isRunning = true;
                this.deltaTime = 0;
                break;
            case 3:
                this.round_x.node.active = true;
                this.round_x.resetSystem();
                break;
            case 4:
                this.light.node.active = true;
                this.light.resetSystem();
                this.isRunning = true;
                this.deltaTime = 0;
                break;
            case 5:
                this.item.node.active = false;
                this.turtle.active = true;
                this.turtle.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
                break;
            case 6:
                this.item.node.active = false;
                this.crown.active = true;
                this.crown.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
                break;
            case 7:
                this.atom.node.active = true;
                this.atom.resetSystem();
                break;
            default:
                this.flower.node.active = true;
                this.flower.resetSystem();
                break;
        }
    },

    reset: function () {
        this.isRunning = false;
        this.node.scale = 1;
        this.node.rotation = 0;

        this.item.node.active = true;

        this.flower.node.active = false;
        this.atom.node.active = false;
        this.round.node.active = false;
        this.light.node.active = false;
        this.round_x.node.active = false;

        this.crown.active = false;
        this.turtle.active = false;

        this.light.stopSystem();
        this.atom.stopSystem();
        this.flower.stopSystem();
        this.round.stopSystem();
        this.round_x.stopSystem();

        //this.node.stopAllActions();
    }
});
