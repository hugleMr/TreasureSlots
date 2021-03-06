// var BaseScene = require('BaseScene');
// var NetworkManager = require('NetworkManager');

var GameUtils = require('GameUtils');
var InstantGame = require('InstantGame');

cc.Class({
    extends: cc.Component,

    properties: {
        soundWinLines : [cc.AudioClip],
        soundStopSpin : cc.AudioClip,
        soundMusic : cc.AudioClip,
        soundCoinFly : cc.AudioClip,
        board: cc.Node,
        board_view: cc.Mask,
        itemPrefab: cc.Prefab,
        sound_spin : cc.AudioClip,
        btn_select_lines: cc.Prefab,
        btn_spin : cc.Node,
        btn_sound : cc.Node,
        sound_frames : [cc.SpriteFrame],
        btn_spin_frames : [cc.SpriteFrame],
        line_result: cc.Prefab,
        board_null_line: cc.Node,
        txt_jar_money: cc.Label,
        txt_bet_money: cc.Label,
        txt_total_line: cc.Label,
        txt_win_money: cc.Label,
        txt_total_bet_money: cc.Label,
        bets_select : [cc.Label],
        btn_reward : cc.Node,
        popup_bet_select : cc.Node,
        txt_user_money: cc.Label,
        money_display : cc.Label,
        coin : cc.Prefab,
        mask : cc.Mask,
        board_hide : cc.Node,
        bg_money_win : cc.Node,
        bg_money : cc.Node,
        isRequestJar : false,

    },

    onLoad: function() {
        cc.director.setDisplayStats (false);

        this.init();
        this.initCoinPool();
        this.initItemPool();
        this.initValue();
        this.initMenu();
        this.initFirstItem();
        var self = this;
        this.coin = 0;
        this.oldCoin = 0;
        this.oldWinCoin = 0;
        this.win_coin = 0;
        this.userName = "";
        this.userPhoto = "";

        this.btn_reward.active = InstantGame.getInstance().checkSupport();

        InstantGame.getInstance().getInfor(function (response) {
            console.log("NAME : ",response.name);
            console.log("PHOTO : ",response.photo);

            self.userName = response.name;
            self.userPhoto = self.userPhoto;

        });

        InstantGame.getInstance().getCoin(function (response) {
            self.coin = response.coin;
            self.updateMoney(0);
            self.animMoney(self.txt_user_money,0,self.coin);
        });

        // this.coin = 50000;
        // this.updateMoney(0);
        this.playMusic(this.soundMusic);

        this.enableSound = true;
    },

    animMoney : function (obj,oldMoney,money) {
        console.log("money : ",oldMoney);
        InstantGame.getInstance().countNumberAnim(obj, oldMoney, money, 0, 1);
    },

    init: function () {
        this.list_item = [];
        this.list_recent_values = [];
        this.lst_number = [6,2,8,5,1,4,10,7,3,9,16,12,19,14,13,17,18,15,11,20];
        this.lst_line_result = [];
        this.lst_line_selected = [];
        this.lst_line_selected_sprite = [];
        this.list_win = [];
        this.list_money = [];

        this.turnCashValue = [];
        this.indexCash = 0;
        this.moneyBet = 0;

        this.stepMove = 21;
        this.number = 5;
        this.betType = 0;

        this.countInterstitial = 0;

        this.is_bet_select = false;

        this.isComplete = false;
        this.isRunning = false;
        this.countAnimate = 0;
        this.deltaTime = 0;
    },

    initValue: function () {
        for(var i = 0; i < this.bets_select.length; i++){
            var cash_value = 0;
            if(i == 0){
                cash_value = Config.MONEYS.MONEY_1;
            }else if(i == 1){
                cash_value = Config.MONEYS.MONEY_2;
            }else if(i == 2){
                cash_value = Config.MONEYS.MONEY_3;
            }
            this.turnCashValue.push(cash_value);

            var money = this.convertIntToMoneyView(cash_value);
            if(i == 0){
                this.txt_bet_money.string = money;
                this.txt_total_bet_money.string = this.numberFormatWithCommas(cash_value * this.lst_number.length);
            }
            this.bets_select[i].string = money;
        }
    },

    initCoinPool: function () {
        this.coins_anim = [];
        for(var i = 0; i < 15; i++){
            var coin = cc.instantiate(this.coin);
            coin.active = false;
            this.board.parent.addChild(coin);

            this.coins_anim.push(coin);
        }
    },

    initItemPool: function () {
        this.itemPool = new cc.NodePool();
        for (var i = 0; i < 20; ++i) {
            var item = cc.instantiate(this.itemPrefab); // create node instance
            this.itemPool.put(item); // populate your pool with putInPool method
        }
    },

    getItem: function (index) {
        var item = null;
        if(this.itemPool.size() > 0){
            item = this.itemPool.get();
        }else{
            item = cc.instantiate(this.itemPrefab);
        }
        item.getComponent("ItemPrefab").init(index,function () {
        });

        return item;
    },

    initMenu: function () {
        this.lst_line_selected = this.lst_number;

        for (var i = 0; i < 20; i++){
            var line_result = cc.instantiate(this.line_result);
            var component = line_result.getComponent("LineResult");
            component.init(i);
            component.show(false);

            this.board_null_line.addChild(line_result,5);

            this.lst_line_result.push(line_result);
        }

        var pos_line_top = 0;
        var size_board = this.board_null_line.getContentSize();

        for (var i = 0; i < 20; i++) {
            var line_number = cc.instantiate(this.btn_select_lines);
            var component = line_number.getComponent("ButtonSelectLines");
            component.initNumber(this.lst_number[i]);
            //component.initHighLight(true);

            var size_line = line_number.getContentSize();
            if (i == 0) {
                pos_line_top = size_line.height * 5*0.93 + size_line.height/2;
            }

            line_number.setPosition(cc.p((parseInt(i / 10) == 0) ?
                        (-size_board.width/2 + size_line.width/2) :
                        (size_board.width/2 - size_line.width/2),
                pos_line_top - size_line.height * ((i % 10) * 0.93 + 1)));
            this.board_null_line.addChild(line_number,5);

            this.lst_line_selected_sprite.push(component);
        }

        this.setLineSelected();
    },

    showCoinAnimation : function () {
        var rand = (Math.random() > 0.5) ? -500 : 500;
        for(var i = 0; i < 15; i++){
            var coin = this.coins_anim[i];
            coin.stopAllActions();
            coin.active = true;
            const start = cc.p(0,-this.board.height/2);
            const end =  cc.p(0,this.board.height/2 + 50);
            const mid = cc.p(start.x + rand,(end.y - start.y)*0.5 * (Math.random()*0.5 - Math.random()*0.2));
            const bezier = [start,mid, end];
            const move1 = cc.bezierTo(Math.random() + 0.5, bezier);

            coin.setPosition(start);
            coin.runAction(cc.sequence(move1,cc.callFunc(function () {
                this.active = false;
            },coin)));
        }
    },

    initFirstItem: function() {
        for(var i = 0; i < this.stepMove; i++){
            for(var j = 0; j < this.number; j++){
                var r = Math.floor(Math.random() * 7) + 98;
                this.list_recent_values.push(r);
                var item = this.getItem(r - 98);
                var posX = (j - 2) * item.getContentSize().width*1.025;
                var posY = (i - 1) * item.getContentSize().height*1.02;
                item.setPositionY(posY);
                item.setPositionX(posX);

                this.list_item.push(item);
                this.board_null_line.addChild(item);
            }
        }

        this.board_hide.setLocalZOrder(2);

        console.log("list_recent_values : ",this.list_recent_values);
    },

    update: function(dt) {
        if(this.isComplete){
            this.deltaTime -= dt;
            if(this.deltaTime < 0){
                this.deltaTime = 3;
                if(this.countAnimate > this.list_win.length - 1){
                    this.isComplete = false;
                    this.isRunning = false;
                    this.deltaTime = 0;
                    this.countAnimate = 0;

                    this.oldWinCoin = this.win_coin;
                    this.win_coin = 0;
                    this.updateWinMoney();
                    this.playSound(this.soundCoinFly);
                    this.showCoinAnimation();
                    var old_money = parseInt(this.txt_user_money.string);
                    InstantGame.getInstance().countNumberAnim(this.txt_user_money, old_money, this.coin, 0, 1);

                    if(this.countInterstitial >= 4){
                        this.countInterstitial = 0;
                        if(InstantGame.getInstance().enable){
                            window.showInterstitialAd(function (response) {

                            }.bind(this));
                        }
                    }

                    return;
                }
                this.handleListWin(this.list_win,this.countAnimate,this.list_money[this.countAnimate]);

                this.countAnimate += 1;
            }
        }
    },

    handleListWin : function (listWin,index,money) {
        if(listWin.length == 0){
            return;
        }

        const sound_random = Math.floor(Math.random()*5);
        this.playSound(this.soundWinLines[sound_random]);

        //this.oldCoin += money;
        //this.updateMoneyView(this.oldCoin);

        this.oldWinCoin = this.win_coin;
        this.win_coin += money;
        this.updateWinMoney();

        const winABC= GameUtils.getInstance().getWinABC();
        //const delay = index_x*2;
        const win = winABC[listWin[index] - 1];

        var line = this.lst_line_result[listWin[index] - 1];
        line.getComponent("LineResult").show(true);
        line.getComponent("LineResult").animate();

        for(var j = 0; j < win.length; j++){
            if(win[j] < 5){
                win[j] += 10;
            }else if(win[j] > 9){
                win[j] -= 10;
            }

            const count = this.list_item.length - 4*this.number;

            const k = j;
            console.log("?>>>>>",k);
            const item = this.list_item[win[k] + count].getComponent("ItemPrefab");

            const p  = cc.callFunc(function (){
                item.animate();
                item.node.setLocalZOrder(3);
            }.bind(this));

            const pn  = cc.callFunc(function (){
                item.reset();
                item.node.setLocalZOrder(1);
            }.bind(this));

            if(index === listWin.length - 1 && j === win.length - 1){
                console.log("?>>>>>");
                const final = cc.callFunc(function () {
                    this.board_hide.active = false;
                }.bind(this));

                item.node.runAction(cc.sequence(p,cc.delayTime(2.9),pn,final));
            }else{
                item.node.runAction(cc.sequence(p,cc.delayTime(2.9),pn));
            }
        }
    },

    setSoundVolume : function (soundID,volume) {
        if(this.enableSound){
            cc.audioEngine.setVolume(soundID,volume);
        }
    },

    playSound : function (soundID) {
        if(this.enableSound){
            cc.audioEngine.play(soundID,false,1);
        }
    },

    playMusic : function (soundID) {
        if(this.enableSound){
            cc.audioEngine.play(soundID,true,1);
        }
    },

    stopMusic : function (soundID) {
        cc.audioEngine.stop(soundID);
    },

    implementSpinTreasure: function (textEmotionId, listItem, listWin, listMoney) {

        this.isRunning = true;
        this.updateButtonSpin();
        this.board_hide.active = false;
        this.setSoundVolume(this.soundBackground,1);

        this.isComplete = false
        this.oldWinCoin = this.win_coin;
        this.win_coin = 0;
        this.updateWinMoney();

        var displayChangeMoney = 0;
        for(var i = 0; i < listMoney.length; i++) {
            displayChangeMoney = displayChangeMoney + listMoney[i];
        }
        cc.log("display change money:", displayChangeMoney);
        //TODO: displayChangeMoney: so tien thang
        this.resetLineResult();
        console.log("listWin : xxx ",listWin);
        if(listItem.length == 0){
            return;
        }

        // console.log("listItem",listItem);

        var list_recent_values = this.list_recent_values;
        // console.log("list_recent_values : ",list_recent_values);

        var index_item = 4;
        //this.txt_user_money.string = this.prevMoney;//this.numberFormatWithCommas(this.prevMoney);

        this.playSound(this.sound_spin);

        for(var i = 0; i < this.list_item.length; i++){
            this.list_item[i].getComponent("ItemPrefab").reset();
            this.list_item[i].getComponent("ItemPrefab").node.setLocalZOrder(1);

            var x = parseInt(i/this.number);
            var y = parseInt(i%this.number);

            var value = 0;
            if(i < 3*this.number){
                value = list_recent_values[i] - 98;
                this.list_recent_values[i] = listItem[i];

            }else if(i >= this.list_item.length - index_item*this.number && i < this.list_item.length - 1){

                var index_x = i - this.list_item.length + index_item*this.number;
                if(index_x < 5){
                    index_x += 10;
                }else if(index_x > 9){
                    index_x -= 10;
                }
                value = list_recent_values[index_x] - 98;
            }else{
                value = Math.floor(Math.random() * 7);
            }

            this.list_item[i].getComponent('ItemPrefab').init(value);

            var posX = (y - 2) * this.list_item[i].getContentSize().width*1.025;
            var posY = (x - 1) * this.list_item[i].getContentSize().height*1.02;

            this.list_item[i].stopAllActions();
            this.list_item[i].setPositionX(posX);
            this.list_item[i].setPositionY(posY);
        }

        var lst_time_random = [];
        var count = 0;
        var rand = 0;
        do{
            rand = Math.floor(Math.random()*5);
            if(!lst_time_random.includes(rand)){
                lst_time_random.push(rand);
                count++;
            }
        }while(count < 5);

        console.log("lst_time_random : ",lst_time_random);

        for(var i = 0; i < this.list_item.length; i++){
            var x = parseInt(i/this.number);
            var y = parseInt(i%this.number);

            var item = this.list_item[i];

            var h = item.getContentSize().height*1.02;

            var move1 = cc.moveBy(1,cc.p(0,-this.stepMove*h*0.55));
            var move2 = cc.moveBy(1,cc.p(0,-(this.stepMove*0.45 - index_item)*h)).easing(cc.easeBackOut());

            var delay = cc.delayTime(y*0.15);

            if(i == this.list_item.length - 1){
                if(listWin.length > 0){
                    // khi dừng hiệu ứng
                    var call_func = cc.callFunc(function () {
                        // update line_result
                        this.board_hide.active = true;

                        this.list_win = listWin;
                        this.list_money = listMoney;
                        this.deltaTime = 0;
                        this.isComplete = true;
                        this.countAnimate = 0;
                        this.isRunning = true;
                        this.updateButtonSpin();

                        //this.oldCoin = this.coin;
                        for(var i = 0; i < this.list_money.length; i++){
                            this.coin += this.list_money[i];
                        }
                        InstantGame.getInstance().updateCoin(this.coin);

                        this.setSoundVolume(this.soundBackground,0.25);

                    }.bind(this));
                    item.runAction(cc.sequence(delay,move1,move2,call_func));
                }else{
                    var call_func = cc.callFunc(function () {
                        this.isRunning = false;
                        this.updateButtonSpin();

                        if(this.countInterstitial >= 4){
                            this.countInterstitial = 0;
                            InstantGame.getInstance().showInterstitialAd(function (response) {
                                this.demo.string + "demo : xxxx :" + response.error;
                            }.bind(this));
                        }
                    }.bind(this));
                    item.runAction(cc.sequence(delay,move1,move2,call_func));
                }
            }else{
                item.runAction(cc.sequence(delay,move1,move2));
            }
        }
    },

    implementDisplayChangeMoney: function(displayChangeMoney) {
        //TODO: hieu ung cong tien su dung bien displayChangeMoney

        this.money_display.node.setPositionY(0);
        this.money_display.string = "+" + displayChangeMoney;
        this.money_display.node.runAction(cc.sequence(
            cc.fadeIn(0.1),
            cc.moveBy(1,cc.p(0,50)),
            cc.fadeOut(0.5)));
    },

    resetLineResult: function () {
        for(var i = 0; i< this.lst_line_result.length; i++){
            var line = this.lst_line_result[i].getComponent("LineResult");
            line.reset();
        }
    },
    getSpin: function() {
        if(this.isRunning || this.coin <= 0){
            return;
        }

        this.countInterstitial ++;

        var listItem = GameUtils.getInstance().getListItem(3 * 5);
        // var test = true;
        // if(test)
        //     listItem = [100, 101, 100, 98, 101, 105, 101, 99, 104, 102, 101, 101, 103, 99, 102];
        console.log("listItem : ",listItem);
        var result = GameUtils.getInstance().getResult(this.lst_line_selected, listItem, this.moneyBet);
        var lineWin = result.listWin;
        var lineWinMoney = result.money;
        cc.log("result:", result);

        var money = -this.moneyBet*this.lst_line_selected.length;
        this.updateMoney(money);
        this.animMoney(this.txt_user_money,this.oldCoin,this.coin);
        InstantGame.getInstance().updateCoin(this.coin);

        this.implementSpinTreasure(8,listItem, lineWin, lineWinMoney);
    },

    updateMoney: function (money) {

        this.oldCoin = this.coin;
        this.coin += money;
        if(this.coin < 0){
            this.coin = 0;
        }

        InstantGame.getInstance().updateCoinMax(parseInt(this.coin),function (response) {
            
        });
        InstantGame.getInstance().updateCoin(this.coin);
    },

    updateMoneyView: function (coin) {
        //this.txt_user_money.string = this.numberFormatWithCommas(coin);
        this.animMoney(this.txt_user_money,this.oldCoin,coin);
    },

    updateWinMoney: function () {
        //this.txt_win_money.string = this.numberFormatWithCommas(this.win_coin === 0 ? "" : this.win_coin);
        this.animMoney(this.txt_win_money,this.oldWinCoin,this.win_coin);
    },

    updateButtonSpin: function () {
        this.btn_spin.getComponent(cc.Sprite).spriteFrame = this.isRunning ? this.btn_spin_frames[0] : this.btn_spin_frames[1];
    },
    getKeyBet: function() {
        return this.betType;
    },
    calculateTurnType: function() {
        return this.getKeyBet() + 1;
    },

    onDestroy: function() {
        console.log("on destroy");
    },

    showRewardVideo : function () {
        var self = this;
        if(InstantGame.getInstance().enable){
            window.showRewardedVideo(function () {
                self.updateMoney(Config.ADS_COIN.REWARD);
                self.animMoney(self.txt_user_money,self.oldCoin,self.coin);
            });
        }
    },

    chonDongTouchEvent: function () {
        var self = this;
        this.showPopup("PopupSelectLine",function (popup) {
            popup.init(self.lst_line_selected,function (eventType,index) {

                self.onEventLineSelected(eventType,index);
            });
            popup.appear();
        });
    },

    showPopupPayTable: function () {
        this.showPopup("PopupPayInfo",function (popup) {
            popup.appear();
        });
    },

    showPopupShop: function () {
        this.showPopup("PopupIAP",function (popup) {
            popup.appear();
        });
    },

    chonCuocTouchEvent: function () {
        this.is_bet_select = !this.is_bet_select;
        this.popup_bet_select.scale = 0.2;
        this.popup_bet_select.active = this.is_bet_select;
        if(this.is_bet_select){
            this.popup_bet_select.runAction(cc.scaleTo(0.2,1.0).easing(cc.easeBackOut()));
        }
    },

    chonMucCuocEvent: function (event,data) {
        if(data < this.bets_select.length && data >= 0){
            this.indexCash = data;

            this.txt_bet_money.string = this.convertIntToMoneyView(this.turnCashValue[this.indexCash]);
            this.is_bet_select = false;
            this.popup_bet_select.active = this.is_bet_select;

            this.moneyBet = this.turnCashValue[this.indexCash]*this.lst_line_selected.length;
            if(this.moneyBet >= 0){
                this.txt_total_bet_money.string = this.numberFormatWithCommas(this.moneyBet);
            }
        }
    },

    onEventLineSelected : function (eventType,data) {
        if (eventType == Config.ON_EVENT.EVENT_SELECT_LINE){
            cc.log("eventType : ",eventType);

            cc.log("this.lst_line_selected :",this.lst_line_selected);

            var contain = false;
            for (var i = 0; i < this.lst_line_selected.length; i++){
                if (this.lst_line_selected[i] == data){
                    contain = true;

                    this.lst_line_selected.splice(i,1);
                    break;
                }
            }

            cc.log("contain :",contain);

            if (!contain){
                this.lst_line_selected.push(data);
            }

            this.setLineSelected();
        }
        else if (eventType == Config.ON_EVENT.EVENT_SELECT_LINE_BY_TYPE){
            cc.log("eventType : ",eventType);

            if (data == Config.SELECT_LINE_TYPE.DONG_CHAN){
                this.lst_line_selected = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
            }
            else if (data == Config.SELECT_LINE_TYPE.DONG_LE){
                this.lst_line_selected = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
            }
            else if (data == Config.SELECT_LINE_TYPE.DONG_ALL){
                this.lst_line_selected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
            }
            else if (data == Config.SELECT_LINE_TYPE.CHON_LAI){
                this.lst_line_selected = [];
            }

            this.setLineSelected();
        }
    },

    setLineSelected: function () {
        var count = 0;
        for(var i = 0; i < this.lst_line_selected_sprite.length; i++){
            var contain = false;
            for(var j = 0; j < this.lst_line_selected.length; j++){
                if(this.lst_line_selected[j] == this.lst_line_selected_sprite[i].name){
                    contain = true;
                    break;
                }
            }

            var line = this.lst_line_selected_sprite[i];
            if(contain){
                line.initHighLight(true);
                count ++;
            }else{
                line.initHighLight(false);
            }
        }

        this.txt_total_line.string = count;

        this.moneyBet = this.turnCashValue[this.indexCash];
        if(this.moneyBet >= 0){
            this.txt_total_bet_money.string = this.numberFormatWithCommas(this.moneyBet*count);
        }

    },

    resetLineSelected: function () {

        this.lst_line_selected.clear();
    },

    showTopUser: function () {
        this.showPopup(Config.name.POPUP_RANK,function(popup) {

        });
    },

    showInviteFriends : function () {
        InstantGame.getInstance().inviteFriends(function (response) {
            console.log("Friend id :",response.friendID);
        });
    },

    convertIntToMoneyView: function (value) {
        var i = 0;
        var end = [ "", "K", "M", "B" ];
        while (value >= 1000){
            value = value/1000;
            i++;
        }
        return value + end[i];
    },

    numberFormatWithCommas: function(value){
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    buttonSoundEvent: function () {
        this.enableSound = !this.enableSound;
        if(!this.enableSound){
            this.stopMusic(this.soundMusic);
        }

        this.btn_sound.getComponent(cc.Sprite).spriteFrame = this.enableSound ? this.sound_frames[1] : this.sound_frames[0];
    },

    closePopup: function (name_popup) {
        var scene = cc.director.getScene();
        if(cc.isValid(scene) && cc.isValid(scene.getChildByName(name_popup))){
            scene.getChildByName(name_popup).destroy();
        }
    },

    showPopup: function (name_popup, cb) {
        var scene = cc.director.getScene();
        if(cc.isValid(scene) && !cc.isValid(scene.getChildByName(name_popup))){
            cc.loader.loadRes("prefabs/" + name_popup,function(error, prefab) {
                if(!error){
                    var popup = cc.instantiate(prefab);
                    if(cc.isValid(popup)){
                        popup.x = cc.director.getWinSize().width / 2;
                        popup.y = cc.director.getWinSize().height / 2;
                        if(cb) {
                            var component = popup.getComponent(name_popup);
                            component.setNamePopup(name_popup);
                            cb(component);
                            scene.addChild(popup,10);
                        }
                    }
                }else{
                    cc.log("Lỗi load popup,sai tên hoặc thêm popup vào resources.");
                }
            })
        }
    },
});
