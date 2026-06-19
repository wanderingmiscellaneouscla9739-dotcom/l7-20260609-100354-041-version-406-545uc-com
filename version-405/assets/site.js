(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-search]');
      var type = scope.querySelector('[data-filter-type]');
      var year = scope.querySelector('[data-filter-year]');
      var region = scope.querySelector('[data-filter-region]');
      var container = scope.parentElement || document;
      var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card[data-title]'));
      var empty = scope.querySelector('[data-empty-state]');

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var selectedType = normalize(type ? type.value : '');
        var selectedYear = normalize(year ? year.value : '');
        var selectedRegion = normalize(region ? region.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.type,
            card.dataset.region,
            card.dataset.year,
            card.dataset.genre
          ].join(' '));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedType && normalize(card.dataset.type) !== selectedType) {
            matched = false;
          }
          if (selectedYear && normalize(card.dataset.year) !== selectedYear) {
            matched = false;
          }
          if (selectedRegion && normalize(card.dataset.region) !== selectedRegion) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, type, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (stage) {
      var video = stage.querySelector('video');
      var layer = stage.querySelector('[data-player-layer]');
      var stream = stage.getAttribute('data-stream');
      var hlsInstance = null;

      if (!video || !stream) {
        return;
      }

      function attachStream() {
        if (video.dataset.ready === '1') {
          return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.dataset.ready = '1';
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          video.dataset.ready = '1';
          return new Promise(function (resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            setTimeout(resolve, 1200);
          });
        }

        video.src = stream;
        video.dataset.ready = '1';
        return Promise.resolve();
      }

      function play() {
        attachStream().then(function () {
          video.controls = true;
          if (layer) {
            layer.classList.add('is-hidden');
          }
          var request = video.play();
          if (request && typeof request.catch === 'function') {
            request.catch(function () {});
          }
        });
      }

      if (layer) {
        layer.addEventListener('click', play);
      }
      stage.addEventListener('click', function (event) {
        if (event.target === video && video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (layer) {
          layer.classList.add('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initFilters();
    initPlayers();
  });
})();
