document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    burger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => {
        revealObserver.observe(el);
    });

    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                const suffix = el.dataset.suffix || '';
                const duration = 2000;
                const start = performance.now();

                const tick = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(eased * target);
                    el.textContent = current.toLocaleString('ru-RU') + suffix;
                    if (progress < 1) requestAnimationFrame(tick);
                };

                requestAnimationFrame(tick);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    const fleetItems = document.querySelectorAll('.fleet-item');
    fleetItems.forEach((item, i) => {
        item.style.transitionDelay = `${i * 0.1}s`;
    });

    const geoMap = document.querySelector('.geo-map');
    if (geoMap) {
        const mapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 1s ease both';
                    mapObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        mapObserver.observe(geoMap);
    }

    const ctaForm = document.getElementById('ctaForm');
    const formNote = document.getElementById('formNote');
    ctaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        formNote.hidden = false;
        ctaForm.reset();
        setTimeout(() => { formNote.hidden = true; }, 5000);
    });

    const heroTruck = document.getElementById('heroTruck');
    let mouseX = 0, mouseY = 0;
    let truckX = 0, truckY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 10;
    }, { passive: true });

    const animateTruck = () => {
        truckX += (mouseX - truckX) * 0.05;
        truckY += (mouseY - truckY) * 0.05;
        if (heroTruck) {
            heroTruck.style.transform = `translate(${truckX}px, ${truckY}px)`;
        }
        requestAnimationFrame(animateTruck);
    };
    animateTruck();

    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
