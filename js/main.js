/* =================================================================
   CARTA DE DESPEDIDA — main.js
   -----------------------------------------------------------------
   1. Apertura del sobre e ingreso a la carta.
   2. Aparición gradual del texto al hacer scroll.
   3. Reproductor de música (con manejo de autoplay bloqueado).
   4. Placeholders elegantes si carta.jpg / dibujo.jpg no existen aún.
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------
     1. SOBRE → CARTA
     --------------------------------------------------------------- */
  const envelopeScreen = document.getElementById('envelope-screen');
  const letterScreen = document.getElementById('letter-screen');
  const envelope = document.getElementById('envelope');
  const openBtn = document.getElementById('open-letter-btn');
  const letterPage = document.querySelector('.letter-page');
  const musicPlayer = document.getElementById('music-player');

  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;

    envelope.classList.add('is-open');
    openBtn.disabled = true;

    // Esperar la animación del sobre antes de mostrar la carta
    setTimeout(() => {
      envelopeScreen.classList.add('is-leaving');

      setTimeout(() => {
        envelopeScreen.hidden = true;
        letterScreen.hidden = false;
        window.scrollTo(0, 0);

        requestAnimationFrame(() => {
          letterPage.classList.add('is-visible');
          musicPlayer.classList.add('is-ready');
          revealVisibleParagraphs();
        });

        // Intentar reproducir la música por interacción del usuario
        attemptAutoplay();
      }, 950);
    }, 850);
  }

  openBtn.addEventListener('click', openEnvelope);

  /* ---------------------------------------------------------------
     2. APARICIÓN GRADUAL DEL TEXTO AL HACER SCROLL
     --------------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    '.letter-body p, .letter-motto, .closing-line, .closing-signature'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  revealTargets.forEach((el) => revealObserver.observe(el));

  // Revela inmediatamente lo que ya está en pantalla al abrir la carta
  function revealVisibleParagraphs() {
    revealTargets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('is-visible');
      }
    });
  }

  /* ---------------------------------------------------------------
     3. FOTOGRAFÍAS — placeholder elegante si el archivo no existe
     --------------------------------------------------------------- */
  function setupPhoto(imgId, placeholderId) {
    const img = document.getElementById(imgId);
    const placeholder = document.getElementById(placeholderId);
    if (!img || !placeholder) return;

    img.addEventListener('error', () => {
      img.classList.add('is-missing');
      placeholder.classList.add('is-active');
    });

    // Si ya falló antes de registrar el listener (carga en caché)
    if (img.complete && img.naturalWidth === 0) {
      img.classList.add('is-missing');
      placeholder.classList.add('is-active');
    }
  }

  setupPhoto('img-carta', 'placeholder-carta');
  setupPhoto('img-dibujo', 'placeholder-dibujo');

  /* ---------------------------------------------------------------
     4. REPRODUCTOR DE MÚSICA
     --------------------------------------------------------------- */
  const audio = document.getElementById('audio-el');
  const toggleBtn = document.getElementById('music-toggle');
  const iconPlay = toggleBtn.querySelector('.icon-play');
  const iconPause = toggleBtn.querySelector('.icon-pause');
  const seek = document.getElementById('music-seek');
  const volume = document.getElementById('music-volume');
  const currentTimeEl = document.getElementById('music-current');
  const durationEl = document.getElementById('music-duration');
  const blockedBtn = document.getElementById('music-blocked-btn');

  let audioAvailable = true;
  let seeking = false;

  function formatTime(seconds) {
    if (!isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  audio.volume = parseFloat(volume.value);

  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
    seek.max = audio.duration || 0;
  });

  audio.addEventListener('timeupdate', () => {
    if (seeking) return;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    seek.value = audio.currentTime;
  });

  audio.addEventListener('ended', () => {
    iconPlay.hidden = false;
    iconPause.hidden = true;
  });

  // Si musica.mp3 no existe, ocultar el reproductor discretamente
  audio.addEventListener('error', () => {
    audioAvailable = false;
    musicPlayer.classList.add('is-unavailable');
  });

  seek.addEventListener('input', () => {
    seeking = true;
    currentTimeEl.textContent = formatTime(parseFloat(seek.value));
  });

  seek.addEventListener('change', () => {
    audio.currentTime = parseFloat(seek.value);
    seeking = false;
  });

  volume.addEventListener('input', () => {
    audio.volume = parseFloat(volume.value);
  });

  function playAudio() {
    if (!audioAvailable) return;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          iconPlay.hidden = true;
          iconPause.hidden = false;
          blockedBtn.hidden = true;
        })
        .catch(() => {
          // Autoplay bloqueado por el navegador
          blockedBtn.hidden = false;
        });
    }
  }

  function pauseAudio() {
    audio.pause();
    iconPlay.hidden = false;
    iconPause.hidden = true;
  }

  toggleBtn.addEventListener('click', () => {
    if (audio.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  });

  blockedBtn.addEventListener('click', () => {
    playAudio();
  });

  function attemptAutoplay() {
    if (!audioAvailable) return;
    playAudio();
  }

  window.addEventListener('scroll', () => {
    if (letterScreen.hidden) return;
  }, { passive: true });

});
