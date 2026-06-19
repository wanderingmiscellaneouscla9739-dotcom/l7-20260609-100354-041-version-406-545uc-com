(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          restart();
        });
      });

      show(0);
      restart();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterSelect = document.querySelector('[data-filter-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var keyword = normalize(filterInput && filterInput.value);
      var yearMode = filterSelect ? filterSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var year = Number(card.getAttribute('data-year') || 0);
        var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var passYear = true;

        if (yearMode === 'recent') {
          passYear = year >= 2024;
        } else if (yearMode === 'classic') {
          passYear = year > 0 && year < 2024;
        }

        var pass = passKeyword && passYear;
        card.style.display = pass ? '' : 'none';
        if (pass) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        filterInput.value = query;
      }
      filterInput.addEventListener('input', applyFilter);
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  });

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playerOverlay');
    var started = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (started) {
        return;
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!started || video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
