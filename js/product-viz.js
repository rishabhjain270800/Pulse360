document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector('#product-canvas');
    if (!canvas) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 300;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 2. Universe Elements
    
    // Star Field Background
    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 2000;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
        color: 0x5d3fd3,
        size: 2,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Pulse 360 Knowledge Layer (The Globe)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeRadius = 100;
    const globePointsCount = 6000;
    const globeGeometry = new THREE.BufferGeometry();
    const globePositions = new Float32Array(globePointsCount * 3);
    const globeColors = new Float32Array(globePointsCount * 3);
    
    const color1 = new THREE.Color(0xff6b00); // Orange
    const color2 = new THREE.Color(0x5d3fd3); // Purple

    for (let i = 0; i < globePointsCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / globePointsCount);
        const theta = Math.sqrt(globePointsCount * Math.PI) * phi;
        
        globePositions[i * 3] = globeRadius * Math.cos(theta) * Math.sin(phi);
        globePositions[i * 3 + 1] = globeRadius * Math.sin(theta) * Math.sin(phi);
        globePositions[i * 3 + 2] = globeRadius * Math.cos(phi);

        // Mix colors based on position
        const mixedColor = color1.clone().lerp(color2, Math.random() * 0.5);
        globeColors[i * 3] = mixedColor.r;
        globeColors[i * 3 + 1] = mixedColor.g;
        globeColors[i * 3 + 2] = mixedColor.b;
    }
    
    globeGeometry.setAttribute('position', new THREE.BufferAttribute(globePositions, 3));
    globeGeometry.setAttribute('color', new THREE.BufferAttribute(globeColors, 3));
    
    const globeMaterial = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    const globe = new THREE.Points(globeGeometry, globeMaterial);
    globeGroup.add(globe);

    // Double Core System
    const core1Geo = new THREE.IcosahedronGeometry(45, 2);
    const core1Mat = new THREE.MeshBasicMaterial({
        color: 0xff6b00,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const innerCore = new THREE.Mesh(core1Geo, core1Mat);
    globeGroup.add(innerCore);

    const core2Geo = new THREE.IcosahedronGeometry(35, 1);
    const core2Mat = new THREE.MeshBasicMaterial({
        color: 0x5d3fd3,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const innerCore2 = new THREE.Mesh(core2Geo, core2Mat);
    globeGroup.add(innerCore2);

    // 3. Product Nodes (The Satellites)
    const nodes = [];
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const moduleData = [
        { name: "Brand Book", color: 0x5d3fd3, id: 0 },
        { name: "Pulse Plan", color: 0xff6b00, id: 1 },
        { name: "Pulse Scout", color: 0x5d3fd3, id: 2 },
        { name: "Pulse Engage", color: 0xff6b00, id: 3 },
        { name: "Pulse Shift", color: 0x5d3fd3, id: 4 }
    ];

    const nodeGeo = new THREE.SphereGeometry(10, 32, 32);
    const orbitRadius = 250;

    moduleData.forEach((data, index) => {
        const angle = (index / moduleData.length) * Math.PI * 2;
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;
        const y = (Math.random() - 0.5) * 150;

        const nodeMat = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.8
        });
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(x, y, z);
        node.userData = { id: data.id, name: data.name };
        nodeGroup.add(node);
        nodes.push(node);

        // Visual ring
        const ringGeo = new THREE.RingGeometry(12, 15, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: data.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        node.add(ring);
    });

    // 4. Data Flow Lines
    const connectionLines = [];
    const flows = [];
    
    nodes.forEach(node => {
        // Line
        const points = [new THREE.Vector3(0, 0, 0), node.position];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.05
        });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
        connectionLines.push(line);

        // Flow particles
        const particleCount = 10;
        const particles = [];
        const pGeo = new THREE.SphereGeometry(1, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({ color: node.material.color, transparent: true, opacity: 0.6 });
        
        for(let i=0; i<particleCount; i++) {
            const p = new THREE.Mesh(pGeo, pMat);
            p.userData = { t: Math.random(), speed: 0.002 + Math.random() * 0.005 };
            scene.add(p);
            particles.push(p);
        }
        flows.push({ node, particles });
    });

    // 5. Interaction (Raycasting & GSAP)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDetailOpen = false;

    const detailPanels = document.querySelectorAll('.product-detail-panel');
    const closeButtons = document.querySelectorAll('.close-panel');

    function onMouseClick(event) {
        if (isDetailOpen) return;

        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodes);

        if (intersects.length > 0) {
            const clickedNode = intersects[0].object;
            openNode(clickedNode);
        }
    }

    function openNode(node) {
        isDetailOpen = true;
        const id = node.userData.id;
        
        // Camera Zoom Animation
        const targetPos = new THREE.Vector3();
        node.getWorldPosition(targetPos);
        
        gsap.to(camera.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z + 100,
            duration: 1.5,
            ease: "power3.inOut"
        });

        gsap.to(camera.lookAt, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 1.5
        });

        // Show Panel
        detailPanels[id].classList.add('active');
    }

    function closeAllPanels() {
        isDetailOpen = false;
        detailPanels.forEach(p => p.classList.remove('active'));

        // Reset Camera
        gsap.to(camera.position, {
            x: 0,
            y: 0,
            z: 300,
            duration: 1.5,
            ease: "power3.inOut"
        });
    }

    canvas.addEventListener('click', onMouseClick);
    closeButtons.forEach(btn => btn.addEventListener('click', closeAllPanels));

    // 6. Scroll Synergy
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
        trigger: ".modules-showcase",
        start: "top center",
        end: "bottom center",
        onUpdate: (self) => {
            if (!isDetailOpen) {
                nodeGroup.rotation.y = self.progress * Math.PI;
                globeGroup.rotation.y = -self.progress * Math.PI * 0.5;
            }
        }
    });

    // 7. Render Loop
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        // Universe rotation
        starField.rotation.y += 0.0002;
        
        // Globe rotation & core pulse
        globe.rotation.y += 0.002;
        const s = 1 + Math.sin(elapsed * 2) * 0.05;
        innerCore.scale.set(s, s, s);
        innerCore.rotation.x += 0.01;
        innerCore.rotation.z += 0.01;
        
        innerCore2.rotation.y -= 0.015;
        innerCore2.rotation.z += 0.01;

        // Data Flow Animation
        flows.forEach(flow => {
            flow.particles.forEach(p => {
                p.userData.t -= p.userData.speed;
                if (p.userData.t <= 0) p.userData.t = 1;
                
                // Interpolate position from node to globe center (0,0,0)
                p.position.lerpVectors(new THREE.Vector3(0,0,0), flow.node.position, p.userData.t);
                
                // Pulse opacity
                p.material.opacity = p.userData.t * 0.6;
            });
        });

        // Node floating
        nodes.forEach((node, i) => {
            node.position.y += Math.sin(elapsed + i) * 0.15;
            node.children[0].rotation.z += 0.01; // Rotate the ring
        });

        renderer.render(scene, camera);
    }
    animate();
});
