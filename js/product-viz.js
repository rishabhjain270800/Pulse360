document.addEventListener("DOMContentLoaded", () => {
    // Scroll Animation for One System Infographic
    const container = document.querySelector('.scroll-infographic-container');
    const stickySection = document.querySelector('.infographic-sticky');
    if (!container || !stickySection) return;

    gsap.registerPlugin(ScrollTrigger);

    const items = gsap.utils.toArray('.info-item');
    const circlePath = document.querySelector('#circle-path');
    
    // Animate the stroke-dashoffset from 1130 (hidden) to 0 (fully drawn)
    let tl = gsap.timeline({
        scrollTrigger: {
            trigger: stickySection,
            start: "top top",
            end: "+=3000", // Controls how long the scroll lasts (3000px)
            scrub: 1, // smooth scrubbing
            pin: true, // This pins the section while the animation happens!
            anticipatePin: 1
        }
    });

    // 1. First, slightly rotate the circle path to make it look dynamic while drawing
    tl.to('.circular-arrows', {
        rotation: 0, // Starts from -90deg, goes to 0deg
        duration: items.length,
        ease: "none"
    }, 0);

    // 2. Animate the circular arrow drawing
    tl.to(circlePath, {
        strokeDashoffset: 0,
        duration: items.length,
        ease: "none"
    }, 0);

    // 3. Animate items fading in and moving into place
    items.forEach((item, i) => {
        tl.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out"
        }, i * (0.8)); // stagger them
    });
});
