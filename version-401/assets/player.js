(function () {
    function attachVideo(box) {
        var video = box.querySelector('video');
        var source = box.getAttribute('data-src');

        if (!video || !source) {
            return Promise.resolve();
        }

        if (video.getAttribute('data-ready') === '1') {
            return video.play();
        }

        video.setAttribute('data-ready', '1');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return video.play();
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            box._hls = hls;

            return new Promise(function (resolve) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve(video.play());
                });
            });
        }

        video.src = source;
        return video.play();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
        var cover = box.querySelector('[data-play]');
        var video = box.querySelector('video');

        function start() {
            box.classList.add('is-playing');
            attachVideo(box).catch(function () {
                box.classList.remove('is-playing');
            });
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        }
    });
}());
