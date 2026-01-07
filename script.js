        // Presentation State
        let currentSlide = 1;
        let currentHoveredIndex = -1;
        let hoverableItems = [];
        const slides = document.querySelectorAll('.slide');
        // detect actual number of slides dynamically to avoid mismatches
        const totalSlides = slides.length || 0;
        const progressBar = document.getElementById('progressBar');
        const slideCounter = document.getElementById('slideCounter');
        const navDots = document.getElementById('navDots');
        const prevArrow = document.getElementById('prevArrow');
        const nextArrow = document.getElementById('nextArrow');

        // Initialize Navigation Dots
        function initNavDots() {
            for (let i = 1; i <= totalSlides; i++) {
                const dot = document.createElement('div');
                dot.className = 'nav-dot';
                if (i === 1) dot.classList.add('active');
                // allow clicking on dots to jump to a slide
                dot.addEventListener('click', () => goToSlide(i));
                navDots.appendChild(dot);
            }
        }

        // Get hoverable items for current slide
        function getHoverableItems() {
            const currentSlideEl = slides[currentSlide - 1];
            const bulletList = currentSlideEl.querySelector('.bullet-list');
            if (bulletList) {
                return Array.from(bulletList.querySelectorAll('li'));
            }
            return [];
        }

        // Reset hover effects
        function resetHoverEffects() {
            hoverableItems.forEach(item => item.classList.remove('hovered'));
            currentHoveredIndex = -1;
        }

        // Cycle hover effect
        function cycleHoverEffect() {
            hoverableItems = getHoverableItems();
            if (hoverableItems.length === 0) return;

            // Remove current hover
            if (currentHoveredIndex >= 0 && currentHoveredIndex < hoverableItems.length) {
                hoverableItems[currentHoveredIndex].classList.remove('hovered');
            }

            // Move to next item
            currentHoveredIndex = (currentHoveredIndex + 1) % hoverableItems.length;

            // Add hover to new item
            hoverableItems[currentHoveredIndex].classList.add('hovered');
        }

        // Update UI
        function updateUI() {
            // Update progress bar
            const progress = (currentSlide / totalSlides) * 100;
            progressBar.style.width = progress + '%';

            // Update slide counter
            slideCounter.textContent = `${currentSlide} / ${totalSlides}`;

            // Update navigation dots
            const dots = navDots.querySelectorAll('.nav-dot');
            dots.forEach((dot, index) => {
                if (index + 1 === currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            // Update slides
            slides.forEach((slide, index) => {
                if (index + 1 === currentSlide) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            // Reset hover effects when changing slides
            resetHoverEffects();
        }

        // Navigate to specific slide
        function goToSlide(slideNumber) {
            if (slideNumber >= 1 && slideNumber <= totalSlides) {
                currentSlide = slideNumber;
                updateUI();
            }
        }

        // Next slide
        function nextSlide() {
            if (currentSlide < totalSlides) {
                currentSlide++;
                updateUI();
            }
        }

        // Previous slide
        function prevSlide() {
            if (currentSlide > 1) {
                currentSlide--;
                updateUI();
            }
        }

        // Keyboard navigation - ARROW KEYS ONLY
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                cycleHoverEffect();
            }
        });

        // Enable click navigation for visible arrows (if present)
        if (prevArrow) prevArrow.addEventListener('click', prevSlide);
        if (nextArrow) nextArrow.addEventListener('click', nextSlide);

        // Remove all mouse navigation
        // Navigation arrows are hidden by default

        // Initialize
        initNavDots();
        updateUI();

        // Prevent default behaviors that might interfere
        // document.addEventListener('contextmenu', (e) => e.preventDefault());