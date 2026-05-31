document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Dynamic Branch-to-Subject Filter Mapping ---
    // Note: The keys here must EXACTLY match the option values in your HTML dropdowns
    const subjectsByBranch = {
        "Computer": ["JAVA", "AOA", "DBMS", "IOT", "Operating Sys."],
        "Science": ["Physics", "Chemistry", "Maths"],
        "Humanities": ["English", "History", "Geography", "Business Development"]
    };

    const branchSelect = document.getElementById("branch-select");
    const subjectSelect = document.getElementById("subject-select");

    // Defensive check: Only run dropdown filter logic if elements exist on the page
    if (branchSelect && subjectSelect) {
        branchSelect.addEventListener("change", function () {
            const selectedBranch = this.value;
            const subjects = subjectsByBranch[selectedBranch] || [];

            // Reset options container back to premium default placeholder state
            subjectSelect.innerHTML = '<option value="" disabled selected hidden style="background: #1e1e24; color: #ffffff;">Select a Subject</option>';

            // Generate and inject new localized items dynamically
            subjects.forEach(subject => {
                const option = document.createElement("option");
                option.value = subject;
                option.textContent = subject;
                
                // Keep premium dark styling clean across system environments
                option.style.background = "#1e1e24";
                option.style.color = "#ffffff";
                
                subjectSelect.appendChild(option);
            });
        });
    }

    // --- 2. Client-Side Integrity Validations ---
    const marksInputs = document.querySelectorAll('input[name="marks"]');
    marksInputs.forEach(input => {
        input.addEventListener('change', function() {
            let value = parseInt(this.value, 10);
            if (isNaN(value)) return;
            if (value < 0) this.value = 0;
            if (value > 100) this.value = 100;
        });
    });

    const deleteForms = document.querySelectorAll('form[action="/admin"]');
    deleteForms.forEach(form => {
        const actionInput = form.querySelector('input[name="action"]');
        if (actionInput && actionInput.value === 'delete_student') {
            form.addEventListener('submit', function(e) {
                if (!confirm('Are you absolutely sure you want to completely remove this student profile?')) {
                    e.preventDefault();
                }
            });
        }
    });

    // --- 3. GSAP Structural UI Animations ---
    if (typeof gsap !== "undefined") {
        gsap.from("header", { y: -40, opacity: 0, duration: 1, ease: "power4.out" });
        gsap.from(".glass-panel", { 
            y: 60, 
            opacity: 0, 
            duration: 1, 
            stagger: 0.15, 
            ease: "circ.out",
            delay: 0.1
        });
        gsap.from("tbody tr", {
            x: -30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            delay: 0.5
        });
    }

    // --- 4. Custom 3D Card Hover Inertia (Tilt) ---
    const tiltElements = document.querySelectorAll('.tilt-effect');
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            
            const xPct = (x / rect.width - 0.5) * 2;
            const yPct = (y / rect.height - 0.5) * 2;
            
            const maxTiltX = 8; 
            const maxTiltY = 8;

            const rotateX = maxTiltY * yPct * -1;
            const rotateY = maxTiltX * xPct;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;
            el.style.boxShadow = `0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.3)`;
            el.style.borderColor = `rgba(255, 255, 255, 0.2)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)`;
            el.style.boxShadow = '';
            el.style.borderColor = '';
            el.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.6s ease, border-color 0.6s ease';
        });
        
        el.addEventListener('mouseenter', () => {
            el.style.transition = 'transform 0.1s ease-out';
        });
    });

    // --- 5. Button Ripple Engine ---
    const ripples = document.querySelectorAll('.btn-primary, .btn-danger');
    ripples.forEach(btn => {
        btn.addEventListener('mousedown', function (e) {
            let x = e.clientX - e.target.getBoundingClientRect().left;
            let y = e.clientY - e.target.getBoundingClientRect().top;
            
            let ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 400); 
        });
    });

    // --- 6. Stats Counter Micro-Animations ---
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const targetText = counter.innerText.trim();
        if (targetText.includes('/')) return;
        
        const targetValue = parseFloat(targetText);
        if(isNaN(targetValue)) return;
        
        const isPercent = targetText.includes('%');
        const duration = 1500; 
        const frames = 60;
        const increment = targetValue / (duration / (1000/frames));
        
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                current = targetValue;
                clearInterval(timer);
            }
            if (isPercent || current % 1 !== 0) {
                counter.innerText = current.toFixed(2) + (isPercent ? '%' : '');
            } else {
                counter.innerText = Math.floor(current) + (isPercent ? '%' : '');
            }
        }, 1000/frames);
    });

    // --- 7. TS Particles Background Node Network ---
    if (typeof tsParticles !== "undefined") {
        tsParticles.load("tsparticles", {
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            interactivity: { 
                events: { onHover: { enable: true, mode: "repulse" } }, 
                modes: { repulse: { distance: 120, duration: 0.4 } } 
            },
            particles: {
                color: { value: ["#6366F1", "#EC4899", "#8B5CF6"] },
                links: { color: "#8B5CF6", distance: 150, enable: true, opacity: 0.3, width: 1.5 },
                move: { enable: true, speed: 0.8, direction: "none", random: true, straight: false, outModes: "out" },
                number: { density: { enable: true, area: 800 }, value: 50 },
                opacity: { value: 0.6 },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 4 } }
            },
            detectRetina: true
        });
    }

    // --- 8. Backend Flask Toast Notifications ---
    const flashDataElement = document.getElementById('flash-data');
    if (flashDataElement) {
        try {
            const flashes = JSON.parse(flashDataElement.textContent);
            flashes.forEach((flash, index) => {
                setTimeout(() => showToast(flash.category, flash.message), index * 300);
            });
        } catch (e) {
            console.error("Flash parsing error:", e);
        }
    }
});

function showToast(category, message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${category}`;
    const icon = category === 'error' ? '⚠️' : '✅';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    if (typeof gsap !== "undefined") {
        gsap.from(toast, { x: 80, opacity: 0, duration: 0.6, ease: "back.out(1.7)" });
        setTimeout(() => gsap.to(toast, { x: 80, opacity: 0, duration: 0.4, ease: "power2.in", onComplete: () => toast.remove() }), 5000);
    } else {
        setTimeout(() => toast.remove(), 5000);
    }
}