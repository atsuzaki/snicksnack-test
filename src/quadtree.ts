type Quadtree = {
  maxObjects: number;
  level: number;
  bounds: Bounds;

  nodes: Array<Quadtree>;
  objects: Array<Box>;
};

type Bounds = {
  posX: number;
  posY: number;
  width: number;
  height: number;
};

// Creates default quadtree
function createQuadtree(objCount: number): Quadtree {
  // Naive calculation, sqrt tends to perform well as a default
  // Normally you'd want to adjust this by testing real situations pertinent to your game specifically,
  // but that's beyond the scope of this coding test
  // If sqrt(objCount) < 4, use 4 since the overhead of splitting is probably not worth it
  let maxObjects = Math.round(Math.max(4, Math.sqrt(objCount)));

  return {
    level: 0,
    maxObjects,
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

function splitQuadtree(q: Quadtree) {
  let nextLevel = q.level + 1;
  let newWidth = q.bounds.width / 2;
  let newHeight = q.bounds.height / 2;
  let x = q.bounds.posX;
  let y = q.bounds.posY;

  // Form upper right child quadrant
  q.nodes[0] = {
    ...q,
    level: nextLevel,
    bounds: {
      posX: x + newWidth,
      posY: y,
      width: newWidth,
      height: newHeight,
    },

    nodes: [],
    objects: [],
  };

  //upper left
  q.nodes[1] = {
    ...q,
    level: nextLevel,
    bounds: {
      posX: x,
      posY: y,
      width: newWidth,
      height: newHeight,
    },

    nodes: [],
    objects: [],
  };

  //bottom left
  q.nodes[2] = {
    ...q,
    level: nextLevel,
    bounds: {
      posX: x,
      posY: y + newHeight,
      width: newWidth,
      height: newHeight,
    },

    nodes: [],
    objects: [],
  };

  //bottom right
  q.nodes[3] = {
    ...q,
    level: nextLevel,
    bounds: {
      posX: x + newWidth,
      posY: y + newHeight,
      width: newWidth,
      height: newHeight,
    },

    nodes: [],
    objects: [],
  };
}

// TODO: instead taking Box, refactor to take a more generic Transform. Though it doesn't matter in this little app
function getIndex(q: Quadtree, pRect: Box): Array<number> {
  let indexes: Array<number> = [];
  let vertMid = q.bounds.posX + q.bounds.width / 2;
  let horMid = q.bounds.posY + q.bounds.height / 2;

  let startNorth = pRect.posY < horMid;
  let startWest = pRect.posX < vertMid;
  let endEast = pRect.posX + pRect.width > vertMid;
  let endSouth = pRect.posY + pRect.height > horMid;

  // Top right
  if (startNorth && endEast) {
    indexes.push(0);
  } else if (startWest && startNorth) {
    indexes.push(1);
  } else if (startWest && endSouth) {
    indexes.push(2);
  } else if (endEast && endSouth) {
    indexes.push(3);
  }

  return indexes;
}

function insertBoxIntoQuadtree(q: Quadtree, b: Box) {
  let indices;

  if (q.nodes.length > 0) {
    indices = getIndex(q, b);

    for (let i = 0; i < indices.length; i++) {
      // Recursive inserts into already-split child nodes
      insertBoxIntoQuadtree(q.nodes[indices[i]], b);
    }
  }

  if (q.objects.indexOf(b) <= -1) {
    q.objects.push(b);
  }

  // Hit max boxes in a node, so we're trying to add another element that no longer fits into this bucket and need to split
  if (q.objects.length > q.maxObjects) {
    // Split first if we've got no children
    if (q.nodes.length == 0) {
      splitQuadtree(q);
    }

    for (let i = 0; i < q.objects.length; i++) {
      let index = getIndex(q, q.objects[i]);

      for (let j = 0; j < index.length; j++) {
        insertBoxIntoQuadtree(q.nodes[index[j]], q.objects[i]);
      }
    }

    // Clean up this node
    q.objects = [];
  }
}

function queryPotentials(q: Quadtree, pRect: Box) {
  let index = getIndex(q, pRect);
  let objects = q.objects;

  if (q.nodes.length > 0) {
    for (let i = 0; i < q.nodes.length; i++) {
      for (let j = 0; j < index.length; j++) {
        let subnodeObj = queryPotentials(q.nodes[index[j]], pRect);
        objects = objects.concat(subnodeObj);
      }
    }
  }

  // Dirty Remove duplicates
  objects = objects.filter(function (item, idx) {
    return objects.indexOf(item) >= idx;
  });

  return objects;
}

function resetTree(q: Quadtree) {
  q.objects = [];

  for (let i = 0; i < q.nodes.length; i++) {
    if (q.nodes.length > 0) {
      resetTree(q.nodes[i]);
    }
  }

  q.nodes = [];
}
