document.addEventListener("DOMContentLoaded", (event) => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Navbar Scrolled State
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Initial Loader Animation
    const tlLoader = gsap.timeline();
    
    tlLoader.to(".loader-text", {
        opacity: 0,
        duration: 0.5,
        delay: 1
    })
    .to(".loader", {
        y: "-100%",
        duration: 0.8,
        ease: "power4.inOut"
    })
    .from(".navbar", {
        y: -50,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
    }, "-=0.2")
    .from(".hero-content .badge", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
    }, "-=0.4")
    .from(".text-reveal", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
    }, "-=0.4");

    // Ecosystem WebGL Animation is handled in ecosystem.js


    // Module Cards Stagger Reveal
    gsap.from(".module-card", {
        scrollTrigger: {
            trigger: ".modules-grid",
            start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
    });

    // CTA Reveal
    gsap.from(".cta-container", {
        scrollTrigger: {
            trigger: ".cta-section",
            start: "top 75%",
        },
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: "power3.out"
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
