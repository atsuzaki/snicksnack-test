"use strict";
// UI controller (?)
var fpsCount;
function setupUIhandles() {
    var speedInput = document.getElementById('speedInput');
    var countInput = document.getElementById('countInput');
    var visualizeQtreeCheckbox = document.getElementById('visualizeQuadtreeCheckbox');
    fpsCount = document.getElementById('fpsCount');
    speedInput.value = String(SPEED);
    speedInput.onchange = onSpeedChange;
    countInput.value = String(BOX_COUNT);
    countInput.onchange = onCountChange;
    visualizeQtreeCheckbox.checked = VISUALIZE_QUADTREE;
    visualizeQtreeCheckbox.onchange = onVisualizeQuadtreeChange;
}
// I dont know what's the TypeScript type for raw DOM events, only know the react ones
// Gonna `any` it for now
function onSpeedChange(event) {
    SPEED = event.target.value;
}
function onCountChange(event) {
    var newCount = event.target.value;
    var difference = newCount - BOX_COUNT;
    if (difference < 0) {
        for (var i = 0; i < Math.abs(difference); i++) {
            deleteABox();
        }
    }
    else {
        for (var i = 0; i < difference; i++) {
            createRandomBox();
        }
    }
    BOX_COUNT = newCount;
}
function onVisualizeQuadtreeChange(event) {
    VISUALIZE_QUADTREE = event.target.checked;
}
function updateFPSCounter(fpsCounter) {
    fpsCount.innerText = fpsCounter.getAverageFPS();
}
//# sourceMappingURL=ui.js.map