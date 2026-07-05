'use strict';

// ===== STATE =====
const G = {
  name: '',
  questions: [],   // 10 questions for current session
  current: 0,      // index into questions[]
  score: 0,
  attempts: 0,     // attempts on current question
  locked: false,   // block card clicks while animating
  voice: null,
  audioCtx: null,
  currentOptions: [], // shuffled options for current question
};

// ===== UTILS =====
function $(id) { return document.getElementById(id); }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ===== SCREENS =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

// ===== TTS =====
function loadVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  const pt = voices.filter(v => /pt[-_]BR/i.test(v.lang));
  // Prefere vozes de alta qualidade (Google > Microsoft > demais)
  G.voice =
    pt.find(v => /google/i.test(v.name)) ||
    pt.find(v => /francisca|maria/i.test(v.name)) ||
    pt.find(v => /luciana/i.test(v.name)) ||
    pt.find(v => /female|camila|vitoria|ana/i.test(v.name)) ||
    pt[0] ||
    voices.find(v => /pt/i.test(v.lang)) ||
    null;
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = loadVoice;
  loadVoice();
}

// Fala uma sequência de frases com pausa natural entre elas
function speakSeq(phrases, rate = 0.99, pitch = 1.18) {
  if (!('speechSynthesis' in window) || !phrases.length) return;
  speechSynthesis.cancel();
  let i = 0;
  function next() {
    if (i >= phrases.length) return;
    const u = new SpeechSynthesisUtterance(phrases[i++]);
    u.lang   = 'pt-BR';
    u.rate   = rate;
    u.pitch  = pitch;
    u.volume = 1;
    if (G.voice) u.voice = G.voice;
    u.onend = () => setTimeout(next, 120);
    speechSynthesis.speak(u);
  }
  next();
}

// Atalho para frase única
function speak(text, rate = 0.99, pitch = 1.18) {
  speakSeq([text], rate, pitch);
}

// ===== AUDIO =====
function initAudio() {
  if (!G.audioCtx) {
    G.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (G.audioCtx.state === 'suspended') G.audioCtx.resume();
}

function tone(freq, type, dur, vol = 0.25, delay = 0) {
  const ctx = G.audioCtx;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  const t = ctx.currentTime + delay;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.01);
}

function playCorrect() {
  initAudio();
  [261.63, 329.63, 392, 523.25].forEach((f, i) => tone(f, 'sine', 0.25, 0.28, i * 0.1));
}

function playWrong() {
  initAudio();
  const ctx = G.audioCtx;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sawtooth';
  const t = ctx.currentTime;
  osc.frequency.setValueAtTime(260, t);
  osc.frequency.exponentialRampToValueAtTime(90, t + 0.35);
  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc.start(t);
  osc.stop(t + 0.37);
}

function playWin() {
  initAudio();
  [392, 494, 587, 784].forEach((f, i) => tone(f, 'sine', 0.4, 0.28, i * 0.13));
}

// ===== CELEBRATIONS =====
function celebrate() {
  const type = Math.floor(Math.random() * 3);
  if (type === 0) launchConfetti();
  else if (type === 1) showOverlay('🌈', true);
  else showOverlay('🦄', false);
}

function launchConfetti() {
  const canvas = $('confetti-canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('active');
  const ctx = canvas.getContext('2d');
  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff922b','#cc5de8','#ffffff'];
  const parts = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -15 - Math.random() * 180,
    w: Math.random() * 10 + 5,
    h: Math.random() * 5 + 3,
    color: pick(colors),
    rot: Math.random() * 360,
    rotS: Math.random() * 6 - 3,
    vy: Math.random() * 4 + 2,
    vx: Math.random() * 2 - 1,
  }));
  let frame = 0;
  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach(p => {
      p.y += p.vy; p.x += p.vx; p.rot += p.rotS;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (++frame < 165) requestAnimationFrame(animate);
    else {
      canvas.classList.remove('active');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  })();
}

function showOverlay(emoji, rainbow) {
  const el = $('celebration-overlay');
  el.textContent = emoji;
  el.style.animation = rainbow
    ? 'pop-in 0.45s ease, rainbow-spin 0.8s linear infinite'
    : 'pop-in 0.45s ease';
  el.classList.add('active');
  setTimeout(() => {
    el.classList.remove('active');
    el.textContent = '';
    el.style.animation = '';
  }, 1800);
}

// ===== TELA NOME =====
const nameInput = $('name-input');
const btnStart  = $('btn-start');

nameInput.addEventListener('input', () => {
  btnStart.disabled = nameInput.value.trim().length === 0;
});
nameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !btnStart.disabled) beginFromName();
});
btnStart.addEventListener('click', () => { initAudio(); beginFromName(); });

function beginFromName() {
  G.name = nameInput.value.trim();
  localStorage.setItem('playerName', G.name);
  showWelcome();
}

// ===== TELA BOAS-VINDAS =====
$('btn-play').addEventListener('click', () => { initAudio(); startGame(); });

function showWelcome() {
  $('welcome-msg').textContent = `Olá ${G.name}! 🦄❤️👋`;
  showScreen('screen-welcome');
  setTimeout(() => speakSeq([`Olá ${G.name}!`, 'Que bom ver você aqui!', 'Clique em jogar para começar.'], 1.06, 1.18), 400);
}

