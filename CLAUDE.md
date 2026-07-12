# Jogo Infantil Educativo — Vamos Aprender! 🦋

## Descrição do Projeto

Jogo educativo para Elisa (5 anos) e crianças de 4 a 6 anos. Perguntas faladas em português por voz feminina (Web Speech API). Respostas como flashcards clicáveis com emoji grande. Hospedado no GitHub Pages.

- **URL do jogo**: https://alefonsecabb.github.io/Jogo_Infantil_flashcards/
- **Repositório**: https://github.com/alefonsecabb/Jogo_Infantil_flashcards

## Stack Tecnológica

- HTML5 / CSS3 / JavaScript ES6+ (puro, sem frameworks)
- Web Speech API (SpeechSynthesis) — voz feminina pt-BR
- Web Audio API — efeitos sonoros procedurais (sem arquivos de áudio)
- GitHub Pages — hospedagem estática gratuita

## Estrutura de Arquivos

```
Projeto_jogo_Infantil_Elisa/
├── index.html          # 6 telas: Idioma, Nome, Boas-vindas, Jogo, Resultado, Álbum
├── CLAUDE.md           # este arquivo — histórico do projeto
├── README.md           # documentação pública
├── css/
│   └── style.css       # design infantil colorido + todas as animações
├── img/options/        # imagens customizadas das opções de resposta
├── video/
│   ├── moeda/unicornio_video.mp4   # animação de entrega da moedinha de ouro
│   └── categorias/                 # vídeos por categoria (adicionados aos poucos, ver seção Progressão)
└── js/
    ├── questions.js    # banco com 760 perguntas (26 categorias), em português
    ├── questions.en.js # traduções em inglês das 760 perguntas, indexadas por id
    ├── i18n.js         # dicionário pt/en da interface e da fala + helpers de tradução
    ├── progress.js      # moedas, badges, álbum de figurinhas — estado + persistência
    └── game.js         # lógica, TTS, áudio, estados, celebrações, idioma, menu do livro
```

## Fluxo do Jogo

```
LANGUAGE → NAME_INPUT → WELCOME → PLAYING → FEEDBACK → PLAYING ... → RESULTS → WELCOME
```

0. **LANGUAGE**: Tela inicial com bandeiras 🇧🇷/🇺🇸; escolha salva em localStorage (`lang`) e reaplicada a cada visita (mas sempre exibida, sem pular — mesmo padrão do nome)
1. **NAME_INPUT**: Pais digitam o nome da criança (salvo em localStorage)
2. **WELCOME**: Voz saúda pelo nome + botão "Jogar"
3. **PLAYING**: Pergunta falada automaticamente; 4 flashcards clicáveis; botão 🔊 para repetir
4. **FEEDBACK**: 1ª errada → shake + "Tente de novo!"; 2ª errada → revela certa; Certa → celebração
5. **RESULTS**: 1–3 estrelas; voz lê resultado; "Jogar de novo!"

## Categorias do Banco de Perguntas

| # | Categoria | Emoji | Qtd |
|---|-----------|-------|-----|
| 1 | Animais domésticos | 🐾 | 29 |
| 2 | Animais selvagens | 🦁 | 29 |
| 3 | Animais marinhos | 🐬 | 29 |
| 4 | Animais da fazenda | 🐄 | 29 |
| 5 | Insetos e pequenos animais | 🐛 | 29 |
| 6 | Pássaros | 🐦 | 29 |
| 7 | Dinossauros | 🦕 | 29 |
| 8 | Frutas | 🍎 | 29 |
| 9 | Vegetais e legumes | 🥕 | 29 |
| 10 | Natureza e plantas | 🌿 | 29 |
| 11 | Estações do ano | 🍂 | 29 |
| 12 | Clima e tempo | 🌤️ | 29 |
| 13 | Cores | 🎨 | 29 |
| 14 | Formas geométricas | 🔷 | 29 |
| 15 | Números e quantidades | 🔢 | 29 |
| 16 | Família | 👨‍👩‍👧 | 29 |
| 17 | Emoções | 💛 | 29 |
| 18 | Corpo e sentidos | 👃 | 29 |
| 19 | Escola | 🏫 | 29 |
| 20 | Transportes | 🚗 | 29 |
| 21 | Profissões | 👩‍🏫 | 29 |
| 22 | Alimentos e bebidas | 🍽️ | 29 |
| 23 | Roupas e acessórios | 👗 | 29 |
| 24 | Objetos da casa | 🏠 | 29 |
| 25 | Brinquedos e diversão | 🎮 | 29 |
| 26 | Espaço e Universo | 🚀 | 35 |
| | **TOTAL** | | **760** |

