document.addEventListener("DOMContentLoaded", () => {
    // Scroll Animation for One System Infographic
    const container = document.querySelector('.scroll-infographic-container');
    const stickySection = document.querySelector('.infographic-sticky');
    if (!container || !stickySection) return;

    gsap.registerPlugin(ScrollTrigger);

    const items = gsap.utils.toArray('.info-item');
    const circlePath = document.querySelector('#circle-path');
    const centerCore = document.querySelector('.center-core img');
    
    // Initial setup
    gsap.set(items, { opacity: 0, y: 30, scale: 0.95 });
    if(centerCore) gsap.set(centerCore, { scale: 0.8, opacity: 0 });

    let tl = gsap.timeline({
        scrollTrigger: {
            trigger: stickySection,
            start: "top top",
            end: "+=4000", // Increased scroll duration for better pacing
            scrub: 1, // smooth scrubbing
            pin: true,
            anticipatePin: 1
        }
    });

    // 0. Reveal the center core
    if(centerCore) {
        tl.to(centerCore, {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        }, 0);
    }

    // 1. First, slightly rotate the circle path to make it look dynamic while drawing
    tl.to('.circular-arrows', {
        rotation: 0, // Starts from -90deg, goes to 0deg
        duration: items.length * 2,
        ease: "none"
    }, 0);

    // 2. Animate the circular arrow drawing
    tl.to(circlePath, {
        strokeDashoffset: 0,
        duration: items.length * 2,
        ease: "none"
    }, 0);

    // 3. Sequential Focus Animation (Like Drip)
    items.forEach((item, i) => {
        const startTime = i * 2;
        
        // Dim all other previously visible items
        if (i > 0) {
            tl.to(items.slice(0, i), {
                opacity: 0.2,
                scale: 0.95,
                duration: 0.5,
                ease: "power2.inOut"
            }, startTime);
        }

        // Highlight the current item
        tl.to(item, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.2)"
        }, startTime);
    });

    // 4. Final state: Bring all items to full focus at the very end
    tl.to(items, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power2.inOut"
    }, items.length * 2);
});
