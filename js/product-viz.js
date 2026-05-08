document.addEventListener("DOMContentLoaded", () => {
    // Scroll Animation for One System Infographic
    const container = document.querySelector('.scroll-infographic-container');
    if (!container) return;

    gsap.registerPlugin(ScrollTrigger);

    const items = gsap.utils.toArray('.info-item');
    const circlePath = document.querySelector('#circle-path');
    
    // We will animate the stroke-dashoffset from 1130 (hidden) to 0 (fully drawn)
    // 1130 is the circumference of a circle with r=180 (2 * pi * 180 = ~1130)

    let tl = gsap.timeline({
        scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "bottom bottom",
            scrub: 1 // smooth scrubbing
        }
    });

    // Animate the circular arrow drawing
    tl.to(circlePath, {
        strokeDashoffset: 0,
        duration: items.length,
        ease: "none"
    }, 0);

    // Animate items fading in and moving up
    items.forEach((item, i) => {
        // Start showing this item at an appropriate time
        tl.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out"
        }, i * (0.8)); // stagger them slightly
    });
});
