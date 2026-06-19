document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupHeroCarousel();
  setupCardTools();
});

function setupMobileMenu() {
  var button = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', function () {
    menu.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  var hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
  var images = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-image]'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function show(index) {
    current = index;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    images.forEach(function (image, imageIndex) {
      image.classList.toggle('is-active', imageIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function next() {
    show((current + 1) % slides.length);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      show(index);
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(next, 5200);
    });
  });

  if (slides.length > 1) {
    timer = window.setInterval(next, 5200);
  }
}

function setupCardTools() {
  var cardList = document.querySelector('[data-card-list]');
  var filterInput = document.querySelector('[data-filter-input]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var resultCount = document.querySelector('[data-result-count]');

  if (!cardList) {
    return;
  }

  var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (filterInput && query) {
    filterInput.value = query;
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getVisibleCards() {
    return cards.filter(function (card) {
      return !card.hidden;
    });
  }

  function applyFilter() {
    var value = normalize(filterInput ? filterInput.value : '');

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      card.hidden = value && text.indexOf(value) === -1;
    });

    if (resultCount) {
      resultCount.textContent = '显示 ' + getVisibleCards().length + ' / ' + cards.length + ' 部';
    }
  }

  function applySort() {
    var mode = sortSelect ? sortSelect.value : 'year-desc';
    var sorted = cards.slice().sort(function (a, b) {
      if (mode === 'year-asc') {
        return Number(a.dataset.year) - Number(b.dataset.year);
      }

      if (mode === 'views-desc') {
        return Number(b.dataset.views) - Number(a.dataset.views);
      }

      if (mode === 'score-desc') {
        return Number(b.dataset.score) - Number(a.dataset.score);
      }

      if (mode === 'title-asc') {
        return String(a.dataset.title).localeCompare(String(b.dataset.title), 'zh-Hans-CN');
      }

      return Number(b.dataset.year) - Number(a.dataset.year);
    });

    sorted.forEach(function (card) {
      cardList.appendChild(card);
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      applySort();
      applyFilter();
    });
  }

  applySort();
  applyFilter();
}
