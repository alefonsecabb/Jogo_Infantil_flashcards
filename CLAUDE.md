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
    ├── questions.js    # banco com 500 perguntas (26 categorias), em português
    ├── questions.en.js # traduções em inglês das 500 perguntas, indexadas por id
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
| 1 | Animais domésticos | 🐾 | 19 |
| 2 | Animais selvagens | 🦁 | 19 |
| 3 | Animais marinhos | 🐬 | 19 |
| 4 | Animais da fazenda | 🐄 | 19 |
| 5 | Insetos e pequenos animais | 🐛 | 19 |
| 6 | Pássaros | 🐦 | 19 |
| 7 | Dinossauros | 🦕 | 19 |
| 8 | Frutas | 🍎 | 19 |
| 9 | Vegetais e legumes | 🥕 | 19 |
| 10 | Natureza e plantas | 🌿 | 19 |
| 11 | Estações do ano | 🍂 | 19 |
| 12 | Clima e tempo | 🌤️ | 19 |
| 13 | Cores | 🎨 | 19 |
| 14 | Formas geométricas | 🔷 | 19 |
| 15 | Números e quantidades | 🔢 | 19 |
| 16 | Família | 👨‍👩‍👧 | 19 |
| 17 | Emoções | 💛 | 19 |
| 18 | Corpo e sentidos | 👃 | 19 |
| 19 | Escola | 🏫 | 19 |
| 20 | Transportes | 🚗 | 19 |
| 21 | Profissões | 👩‍🏫 | 19 |
| 22 | Alimentos e bebidas | 🍽️ | 19 |
| 23 | Roupas e acessórios | 👗 | 19 |
| 24 | Objetos da casa | 🏠 | 19 |
| 25 | Brinquedos e diversão | 🎮 | 19 |
| 26 | Espaço e Universo | 🚀 | 25 |
| | **TOTAL** | | **500** |

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

- `js/questions.en.js` traduz as 500 perguntas, indexado por `id` (mesmo `id` de `js/questions.js`). Cobertura parcial é segura: qualquer pergunta sem tradução aparece em português automaticamente (fallback campo a campo em `localizeQuestion()`).
- `js/i18n.js` tem o dicionário `UI_STRINGS.pt`/`UI_STRINGS.en` com todos os textos fixos da interface e as frases faladas, mais `applyI18n()` (aplica texto nos elementos `data-i18n*`) e `localizeQuestion()`.
- **Ao adicionar uma pergunta nova em `questions.js`, não é obrigatório traduzir na hora** — ela some aparece em português até alguém adicionar a entrada correspondente em `questions.en.js` (mesmo `id`, campo `o` na mesma ordem das opções autorais: `[certa, errada1, errada2, errada3]`).
- A voz (Web Speech API) troca de idioma junto — `G.voicePt`/`G.voiceEn` calculadas em `loadVoice()` (game.js), cada uma com sua cadeia de preferência de voz.

## Sistema de Progressão (Moedas + Álbum de Figurinhas)

- **Moedinha de ouro**: qualquer rodada com 8 ou mais acertos (de 10) rende +1 moeda, entregue com o vídeo `video/moeda/unicornio_video.mp4` (overlay fullscreen, `js/game.js` → `playOverlayVideo()`). O saldo é vitalício (nunca reseta) e aparece no topo das telas de Boas-vindas, Jogo e Resultado (`.coin-balance`).
- **Badges de categoria**: a cada múltiplo de 10 moedas (10, 20, 30...), a criança ganha 1 badge de uma categoria sorteada entre as 26, sem repetir uma já conquistada. Badges ficam guardados no Álbum de Figurinhas (`#screen-album`), acessível a qualquer momento pelo ícone de livro (📖) fixo no canto superior esquerdo — visível em todas as telas exceto a de escolha de idioma.
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
- [x] 10 perguntas por sessão (sorteadas do banco de 500+)
- [x] Tela de resultado com 1–3 estrelas
- [x] Responsivo: funciona em tablet, celular e PC
- [x] Orientação retrato e paisagem suportadas
- [x] Sem necessidade de internet após o carregamento inicial
- [x] Suporte bilíngue português/inglês com seletor de bandeiras e voz nativa em cada idioma
- [x] Sistema de progressão: moedinhas de ouro por rodadas com 8+ acertos, entregues por vídeo de unicórnio
- [x] Álbum de figurinhas com badges de categoria (sorteados a cada 10 moedas), acessível por ícone de livro fixo
- [x] Progresso (moedas/badges) salvo por nome de jogador, persistente entre sessões

## Changelog

### 2026-07-09 — v1.2.0
- Sistema de progressão: moedinhas de ouro (rodada com 8+/10 acertos), álbum de figurinhas com badges de categoria sorteados a cada 10 moedas, vídeo de entrega da moedinha (unicórnio) com fallback gracioso para vídeos de categoria ainda não produzidos
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
