/* ==========================================================================
   MAYAR MOHAMED - PORTFOLIO INTERACTIVE LOGIC & ANIMATIONS
   Modern, Accessible, Performant Front-End & UI/UX Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }

    // Initialize Toast System First
    initToastSystem();

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
   0. Toast Notification System
   ========================================================================== */
function initToastSystem() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

window.showToast = function(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    // Pick SVG vector based on toast type
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
    } else if (type === 'error') {
        iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (type === 'warning') {
        iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else {
        iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Close Notification">&times;</button>
    `;

    const removeToast = () => {
        if (toast.classList.contains('removing')) return;
        toast.classList.add('removing');
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    };

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) closeBtn.addEventListener('click', removeToast);

    // Auto dismiss after 4 seconds
    const timer = setTimeout(removeToast, 4000);
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', () => setTimeout(removeToast, 2000));

    container.appendChild(toast);
};

/* ==========================================================================
   1. Custom Fluid Cursor
   ========================================================================== */
function initCustomCursor() {
    // Only initialize for fine pointer devices (desktop mouse, trackpad)
    if (!window.matchMedia('(pointer: fine)').matches) {
        return;
    }

    const cursor = document.getElementById('custom-cursor');
    const ring = document.getElementById('custom-cursor-ring');

    if (!cursor || !ring) return;

    let mouse = { x: -100, y: -100 };
    let pos = { x: -100, y: -100 };
    let ringPos = { x: -100, y: -100 };
    let isVisible = false;

    // Linear Interpolation (LERP) for smooth lagging follow effect
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        if (!isVisible) {
            cursor.style.opacity = '1';
            ring.style.opacity = '1';
            isVisible = true;
        }
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        ring.style.opacity = '0';
        isVisible = false;
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        ring.style.opacity = '1';
        isVisible = true;
    });

    function updateCursor() {
        if (isVisible) {
            pos.x = lerp(pos.x, mouse.x, 0.35);
            pos.y = lerp(pos.y, mouse.y, 0.35);
            cursor.style.left = `${pos.x}px`;
            cursor.style.top = `${pos.y}px`;

            ringPos.x = lerp(ringPos.x, mouse.x, 0.12);
            ringPos.y = lerp(ringPos.y, mouse.y, 0.12);
            ring.style.left = `${ringPos.x}px`;
            ring.style.top = `${ringPos.y}px`;
        }

        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover states for clickable items
    const clickables = document.querySelectorAll(
        'a, button, input, textarea, .skill-tab, .filter-btn, .avatar-card, .mock-car-card, .time-slot, .cal-day, .proto-table, [data-tilt], .hero-profile-pic, .slider-dot, .slider-btn, .interactive-tag, .chip'
    );
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
    let particleCount = window.innerWidth < 768 ? 30 : 60;
    let connectionDistance = window.innerWidth < 768 ? 90 : 120;
    let mouse = { x: null, y: null, radius: 150 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

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

            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            const isDark = document.body.classList.contains('dark-theme');
            ctx.fillStyle = isDark ? 'rgba(0, 242, 254, 0.4)' : 'rgba(124, 58, 237, 0.3)';
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const isDark = document.body.classList.contains('dark-theme');
        const lineColor = isDark ? 'rgba(0, 242, 254, ' : 'rgba(124, 58, 237, ';

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();

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
    const rawWords = el.getAttribute('data-words');
    let words = ['Front-End Developer', 'UI/UX Designer', 'Creative Technologist'];
    try {
        if (rawWords) words = JSON.parse(rawWords);
    } catch(e) {}

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
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && currentTxt === '') {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            typeSpeed = 450;
        }

        setTimeout(type, typeSpeed);
    }
    
    setTimeout(type, 800);
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
            
            const dx = e.clientX - elCenterX;
            const dy = e.clientY - elCenterY;
            
            const pullX = (dx / (rect.width / 2)) * pullDist;
            const pullY = (dy / (rect.height / 2)) * pullDist;

            if (typeof gsap !== 'undefined') {
                gsap.to(el, {
                    x: pullX,
                    y: pullY,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else {
                el.style.transform = `translate(${pullX}px, ${pullY}px)`;
            }
        });

        el.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: 'elastic.out(1.2, 0.4)'
                });
            } else {
                el.style.transform = 'translate(0, 0)';
            }
        });
    });
}

/* ==========================================================================
   5. Spotlight 3D Depth Card Tilt
   ========================================================================== */
function init3DTiltCards() {
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const percentX = (mouseX / rect.width) * 2 - 1;
            const percentY = (mouseY / rect.height) * 2 - 1;

            const tiltMax = 10;
            const rotateX = -percentY * tiltMax;
            const rotateY = percentX * tiltMax;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
            
            const spotlight = card.querySelector('.spotlight-layer');
            if (spotlight) {
                card.style.setProperty('--x', `${((mouseX / rect.width) * 100).toFixed(1)}%`);
                card.style.setProperty('--y', `${((mouseY / rect.height) * 100).toFixed(1)}%`);
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });
}

/* ==========================================================================
   6. Light / Dark Theme Toggle With Persistence & Wipe Effect
   ========================================================================== */
function initThemeSwitcher() {
    const btn = document.getElementById('theme-toggle');
    const overlay = document.querySelector('.liquid-overlay');
    if (!btn) return;

    // Load saved preference or check system
    const savedTheme = localStorage.getItem('mayar_portfolio_theme');
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        updateToggleIcon('light');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        updateToggleIcon('dark');
    }

    function updateToggleIcon(theme) {
        if (!btn) return;
        const iconSpan = btn.querySelector('.theme-icon') || btn.querySelector('i');
        if (iconSpan) {
            if (theme === 'light') {
                iconSpan.setAttribute('data-lucide', 'moon');
            } else {
                iconSpan.setAttribute('data-lucide', 'sun');
            }
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }
    }

    let isAnimating = false;

    btn.addEventListener('click', () => {
        if (isAnimating) return;
        isAnimating = true;

        const isCurrentlyDark = document.body.classList.contains('dark-theme');
        const nextTheme = isCurrentlyDark ? 'light' : 'dark';

        if (overlay) {
            const rect = btn.getBoundingClientRect();
            const originX = rect.left + rect.width / 2;
            const originY = rect.top + rect.height / 2;

            overlay.style.backgroundColor = nextTheme === 'light' ? '#f5f7fb' : '#0a0e17';
            overlay.style.clipPath = `circle(0% at ${originX}px ${originY}px)`;
            overlay.classList.add('active');

            setTimeout(() => {
                overlay.style.clipPath = `circle(150% at ${originX}px ${originY}px)`;
            }, 30);

            setTimeout(() => {
                if (nextTheme === 'light') {
                    document.body.classList.remove('dark-theme');
                    document.body.classList.add('light-theme');
                } else {
                    document.body.classList.remove('light-theme');
                    document.body.classList.add('dark-theme');
                }
                localStorage.setItem('mayar_portfolio_theme', nextTheme);
                updateToggleIcon(nextTheme);
            }, 450);

            setTimeout(() => {
                overlay.style.clipPath = `circle(0% at ${originX}px ${originY}px)`;
                setTimeout(() => {
                    overlay.classList.remove('active');
                    isAnimating = false;
                }, 400);
            }, 900);
        } else {
            if (nextTheme === 'light') {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
            }
            localStorage.setItem('mayar_portfolio_theme', nextTheme);
            updateToggleIcon(nextTheme);
            isAnimating = false;
        }
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
                p.querySelectorAll('.progress-fill').forEach(fill => {
                    fill.style.width = '0%';
                });
            });

            tab.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                
                setTimeout(() => {
                    targetPanel.querySelectorAll('.progress-fill').forEach(fill => {
                        const labelEl = fill.closest('.skill-item')?.querySelector('.skill-level') ||
                                        fill.parentElement?.previousElementSibling?.lastElementChild;
                        if (labelEl) {
                            fill.style.width = labelEl.textContent.trim();
                        }
                    });
                }, 60);
            }
        });
    });

    // Trigger initial active panel progress
    const activePanel = document.querySelector('.skills-panel.active');
    if (activePanel) {
        setTimeout(() => {
            activePanel.querySelectorAll('.progress-fill').forEach(fill => {
                const labelEl = fill.closest('.skill-item')?.querySelector('.skill-level') ||
                                fill.parentElement?.previousElementSibling?.lastElementChild;
                if (labelEl) {
                    fill.style.width = labelEl.textContent.trim();
                }
            });
        }, 400);
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
                const matches = (filter === 'all' || categories.includes(filter));

                if (typeof gsap !== 'undefined') {
                    if (matches) {
                        gsap.to(card, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.35,
                            ease: 'power2.out',
                            display: 'flex'
                        });
                    } else {
                        gsap.to(card, {
                            scale: 0.92,
                            opacity: 0,
                            duration: 0.25,
                            ease: 'power2.out',
                            display: 'none'
                        });
                    }
                } else {
                    if (matches) {
                        card.style.display = 'flex';
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    } else {
                        card.style.display = 'none';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.92)';
                    }
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
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeModal = (modal) => {
        modal.classList.remove('active');
        const remaining = document.querySelector('.project-modal.active');
        if (!remaining) {
            document.body.style.overflow = '';
        }
    };

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.project-modal');
            if (modal) closeModal(modal);
        });
    });

    // Keyboard controls: Escape to close; Left/Right arrows to cycle active modal slider
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(m => m.classList.remove('active'));
            document.body.style.overflow = '';
        } else if (e.key === 'ArrowRight') {
            const activeModal = document.querySelector('.project-modal.active');
            if (activeModal) {
                if (activeModal.id === 'saree3-mobile-modal') window.slideSaree3(1);
                else if (activeModal.id === '3naya-modal') window.slideNurseConnect(1);
                else if (activeModal.id === 'shefa-mobile-modal') window.slideShefaMobile(1);
            }
        } else if (e.key === 'ArrowLeft') {
            const activeModal = document.querySelector('.project-modal.active');
            if (activeModal) {
                if (activeModal.id === 'saree3-mobile-modal') window.slideSaree3(-1);
                else if (activeModal.id === '3naya-modal') window.slideNurseConnect(-1);
                else if (activeModal.id === 'shefa-mobile-modal') window.slideShefaMobile(-1);
            }
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
            const activeCar = document.querySelector('.mock-car-card.active-car .car-name')?.textContent || 'Luxury Sedan';
            window.showToast('Ride Reserved!', `Confirmed reservation for ${activeCar}. Driver dispatched.`, 'success');
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
            const activeDay = document.querySelector('.cal-day.active-day')?.textContent.trim() || '15';
            const activeTime = document.querySelector('.time-slot.active-slot')?.textContent.trim() || '7:00 PM';
            window.showToast('Reservation Confirmed', `Table reserved for June ${activeDay}, 2026 at ${activeTime}.`, 'success');
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
            cartCountEl.style.transform = 'scale(1.4)';
            setTimeout(() => {
                cartCountEl.style.transform = 'scale(1)';
            }, 200);
            window.showToast('Cart Updated', 'Added item to cart (Total: ' + cartCount + ').', 'info');
        });
    }

    /* --- MCQ Quiz for Exam System --- */
    const options = document.querySelectorAll('.exam-opt');

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            const siblings = opt.parentElement.querySelectorAll('.exam-opt');
            siblings.forEach(s => s.style.pointerEvents = 'none');

            const isCorrect = opt.getAttribute('data-correct') === 'true';
            if (isCorrect) {
                opt.classList.add('correct-answer');
                window.showToast('Correct Answer! 🎉', 'You selected the optimal UX solution.', 'success');
            } else {
                opt.classList.add('incorrect-answer');
                const correctOpt = document.getElementById('exam-correct-opt');
                if (correctOpt) correctOpt.classList.add('correct-answer');
                window.showToast('Needs Review', 'Option is incorrect. Highlighted the optimal design choice.', 'warning');
            }
        });
    });

    /* --- UX Sandbox: Elastic Slider widget --- */
    const range = document.getElementById('elastic-range');
    const bubble = document.getElementById('slider-bubble');

    if (range && bubble) {
        const updateSlider = () => {
            const val = range.value;
            bubble.innerHTML = `<span>${val}</span>`;

            const min = range.min ? parseFloat(range.min) : 0;
            const max = range.max ? parseFloat(range.max) : 100;
            const percent = ((val - min) / (max - min)) * 100;

            bubble.style.left = `calc(${percent}% + (${8 - percent * 0.16}px))`;
        };

        range.addEventListener('input', updateSlider);
        updateSlider();
    }
}

// Global modal helpers
window.selectProtoTable = function(tableEl) {
    const tables = document.querySelectorAll('.proto-table');
    tables.forEach(t => t.classList.remove('selected-table'));

    tableEl.classList.add('selected-table');
    const name = tableEl.textContent.split('\n')[0].trim();
    const statusText = document.getElementById('table-selection-status');
    if (statusText) {
        statusText.innerHTML = `Selected Table: <strong>${name}</strong> (Available &bull; Click reserve below)`;
    }
    window.showToast('Table Selected', `${name} is ready for booking.`, 'info');
};

/* ==========================================================================
   11. Scrollspy for Navigation Link Highlights
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const updateActiveNav = () => {
        let currentSectionId = '';
        const scrollPos = window.scrollY + 220;

        // Bottom of page detection for Contact section
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 60) {
            currentSectionId = 'contact';
        } else {
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    currentSectionId = section.getAttribute('id');
                }
            });
        }

        const updateLinks = (links) => {
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href === `#${currentSectionId}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        };

        updateLinks(navLinks);
        updateLinks(mobileLinks);
    };

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
}

/* ==========================================================================
   12. Hamburger Menu For Mobile Screens
   ========================================================================== */
function initMobileNav() {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const overlay = document.querySelector('.mobile-nav-overlay');
    const links = document.querySelectorAll('.mobile-link');

    if (!toggle || !overlay) return;

    const openMenu = () => {
        toggle.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        const lines = toggle.querySelectorAll('.hamburger-line');
        if (lines.length === 3) {
            lines[0].style.transform = 'translateY(8px) rotate(45deg)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'translateY(-8px) rotate(-45deg)';
        }
    };

    const closeMenu = () => {
        toggle.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';

        const lines = toggle.querySelectorAll('.hamburger-line');
        if (lines.length === 3) {
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
        }
    };

    toggle.addEventListener('click', () => {
        if (overlay.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeMenu();
        }
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeMenu();
        }
    });
}

