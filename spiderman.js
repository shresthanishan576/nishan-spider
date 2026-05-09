// ============================================
// SPIDER-MAN INTERACTIVE BACKGROUND
// Head tracks mouse, body spins on scroll
// ============================================

(function () {
  'use strict';

  const canvas = document.getElementById('spiderman-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  let mouseX = 0.5, mouseY = 0.5; // normalized 0-1
  let scrollProgress = 0;
  let targetHeadAngle = 0, currentHeadAngle = 0;
  let targetBodySpin = 0, currentBodySpin = 0;
  let time = 0;

  // Web particles
  const webParticles = [];
  const WEB_COUNT = 25;

  // City buildings
  const buildings = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    generateBuildings();
  }

  function generateBuildings() {
    buildings.length = 0;
    const count = Math.floor(W / 40) + 5;
    let x = -20;
    for (let i = 0; i < count; i++) {
      const w = 20 + Math.random() * 50;
      const h = 40 + Math.random() * 180;
      buildings.push({ x, w, h, windows: Math.floor(h / 20) });
      x += w + Math.random() * 10;
    }
  }

  // Web particle class
  class WebParticle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.length = 20 + Math.random() * 80;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = 0.1 + Math.random() * 0.3;
      this.rotSpeed = (Math.random() - 0.5) * 0.01;
      this.opacity = 0.03 + Math.random() * 0.08;
      this.drift = (Math.random() - 0.5) * 0.5;
    }
    update() {
      this.y += this.speed;
      this.x += this.drift;
      this.angle += this.rotSpeed;
      if (this.y > H + 50 || this.x < -50 || this.x > W + 50) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.strokeStyle = `rgba(192, 132, 252, ${this.opacity})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-this.length / 2, 0);
      ctx.lineTo(this.length / 2, 0);
      // small web cross
      const segs = 3;
      for (let i = 0; i < segs; i++) {
        const t = (i + 1) / (segs + 1);
        const px = -this.length / 2 + this.length * t;
        ctx.moveTo(px, -4);
        ctx.lineTo(px, 4);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // Init particles
  function initParticles() {
    webParticles.length = 0;
    for (let i = 0; i < WEB_COUNT; i++) webParticles.push(new WebParticle());
  }

  // Draw city skyline
  function drawSkyline() {
    ctx.save();
    const baseY = H;
    ctx.fillStyle = 'rgba(8, 6, 18, 0.6)';
    buildings.forEach(b => {
      ctx.fillRect(b.x, baseY - b.h, b.w, b.h);
      // windows
      ctx.fillStyle = 'rgba(192, 132, 252, 0.06)';
      for (let row = 0; row < b.windows; row++) {
        for (let col = 0; col < Math.floor(b.w / 10); col++) {
          if (Math.random() > 0.4) {
            ctx.fillRect(b.x + 4 + col * 10, baseY - b.h + 6 + row * 20, 5, 8);
          }
        }
      }
      ctx.fillStyle = 'rgba(8, 6, 18, 0.6)';
    });
    ctx.restore();
  }

  // Draw web network in background
  function drawWebNetwork() {
    ctx.save();
    const cx = W * 0.75;
    const cy = H * 0.35;
    const rings = 6;
    const spokes = 12;
    const maxR = Math.min(W, H) * 0.35;

    ctx.strokeStyle = 'rgba(192, 132, 252, 0.04)';
    ctx.lineWidth = 0.5;

    // radial spokes
    for (let s = 0; s < spokes; s++) {
      const angle = (s / spokes) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.stroke();
    }

    // concentric rings (spiral web)
    for (let r = 1; r <= rings; r++) {
      const radius = (r / rings) * maxR;
      ctx.beginPath();
      for (let s = 0; s <= spokes; s++) {
        const angle = (s / spokes) * Math.PI * 2;
        const wobble = Math.sin(angle * 3 + time * 0.5) * 5;
        const px = cx + Math.cos(angle) * (radius + wobble);
        const py = cy + Math.sin(angle) * (radius + wobble);
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // =============================================
  // SPIDER-MAN CHARACTER (Canvas drawn)
  // =============================================
  function drawSpiderMan(cx, cy, scale, headAngle, bodySpin) {
    ctx.save();
    ctx.translate(cx, cy);

    // Apply body spin (rotation around vertical axis simulated via scaleX)
    const spinAngle = bodySpin * Math.PI * 2; // full 360
    const scaleX = Math.cos(spinAngle);
    const absScaleX = Math.abs(scaleX);

    ctx.scale(scale * (scaleX < 0 ? -1 : 1), scale);
    const flatness = Math.max(absScaleX, 0.15);
    ctx.scale(flatness, 1);

    // Glow effect
    ctx.shadowColor = 'rgba(192, 132, 252, 0.3)';
    ctx.shadowBlur = 40;

    // === BODY ===
    // Legs
    const legSwing = Math.sin(time * 2) * 5;
    drawLeg(ctx, -15, 50, -25, 100, -20, 140, legSwing);
    drawLeg(ctx, 15, 50, 25, 100, 20, 140, -legSwing);

    // Torso
    ctx.fillStyle = createSpiderSuitGradient(ctx, 0, -40, 0, 60);
    ctx.beginPath();
    ctx.moveTo(-25, -35);
    ctx.quadraticCurveTo(-30, 10, -20, 50);
    ctx.lineTo(20, 50);
    ctx.quadraticCurveTo(30, 10, 25, -35);
    ctx.closePath();
    ctx.fill();

    // Spider emblem on chest
    drawSpiderEmblem(ctx, 0, 5);

    // Web pattern on torso
    drawWebPattern(ctx, 0, 5, 25, 40);

    // Arms
    const armSwing = Math.sin(time * 1.5) * 3;
    drawArm(ctx, -25, -20, -50, 10, -60, 40, armSwing, false);
    drawArm(ctx, 25, -20, 50, 10, 60, 40, -armSwing, true);

    // === HEAD ===
    ctx.save();
    ctx.translate(0, -55);
    ctx.rotate(headAngle * 0.3); // subtle head rotation

    // Head shape
    const headGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 35);
    headGrad.addColorStop(0, '#dc2626');
    headGrad.addColorStop(0.7, '#b91c1c');
    headGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Web lines on mask
    drawMaskWebLines(ctx, 0, 0, 28);

    // Eyes
    const eyeOffsetX = headAngle * 8;
    const eyeOffsetY = (mouseY - 0.5) * 6;
    drawSpiderEye(ctx, -12 + eyeOffsetX * 0.3, -4 + eyeOffsetY * 0.3, 14, 10, false, absScaleX);
    drawSpiderEye(ctx, 12 + eyeOffsetX * 0.3, -4 + eyeOffsetY * 0.3, 14, 10, true, absScaleX);

    ctx.restore(); // head transform

    ctx.restore(); // main transform
  }

  function createSpiderSuitGradient(ctx, x1, y1, x2, y2) {
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, '#dc2626');
    grad.addColorStop(0.3, '#b91c1c');
    grad.addColorStop(0.6, '#1e3a8a');
    grad.addColorStop(1, '#1e40af');
    return grad;
  }

  function drawLeg(ctx, x1, y1, x2, y2, x3, y3, swing) {
    ctx.save();
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2 + swing, y2, x3 + swing * 0.5, y3);
    ctx.stroke();

    // Boot (red)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(x3 + swing * 0.5, y3, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawArm(ctx, x1, y1, x2, y2, x3, y3, swing, isRight) {
    ctx.save();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2, y2 + swing, x3, y3 + swing * 0.5);
    ctx.stroke();

    // Hand/Glove
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(x3, y3 + swing * 0.5, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Web shooter gesture (index + pinky out)
    const handX = x3;
    const handY = y3 + swing * 0.5;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    const dir = isRight ? 1 : -1;
    // Index finger
    ctx.beginPath();
    ctx.moveTo(handX + dir * 5, handY - 3);
    ctx.lineTo(handX + dir * 14, handY - 8);
    ctx.stroke();
    // Pinky
    ctx.beginPath();
    ctx.moveTo(handX + dir * 5, handY + 3);
    ctx.lineTo(handX + dir * 14, handY + 6);
    ctx.stroke();

    ctx.restore();
  }

  function drawSpiderEmblem(ctx, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';

    // Spider body
    ctx.beginPath();
    ctx.ellipse(0, -3, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 5, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spider legs (4 on each side)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 1.2;
    const legs = [
      [-4, -4, -14, -12], [-4, -1, -16, -4], [-4, 3, -15, 8], [-4, 6, -12, 16],
      [4, -4, 14, -12], [4, -1, 16, -4], [4, 3, 15, 8], [4, 6, 12, 16]
    ];
    legs.forEach(([sx, sy, ex, ey]) => {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + (ex - sx) * 0.5, sy, ex, ey);
      ctx.stroke();
    });

    ctx.restore();
  }

  function drawWebPattern(ctx, cx, cy, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 0.5;

    // Horizontal web lines on suit
    for (let y = -h; y < h; y += 8) {
      ctx.beginPath();
      const wAtY = w * (1 - Math.abs(y) / (h * 1.5));
      if (wAtY > 0) {
        ctx.moveTo(cx - wAtY, cy + y);
        ctx.lineTo(cx + wAtY, cy + y);
        ctx.stroke();
      }
    }

    // Vertical web lines on suit
    for (let x = -w; x <= w; x += 8) {
      ctx.beginPath();
      ctx.moveTo(cx + x, cy - h * 0.8);
      ctx.lineTo(cx + x, cy + h * 0.8);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawMaskWebLines(ctx, cx, cy, radius) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 0.6;

    // Radial lines from center of face
    const spokes = 10;
    for (let i = 0; i < spokes; i++) {
      const angle = (i / spokes) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 1.1);
      ctx.stroke();
    }

    // Concentric web rings
    for (let r = 6; r < radius; r += 6) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 1.1, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawSpiderEye(ctx, cx, cy, w, h, mirror, flatness) {
    ctx.save();
    ctx.translate(cx, cy);
    if (mirror) ctx.scale(-1, 1);

    // Eye white (angular Spider-Man eye shape)
    const eyeW = w * Math.max(flatness, 0.4);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-eyeW * 0.3, -h * 0.6);
    ctx.lineTo(eyeW * 0.5, -h * 0.4);
    ctx.lineTo(eyeW * 0.4, h * 0.5);
    ctx.lineTo(-eyeW * 0.5, h * 0.3);
    ctx.closePath();
    ctx.fill();

    // Eye border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Draw web strings shooting from hands
  function drawWebStrings(cx, cy, scale) {
    ctx.save();
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.08)';
    ctx.lineWidth = 0.8;

    // Web from right hand to top-right corner
    const handRX = cx + 60 * scale;
    const handRY = cy + 40 * scale;
    ctx.beginPath();
    ctx.moveTo(handRX, handRY);
    ctx.quadraticCurveTo(W * 0.8, H * 0.1, W - 20, 20);
    ctx.stroke();

    // Web from left hand to top-left
    const handLX = cx - 60 * scale;
    const handLY = cy + 40 * scale;
    ctx.beginPath();
    ctx.moveTo(handLX, handLY);
    ctx.quadraticCurveTo(W * 0.3, H * 0.15, 50, 50);
    ctx.stroke();

    ctx.restore();
  }

  // =============================================
  // ANIMATION LOOP
  // =============================================
  function animate() {
    time += 0.016;
    ctx.clearRect(0, 0, W, H);

    // Update head angle (lerp toward mouse)
    targetHeadAngle = (mouseX - 0.5) * 2; // -1 to 1
    currentHeadAngle += (targetHeadAngle - currentHeadAngle) * 0.08;

    // Update body spin (lerp toward scroll progress)
    targetBodySpin = scrollProgress;
    currentBodySpin += (targetBodySpin - currentBodySpin) * 0.05;

    // Draw background layers
    drawSkyline();
    drawWebNetwork();

    // Draw web particles
    webParticles.forEach(p => { p.update(); p.draw(); });

    // Draw Spider-Man
    const spiderX = W * 0.78;
    const spiderY = H * 0.42;
    const spiderScale = Math.min(W, H) / 500;

    drawWebStrings(spiderX, spiderY, spiderScale);
    drawSpiderMan(spiderX, spiderY, spiderScale, currentHeadAngle, currentBodySpin);

    requestAnimationFrame(animate);
  }

  // =============================================
  // EVENT LISTENERS
  // =============================================
  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / W;
    mouseY = e.clientY / H;
  });

  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = docH > 0 ? window.scrollY / docH : 0;
  });

  // Touch support
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX / W;
      mouseY = e.touches[0].clientY / H;
    }
  });

  // Init
  resize();
  initParticles();
  animate();

})();
