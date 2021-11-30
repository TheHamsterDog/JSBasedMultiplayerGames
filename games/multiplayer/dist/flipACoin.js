"use strict";
exports.__esModule = true;
var flipAcoin = /** @class */ (function () {
    function flipAcoin() {
    }
    // constructor(a){
    //     this.betsOnTails= a.betsOnTails;
    //     this.betsOnHeads= a.betsOnHeads;
    // }
    flipAcoin.prototype.calculate = function () {
        var coinFlip = (Math.floor(Math.random()));
        if (coinFlip === 1) {
            this.winner = 'tails';
        }
        else {
            this.winner = 'heads';
        }
    };
    return flipAcoin;
}());
exports["default"] = flipAcoin;
