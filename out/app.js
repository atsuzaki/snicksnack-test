"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
//// GLOBALS
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
// This should be in helpers I guess? but I kinda like seeing this here better
function setCanvasSize() {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
}
window.onresize = function () { return setCanvasSize(); };
var BOX_ID_COUNTER = 0; // good ol' static counter for IDing
//// APP STATE
var BOX_SIZE = 20;
var BOX_COUNT = 50;
var SPEED = 100;
var VISUALIZE_QUADTREE = false;
var FPS_COUNTER;
var BOXES = [];
var QUADTREE;
function createRandomBox() {
    BOXES.push({
        guid: BOX_ID_COUNTER++,
        posX: Math.random() * canvas.width,
        posY: Math.random() * canvas.height,
        width: BOX_SIZE,
        height: BOX_SIZE,
        color: 'black',
        heading: { x: Math.random(), y: Math.random() },
    });
}
function deleteABox() {
    BOXES.pop();
}
// Without doing heurestics we don't know if updating vs rebuilding quad tree would be more optimal for sure.
// But since we're able to modify box count and speed, and in general things move across the screen constantly,
// my hunch is that it's gonna be faster to just rebuilding it every step.
function constructQuadTreeSystem() {
    var e_1, _a;
    QUADTREE = createQuadtree(BOX_COUNT);
    try {
        for (var BOXES_1 = __values(BOXES), BOXES_1_1 = BOXES_1.next(); !BOXES_1_1.done; BOXES_1_1 = BOXES_1.next()) {
            var box = BOXES_1_1.value;
            insertBoxIntoQuadtree(QUADTREE, box);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (BOXES_1_1 && !BOXES_1_1.done && (_a = BOXES_1.return)) _a.call(BOXES_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
function testAABBSystem() {
    var e_2, _a, e_3, _b;
    try {
        // TODO: right now we're double checking, but honestly at this case just doing that is probably faster
        //       more than that, this method shitting out strings is probably more impactful to perf
        for (var BOXES_2 = __values(BOXES), BOXES_2_1 = BOXES_2.next(); !BOXES_2_1.done; BOXES_2_1 = BOXES_2.next()) {
            var box = BOXES_2_1.value;
            var potentials = queryPotentials(QUADTREE, box);
            try {
                for (var potentials_1 = (e_3 = void 0, __values(potentials)), potentials_1_1 = potentials_1.next(); !potentials_1_1.done; potentials_1_1 = potentials_1.next()) {
                    var other = potentials_1_1.value;
                    if (box.guid != other.guid && testCollisionAABB(box, other)) {
                        box.color = 'red';
                        other.color = 'red';
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (potentials_1_1 && !potentials_1_1.done && (_b = potentials_1.return)) _b.call(potentials_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (BOXES_2_1 && !BOXES_2_1.done && (_a = BOXES_2.return)) _a.call(BOXES_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
function collisionResetSystem() {
    var e_4, _a;
    try {
        for (var BOXES_3 = __values(BOXES), BOXES_3_1 = BOXES_3.next(); !BOXES_3_1.done; BOXES_3_1 = BOXES_3.next()) {
            var box = BOXES_3_1.value;
            box.color = 'black';
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (BOXES_3_1 && !BOXES_3_1.done && (_a = BOXES_3.return)) _a.call(BOXES_3);
        }
        finally { if (e_4) throw e_4.error; }
    }
}
function boxMovementSystem(deltaTime) {
    var e_5, _a;
    try {
        for (var BOXES_4 = __values(BOXES), BOXES_4_1 = BOXES_4.next(); !BOXES_4_1.done; BOXES_4_1 = BOXES_4.next()) {
            var box = BOXES_4_1.value;
            var newPosX = box.posX + box.heading.x * SPEED * deltaTime;
            var newPosY = box.posY + box.heading.y * SPEED * deltaTime;
            box.posX = clamp(newPosX, 0, canvas.width - box.width);
            box.posY = clamp(newPosY, 0, canvas.height - box.height);
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (BOXES_4_1 && !BOXES_4_1.done && (_a = BOXES_4.return)) _a.call(BOXES_4);
        }
        finally { if (e_5) throw e_5.error; }
    }
}
function bounceOffWallsSystem() {
    var e_6, _a;
    try {
        for (var BOXES_5 = __values(BOXES), BOXES_5_1 = BOXES_5.next(); !BOXES_5_1.done; BOXES_5_1 = BOXES_5.next()) {
            var box = BOXES_5_1.value;
            if (box.posX <= 0 || box.posX + BOX_SIZE >= canvas.width) {
                box.heading.x = -box.heading.x;
            }
            if (box.posY <= 0 || box.posY + BOX_SIZE >= canvas.height) {
                box.heading.y = -box.heading.y;
            }
        }
    }
    catch (e_6_1) { e_6 = { error: e_6_1 }; }
    finally {
        try {
            if (BOXES_5_1 && !BOXES_5_1.done && (_a = BOXES_5.return)) _a.call(BOXES_5);
        }
        finally { if (e_6) throw e_6.error; }
    }
}
function drawBoxesSystem() {
    var e_7, _a;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    try {
        for (var BOXES_6 = __values(BOXES), BOXES_6_1 = BOXES_6.next(); !BOXES_6_1.done; BOXES_6_1 = BOXES_6.next()) {
            var box = BOXES_6_1.value;
            ctx.lineWidth = 3;
            ctx.strokeStyle = box.color;
            // Uncomment to show guid for debug
            // ctx.fillText(`${box.guid}`, box.posX + 5, box.posY + 15);
            ctx.strokeRect(box.posX, box.posY, box.width, box.height);
        }
    }
    catch (e_7_1) { e_7 = { error: e_7_1 }; }
    finally {
        try {
            if (BOXES_6_1 && !BOXES_6_1.done && (_a = BOXES_6.return)) _a.call(BOXES_6);
        }
        finally { if (e_7) throw e_7.error; }
    }
}
function drawQuadtreeSystem() {
    drawNodes(QUADTREE);
}
function drawNodes(qtree) {
    var e_8, _a;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'blue';
    try {
        for (var _b = __values(qtree.nodes), _c = _b.next(); !_c.done; _c = _b.next()) {
            var childQ = _c.value;
            var bounds = childQ.bounds;
            ctx.strokeRect(bounds.posX, bounds.posY, bounds.width, bounds.height);
            drawNodes(childQ);
        }
    }
    catch (e_8_1) { e_8 = { error: e_8_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_8) throw e_8.error; }
    }
}
function step(timestamp) {
    var deltaTime = FPS_COUNTER.getDeltaTimeInSeconds(timestamp); // TODO: should refactor delta time logic out of fps counter
    appUpdate(deltaTime);
    FPS_COUNTER.step(timestamp);
    updateFPSCounter(FPS_COUNTER);
    window.requestAnimationFrame(step);
}
function appStart() {
    setupUIhandles();
    setCanvasSize();
    FPS_COUNTER = new FPSCounter();
    // Make bois
    for (var i = 0; i < BOX_COUNT; i++) {
        createRandomBox();
    }
    window.requestAnimationFrame(step);
}
// I ended up doing ecs-style systems here out of habit, but for this little app,
//  iterating boxes directly and calling each function is probably more suitable
function appUpdate(deltaTime) {
    collisionResetSystem();
    boxMovementSystem(deltaTime);
    constructQuadTreeSystem();
    testAABBSystem();
    bounceOffWallsSystem();
    drawBoxesSystem();
    if (VISUALIZE_QUADTREE) {
        drawQuadtreeSystem();
    }
}
// main function
appStart();
//# sourceMappingURL=app.js.map