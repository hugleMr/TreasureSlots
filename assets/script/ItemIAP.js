
cc.Class({
    extends: cc.Component,

    properties: {

    },

    init : function (index,callback) {
        this.index = index;
        this.callback = callback;
    },
    
    event : function () {
        this.callback(this.index);
    }
});
