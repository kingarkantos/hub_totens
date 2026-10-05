# Diretrizes do Projeto - Hub de Totens

## Deploy e Versionamento Contínuo no GitHub / Vercel
- **Commit e Push Automático**: Sempre que concluir uma tarefa ou fizer alterações válidas no código, adicione os arquivos (`git add .`), faça o commit com mensagem descritiva e envie com `git push origin master`.
- **Atualização do Vercel**: O Vercel está configurado para deploy contínuo integrado ao GitHub. O push garante a publicação imediata da versão mais recente em produção.

## Regras de Mensagens e Métricas de Jogos (Quizzes vs Interação/Ação/Pontuação)
- **Distinção Obrigatória de Tipo de Jogo**:
  - **Jogos de Perguntas/Quiz**: Somente jogos com perguntas de múltipla escolha ou verdadeiro/falso devem usar termos como "questões", "respostas corretas", "gabaritou" e "pontuação máxima".
  - **Jogos de Ação, Reflexo, Agilidade, Coordenação e Interação com Pontuação**: NUNCA devem exibir frases de perguntas como "Você não errou nenhuma questão" ou "pontuação máxima". Devem sempre exibir feedbacks focados em agilidade, reflexo, destreza e pontuação, acompanhados de relatórios detalhados com as métricas contextuais da partida (como quantidade de cada tipo de alvo ou item acertado/coletado, precisão, penalidades e tempo).
  - **Regra para Novos Jogos**: Ao criar qualquer novo jogo para o totem, classifique-o obrigatoriamente (`gameType`: 'quiz' | 'action' | 'reflex' | 'arcade' | 'memory' | 'puzzle') e forneça os rótulos adequados (`correctAnswersLabel`, `totalMetricLabel`) ou um relatório customizado detalhado via `gameOverCustomContent`.

