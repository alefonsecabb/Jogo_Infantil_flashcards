'use strict';

/* Sistema de progressão: moedinhas de ouro + álbum de figurinhas.
   Progresso (moedas/badges) fica amarrado ao nome digitado pelo jogador,
   seguindo o mesmo padrão de localStorage já usado para playerName/usedQIds
   (js/game.js). Depende do global G (js/game.js, carregado depois deste
   arquivo) e de t()/pick()/$ — só usados dentro de funções chamadas em
   tempo de execução, nunca no carregamento do script. */

const PROGRESS_KEY = 'playerProgress';
const COINS_PER_BADGE = 3;

// slug → emoji + chave i18n do nome + arquivo de vídeo em video/badges/
// (nome do arquivo tem que bater exatamente com o disco, espaços/acentos
// incluídos — é escapado com encodeURI() no momento de tocar o vídeo).
const CATEGORY_META = {
  cuidador_pets:          { emoji: '🐶', labelKey: 'catCuidadorPets',          video: 'cuidador de pets.mp4' },
  explorador_selva:       { emoji: '🦁', labelKey: 'catExploradorSelva',       video: 'explorador da selva.mp4' },
  explorador_oceanos:     { emoji: '🐬', labelKey: 'catExploradorOceanos',     video: 'explorador dos oceanos.mp4' },
  observador_insetos:     { emoji: '🐛', labelKey: 'catObservadorInsetos',     video: 'observador de insetos.mp4' },
  observador_passaros:    { emoji: '🐦', labelKey: 'catObservadorPassaros',    video: 'observador de pássaros.mp4' },
  observador_dinossauros: { emoji: '🦕', labelKey: 'catObservadorDinossauros', video: 'oservador de dinossauros.mp4' },
  alimentacao_saudavel:   { emoji: '🥗', labelKey: 'catAlimentacaoSaudavel',   video: 'alimentação saudável.mp4' },
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
// Selos de um conjunto de categorias anterior (slugs que não existem mais em
// CATEGORY_META) são descartados silenciosamente — as moedas continuam
// valendo normalmente.
function hydrateProgress() {
  const p = loadProgressFor(G.name);
  G.coins  = p.coins;
  G.badges = p.badges.filter(slug => ALL_CATEGORY_SLUGS.includes(slug));
  if (G.badges.length !== p.badges.length) {
    saveProgressFor(G.name, { coins: G.coins, badges: G.badges });
  }
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

// ===== TELA DO MAPA =====
// Trilha de 26 estágios (uma por categoria), na ordem real em que os selos
// foram conquistados — não há como saber de antemão qual categoria virá a
// seguir, já que awardForRoundResult() sorteia aleatoriamente entre as que
// faltam.
function renderMap() {
  const track = $('map-track');
  track.innerHTML = '';
  const total = ALL_CATEGORY_SLUGS.length;
  const unlockedCount = G.badges.length;
  const remainder = G.coins % COINS_PER_BADGE;
  const coinsToNext = remainder === 0 ? COINS_PER_BADGE : COINS_PER_BADGE - remainder;

  for (let i = 0; i < total; i++) {
    const stage = document.createElement('div');
    stage.className = 'map-stage ' + (i % 2 === 0 ? 'stage-up' : 'stage-down');

    const num = document.createElement('span');
    num.className = 'map-stage-num';
    num.textContent = i + 1;
    stage.appendChild(num);

    if (i < unlockedCount) {
      const meta = CATEGORY_META[G.badges[i]];
      stage.classList.add('unlocked');
      stage.innerHTML += `<span class="map-stage-emoji">${meta.emoji}</span>
        <span class="map-stage-label">${t(meta.labelKey)}</span>
        <span class="map-stage-check">✅</span>`;
    } else if (i === unlockedCount && unlockedCount < total) {
      stage.classList.add('current');
      stage.id = 'map-stage-current';
      stage.innerHTML += `<span class="map-stage-emoji">🪙</span>
        <span class="map-stage-label">${coinsToNext}/${COINS_PER_BADGE}</span>`;
    } else {
      stage.classList.add('locked');
      stage.innerHTML += `<span class="map-stage-emoji">🔒</span><span class="map-stage-label">?</span>`;
    }
    track.appendChild(stage);

    if (i < total - 1) {
      const connector = document.createElement('div');
      connector.className = 'map-connector';
      track.appendChild(connector);
    }
  }

  $('map-progress-text').textContent = t('mapProgress')(unlockedCount, total);

  requestAnimationFrame(() => {
    const target = $('map-stage-current') || track.lastElementChild;
    if (target && target.scrollIntoView) target.scrollIntoView({ inline: 'center', block: 'nearest' });
  });
}
