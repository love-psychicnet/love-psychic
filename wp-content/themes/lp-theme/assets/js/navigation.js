/**
 * Mobile Navigation Toggle
 */
(function() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;

    const openIcon = toggle.querySelector('.menu-toggle__open');
    const closeIcon = toggle.querySelector('.menu-toggle__close');

    toggle.addEventListener('click', function() {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen);
        openIcon.style.display = isOpen ? 'none' : '';
        closeIcon.style.display = isOpen ? '' : 'none';
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    nav.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            openIcon.style.display = '';
            closeIcon.style.display = 'none';
            document.body.style.overflow = '';
        });
    });
})();
