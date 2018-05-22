var InstantGame = require("InstantGame");

cc.Class({
    extends: require("Popup"),

    properties: {
        
    },

    onLoad : function () {
    },

    initCallBackGame : function (callback) {
        this.callback = callback;
    },

    go : function() {
        var self = this;
        if(InstantGame.getInstance().enable){
            window.showRewardedVideo(function () {
                self.callback();
            });
        }else{
            if(cc.sys.isMobile) {
                sdkbox.PluginAdMob.show('rewarded');
            }
        }
    }
});