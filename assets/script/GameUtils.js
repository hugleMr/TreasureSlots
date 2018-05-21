var GameUtils = cc.Class({
    properties: {
        WIN_TABLE: [],
        PAY_TABLE: []
    },
    ctor: function() {
    },
    getWinABC: function() {
        var items = [[5, 6, 7, 8, 9], //1
            [10, 11, 12, 13, 14], //2
            [0, 1, 2, 3, 4], //3
            [5, 6, 12, 8, 9], //4
            [5, 6, 2, 8, 9], //5
            [10, 11, 7, 13, 14], //6
            [0, 1, 7, 3, 4], //7
            [10, 1, 12, 3, 14], //8
            [0, 11, 2, 13, 4], //9
            [5, 11, 2, 13, 9], // 10
            [0, 6, 12, 8, 4], // 11
            [10, 6, 2, 8, 14], //12
            [5, 1, 7, 13, 9], //13
            [5, 11, 7, 3, 9], //14
            [0, 6, 7, 8, 4], //15
            [10, 6, 7, 8, 14], //16
            [5, 1, 2, 3, 9], //17
            [5, 11, 12, 13, 9], //18
            [0, 1, 7, 13, 14], //19
            [10, 11, 7, 3, 4]]; // 20;
        cc.log("items:", items);
        return items;
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
        var result = [];
        for(var i = 0; i < nElement; i++) {
            result.push(this.randomIntFromInterval(min, max));
        }
        return result;
    },

    calculateMoneyItem: function(items, baseMoney) {
        var base = 0;
        if(items[0] === items[4]) {
            // x 5
            if(this.PAY_TABLE[items[0]][5] !== 0)
                base = Config.PAY_TABLE[items[0]][5];
            //return result;
        } else if(items[0] == items[3] || items[1] == items[4]) {
            // x4
            if(Config.PAY_TABLE[items[1]][4] !== 0)
                base = Config.PAY_TABLE[items[1]][4];
        } else if (items[0] == items[2] || items[1] == items[3] || items[2] == items[4]) {
            // x3
            if(Config.PAY_TABLE[items[2]][3] !== 0)
                base = Config.PAY_TABLE[items[2]][3];
        }
        return base;
    },
    getResult: function(listLineSelected, listItem, baseMoney) {
        var resultMoney = [];
        var resultElement = [];

        var self = this;
        cc.log("list line seleected:", listLineSelected);
        listLineSelected.forEach(function(element) {
            var index = element - 1;

            // caculate win table
            var winTable = self.getWinABC()[index];
            var items = [];
            // for(var i = 0; i < winTable.length; i++) {
            //     items.push(listItem[winTable[i]]);
            // }
            var items = winTable.map(function(element) {
                return listItem[element];
            });

            items.sort(function(a, b) {
                return a - b;
            });

            cc.log("win table:", self.getWinABC());

            // we have items array sorted
            var base = self.calculateMoneyItem(items, baseMoney);
            var ok = (base > 0);
            if(ok) {
                resultElement.push(element);
                resultMoney.push(base * baseMoney);
            }
        });
        return  {listWin: resultElement, money: resultMoney};
    }
});