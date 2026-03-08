/* =====================================================
   JITEN TOPIWALA PORTFOLIO - MAIN JAVASCRIPT
   Animations, Interactions, and Particle System
   ===================================================== */

// ===== PRELOADER =====
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const sysText = document.getElementById('sys-text');
    const progressBar = document.getElementById('progress-bar');

    // Simulate boot sequence
    const bootSteps = [
        { text: 'SYSTEM CHECK...', progress: 30 },
        { text: 'CALIBRATING SENSORS...', progress: 60 },
        { text: 'ESTABLISHING UPLINK...', progress: 90 },
        { text: 'ACCESS GRANTED.', progress: 100 }
    ];

    let stepIndex = 0;

    const runBootSequence = () => {
        if (stepIndex < bootSteps.length) {
            sysText.textContent = bootSteps[stepIndex].text;
            progressBar.style.width = `${bootSteps[stepIndex].progress}%`;
            stepIndex++;

            // Random delay for realism
            setTimeout(runBootSequence, 400 + Math.random() * 300);
        } else {
            // Sequence complete
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.style.overflow = 'visible';
            }, 500);
        }
    };

    // Start sequence after a brief initial pause
    try {
        setTimeout(runBootSequence, 500);
    } catch (e) {
        console.error("Boot sequence error:", e);
        preloader.classList.add('hidden');
        document.body.style.overflow = 'visible';
    }

    // Safety timeout: Ensure preloader is removed even if animation fails
    setTimeout(() => {
        if (!preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
            document.body.style.overflow = 'visible';
        }
    }, 4000);
});

// ===== NAVIGATION =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll detection for navbar + active link (single consolidated listener)
let lastScroll = 0;
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const currentScroll = window.pageYOffset;
            navbar.classList.toggle('scrolled', currentScroll > 50);
            lastScroll = currentScroll;
            updateActiveLink();
            ticking = false;
        });
        ticking = true;
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Active link on scroll
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (correspondingLink) correspondingLink.classList.add('active');
        }
    });
}




// ===== TYPEWRITER EFFECT =====
const typewriter = document.getElementById('typewriter');
const roles = [
    'Robotics Engineer',
    'Mechanical Designer',
    'Entrepreneur',
    'Innovation Enthusiast',
    'Problem Solver'
];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeRole() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
        typewriter.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typewriter.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 500; // Pause before next word
    }

    setTimeout(typeRole, typingSpeed);
}

// Start typewriter
setTimeout(typeRole, 1000);

// ===== PARTICLE SYSTEM =====
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null, radius: 150 };

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

// Mouse move
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

