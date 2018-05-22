cc.Class({
    extends: cc.Component,


    properties: {
        productNames : []
    },

    onLoad : function() {
        this.initIap();
    },

    init : function (index,callback) {
        this.index = index;
        this.callback = callback;
    },

    event : function () {
        this.callback(this.index);
    },

    initIap: function () {
        if(cc.sys.isMobile){
            var self = this;

            sdkbox.IAP.init();
            sdkbox.IAP.setDebug(true);
            sdkbox.IAP.setListener({
                onSuccess : function (product) {
                    cc.log("Purchase successful: " + JSON.stringify(product));
                    //Purchase success
                    cc.log("Purchase successful: " + product.name);
                },
                onFailure : function (product, msg) {
                    //Purchase failed
                    //msg is the error message
                    cc.log("Purchase failed: " + product.name + " error: " + msg);

                },
                onCanceled : function (product) {
                    //Purchase was canceled by user
                    cc.log("Purchase canceled: " + product.name);
                },
                onRestored : function (product) {
                    //Purchase restored
                    cc.log("Restored: " + product.name);
                },
                onProductRequestSuccess : function (products) {
                    //Returns you the data for all the iap products
                    //You can get each item using following method
                    for (var i = 0; i < products.length; i++) {
                        cc.log("================");
                        cc.log("name: " + products[i].name);
                        cc.log("price: " + products[i].price);
                        cc.log("priceValue: " + products[i].priceValue);
                        cc.log("================");

                        var name = products[i].name;
                        cc.log("purchase: " + name);
                        self.productNames[i] = name;
                        // var data =  pbM.instance.ChargeAppStoreRequest('NA',self.productNames[i],productId,'NA',purchaseState,payload,tokenPurchase);
                        // var midId = mid.GET_SU_CHARGE_APPSTORE;
                        // //call socket send

                        // BaseScene.socket.send(data, midId,dataName[midId], (protoData,i) => {

                        // });
                    }
                },
                onProductRequestFailure : function (msg) {
                    cc.log("Failed to get products");
                },
                onShouldAddStorePayment: function(productId) {
                    cc.log("onShouldAddStorePayment:" + productId);
                    return true;
                },
                onFetchStorePromotionOrder : function (productIds, error) {
                    cc.log("onFetchStorePromotionOrder:" + " " + " e:" + error);
                },
                onFetchStorePromotionVisibility : function (productId, visibility, error) {
                    cc.log("onFetchStorePromotionVisibility:" + productId + " v:" + visibility + " e:" + error);
                },
                onUpdateStorePromotionOrder : function (error) {
                    cc.log("onUpdateStorePromotionOrder:" + error);
                },
                onUpdateStorePromotionVisibility : function (error) {
                    cc.log("onUpdateStorePromotionVisibility:" + error);
                }
            });
        }
    },

    buttonClick : function (event, customEventData) {
        var index = customEventData;
        cc.log("productNames : " + this.productNames);

        cc.log("productName >> : " + customEventData + "/" + this.productNames[index]);
        if(index < this.productNames.length) {
            sdkbox.IAP.purchase(this.productNames[index]);
        }
    }

    // update (dt) {},
});
