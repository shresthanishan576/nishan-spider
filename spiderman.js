// ============================================
// 3D SPIDER-MAN — Three.js Interactive Background
// Head tracks mouse, body spins on scroll
// ============================================
(function () {
  'use strict';

  // Load Three.js from CDN
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = init;
  document.head.appendChild(script);

  function init() {
    const container = document.getElementById('spiderman-canvas');
    if (!container) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 6);

    const renderer = new THREE.WebGLRenderer({ canvas: container, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xc084fc, 1.2);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x22d3ee, 0.8);
    rimLight.position.set(-5, 3, -3);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0xf472b6, 0.6, 15);
    pointLight.position.set(0, -2, 3);
    scene.add(pointLight);

    // Subtle ground glow
    const groundLight = new THREE.PointLight(0xc084fc, 0.4, 10);
    groundLight.position.set(0, -4, 2);
    scene.add(groundLight);

    // --- MATERIALS ---
    const redMat = new THREE.MeshPhongMaterial({
      color: 0xcc1111,
      specular: 0xff4444,
      shininess: 80,
      emissive: 0x220000
    });
    const darkRedMat = new THREE.MeshPhongMaterial({
      color: 0x991111,
      specular: 0xcc2222,
      shininess: 60,
      emissive: 0x110000
    });
    const blueMat = new THREE.MeshPhongMaterial({
      color: 0x1133aa,
      specular: 0x2244dd,
      shininess: 70,
      emissive: 0x000822
    });
    const darkBlueMat = new THREE.MeshPhongMaterial({
      color: 0x0d2266,
      specular: 0x1a3399,
      shininess: 50,
      emissive: 0x000411
    });
    const eyeMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xccccff,
      emissiveIntensity: 0.5,
      specular: 0xffffff,
      shininess: 120
    });
    const eyeBorderMat = new THREE.MeshPhongMaterial({
      color: 0x111111,
      specular: 0x222222,
      shininess: 20
    });
    const blackMat = new THREE.MeshPhongMaterial({
      color: 0x111111,
      specular: 0x333333,
      shininess: 30
    });
    const webMat = new THREE.LineBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.5 });
    const bgWebMat = new THREE.LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.06 });

    // --- BUILD SPIDER-MAN ---
    const spiderGroup = new THREE.Group();
    const bodyGroup = new THREE.Group();
    const headGroup = new THREE.Group();

    // HEAD
    const headGeo = new THREE.SphereGeometry(0.42, 32, 32);
    headGeo.scale(1, 1.1, 1);
    const head = new THREE.Mesh(headGeo, redMat);
    head.castShadow = true;
    headGroup.add(head);

    // Web lines on head
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const pts = [];
      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const r = 0.43;
        const phi = t * Math.PI;
        const x = r * Math.sin(phi) * Math.cos(angle);
        const y = r * Math.cos(phi) * 1.1;
        const z = r * Math.sin(phi) * Math.sin(angle);
        pts.push(new THREE.Vector3(x, y, z));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      headGroup.add(new THREE.Line(lineGeo, webMat));
    }
    // Concentric rings on head
    for (let ring = 1; ring <= 5; ring++) {
      const pts = [];
      const phi = (ring / 6) * Math.PI;
      const r = 0.43;
      for (let j = 0; j <= 32; j++) {
        const theta = (j / 32) * Math.PI * 2;
        pts.push(new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi) * 1.1,
          r * Math.sin(phi) * Math.sin(theta)
        ));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      headGroup.add(new THREE.Line(lineGeo, webMat));
    }

    // EYES
    function createEye(xPos) {
      const eyeGroup = new THREE.Group();
      // Eye border (black ring)
      const borderGeo = new THREE.TorusGeometry(0.13, 0.02, 8, 16);
      const border = new THREE.Mesh(borderGeo, eyeBorderMat);
      border.scale.set(0.8, 1.2, 1);
      eyeGroup.add(border);
      // Eye white lens
      const lensGeo = new THREE.SphereGeometry(0.12, 16, 16);
      lensGeo.scale(0.8, 1.2, 0.3);
      const lens = new THREE.Mesh(lensGeo, eyeMat);
      lens.position.z = 0.02;
      eyeGroup.add(lens);
      eyeGroup.position.set(xPos, 0.08, 0.36);
      // Tilt eyes outward
      eyeGroup.rotation.z = xPos > 0 ? -0.15 : 0.15;
      eyeGroup.rotation.y = xPos > 0 ? 0.2 : -0.2;
      return eyeGroup;
    }
    const leftEye = createEye(-0.15);
    const rightEye = createEye(0.15);
    headGroup.add(leftEye);
    headGroup.add(rightEye);

    headGroup.position.y = 1.05;
    bodyGroup.add(headGroup);

    // NECK
    const neckGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.15, 16);
    const neck = new THREE.Mesh(neckGeo, redMat);
    neck.position.y = 0.75;
    bodyGroup.add(neck);

    // TORSO (upper)
    const torsoGeo = new THREE.CylinderGeometry(0.22, 0.35, 0.7, 16);
    const torso = new THREE.Mesh(torsoGeo, redMat);
    torso.position.y = 0.35;
    torso.castShadow = true;
    bodyGroup.add(torso);

    // TORSO (lower / waist)
    const waistGeo = new THREE.CylinderGeometry(0.35, 0.28, 0.35, 16);
    const waist = new THREE.Mesh(waistGeo, blueMat);
    waist.position.y = -0.15;
    waist.castShadow = true;
    bodyGroup.add(waist);

    // Spider emblem on chest
    const emblemGeo = new THREE.SphereGeometry(0.06, 8, 8);
    emblemGeo.scale(1, 1.5, 0.3);
    const emblem = new THREE.Mesh(emblemGeo, blackMat);
    emblem.position.set(0, 0.4, 0.3);
    bodyGroup.add(emblem);
    // Emblem legs
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const legPts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * 0.18, Math.sin(angle) * 0.15, 0.02)
      ];
      const legLine = new THREE.BufferGeometry().setFromPoints(legPts);
      const leg = new THREE.Line(legLine, new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }));
      leg.position.set(0, 0.4, 0.3);
      bodyGroup.add(leg);
    }

    // ARMS
    function createArm(side) {
      const armGroup = new THREE.Group();
      // Shoulder
      const shoulderGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const shoulder = new THREE.Mesh(shoulderGeo, redMat);
      armGroup.add(shoulder);
      // Upper arm
      const upperGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.5, 12);
      const upper = new THREE.Mesh(upperGeo, redMat);
      upper.position.y = -0.3;
      upper.castShadow = true;
      armGroup.add(upper);
      // Elbow
      const elbowGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const elbow = new THREE.Mesh(elbowGeo, redMat);
      elbow.position.y = -0.55;
      armGroup.add(elbow);
      // Forearm
      const foreGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.45, 12);
      const forearm = new THREE.Mesh(foreGeo, redMat);
      forearm.position.y = -0.82;
      forearm.rotation.x = side === 1 ? 0.3 : -0.3;
      forearm.castShadow = true;
      armGroup.add(forearm);
      // Hand
      const handGeo = new THREE.SphereGeometry(0.07, 8, 8);
      const hand = new THREE.Mesh(handGeo, redMat);
      hand.position.y = -1.05;
      armGroup.add(hand);
      // Web shooter gesture - fingers
      const fingerGeo = new THREE.CylinderGeometry(0.015, 0.01, 0.12, 6);
      const index = new THREE.Mesh(fingerGeo, redMat);
      index.position.set(0.03, -1.14, 0.02);
      index.rotation.x = 0.3;
      armGroup.add(index);
      const pinky = new THREE.Mesh(fingerGeo.clone(), redMat);
      pinky.position.set(-0.03, -1.14, 0.02);
      pinky.rotation.x = 0.3;
      armGroup.add(pinky);

      armGroup.position.set(side * 0.42, 0.55, 0);
      armGroup.rotation.z = side * 0.25;
      return armGroup;
    }
    const leftArm = createArm(-1);
    const rightArm = createArm(1);
    bodyGroup.add(leftArm);
    bodyGroup.add(rightArm);

    // LEGS
    function createLeg(side) {
      const legGroup = new THREE.Group();
      // Hip joint
      const hipGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const hip = new THREE.Mesh(hipGeo, blueMat);
      legGroup.add(hip);
      // Upper leg
      const upperGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.6, 12);
      const upper = new THREE.Mesh(upperGeo, blueMat);
      upper.position.y = -0.35;
      upper.castShadow = true;
      legGroup.add(upper);
      // Knee
      const kneeGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const knee = new THREE.Mesh(kneeGeo, darkBlueMat);
      knee.position.y = -0.65;
      legGroup.add(knee);
      // Lower leg
      const lowerGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.55, 12);
      const lower = new THREE.Mesh(lowerGeo, blueMat);
      lower.position.y = -0.95;
      lower.castShadow = true;
      legGroup.add(lower);
      // Boot
      const bootGeo = new THREE.CylinderGeometry(0.07, 0.065, 0.2, 12);
      const boot = new THREE.Mesh(bootGeo, redMat);
      boot.position.y = -1.25;
      legGroup.add(boot);
      // Foot
      const footGeo = new THREE.BoxGeometry(0.1, 0.06, 0.18);
      const foot = new THREE.Mesh(footGeo, redMat);
      foot.position.set(0, -1.38, 0.04);
      legGroup.add(foot);

      legGroup.position.set(side * 0.18, -0.38, 0);
      return legGroup;
    }
    const leftLeg = createLeg(-1);
    const rightLeg = createLeg(1);
    bodyGroup.add(leftLeg);
    bodyGroup.add(rightLeg);

    spiderGroup.add(bodyGroup);
    spiderGroup.position.set(2.2, -0.3, 0);
    scene.add(spiderGroup);

    // --- BACKGROUND WEB NETWORK ---
    const webGroup = new THREE.Group();
    const webCenter = new THREE.Vector3(-1, 1, -4);
    const spokes = 16;
    const rings = 8;
    const maxR = 4;
    for (let s = 0; s < spokes; s++) {
      const angle = (s / spokes) * Math.PI * 2;
      const pts = [webCenter.clone(), new THREE.Vector3(
        webCenter.x + Math.cos(angle) * maxR,
        webCenter.y + Math.sin(angle) * maxR,
        webCenter.z
      )];
      webGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), bgWebMat));
    }
    for (let r = 1; r <= rings; r++) {
      const pts = [];
      const radius = (r / rings) * maxR;
      for (let s = 0; s <= 64; s++) {
        const angle = (s / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(
          webCenter.x + Math.cos(angle) * radius,
          webCenter.y + Math.sin(angle) * radius,
          webCenter.z + Math.sin(angle * 3) * 0.1
        ));
      }
      webGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), bgWebMat));
    }
    scene.add(webGroup);

    // --- WEB STRING FROM HAND ---
    const webStringPts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(-4, 4, -2)];
    const webStringGeo = new THREE.BufferGeometry().setFromPoints(webStringPts);
    const webStringMat = new THREE.LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.15 });
    const webString = new THREE.Line(webStringGeo, webStringMat);
    webString.position.set(2.2, -0.3, 0);
    scene.add(webString);

    // --- FLOATING PARTICLES ---
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = [];
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
      particleSpeeds.push({ x: (Math.random() - 0.5) * 0.005, y: (Math.random() - 0.5) * 0.005, z: (Math.random() - 0.5) * 0.003 });
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xc084fc, size: 0.03, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- STATE ---
    let mouseX = 0, mouseY = 0;
    let targetHeadRotX = 0, targetHeadRotY = 0;
    let currentHeadRotX = 0, currentHeadRotY = 0;
    let scrollProgress = 0;
    let currentBodyRot = 0;
    let time = 0;

    // --- EVENTS ---
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    });
    window.addEventListener('scroll', () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = docH > 0 ? window.scrollY / docH : 0;
    });
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- ANIMATE ---
    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;

      // Head tracking (follows mouse)
      targetHeadRotY = mouseX * 0.6;
      targetHeadRotX = -mouseY * 0.4;
      currentHeadRotY += (targetHeadRotY - currentHeadRotY) * 0.06;
      currentHeadRotX += (targetHeadRotX - currentHeadRotX) * 0.06;
      headGroup.rotation.y = currentHeadRotY;
      headGroup.rotation.x = currentHeadRotX;

      // Eye tracking (extra subtle shift)
      leftEye.rotation.y = -0.2 + currentHeadRotY * 0.3;
      rightEye.rotation.y = 0.2 + currentHeadRotY * 0.3;

      // Body spin on scroll
      const targetRot = scrollProgress * Math.PI * 2;
      currentBodyRot += (targetRot - currentBodyRot) * 0.04;
      bodyGroup.rotation.y = currentBodyRot;

      // Subtle breathing / idle animation
      const breathe = Math.sin(time * 1.5) * 0.015;
      bodyGroup.position.y = breathe;
      bodyGroup.rotation.z = Math.sin(time * 0.8) * 0.02;

      // Arm sway
      leftArm.rotation.x = Math.sin(time * 1.2) * 0.08;
      rightArm.rotation.x = Math.sin(time * 1.2 + 1) * 0.08;

      // Leg sway
      leftLeg.rotation.x = Math.sin(time * 1.0) * 0.04;
      rightLeg.rotation.x = Math.sin(time * 1.0 + Math.PI) * 0.04;

      // Update web string endpoint
      const positions = webString.geometry.attributes.position;
      if (positions) {
        positions.setXYZ(0, rightArm.position.x + 2.2, rightArm.position.y + 0.2, 0.5);
        positions.needsUpdate = true;
      }

      // Floating particles
      const posArr = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3] += particleSpeeds[i].x;
        posArr[i * 3 + 1] += particleSpeeds[i].y;
        posArr[i * 3 + 2] += particleSpeeds[i].z;
        if (Math.abs(posArr[i * 3]) > 6) particleSpeeds[i].x *= -1;
        if (Math.abs(posArr[i * 3 + 1]) > 4) particleSpeeds[i].y *= -1;
        if (Math.abs(posArr[i * 3 + 2]) > 3) particleSpeeds[i].z *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Web network subtle rotation
      webGroup.rotation.z = time * 0.02;

      // Light animation
      pointLight.position.x = Math.sin(time * 0.5) * 2;
      pointLight.position.z = 3 + Math.cos(time * 0.3);

      renderer.render(scene, camera);
    }

    animate();
  }
})();
