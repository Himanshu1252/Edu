document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Enhanced Form Validation ---
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validateRollNumber = (roll) => /^[A-Z0-9]{3,10}$/.test(roll);
    const validatePassword = (pass) => pass.length >= 6;

    // Real-time validation for all inputs
    const inputFields = document.querySelectorAll('.input-field');
    inputFields.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        input.addEventListener('input', function() {
            if (this.value) {
                this.classList.remove('error');
                const errorSpan = this.parentElement.querySelector('.input-error');
                if (errorSpan) errorSpan.style.display = 'none';
            }
        });
    });

    const validateField = (field) => {
        const errorSpan = field.parentElement.querySelector('.input-error');
        if (!errorSpan) return true;

        let isValid = true;
        const value = field.value.trim();
        const name = field.name;

        if (!value) {
            isValid = false;
            errorSpan.textContent = `${field.previousElementSibling?.textContent || 'Field'} is required`;
        } else if (name === 'roll_number' && !validateRollNumber(value) && value.length > 0) {
            isValid = false;
            errorSpan.textContent = 'Invalid roll number format';
        } else if (name === 'password' && !validatePassword(value)) {
            isValid = false;
            errorSpan.textContent = 'Password must be at least 6 characters';
        } else if (name === 'username' && value.length < 3) {
            isValid = false;
            errorSpan.textContent = 'Username must be at least 3 characters';
        }

        if (isValid) {
            errorSpan.style.display = 'none';
            field.classList.remove('error');
        } else {
            errorSpan.style.display = 'block';
            field.classList.add('error');
        }
        return isValid;
    };

    // --- 2. Password Strength Indicator ---
    const regPasswordField = document.getElementById('reg_password');
    if (regPasswordField) {
        const strengthBar = regPasswordField.closest('.form-group')?.nextElementSibling;
        if (strengthBar && strengthBar.classList.contains('password-strength')) {
            regPasswordField.addEventListener('input', function() {
                const pass = this.value;
                let strength = 0;
                const progressFill = strengthBar.querySelector('.strength-progress');
                const strengthText = document.getElementById('strength-text');

                if (pass.length >= 6) strength += 25;
                if (pass.length >= 8) strength += 25;
                if (/[A-Z]/.test(pass)) strength += 25;
                if (/[0-9!@#$%^&*]/.test(pass)) strength += 25;

                if (progressFill) {
                    progressFill.style.width = strength + '%';
                    let label = 'Weak';
                    let color = var(--danger);
                    if (strength >= 75) {
                        label = 'Strong';
                        color = var(--success);
                    } else if (strength >= 50) {
                        label = 'Medium';
                        color = var(--accent-secondary);
                    }
                    if (strengthText) strengthText.textContent = `Password strength: ${label}`;
                }

                strengthBar.style.display = 'block';
            });
        }
    }

    // --- 3. Client-Side Validation for Marks ---
    const marksInputs = document.querySelectorAll('input[name="marks"]');
    marksInputs.forEach(input => {
        input.addEventListener('input', function() {
            let value = parseInt(this.value);
            if (value < 0) this.value = 0;
            if (value > 100) this.value = 100;
        });
        input.addEventListener('change', function() {
            validateField(this);
        });
    });

    // --- 4. Delete Confirmation with Enhanced Dialog ---
    const deleteForms = document.querySelectorAll('form');
    deleteForms.forEach(form => {
        const actionInput = form.querySelector('input[name="action"]');
        if (actionInput && actionInput.value === 'delete_student') {
            const deleteBtn = form.querySelector('button');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const rollNumber = form.querySelector('input[name="roll_number"]')?.value;
                    if (confirm(`⚠️ Are you sure you want to permanently remove student ${rollNumber}? This action cannot be undone.`)) {
                        form.submit();
                    }
                });
            }
        }
    });

    // --- 5. Admin Dashboard Statistics ---
    const updateAdminStats = () => {
        const rows = document.querySelectorAll('tbody tr');
        if (rows.length === 0) return;

        let totalStudents = new Set();
        let totalPercentage = 0;
        let highestScore = 0;
        let passCount = 0;

        rows.forEach(row => {
            const rollCell = row.querySelector('td:first-child');
            if (rollCell) totalStudents.add(rollCell.textContent.trim());
            
            const percentageCell = row.querySelector('td:nth-child(7)');
            const percentValue = parseInt(percentageCell?.textContent) || 0;
            totalPercentage += percentValue;
            
            const marksCell = row.querySelector('td:nth-child(5)');
            const marksValue = parseInt(marksCell?.textContent) || 0;
            if (marksValue > highestScore) highestScore = marksValue;
            
            if (percentValue >= 40) passCount++;
        });

        const totalCount = totalStudents.size || rows.length;
        const avgPercentage = (totalPercentage / rows.length).toFixed(1);
        const passRate = ((passCount / rows.length) * 100).toFixed(1);

        const updateStat = (id, value, suffix = '') => {
            const elem = document.getElementById(id);
            if (elem) {
                const displayValue = typeof value === 'number' ? value.toFixed(1) : value;
                animateValue(elem, displayValue + suffix);
            }
        };

        updateStat('stat-total-students', totalCount, '');
        updateStat('stat-avg-percentage', avgPercentage, '%');
        updateStat('stat-top-student', highestScore, '');
        updateStat('stat-pass-rate', passRate, '%');
    };

    const animateValue = (element, finalValue) => {
        if (element.textContent === finalValue) return;
        if (typeof gsap !== 'undefined') {
            gsap.to(element, { 
                textContent: finalValue, 
                duration: 0.8, 
                snap: { textContent: 1 },
                ease: 'power2.out'
            });
        } else {
            element.textContent = finalValue;
        }
    };

    // Call on page load and update when table changes
    updateAdminStats();

    // --- 6. Student Page Statistics ---
    const updateStudentStats = () => {
        const rows = document.querySelectorAll('tbody tr');
        if (rows.length === 0) return;

        let totalMarks = 0;
        rows.forEach(row => {
            const marksCell = row.querySelector('td:nth-child(2)');
            const marks = parseInt(marksCell?.textContent) || 0;
            totalMarks += marks;
        });

        const avgMarks = (totalMarks / rows.length).toFixed(2);
        const totalSubjectsElem = document.getElementById('total-subjects');
        const avgScoreElem = document.getElementById('avg-score');

        if (totalSubjectsElem) {
            if (typeof gsap !== 'undefined') {
                gsap.to(totalSubjectsElem, { textContent: rows.length, duration: 0.8, snap: { textContent: 1 } });
            } else {
                totalSubjectsElem.textContent = rows.length;
            }
        }
        
        if (avgScoreElem) {
            if (typeof gsap !== 'undefined') {
                gsap.to(avgScoreElem, { textContent: avgMarks, duration: 0.8, snap: { textContent: 0.01 } });
            } else {
                avgScoreElem.textContent = avgMarks;
            }
        }
    };

    updateStudentStats();

    // --- 7. Table Search and Filter ---
    const tableSearch = document.getElementById('table-search');
    if (tableSearch) {
        tableSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    // --- 8. Table Sorting ---
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            const rows = Array.from(document.querySelectorAll('tbody tr'));
            const sortType = this.value;
            
            rows.sort((a, b) => {
                let aVal, bVal;
                
                switch(sortType) {
                    case 'name':
                        aVal = a.cells[1]?.textContent;
                        bVal = b.cells[1]?.textContent;
                        break;
                    case 'roll_number':
                        aVal = a.cells[0]?.textContent;
                        bVal = b.cells[0]?.textContent;
                        break;
                    case 'percentage':
                        aVal = parseInt(a.cells[6]?.textContent) || 0;
                        bVal = parseInt(b.cells[6]?.textContent) || 0;
                        break;
                    case 'marks':
                        aVal = parseInt(a.cells[4]?.textContent) || 0;
                        bVal = parseInt(b.cells[4]?.textContent) || 0;
                        break;
                    default: return 0;
                }
                
                if (typeof aVal === 'string') return aVal.localeCompare(bVal);
                return aVal - bVal;
            });

            const tbody = document.querySelector('tbody');
            rows.forEach(row => tbody.appendChild(row));
        });
    }

    // --- 9. Print Results Button ---
    const printBtn = document.getElementById('print-results');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // --- 10. Download PDF Button (basic implementation) ---
    const downloadBtn = document.getElementById('download-results');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            showToast('success', 'PDF download feature coming soon!');
        });
    }

    // --- 11. GSAP Entry Animations ---
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
        gsap.from(".stat-card", {
            scale: 0.8,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.7)"
        });
    }

    // --- 12. Custom 3D Extreme Tilt Effect ---
    const tiltElements = document.querySelectorAll('.tilt-effect');
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            
            const xPct = (x / rect.width - 0.5) * 2;
            const yPct = (y / rect.height - 0.5) * 2;
            
            const maxTiltX = 8; // deeper rotation
            const maxTiltY = 8;

            const rotateX =  maxTiltY * yPct * -1;
            const rotateY = maxTiltX * xPct;

            // EXTREME Hover lift & glow while tilted
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

    // --- 13. Ripple Effects ---
    const ripples = document.querySelectorAll('[data-ripple="true"], .btn-primary, .btn-danger');
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

    // --- 14. Animated Counters ---
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const targetText = counter.innerText.trim();
        // If it contains a slash (like 286/300), don't animate it to avoid breaking the format
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

    // --- 15. TS Particles (Futuristic Network) ---
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

    // --- 16. Toast Receiver ---
    const flashDataElement = document.getElementById('flash-data');
    if (flashDataElement) {
        try {
            const flashes = JSON.parse(flashDataElement.textContent);
            flashes.forEach((flash, index) => {
                setTimeout(() => showToast(flash.category, flash.message), index * 300);
            });
        } catch (e) {
            console.error('Error parsing flash messages:', e);
        }
    }

    // --- 17. Form Submit Loading State ---
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="loading\"></span> Processing...';
                submitBtn.disabled = true;
                
                // Re-enable after 2 seconds if no submission occurs
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
    });

    // --- 18. Input Focus Effects ---
    const allInputs = document.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement?.classList.add('focused');
        });
        input.addEventListener('blur', function() {
            this.parentElement?.classList.remove('focused');
        });
    });
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
