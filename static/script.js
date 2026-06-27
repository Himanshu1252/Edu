document.addEventListener('DOMContentLoaded', () => {

    // --- Password Toggle ---
    const setupPasswordToggles = () => {
        document.querySelectorAll(".toggle-password").forEach((btn) => {
            btn.addEventListener("click", function () {

                const targetId = this.getAttribute("data-target");
                const input = document.getElementById(targetId);

                if (!input) return;

                if (input.type === "password") {
                    input.type = "text";
                    this.textContent = "Hide";
                } else {
                    input.type = "password";
                    this.textContent = "Show";
                }

            });
        });
    };

    setupPasswordToggles();

    // --- 1. Client-Side Validation ---
    const marksInputs = document.querySelectorAll('input[name="marks"]');
    marksInputs.forEach(input => {
        input.addEventListener('change', function() {
            let value = parseInt(this.value);
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

    // --- 2. GSAP Animations ---
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

    // --- 3. 3D Tilt Effect ---
    const tiltElements = document.querySelectorAll('.tilt-effect');

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xPct = (x / rect.width - 0.5) * 2;
            const yPct = (y / rect.height - 0.5) * 2;

            const rotateX = 8 * yPct * -1;
            const rotateY = 8 * xPct;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)`;
        });
    });

    // --- 4. Ripple Effects ---
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

    // --- 5. Animated Counters ---
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        const targetText = counter.innerText.trim();
        if (targetText.includes('/')) return;

        const targetValue = parseFloat(targetText);
        if (isNaN(targetValue)) return;

        const isPercent = targetText.includes('%');

        const duration = 1500;
        const frames = 60;
        const increment = targetValue / (duration / (1000 / frames));

        let current = 0;

        const timer = setInterval(() => {
            current += increment;

            if (current >= targetValue) {
                current = targetValue;
                clearInterval(timer);
            }

            counter.innerText = isPercent
                ? current.toFixed(2) + '%'
                : Math.floor(current);

        }, 1000 / frames);
    });

    // --- 6. tsParticles ---
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
                move: { enable: true, speed: 0.8 },
                number: { value: 50 },
                opacity: { value: 0.6 },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 4 } }
            },
            detectRetina: true
        });
    }

    // --- 7. Toast Messages ---
    const flashDataElement = document.getElementById('flash-data');

    if (flashDataElement) {
        try {
            const flashes = JSON.parse(flashDataElement.textContent);

            flashes.forEach((flash, index) => {
                setTimeout(() => showToast(flash.category, flash.message), index * 300);
            });

        } catch (e) {
            console.error(e);
        }
    }

    // --- 8. Tab Switcher Logic ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Re-trigger GSAP animation for glass panels in active tab
                if (typeof gsap !== "undefined") {
                    gsap.from(targetContent.querySelectorAll(".glass-panel"), {
                        y: 30,
                        opacity: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: "power2.out"
                    });
                }
            }
        });
    });

    // --- 9. Dynamic Student Verification AJAX ---
    const loginCollegeSelect = document.getElementById('login_college');
    const loginRollInput = document.getElementById('login_roll_number');
    const verificationBox = document.getElementById('student-verification-box');
    const studentSubmitBtn = document.getElementById('btn-login-student');

    if (loginCollegeSelect && loginRollInput && verificationBox && studentSubmitBtn) {
        // Disable button initially until verified
        studentSubmitBtn.disabled = true;
        studentSubmitBtn.style.opacity = '0.5';
        studentSubmitBtn.style.pointerEvents = 'none';

        let verificationDebounce;

        const verifyStudent = async () => {
            const adminId = loginCollegeSelect.value;
            const rollNumber = loginRollInput.value.trim();

            if (!adminId || !rollNumber) {
                verificationBox.style.display = 'none';
                verificationBox.className = '';
                verificationBox.innerHTML = '';
                studentSubmitBtn.disabled = true;
                studentSubmitBtn.style.opacity = '0.5';
                studentSubmitBtn.style.pointerEvents = 'none';
                return;
            }

            // Show loading
            verificationBox.style.display = 'flex';
            verificationBox.className = 'verification-box loading';
            verificationBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying student profile...';

            try {
                const response = await fetch(`/api/get_student_details?admin_id=${adminId}&roll_number=${encodeURIComponent(rollNumber)}`);
                if (!response.ok) throw new Error('API failed');

                const data = await response.json();
                if (data.found) {
                    verificationBox.className = 'verification-box success';
                    verificationBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> Verified: <strong>${data.name}</strong> (${data.branch})`;
                    studentSubmitBtn.disabled = false;
                    studentSubmitBtn.style.opacity = '1';
                    studentSubmitBtn.style.pointerEvents = 'auto';
                } else {
                    verificationBox.className = 'verification-box error';
                    verificationBox.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Profile not registered under this college.';
                    studentSubmitBtn.disabled = true;
                    studentSubmitBtn.style.opacity = '0.5';
                    studentSubmitBtn.style.pointerEvents = 'none';
                }
            } catch (err) {
                console.error(err);
                verificationBox.className = 'verification-box error';
                verificationBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Network error during verification.';
            }
        };

        const handleInput = () => {
            clearTimeout(verificationDebounce);
            verificationDebounce = setTimeout(verifyStudent, 400);
        };

        loginCollegeSelect.addEventListener('change', verifyStudent);
        loginRollInput.addEventListener('input', handleInput);
    }

});

// --- Toast Function ---
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

    setTimeout(() => toast.remove(), 5000);
}