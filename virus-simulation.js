// ===== VIRUS SIMULATION =====

const virusCanvas = document.getElementById('virusCanvas');
const virusCtx = virusCanvas.getContext('2d');
const virusBtn = document.getElementById('infectBtn');

// Canvas setup
virusCanvas.width = 600;
virusCanvas.height = 400;

// Configuration
const DEVICE_RADIUS = 12;
const CONNECTION_DISTANCE = 90;
const INFECTION_TIME = 20000; // 20 seconds

let virusDevices = [];
let virusStartTime = null;
let virusAnimating = false;
let virusZoom = 1;

// Device class
class VirusDevice {
  constructor(x, y, centerDevice = false) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
    this.infected = centerDevice;
    this.radius = DEVICE_RADIUS;
  }

  update(w, h) {
    // Bounce
    if (this.x < this.radius) { this.vx = Math.abs(this.vx); }
    if (this.x > w - this.radius) { this.vx = -Math.abs(this.vx); }
    if (this.y < this.radius) { this.vy = Math.abs(this.vy); }
    if (this.y > h - this.radius) { this.vy = -Math.abs(this.vy); }

    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.99;
    this.vy *= 0.99;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    
    if (this.infected) {
      ctx.fillStyle = '#ff3333';
      ctx.fill();
      ctx.strokeStyle = '#ff6666';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// Initialize
function virusInit() {
  virusDevices = [new VirusDevice(virusCanvas.width / 2, virusCanvas.height / 2, true)];
  virusZoom = 1;
}

// Main drawing function
function virusDraw() {
  // Clear
  virusCtx.fillStyle = 'rgba(15, 0, 8, 0.95)';
  virusCtx.fillRect(0, 0, virusCanvas.width, virusCanvas.height);

  // Draw connections
  for (let i = 0; i < virusDevices.length; i++) {
    for (let j = i + 1; j < virusDevices.length; j++) {
      const dx = virusDevices[i].x - virusDevices[j].x;
      const dy = virusDevices[i].y - virusDevices[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < CONNECTION_DISTANCE) {
        const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.2;
        virusCtx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
        virusCtx.lineWidth = 1;
        virusCtx.beginPath();
        virusCtx.moveTo(virusDevices[i].x, virusDevices[i].y);
        virusCtx.lineTo(virusDevices[j].x, virusDevices[j].y);
        virusCtx.stroke();
      }
    }
  }

  // Draw devices
  for (const device of virusDevices) {
    device.draw(virusCtx);
  }

  if (!virusAnimating) {
    requestAnimationFrame(virusDraw);
  }
}

// Animation loop
function virusAnimate() {
  const elapsed = Date.now() - virusStartTime;
  
  // Add devices gradually
  const targetCount = Math.floor(3 + (elapsed / INFECTION_TIME) * 97);
  while (virusDevices.length < targetCount) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 180;
    const x = virusCanvas.width / 2 + Math.cos(angle) * dist;
    const y = virusCanvas.height / 2 + Math.sin(angle) * dist;
    virusDevices.push(new VirusDevice(x, y, false));
  }

  // Spread infection
  for (let i = 0; i < virusDevices.length; i++) {
    if (!virusDevices[i].infected) {
      for (let j = 0; j < virusDevices.length; j++) {
        if (virusDevices[j].infected) {
          const dx = virusDevices[i].x - virusDevices[j].x;
          const dy = virusDevices[i].y - virusDevices[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < CONNECTION_DISTANCE) {
            const chance = (1 - dist / CONNECTION_DISTANCE) * 0.04;
            if (Math.random() < chance) {
              virusDevices[i].infected = true;
            }
          }
        }
      }
    }
  }

  // Update devices
  for (const device of virusDevices) {
    device.update(virusCanvas.width, virusCanvas.height);
  }

  // Zoom out
  const zoomElapsed = Math.max(0, elapsed - 500);
  const zoomDuration = 2000;
  const zoomProgress = Math.min(zoomElapsed / zoomDuration, 1);
  virusZoom = 1 + zoomProgress * 3;

  // Draw
  virusCtx.fillStyle = 'rgba(15, 0, 8, 0.95)';
  virusCtx.fillRect(0, 0, virusCanvas.width, virusCanvas.height);

  virusCtx.save();
  virusCtx.translate(virusCanvas.width / 2, virusCanvas.height / 2);
  virusCtx.scale(1 / virusZoom, 1 / virusZoom);
  virusCtx.translate(-virusCanvas.width / 2, -virusCanvas.height / 2);

  // Draw connections
  for (let i = 0; i < virusDevices.length; i++) {
    for (let j = i + 1; j < virusDevices.length; j++) {
      const dx = virusDevices[i].x - virusDevices[j].x;
      const dy = virusDevices[i].y - virusDevices[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < CONNECTION_DISTANCE) {
        const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.3;
        virusCtx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
        virusCtx.lineWidth = 1.5;
        virusCtx.beginPath();
        virusCtx.moveTo(virusDevices[i].x, virusDevices[i].y);
        virusCtx.lineTo(virusDevices[j].x, virusDevices[j].y);
        virusCtx.stroke();
      }
    }
  }

  // Draw devices
  for (const device of virusDevices) {
    device.draw(virusCtx);
  }

  virusCtx.restore();

  // Stop after 20 seconds
  if (elapsed >= INFECTION_TIME) {
    virusAnimating = false;
    virusBtn.disabled = false;
    virusBtn.classList.remove('fadeout');
    return;
  }

  requestAnimationFrame(virusAnimate);
}

// Button handler
if (virusBtn) {
  virusBtn.addEventListener('click', function() {
    if (virusAnimating) return;
    
    virusAnimating = true;
    virusStartTime = Date.now();
    virusBtn.classList.add('fadeout');
    virusBtn.disabled = true;
    
    virusAnimate();
  });
}

// Initialize
virusInit();
virusDraw();
