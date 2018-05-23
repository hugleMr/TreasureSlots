
cc.Class({
    extends: cc.Component,

    properties: {

    },

    init : function (index,callback) {
        this.index = index;
        this.callback = callback;
    },
    
    event : function () {
        cc.log("index:", this.index);
        this.callback(this.index);
    }
});
