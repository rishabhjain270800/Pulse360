document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector('#product-canvas');
    if (!canvas) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 150;

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

    // 2. Objects Creation
    
    // Pulse Core (A group of rotating geometric wireframes)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeometry = new THREE.IcosahedronGeometry(20, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x5d3fd3,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreGroup.add(coreMesh);

    const innerCoreGeo = new THREE.IcosahedronGeometry(10, 0);
    const innerCoreMat = new THREE.MeshBasicMaterial({
        color: 0xff6b00,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    coreGroup.add(innerCoreMesh);

    // Module Nodes
    const nodes = [];
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const modulePositions = [
        { x: -80, y: 50, z: 0 },   // Brand Book
        { x: -80, y: -50, z: 20 },  // Pulse Plan
        { x: 80, y: 50, z: -20 },   // Pulse Scout
        { x: 100, y: 0, z: 0 },     // Pulse Engage
        { x: 80, y: -50, z: 10 }    // Pulse Shift
    ];

    const nodeGeometry = new THREE.SphereGeometry(4, 16, 16);
    
    modulePositions.forEach((pos, index) => {
        const material = new THREE.MeshBasicMaterial({
            color: index % 2 === 0 ? 0x5d3fd3 : 0xff6b00,
            transparent: true,
            opacity: 0.8
        });
        const node = new THREE.Mesh(nodeGeometry, material);
        node.position.set(pos.x, pos.y, pos.z);
        nodeGroup.add(node);
        nodes.push(node);

        // Add a glow ring for each node
        const ringGeo = new THREE.RingGeometry(5, 6, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: material.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        node.add(ring);
    });

    // 3. Connection Lines and Data Flow
    const connectionLines = [];
    const particles = [];
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xff6b00,
        size: 2,
        transparent: true,
        opacity: 1,
        blending: THREE.NormalBlending
    });

    nodes.forEach((node, index) => {
        // Create line from core to node
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(node.position);
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.05
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        connectionLines.push(line);

        // Create particles for this path
        const pCount = 5;
        for (let i = 0; i < pCount; i++) {
            particles.push({
                t: Math.random(), // Time progress (0 to 1)
                speed: 0.002 + Math.random() * 0.005,
                nodeIndex: index,
                pos: new THREE.Vector3()
            });
        }
    });

    const particlePositions = new Float32Array(particles.length * 3);
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 4. Animation & Interaction
    
    // GSAP ScrollTrigger for scene transitions
    gsap.registerPlugin(ScrollTrigger);

    const overlays = document.querySelectorAll('.product-info');

    // Section Trigger
    ScrollTrigger.create({
        trigger: ".modules-showcase",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
            gsap.to(nodeGroup.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 1.5, ease: "expo.out" });
        },
        onUpdate: (self) => {
            // Rotate scene based on scroll
            nodeGroup.rotation.y = self.progress * Math.PI * 0.5;
            coreGroup.rotation.y = -self.progress * Math.PI;
            
            // Highlight specific modules based on progress
            const index = Math.floor(self.progress * 5.9); // 0 to 5
            overlays.forEach((over, i) => {
                if (i === index) {
                    over.classList.add('active');
                    gsap.to(nodes[i].scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.3 });
                } else {
                    over.classList.remove('active');
                    gsap.to(nodes[i].scale, { x: 1, y: 1, z: 1, duration: 0.3 });
                }
            });
        }
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        // Rotate Core
        coreGroup.rotation.x += 0.005;
        coreGroup.rotation.z += 0.003;
        
        // Pulse Core scale
        const s = 1 + Math.sin(elapsed * 2) * 0.05;
        coreMesh.scale.set(s, s, s);

        // Update Particles
        const positions = particleSystem.geometry.attributes.position.array;
        particles.forEach((p, i) => {
            p.t += p.speed;
            if (p.t > 1) p.t = 0;

            const nodePos = nodes[p.nodeIndex].position;
            p.pos.lerpVectors(new THREE.Vector3(0, 0, 0), nodePos, p.t);
            
            // Add a little wobble
            const wobble = Math.sin(elapsed * 5 + i) * 2;
            positions[i * 3] = p.pos.x + wobble;
            positions[i * 3 + 1] = p.pos.y + wobble;
            positions[i * 3 + 2] = p.pos.z + (Math.cos(elapsed * 5 + i) * 2);
        });
        particleSystem.geometry.attributes.position.needsUpdate = true;

        // Subtle floating motion for nodes
        nodes.forEach((node, i) => {
            node.position.y += Math.sin(elapsed * 2 + i) * 0.05;
        });

        renderer.render(scene, camera);
    }

    animate();
});
