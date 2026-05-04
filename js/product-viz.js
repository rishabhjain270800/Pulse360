document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector('#product-canvas');
    if (!canvas) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 600;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Resize Handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 2. Custom Cursor Logic
    const cursor = document.querySelector('.custom-cursor');
    let mouseX = 0;
    let mouseY = 0;
    let ballX = 0;
    let ballY = 0;
    const speed = 0.2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursor.style.opacity === "0") cursor.style.opacity = "1";
    });

    function animateCursor() {
        const distX = mouseX - ballX;
        const distY = mouseY - ballY;
        ballX = ballX + (distX * speed);
        ballY = ballY + (distY * speed);
        cursor.style.left = ballX + 'px';
        cursor.style.top = ballY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // 3. Carousel Logic
    const itemsData = [
        { id: 0, name: "BRAND BOOK", img: "assets/brand_book_ui_viz_1777910167374.png" },
        { id: 1, name: "PULSE PLAN", img: "assets/pulse_plan_ui_viz_1777910183116.png" },
        { id: 2, name: "PULSE SCOUT", img: "assets/pulse_scout_ui_viz_1777910198957.png" },
        { id: 3, name: "PULSE ENGAGE", img: "assets/pulse_engage_ui_viz_1777910213438.png" },
        { id: 4, name: "PULSE SHIFT", img: "assets/pulse_shift_ui_viz_1777910228049.png" }
    ];

    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    const textureLoader = new THREE.TextureLoader();
    const radius = 500;
    const cards = [];

    itemsData.forEach((data, i) => {
        const geometry = new THREE.PlaneGeometry(400, 250);
        const texture = textureLoader.load(data.img);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const card = new THREE.Mesh(geometry, material);

        // Position on a cylinder
        const angle = (i / itemsData.length) * Math.PI * 2;
        card.position.x = Math.sin(angle) * radius;
        card.position.z = Math.cos(angle) * radius;
        card.rotation.y = angle;

        card.userData = { id: data.id, name: data.name, angle: angle };
        cardGroup.add(card);
        cards.push(card);
    });

    // 4. Particle Core (Cinematic Background)
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        particlePos[i * 3] = (Math.random() - 0.5) * 1000;
        particlePos[i * 3 + 1] = (Math.random() - 0.5) * 1000;
        particlePos[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0x5d3fd3,
        size: 2,
        transparent: true,
        opacity: 0.3
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Interaction & Scroll Sync
    gsap.registerPlugin(ScrollTrigger);

    const scrollState = { progress: 0 };
    const projectNameEl = document.querySelector('#current-project-name');
    const projectNumEl = document.querySelector('.project-num');

    ScrollTrigger.create({
        trigger: ".modules-showcase",
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
            scrollState.progress = self.progress;
            
            // Rotate the entire cylinder
            cardGroup.rotation.y = -self.progress * Math.PI * 2;

            // Lens Distortion & Scaling
            cards.forEach((card, i) => {
                // Calculate distance to center of view
                const worldPos = new THREE.Vector3();
                card.getWorldPosition(worldPos);
                const distToCenter = Math.abs(worldPos.x);
                
                // Scale card based on how central it is
                const scale = Math.max(0.5, 1.2 - (distToCenter / 800));
                card.scale.set(scale, scale, scale);
                
                // Opacity fade
                card.material.opacity = Math.max(0.1, 1 - (distToCenter / 600));

                // Update UI text based on most central card
                if (distToCenter < 100 && worldPos.z > 0) {
                    projectNameEl.innerText = card.userData.name;
                    projectNumEl.innerText = `0${card.userData.id + 1}`;
                }
            });

            // Rotate particles for cinematic feel
            particles.rotation.y = self.progress * Math.PI;
        }
    });

    // 6. Mouse Parallax (High Frequency)
    const targetRotation = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
        targetRotation.y = (e.clientX / window.innerWidth - 0.5) * 0.2;
        targetRotation.x = (e.clientY / window.innerHeight - 0.5) * 0.2;
    });

    // 7. Render Loop
    function animate() {
        requestAnimationFrame(animate);

        // Subtle mouse parallax
        scene.rotation.y += (targetRotation.y - scene.rotation.y) * 0.1;
        scene.rotation.x += (targetRotation.x - scene.rotation.x) * 0.1;

        // Core animation
        particles.rotation.z += 0.001;

        renderer.render(scene, camera);
    }
    animate();

    // Cursor hover effects
    canvas.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    canvas.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
});
