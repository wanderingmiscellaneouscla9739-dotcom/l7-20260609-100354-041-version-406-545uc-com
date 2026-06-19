(function () {
  var navButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function markMissingImage(img) {
    var frame = img.closest('.cover-frame') || img.closest('.hero-backdrop') || img.closest('.hero-poster') || img.closest('.detail-bg') || img.closest('.ranking-cover');
    if (frame) {
      frame.classList.add('image-missing');
    }
  }

  document.querySelectorAll('img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) {
      markMissingImage(img);
    }
    img.addEventListener('error', function () {
      markMissingImage(img);
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader="true"]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function startVideo(shell) {
    var video = shell.querySelector('video');
    var url = shell.getAttribute('data-video');
    if (!video || !url) {
      return;
    }
    shell.classList.add('is-playing');
    video.setAttribute('controls', 'controls');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== url) {
        video.src = url;
      }
      video.play().catch(function () {});
      return;
    }
    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (video._hlsInstance) {
          video._hlsInstance.destroy();
        }
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        video._hlsInstance = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        if (video.src !== url) {
          video.src = url;
        }
        video.play().catch(function () {});
      }
    });
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var overlay = shell.querySelector('.player-overlay');
    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        startVideo(shell);
      });
    }
    shell.addEventListener('click', function (event) {
      if (event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
        return;
      }
      if (!shell.classList.contains('is-playing')) {
        startVideo(shell);
      }
    });
  });

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters(root) {
    var input = root.querySelector('.site-search-input');
    var select = root.querySelector('.site-year-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var keyword = normalize(input ? input.value : '');
    var year = select ? select.value : '';

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.textContent
      ].map(normalize).join(' ');
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchYear = !year || card.getAttribute('data-year') === year;
      card.classList.toggle('is-hidden-by-filter', !(matchKeyword && matchYear));
    });
  }

  var searchRoots = Array.prototype.slice.call(document.querySelectorAll('.search-panel'));
  searchRoots.forEach(function (root) {
    var input = root.querySelector('.site-search-input');
    var select = root.querySelector('.site-year-filter');
    if (input) {
      input.addEventListener('input', function () {
        applyFilters(root);
      });
    }
    if (select) {
      select.addEventListener('change', function () {
        applyFilters(root);
      });
    }
  });
})();
