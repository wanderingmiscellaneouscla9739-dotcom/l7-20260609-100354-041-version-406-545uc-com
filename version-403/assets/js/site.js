
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-go")) || 0);
        start();
      });
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });
    start();
  }

  function setupCategoryTools() {
    var grid = document.querySelector(".sortable-grid");
    if (!grid) {
      return;
    }
    var input = document.querySelector(".page-filter-input");
    var select = document.querySelector(".page-sort-select");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    function normalize(value) {
      return String(value || "").toLowerCase();
    }
    function filterCards() {
      var keyword = normalize(input && input.value);
      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        card.hidden = keyword && title.indexOf(keyword) === -1;
      });
    }
    function sortCards() {
      var value = select ? select.value : "default";
      var sorted = cards.slice().sort(function (a, b) {
        if (value === "default") {
          return 0;
        }
        var av = Number(a.getAttribute("data-" + value)) || 0;
        var bv = Number(b.getAttribute("data-" + value)) || 0;
        return bv - av;
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      filterCards();
    }
    if (input) {
      input.addEventListener("input", filterCards);
    }
    if (select) {
      select.addEventListener("change", sortCards);
    }
  }

  function setupSearchPage() {
    var results = document.getElementById("search-results");
    if (!results || !window.MovieSearchData) {
      return;
    }
    var input = document.getElementById("search-page-input");
    var status = document.getElementById("search-status");
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    function terms(movie) {
      return [movie.title, movie.region, movie.type, movie.genre, movie.year, movie.category, movie.summary, movie.tags.join(" ")].join(" ").toLowerCase();
    }
    function render(items) {
      results.innerHTML = items.slice(0, 120).map(function (movie) {
        return [
          '<article class="movie-card">',
          '<a class="poster-link" href="' + movie.url + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>',
          '<span class="poster-hover"><span>' + escapeHtml(movie.summary) + '</span></span>',
          '</a>',
          '<div class="card-body">',
          '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
          '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
          '<div class="card-stats"><span>👁 ' + Math.floor(movie.views / 1000) + 'k</span><span>♥ ' + Math.floor(movie.likes / 1000) + 'k</span><span>★ ' + movie.score + '</span></div>',
          '<div class="tag-row">' + movie.tags.slice(0, 2).map(function (tag) { return '<span class="tag">#' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    }
    if (!query) {
      if (status) {
        status.textContent = "输入关键词后即可查看匹配影片。";
      }
      render(window.MovieSearchData.slice(0, 24));
      return;
    }
    var q = query.toLowerCase();
    var matched = window.MovieSearchData.filter(function (movie) {
      return terms(movie).indexOf(q) !== -1;
    }).sort(function (a, b) {
      return b.views - a.views;
    });
    if (status) {
      status.textContent = matched.length ? '“' + query + '”相关影片' : '未找到与“' + query + '”匹配的影片';
    }
    render(matched);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupCategoryTools();
    setupSearchPage();
  });
}());