## Como Adicionar Perguntas

Edite `js/questions.js` e adicione objetos no array `QUESTIONS` seguindo este modelo:

```javascript
{
  id: 999,               // ID único
  category: 'animais',  // categoria (ver tabela acima)
  question: 'Qual animal faz AU AU?',
  options: [
    { emoji: '🐶', label: 'Cachorro', correct: true  },
    { emoji: '🐱', label: 'Gato',     correct: false },
    { emoji: '🐄', label: 'Vaca',     correct: false },
    { emoji: '🐸', label: 'Sapo',     correct: false }
  ]
}
```

## Suporte a Inglês (i18n)

O jogo é bilíngue (português/inglês), escolhido na tela de bandeiras no início:

- `js/questions.en.js` traduz as 760 perguntas, indexado por `id` (mesmo `id` de `js/questions.js`). Cobertura parcial é segura: qualquer pergunta sem tradução aparece em português automaticamente (fallback campo a campo em `localizeQuestion()`).
- `js/i18n.js` tem o dicionário `UI_STRINGS.pt`/`UI_STRINGS.en` com todos os textos fixos da interface e as frases faladas, mais `applyI18n()` (aplica texto nos elementos `data-i18n*`) e `localizeQuestion()`.
- **Ao adicionar uma pergunta nova em `questions.js`, não é obrigatório traduzir na hora** — ela some aparece em português até alguém adicionar a entrada correspondente em `questions.en.js` (mesmo `id`, campo `o` na mesma ordem das opções autorais: `[certa, errada1, errada2, errada3]`).
- A voz (Web Speech API) troca de idioma junto — `G.voicePt`/`G.voiceEn` calculadas em `loadVoice()` (game.js), cada uma com sua cadeia de preferência de voz.

## Sistema de Progressão (Moedas + Álbum de Figurinhas)

- **Moedinha de ouro**: qualquer rodada com 8 ou mais acertos (de 10) rende +1 moeda, entregue com o vídeo `video/moeda/unicornio_video.mp4` (overlay fullscreen, `js/game.js` → `playOverlayVideo()`). O saldo é vitalício (nunca reseta) e aparece no topo das telas de Boas-vindas, Jogo e Resultado (`.coin-balance`).
- **Badges de categoria**: a cada múltiplo de 3 moedas (3, 6, 9...), a criança ganha 1 badge de uma categoria sorteada entre as 26, sem repetir uma já conquistada. Badges ficam guardados no Álbum de Figurinhas (`#screen-album`), acessível a qualquer momento pelo ícone de livro (📖) fixo no canto superior esquerdo — visível em todas as telas exceto a de escolha de idioma. O limiar fica em `COINS_PER_BADGE` (`js/progress.js`). A tela de Boas-vindas mostra e fala um lembrete da regra (`albumHint` em `js/i18n.js`).
- **Vídeos por categoria**: `js/game.js` tenta tocar `video/categorias/<slug>.mp4` (slug = mesmo valor de `category` usado em `js/questions.js`) ao revelar um badge novo. Se o arquivo ainda não existir, cai automaticamente para uma revelação com emoji + nome da categoria — **basta adicionar o arquivo de vídeo com o nome certo na pasta para ele passar a tocar, sem alterar código**.
- **Persistência**: `js/progress.js` guarda `{ coins, badges }` por nome de jogador na chave localStorage `playerProgress` (mesmo padrão de `playerName`/`usedQIds` já usado pelo jogo — sem seletor de perfil dedicado, o nome digitado é a chave).
- Mapa categoria→emoji/nome fica em `CATEGORY_META` (`js/progress.js`); a lógica de sorteio/persistência fica em `awardForRoundResult()`, chamada uma vez por rodada dentro de `showResults()`.

