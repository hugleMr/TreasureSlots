
var InstantGame = cc.Class({
    ctor: function() {
        this.REWARDED_PLACEMENT_ID = "249365268940500_261710297705997";
        this.INTERSTITIAL_PLACEMENT_ID = "249365268940500_249365412273819";
        this.LEADER_BOARD = "TREASURE_BEST";
        this.LEADER_BOARD_CONTEXT = "TREASURE_BEST_CONTEXT.";

        this.preloadedRewardedVideo = null;
        this.preloadedInterstitial = null;
        this.initBase64();
        this.enableSound = true;
        this.enable = false;
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
        //com.treasure.pack1
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
        var userPhoto = FBInstant.player.getPhoto();

        typeof callback === 'function' && callback({
            name: userName,
            photo : userPhoto
        });
    },

    getUserName : function () {
        if(!this.enable){
            return "";
        }

        return FBInstant.player.getName();
    },

    getUserPhoto : function () {
        if(!this.enable){
            return "";
        }

        return FBInstant.player.getPhoto();
    },

    updateCoin: function (coin) {
        if(!this.enable){
            return;
        }
        this.updateCoinMax();
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
        FBInstant.player.getDataAsync(['coin'])
            .then(function(data){
                if (typeof data['coin'] !== 'undefined') {
                    var coin_value  = data['coin'];
                    if(coin_value <= 0){
                        coin_value = 50000;
                        self.updateCoin(coin_value,function (response) {});
                    }
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

    showInterstitialAd: function(callback) {
        if(!this.enable){
            return;
        }

        var self = this;
        var supportedAPIs = FBInstant.getSupportedAPIs();
        if (supportedAPIs.includes('getInterstitialAdAsync')) {
            if(preloadedInterstitial != null){
                self.preloadedInterstitial.showAsync().
                then(function() {
                    self.loadInterstitialAd();
                }).catch(function(e) {
                    console.error(e.message);
                    typeof callback === 'function' && callback({
                        error : e.message,
                    });

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
                self.loadRewardedVideo();
            }
        }
    },

    checkSupport : function () {
        if(!this.enable){
            return;
        }
        var supportedAPIs = FBInstant.getSupportedAPIs();
        return supportedAPIs.includes('getInterstitialAdAsync');
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

                if(coin_value < 0){
                    self.updateCoin(50000,function (response) {});
                }

                typeof callback === 'function' && callback({
                    coin: coin_value
                });
            }).catch(function(err){
                console.log(' getCoin : ', err.message);
            });
    },

    inviteFriends : function () {
        if(!this.enable){
            return;
        }
        var self = this;

        FBInstant.context
            .chooseAsync()
            .then(function() {
                console.log(FBInstant.context.getID());
                // 1234567890
            });
    },

    updateContext: function (coin) {
        if(!this.enable){
            return;
        }
        var self = this;
        FBInstant.updateAsync({
            action: 'CUSTOM',
            cta: 'Join with me!',
            image: window.base64Img,
            text: {
                default: FBInstant.player.getName() + " win 😍" + coin + " coins 😍 with Treasure SLots",
            },
            template: 'RICH_GAMEPLAY',
            data: { myReplayData: '...' },
            strategy: 'IMMEDIATE',
            notification: 'NO_PUSH',
        }).then(function() {
            console.log('Message was sent successfully');
        });
    },

    countNumberAnim: function(target, startValue, endValue, decimals, duration, chartoption) {
        var options = {
            useEasing: true,
            useGrouping: true,
            separator: ".",
            decimal: ","
        };
        var startTime = null;
        var lastTime = 0;
        var rAF = null;
        var vendors = ["webkit", "moz", "ms", "o"];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame =
                window[vendors[x] + "RequestAnimationFrame"];
            window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"]
        }
        if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
            var currTime = (new Date).getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall)
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id
        };
        if (!window.cancelAnimationFrame) window.cancelAnimationFrame =
            function (id) {
                clearTimeout(id)

            };
        var callback = null;
        var count = function (timestamp) {
            if (!startTime) startTime = timestamp;
            timestamp = timestamp;
            var progress = timestamp - startTime;
            if (options.useEasing)
                if (countDown) frameVal = startVal - easeOutExpo(progress, 0, startVal - endVal, duration);
                else frameVal = easeOutExpo(progress, startVal, endVal - startVal, duration);
            else if (countDown) frameVal = startVal - (startVal - endVal) * (progress / duration);
            else frameVal = startVal + (endVal - startVal) * (progress / duration);
            if (countDown) frameVal = frameVal < endVal ?
                endVal : frameVal;
            else frameVal = frameVal > endVal ? endVal : frameVal;
            frameVal = Math.round(frameVal * dec) / dec;
            printValue(frameVal);
            if (progress < duration) rAF = requestAnimationFrame(count);
            else if (callback) callback()
        };

        var start = function () {
            rAF = requestAnimationFrame(count);
            return false
        };
        var formatNumber = function (nStr) {
            nStr = nStr.toFixed(decimals);
            nStr += "";
            var x1;
            var x = nStr.split(".");
            x1 = x[0];
            var x2 = x.length > 1 ? options.decimal + x[1] : "";
            var rgx = /(\d+)(\d{3})/;
            if (options.useGrouping)
                while (rgx.test(x1)) x1 = x1.replace(rgx, "$1" + options.separator + "$2");
            return options.prefix + x1 + x2 + options.suffix
        };
        var FormatNumberNotFixed = function (pSStringNumber) {
            pSStringNumber += "";
            var x = pSStringNumber.split(",");
            var x1 = x[0];
            var x2 = x.length > 1 ? "," + x[1] : "";
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) x1 = x1.replace(rgx, "$1" + "." + "$2");
            return x1 + x2
        }

        for (var key in options)
            if (options.hasOwnProperty(key)) options[key] = options[key];
        if (options.separator === "") options.useGrouping = false;
        if (!options.prefix) options.prefix = "";
        if (!options.suffix) options.suffix = "";
        var startVal = Number(startValue);
        var endVal = Number(endValue);
        var countDown = startVal > endVal;
        var frameVal = startVal;
        var decimals = Math.max(0, decimals || 0);
        var dec = Math.pow(10, decimals);
        var duration = Number(duration) * 1E3 || 2E3;

        var printValue = function (value) {
            var result = !isNaN(value) ? formatNumber(value) : "0";
            if (chartoption != null && chartoption != '') {
                target.string = chartoption + FormatNumberNotFixed(result);
            } else {
                target.string = FormatNumberNotFixed(result);
            }

        };
        var easeOutExpo = function (t, b, c, d) {
            return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b
        };

        start();
    },

    initBase64 : function () {
        if(!this.enable){
            return;
        }
        this.avatarBase64 = "";
    }

});
