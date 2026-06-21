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
├── index.html          # 4 telas: Nome, Boas-vindas, Jogo, Resultado
├── CLAUDE.md           # este arquivo — histórico do projeto
├── README.md           # documentação pública
├── css/
│   └── style.css       # design infantil colorido + todas as animações
└── js/
    ├── questions.js    # banco com ≥500 perguntas (25 categorias)
    └── game.js         # lógica, TTS, áudio, estados, celebrações
```

## Fluxo do Jogo

```
NAME_INPUT → WELCOME → PLAYING → FEEDBACK → PLAYING ... → RESULTS → WELCOME
```

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

## Changelog

### 2026-06-20 — v1.0.0
- Criação inicial do projeto
- Banco de 550+ perguntas em 25 categorias
- Sistema de voz feminina pt-BR com seleção inteligente de voz
- Tela de nome personalizado com localStorage
- 3 tipos de celebração (confete, arco-íris, unicórnio)
- Sistema de 2 tentativas por pergunta
- Deploy no GitHub Pages
