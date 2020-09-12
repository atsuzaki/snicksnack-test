// UI controller

let fpsCount: HTMLLabelElement;

function setupUIhandles() {
  let speedInput = document.getElementById('speedInput') as HTMLInputElement;
  let countInput = document.getElementById('countInput') as HTMLInputElement;
  let visualizeQtreeCheckbox = document.getElementById(
    'visualizeQuadtreeCheckbox',
  ) as HTMLInputElement;
  fpsCount = document.getElementById('fpsCount') as HTMLLabelElement;

  speedInput.value = String(SPEED);
  speedInput.onchange = onSpeedChange;

  countInput.value = String(BOX_COUNT);
  countInput.onchange = onCountChange;

  visualizeQtreeCheckbox.checked = VISUALIZE_QUADTREE;
  visualizeQtreeCheckbox.onchange = onVisualizeQuadtreeChange;
}

function onSpeedChange(event: any) {
  SPEED = event.target.value;
}

function onCountChange(event: any) {
  let newCount = event.target.value;
  let difference = newCount - BOX_COUNT;

  if (difference < 0) {
    for (let i = 0; i < Math.abs(difference); i++) {
      deleteABox();
    }
  } else {
    for (let i = 0; i < difference; i++) {
      createRandomBox();
    }
  }

  BOX_COUNT = newCount;
}

function onVisualizeQuadtreeChange(event: any) {
  VISUALIZE_QUADTREE = event.target.checked;
}

function updateFPSCounter(fpsCounter: FPSCounter) {
  fpsCount.innerText = fpsCounter.getAverageFPS();
}
