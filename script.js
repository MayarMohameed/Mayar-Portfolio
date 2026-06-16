/* ==========================================================================
   MAYAR MOHAMED - PORTFOLIO INTERACTIVE LOGIC & ANIMATIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Register GSAP ScrollTrigger if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initScrollAnimations();
    } else {
        // Fallback simple reveal using IntersectionObserver
        initSimpleReveals();
    }

    // Initialize Subsystems
    initCustomCursor();
    initCanvasBackground();
    initTypewriter();
    initMagneticElements();
    init3DTiltCards();
    initThemeSwitcher();
    initSkillsTabs();
    initProjectFiltering();
    initModals();
    initMockupInteractions();
    initContactForm();
    initMobileNav();
    initScrollSpy();
});

/* ==========================================================================
   1. Custom Fluid Cursor
   ========================================================================== */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const ring = document.getElementById('custom-cursor-ring');

    if (!cursor || !ring) return;

    let mouse = { x: -100, y: -100 };
    let pos = { x: -100, y: -100 };
    let ringPos = { x: -100, y: -100 };

    // Linear Interpolation (LERP) for smooth lagging follow effect
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function updateCursor() {
        // Primary cursor follows mouse immediately
        pos.x = lerp(pos.x, mouse.x, 0.35);
        pos.y = lerp(pos.y, mouse.y, 0.35);
        cursor.style.left = `${pos.x}px`;
        cursor.style.top = `${pos.y}px`;

        // Outer ring lags behind for elastic flow feel
        ringPos.x = lerp(ringPos.x, mouse.x, 0.12);
        ringPos.y = lerp(ringPos.y, mouse.y, 0.12);
        ring.style.left = `${ringPos.x}px`;
        ring.style.top = `${ringPos.y}px`;

        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover states for clickable items
    const clickables = document.querySelectorAll('a, button, input, textarea, .skill-tab, .filter-btn, .avatar-card, .mock-car-card, .time-slot, .cal-day, .proto-table, [data-tilt], .hero-profile-pic');
    clickables.forEach(item => {
        item.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        item.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
}

/* ==========================================================================
   2. Interactive Canvas Background (Node-Connection Particles)
   ========================================================================== */
function initCanvasBackground() {
    const canvas = document.getElementById('interactive-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    let particleCount = 60;
    let connectionDistance = 120;
    let mouse = { x: null, y: null, radius: 150 };

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse coordinates over window
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Object Blueprint
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce on boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // Smooth draw
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            // Dynamic theme support (semi-opaque nodes)
            const isDark = document.body.classList.contains('dark-theme');
            ctx.fillStyle = isDark ? 'rgba(0, 242, 254, 0.4)' : 'rgba(124, 58, 237, 0.3)';
            ctx.fill();
        }
    }

    // Initialize particle array
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const isDark = document.body.classList.contains('dark-theme');
        const lineColor = isDark ? 'rgba(0, 242, 254, ' : 'rgba(124, 58, 237, ';

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();

            // Connect close particles together
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    let alpha = (1 - dist / connectionDistance) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = lineColor + alpha + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            // Connect to mouse cursor
            if (mouse.x !== null) {
                let dx = particles[i].x - mouse.x;
                let dy = particles[i].y - mouse.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    let alpha = (1 - dist / mouse.radius) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = lineColor + alpha + ')';
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   3. Typewriter Reveal Effect
   ========================================================================== */
function initTypewriter() {
    const el = document.querySelector('.typewriter');
    if (!el) return;
    const words = JSON.parse(el.getAttribute('data-words'));
    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let currentTxt = '';
    
    function type() {
        const fullWord = words[wordIdx];
        if (isDeleting) {
            currentTxt = fullWord.substring(0, charIdx - 1);
            charIdx--;
        } else {
            currentTxt = fullWord.substring(0, charIdx + 1);
            charIdx++;
        }
        
        el.textContent = currentTxt;
        
        let typeSpeed = 100;
        if (isDeleting) typeSpeed /= 2;

        if (!isDeleting && currentTxt === fullWord) {
            typeSpeed = 1800; // Pause at end of completed word
            isDeleting = true;
        } else if (isDeleting && currentTxt === '') {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            typeSpeed = 400; // Pause before typing next word
        }

        setTimeout(type, typeSpeed);
    }
    
    setTimeout(type, 1000);
}

/* ==========================================================================
   4. Magnetic Hover Physics
   ========================================================================== */
function initMagneticElements() {
    const magnetics = document.querySelectorAll('.magnetic');
    
    magnetics.forEach(el => {
        const pullDist = parseFloat(el.getAttribute('data-dist')) || 20;

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const elCenterX = rect.left + rect.width / 2;
            const elCenterY = rect.top + rect.height / 2;
            
            // Calculate distance vector
            const dx = e.clientX - elCenterX;
            const dy = e.clientY - elCenterY;
            
            // Magnet pull ratio
            const pullX = dx / (rect.width / 2) * pullDist;
            const pullY = dy / (rect.height / 2) * pullDist;

            // Apply translation offset
            gsap.to(el, {
                x: pullX,
                y: pullY,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        el.addEventListener('mouseleave', () => {
            // Snap back smoothly
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'elastic.out(1.2, 0.4)'
            });
        });
    });
}

/* ==========================================================================
   5. Spotlight 3D Depth Card Tilt
   ========================================================================== */
function init3DTiltCards() {
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Normalize coordinate offsets
            const percentX = (mouseX / rect.width) * 2 - 1; // Range: [-1, 1]
            const percentY = (mouseY / rect.height) * 2 - 1; // Range: [-1, 1]

            // Angle of tilt
            const tiltMax = 12; // Degrees
            const rotateX = -percentY * tiltMax;
            const rotateY = percentX * tiltMax;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            // Update spotlight variables
            const spotlight = card.querySelector('.spotlight-layer');
            if (spotlight) {
                card.style.setProperty('--x', `${(mouseX / rect.width) * 100}%`);
                card.style.setProperty('--y', `${(mouseY / rect.height) * 100}%`);
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });
}

/* ==========================================================================
   6. Light / Dark Theme Toggle With Liquid Reveal Wipe
   ========================================================================== */
function initThemeSwitcher() {
    const btn = document.getElementById('theme-toggle');
    const overlay = document.querySelector('.liquid-overlay');
    if (!btn || !overlay) return;

    btn.addEventListener('click', (e) => {
        const isDark = document.body.classList.contains('dark-theme');
        
        // Dynamic origin circle coordinates (based on button click position)
        const rect = btn.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;

        overlay.style.clipPath = `circle(0% at ${originX}px ${originY}px)`;
        overlay.classList.add('active');

        // Circular transition animation
        setTimeout(() => {
            overlay.style.clipPath = `circle(150% at ${originX}px ${originY}px)`;
        }, 50);

        // Switch theme variables mid transition
        setTimeout(() => {
            if (isDark) {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
            }
        }, 600);

        // Collapse transition overlay circle
        setTimeout(() => {
            overlay.style.clipPath = `circle(0% at ${originX}px ${originY}px)`;
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 500);
        }, 1200);
    });
}

/* ==========================================================================
   7. Skills Matrix Tabs
   ========================================================================== */
function initSkillsTabs() {
    const tabs = document.querySelectorAll('.skill-tab');
    const panels = document.querySelectorAll('.skills-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target') + '-panel';

            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => {
                p.classList.remove('active');
                // Reset progress bar animations
                p.querySelectorAll('.progress-fill').forEach(fill => {
                    fill.style.width = '0%';
                });
            });

            tab.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                
                // Animate progress bar widths in the target panel
                setTimeout(() => {
                    targetPanel.querySelectorAll('.progress-fill').forEach(fill => {
                        const width = fill.parentElement.previousElementSibling.lastElementChild.textContent;
                        fill.style.width = width;
                    });
                }, 50);
            }
        });
    });

    // Trigger loading widths for the initial active panel on load
    const activePanel = document.querySelector('.skills-panel.active');
    if (activePanel) {
        setTimeout(() => {
            activePanel.querySelectorAll('.progress-fill').forEach(fill => {
                const width = fill.parentElement.previousElementSibling.lastElementChild.textContent;
                fill.style.width = width;
            });
        }, 500);
    }
}

