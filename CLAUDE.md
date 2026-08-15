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

## Suporte a Inglês (i18n)

O jogo é bilíngue (português/inglês), escolhido na tela de bandeiras no início:

- `js/questions.en.js` traduz as 760 perguntas, indexado por `id` (mesmo `id` de `js/questions.js`). Cobertura parcial é segura: qualquer pergunta sem tradução aparece em português automaticamente (fallback campo a campo em `localizeQuestion()`).
- `js/i18n.js` tem o dicionário `UI_STRINGS.pt`/`UI_STRINGS.en` com todos os textos fixos da interface e as frases faladas, mais `applyI18n()` (aplica texto nos elementos `data-i18n*`) e `localizeQuestion()`.
- **Ao adicionar uma pergunta nova em `questions.js`, não é obrigatório traduzir na hora** — ela some aparece em português até alguém adicionar a entrada correspondente em `questions.en.js` (mesmo `id`, campo `o` na mesma ordem das opções autorais: `[certa, errada1, errada2, errada3]`).
- A voz (Web Speech API) troca de idioma junto — `G.voicePt`/`G.voiceEn` calculadas em `loadVoice()` (game.js), cada uma com sua cadeia de preferência de voz.

## Sistema de Progressão (Moedas + Álbum de Figurinhas)

- **Moedinha de ouro**: qualquer rodada com 8 ou mais acertos (de 10) rende +1 moeda, entregue com o vídeo `video/moeda/unicornio_video.mp4` (overlay fullscreen, `js/game.js` → `playOverlayVideo()`). O saldo é vitalício (nunca reseta) e aparece no topo das telas de Boas-vindas, Jogo e Resultado (`.coin-balance`).
- **Badges de categoria**: a cada múltiplo de 3 moedas (3, 6, 9...), a criança ganha 1 badge sorteado entre as 7 categorias fixas de `CATEGORY_META` (`js/progress.js`), sem repetir uma já conquistada — álbum completo em 21 moedas. Badges ficam guardados no Álbum de Figurinhas (`#screen-album`), acessível a qualquer momento pelo ícone de livro (📖) fixo no canto superior esquerdo — visível em todas as telas exceto a de escolha de idioma. O limiar fica em `COINS_PER_BADGE` (`js/progress.js`). A tela de Boas-vindas mostra e fala um lembrete da regra (`albumHint` em `js/i18n.js`).
- **Vídeo do selo**: ao revelar um badge novo, `js/game.js` toca o vídeo dedicado daquela categoria em `video/badges/<arquivo>.mp4` — o nome do arquivo (com espaços/acentos) fica mapeado diretamente no campo `video` de cada entrada de `CATEGORY_META`, não é derivado automaticamente do slug. A transição do vídeo da moeda para o vídeo do selo é sequencial: o vídeo da moeda toca inteiro (com `holdOpen` mantendo o overlay escurecido aberto, sem fechar/reabrir), depois um sweep de luz dourada (`transitionToBadge()` em `js/game.js`, `#video-overlay-sweep` no CSS) cobre a troca de vídeo dentro do mesmo player (`playOverlayVideo()`), e a fala do selo ("Parabéns, você ganhou o selo de X!") começa junto do vídeo do selo, não do vídeo da moeda. O vídeo do selo é pré-carregado numa camada `<video>` escondida (`#video-overlay-player-2`) enquanto a moeda ainda toca, só para esquentar o cache do navegador — nunca é exibido nem tocado diretamente. Se o arquivo de vídeo não existir, cai automaticamente para uma revelação com emoji + nome da categoria. (Uma versão anterior tentava fundir os dois vídeos com fade cruzado sincronizado por tempo — era frágil e o selo às vezes não aparecia; foi revertida para essa transição sequencial mais simples.)
- **Persistência**: `js/progress.js` guarda `{ coins, badges }` por nome de jogador na chave localStorage `playerProgress` (mesmo padrão de `playerName`/`usedQIds` já usado pelo jogo — sem seletor de perfil dedicado, o nome digitado é a chave). `hydrateProgress()` descarta silenciosamente qualquer badge de um conjunto de categorias anterior que não exista mais em `CATEGORY_META`, sem afetar o saldo de moedas.
- Mapa categoria→emoji/nome/vídeo fica em `CATEGORY_META` (`js/progress.js`); a lógica de sorteio/persistência fica em `awardForRoundResult()`, chamada uma vez por rodada dentro de `showResults()`.

## Changelog

### 2026-08-15 — v1.4.1
- Corrigido bug em que o vídeo do selo não aparecia na transição moeda→badge: a tentativa anterior fundia os dois vídeos sobrepostos com fade cruzado sincronizado por tempo (`ontimeupdate`), o que era frágil; revertido para a transição sequencial mais simples (moeda toca inteira → sweep dourado → selo toca), reaproveitando o mesmo caminho de reprodução já comprovado (`playOverlayVideo()`) para os dois vídeos
- Vídeo do selo continua pré-carregado numa camada `<video>` escondida enquanto a moeda toca, só para esquentar o cache do navegador — nunca é exibido nem tocado diretamente

### 2026-08-07 — v1.4.0
- Álbum de figurinhas reduzido de 26 para 7 categorias fixas, cada uma com vídeo próprio em `video/badges/` (cuidador de pets, explorador da selva, explorador dos oceanos, observador de insetos, observador de pássaros, observador de dinossauros, alimentação saudável) — álbum completo em 21 moedas
- Fala dedicada por selo ("Parabéns, você ganhou o selo de X!"), sincronizada com o início do vídeo do selo em vez de compartilhar a fala com o vídeo da moeda
- Transição de sweep de luz dourada entre o vídeo da moeda e o vídeo do selo, sem fechar/reabrir o overlay (evita a tela de resultado piscar no meio da sequência)
- Progresso salvo de um conjunto de categorias anterior é migrado automaticamente: badges incompatíveis são descartados, moedas continuam valendo

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
