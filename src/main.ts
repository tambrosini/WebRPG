const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function frame() {
  ctx.fillStyle = '#1a1c2c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
