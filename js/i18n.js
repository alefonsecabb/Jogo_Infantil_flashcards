/* UI + speech dictionaries for pt/en, plus the two runtime helpers that
   apply translated text to the DOM and merge an English question/option
   translation onto a QUESTIONS[i] entry at render time.
   Depends on QUESTIONS_EN (js/questions.en.js, loaded just before this
   file) and on the global G object (js/game.js, loaded right after this
   file) — G only needs to exist by the time these functions are CALLED,
   not at script-load time, since plain <script> tags share one global
   scope and nothing here runs until a user interaction triggers it. */

const UI_STRINGS = {
  pt: {
    title: 'Vamos Aprender!',
    pickLanguage: 'Escolha o idioma / Choose your language',
    nameSubtitle: 'Qual é o seu nome?',
    namePlaceholder: 'Digite seu nome...',
    btnStart: 'Começar! 🚀',
    welcomeSubtitle: 'Pronto para aprender coisas incríveis?',
    btnPlay: 'Jogar! 🎮',
    btnRepeatAria: 'Repetir pergunta',
    feedbackRetry: '❌ Tente de novo!',
    feedbackReveal: '💡 A resposta certa era...',
    btnReplay: 'Jogar de novo! 🔄',
    btnExit: 'Sair 👋',

    greeting: (name) => [`Olá ${name}!`, 'Que bom ver você aqui!', 'Clique em jogar para começar.'],
    celebrations: (label) => [
      `Isso mesmo, É ${label}!`,
      `Parabéns! É ${label}!`,
      `Você acertou! É ${label}!`,
      `Excelente! É ${label}!`,
      `Muito bem! É ${label}!`,
      `Perfeito! É ${label}!`,
      `Você é demais! É ${label}!`,
      `Éssa você sabia! É ${label}!`,
      `Você é uma estrela! É ${label}!`,
      `Viva, você acertou! É ${label}!`,
      `Ótimo trabalho! É ${label}!`,
    ],
    revealCorrect: (label) => `A resposta certa é: ${label}.`,
    resultTiers: {
      high: (name, s) => ({ stars: '⭐⭐⭐', title: `Você é incrível ${name}!`, sub: `Acertou ${s} de 10 perguntas! Fantástico!` }),
      mid:  (name, s) => ({ stars: '⭐⭐',   title: `Muito bem, ${name}! 😊`,     sub: `Acertou ${s} de 10 perguntas! Continue praticando!` }),
      low:  (name, s) => ({ stars: '⭐',     title: `Boa tentativa, ${name}! 💪`, sub: `Acertou ${s} de 10 perguntas. Vamos praticar mais!` }),
    },
    playAgainClose: 'Vamos jogar de novo?',
    farewell: (name) => `Até logo, ${name}!`,
  },

  en: {
    title: "Let's Learn!",
    pickLanguage: 'Escolha o idioma / Choose your language',
    nameSubtitle: "What's your name?",
    namePlaceholder: 'Type your name...',
    btnStart: "Let's go! 🚀",
    welcomeSubtitle: 'Ready to learn amazing things?',
    btnPlay: 'Play! 🎮',
    btnRepeatAria: 'Repeat question',
    feedbackRetry: '❌ Try again!',
    feedbackReveal: '💡 The correct answer was...',
    btnReplay: 'Play again! 🔄',
    btnExit: 'Exit 👋',

    greeting: (name) => [`Hi ${name}!`, 'So good to see you here!', 'Click play to get started.'],
    celebrations: (label) => [
      `That's right, it's ${label}!`,
      `Congratulations! It's ${label}!`,
      `You got it! It's ${label}!`,
      `Excellent! It's ${label}!`,
      `Well done! It's ${label}!`,
      `Perfect! It's ${label}!`,
      `You're awesome! It's ${label}!`,
      `You knew that one! It's ${label}!`,
      `You're a star! It's ${label}!`,
      `Yay, you got it right! It's ${label}!`,
      `Great job! It's ${label}!`,
    ],
    revealCorrect: (label) => `The correct answer is: ${label}.`,
    resultTiers: {
      high: (name, s) => ({ stars: '⭐⭐⭐', title: `You're amazing, ${name}!`, sub: `You got ${s} out of 10! Fantastic!` }),
      mid:  (name, s) => ({ stars: '⭐⭐',   title: `Great job, ${name}! 😊`,   sub: `You got ${s} out of 10! Keep practicing!` }),
      low:  (name, s) => ({ stars: '⭐',     title: `Good try, ${name}! 💪`,    sub: `You got ${s} out of 10. Let's practice more!` }),
    },
    playAgainClose: 'Want to play again?',
    farewell: (name) => `See you soon, ${name}!`,
  },
};

function t(key) {
  const dict = UI_STRINGS[G.lang] || UI_STRINGS.pt;
  return dict[key] !== undefined ? dict[key] : UI_STRINGS.pt[key];
}

function applyI18n() {
  document.documentElement.lang = G.lang === 'en' ? 'en-US' : 'pt-BR';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
}

// Merge the English translation onto a question at render time, with
// graceful per-field fallback to the original (Portuguese) text — any
// question/option missing from QUESTIONS_EN simply stays in Portuguese.
function localizeQuestion(q) {
  if (G.lang !== 'en') return q;
  const tr = QUESTIONS_EN[q.id];
  if (!tr) return q;
  return {
    ...q,
    question: tr.q || q.question,
    options: q.options.map((opt, i) => ({
      ...opt,
      label: (tr.o && tr.o[i]) || opt.label,
    })),
  };
}
