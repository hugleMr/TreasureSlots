
var InstantGame = cc.Class({
    extends: cc.Component,

    ctor: function() {
        this.REWARDED_PLACEMENT_ID = "249365268940500_261710297705997";
        this.INTERSTITIAL_PLACEMENT_ID = "249365268940500_249365412273819";
        this.LEADER_BOARD = "BEST_COINS";

        this.preloadedRewardedVideo = null;
        this.preloadedInterstitial = null;
        this.initBase64();
        this.enable = true;
    },

    properties: {

    },

    statics: {
        _instance: null,
        getInstance: function() {
            if(this._instance === null) {
                this._instance = new InstantGame();
            }
            return this._instance;
        }
    },

    payIAP : function (callback) {
        if(!this.enable){
            return;
        }
        var self = this;
        FBInstant.payments.onReady(function () {
            FBInstant.payments.getCatalogAsync().then(function (catalog) {
                typeof callback === 'function' && callback({
                    catalog: catalog
                });
            });
        });
    },

    getInfor : function (callback) {
        if(!this.enable){
            return;
        }
        var userName = FBInstant.player.getName();
        typeof callback === 'function' && callback({
            name: userName
        });
    },

    updateCoin: function (coin) {
        if(!this.enable){
            return;
        }
        FBInstant.player.setDataAsync({
            'coin':coin
        })
            .then(FBInstant.player.flushDataAsync)
            .then(function() {
                console.log('Data persisted to FB!');
            });
    },

    getCoin: function (callback) {
        if(!this.enable){
            return;
        }
        var self = this;
        FBInstant.player.getDataAsync(['coin'])
            .then(function(data){
                if (typeof data['coin'] !== 'undefined') {
                    var coin_value  = data['coin'];
                    typeof callback === 'function' && callback({
                        coin: coin_value
                    });
                }else{
                    var coin_value = 50000;
                    typeof callback === 'function' && callback({
                        coin: coin_value
                    });
                    self.updateCoin(coin_value);
                }
            });
    },

    loadInterstitialAd: function() {
        if(!this.enable){
            return;
        }
        var self = this;
        var supportedAPIs = FBInstant.getSupportedAPIs();
        if (supportedAPIs.includes('getInterstitialAdAsync')) {

            FBInstant.getInterstitialAdAsync(
                self.INTERSTITIAL_PLACEMENT_ID,
            ).then(function (interstitial) {
                self.preloadedInterstitial = interstitial;
                return self.preloadedInterstitial.loadAsync();
            }).then(function () {
                console.log('Interstitial success to preload');
            }).catch(function (err) {
                console.log('Interstitial failed to preload: ', err.message);
                self.preloadedInterstitial = null;
            });
        }else{
            console.log("Interstitial is not support");
        }
    },

    loadRewardedVideo: function() {
        if(!this.enable){
            return;
        }
        var self = this;
        var supportedAPIs = FBInstant.getSupportedAPIs();
        if (supportedAPIs.includes('getRewardedVideoAsync')){
            FBInstant.getRewardedVideoAsync(
                self.REWARDED_PLACEMENT_ID,
            ).then(function(rewarded) {
                self.preloadedRewardedVideo = rewarded;
                return self.preloadedRewardedVideo.loadAsync();
            }).then(function() {
                console.log("preloadedRewardedVideo preloaded");
            }).catch(function(err){
                console.log('preloadedRewardedVideo failed to preload: ', err.message);
                self.preloadedRewardedVideo = null;
            });
        }else{
            console.log("Interstitial is not support");
        }
    },

    showInterstitialAd: function() {
        if(!this.enable){
            return;
        }
        var self = this;
        var supportedAPIs = FBInstant.getSupportedAPIs();
        if (supportedAPIs.includes('getInterstitialAdAsync')) {
            if(preloadedInterstitial != null){
                self.preloadedInterstitial.showAsync(
                ).then(function() {
                    self.loadInterstitialAd();
                }).catch(function(e) {
                    console.error(e.message);
                    self.preloadedInterstitial = null;
                });
            }else{
                self.loadInterstitialAd();
            }
        }
    },

    showRewardedVideo: function(callback) {
        if(!this.enable){
            return;
        }
        var self = this;
        var supportedAPIs = FBInstant.getSupportedAPIs();
        if (supportedAPIs.includes('getRewardedVideoAsync')){
            if(self.preloadedRewardedVideo != null){
                self.preloadedRewardedVideo.showAsync()
                    .then(function() {

                        typeof callback === 'function' && callback();

                        self.loadRewardedVideo();
                    }).catch(function(e) {
                        console.error(e.message);
                        self.preloadedRewardedVideo = null;
                    });
            }else{
                self.loadInterstitialAd();
            }
        }
    },

    updateCoinMax : function (score,callback) {
        if(!this.enable){
            return;
        }
        var self = this;
        FBInstant.getLeaderboardAsync(self.LEADER_BOARD)
            .then(function(leaderboard) {
                return leaderboard.setScoreAsync(score);
            })
            .then(function(entry) {
                var coin_value = entry ? entry.getScore() : 5;
                console.log("score : ",coin_value);
                typeof callback === 'function' && callback({
                    coin: coin_value
                });

            }).catch(function(err){
            console.log(' upload error : ', err.message);
        });
    },

    getCoinMax: function (callback) {
        if(!this.enable){
            return;
        }
        var self = this;
        FBInstant.getLeaderboardAsync(self.LEADER_BOARD)
            .then(function(leaderboard) {
                return leaderboard.getPlayerEntryAsync();
            })
            .then(function(entry) {
                var coin_value = 5;
                if(entry){
                    coin_value = entry.getScore();
                }else{
                    self.updateCoin(coin_value,function (response) {});
                }

                typeof callback === 'function' && callback({
                    coin: coin_value
                });
            }).catch(function(err){
                console.log(' getCoin : ', err.message);
            });
    },

    updateContext: function (coin) {
        if(!this.enable){
            return;
        }
        var self = this;
        FBInstant.updateAsync({
            action: 'CUSTOM',
            cta: 'Beat Me!',
            image: self.avatarBase64,
            text: {
                default: getName() + " win " + coin + " coins!",
            },
            template: 'RICH_GAMEPLAY',
            data: { myReplayData: '...' },
            strategy: 'IMMEDIATE',
            notification: 'NO_PUSH',
        }).then(function() {
            console.log('Message was sent successfully');
        });
    },

    initBase64 : function () {
        if(!this.enable){
            return;
        }
        this.avatarBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAHgAA/+EDL2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMzU0OTI2MjI1NjYxMUU4QjQ1MkZCOTRENTY4QkJDNyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozMzU0OTI2MTI1NjYxMUU4QjQ1MkZCOTRENTY4QkJDNyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyBNYWNpbnRvc2giPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDNEEyOTE0QTI1NjUxMUU4QjQ1MkZCOTRENTY4QkJDNyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDNEEyOTE0QjI1NjUxMUU4QjQ1MkZCOTRENTY4QkJDNyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABALCwsMCxAMDBAXDw0PFxsUEBAUGx8X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";
    }

});
