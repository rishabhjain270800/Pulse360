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

    // Pulse 360 Knowledge Layer (Central Hub)
    const knowledgeGroup = new THREE.Group();
    scene.add(knowledgeGroup);

    // Large outer translucent sphere
    const outerLayerGeo = new THREE.SphereGeometry(60, 32, 32);
    const outerLayerMat = new THREE.MeshBasicMaterial({
        color: 0x5d3fd3,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const outerLayer = new THREE.Mesh(outerLayerGeo, outerLayerMat);
    knowledgeGroup.add(outerLayer);

    // Inner pulsing wireframe
    const innerCoreGeo = new THREE.IcosahedronGeometry(40, 1);
    const innerCoreMat = new THREE.MeshBasicMaterial({
        color: 0xff6b00,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    knowledgeGroup.add(innerCore);

    // 3. Product Nodes (The Satellites)
    const nodes = [];
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const moduleData = [
        { name: "Brand Book", pos: { x: -120, y: 80, z: 50 }, color: 0x5d3fd3, id: 0 },
        { name: "Pulse Plan", pos: { x: -140, y: -60, z: -20 }, color: 0xff6b00, id: 1 },
        { name: "Pulse Scout", pos: { x: 120, y: 100, z: -50 }, color: 0x5d3fd3, id: 2 },
        { name: "Pulse Engage", pos: { x: 150, y: 0, z: 30 }, color: 0xff6b00, id: 3 },
        { name: "Pulse Shift", pos: { x: 100, y: -120, z: 80 }, color: 0x5d3fd3, id: 4 }
    ];

    const nodeGeo = new THREE.SphereGeometry(10, 32, 32);
    
    moduleData.forEach((data, index) => {
        const nodeMat = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.8
        });
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(data.pos.x, data.pos.y, data.pos.z);
        node.userData = { id: data.id, name: data.name };
        nodeGroup.add(node);
        nodes.push(node);

        // Visual ring
        const ringGeo = new THREE.RingGeometry(12, 14, 32);
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
    nodes.forEach(node => {
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(node.position);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.05
        });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
        connectionLines.push(line);
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
                knowledgeGroup.rotation.y = -self.progress * Math.PI * 0.5;
            }
        }
    });

    // 7. Render Loop
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        // Universe rotation
        starField.rotation.y += 0.0005;
        
        // Knowledge Core pulse
        const s = 1 + Math.sin(elapsed * 2) * 0.1;
        innerCore.scale.set(s, s, s);
        innerCore.rotation.x += 0.01;
        innerCore.rotation.z += 0.01;
        outerLayer.rotation.y -= 0.005;

        // Node floating
        nodes.forEach((node, i) => {
            node.position.y += Math.sin(elapsed + i) * 0.1;
            node.children[0].rotation.z += 0.01; // Rotate the ring
        });

        renderer.render(scene, camera);
    }
    animate();
});