/* ==========================================================================
   13. ScrollTrigger GSAP Animations
   ========================================================================== */
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal-item');
    reveals.forEach(el => {
        gsap.from(el, {
            opacity: 0,
            y: 35,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    if (document.querySelector('.hero-content .reveal-anim')) {
        gsap.from('.hero-content .reveal-anim', {
            opacity: 0,
            y: 25,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out'
        });
    }

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
        el.style.transform = 'translateY(25px)';
        el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        observer.observe(el);
    });
}

/* ==========================================================================
   14. Contact Form Validation & Submission Feedback
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('portfolio-contact-form');
    const status = document.getElementById('form-status');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('form-name');
        const emailInput = document.getElementById('form-email');
        const messageInput = document.getElementById('form-message');
        const submitBtn = form.querySelector('button[type="submit"]');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        // Validation
        if (name.length < 2) {
            window.showToast('Validation Error', 'Please enter your name.', 'error');
            if (nameInput) nameInput.focus();
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            window.showToast('Validation Error', 'Please enter a valid email address.', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        if (message.length < 5) {
            window.showToast('Validation Error', 'Please write a short message (at least 5 characters).', 'error');
            if (messageInput) messageInput.focus();
            return;
        }

        // Loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.dataset.originalHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending Message...</span>';
        }

        if (status) {
            status.textContent = 'Transmitting securely...';
            status.className = 'form-status-msg info';
        }

        // Simulate network delivery
        setTimeout(() => {
            if (status) {
                status.textContent = `Thank you, ${name}! Your message has been sent successfully.`;
                status.className = 'form-status-msg success';
            }

            window.showToast(
                'Message Sent! 🚀',
                `Thank you ${name}, your inquiry has been received. Mayar will respond shortly.`,
                'success'
            );

            form.reset();

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = submitBtn.dataset.originalHtml || '<span>Send Message</span>';
            }

            setTimeout(() => {
                if (status) {
                    status.textContent = '';
                    status.className = 'form-status-msg';
                }
            }, 6000);
        }, 1200);
    });
}

/* ==========================================================================
   15. Bidirectional Sliders with Dots Synchronization
   ========================================================================== */
function updateDots(selector, activeIdx) {
    const dotsContainer = document.getElementById(selector) || document.querySelector('.' + selector);
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, idx) => {
        if (idx === activeIdx) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Saree3 Mobile Slider
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
    window.goToSaree3Slide(nextIdx, direction);
};

window.goToSaree3Slide = function(targetIdx, direction = 1) {
    const slides = document.querySelectorAll('.saree3-mobile-slide');
    if (!slides.length || targetIdx < 0 || targetIdx >= slides.length) return;

    let activeIdx = 0;
    slides.forEach((slide, idx) => {
        if (slide.classList.contains('active')) activeIdx = idx;
    });

    if (activeIdx === targetIdx) return;

    slides.forEach((slide, idx) => {
        slide.classList.remove('active', 'exit-left', 'exit-right');
        if (idx === activeIdx) {
            slide.classList.add(direction >= 0 ? 'exit-left' : 'exit-right');
        }
    });

    slides[targetIdx].classList.add('active');
    updateDots('saree3-dots', targetIdx);
};

// NurseConnect Desktop Slider
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
    window.goToNurseConnectSlide(nextIdx, direction);
};