/* ==========================================================================
   8. Project Category Grid Filtering
   ========================================================================== */
function initProjectFiltering() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.filter-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            cards.forEach(card => {
                const categories = card.className.split(' ');
                
                if (filter === 'all' || categories.includes(filter)) {
                    gsap.to(card, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.4,
                        ease: 'power2.out',
                        display: 'flex'
                    });
                } else {
                    gsap.to(card, {
                        scale: 0.9,
                        opacity: 0,
                        duration: 0.4,
                        ease: 'power2.out',
                        display: 'none'
                    });
                }
            });
        });
    });
}

/* ==========================================================================
   9. Modal Controller
   ========================================================================== */
function initModals() {
    const btns = document.querySelectorAll('[data-target-modal]');
    const modals = document.querySelectorAll('.project-modal');
    const closeBtns = document.querySelectorAll('.modal-close-btn, .modal-backdrop');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-target-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Stop background scroll
            }
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modals.forEach(m => m.classList.remove('active'));
            document.body.style.overflow = ''; // Resume background scroll
        });
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(m => m.classList.remove('active'));
            document.body.style.overflow = '';
        }
    });
}

/* ==========================================================================
   10. Interactive Card Mockups Simulator & Playground
   ========================================================================== */
function initMockupInteractions() {
    /* --- Saree3 Mockup (Car selection) --- */
    const carCards = document.querySelectorAll('.mock-car-card');
    const bookBtn = document.querySelector('.mock-btn-book');
    const protoImg = document.getElementById('saree3-proto-img');
    const protoTitle = document.getElementById('saree3-proto-title');

    carCards.forEach(card => {
        card.addEventListener('click', () => {
            carCards.forEach(c => c.classList.remove('active-car'));
            card.classList.add('active-car');

            const carType = card.getAttribute('data-car');
            if (protoImg && protoTitle) {
                if (carType === 'SUV') {
                    protoImg.textContent = '🚙';
                    protoTitle.textContent = 'Adventure SUV';
                } else if (carType === 'Sedan') {
                    protoImg.textContent = '🚗';
                    protoTitle.textContent = 'Luxury Sedan';
                } else if (carType === 'Sport') {
                    protoImg.textContent = '🏎️';
                    protoTitle.textContent = 'Sport Turbo';
                }
            }
        });
    });

    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            const activeCar = document.querySelector('.mock-car-card.active-car .car-name').textContent;
            alert(`Saree3 System Demo:\nReserved your selection of ${activeCar}!`);
        });
    }

    /* --- NurseConnect Mockup (Request connection) --- */
    const nurseCards = document.querySelectorAll('.avatar-card');
    const connectBtn = document.querySelector('.mock-btn-connect');
    const protoBtn = document.getElementById('nurse-proto-btn');
    const progressFill = document.getElementById('conn-progress-fill');
    const progressContainer = document.getElementById('conn-progress-container');

    nurseCards.forEach(card => {
        card.addEventListener('click', () => {
            nurseCards.forEach(c => c.classList.remove('active-nurse'));
            card.classList.add('active-nurse');
            
            const name = card.getAttribute('data-nurse');
            const statusLabel = document.querySelector('.request-status');
            if (statusLabel) {
                statusLabel.textContent = `Connect to ${name}`;
            }

            // Sync with modal prototype if open
            const protoCardName = document.querySelector('#nurse-proto-card h4');
            const protoCardAvatar = document.querySelector('#nurse-proto-card .wf-avatar');
            if (protoCardName && protoCardAvatar) {
                protoCardName.textContent = name === 'Dr. Sarah' ? 'Sarah Jenkins' : 'Alex Rivera';
                protoCardAvatar.textContent = name === 'Dr. Sarah' ? '👩‍⚕️' : '👨‍⚕️';
            }
        });
    });

    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            const statusLabel = document.querySelector('.request-status');
            if (statusLabel) {
                statusLabel.textContent = 'Sending...';
                setTimeout(() => {
                    statusLabel.textContent = 'Nurse Connected! ✅';
                    statusLabel.style.color = 'var(--accent-cyan)';
                }, 1500);
            }
        });
    }

    if (protoBtn) {
        protoBtn.addEventListener('click', () => {
            protoBtn.style.display = 'none';
            if (progressContainer && progressFill) {
                progressContainer.style.display = 'block';
                progressFill.style.width = '0%';
                
                // Simulate loading progression
                let w = 0;
                const interval = setInterval(() => {
                    w += 4;
                    progressFill.style.width = `${w}%`;
                    if (w >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            alert('Prototype Event:\nCall connected with Doctor Sarah!');
                            progressContainer.style.display = 'none';
                            protoBtn.style.display = 'block';
                        }, 500);
                    }
                }, 60);
            }
        });
    }

    /* --- Shefa Accessibility Simulator --- */
    const textBtn = document.getElementById('sim-text-btn');
    const contrastBtn = document.getElementById('sim-contrast-btn');
    const simBox = document.getElementById('shefa-sim-box');

    if (textBtn) {
        textBtn.addEventListener('click', () => {
            simBox.classList.toggle('text-large');
            textBtn.classList.toggle('active');
        });
    }

    if (contrastBtn) {
        contrastBtn.addEventListener('click', () => {
            simBox.classList.toggle('high-contrast');
            contrastBtn.classList.toggle('active');
        });
    }

    /* --- Jailak Booking Calendar & Seat --- */
    const days = document.querySelectorAll('.cal-day');
    const slots = document.querySelectorAll('.time-slot');
    const reserveBtn = document.querySelector('.mock-btn-reserve');

    days.forEach(day => {
        day.addEventListener('click', () => {
            days.forEach(d => d.classList.remove('active-day'));
            day.classList.add('active-day');
        });
    });

    slots.forEach(slot => {
        slot.addEventListener('click', () => {
            slots.forEach(s => s.classList.remove('active-slot'));
            slot.classList.add('active-slot');
        });
    });

    if (reserveBtn) {
        reserveBtn.addEventListener('click', () => {
            const activeDay = document.querySelector('.cal-day.active-day').textContent;
            const activeTime = document.querySelector('.time-slot.active-slot').textContent;
            alert(`Jailak Reservation Successful:\nDate: June ${activeDay}, 2026\nTime: ${activeTime}`);
        });
    }

    /* --- E-Commerce Item Adder --- */
    const addCartBtn = document.querySelector('.add-to-cart-mock');
    const cartCountEl = document.getElementById('mock-cart-count');
    let cartCount = 0;

    if (addCartBtn && cartCountEl) {
        addCartBtn.addEventListener('click', () => {
            cartCount++;
            cartCountEl.textContent = cartCount;
            // Float pulse effect on badge
            cartCountEl.style.transform = 'scale(1.4)';
            setTimeout(() => {
                cartCountEl.style.transform = 'scale(1)';
            }, 200);
        });
    }

    /* --- MCQ Quiz for Exam System --- */
    const options = document.querySelectorAll('.exam-opt');

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            // Disable click on sibling options once clicked
            const siblings = opt.parentElement.querySelectorAll('.exam-opt');
            siblings.forEach(s => s.style.pointerEvents = 'none');

            const isCorrect = opt.getAttribute('data-correct') === 'true';
            if (isCorrect) {
                opt.classList.add('correct-answer');
            } else {
                opt.classList.add('incorrect-answer');
                // Highlight the correct answer as helper
                const correctOpt = document.getElementById('exam-correct-opt');
                if (correctOpt) correctOpt.classList.add('correct-answer');
            }
        });
    });

    /* --- UX Sandbox: Elastic Slider widget --- */
    const range = document.getElementById('elastic-range');
    const bubble = document.getElementById('slider-bubble');

    if (range && bubble) {
        const updateSlider = () => {
            const val = range.value;
            bubble.textContent = val;

            // Align bubble relative positioning offset
            const min = range.min ? range.min : 0;
            const max = range.max ? range.max : 100;
            const percent = ((val - min) / (max - min)) * 100;

            // Offset alignment adjustments
            bubble.style.left = `calc(${percent}% + (${8 - percent * 0.15}px))`;
        };

        range.addEventListener('input', updateSlider);
        updateSlider(); // Initial placement
    }
}

