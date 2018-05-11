var InstantGame = require("InstantGame");

cc.Class({
    extends: require("Popup"),

    properties: {
        item_node : cc.Prefab,
        view : cc.Node,
    },

    onLoad : function () {

        var self = this;
        const list_iap = ["0.99$","1.99$","4.99$","9.99$","19.99$","49.99$"];
        const  list_coin = [1000,3000,8000,18000,40000,100000];

        var height = 0;
        for(var i = 0; i < list_coin.length; i++){
            var item = cc.instantiate(this.item_node);
            item.active = true;

            var coin = item.getChildByName("coin");
            coin.getComponent(cc.Label).string = this.numberFormatWithCommas(list_coin[i]) + " coin";

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

    callPayIAP : function (index) {
        var self = this;

        console.log(self.catalog);

        if(index > self.catalog.length - 1){
            return;
        }

        var productID_name = "";
        for(var i = 0; i < self.catalog.length; i++){
            var purchaseId = self.catalog[i].productID;
            var id_name = parseInt(purchaseId.replace("com.treasure.item",""));
            if(id_name === index + 1){
                productID_name = purchaseId;
                break;
            }
        }

        console.log("productID_name : ",productID_name);

        FBInstant.payments.consumePurchaseAsync(productID_name).then(function () {
            console.log("DONE DONE DONE!!!");
        }).catch(function (err) {
            console.log('payment: ', err.message);
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
