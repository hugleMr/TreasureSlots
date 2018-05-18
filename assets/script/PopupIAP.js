var InstantGame = require("InstantGame");

cc.Class({
    extends: require("Popup"),

    properties: {
        item_node : cc.Prefab,
        view : cc.Node,
        light : cc.Node,
        lightx : cc.Node,
        money : cc.Label,
    },

    onLoad : function () {

        var self = this;
        const list_iap = ["0.99$","1.99$","4.99$","9.99$","19.99$","49.99$"];
        this.list_coin = [100,300,800,1800,4000,10000];

        var height = 0;
        for(var i = 0; i < this.list_coin.length; i++){
            var item = cc.instantiate(this.item_node);
            item.active = true;

            var coin = item.getChildByName("coin");
            coin.getComponent(cc.Label).string = this.numberFormatWithCommas(this.list_coin[i] * 1000) + " coin";

            var iap = item.getChildByName("bg_item").getChildByName("iap");
            iap.getComponent(cc.Label).string = list_iap[i];

            item.setPosition(cc.p(0,- i*item.height*1.2 - 0.8* item.height ));

            height += item.height*1.2 + ((i === 0) ? 0.5* item.height : 0);
            this.view.addChild(item);

            item.getComponent("ItemIAP").init(i,function (index) {
                self.callPayIAP(index);
            });
        }

        this.view.height = height;

        this.initLoad();
    },

    initCallBackGame : function (callback) {
        this.callback = callback;
    },

    callPayIAP : function (index) {
        var self = this;

        if(index > self.catalog.length - 1){
            return;
        }

        var productID_name = "";
        for(var i = 0; i < self.catalog.length; i++){
            var purchaseId = self.catalog[i].productID;
            var id_name = parseInt(purchaseId.replace("com.treasure.pack",""));
            if(id_name === index + 1){
                productID_name = purchaseId;
                break;
            }
        };

        FBInstant.payments.purchaseAsync({
            productID: productID_name,
            developerPayload: 'foobar',
        }).then(function (purchase) {
            FBInstant.payments.consumePurchaseAsync(purchase.purchaseToken).then(function () {
                var index = parseInt(purchase.productID.replace("com.treasure.pack",""));
                self.callback(self.list_coin[index - 1]*1000);

                self.light.active = true;
                self.lightx.active = true;
                self.money.node.active = true;

                self.money.string = self.list_coin[index -1]*1000;
                self.light.stopAllActions();
                self.light.runAction(cc.repeatForever(cc.rotateBy(0.05,5)));
                self.lightx.stopAllActions();
                self.lightx.runAction(cc.repeatForever(cc.rotateBy(0.05,-2)));
                self.light.runAction(cc.sequence(cc.delayTime(4),cc.callFunc(function () {
                    self.light.active = false;
                    self.lightx.active = false;
                    self.money.node.active = false;
                },this)));

            }).catch(function(error) {
                console.log(err.message);
            });
        }).catch(function(err){
            console.log(err.message);
        });
    },

    initLoad: function () {
        var self = this;
        InstantGame.getInstance().payIAP(function (response) {
             self.catalog = response.catalog;
        });
    },

    numberFormatWithCommas: function(value){
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
});
