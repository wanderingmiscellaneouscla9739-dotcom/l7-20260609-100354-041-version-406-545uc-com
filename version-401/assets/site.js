(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var yearFilter = document.querySelector('[data-filter-year]');
    var typeFilter = document.querySelector('[data-filter-type]');
    var regionFilter = document.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var noResults = document.querySelector('[data-no-results]');

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var type = typeFilter ? typeFilter.value : '';
        var region = regionFilter ? regionFilter.value : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-region') || ''
            ].join(' ').toLowerCase();
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchYear = !year || (card.getAttribute('data-year') || '') === year;
            var matchType = !type || (card.getAttribute('data-genre') || '').indexOf(type) !== -1;
            var matchRegion = !region || (card.getAttribute('data-region') || '').indexOf(region) !== -1;
            var visible = matchQuery && matchYear && matchType && matchRegion;

            card.style.display = visible ? '' : 'none';

            if (visible) {
                visibleCount += 1;
            }
        });

        if (noResults) {
            noResults.style.display = visibleCount ? 'none' : 'block';
        }
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q) {
            searchInput.value = q;
        }

        searchInput.addEventListener('input', applyFilters);
    }

    [yearFilter, typeFilter, regionFilter].forEach(function (filter) {
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });

    applyFilters();
}());
