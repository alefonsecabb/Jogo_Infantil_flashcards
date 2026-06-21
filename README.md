# Vamos Aprender! 🦋 — Voice-Driven Educational Quiz for Young Children

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-181717?style=flat&logo=github)](https://alefonsecabb.github.io/Jogo_Infantil_flashcards/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

A **zero-dependency**, **framework-free** educational quiz game built for children aged 4–6. Every question is spoken aloud in Brazilian Portuguese by the browser's native speech engine; answers are large, colourful emoji flashcards selected by touch or click. The entire experience ships as a **single HTML file** — no server, no build step, no installation.

> Originally built as a gift for Elisa (age 5) and open-sourced as a front-end portfolio piece.

---

## 🔗 Live Demo

**[alefonsecabb.github.io/Jogo_Infantil_flashcards](https://alefonsecabb.github.io/Jogo_Infantil_flashcards/)**

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🗣️ **Voice-first UX** | Every question is read aloud via the **Web Speech API** (pt-BR). Voices are ranked: Google TTS → Microsoft (Francisca/Maria) → macOS Luciana → system default |
| 🎴 **Emoji flashcards** | 4 large emoji + label cards per question, optimised for touch targets on any screen size |
| 🔁 **No-repeat question pool** | 500 questions across 26 categories. Already-seen IDs are stored in `localStorage`; the pool resets only after all 500 have been played |
| 🎉 **3 celebration types** | Chosen at random on each correct answer: canvas confetti burst, animated rainbow overlay, or flying unicorn |
| 🔊 **Procedural audio** | Correct / wrong / win sounds generated on the fly with **Web Audio API** — zero audio file dependencies |
| 👧 **Personalised session** | Child's name is persisted in `localStorage` and woven into every spoken phrase |
| ⭐ **Star rating** | 1–3 stars awarded at the end of each 10-question session |
| 📵 **Offline-capable** | Fully functional without internet after the first page load (Google Fonts fallback included) |
| 📱 **Cross-platform** | Responsive from 320 px phones to 4 K desktops; tested on Chrome/Edge, Safari iOS, and Chrome Android |

---

## 🛠 Tech Stack

```
Language   Vanilla JavaScript ES2020  (no transpiler, no bundler)
Styling    CSS3 — clamp(), vmin, flexbox, CSS Grid, @keyframes
Speech     Web Speech API — SpeechSynthesis / SpeechSynthesisUtterance
Audio      Web Audio API — OscillatorNode + GainNode (procedural synthesis)
Persistence  localStorage (player name + question pool state)
Hosting    GitHub Pages (static, free)
```

**No React. No Vue. No npm. No Webpack.** Just browser APIs and 4 files.

---

## 📂 Project Structure

```
Jogo_Infantil_flashcards/
├── index.html          # 4 screens: Name · Welcome · Playing · Results
├── css/
│   └── style.css       # Child-friendly design, animations, full responsiveness
└── js/
    ├── questions.js    # 500 questions in 26 categories (compact IIFE format)
    └── game.js         # State machine · TTS engine · audio · pool · celebrations
```

---

## 🎮 Game Flow

```
┌─────────────┐    ┌─────────────┐    ┌───────────────────────────┐    ┌─────────────┐
│  NAME INPUT │───►│   WELCOME   │───►│   PLAYING  (× 10 rounds)  │───►│   RESULTS   │
└─────────────┘    └─────────────┘    └───────────┬───────────────┘    └─────────────┘
                                                   │
                                      ┌────────────┴────────────┐
                                      ▼                         ▼
                                 Correct answer           Wrong answer
                                 • playCorrect()          • card shake
                                 • random celebration     • attempts++
                                 • short TTS praise       ├─ 1st: "Tente de novo!"
                                 → next question          └─ 2nd: reveal + TTS → next
```

---

## 🧠 Architecture Highlights

### No-Repeat Question Pool
```javascript
function drawQuestions(n) {
  let usedIds = JSON.parse(localStorage.getItem('usedQIds') || '[]');
  let pool = QUESTIONS.filter(q => !usedIds.includes(q.id));
  if (pool.length < n) { usedIds = []; pool = [...QUESTIONS]; } // reset when exhausted
  const selected = shuffle(pool).slice(0, n);
  localStorage.setItem('usedQIds', JSON.stringify([...usedIds, ...selected.map(q => q.id)]));
  return selected;
}
```

### Sequential TTS with Natural Pauses
```javascript
function speakSeq(phrases, rate = 0.99, pitch = 1.18) {
  speechSynthesis.cancel();
  let i = 0;
  function next() {
    if (i >= phrases.length) return;
    const u = new SpeechSynthesisUtterance(phrases[i++]);
    u.lang = 'pt-BR'; u.rate = rate; u.pitch = pitch;
    if (G.voice) u.voice = G.voice;
    u.onend = () => setTimeout(next, 120); // 120 ms natural breath between phrases
    speechSynthesis.speak(u);
  }
  next();
}
```

### Procedural Audio (no audio files)
```javascript
function playCorrect() {
  // Ascending C-major arpeggio: C4 · E4 · G4 · C5
  [261.63, 329.63, 392, 523.25].forEach((freq, i) =>
    tone(freq, 'sine', 0.25, 0.28, i * 0.1));
}
```

---

## 📚 Question Bank

**500 questions**, 4 options each (1 correct + 3 plausible distractors), spanning **26 categories**:

| # | Category | Emoji | # | Category | Emoji |
|---|---|:---:|---|---|:---:|
| 1 | Domestic animals | 🐾 | 14 | Geometric shapes | 🔷 |
| 2 | Wild animals | 🦁 | 15 | Numbers & quantities | 🔢 |
| 3 | Marine animals | 🐬 | 16 | Family | 👨‍👩‍👧 |
| 4 | Farm animals | 🐄 | 17 | Emotions | 💛 |
| 5 | Insects | 🐛 | 18 | Body & senses | 👃 |
| 6 | Birds | 🐦 | 19 | School | 🏫 |
| 7 | Dinosaurs | 🦕 | 20 | Transport | 🚗 |
| 8 | Fruits | 🍎 | 21 | Professions | 👩‍🏫 |
| 9 | Vegetables | 🥕 | 22 | Food & drinks | 🍽️ |
| 10 | Nature & plants | 🌿 | 23 | Clothes | 👗 |
| 11 | Seasons | 🍂 | 24 | Household objects | 🏠 |
| 12 | Weather | 🌤️ | 25 | Toys & fun | 🎮 |
| 13 | Colours | 🎨 | **26** | **Space & Universe** | 🚀 |

> **Category 26 — Space & Universe** is new (IDs 476–500): planets, astronauts, rockets, stars, the Moon, gravity, telescopes and more — designed to spark scientific curiosity in young children.

### Adding Questions
Append entries to the array in `js/questions.js` using the compact helper:
```javascript
// q(id, category, question_text, [correct_emoji, correct_label], [wrong1], [wrong2], [wrong3])
q(501, 'frutas', 'Qual fruta tem casca vermelha e é crocante por dentro?',
  ['🍎','Maçã'], ['🍊','Laranja'], ['🍋','Limão'], ['🍇','Uva']),
```

---

## 📱 Device & Browser Support

| Platform | Browser | TTS Quality | Audio |
|---|---|---|---|
| Windows 10 / 11 | Chrome, Edge | ✅ Excellent | ✅ |
| macOS | Safari, Chrome | ✅ Excellent | ✅ |
| Android | Chrome | ✅ Good | ✅ |
| iOS 14+ | Safari | ✅ Good | ✅ |
| Any | Firefox | ⚠️ Limited voices | ✅ |

> TTS quality depends on voices installed on the device. Chrome on Android and Safari on iOS/macOS deliver the best Brazilian Portuguese voices.

---

## 🚀 Getting Started

No installation required:

```bash
# Clone the repository
git clone https://github.com/alefonsecabb/Jogo_Infantil_flashcards.git

# Open directly in browser (no server needed)
# Windows
start index.html

# macOS / Linux
open index.html
```

Or simply visit the **[live demo](https://alefonsecabb.github.io/Jogo_Infantil_flashcards/)**.

---

## 🔧 Deploy (GitHub Pages)

```bash
git add .
git commit -m "feat: description of change"
git push origin main
```

GitHub Pages serves directly from the `main` branch root. Updates go live in ~60 seconds.

---

## 📄 License

MIT — free to use, modify and redistribute.

---

*Crafted with love for Elisa 🦋 · Alexandre da Fonseca · 2026*
