'use strict';

/* Sistema de progressão: moedinhas de ouro + álbum de figurinhas.
   Progresso (moedas/badges) fica amarrado ao nome digitado pelo jogador,
   seguindo o mesmo padrão de localStorage já usado para playerName/usedQIds
   (js/game.js). Depende do global G (js/game.js, carregado depois deste
   arquivo) e de t()/pick()/$ — só usados dentro de funções chamadas em
   tempo de execução, nunca no carregamento do script. */

const PROGRESS_KEY = 'playerProgress';
const COINS_PER_BADGE = 10;

// slug (igual ao usado em js/questions.js) → emoji + chave i18n do nome
const CATEGORY_META = {
  animais_domesticos: { emoji: '🐾', labelKey: 'catAnimaisDomesticos' },
  animais_selvagens:  { emoji: '🦁', labelKey: 'catAnimaisSelvagens' },
  animais_marinhos:   { emoji: '🐬', labelKey: 'catAnimaisMarinhos' },
  animais_fazenda:    { emoji: '🐄', labelKey: 'catAnimaisFazenda' },
  insetos:            { emoji: '🐛', labelKey: 'catInsetos' },
  passaros:           { emoji: '🐦', labelKey: 'catPassaros' },
  dinossauros:        { emoji: '🦕', labelKey: 'catDinossauros' },
  frutas:             { emoji: '🍎', labelKey: 'catFrutas' },
  vegetais:           { emoji: '🥕', labelKey: 'catVegetais' },
  natureza:           { emoji: '🌿', labelKey: 'catNatureza' },
  estacoes:           { emoji: '🍂', labelKey: 'catEstacoes' },
  clima:              { emoji: '🌤️', labelKey: 'catClima' },
  cores:              { emoji: '🎨', labelKey: 'catCores' },
  formas:             { emoji: '🔷', labelKey: 'catFormas' },
  numeros:            { emoji: '🔢', labelKey: 'catNumeros' },
  familia:            { emoji: '👨‍👩‍👧', labelKey: 'catFamilia' },
  emocoes:            { emoji: '💛', labelKey: 'catEmocoes' },
  corpo:              { emoji: '👃', labelKey: 'catCorpo' },
  escola:             { emoji: '🏫', labelKey: 'catEscola' },
  transportes:        { emoji: '🚗', labelKey: 'catTransportes' },
  profissoes:         { emoji: '👩‍🏫', labelKey: 'catProfissoes' },
  alimentos:          { emoji: '🍽️', labelKey: 'catAlimentos' },
  roupas:             { emoji: '👗', labelKey: 'catRoupas' },
  objetos_casa:       { emoji: '🏠', labelKey: 'catObjetosCasa' },
  brinquedos:         { emoji: '🎮', labelKey: 'catBrinquedos' },
  espaco:             { emoji: '🚀', labelKey: 'catEspaco' },
};
const ALL_CATEGORY_SLUGS = Object.keys(CATEGORY_META);

// ===== PERSISTÊNCIA =====
function loadAllProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
  catch { return {}; }
}

function loadProgressFor(name) {
  const all = loadAllProgress();
  return all[name] || { coins: 0, badges: [] };
}

function saveProgressFor(name, progress) {
  const all = loadAllProgress();
  all[name] = progress;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

// Popula G.coins/G.badges a partir do localStorage para o jogador atual.
function hydrateProgress() {
  const p = loadProgressFor(G.name);
  G.coins  = p.coins;
  G.badges = p.badges;
}

// Núcleo do "award": chamado uma vez no início de showResults(). Decide se a
// rodada rendeu moeda e/ou badge, persiste, e devolve o que aconteceu para a
// sequência de revelação decidir o que animar.
function awardForRoundResult(score) {
  const result = { coinEarned: false, newBadgeSlug: null, albumCompleted: false };
  if (score < 8) return result;

  result.coinEarned = true;
  G.coins++;

  if (G.coins % COINS_PER_BADGE === 0) {
    const remaining = ALL_CATEGORY_SLUGS.filter(slug => !G.badges.includes(slug));
    if (remaining.length > 0) {
      const slug = pick(remaining);
      G.badges.push(slug);
      result.newBadgeSlug = slug;
      if (remaining.length === 1) result.albumCompleted = true;
    }
  }

  saveProgressFor(G.name, { coins: G.coins, badges: G.badges });
  return result;
}

// Escreve G.coins em toda instância do saldo presente no DOM (boas-vindas,
// jogo e resultado têm cada uma a sua).
function updateCoinDisplay() {
  document.querySelectorAll('.coin-count').forEach(el => {
    el.textContent = G.coins;
  });
}

// ===== TELA DO ÁLBUM =====
function renderAlbum() {
  const grid = $('album-grid');
  grid.innerHTML = '';
  ALL_CATEGORY_SLUGS.forEach(slug => {
    const unlocked = G.badges.includes(slug);
    const meta = CATEGORY_META[slug];
    const el = document.createElement('div');
    el.className = 'album-slot' + (unlocked ? ' unlocked' : ' locked');
    el.innerHTML = unlocked
      ? `<span class="album-slot-emoji">${meta.emoji}</span><span class="album-slot-label">${t(meta.labelKey)}</span>`
      : `<span class="album-slot-emoji">🔒</span><span class="album-slot-label">?</span>`;
    grid.appendChild(el);
  });
  $('album-progress-text').textContent = t('albumProgress')(G.badges.length, ALL_CATEGORY_SLUGS.length);
}
