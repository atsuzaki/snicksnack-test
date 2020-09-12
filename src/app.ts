//// GLOBALS
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// This should ideally be in helpers, but for a small project it's easier to just place it here
function setCanvasSize() {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
}
window.onresize = () => setCanvasSize();

let BOX_ID_COUNTER = 0; // good ol' static counter for IDing

//// APP STATE
let BOX_SIZE = 20;
let BOX_COUNT = 50;
let SPEED = 100;

let VISUALIZE_QUADTREE = false;
let FPS_COUNTER: FPSCounter;

let BOXES: Array<Box> = [];

let QUADTREE: Quadtree;

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

//// APPLICATION
type Vec2 = { x: number; y: number };

// Instead of chucking everything into one mega object I'd normally split them into multiple components
//  to improve cachelines, but since this is pure JS it doesn't much matter
type Box = {
  guid: number;
  posX: number;
  posY: number;

  width: number;
  height: number;

  color: string;
  heading: Vec2;
};

// Without doing heurestics we don't know if updating vs rebuilding quad tree would be more optimal on average.
// But since we're able to modify box count and speed, and in general things move across the screen constantly,
// my hunch is that it's gonna be faster to just rebuilding it every step, as updating is likely to incur
// an enormous amount of tree balancing every single frame.
function constructQuadTreeSystem() {
  QUADTREE = createQuadtree(BOX_COUNT);

  for (let box of BOXES) {
    insertBoxIntoQuadtree(QUADTREE, box);
  }
}

function testAABBSystem() {
  // TODO: right now we're double checking, but honestly with our use case just doing that is probably faster
  //       more than that, this method constantly generating GC from strings is probably more impactful to perf

  for (let box of BOXES) {
    let potentials = queryPotentials(QUADTREE, box);

    for (let other of potentials) {
      if (box.guid != other.guid && testCollisionAABB(box, other)) {
        box.color = 'red';
        other.color = 'red';
      }
    }
  }
}

function collisionResetSystem() {
  // This needs its own system that runs before collision detection begins, otherwise positive collisions
  // are overwritten by negative ones instead.
  // Normally you'd have an isDirty flag instead, but this works for our purpose
  for (const box of BOXES) {
    box.color = 'black';
  }
}

function boxMovementSystem(deltaTime: number) {
  for (let box of BOXES) {
    let newPosX = box.posX + box.heading.x * SPEED * deltaTime;
    let newPosY = box.posY + box.heading.y * SPEED * deltaTime;

    box.posX = clamp(newPosX, 0, canvas.width - box.width);
    box.posY = clamp(newPosY, 0, canvas.height - box.height);
  }
}

function bounceOffWallsSystem() {
  for (let box of BOXES) {
    if (box.posX <= 0 || box.posX + BOX_SIZE >= canvas.width) {
      box.heading.x = -box.heading.x;
    }
    if (box.posY <= 0 || box.posY + BOX_SIZE >= canvas.height) {
      box.heading.y = -box.heading.y;
    }
  }
}

function drawBoxesSystem() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const box of BOXES) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = box.color;

    // Uncomment to show guid for debug
    // ctx.fillText(`${box.guid}`, box.posX + 5, box.posY + 15);

    ctx.strokeRect(box.posX, box.posY, box.width, box.height);
  }
}

function drawQuadtreeSystem() {
  drawNodes(QUADTREE);
}

function drawNodes(qtree: Quadtree) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'blue';

  for (const childQ of qtree.nodes) {
    let { bounds } = childQ;
    ctx.strokeRect(bounds.posX, bounds.posY, bounds.width, bounds.height);
    drawNodes(childQ);
  }
}

function step(timestamp: number) {
  const deltaTime = FPS_COUNTER.getDeltaTimeInSeconds(timestamp); // TODO: should refactor delta time logic out of fps counter
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
  for (let i = 0; i < BOX_COUNT; i++) {
    createRandomBox();
  }

  window.requestAnimationFrame(step);
}

// I ended up doing ecs-style systems here out of habit, but for this little app,
//  iterating boxes directly and calling each function is probably more suitable
function appUpdate(deltaTime: number) {
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