// ===== POOL SEM REPETIÇÃO =====
// Sorteia n perguntas nunca vistas. Ao esgotar as 250, reseta o pool.
function drawQuestions(n) {
  let usedIds = JSON.parse(localStorage.getItem('usedQIds') || '[]');
  let pool = QUESTIONS.filter(q => !usedIds.includes(q.id));
  if (pool.length < n) {
    usedIds = [];
    pool = [...QUESTIONS];
    localStorage.setItem('usedQIds', '[]');
  }
  const selected = shuffle(pool).slice(0, n);
  localStorage.setItem('usedQIds',
    JSON.stringify([...usedIds, ...selected.map(q => q.id)]));
  return selected;
}

// ===== JOGO =====
function startGame() {
  G.questions = drawQuestions(10);
  G.current   = 0;
  G.score     = 0;
  $('q-score').textContent = '✅ 0';
  showScreen('screen-playing');
  showQuestion();
}

function showQuestion() {
  const q = G.questions[G.current];
  G.attempts = 0;
  G.locked   = false;

  $('q-progress').textContent  = `${G.current + 1} / 10`;
  $('question-text').textContent = q.question;
  $('feedback-text').textContent = '';

  // Shuffle options and store
  G.currentOptions = shuffle(q.options);

  const cards = document.querySelectorAll('.card');
  cards.forEach((card, i) => {
    const opt = G.currentOptions[i];
    const imgEl = card.querySelector('.card-image');
    if (opt.image) {
      imgEl.src = opt.image;
      imgEl.hidden = false;
      card.querySelector('.card-emoji').textContent = '';
    } else {
      imgEl.hidden = true;
      imgEl.removeAttribute('src');
      card.querySelector('.card-emoji').textContent = opt.emoji;
    }
    card.querySelector('.card-label').textContent = opt.label;
    card.className = 'card'; // reset all states
  });

  setTimeout(() => speakSeq([q.question], 0.98, 1.18), 350);
}

// Single delegated listener on the grid
$('cards-grid').addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (!card || G.locked || card.classList.contains('disabled')) return;
  const idx = parseInt(card.dataset.idx);
  const opt = G.currentOptions[idx];
  handleAnswer(card, opt.correct, opt.label);
});

function handleAnswer(card, isCorrect, label) {
  initAudio();

  if (isCorrect) {
    G.locked = true;
    G.score++;
    card.classList.add('correct');
    playCorrect();
    $('q-score').textContent = `✅ ${G.score}`;

    celebrate();
    setTimeout(() => speakSeq([pick([
      `Isso mesmo, É ${label}!`,
      `Parabéns! É ${label}!`,
      `Você acertou! É ${label}!`,
      `Excelente! É ${label}!`,
      `Muito bem! É ${label}!`,
      `Perfeito! É ${label}!`,
      `Você é demais! É ${label}!`,
      `Essa você sabia! É ${label}!`,
      `Você é uma estrela! É ${label}!`,
      `Viva, você acertou! É ${label}!`,
      `Ótimo trabalho! É ${label}!`,
    ])], 1.06, 1.18), 200);
    setTimeout(nextQuestion, 3000);

  } else {
    G.attempts++;
    card.classList.add('wrong');
    playWrong();

    if (G.attempts === 1) {
      $('feedback-text').textContent = '❌ Tente de novo!';
      setTimeout(() => card.classList.remove('wrong'), 600);

    } else {
      // 2ª tentativa errada — revelar a correta
      G.locked = true;
      $('feedback-text').textContent = '💡 A resposta certa era...';
      document.querySelectorAll('.card').forEach(c => {
        const idx = parseInt(c.dataset.idx);
        if (G.currentOptions[idx] && G.currentOptions[idx].correct) {
          c.classList.add('reveal');
          speakSeq([`A resposta certa é: ${G.currentOptions[idx].label}.`], 0.99, 1.18);
        } else {
          c.classList.add('disabled');
        }
      });
      setTimeout(nextQuestion, 2800);
    }
  }
}

function nextQuestion() {
  G.current++;
  if (G.current < G.questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

// ===== RESULTADO =====
function showResults() {
  showScreen('screen-results');
  const s = G.score;
  let stars, title, sub;

  if (s >= 8) {
    stars = '⭐⭐⭐';
    title = `Você é incrível ${G.name}!`;
    sub   = `Acertou ${s} de 10 perguntas! Fantástico!`;
  } else if (s >= 5) {
    stars = '⭐⭐';
    title = `Muito bem, ${G.name}! 😊`;
    sub   = `Acertou ${s} de 10 perguntas! Continue praticando!`;
  } else {
    stars = '⭐';
    title = `Boa tentativa, ${G.name}! 💪`;
    sub   = `Acertou ${s} de 10 perguntas. Vamos praticar mais!`;
  }

  $('result-stars').textContent   = stars;
  $('result-title').textContent   = title;
  $('result-subtitle').textContent = sub;

  playWin();
  launchConfetti();
  setTimeout(() => speakSeq([title, sub, 'Vamos jogar de novo?'], 1.20, 1.18), 500);
}

$('btn-replay').addEventListener('click', () => { initAudio(); startGame(); });

$('btn-exit').addEventListener('click', () => {
  initAudio();
  speak(`Até logo, ${G.name}!`, 0.99, 1.18);
  setTimeout(() => {
    G.name = '';
    localStorage.removeItem('playerName');
    nameInput.value = '';
    btnStart.disabled = true;
    showScreen('screen-name');
  }, 2500);
});

$('btn-repeat').addEventListener('click', () => {
  const text = $('question-text').textContent;
  if (text) speakSeq([text], 1.20, 1.18);
});

// ===== INICIALIZAR =====
(function init() {
  const saved = localStorage.getItem('playerName');
  if (saved) {
    nameInput.value   = saved;
    btnStart.disabled = false;
  }
})();
