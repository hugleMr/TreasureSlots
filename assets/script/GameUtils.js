var GameUtils = cc.Class({
    ctor: function() {

    },
    statics: {
        _instance: null,
        getInstance: function() {
            if(this._instance === null) {
                this._instance = new GameUtils();
            }
            return this._instance;
        }
    },
    randomIntFromInterval: function(min,max)  {
        return Math.floor(Math.random()*(max-min+1)+min);
    },
    getListItem: function(nElement, min, max) {
        if(min === null || typeof(min) === 'undefined') {
            min = 98;
        }
        if(max === null  || typeof(max) === 'undefined') {
            max = 105;
        }
        var result = new Array(nElement);
        for(var i = 0; i < result.length; i++) {
            result[i] = this.randomIntFromInterval(min, max);
        }
        return result;
    },
});