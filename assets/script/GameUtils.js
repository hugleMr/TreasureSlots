var GameUtils = cc.Class({
    properties: {
    },
    ctor: function() {
        this.WIN_TABLE = [[5, 6, 7, 8, 9], //1
            [0, 1, 2, 3, 4], //2
            [10, 11, 12, 13, 14], //3
            [5, 6, 2, 8, 9], //4
            [5, 6, 12, 8, 9], //5
            [0, 1, 7, 3, 4], //6
            [10, 11, 7, 13, 14], //7
            [0, 11, 2, 13, 4], //8
            [10, 1, 12, 3, 14], //9
            [5, 1, 12, 3, 9], // 10
            [10, 6, 2, 8, 14], // 11
            [0, 6, 12, 8, 4], //12
            [5, 11, 7, 3, 9], //13
            [5, 1, 7, 13, 9], //14
            [10, 6, 7, 8, 14], //15
            [0, 6, 7, 8, 4], //16
            [5, 11, 12, 13, 9], //17
            [5, 1, 2, 3, 9], //18
            [10, 11, 7, 3, 4], //19
            [0, 1, 7, 13, 14]]; //20
        this.PAY_TABLE = {
            98: {3: 0, 4: 3, 5: 8},
            99: {3: 0, 4: 4, 5: 15},
            100: {3: 2, 4: 8, 5: 55},
            101: {3: 3, 4: 20, 5: 200},
            102: {3: 4, 4: 30, 5: 300},
            103: {3: 5, 4: 40, 5: 500},
            104: {3: 0, 4: 0, 5: 1000},
            105: {3: 10, 4: 100, 5: 1000}
        };
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

    calculateMoneyItem: function(items, baseMoney) {
        var base = 0;
        if(items[0] === items[4]) {
            // x 5
            if(this.PAY_TABLE[items[0]][5] !== 0)
                base = 5;
            return result;
        } else if(items[0] == items[3] || items[1] == items[4]) {
            // x4
            if(this.PAY_TABLE[items[1]][4] !== 0)
                base = 4;
        } else if (items[0] == items[2] || items[1] == items[3] || items[2] == items[4]) {
            // x3
            if(this.PAY_TABLE[items[2]][3] !== 0)
                base = 3;
        }
        return base;
    },
    getResult: function(listLineSelected, listItem, baseMoney) {
        var resultMoney = 0;
        var result = [];
        var self = this;
        cc.log("list line seleected:", listLineSelected);
        listLineSelected.forEach(function(element) {
            var index = element - 1;

            // caculate win table
            var items = self.WIN_TABLE[index].map(function(element) {
                return listItem[element];
            });

            items.sort(function(a, b) {
                return a - b;
            });

            // we have items array sorted
            var base = self.calculateMoneyItem(items, baseMoney);
            var ok = (base > 0);
            if(ok) {
                result.push(element);
                resultMoney = resultMoney + baseMoney * base;
            }
        });
        return  {listWin: result, money: resultMoney};
    }
});