## Como Fazer Deploy

```bash
git add -A
git commit -m "feat: descrição da mudança"
git push origin main
```

O GitHub Pages atualiza automaticamente em 1–2 minutos.

## Funcionalidades

- [x] Tela de nome personalizado (salvo em localStorage)
- [x] Voz feminina pt-BR falando perguntas e elogios
- [x] 4 flashcards com emoji por pergunta
- [x] 2 tentativas por pergunta antes de revelar a certa
- [x] 3 tipos de celebração: confete 🎊, arco-íris 🌈, unicórnio 🦄
- [x] Sons procedurais via Web Audio API
- [x] Botão 🔊 para repetir a pergunta
- [x] 10 perguntas por sessão (sorteadas do banco de 760+)
- [x] Tela de resultado com 1–3 estrelas
- [x] Responsivo: funciona em tablet, celular e PC
- [x] Orientação retrato e paisagem suportadas
- [x] Sem necessidade de internet após o carregamento inicial
- [x] Suporte bilíngue português/inglês com seletor de bandeiras e voz nativa em cada idioma
- [x] Sistema de progressão: moedinhas de ouro por rodadas com 8+ acertos, entregues por vídeo de unicórnio
- [x] Álbum de figurinhas com badges de categoria (sorteados a cada 3 moedas), acessível por ícone de livro fixo
- [x] Progresso (moedas/badges) salvo por nome de jogador, persistente entre sessões

## Changelog

### 2026-07-11 — v1.3.0
- +260 perguntas novas (10 por categoria, ids 501–760), em português e inglês, com dificuldade variada e diversos emojis/temas fora do banco usual (ex.: capivara, onça-pintada, buraco negro, saudade, pão de queijo) — banco total passa de 500 para 760 perguntas
- Dezenas de sugestões de imagem customizada referenciadas nas novas perguntas (`img/options/*.webp`), ainda não criadas — o jogo cai automaticamente para o emoji até cada arquivo ser adicionado

### 2026-07-09 — v1.2.0
- Sistema de progressão: moedinhas de ouro (rodada com 8+/10 acertos), álbum de figurinhas com badges de categoria sorteados a cada 3 moedas, vídeo de entrega da moedinha (unicórnio) com fallback gracioso para vídeos de categoria ainda não produzidos
- Menu do livro (📖) fixo em todas as telas (exceto idioma), com acesso ao álbum, início e sair
- Progresso persistido por nome de jogador em `localStorage` (`playerProgress`)

### 2026-07-05 — v1.1.0
- Suporte a inglês: tela de seleção de idioma (bandeiras 🇧🇷/🇺🇸), tradução das 500 perguntas (`js/questions.en.js`), dicionário de interface e fala (`js/i18n.js`), voz nativa em inglês via Web Speech API
- Imagens customizadas por opção de resposta (`img/options/`), substituindo emojis genéricos em espécies/objetos específicos

### 2026-06-20 — v1.0.0
- Criação inicial do projeto
- Banco de 550+ perguntas em 25 categorias
- Sistema de voz feminina pt-BR com seleção inteligente de voz
- Tela de nome personalizado com localStorage
- 3 tipos de celebração (confete, arco-íris, unicórnio)
- Sistema de 2 tentativas por pergunta
- Deploy no GitHub Pages
