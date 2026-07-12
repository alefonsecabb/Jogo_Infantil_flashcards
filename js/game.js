'use strict';

// ===== STATE =====
const G = {
  name: '',
  lang: 'pt',      // 'pt' or 'en'
  questions: [],   // 10 questions for current session
  current: 0,      // index into questions[]
  score: 0,
  attempts: 0,     // attempts on current question
  locked: false,   // block card clicks while animating
  voicePt: null,
  voiceEn: null,
  audioCtx: null,
  currentOptions: [], // shuffled options for current question
  coins: 0,             // saldo de moedas do jogador ativo (espelha localStorage)
  badges: [],            // slugs de categoria conquistados (ordem)
  pendingTimeouts: [],   // setTimeout ids da sequência de revelação de RESULTS
  resultsToken: 0,       // invalida callbacks de fala pendentes se a tela mudar no meio
};

function currentVoice() { return G.lang === 'en' ? G.voiceEn : G.voicePt; }

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

// setTimeout rastreado: usado na sequência de revelação de RESULTS (moeda/
// badge) para poder cancelar tudo se a criança navegar no meio da animação.
function scheduleTimeout(fn, delay) {
  const id = setTimeout(fn, delay);
  G.pendingTimeouts.push(id);
  return id;
}
function clearPendingTimeouts() {
  G.pendingTimeouts.forEach(clearTimeout);
  G.pendingTimeouts = [];
}

// ===== SCREENS =====
function showScreen(id) {
  // Qualquer troca de tela interrompe uma eventual sequência de revelação
  // de moeda/badge pendente (ex.: criança clicou "Jogar de novo!" ou abriu
  // o álbum enquanto o vídeo ainda tocava).
  clearPendingTimeouts();
  forceCloseVideoOverlay();
  G.resultsToken++;

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  $('btn-book').style.display = (id === 'screen-language') ? 'none' : '';
  $('book-menu').classList.remove('open');
}

// ===== TTS =====
function loadVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  const pt = voices.filter(v => /pt[-_]BR/i.test(v.lang));
  // Prefere vozes de alta qualidade (Google > Microsoft > demais)
  G.voicePt =
    pt.find(v => /google/i.test(v.name)) ||
    pt.find(v => /francisca|maria/i.test(v.name)) ||
    pt.find(v => /luciana/i.test(v.name)) ||
    pt.find(v => /female|camila|vitoria|ana/i.test(v.name)) ||
    pt[0] ||
    voices.find(v => /pt/i.test(v.lang)) ||
    null;

  const en = voices.filter(v => /en[-_]US/i.test(v.lang));
  G.voiceEn =
    en.find(v => /google/i.test(v.name)) ||
    en.find(v => /samantha|zira|jenny|aria/i.test(v.name)) ||
    en.find(v => /female/i.test(v.name)) ||
    en[0] ||
    voices.find(v => /en/i.test(v.lang)) ||
    null;
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = loadVoice;
  loadVoice();

  // Workaround para bug conhecido do Chrome/Edge: depois de ~15s de fala
  // acumulada na aba, a engine de TTS passa a abafar/cortar a voz. Um
  // pause()+resume() periódico reseta esse watchdog interno.
  setInterval(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
      speechSynthesis.resume();
    }
  }, 5000);
}

