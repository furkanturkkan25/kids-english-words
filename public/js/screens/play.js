import { api } from "../api.js";
import {
  state,
  currentLevel,
  currentWord,
  saveProgress,
  clamp,
} from "../state.js";
import { speech, isMatch } from "../speech.js";
import { $, showScreen, setStatus, updateCoins, toastCoins } from "../ui.js";

let advancing = false;

export async function openLevel(index, { onComplete } = {}) {
  if (index > state.unlocked && !state.completed.has(index)) return;
  speech.stop();
  window.speechSynthesis?.cancel();
  state.levelIndex = index;
  state.wordIndex = 0;
  saveProgress();
  showScreen("play");
  await renderWord({ onComplete });
}

export async function renderWord({ onComplete } = {}) {
  const word = currentWord();
  if (!word) return;
  const token = `${state.levelIndex}:${state.wordIndex}:${word.en}`;
  advancing = false;

  const frame = $("photo-frame");
  const img = $("word-image");
  frame.classList.remove("is-success", "is-fail");
  img.removeAttribute("src");
  $("word-en").textContent = word.en;
  $("word-tr").textContent = word.tr || "…";
  updatePlayProgress();
  setStatus("Fotoğraf yükleniyor…");
  $("btn-speak").disabled = true;
  $("btn-hear").disabled = true;
  const toast = $("coin-toast");
  if (toast) toast.hidden = true;

  try {
    const media = await api.media(word.en);
    Object.assign(word, media);
  } catch {
    /* keep existing */
  }

  if (`${state.levelIndex}:${state.wordIndex}:${currentWord()?.en}` !== token) return;

  img.src = word.image;
  img.alt = word.alt || word.en;
  $("word-tr").textContent = word.tr;
  setStatus("Dinle…");
  $("btn-speak").disabled = false;
  $("btn-hear").disabled = false;

  setTimeout(() => {
    if (`${state.levelIndex}:${state.wordIndex}:${currentWord()?.en}` !== token || advancing) return;
    speech.speak(word.en, { onEnd: () => !advancing && setStatus("Şimdi sen söyle!") });
  }, 350);
}

function updatePlayProgress() {
  const level = currentLevel();
  $("level-label").textContent = `${level.id}. ${level.title}`;
  $("word-count").textContent = `${state.wordIndex + 1} / ${level.words.length}`;
  $("progress-fill").style.width = `${(state.wordIndex / level.words.length) * 100}%`;
}

export function hearAgain() {
  if (advancing) return;
  speech.stop();
  setStatus("Dinle…");
  speech.speak(currentWord().en, { onEnd: () => setStatus("Şimdi sen söyle!") });
}

export function toggleListen({ onComplete }) {
  const btn = $("btn-speak");
  if (speech.listening) {
    speech.stop();
    btn.classList.remove("is-listening");
    setStatus("Dinleme durdu. Tekrar basabilirsin.");
    return;
  }
  btn.classList.add("is-listening");
  setStatus("Seni dinliyorum…", "is-listen");
  speech.listen({
    onResult: (alts) => {
      btn.classList.remove("is-listening");
      if (alts.some((t) => isMatch(t, currentWord().en))) success({ onComplete });
      else fail(alts[0] || "");
    },
    onError: (err) => {
      btn.classList.remove("is-listening");
      if (err === "not-allowed") setStatus("Mikrofon izni gerekli.", "is-bad");
      else if (err === "no-speech") setStatus("Seni duyamadım. Tekrar dene!", "is-bad");
      else if (err === "unsupported") setStatus("Mikrofon bu tarayıcıda yok. Chrome dene.", "is-bad");
      else setStatus("Bir sorun oldu. Tekrar dene.", "is-bad");
    },
  });
}

function success({ onComplete }) {
  advancing = true;
  const frame = $("photo-frame");
  frame.classList.add("is-success");
  const gain = state.shop.coins.perWord || 8;
  state.pet.coins += gain;
  saveProgress();
  updateCoins(state.pet.coins);
  toastCoins(`+${gain} bahçe parası!`);
  setStatus("Aferin! Doğru söyledin.", "is-ok");
  $("btn-speak").disabled = true;
  $("btn-hear").disabled = true;

  const level = currentLevel();
  const next = state.wordIndex + 1;
  $("progress-fill").style.width = `${(next / level.words.length) * 100}%`;

  setTimeout(() => {
    if (next >= level.words.length) completeLevel({ onComplete });
    else {
      state.wordIndex = next;
      renderWord({ onComplete });
    }
  }, 1000);
}

function fail(heard) {
  $("photo-frame").classList.add("is-fail");
  setStatus(heard ? `“${heard}” duydum. Bir daha dene!` : "Henüz olmadı. Dinle ve tekrar et!", "is-bad");
  setTimeout(() => $("photo-frame").classList.remove("is-fail"), 450);
}

function completeLevel({ onComplete }) {
  speech.stop();
  window.speechSynthesis?.cancel();
  state.completed.add(state.levelIndex);
  if (state.levelIndex >= state.unlocked) {
    state.unlocked = Math.min(state.levelIndex + 1, state.levels.length - 1);
    if (state.levelIndex === state.levels.length - 1) state.unlocked = state.levelIndex;
  }
  const bonus = state.shop.coins.levelBonus || 25;
  state.pet.coins += bonus;
  state.pet.happy = clamp(state.pet.happy + 6);
  saveProgress();
  updateCoins(state.pet.coins);

  const level = currentLevel();
  $("level-done-title").textContent = `${level.title} tamam!`;
  if (state.completed.size >= state.levels.length) {
    $("level-done-text").textContent = `Son durak bitti! +${bonus} para · Tomo çok mutlu.`;
    $("btn-next-level").textContent = "Bitir";
  } else {
    const next = state.levels[Math.min(state.levelIndex + 1, state.levels.length - 1)];
    $("level-done-text").textContent = `+${bonus} para. Sırada: ${next.id}. ${next.title}`;
    $("btn-next-level").textContent = "Sonraki seviye";
  }
  showScreen("level");
  onComplete?.();
}
