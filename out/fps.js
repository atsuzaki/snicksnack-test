"use strict";
// TODO: script ported over directly from C# fps counter
//  It works, but try js-ifying (and not use a class for it) if there's time
//Expected usage: create FPSCounter at init time, call step() once per frame
//Get FPS as a string via getAverageFPS() call
var FPSCounter = /** @class */ (function () {
    function FPSCounter() {
        // Avoid creating per-frame string garbage by caching up-front
        // prettier-ignore
        this.stringCache = [
            "00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
            "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
            "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
            "30", "31", "32", "33", "34", "35", "36", "37", "38", "39",
            "40", "41", "42", "43", "44", "45", "46", "47", "48", "49",
            "50", "51", "52", "53", "54", "55", "56", "57", "58", "59",
            "60", "61", "62", "63", "64", "65", "66", "67", "68", "69",
            "70", "71", "72", "73", "74", "75", "76", "77", "78", "79",
            "80", "81", "82", "83", "84", "85", "86", "87", "88", "89",
            "90", "91", "92", "93", "94", "95", "96", "97", "98", "99"
        ];
        this._fpsBuffer = [];
        this._fpsBufferIndex = 0;
        this._previousFrameTimestamp = 0;
        this.FrameBufferSize = 60;
        this.AverageFPS = 0;
        this.InstFPS = 0;
    }
    FPSCounter.prototype.step = function (currentTimeStamp) {
        //Float to int
        this.InstFPS = ~~(1.0 / this.getDeltaTimeInSeconds(currentTimeStamp));
        this.updateBuffer();
        this.calculateFPS();
        this._previousFrameTimestamp = currentTimeStamp;
    };
    FPSCounter.prototype.getDeltaTimeInSeconds = function (currentTimeStamp) {
        //have to convert timestamp to proper units
        return (currentTimeStamp - this._previousFrameTimestamp) * 0.001;
    };
    FPSCounter.prototype.getAverageFPS = function () {
        return this.stringCache[~~this.AverageFPS];
    };
    FPSCounter.prototype.calculateFPS = function () {
        var sum = this._fpsBuffer.reduce(function (a, b) {
            return a + b;
        });
        this.AverageFPS = sum / this.FrameBufferSize;
    };
    FPSCounter.prototype.updateBuffer = function () {
        this._fpsBuffer[this._fpsBufferIndex++] = this.InstFPS;
        if (this._fpsBufferIndex >= this.FrameBufferSize) {
            this._fpsBufferIndex = 0;
        }
    };
    return FPSCounter;
}());
//# sourceMappingURL=fps.js.map