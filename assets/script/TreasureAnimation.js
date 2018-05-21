
var InstantGame = require('InstantGame');

cc.Class({
    extends: cc.Component,

    properties: {
        hu_node : cc.Node,
        title_node : cc.Node,
        maskLayer : cc.Node,
        winSprite : cc.Node,
    },

    showTitleAndHideWinMoney: function () {
        this.maskLayer.runAction(cc.fadeOut(0.1));

        this.title_node.active = true;
        this.title_node.opacity = 255;
        this.title_node.scale = 0.2;
        this.title_node.runAction(cc.scaleTo(0.25,1).easing(cc.easeBackOut()));

        this.hu_node.runAction(cc.fadeOut(0.1));
    },

    showWinMoneyAndHideTitle : function () {
        this.maskLayer.runAction(cc.fadeTo(0.25,200));
        this.hu_node.active = true;
        this.hu_node.opacity = 255;
        this.hu_node.scale = 0.2;
        this.hu_node.runAction(cc.scaleTo(0.25,1).easing(cc.easeBackOut()));

        this.title_node.runAction(cc.fadeOut(0.1));
    },

    showWinSprite: function (callback) {
        this.winSprite.scale = 0.2;
        this.winSprite.opacity = 255;
        this.winSprite.runAction(cc.sequence(cc.scaleTo(0.15,1),cc.delayTime(3),
            cc.spawn(cc.fadeOut(0.15),cc.scaleTo(0.2,0.2)),cc.callFunc(function () {

                this.showTitleAndHideWinMoney();
                callback();
        }.bind(this))));
    },

    animMoney : function (obj,oldMoney,money) {
        InstantGame.getInstance().countNumberAnim(obj, oldMoney, money, 0, 1);
    },
});
