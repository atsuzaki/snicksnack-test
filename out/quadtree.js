"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Creates default quadtree
function createQuadtree(objCount) {
    // Naive calculation, sqrt tends to perform well as a default
    // Normally you'd want to adjust this heurestically, but that's beyond the scope of this coding test
    // If sqrt(objCount) < 4, use 4 since the overhead of splitting isn't worth the cost
    var maxObjects = Math.round(Math.max(4, Math.sqrt(objCount)));
    return {
        level: 0,
        maxObjects: maxObjects,
        bounds: {
            posX: 0,
            posY: 0,
            width: canvas.width,
            height: canvas.height,
        },
        nodes: [],
        objects: [],
    };
}
function splitQuadtree(q) {
    var nextLevel = q.level + 1;
    var newWidth = q.bounds.width / 2;
    var newHeight = q.bounds.height / 2;
    var x = q.bounds.posX;
    var y = q.bounds.posY;
    //form upper right
    q.nodes[0] = __assign(__assign({}, q), { level: nextLevel, bounds: {
            posX: x + newWidth,
            posY: y,
            width: newWidth,
            height: newHeight,
        }, nodes: [], objects: [] });
    //upper left
    q.nodes[1] = __assign(__assign({}, q), { level: nextLevel, bounds: {
            posX: x,
            posY: y,
            width: newWidth,
            height: newHeight,
        }, nodes: [], objects: [] });
    //bottom left
    q.nodes[2] = __assign(__assign({}, q), { level: nextLevel, bounds: {
            posX: x,
            posY: y + newHeight,
            width: newWidth,
            height: newHeight,
        }, nodes: [], objects: [] });
    //bottom right
    q.nodes[3] = __assign(__assign({}, q), { level: nextLevel, bounds: {
            posX: x + newWidth,
            posY: y + newHeight,
            width: newWidth,
            height: newHeight,
        }, nodes: [], objects: [] });
}
// TODO: instead taking Box, refactor to take a more generic Transform. Though it doesn't matter in this little app
function getIndex(q, pRect) {
    var indexes = [];
    var vertMid = q.bounds.posX + q.bounds.width / 2;
    var horMid = q.bounds.posY + q.bounds.height / 2;
    var startNorth = pRect.posY < horMid;
    var startWest = pRect.posX < vertMid;
    var endEast = pRect.posX + pRect.width > vertMid;
    var endSouth = pRect.posY + pRect.height > horMid;
    // Top right
    if (startNorth && endEast) {
        indexes.push(0);
    }
    else if (startWest && startNorth) {
        indexes.push(1);
    }
    else if (startWest && endSouth) {
        indexes.push(2);
    }
    else if (endEast && endSouth) {
        indexes.push(3);
    }
    return indexes;
}
function insertBoxIntoQuadtree(q, b) {
    var indices;
    if (q.nodes.length > 0) {
        indices = getIndex(q, b);
        for (var i = 0; i < indices.length; i++) {
            //recursive inserts into children
            insertBoxIntoQuadtree(q.nodes[indices[i]], b);
        }
    }
    // todo: if item's not present in array, push. make this better
    //  is this needed?
    if (q.objects.indexOf(b) <= -1) {
        q.objects.push(b);
    }
    // Hit max boxes in a node
    if (q.objects.length > q.maxObjects) {
        // Split first if we've got no children
        if (q.nodes.length == 0) {
            splitQuadtree(q);
        }
        for (var i = 0; i < q.objects.length; i++) {
            var index = getIndex(q, q.objects[i]);
            for (var j = 0; j < index.length; j++) {
                insertBoxIntoQuadtree(q.nodes[index[j]], q.objects[i]);
            }
        }
        // Clean up this node
        q.objects = [];
    }
}
function queryPotentials(q, pRect) {
    var index = getIndex(q, pRect);
    var objects = q.objects;
    if (q.nodes.length > 0) {
        for (var i = 0; i < q.nodes.length; i++) {
            var subnodeObjects = [];
            for (var j = 0; j < index.length; j++) {
                var subnodeObj = queryPotentials(q.nodes[index[j]], pRect);
                objects = objects.concat(subnodeObj);
            }
        }
    }
    // Remove duplicates
    objects = objects.filter(function (item, idx) {
        return objects.indexOf(item) >= idx;
    });
    return objects;
}
// function queryPotentials(q: Quadtree, pRect: Box) {
//   let index = getIndex(q, pRect);
//   let objects = q.objects;
//
//   if (q.nodes.length > 0) {
//     for (let i = 0; i < q.nodes.length; i++) {
//       for (let j = 0; j < index.length; j++) {
//         let subnodeObj = queryPotentials(q.nodes[index[j]], pRect);
//         objects = subnodeObj;
//       }
//     }
//   }
//
//   // Remove duplicates
//   objects = objects.filter(function (item, idx) {
//     return objects.indexOf(item) >= idx;
//   });
//
//   return objects;
// }
function resetTree(q) {
    q.objects = [];
    for (var i = 0; i < q.nodes.length; i++) {
        if (q.nodes.length > 0) {
            resetTree(q.nodes[i]);
        }
    }
    q.nodes = [];
}
//# sourceMappingURL=quadtree.js.map