// Shefa Modal Global Accessibility modifiers
window.toggleProtoFontSize = function() {
    const screen = document.getElementById('shefa-modal-screen');
    if (screen) {
        screen.classList.toggle('large-text');
    }
};

window.toggleProtoContrast = function() {
    const screen = document.getElementById('shefa-modal-screen');
    if (screen) {
        screen.classList.toggle('contrast-mode');
    }
};

// Jailak Modal Table map simulator
window.selectProtoTable = function(tableEl) {
    const tables = document.querySelectorAll('.proto-table');
    tables.forEach(t => t.classList.remove('selected-table'));

    tableEl.classList.add('selected-table');
    const name = tableEl.textContent.split('\n')[0];
    const statusText = document.getElementById('table-selection-status');
    if (statusText) {
        statusText.innerHTML = `Selected Table: <strong>${name}</strong> (Available &bull; Click reserve below)`;
    }
};

/* ==========================================================================
   11. Scrollspy for Navigation Link Highlights
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   12. Hamburger Menu For Mobile Screens
   ========================================================================== */
function initMobileNav() {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const overlay = document.querySelector('.mobile-nav-overlay');
    const links = document.querySelectorAll('.mobile-link');

    if (!toggle || !overlay) return;

    const toggleMenu = () => {
        toggle.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Animated hamburger lines cross
        const lines = toggle.querySelectorAll('.hamburger-line');
        if (toggle.classList.contains('active')) {
            lines[0].style.transform = 'translateY(8px) rotate(45deg)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'translateY(-8px) rotate(-45deg)';
        } else {
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
        }
    };

    toggle.addEventListener('click', toggleMenu);
    
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (overlay.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}

/* ==========================================================================
   13. ScrollTrigger GSAP Animations
   ========================================================================== */
function initScrollAnimations() {
    // Fade reveal animation for sections
    const reveals = document.querySelectorAll('.reveal-item');
    reveals.forEach(el => {
        gsap.from(el, {
            opacity: 0,
            y: 40,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Hero element stagger entries
    gsap.from('.hero-content .reveal-anim', {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out'
    });

    // Timeline items highlight trigger
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        gsap.to(item, {
            opacity: 1,
            scrollTrigger: {
                trigger: item,
                start: 'top 75%',
                end: 'bottom 25%',
                toggleActions: 'play reverse play reverse',
                onEnter: () => item.classList.add('active'),
                onLeaveBack: () => item.classList.remove('active')
            }
        });
    });
}

// Fallback reveals if GSAP CDN fails to load
function initSimpleReveals() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    const reveals = document.querySelectorAll('.reveal-item, .timeline-item');
    reveals.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
}

/* ==========================================================================
   14. Contact Form Validation Feedbacks
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('portfolio-contact-form');
    const status = document.getElementById('form-status');

    if (!form || !status) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        status.textContent = 'Sending Message...';
        status.className = 'form-status-msg';

        // Simulate REST service response latency
        setTimeout(() => {
            const name = document.getElementById('form-name').value;
            status.textContent = `Thank you, ${name}! Your mock message has been sent successfully.`;
            status.classList.add('success');
            form.reset();
            
            // Clear status after delay
            setTimeout(() => {
                status.textContent = '';
                status.className = 'form-status-msg';
            }, 5000);
        }, 1500);
    });
}

/* ==========================================================================
   15. Saree3 Mobile Modal Visual Slider
   ========================================================================== */
window.slideSaree3 = function(direction) {
    const slides = document.querySelectorAll('.saree3-mobile-slide');
    if (slides.length <= 1) return;
    
    let activeIdx = 0;
    slides.forEach((slide, idx) => {
        if (slide.classList.contains('active')) {
            activeIdx = idx;
        }
    });

    let nextIdx = (activeIdx + direction + slides.length) % slides.length;

    slides.forEach((slide, idx) => {
        slide.classList.remove('active', 'exit-left');
        if (idx === activeIdx) {
            slide.classList.add('exit-left');
        }
    });

    slides[nextIdx].classList.add('active');
};

/* ==========================================================================
   16. NurseConnect Desktop Modal Visual Slider
   ========================================================================== */
window.slideNurseConnect = function(direction) {
    const slides = document.querySelectorAll('.nurseconnect-slide');
    if (slides.length <= 1) return;
    
    let activeIdx = 0;
    slides.forEach((slide, idx) => {
        if (slide.classList.contains('active')) {
            activeIdx = idx;
        }
    });

    let nextIdx = (activeIdx + direction + slides.length) % slides.length;

    slides.forEach((slide, idx) => {
        slide.classList.remove('active', 'exit-left');
        if (idx === activeIdx) {
            slide.classList.add('exit-left');
        }
    });

    slides[nextIdx].classList.add('active');
};

/* ==========================================================================
   17. Shefaa Mobile Modal Visual Slider
   ========================================================================== */
window.slideShefaMobile = function(direction) {
    const slides = document.querySelectorAll('.shefa-mobile-slide');
    if (slides.length <= 1) return;
    
    let activeIdx = 0;
    slides.forEach((slide, idx) => {
        if (slide.classList.contains('active')) {
            activeIdx = idx;
        }
    });

    let nextIdx = (activeIdx + direction + slides.length) % slides.length;

    slides.forEach((slide, idx) => {
        slide.classList.remove('active', 'exit-left');
        if (idx === activeIdx) {
            slide.classList.add('exit-left');
        }
    });

    slides[nextIdx].classList.add('active');
};
