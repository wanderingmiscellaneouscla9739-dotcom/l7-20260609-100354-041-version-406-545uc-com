
(function () {
  function init(source) {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("player-overlay");
    var toggle = document.getElementById("player-toggle");
    var mute = document.getElementById("player-mute");
    var fullscreen = document.getElementById("player-fullscreen");
    var message = document.getElementById("player-message");
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.hidden = false;
      }
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("视频加载失败，请稍后再试");
          }
        });
      } else {
        showMessage("浏览器暂时无法播放该视频");
      }
    }

    function play() {
      attach();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          showMessage("请再次点击播放");
        });
      }
    }

    function pause() {
      video.pause();
    }

    function sync() {
      if (toggle) {
        toggle.textContent = video.paused ? "▶" : "Ⅱ";
      }
      if (overlay) {
        overlay.hidden = !video.paused;
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    if (toggle) {
      toggle.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          pause();
        }
      });
    }
    if (mute) {
      mute.addEventListener("click", function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? "静音" : "音量";
      });
    }
    if (fullscreen) {
      fullscreen.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        pause();
      }
    });
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
    attach();
    sync();
  }

  window.MoviePlayer = {
    init: init
  };
}());
