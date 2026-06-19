(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    if (menuButton) {
        menuButton.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    var list = document.getElementById("browse-list");
    var searchInput = document.getElementById("movie-search-input");
    var categoryFilter = document.getElementById("category-filter");
    var typeFilter = document.getElementById("type-filter");
    var sortFilter = document.getElementById("sort-filter");

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
        var keyword = normalize(searchInput ? searchInput.value : "");
        var category = categoryFilter ? categoryFilter.value : "all";
        var type = typeFilter ? typeFilter.value : "all";
        var sortValue = sortFilter ? sortFilter.value : "newest";

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-category"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year")
            ].join(" "));
            var visible = true;
            if (keyword && haystack.indexOf(keyword) === -1) {
                visible = false;
            }
            if (category !== "all" && card.getAttribute("data-category") !== category) {
                visible = false;
            }
            if (type !== "all" && card.getAttribute("data-type") !== type) {
                visible = false;
            }
            card.style.display = visible ? "" : "none";
        });

        cards.sort(function (a, b) {
            if (sortValue === "score") {
                return Number(b.getAttribute("data-score")) - Number(a.getAttribute("data-score"));
            }
            if (sortValue === "views") {
                return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
            }
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }).forEach(function (card) {
            list.appendChild(card);
        });
    }

    if (list) {
        [searchInput, categoryFilter, typeFilter, sortFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && searchInput) {
            searchInput.value = query;
        }
        applyFilters();
    }
})();

function initPlayer(videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsPlayer = null;

    if (!video || !button || !sourceUrl) {
        return;
    }

    function attachSource() {
        if (video.getAttribute("data-ready") === "1") {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsPlayer.loadSource(sourceUrl);
            hlsPlayer.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
        video.setAttribute("data-ready", "1");
    }

    function startPlay() {
        attachSource();
        button.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", startPlay);
    video.addEventListener("click", function () {
        if (video.paused) {
            startPlay();
        }
    });
    video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}
