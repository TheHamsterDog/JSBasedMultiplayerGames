"use strict";
exports.__esModule = true;
var rollAdice = /** @class */ (function () {
    function rollAdice() {
    }
    rollAdice.prototype.calculate = function () {
        var x = Math.round(Math.random() * 5) + 1;
        return x;
    };
    return rollAdice;
}());
exports["default"] = rollAdice;
