/**
 * Audio Alert Utility for La Roche Cafe
 * Uses Web Audio API to synthesize a crystal-clear service bell chime
 * (Zero network dependencies, instant 0ms latency, works offline)
 */

let audioCtxInstance = null;

export const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtxInstance || audioCtxInstance.state === 'closed') {
    audioCtxInstance = new AudioContextClass();
  }
  return audioCtxInstance;
};

/**
 * Resumes / unlocks the browser AudioContext
 */
export const unlockAudio = async () => {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx?.state === 'running';
  } catch (e) {
    return false;
  }
};

// Global auto-unlock on first user gesture
if (typeof window !== 'undefined') {
  const autoUnlock = () => {
    unlockAudio();
    window.removeEventListener('click', autoUnlock);
    window.removeEventListener('touchstart', autoUnlock);
    window.removeEventListener('keydown', autoUnlock);
  };
  window.addEventListener('click', autoUnlock, { passive: true, once: true });
  window.addEventListener('touchstart', autoUnlock, { passive: true, once: true });
  window.addEventListener('keydown', autoUnlock, { passive: true, once: true });
}

/**
 * Plays a bright, resonant cafe service desk counter bell chime
 */
export const playOrderBellSound = async () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const playHarmonic = (freq, start, duration, volume, type = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);

      // Crisp counter attack & smooth decay
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    // First Ding (Melodic Bell Note)
    playHarmonic(880, now, 1.2, 0.7);       // A5
    playHarmonic(1760, now, 0.9, 0.4);      // A6 overtone
    playHarmonic(2640, now, 0.6, 0.2);      // Shimmer

    // Second Ring (High resonant counter chime)
    playHarmonic(1174.66, now + 0.18, 1.6, 0.85); // D6
    playHarmonic(2349.32, now + 0.18, 1.2, 0.45); // D7
    playHarmonic(3520.0, now + 0.19, 0.8, 0.2);   // Sparkle
  } catch (err) {
    console.warn('Could not play order bell alert:', err);
  }
};
