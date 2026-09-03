// Small self-contained sound effect engine using the WebAudio API.
// No external audio files are needed: every sound is synthesized on the fly.
const SFX = (() => {
  let ctx = null;

  function getContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    return ctx;
  }

  function tone(freq, duration, type = 'square', volume = 0.15, delay = 0) {
    const c = getContext();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(c.destination);
    const startTime = c.currentTime + delay;
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  return {
    resume() {
      const c = getContext();
      if (c && c.state === 'suspended') c.resume();
    },
    jump() {
      tone(420, 0.12, 'square', 0.12);
      tone(620, 0.1, 'square', 0.08, 0.05);
    },
    coin() {
      tone(880, 0.08, 'square', 0.14);
      tone(1320, 0.12, 'square', 0.12, 0.06);
    },
    stomp() {
      tone(180, 0.15, 'sawtooth', 0.15);
    },
    hurt() {
      tone(140, 0.25, 'sawtooth', 0.18);
      tone(90, 0.2, 'sawtooth', 0.14, 0.08);
    },
    goal() {
      tone(523, 0.12, 'square', 0.14);
      tone(659, 0.12, 'square', 0.14, 0.12);
      tone(784, 0.2, 'square', 0.16, 0.24);
    },
    gameover() {
      tone(300, 0.2, 'sawtooth', 0.15);
      tone(220, 0.2, 'sawtooth', 0.15, 0.18);
      tone(140, 0.35, 'sawtooth', 0.15, 0.36);
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'square', 0.15, i * 0.14));
    }
  };
})();
