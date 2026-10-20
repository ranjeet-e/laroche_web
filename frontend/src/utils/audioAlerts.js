/**
 * Audio Alert Utility for La Roche Cafe
 * Uses Web Audio API to synthesize crystal-clear alerts & counter chimes
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
    playHarmonic(880, now, 1.2, 0.7); // A5
    playHarmonic(1760, now, 0.9, 0.4); // A6 overtone
    playHarmonic(2640, now, 0.6, 0.2); // Shimmer

    // Second Ring (High resonant counter chime)
    playHarmonic(1174.66, now + 0.18, 1.6, 0.85); // D6
    playHarmonic(2349.32, now + 0.18, 1.2, 0.45); // D7
    playHarmonic(3520.0, now + 0.19, 0.8, 0.2); // Sparkle
  } catch (err) {
    console.warn('Could not play order bell alert:', err);
  }
};

/**
 * Plays a distinct 30-second reminder ping for orders waiting in the "New" column
 */
export const playReminderPingSound = async () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const playTone = (freq, start, duration, volume = 0.5) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    // Double attention ping: E6 -> G#6
    playTone(1318.51, now, 0.25, 0.6);
    playTone(1661.22, now + 0.15, 0.4, 0.7);
  } catch (err) {
    console.warn('Could not play reminder ping:', err);
  }
};

/**
 * Voice dictation: Announces incoming order items and customer name for the kitchen team
 * e.g., "Peri-Peri Fries for Ranjeet"
 */
export const speakOrderAnnouncement = (order) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    // Cancel previous speech to prevent overlapping queues
    window.speechSynthesis.cancel();

    const customerName =
      order?.student?.name?.trim()?.split(' ')[0] ||
      (order?.orderNumber ? `Order ${order.orderNumber}` : 'Student');

    const items = Array.isArray(order?.items) ? order.items : [];
    let itemsText = '';
    if (items.length > 0) {
      itemsText = items
        .map((i) => `${i.quantity > 1 ? `${i.quantity} ` : ''}${i.name}`)
        .join(', and ');
    } else {
      itemsText = 'New order';
    }

    const phrase = `${itemsText} for ${customerName}`;

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = 0.92; // clear, steady kitchen tempo
    utterance.pitch = 1.02;
    utterance.lang = 'en-IN'; // Indian English pronunciation

    // Select Indian English voice if available in browser
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang === 'en-IN' || v.lang === 'en_IN') ||
      voices.find((v) => v.lang?.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // 350ms delay to let the initial bell chime register first
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 350);
  } catch (err) {
    console.warn('Speech synthesis alert failed:', err);
  }
};

// Pre-load browser speech voices
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    try {
      window.speechSynthesis.getVoices();
    } catch (e) {}
  };
}

