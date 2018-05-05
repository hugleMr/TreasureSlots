cc.Class({
    extends: cc.Component,

    properties: {
        item: cc.Sprite,
        atom : cc.Node,
        flower : cc.Node,
        round : cc.Node,
        light: cc.ParticleSystem,
        round_x : cc.Node,
        turtle : cc.Node,
        crown : cc.Node,
        list_frame: [cc.SpriteFrame]
    },
    
    init: function (index) {
        this.index = index;
        
        this.item.spriteFrame = this.list_frame[index];
        this.light.stopSystem();
        this.isRunning = true;
        this.deltaTime = 0;
        this.TIME = 2;
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

        switch (this.index){
            case 0:
                this.flower.active = true;
                break;
            case 1:
                this.light.node.active = true;
                this.isRunning = true;
                break;
            case 2:
                this.light.node.active = true;
                this.isRunning = true;
                break;
            case 3:
                this.round_x.active = true;
                break;
            case 4:
                this.light.node.active = true;
                this.isRunning = true;
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
                this.atom.active = true;
                break;
            default:
                this.flower.active = true;
                break;
        }
    },

    reset: function () {
        this.isRunning = false;
        this.flower.active = false;
        this.atom.active = false;
        this.node.scale = 1;
        this.node.rotation = 0;
        this.turtle.active = false;
        this.node.stopAllActions();
    }
});