// Particle class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
    }

    draw() {
        ctx.fillStyle = `rgba(0, 212, 255, ${this.size / 3})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        // Move particles slowly
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;

        // Mouse interaction
        if (mouse.x) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let force = (mouse.radius - distance) / mouse.radius;
                let directionX = forceDirectionX * force * this.density * 0.5;
                let directionY = forceDirectionY * force * this.density * 0.5;

                this.x -= directionX;
                this.y -= directionY;
            }
        }

        this.draw();
    }
}

// Initialize particles
function initParticles() {
    particles = [];
    const densityDivisor = window.innerWidth < 768 ? 25000 : 15000;
    const MAX_PARTICLES = window.innerWidth < 768 ? 40 : 60;
    const numberOfParticles = Math.min(
        Math.floor((canvas.width * canvas.height) / densityDivisor),
        MAX_PARTICLES
    );

    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
    }
}
initParticles();

// Connect particles with lines
function connectParticles() {
    const MAX_DIST = 120;
    const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
    for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            // Early exit using squared distance — avoids sqrt for most pairs
            if (dx * dx + dy * dy > MAX_DIST_SQ) continue;
            let distance = Math.sqrt(dx * dx + dy * dy);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.15 - distance / 800})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
        }
    }
}

// Animation loop
let animationId;
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => particle.update());
    connectParticles();

    animationId = requestAnimationFrame(animateParticles);
}
animateParticles();

// Pause animation when tab is not visible to save battery
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationId);
    } else {
        animateParticles();
    }
});

// Reinitialize on resize
window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

// ===== SCROLL REVEAL ANIMATIONS =====
const revealElements = document.querySelectorAll('.section-header, .about-content, .skill-category, .project-card, .publication-card, .timeline-item, .contact-card, .contact-form');

const revealOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal', 'active');
            revealObserver.unobserve(entry.target);
        }
    });
}, revealOptions);

revealElements.forEach(element => {
    element.classList.add('reveal');
    revealObserver.observe(element);
});

// ===== COUNTER ANIMATION =====
const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute('data-target'));
            animateCounter(entry.target, target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => counterObserver.observe(stat));

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

// ===== PROJECT FILTERS =====
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');

            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

// ===== CONTACT FORM =====
// Form submission is handled by FormSubmit.co (see index.html)
// No JavaScript needed - the HTML form POSTs directly to FormSubmit

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== PARALLAX EFFECT FOR HERO =====
const heroVisual = document.querySelector('.hero-visual');

window.addEventListener('scroll', () => {
    if (window.innerWidth > 768 && heroVisual) {
        const scrolled = window.pageYOffset;
        heroVisual.style.transform = `translateY(calc(-50% + ${scrolled * 0.3}px))`;
    }
});

// ===== CUSTOM CURSOR =====
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

let mouseX = 0;
let mouseY = 0;
let outlineX = 0;
let outlineY = 0;

// Mouse movement
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Dot follows immediately
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
});

function animateOutline() {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;

    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;

    requestAnimationFrame(animateOutline);
}

// Don't start cursor rAF loop on touch devices
if (!("ontouchstart" in window) && navigator.maxTouchPoints === 0) {
    animateOutline();
}

// Hover effects
const interactiveElements = document.querySelectorAll('a, button, .project-card, .social-link, input, textarea, label, .nav-toggle');

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering');
        cursorOutline.style.borderColor = 'var(--secondary)'; // Example color change
    });

    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering');
        cursorOutline.style.borderColor = 'var(--primary)';
    });
});

// Click effects
document.addEventListener('mousedown', () => {
    document.body.classList.add('clicking');
});

document.addEventListener('mouseup', () => {
    document.body.classList.remove('clicking');
});

// Hide on mobile/touch
if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    cursorDot.style.display = 'none';
    cursorOutline.style.display = 'none';
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// ===== PROJECT DETAILS MODAL =====
const projectModal = document.getElementById('project-modal');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');

// Project Data Store
const projectsData = {
    'manpackable': {
        category: 'Robotics',
        title: 'Manpackable Surveillance Robot',
        subtitle: 'Wheel-Track Transformable System',
        description: 'A cutting-edge surveillance robot designed for tactical operations. This robot features a unique transformable mechanism that allows it to switch between wheeled mode for speed on flat surfaces and track mode for superior traction on rough terrain. Its compact, man-packable design ensures easy deployment by a single operator.',
        features: [
            'Transformable Wheel-Track Mechanism',
            'Real-time Video Surveillance',
            'Remote Operation up to 1km',
            'Compact Foldable Design',
            'Night Vision Capabilities'
        ],
        tech: ['ROS', 'SolidWorks', 'Python', 'OpenCV', '3D Printing'],
        media: [
            { type: 'image', src: 'Images/trackbeltmode.JPG', thumb: 'Images/trackbeltmode.JPG' },
            { type: 'image', src: 'Images/WhatsApp Image 2023-10-28 at 14.19.37_9e6e37e8.jpg', thumb: 'Images/WhatsApp Image 2023-10-28 at 14.19.37_9e6e37e8.jpg' }
        ],
        links: [
            { text: 'View 3D Model', url: '#', icon: '<path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9M12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15z"/>' }
        ]
    },
    'liftterra': {
        category: 'Startup',
        title: 'LiftTerra',
        subtitle: 'Automated Construction Assistant',
        description: 'LiftTerra is a revolutionary robotic platform designed to automate heavy lifting and material transport on construction sites. By reducing physical strain on workers and increasing efficiency, LiftTerra aims to modernize the construction industry.',
        features: [
            'Heavy Payload Capacity (50kg+)',
            'Autonomous Navigation in Cluttered Environments',
            'Follow-Me Mode for Worker Assistance',
            'Robust Outdoor Chassis',
            'Long Battery Life'
        ],
        tech: ['ROS2', 'Navigation Stack', 'LIDAR', 'Industrial Design', 'React'],
        media: [
            { type: 'image', src: 'Images/LiftTerra 1.jpg', thumb: 'Images/LiftTerra 1.jpg' },
            { type: 'image', src: 'Images/LiftTerra 2.jpg', thumb: 'Images/LiftTerra 2.jpg' },
            { type: 'image', src: 'Images/Enterprenurship.jpg', thumb: 'Images/Enterprenurship.jpg' }
        ],
        links: [
            { text: 'Visit Website', url: 'https://jiten-topiwala.github.io/LiftTerra/', icon: '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>' }
        ]
    },
    'pipe-inspection': {
        category: 'Industrial',
        title: 'Pipe Inspection Robot',
        subtitle: 'Variable Diameter Navigation',
        description: 'A sophisticated inspection robot capable of adjusting its geometry to navigate pipes of varying diameters (200mm - 400mm). Equipped with HD cameras and lighting, it provides detailed internal inspection of industrial pipelines.',
        features: [
            'Active Diameter Adjustment Mechanism',
            '360-degree Rotating Camera Head',
            'High-traction Wheels for Slippery Surfaces',
            'Tethered Communication & Power',
            'Waterproof (IP67) Design'
        ],
        tech: ['Mechanical Design', 'Arduino', 'Power Electronics', 'Video Transmission'],
        media: [
            { type: 'image', src: 'Images/Pipe Inspectoin Robot.jpg', thumb: 'Images/Pipe Inspectoin Robot.jpg' },
            { type: 'image', src: 'Images/Pipe inspection robot 2.jpg', thumb: 'Images/Pipe inspection robot 2.jpg' }
        ],
        links: []
    },
    'biped': {
        category: 'Research',
        title: 'Biped Robot',
        subtitle: 'Dynamic Walking Research Platform',
        description: 'A research-grade bipedal robot built to study dynamic locomotion algorithms. This project focuses on ZMP-based walking gaits, balance recovery, and inverse kinematics implementation.',
        features: [
            '12 Degrees of Freedom',
            'Custom High-Torque Servo Drivers',
            'IMU-based Balance Control',
            'Real-time Gait Generation',
            'MATLAB Simulation Integration'
        ],
        tech: ['Control Theory', 'MATLAB', 'C++', 'Embedded Systems'],
        media: [
            { type: 'image', src: 'Images/Biped 1.jpg', thumb: 'Images/Biped 1.jpg' },
            { type: 'image', src: 'Images/Biped 2.jpg', thumb: 'Images/Biped 2.jpg' }
        ],
        links: []
    },
    'micro-pipe': {
        category: 'Industrial',
        title: 'Micro Pipe Inspector',
        subtitle: 'Miniature Inspection Solution',
        description: 'An ultra-compact robot designed for inspecting small-bore pipes (under 50mm). Utilizing a snake-like propulsion or magnetic wheeled design to access hard-to-reach areas in heat exchangers and complex routing.',
        features: [
            'Ultra-compact Form Factor',
            'Flexible Body Design',
            'Macro Camera with Adjustable Focus',
            'High-intensity LED Ring Light'
        ],
        tech: ['PCB Design', 'Microcontrollers', 'Optics', 'Miniaturization'],
        media: [
            { type: 'image', src: 'https://placehold.co/800x450/1a1a2e/00d4ff?text=Micro+Inspector', thumb: 'https://placehold.co/100x75/1a1a2e/00d4ff?text=Micro' }
        ],
        links: []
    },
    'vertical-conveyor': {
        category: 'Industrial',
        title: 'Vertical Indexing Conveyor',
        subtitle: 'Automated Assembly Line System',
        description: 'A robust vertical conveyor system designed for space-efficient buffering and indexing of parts in an automated assembly line. Features a precision chain-sprocket drive and synchronized motion control.',
        features: [
            'Space-saving Vertical Design',
            'High-precision Indexing (+/- 0.5mm)',
            'PLC Integration',
            'Safety Interlocks',
            'Modular Palette System'
        ],
        tech: ['Automation', 'PLC Programming', 'CAD', 'Pneumatics'],
        media: [
            { type: 'image', src: 'Images/Vertical_Indexing_conveyor.jpg', thumb: 'Images/Vertical_Indexing_conveyor.jpg' }
        ],
        links: []
    }
};

// Modal Functions
function openModal(projectId) {
    const data = projectsData[projectId];
    if (!data) return;

    // Populate Data
    document.getElementById('modal-category').textContent = data.category;
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-subtitle').textContent = data.subtitle;
    document.getElementById('modal-description').textContent = data.description;

    // Features
    const featureList = document.getElementById('modal-features-list');
    featureList.innerHTML = '';
    data.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featureList.appendChild(li);
    });

    // Tech Stack
    const techStack = document.getElementById('modal-tech');
    techStack.innerHTML = '';
    data.tech.forEach(tech => {
        const span = document.createElement('span');
        span.className = 'skill-tag'; // Reusing existing class
        span.textContent = tech;
        techStack.appendChild(span);
    });

    // Links
    const linksContainer = document.getElementById('modal-links');
    linksContainer.innerHTML = '';
    if (data.links && data.links.length > 0) {
        data.links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.className = 'modal-btn';
            a.target = '_blank';
            a.innerHTML = `<span>${link.text}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${link.icon || '<path d="M5 12h14M12 5l7 7-7 7"/>'}</svg>`;
            linksContainer.appendChild(a);
        });
    } else {
        linksContainer.innerHTML = '<span style="color:var(--text-muted); font-size:14px;">No external links available</span>';
    }

    // Gallery
    setupGallery(data.media);

    // Show Modal
    projectModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    projectModal.classList.add('hidden');
    document.body.style.overflow = '';

    // Stop any playing videos
    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = ''; // Clear content
}

function setupGallery(mediaItems) {
    const container = document.getElementById('gallery-container');
    const thumbsContainer = document.getElementById('gallery-thumbs');

    container.innerHTML = '';
    thumbsContainer.innerHTML = '';

    if (!mediaItems || mediaItems.length === 0) {
        container.innerHTML = '<div class="gallery-placeholder"><span>No Media Available</span></div>';
        return;
    }

    // Create Thumbnails and set up click handlers
    mediaItems.forEach((item, index) => {
        const thumb = document.createElement('div');
        thumb.className = `gallery-thumb ${index === 0 ? 'active' : ''}`;
        thumb.innerHTML = `<img src="${item.thumb || item.src}" alt="Thumbnail">`;
        thumb.addEventListener('click', () => {
            loadMedia(item);
            document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
        thumbsContainer.appendChild(thumb);
    });

    // Load first item
    loadMedia(mediaItems[0]);
}

function loadMedia(item) {
    const container = document.getElementById('gallery-container');
    container.style.opacity = '0';

    setTimeout(() => {
        container.innerHTML = '';
        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.src;
            video.controls = true;
            container.appendChild(video);
        } else if (item.type === 'iframe') {
            const iframe = document.createElement('iframe');
            iframe.src = item.src;
            iframe.style.border = 'none';
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            container.appendChild(iframe);
        } else {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = 'Project Media';
            container.appendChild(img);
        }
        container.style.opacity = '1';
    }, 200);
}

// Event Listeners for Project Buttons
document.querySelectorAll('.project-link, .project-card').forEach(el => {
    // Check if it's the button or card triggering
    el.addEventListener('click', (e) => {
        // Prevent default if it's a link with href="#"
        const target = e.currentTarget;
        if (target.getAttribute('href') === '#') {
            e.preventDefault();
        }

        // Use closest to find the ID if clicked on inner elements
        const projectId = target.getAttribute('data-project-id');

        if (projectId) {
            e.preventDefault(); // Prioritize modal over link if ID exists
            openModal(projectId);
        }
    });
});

// Close listeners
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !projectModal.classList.contains('hidden')) {
        closeModal();
    }
});
