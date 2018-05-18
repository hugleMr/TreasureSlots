
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        this.admobInit();
    },

    admobInit: function() {
        if(cc.sys.isMobile) {
            var self = this
            sdkbox.PluginAdMob.setListener({
                adViewDidReceiveAd: function(name) {
                    self.showInfo('adViewDidReceiveAd name=' + name);
                },
                adViewDidFailToReceiveAdWithError: function(name, msg) {
                    self.showInfo('adViewDidFailToReceiveAdWithError name=' + name + ' msg=' + msg);
                },
                adViewWillPresentScreen: function(name) {
                    self.showInfo('adViewWillPresentScreen name=' + name);
                },
                adViewDidDismissScreen: function(name) {
                    self.showInfo('adViewDidDismissScreen name=' + name);
                    if(name == "gameover"){
                        self.cacheInterstitial();
                    }else if(name == "rewarded"){
                        self.cacheRewarded();
                    }
                },
                adViewWillDismissScreen: function(name) {
                    self.showInfo('adViewWillDismissScreen=' + name);
                },
                adViewWillLeaveApplication: function(name) {
                    self.showInfo('adViewWillLeaveApplication=' + name);
                }
            });
            sdkbox.PluginAdMob.init();
        }
    },

    cacheInterstitial: function() {
        if(cc.sys.isMobile) {
            sdkbox.PluginAdMob.cache('gameover');
        }
    },

    cacheRewarded: function() {
        if(cc.sys.isMobile) {
            sdkbox.PluginAdMob.cache('rewarded');
        }
    },

    showInterstitial: function() {
        if(cc.sys.isMobile) {
            sdkbox.PluginAdMob.show('gameover');
        }
    },

    showRewarded: function() {
        if(cc.sys.isMobile) {
            sdkbox.PluginAdMob.show('rewarded');
        }
    },

    showInfo: function (message) {
        console.log(message);
    }



});
