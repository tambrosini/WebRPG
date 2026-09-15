// The internal resolution. This is your game world's resolution.
// Every coordinate in your game is a pixel of THIS buffer.
const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Compute the largest whole-number scale that fits the window,
// and set the canvas's CSS size to match.
function fitCanvas() {
  // How many whole 320px-wide columns fit? How many 180px rows?
  // Take the smaller of the two so the whole canvas fits.
  const scale = Math.max(
    1,
    Math.floor(Math.min(
      window.innerWidth / VIEW_WIDTH,
      window.innerHeight / VIEW_HEIGHT
    ))
  );
  // Set the CSS size. The buffer stays 320x180; only the zoom changes.
  canvas.style.width = `${VIEW_WIDTH * scale}px`;
  canvas.style.height = `${VIEW_HEIGHT * scale}px`;
}

// Re-fit whenever the window is resized.
window.addEventListener('resize', fitCanvas);
fitCanvas(); // and once now, on load

// Turn off the browser's image smoothing. Without this, any time you
// draw an image at a non-1:1 size, the browser blurs it. Pixel art
// must never be blurred.
ctx.imageSmoothingEnabled = false;

function frame() {
  // Clear the buffer.
  ctx.fillStyle = '#1a1c2c';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  // TEST PATTERN: a 16x16 checkerboard in the top-left corner.
  // If your scaling is right, every square is a crisp block of
  // identical monitor pixels. If you see fuzzy edges, scaling is wrong.
  for (let y = 0; y < 16; y += 8) {
    for (let x = 0; x < 16; x += 8) {
      ctx.fillStyle = (x / 8 + y / 8) % 2 === 0 ? '#38b764' : '#2a9d5c';
      ctx.fillRect(x, y, 8, 8);
    }
  }

  // A single 1x1 pixel. At 4x scale it should be a perfect 4x4 square.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(40, 40, 1, 1);

  // A 16x16 "sprite" outline to check that 16px units stay clean.
  ctx.strokeStyle = '#ffcd75';
  ctx.strokeRect(64.5, 64.5, 16, 16);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