window.goToNurseConnectSlide = function(targetIdx, direction = 1) {
    const slides = document.querySelectorAll('.nurseconnect-slide');
    if (!slides.length || targetIdx < 0 || targetIdx >= slides.length) return;

    let activeIdx = 0;
    slides.forEach((slide, idx) => {
        if (slide.classList.contains('active')) activeIdx = idx;
    });

    if (activeIdx === targetIdx) return;

    slides.forEach((slide, idx) => {
        slide.classList.remove('active', 'exit-left', 'exit-right');
        if (idx === activeIdx) {
            slide.classList.add(direction >= 0 ? 'exit-left' : 'exit-right');
        }
    });

    slides[targetIdx].classList.add('active');
    updateDots('nurseconnect-dots', targetIdx);
};

// Shefaa Mobile Slider
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
    window.goToShefaMobileSlide(nextIdx, direction);
};

window.goToShefaMobileSlide = function(targetIdx, direction = 1) {
    const slides = document.querySelectorAll('.shefa-mobile-slide');
    if (!slides.length || targetIdx < 0 || targetIdx >= slides.length) return;

    let activeIdx = 0;
    slides.forEach((slide, idx) => {
        if (slide.classList.contains('active')) activeIdx = idx;
    });

    if (activeIdx === targetIdx) return;

    slides.forEach((slide, idx) => {
        slide.classList.remove('active', 'exit-left', 'exit-right');
        if (idx === activeIdx) {
            slide.classList.add(direction >= 0 ? 'exit-left' : 'exit-right');
        }
    });

    slides[targetIdx].classList.add('active');
    updateDots('shefa-mobile-dots', targetIdx);
};
