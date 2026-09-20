const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 368;

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function fitCanvas() {
  const scale = Math.max(
    1,
    Math.floor(Math.min(
      window.innerWidth / VIEW_WIDTH,
      window.innerHeight / VIEW_HEIGHT
    ))
  );
  canvas.style.width = `${VIEW_WIDTH * scale}px`;
  canvas.style.height = `${VIEW_HEIGHT * scale}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();
ctx.imageSmoothingEnabled = false;

// ------------------------------------------------------------------
// The fixed-timestep game loop
// ------------------------------------------------------------------

// One update takes exactly this much time. 60 updates per second.
const TIMESTEP = 1000 / 60;  // 16.666... milliseconds

// The bank account: leftover time in milliseconds.
let accumulator = 0;

// When the previous frame ran, in the same time base rAF gives us.
let lastTime = performance.now();

// --- A test ball so you can SEE the simulation ---
// Speeds are in pixels PER SECOND. That's the unit that makes
// frame-rate independence possible.
const ball1 = { x: 160, y: 90, vx: 120, vy: 90, size: 8 };
const ball2 = { x: 90, y: 160, vx: 240, vy: 180, size: 16 };

// --- On-screen stats so you can VERIFY the loop ---
let frameCount = 0;    // frames rendered since last stats refresh
let updateCount = 0;   // updates run since last stats refresh
let statsTimer = 0;    // ms accumulated toward the 1-second stats tick
let fpsDisplay = 0;
let upsDisplay = 0;

// The simulation. dt is ALWAYS exactly TIMESTEP/1000 seconds.
function update(dt: number) {
  updateCount++;

  moveBall(dt, ball1);
  moveBall(dt, ball2);
  
}

function moveBall(dt: number, ball: any)
{
  // Move: pixels/second * seconds = pixels this update.
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Bounce off the edges of the 320x180 world.
  if (ball.x < 0) {
    ball.x = 0;
    ball.vx = Math.abs(ball.vx);
  }
  if (ball.x + ball.size > VIEW_WIDTH) {
    ball.x = VIEW_WIDTH - ball.size;
    ball.vx = -Math.abs(ball.vx);
  }
  if (ball.y < 0) {
    ball.y = 0;
    ball.vy = Math.abs(ball.vy);
  }
  if (ball.y + ball.size > VIEW_HEIGHT) {
    ball.y = VIEW_HEIGHT - ball.size;
    ball.vy = -Math.abs(ball.vy);
  }
}

// The drawing. Runs once per screen frame, at any refresh rate.
function render() {
  frameCount++;

  ctx.fillStyle = '#1a1c2c';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  // Floor to integers so the ball stays on pixel boundaries.
  ctx.fillStyle = '#ffcd75';
  ctx.fillRect(Math.floor(ball1.x), Math.floor(ball1.y), ball1.size, ball1.size);

  ctx.fillStyle = '#93ff75';
  ctx.fillRect(Math.floor(ball2.x), Math.floor(ball2.y), ball2.size, ball2.size);

  // Stats line: rendered fps on the left, simulation updates/s on the right.
  ctx.fillStyle = '#3b4252';
  ctx.font = '8px monospace';
  ctx.fillText(`${fpsDisplay} fps`, 4, VIEW_HEIGHT - 6);
  ctx.fillText(`${upsDisplay} ups`, VIEW_WIDTH - 44, VIEW_HEIGHT - 6);
}

// The loop itself: the heart of the game.
function loop(currentTime: number) {
  // 1. How much real time passed since last frame? (milliseconds)
  let delta = currentTime - lastTime;
  lastTime = currentTime;

  // 2. Cap the delta. If the tab was backgrounded, delta could be
  //    5000ms. We don't want to run 300 catch-up updates — we want
  //    to drop the time and move on. 250ms is a generous cap.
  if (delta > 250) delta = 250;

  // 3. Deposit the time into the bank.
  accumulator += delta;

  // 4. Spend it in fixed chunks. Each chunk is one simulation step.
  //    The `safety` counter is the "spiral of death" guard, explained
  //    below.
  let safety = 5;
  while (accumulator >= TIMESTEP && safety > 0) {
    update(TIMESTEP / 1000);  // pass SECONDS, not milliseconds
    accumulator -= TIMESTEP;
    safety--;
  }

  // 5. Draw the current state. Once per frame, always.
  render();

  // 6. Refresh the on-screen stats once per second.
  statsTimer += delta;
  if (statsTimer >= 1000) {
    fpsDisplay = frameCount;
    upsDisplay = updateCount;
    frameCount = 0;
    updateCount = 0;
    statsTimer -= 1000;
  }

  // 7. Schedule the next frame.
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
