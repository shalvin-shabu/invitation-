(function () {
  const styleId = 'petal-animation-style';
  let intervalId = null;

  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .petal-layer {
        position: fixed;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: 2;
        mix-blend-mode: screen;
      }

      .petal {
        position: absolute;
        display: block;
        border-radius: 80% 0 80% 0;
        opacity: 0;
        filter: drop-shadow(0 5px 8px rgba(0, 0, 0, 0.18));
        will-change: transform, opacity;
        animation: petal-fall var(--petal-duration) cubic-bezier(0.16, 0.78, 0.3, 1) var(--petal-delay) forwards;
      }

      .petal::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(135deg, rgba(255,255,255,0.45), rgba(255,255,255,0));
        transform: rotate(18deg);
      }

      @keyframes petal-fall {
        0% {
          transform: translate3d(0, -24px, 0) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: var(--petal-opacity);
        }
        100% {
          transform: translate3d(var(--petal-drift), 140vh, 0) rotate(var(--petal-rotation));
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createPetalLayer() {
    let layer = document.getElementById('petal-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'petal-layer';
      layer.className = 'petal-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(layer);
    }
    return layer;
  }

  function spawnPetal() {
    const layer = createPetalLayer();
    const petal = document.createElement('span');
    petal.className = 'petal';

    const size = 2.6 + Math.random() * 5.5;

    // Duration is a fixed range in seconds — not tied to window.innerHeight.
    // Because the fall distance is defined in vh units (see the keyframes),
    // a petal always travels the same proportion of the viewport in the
    // same amount of time, so the perceived speed is already consistent
    // across PC and mobile without any extra scaling.
    // Range raised from 18-22s to 34-40s to make the fall noticeably slower.
    const duration = 34 + Math.random() * 6;
    
    const delay = Math.random() * 1.8;
    const drift = (Math.random() - 0.5) * 55;
    const rotation = 15 + Math.random() * 340;
    const opacity = 0.5 + Math.random() * 0.35;
    const palette = [
      'linear-gradient(135deg, rgba(255, 248, 232, 0.95), rgba(255, 207, 132, 0.95))',
      'linear-gradient(135deg, rgba(255, 240, 220, 0.96), rgba(255, 182, 126, 0.94))',
      'linear-gradient(135deg, rgba(255, 244, 248, 0.95), rgba(255, 195, 205, 0.94))',
      'linear-gradient(135deg, rgba(252, 251, 255, 0.95), rgba(214, 196, 255, 0.92))'
    ];

    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.24}px`;
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.top = '-24px';
    petal.style.background = palette[Math.floor(Math.random() * palette.length)];
    petal.style.setProperty('--petal-duration', `${duration}s`);
    petal.style.setProperty('--petal-delay', `${delay}s`);
    petal.style.setProperty('--petal-drift', `${drift}px`);
    petal.style.setProperty('--petal-rotation', `${rotation}deg`);
    petal.style.setProperty('--petal-opacity', `${opacity}`);

    layer.appendChild(petal);
    petal.addEventListener('animationend', () => petal.remove());
  }

  function startPetalAnimation() {
    if (intervalId) {
      return;
    }

    createPetalLayer();

    for (let i = 0; i < 4; i += 1) {
      window.setTimeout(spawnPetal, i * 520);
    }

    intervalId = window.setInterval(spawnPetal, 520);
  }

  window.startPetalAnimation = function () {
    window.sessionStorage.setItem('petalFlowActive', '1');
    startPetalAnimation();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.sessionStorage.getItem('petalFlowActive') === '1') {
        startPetalAnimation();
      }
    }, { once: true });
  } else if (window.sessionStorage.getItem('petalFlowActive') === '1') {
    startPetalAnimation();
  }
})();