(function () {
  const storageKey = 'bgMusicState';
  const musicFile = 'bg_music.mpeg';
  let audio = null;
  let ready = false;

  function readState() {
    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  function writeState() {
    if (!audio) return;

    try {
      sessionStorage.setItem(storageKey, JSON.stringify({
        currentTime: audio.currentTime || 0,
        isPlaying: !audio.paused
      }));
    } catch (error) {
      // Ignore storage issues in local browser sessions.
    }
  }

  function ensureAudio() {
    if (audio) {
      return audio;
    }

    audio = new Audio(musicFile);
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.35;
    audio.autoplay = false;

    audio.addEventListener('timeupdate', writeState);
    audio.addEventListener('play', writeState);
    audio.addEventListener('pause', writeState);
    audio.addEventListener('ended', () => {
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    });

    audio.addEventListener('canplaythrough', () => {
      const state = readState();
      if (typeof state.currentTime === 'number' && state.currentTime > 0 && audio.currentTime === 0) {
        audio.currentTime = Math.min(state.currentTime, audio.duration || state.currentTime);
      }
    }, { once: true });

    return audio;
  }

  function registerFallback() {
    const startHandler = () => {
      window.initBackgroundMusic(true);
      document.removeEventListener('click', startHandler);
      document.removeEventListener('touchstart', startHandler);
      document.removeEventListener('keydown', startHandler);
      window.removeEventListener('pointerdown', startHandler);
    };

    document.addEventListener('click', startHandler, { once: true });
    document.addEventListener('touchstart', startHandler, { once: true });
    document.addEventListener('keydown', startHandler, { once: true });
    window.addEventListener('pointerdown', startHandler, { once: true });
  }

  function startMusic(forceStart) {
    const music = ensureAudio();
    const state = readState();

    if (typeof state.currentTime === 'number' && state.currentTime > 0 && music.currentTime === 0) {
      music.currentTime = Math.min(state.currentTime, music.duration || state.currentTime);
    }

    const tryPlay = () => {
      if (forceStart || state.isPlaying) {
        const playPromise = music.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(() => {
            writeState();
          }).catch(() => {
            registerFallback();
          });
        } else {
          writeState();
        }
      }
    };

    if (music.readyState >= 2) {
      tryPlay();
    } else {
      music.addEventListener('canplaythrough', tryPlay, { once: true });
    }
  }

  function initializeMusic() {
    if (ready) {
      return;
    }

    ready = true;
    ensureAudio();

    const state = readState();
    if (state.isPlaying) {
      startMusic(false);
    }
  }

  window.initBackgroundMusic = function (forceStart) {
    initializeMusic();
    startMusic(Boolean(forceStart));
  };

  document.addEventListener('DOMContentLoaded', () => {
    initializeMusic();
    window.initBackgroundMusic(true);
  });
  window.addEventListener('load', () => {
    initializeMusic();
    window.initBackgroundMusic(true);
  });
  window.addEventListener('pagehide', writeState);
  window.addEventListener('beforeunload', writeState);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      writeState();
    } else if (document.visibilityState === 'visible') {
      const state = readState();
      if (state.isPlaying) {
        startMusic(false);
      }
    }
  });
})();
