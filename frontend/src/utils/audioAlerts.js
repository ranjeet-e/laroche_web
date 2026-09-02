/**
 * Audio Alert Utility for La Roche Cafe
 * Uses Web Audio API to synthesize a crystal-clear service bell chime
 * (Zero network dependencies, instant 0ms latency, works offline)
 */

let audioCtxInstance = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtxInstance || audioCtxInstance.state === 'closed') {
    audioCtxInstance = new AudioContextClass();
  }
  return audioCtxInstance;
};

/**
 * Plays a bright, resonant cafe service desk counter bell chime
 */
export const playOrderBellSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const playHarmonic = (freq, start, duration, volume, type = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);

      // Fast attack, smooth natural exponential decay
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    // First Ding (High melodic bell note)
    playHarmonic(880, now, 0.9, 0.35); // A5
    playHarmonic(1760, now, 0.7, 0.15); // A6 overtone
    playHarmonic(2640, now, 0.5, 0.08); // Harmonic shimmer

    // Second Ring (Higher resonant chime)
    playHarmonic(1174.66, now + 0.15, 1.4, 0.45); // D6
    playHarmonic(2349.32, now + 0.15, 1.1, 0.2);  // D7
    playHarmonic(3520.0, now + 0.16, 0.8, 0.08);  // Crisp brass sparkle

  } catch (err) {
    console.warn('Could not play order bell alert:', err);
  }
};
