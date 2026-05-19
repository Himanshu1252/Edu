document.addEventListener('DOMContentLoaded', () => {

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

    // --- 2. GSAP Entry Animations (Refined Editorial Style) ---
    if (typeof gsap !== "undefined") {
        gsap.from(".site-header", { y: -20, opacity: 0, duration: 1, ease: "power3.out" });
        
        gsap.from(".hero-text > *", {
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.2
        });
        
        gsap.from(".editorial-panel", { 
            y: 40, 
            opacity: 0, 
            duration: 1.2, 
            stagger: 0.15, 
            ease: "power3.out",
            delay: 0.3
        });
        
        gsap.from("tbody tr", {
            y: 20,
            opacity: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.out",
            delay: 0.5
        });
    }

    // --- 3. Animated Counters ---
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const targetText = counter.innerText.trim();
        // If it contains a slash (like 286/300), don't animate it
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

    // --- 4. Toast Receiver ---
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
});

function showToast(category, message) {
    let container = document.querySelector('.flash-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'flash-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `flash-message ${category}`;
    const icon = category === 'error' ? '⚠' : '✓';
    toast.innerHTML = `<span style="font-weight:bold">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (typeof gsap !== "undefined") {
            gsap.to(toast, { y: -20, opacity: 0, duration: 0.4, ease: "power2.in", onComplete: () => toast.remove() });
        } else {
            toast.remove();
        }
    }, 5000);
}
