# 🎯 Hub de Jogos para Totens

Sistema web interativo de **Hub de Jogos para Totens**, projetado para campanhas promocionais de eventos, concessionárias, estandes e feiras (exemplo: campanhas Honda, festivais, ativações de marca).

O sistema conta com um painel de gerenciamento completo com autenticação por senha para criação e configuração de campanhas personalizadas, além de uma interface otimizada para totens touch screen verticais (1080x1920) e horizontais (1920x1080), com suporte a tela cheia nativa, splash screen animada, 10 estilos de design system e 10 jogos interativos.

---

## 🚀 Funcionalidades Principais

### 1. Painel Administrativo / Hub Principal (`/`)
- **Autenticação por Senha**:
  - Protegido por senha mestra de fábrica: `24658011`.
  - Painel de configurações para alterar a senha mestra a qualquer momento.
  - Ajuste do tempo de inatividade (idle timeout) para reset automático do totem.
- **Gestão de Campanhas**:
  - Cadastro de nome, cliente/marca, slug da URL do totem (`/campanha-slug`).
  - Upload ou seleção de imagem de **Splash Screen** em alta resolução.
  - Seleção entre **10 temas visuais do Design System** com paletas de cores, botões e estilos.
  - Grid interativo com os **10 jogos**: selecione quais jogos ficam ativos e teste cada um em tempo real com o botão **Preview**!
  - Chave liga/desliga para o **Quadro de Líderes / Ranking** dos jogos (desativado por padrão).
  - Geração e cópia instantânea do link público da campanha para os totens.

### 2. Visão do Totem (`/:slug`, ex: `/campanha-honda`)
- **Splash Screen Imersiva**: Imagem de fundo com vinheta em degradê, identidade da marca, animações de entrada e botão pulsante com efeito glow *"TOQUE PARA JOGAR"*.
- **Modo Tela Cheia (Fullscreen API)**: Botão no canto superior para ativar a visualização imersiva do totem.
- **Lista de Jogos Otimizada**: Jogos selecionados exibidos um abaixo do outro, bem grandes, destacados, com cards táteis de alta resolução.
- **10 Jogos Interativos Touch**:
  1. 🎡 **Roleta Premiada**: Física de desaceleração realista, som de cliques por pino e confetes de vitória.
  2. ❓ **Quiz da Marca**: Perguntas dinâmicas com botões grandes de toque, timer de 15s e pontuação por agilidade.
  3. 🎯 **Caça aos Alvos**: Alvos surgem em posições aleatórias na tela; teste de reflexo rápido com bônus para alvos dourados.
  4. 🧠 **Jogo da Memória**: Cartas com flip 3D, ícones de veículos e produtos da marca, com contagem de movimentos e pares.
  5. 🛍️ **Chuva de Brindes**: Arraste o veículo/cesta na base touch para coletar presentes e desviar de bombas.
  6. 🏎️ **Arrancada Turbo**: Semáforo de largada (Vermelho -> Amarelo -> Verde) e pedal touch para acelerar de 0 a 100 km/h.
  7. 🔐 **Desafio do Cofre**: Discos numéricos com feedback visual de "Maior / Menor / Correto" para abrir o cofre de brindes.
  8. 🌈 **Sequência Luminosa (Genius)**: 4 pads coloridos gigantes com som sintetizado; repita a sequência crescente da máquina.
  9. 🧩 **Quebra-Cabeça Rápido**: Grid 3x3 deslizante de números com animação tátil para ordenação lógica.
  10. 🎈 **Estoura Balões**: Balões com física de flutuação ascendente; toque freneticamente para estourar o máximo de balões.
- **Efeitos Sonoros Nativos**: Web Audio API sintetizada, sem dependência de download de arquivos de áudio externos.
- **Quadro de Líderes**: Quando o ranking estiver ativado na campanha, os jogadores podem registrar seu nome e telefone ao final de cada partida.
- **Reset Automático por Inatividade**: Caso o totem fique parado sem toques na tela, retorna suavemente para a tela de Splash Screen.

### 3. Design System com 10 Temas Visuais
1. **Honda Racing Red**: Vermelho esportivo `#DC2626`, preto carbono `#0B0F19`, branco puro e estilo arrojado.
2. **Cyberpunk Neon**: Magenta `#EC4899`, ciano elétrico `#06B6D4` e fundo dark violet.
3. **Emerald Eco Clean**: Verde esmeralda `#059669`, sustentabilidade e harmonia.
4. **Luxury Gold & Obsidian**: Dourado acetinado `#D97706` e preto luxo para marcas VIP.
5. **Deep Ocean Corporate**: Azul royal `#2563EB`, azul marinho profundo e ciano gelo.
6. **Sunset Electric**: Degradê pôr do sol laranja solar `#F97316` para violeta `#8B5CF6`.
7. **Ultra Dark Stealth**: Grafite `#18181B` com acentos em verde lima fluorescente `#84CC16`.
8. **Candy Pop Pastel**: Lilás suave `#A855F7`, rosa chiclete e amarelo festivo.
9. **High-Tech Silver & Space**: Prata escovado `#94A3B8`, branco glacial e azul espacial.
10. **Solar Blaze Yellow**: Amarelo elétrico `#EAB308` e preto esportivo de alto contraste.

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

Todas as tabelas do sistema utilizam o prefixo obrigatório **`hubtotens_*`**:

| Tabela | Descrição |
|---|---|
| `hubtotens_settings` | Chaves de configuração global (ex: `admin_password` = `24658011`, `idle_timeout_seconds` = `90`). |
| `hubtotens_campaigns` | Campanhas cadastradas (`id`, `slug`, `name`, `client_name`, `splash_image_url`, `theme_id`, `selected_games`, `ranking_enabled`). |
| `hubtotens_games` | Catálogo dos 10 jogos interativos (`id`, `name`, `category`, `description`, etc.). |
| `hubtotens_rankings` | Registros de pontuação dos jogadores para campanhas com ranking ativado. |
| `hubtotens_analytics` | Registro de eventos e partidas jogadas no totem. |

---

## 📦 Como Rodar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# Acesse no navegador:
# Hub Admin: http://localhost:5173
# Totem da Campanha Honda: http://localhost:5173/campanha-honda
```

---

## 🌐 Deploy na Vercel & Integração com GitHub

O projeto já inclui o arquivo `vercel.json` configurado com reescrita para Single Page Application (SPA), garantindo que rotas como `/campanha-honda` ou `/campanha-X` funcionem perfeitamente em produção.

### Passo a Passo para Vercel:
1. Crie um repositório no GitHub (público ou privado):
   ```bash
   git init
   git add .
   git commit -m "feat: Hub de Jogos para Totens completo"
   git remote add origin https://github.com/SEU-USUARIO/hub-totens.git
   git branch -M main
   git push -u origin main
   ```
2. Na [Vercel](https://vercel.com):
   - Clique em **"Add New Project"** e importe o repositório do GitHub.
   - O framework preset será detectado automaticamente como **Vite**.
   - Clique em **Deploy**.
3. A cada novo `git push` no GitHub, a Vercel fará o deploy automático da nova versão!
