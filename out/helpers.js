"use strict";
function testCollisionAABB(rect1, rect2) {
    return (rect1.posX < rect2.posX + rect2.width &&
        rect1.posX + rect1.width > rect2.posX &&
        rect1.posY < rect2.posY + rect2.height &&
        rect1.posY + rect1.height > rect2.posY);
}
function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}
//# sourceMappingURL=helpers.js.map