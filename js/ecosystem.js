document.addEventListener("DOMContentLoaded", () => {
    // 1. Setup Three.js Scene
    const canvas = document.querySelector('#ecosystem-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 250;

    // Renderer setup
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

    // 2. Particle System Geometry
    const particleCount = 4000;
    
    // Arrays to hold our 3D positions for the two states
    const fragmentedPositions = new Float32Array(particleCount * 3);
    const unifiedPositions = new Float32Array(particleCount * 3);
    
    // We also need an array for the current positions being rendered
    const currentPositions = new Float32Array(particleCount * 3);

    // Random point on a sphere helper
    function randomSpherePoint(radius, offsetX = 0, offsetY = 0, offsetZ = 0) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * radius;
        const sinPhi = Math.sin(phi);
        
        return {
            x: offsetX + r * sinPhi * Math.cos(theta),
            y: offsetY + r * sinPhi * Math.sin(theta),
            z: offsetZ + r * Math.cos(phi)
        };
    }

    // Define 5 cluster centers for the "Fragmented" state
    const clusters = [
        { x: -150, y: 100, z: -50 },
        { x: 150, y: 120, z: 20 },
        { x: -120, y: -100, z: 50 },
        { x: 100, y: -120, z: -20 },
        { x: 0, y: 0, z: 100 }
    ];

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // --- State 1: Fragmented ---
        // Pick a random cluster for this particle
        const cluster = clusters[Math.floor(Math.random() * clusters.length)];
        // Generate a point within a small radius of that cluster
        const fragPoint = randomSpherePoint(40, cluster.x, cluster.y, cluster.z);
        
        fragmentedPositions[i3] = fragPoint.x;
        fragmentedPositions[i3 + 1] = fragPoint.y;
        fragmentedPositions[i3 + 2] = fragPoint.z;
        
        // --- State 2: Unified ---
        // Generate a point on a large central sphere
        const uniPoint = randomSpherePoint(100, 0, 0, 0);
        
        unifiedPositions[i3] = uniPoint.x;
        unifiedPositions[i3 + 1] = uniPoint.y;
        unifiedPositions[i3 + 2] = uniPoint.z;
        
        // Initialize current position to fragmented
        currentPositions[i3] = fragPoint.x;
        currentPositions[i3 + 1] = fragPoint.y;
        currentPositions[i3 + 2] = fragPoint.z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

    // 3. Particle Material
    // Create a circular texture for the particles
    const canvasPoint = document.createElement('canvas');
    canvasPoint.width = 16;
    canvasPoint.height = 16;
    const context = canvasPoint.getContext('2d');
    const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255,107,0,1)'); // Vibrant Orange Center
    gradient.addColorStop(1, 'rgba(255,107,0,0)'); // Transparent Edge
    context.fillStyle = gradient;
    context.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(canvasPoint);

    const material = new THREE.PointsMaterial({
        size: 2.5,
        map: texture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.NormalBlending, // Better for light backgrounds
        color: 0xff6b00 // Vibrant Orange
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // 4. GSAP ScrollTrigger for Morphing
    // We will animate this object from 0 to 1
    const morphState = { progress: 0 };

    gsap.registerPlugin(ScrollTrigger);

    const titleOverlay = document.querySelector('.unified-title');

    ScrollTrigger.create({
        trigger: ".problem-solution",
        start: "top top",
        end: "+=150%", // Keep it pinned for a while
        pin: true,
        scrub: 1, // Smooth interpolation on scroll
        onUpdate: (self) => {
            // Update the morph progress based on scroll position
            morphState.progress = self.progress;
            
            // Fade in the title when particles are mostly unified (e.g. > 70% progress)
            if (titleOverlay) {
                if (self.progress > 0.7) {
                    const opacity = (self.progress - 0.7) * (1 / 0.3); // Map 0.7-1.0 to 0-1
                    titleOverlay.style.opacity = opacity;
                } else {
                    titleOverlay.style.opacity = 0;
                }
            }
        }
    });

    // 5. Render Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        const positions = geometry.attributes.position.array;

        // Interpolate between fragmented and unified states based on scroll progress
        const p = morphState.progress;
        
        // Add a smooth easing function to the progress (optional, makes it feel better)
        // const easeP = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        const easeP = p; // Linear scrubbing is often best for scroll

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Linear Interpolation (Lerp)
            const startX = fragmentedPositions[i3];
            const startY = fragmentedPositions[i3 + 1];
            const startZ = fragmentedPositions[i3 + 2];
            
            const endX = unifiedPositions[i3];
            const endY = unifiedPositions[i3 + 1];
            const endZ = unifiedPositions[i3 + 2];
            
            // Add a little bit of noise/floating motion based on time
            const noise = Math.sin(elapsedTime * 2 + i) * 2;
            
            positions[i3] = startX + (endX - startX) * easeP + noise;
            positions[i3 + 1] = startY + (endY - startY) * easeP + noise;
            positions[i3 + 2] = startZ + (endZ - startZ) * easeP + noise;
        }

        // Tell Three.js the positions array has been updated
        geometry.attributes.position.needsUpdate = true;

        // Rotate the entire system slowly
        particleSystem.rotation.y = elapsedTime * 0.1;
        particleSystem.rotation.x = elapsedTime * 0.05;

        // Scale up slightly as it unifies
        const scale = 1 + (easeP * 0.2);
        particleSystem.scale.set(scale, scale, scale);

        renderer.render(scene, camera);
    }

    animate();
});
