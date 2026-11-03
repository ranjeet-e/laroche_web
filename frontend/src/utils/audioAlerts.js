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
 * Rapid, punchy, and equipped with Kitchen Rush batching to prevent speech logjams
 */
let activeUtteranceRef = null;
let speechQueue = [];
let isSpeaking = false;
let rushTimeout = null;

const processNextSpeech = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (speechQueue.length === 0) {
    isSpeaking = false;
    return;
  }

  // RUSH PROTECTION: If 4 or more orders flood in simultaneously,
  // announce an urgent rush alert so chefs immediately glance at the KDS tickets.
  if (speechQueue.length >= 4) {
    const rushCount = speechQueue.length;
    speechQueue = [];
    speakPhrase(`Kitchen rush! ${rushCount} new orders received, check tickets!`);
    return;
  }

  const nextPhrase = speechQueue.shift();
  speakPhrase(nextPhrase);
};

// Intelligent voice selection prioritizing natural, high-clarity female voices
const selectFemaleVoice = (voices) => {
  if (!voices || voices.length === 0) return null;

  const femaleKeywords = [
    'veena', 'heera', 'neerja', 'priya', 'aditi', 'kalpana', // Indian English female
    'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'serena', 'ava', 'allison', 'susan', // macOS / iOS female
    'zira', 'jenny', 'aria', // Windows female
    'female', 'woman',
    'google uk english female', 'google us english',
  ];

  const maleKeywords = ['daniel', 'david', 'alex', 'george', 'rishi', 'fred', 'oliver', 'male', 'guy', 'tom', 'ravi'];

  const isMale = (name) => {
    const lower = (name || '').toLowerCase();
    return maleKeywords.some((m) => lower.includes(m));
  };

  const isFemale = (name) => {
    const lower = (name || '').toLowerCase();
    return femaleKeywords.some((f) => lower.includes(f));
  };

  // 1. Indian English female voice (e.g. Veena on macOS, Heera on Windows)
  const indianFemale = voices.find(
    (v) => (v.lang === 'en-IN' || v.lang === 'en_IN') && !isMale(v.name) && isFemale(v.name)
  );
  if (indianFemale) return indianFemale;

  // 2. Any English female voice (e.g. Samantha, Victoria, Zira, Google UK Female)
  const englishFemale = voices.find(
    (v) => v.lang?.startsWith('en') && !isMale(v.name) && isFemale(v.name)
  );
  if (englishFemale) return englishFemale;

  // 3. Any voice matching female identifier
  const anyFemale = voices.find((v) => !isMale(v.name) && isFemale(v.name));
  if (anyFemale) return anyFemale;

  // 4. Any English voice not explicitly male
  const englishNonMale = voices.find((v) => v.lang?.startsWith('en') && !isMale(v.name));
  if (englishNonMale) return englishNonMale;

  return voices.find((v) => v.lang === 'en-IN') || voices.find((v) => v.lang?.startsWith('en')) || voices[0];
};

const speakPhrase = (phrase) => {
  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(phrase);
    // 1x natural speaking rate
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.lang = 'en-IN';

    activeUtteranceRef = utterance;
    window._laroche_active_speech = utterance;
    isSpeaking = true;

    utterance.onend = () => {
      activeUtteranceRef = null;
      window._laroche_active_speech = null;
      setTimeout(() => {
        processNextSpeech();
      }, 200);
    };

    utterance.onerror = (err) => {
      console.warn('[Kitchen Audio] Speech error:', err);
      activeUtteranceRef = null;
      window._laroche_active_speech = null;
      processNextSpeech();
    };

    // Female voice selection across macOS, Windows, Chrome, iOS
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferredVoice = selectFemaleVoice(voices);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[Kitchen Audio] Speech synthesis failure:', err);
    isSpeaking = false;
  }
};

export const speakOrderAnnouncement = (order) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[Kitchen Audio] Speech synthesis not supported in this browser');
    return;
  }

  try {
    // 1. Order Number
    const orderNum = order?.orderNumber ? `Order #${order.orderNumber}` : 'New Order';

    // 2. Customer First Name
    let customerName = '';
    if (order?.student?.name) {
      customerName = order.student.name.trim().split(' ')[0];
    } else if (order?.customerName) {
      customerName = order.customerName.trim().split(' ')[0];
    }
    if (customerName) {
      customerName = customerName.charAt(0).toUpperCase() + customerName.slice(1);
    }

    // 3. Compact item dictation (for isolated single orders)
    const items = Array.isArray(order?.items) ? order.items : [];
    let itemsText = '';
    const cleanItemName = (str) =>
      String(str || 'item')
        .replace(/freshly pressed|specialty|artisan|homemade|gourmet|crispy/gi, '')
        .trim();

    if (items.length === 1) {
      const qty = items[0].quantity || 1;
      itemsText = `${qty} ${cleanItemName(items[0].name)}`;
    } else if (items.length === 2) {
      const i1 = `${items[0].quantity || 1} ${cleanItemName(items[0].name)}`;
      const i2 = `${items[1].quantity || 1} ${cleanItemName(items[1].name)}`;
      itemsText = `${i1}, and ${i2}`;
    } else if (items.length > 2) {
      const firstItem = `${items[0].quantity || 1} ${cleanItemName(items[0].name)}`;
      itemsText = `${items.length} items, including ${firstItem}`;
    } else {
      itemsText = 'New order';
    }

    // When more than 1 order arrives (or another order is currently being spoken/queued),
    // dictate only: "New order from {name}" instead of reading the entire itemized list!
    const hasMultipleOrders = isSpeaking || speechQueue.length > 0;

    let phrase = '';
    if (hasMultipleOrders) {
      phrase = customerName ? `New order from ${customerName}` : `New order ${orderNum}`;
    } else {
      phrase = customerName
        ? `${orderNum} for ${customerName}! ${itemsText}`
        : `${orderNum}! ${itemsText}`;
    }

    console.log('[Kitchen Audio] Queuing order speech (female 1x):', phrase);

    speechQueue.push(phrase);

    if (!isSpeaking) {
      clearTimeout(rushTimeout);
      rushTimeout = setTimeout(() => {
        processNextSpeech();
      }, 300);
    }
  } catch (err) {
    console.warn('[Kitchen Audio] Speech preparation failure:', err);
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

