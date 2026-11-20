/**
 * Love Psychic — Main JS
 */

// Header scroll effect
(function() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollY = window.pageYOffset;
        header.classList.toggle('scrolled', scrollY > 50);
        lastScroll = scrollY;
    }, { passive: true });
})();

// Intersection Observer for fade-in animations
(function() {
    const targets = document.querySelectorAll('.fade-in');
    if (!targets.length) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function(el) { observer.observe(el); });
})();

// FAQ Accordion
(function() {
    document.querySelectorAll('.faq-item__question').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const item = this.closest('.faq-item');
            const isActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item.active').forEach(function(el) {
                el.classList.remove('active');
            });

            // Open clicked (if not already open)
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
})();

// Smooth scroll for anchor links
(function() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
})();
