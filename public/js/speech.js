const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const speech = {
  hasRecognition: Boolean(SpeechRecognition),
  hasTts: "speechSynthesis" in window,
  recognition: null,
  listening: false,

  pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => /en-US/i.test(v.lang) && /female|samantha|google/i.test(v.name)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      null
    );
  },

  speak(text, { onEnd } = {}) {
    if (!this.hasTts) return onEnd?.();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.85;
    u.pitch = 1.05;
    const v = this.pickVoice();
    if (v) u.voice = v;
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  },

  stop() {
    this.listening = false;
    try {
      this.recognition?.stop();
    } catch {
      /* ignore */
    }
  },

  listen({ onResult, onError }) {
    if (!this.hasRecognition) {
      onError?.("unsupported");
      return;
    }
    this.stop();
    window.speechSynthesis.cancel();
    const rec = new SpeechRecognition();
    this.recognition = rec;
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 4;
    this.listening = true;

    rec.onresult = (event) => {
      const alts = [];
      for (const result of event.results) {
        for (const alt of result) alts.push(alt.transcript);
      }
      this.listening = false;
      onResult?.(alts);
    };
    rec.onerror = (e) => {
      this.listening = false;
      onError?.(e.error);
    };
    rec.onend = () => {
      this.listening = false;
    };
    try {
      rec.start();
    } catch {
      this.listening = false;
      onError?.("busy");
    }
  },
};

function norm(t) {
  return String(t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dist(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

export function isMatch(transcript, target) {
  const said = norm(transcript);
  const want = norm(target);
  if (!said || !want) return false;
  if (said === want || said.includes(want) || want.includes(said)) return true;
  const allow = want.length <= 5 ? 1 : 2;
  return said.split(" ").some((t) => t === want || dist(t, want) <= allow);
}

window.speechSynthesis?.getVoices();
window.speechSynthesis && (window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices());
