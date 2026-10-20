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
 * e.g., "1 Cheese Chilli Maggie for Ranjeet"
 */
let activeUtteranceRef = null;

export const speakOrderAnnouncement = (order) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[Kitchen Audio] Speech synthesis not supported in this browser');
    return;
  }

  try {
    // Determine customer name cleanly
    let customerName = 'Guest';
    if (order?.student?.name) {
      customerName = order.student.name.trim().split(' ')[0];
    } else if (order?.customerName) {
      customerName = order.customerName.trim().split(' ')[0];
    } else if (order?.orderNumber) {
      customerName = `Order ${order.orderNumber}`;
    }

    // Capitalize first letter (e.g., "ranjeet" -> "Ranjeet")
    if (customerName && customerName.length > 0) {
      customerName = customerName.charAt(0).toUpperCase() + customerName.slice(1);
    }

    // Format items: "1 Cheese Chilli Maggie", "2 Cold Coffee, and 1 Peri-Peri Fries"
    const items = Array.isArray(order?.items) ? order.items : [];
    let itemsText = '';
    if (items.length > 0) {
      itemsText = items
        .map((i) => {
          const qty = i.quantity || 1;
          const name = i.name || i.title || 'Item';
          return `${qty} ${name}`;
        })
        .join(', and ');
    } else {
      itemsText = 'New order';
    }

    const phrase = `${itemsText} for ${customerName}`;
    console.log('[Kitchen Audio] Dictating incoming order:', phrase);

    // Cancel previous utterance and resume if browser suspended speech
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN';

    // Prevent Chrome V8 garbage-collection bug:
    // Retain a persistent global reference until speech finishes
    activeUtteranceRef = utterance;
    window._laroche_active_speech = utterance;

    utterance.onend = () => {
      activeUtteranceRef = null;
      window._laroche_active_speech = null;
    };

    utterance.onerror = (err) => {
      console.warn('[Kitchen Audio] Speech error:', err);
      activeUtteranceRef = null;
      window._laroche_active_speech = null;
    };

    // Voice selection: prioritize Indian English, then British/American, then default
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferredVoice =
        voices.find((v) => v.lang === 'en-IN' || v.lang === 'en_IN') ||
        voices.find((v) => v.lang === 'en-GB') ||
        voices.find((v) => v.lang?.startsWith('en')) ||
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      }
    }

    // Delay 450ms so the initial counter bell chime rings first, followed by clear voice dictation
    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[Kitchen Audio] speak() failed:', err);
      }
    }, 450);
  } catch (err) {
    console.warn('[Kitchen Audio] Speech synthesis failure:', err);
  }
};

// Pre-load browser speech voices
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        try {
          window.speechSynthesis.getVoices();
        } catch (e) {}
      };
    }
  } catch (e) {}
}

