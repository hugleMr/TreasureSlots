
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        cc.director.preloadScene("game",
            function () {
                cc.director.loadScene("game",
                    function () {
                        console.log("DONE!");
                    }
                );
            }
        );
    }
});
