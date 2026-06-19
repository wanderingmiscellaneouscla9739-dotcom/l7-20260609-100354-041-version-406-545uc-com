document.addEventListener('DOMContentLoaded', function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

  players.forEach(function (player) {
    var button = player.querySelector('.player-start');
    var video = player.querySelector('video');
    var message = player.querySelector('.player-message');
    var source = player.getAttribute('data-src');
    var hasStarted = false;

    if (!button || !video || !source) {
      return;
    }

    button.addEventListener('click', function () {
      if (hasStarted) {
        return;
      }

      hasStarted = true;
      button.classList.add('is-hidden');
      setMessage(message, '正在加载播放源...');
      loadHlsLibrary()
        .then(function () {
          startPlayback(video, source, message);
        })
        .catch(function () {
          startNativePlayback(video, source, message);
        });
    });
  });
});

function setMessage(message, text) {
  if (message) {
    message.textContent = text || '';
  }
}

function loadHlsLibrary() {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }

  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.async = true;
    script.onload = function () {
      if (window.Hls) {
        resolve(window.Hls);
      } else {
        reject(new Error('HLS library did not load'));
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function startPlayback(video, source, message) {
  if (window.Hls && window.Hls.isSupported()) {
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
      setMessage(message, '播放源已就绪');
      playVideo(video, message);
    });
    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
      if (data && data.fatal) {
        setMessage(message, '视频加载失败，请稍后重试');
        hls.destroy();
      }
    });
    video._hls = hls;
    return;
  }

  startNativePlayback(video, source, message);
}

function startNativePlayback(video, source, message) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.addEventListener('loadedmetadata', function () {
      setMessage(message, '播放源已就绪');
      playVideo(video, message);
    }, { once: true });
    video.load();
    return;
  }

  setMessage(message, '当前浏览器需要允许加载 HLS 播放组件后才能播放');
}

function playVideo(video, message) {
  var playPromise = video.play();

  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function () {
      setMessage(message, '播放源已加载，可点击播放器继续播放');
    });
  }
}