// Fala uma sequência de frases com pausa natural entre elas. onComplete,
// se passado, é chamado depois que a última frase termina de ser falada
// (usado para encadear uma animação só depois que a fala realmente acabou,
// em vez de chutar um tempo fixo que pode cortar a voz no meio).
function speakSeq(phrases, rate = 0.99, pitch = 1.18, onComplete) {
  if (!('speechSynthesis' in window) || !phrases.length) {
    if (onComplete) onComplete();
    return;
  }
  speechSynthesis.cancel();
  let i = 0;
  function next() {
    if (i >= phrases.length) {
      if (onComplete) onComplete();
      return;
    }
    const u = new SpeechSynthesisUtterance(phrases[i++]);
    u.lang   = G.lang === 'en' ? 'en-US' : 'pt-BR';
    u.rate   = rate;
    u.pitch  = pitch;
    u.volume = 1;
    const v = currentVoice();
    if (v) u.voice = v;
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

// ===== OVERLAY DE VÍDEO (moeda / badge) =====
// Toca um vídeo fullscreen; se o arquivo não existir (404) ou o autoplay for
// bloqueado, cai automaticamente para um emoji animado — nunca trava a
// sequência de revelação. onEnd é sempre chamado exatamente uma vez.
function playOverlayVideo(src, { onEnd, fallbackEmoji } = {}) {
  const overlay  = $('video-overlay');
  const player   = $('video-overlay-player');
  const fallback = $('video-overlay-fallback');
  const grain    = $('video-overlay-grain');
  overlay.classList.add('active');

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    overlay.classList.remove('active');
    player.onended = null;
    player.onerror = null;
    player.pause();
    player.removeAttribute('src');
    player.load();
    player.style.display = '';
    player.classList.remove('fading');
    fallback.style.display = 'none';
    fallback.textContent = '';
    fallback.style.animation = '';
    fallback.classList.remove('fading');
    grain.classList.remove('active');
    if (onEnd) onEnd();
  };

  // Dissolve suave (vídeo/emoji esmaecendo + grão de filme) antes de fechar
  // o overlay — evita o corte seco no final da revelação.
  const fadeAndFinish = () => {
    if (done) return;
    const visible = player.style.display === 'none' ? fallback : player;
    visible.classList.add('fading');
    grain.classList.add('active');
    scheduleTimeout(finish, 650);
  };

  player.onerror = () => {
    player.style.display = 'none';
    fallback.style.display = 'flex';
    fallback.textContent = fallbackEmoji || '🎉';
    fallback.style.animation = 'pop-in 0.45s ease';
    scheduleTimeout(fadeAndFinish, 1400);
  };
  player.onended = fadeAndFinish;

  player.style.display = '';
  fallback.style.display = 'none';
  player.src = src;
  player.muted = false;
  player.play().catch(() => {
    // Autoplay com som bloqueado pelo navegador — tenta mudo em vez de
    // desistir do vídeo (melhor mostrar sem som do que só o fallback).
    player.muted = true;
    player.play().catch(() => player.onerror());
  });
}

// Fecha o overlay de vídeo imediatamente, sem disparar onEnd nem a
// dissolve suave — usado quando a criança navega para outra tela no meio
// de uma revelação.
function forceCloseVideoOverlay() {
  const overlay  = $('video-overlay');
  const player   = $('video-overlay-player');
  const fallback = $('video-overlay-fallback');
  const grain    = $('video-overlay-grain');
  overlay.classList.remove('active');
  player.onended = null;
  player.onerror = null;
  player.pause();
  player.removeAttribute('src');
  player.load();
  player.classList.remove('fading');
  fallback.classList.remove('fading');
  grain.classList.remove('active');
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

// ===== TELA IDIOMA =====
function selectLanguage(lang) {
  G.lang = lang;
  localStorage.setItem('lang', lang);
  applyI18n();
  document.querySelectorAll('.flag-btn').forEach(b => b.classList.remove('selected'));
  $(`btn-lang-${lang}`).classList.add('selected');
  showScreen('screen-name');
}
$('btn-lang-pt').addEventListener('click', () => { initAudio(); selectLanguage('pt'); });
$('btn-lang-en').addEventListener('click', () => { initAudio(); selectLanguage('en'); });

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
  hydrateProgress();
  showWelcome();
}

// ===== TELA BOAS-VINDAS =====
$('btn-play').addEventListener('click', () => { initAudio(); startGame(); });

function showWelcome() {
  $('welcome-msg').textContent = `${t('greeting')(G.name)[0]} 🦄❤️👋`;
  updateCoinDisplay();
  showScreen('screen-welcome');
  setTimeout(() => speakSeq([...t('greeting')(G.name), t('albumHint')], 1.06, 1.18), 400);
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
  updateCoinDisplay();
  showScreen('screen-playing');
  showQuestion();
}

function showQuestion() {
  const q = localizeQuestion(G.questions[G.current]);
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
    const emojiEl = card.querySelector('.card-emoji');
    if (opt.image) {
      // Imagem sugerida mas ainda não criada (404) cai pro emoji, em vez de
      // deixar o ícone de imagem quebrada na tela.
      imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.hidden = true;
        imgEl.removeAttribute('src');
        emojiEl.textContent = opt.emoji;
      };
      imgEl.src = opt.image;
      imgEl.hidden = false;
      emojiEl.textContent = '';
    } else {
      imgEl.onerror = null;
      imgEl.hidden = true;
      imgEl.removeAttribute('src');
      emojiEl.textContent = opt.emoji;
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
    setTimeout(() => speakSeq([pick(t('celebrations')(label))], 1.02, 1.18), 200);
    setTimeout(nextQuestion, 3000);

  } else {
    G.attempts++;
    card.classList.add('wrong');
    playWrong();

    if (G.attempts === 1) {
      $('feedback-text').textContent = t('feedbackRetry');
      setTimeout(() => card.classList.remove('wrong'), 600);

    } else {
      // 2ª tentativa errada — revelar a correta
      G.locked = true;
      $('feedback-text').textContent = t('feedbackReveal');
      document.querySelectorAll('.card').forEach(c => {
        const idx = parseInt(c.dataset.idx);
        if (G.currentOptions[idx] && G.currentOptions[idx].correct) {
          c.classList.add('reveal');
          speakSeq([t('revealCorrect')(G.currentOptions[idx].label)], 1.05, 1.18);
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
  const token = G.resultsToken;
  const s = G.score;
  const tier = s >= 8 ? 'high' : s >= 5 ? 'mid' : 'low';
  const { stars, title, sub } = t('resultTiers')[tier](G.name, s);

  $('result-stars').textContent   = stars;
  $('result-title').textContent   = title;
  $('result-subtitle').textContent = sub;

  playWin();
  launchConfetti();

  const award = awardForRoundResult(s);
  updateCoinDisplay();

  if (!award.coinEarned) {
    scheduleTimeout(() => speakSeq([title, sub, t('playAgainClose')], 0.93, 1.18), 500);
    return;
  }

  // Há moeda (e talvez badge) para revelar: fala o resultado normal primeiro
  // e só encadeia a moeda depois que a fala realmente terminar (nunca um
  // tempo fixo chutado, que pode cortar a voz no meio da frase).
  scheduleTimeout(() => {
    speakSeq([title, sub], 0.93, 1.18, () => {
      if (G.resultsToken !== token) return; // a tela já mudou nesse meio tempo
      scheduleTimeout(() => revealCoin(award), 500);
    });
  }, 500);
}

function revealCoin(award) {
  updateCoinDisplay();
  speakSeq([t('coinEarnedSpeech')], 1.0, 1.2);
  playOverlayVideo('video/moeda/unicornio_video.mp4', {
    fallbackEmoji: '🦄🪙',
    onEnd: () => {
      if (award.newBadgeSlug) {
        scheduleTimeout(() => revealBadge(award), 400);
      } else {
        scheduleTimeout(() => speakSeq([t('playAgainClose')], 0.93, 1.18), 300);
      }
    },
  });
}

function revealBadge(award) {
  const meta = CATEGORY_META[award.newBadgeSlug];
  const categoryLabel = t(meta.labelKey);
  speakSeq([t('badgeEarnedSpeech')(categoryLabel)], 1.0, 1.2);
  playOverlayVideo(`video/categorias/${award.newBadgeSlug}.mp4`, {
    fallbackEmoji: meta.emoji,
    onEnd: () => {
      const closing = award.albumCompleted
        ? [t('albumCompleteSpeech'), t('playAgainClose')]
        : [t('playAgainClose')];
      scheduleTimeout(() => speakSeq(closing, 0.93, 1.18), 300);
    },
  });
}

$('btn-replay').addEventListener('click', () => { initAudio(); startGame(); });

function exitToLanguage() {
  initAudio();
  speak(t('farewell')(G.name), 0.99, 1.18);
  setTimeout(() => {
    G.name = '';
    localStorage.removeItem('playerName');
    nameInput.value = '';
    btnStart.disabled = true;
    showScreen('screen-language');
  }, 2500);
}
$('btn-exit').addEventListener('click', exitToLanguage);

// ===== MENU DO LIVRO (álbum) =====
$('btn-book').addEventListener('click', () => {
  initAudio();
  $('menu-album').classList.toggle('disabled', !G.name);
  $('book-menu').classList.toggle('open');
});

$('menu-back').addEventListener('click', () => {
  $('book-menu').classList.remove('open');
});

$('menu-album').addEventListener('click', () => {
  if (!G.name) return;
  $('book-menu').classList.remove('open');
  renderAlbum();
  showScreen('screen-album');
});

$('menu-home').addEventListener('click', () => {
  $('book-menu').classList.remove('open');
  if (G.name) showWelcome();
  else showScreen('screen-name');
});

$('menu-exit').addEventListener('click', () => {
  $('book-menu').classList.remove('open');
  exitToLanguage();
});

$('btn-album-close').addEventListener('click', () => {
  if (G.name) showWelcome();
  else showScreen('screen-name');
});

$('btn-repeat').addEventListener('click', () => {
  const text = $('question-text').textContent;
  if (text) speakSeq([text], 1.05, 1.18);
});

// ===== INICIALIZAR =====
(function init() {
  const savedLang = localStorage.getItem('lang');
  if (savedLang) {
    G.lang = savedLang;
    applyI18n();
    const btn = $(`btn-lang-${savedLang}`);
    if (btn) btn.classList.add('selected');
  }

  const saved = localStorage.getItem('playerName');
  if (saved) {
    nameInput.value   = saved;
    btnStart.disabled = false;
  }

  showScreen('screen-language'); // sincroniza ícone do livro/estado inicial
})();
