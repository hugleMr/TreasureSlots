var InstantGame = require('InstantGame');
var COUNT = 20;

cc.Class({
    extends: cc.Component,

    properties: {
        bg_dark : cc.Node,
        background : cc.Sprite,
        rankItem : cc.Prefab,
        scrollView : cc.ScrollView,
    },

    setNamePopup: function (name) {
        this.name = name;
    },

    appear: function (callBack) {
        callBack();
    },

    disappear: function () {
        var self = this;
        var callDisappear = cc.callFunc(function(){
            var scene = cc.director.getScene();
            if(cc.isValid(scene) && cc.isValid(scene.getChildByName(self.name))){
                scene.getChildByName(self.name).destroy();
            }
        },this);

        var height = cc.director.getWinSize().height;
        var action = cc.moveTo(0.25,cc.p(0,-height)).easing(cc.easeBackIn());
        this.scrollView.node.runAction(cc.sequence(action,callDisappear));
    },

    onLoad: function () {

        function onTouchDown (event) {
            return true;
        }

        this.node.on('touchstart', onTouchDown, this.bg_dark);

        var background = this.background;
        var self = this;

        function onTouchDown (touch,event) {

            var locationInNode = background.node.convertToNodeSpace(touch.getLocation());

            var rect = background.spriteFrame.getRect();

            if (!cc.rectContainsPoint(rect,locationInNode)){
                self.disappear();
                return true;
            }
            return false;
        }

        this.node.on('touchstart', onTouchDown, background);

        this.content = this.scrollView.content;
        this.list_items = [];
        var contentHeight = 0;
        var height = cc.director.getWinSize().height;
        for(var i = 0; i < COUNT + 1; i++){
            var item = cc.instantiate(this.rankItem);
            var item_comp = item.getComponent("RankItem");
            item_comp.init(i,i,null,null,0);
            const size = item_comp.node.getContentSize();
            item.setPosition(cc.p(0,-height/3 - size.height*1.1*i));
            this.content.addChild(item);

            this.list_items.push(item_comp);

            contentHeight += item_comp.node.getContentSize().height*1.1;
        }

        this.content.setContentSize(this.content.getContentSize().width,contentHeight + height/3);

        this.init();
    },

    getUserRankX : function () {
        var self = this;
        var photo = InstantGame.getInstance().getUserPhoto();
        var name = "You";

        InstantGame.getInstance().getUserRank(function (response) {
            self.list_items[0].init(0,
                response.rank,
                photo,
                name,
                response.score);
        });

        InstantGame.getInstance().getAllUserRank(COUNT,function (response) {
            var list_user = response.result;
            var count = list_user.length > COUNT ? COUNT : list_user.length;
            for(var i = 0; i < count; i++){
                if(list_user[i].length >= 4){
                    self.list_items[i + 1].init(i + 1,
                        list_user[i][0],
                        list_user[i][1],
                        list_user[i][2],
                        list_user[i][3]);
                }
            }
        });
    },

    init: function () {
        var self = this;

        var height = cc.director.getWinSize().height;
        this.scrollView.node.height = height;
        this.scrollView.node.getChildByName("view").height = height;
        //this.background.node.height = 2*height/3;

        this.scrollView.node.setPositionY(-height);

        this.appear(function () {
            var action = cc.moveTo(0.5,cc.p(0,0)).easing(cc.easeSineOut());
            self.scrollView.node.runAction(action);
            self.getUserRankX();
        });
    }
});
