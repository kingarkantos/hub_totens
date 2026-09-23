import { supabase, BUCKETS } from './supabase';

export interface CampaignAIContext {
  campaignName: string;
  clientName: string;
  description?: string;
  themeName?: string;
  userPrompt?: string;
  itemCount?: number;
}

let cachedGeminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Retrieves effective Gemini API key, checking in-memory cache, env, and Supabase settings.
 */
export async function getEffectiveGeminiKey(explicitKey?: string): Promise<string> {
  if (explicitKey && explicitKey.trim()) return explicitKey.trim();
  if (cachedGeminiKey && cachedGeminiKey.trim()) return cachedGeminiKey.trim();

  try {
    const { data } = await supabase
      .from('hubtotens_settings')
      .select('value')
      .eq('key', 'gemini_api_key')
      .maybeSingle();

    if (data?.value && typeof data.value === 'string' && data.value.trim()) {
      cachedGeminiKey = data.value.trim();
      return cachedGeminiKey;
    }
  } catch (err) {
    console.warn('Could not fetch gemini_api_key from settings:', err);
  }

  return cachedGeminiKey;
}

export async function generateGameContentWithAI(
  gameId: string,
  context: CampaignAIContext,
  apiKey?: string
): Promise<any> {
  const effectiveKey = await getEffectiveGeminiKey(apiKey);
  if (!effectiveKey) {
    throw new Error('Chave da API Gemini não configurada. Configure em Configurações do Hub.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveKey}`;

  const count = context.itemCount && context.itemCount > 0 ? context.itemCount : undefined;

  const gamePrompts: Record<string, string> = {
    wheel: `Gere exatamente ${count || 8} itens de prêmios/fatias para uma roleta da sorte interativa de totem.
Retorne um array JSON no formato:
[
  { "label": "Nome Curto do Prêmio", "score": 500, "color": "#DC2626" },
  ...
]
As cores devem ser hexadecimais vibrantes combinando com a marca. Os scores devem variar entre 150 e 800.`,

    quiz: `Gere exatamente ${count || 5} perguntas envolventes e desafiadoras de múltipla escolha sobre a marca, produtos, segurança ou contexto da campanha.
Retorne um array JSON no formato:
[
  {
    "question": "Texto da pergunta?",
    "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
    "correct": 0
  },
  ...
]
O campo "correct" deve ser o índice da alternativa correta (0 para A, 1 para B, 2 para C, 3 para D). Certifique-se de gerar exatamente ${count || 5} perguntas.`,

    target: `Gere exatamente ${count || 5} tipos de alvos para um jogo de reflexo rápido no totem.
Retorne um array JSON no formato:
[
  { "name": "Nome do Alvo", "symbol": "★", "points": 100, "isBonus": false },
  ...
]
O símbolo deve ser um emoji ou caractere visual atraente.`,

    memory: `Gere exatamente ${count || 6} pares de cartas para o jogo da memória temática.
Retorne um array JSON no formato:
[
  { "symbol": "🚗", "label": "Sedan Esportivo" },
  ...
]
Cada item deve ter um emoji temático e um rótulo curto de 1 a 3 palavras.`,

    catcher: `Gere exatamente ${count || 5} itens que caem da tela para um jogo de coletar brindes.
Retorne um array JSON no formato:
[
  { "name": "Kit Exclusivo", "symbol": "🎁", "points": 150, "type": "gift" },
  { "name": "Super Estrela", "symbol": "⭐", "points": 300, "type": "star" },
  { "name": "Obstáculo", "symbol": "💣", "points": -200, "type": "hazard" }
]
O campo "type" só pode ser "gift", "star" ou "hazard".`,

    speed: `Gere a configuração do desafio de arrancada turbo de 0 a 100 km/h.
Retorne um objeto JSON no formato:
{
  "vehicleName": "Nome do Veículo ou Máquina Principal",
  "category": "Categoria Ex: Super Esportivo",
  "targetKmh": 100,
  "flavorText": "Frase de efeito empolgante para a largada!"
}`,

    safe: `Gere a combinação e pistas para o jogo do cofre de brindes.
Retorne um objeto JSON no formato:
{
  "secretCode": "3 dígitos ex: 742",
  "prizeName": "Nome do Prêmio Secreto no Cofre",
  "hints": [
    "Dica curta para o primeiro dígito",
    "Dica curta para o segundo dígito",
    "Dica curta para o terceiro dígito"
  ]
}`,

    genius: `Gere os 4 pilares/recursos da marca para os 4 botões do jogo Genius.
Retorne um array JSON no formato:
[
  { "id": 0, "name": "Modo Sustentável", "color": "Verde", "symbol": "🌱" },
  { "id": 1, "name": "Motor Turbo", "color": "Vermelho", "symbol": "🔥" },
  { "id": 2, "name": "Conforto VIP", "color": "Amarelo", "symbol": "⭐" },
  { "id": 3, "name": "Alta Tecnologia", "color": "Azul", "symbol": "⚡" }
]`,

    puzzle: `Gere o título e o texto de 8 blocos para o quebra-cabeça deslizante 3x3.
Retorne um objeto JSON no formato:
{
  "puzzleTitle": "Título do Desafio",
  "pieceLabels": ["Palavra1", "Palavra2", "Palavra3", "Palavra4", "Palavra5", "Palavra6", "Palavra7", "Palavra8"]
}`,

    balloon: `Gere exatamente ${count || 5} tipos de balões com cores temáticas da marca.
Retorne um array JSON no formato:
[
  { "name": "Balão Oficial", "color": "#DC2626", "points": 100, "isGold": false },
  { "name": "Balão Ouro Bônus", "color": "#F59E0B", "points": 250, "isGold": true }
]`,

    wordsearch: `Gere um tema e exatamente ${count || 5} palavras-chave curtas (máximo 8 letras, apenas A-Z sem espaços ou acentos) para o jogo de caça-palavras.
Retorne um objeto JSON no formato:
{
  "theme": "Tema do Caça-Palavras",
  "words": ["PALAVRA1", "PALAVRA2", "PALAVRA3", "PALAVRA4", "PALAVRA5"]
}`,

    hangman: `Gere exatamente ${count || 5} palavras secretas desafiadoras e suas dicas para o jogo da forca.
Retorne um array JSON no formato:
[
  { "word": "EXTINTOR", "clue": "Dica objetiva e clara", "category": "Segurança" },
  ...
]`,

    truefalse: `Gere exatamente ${count || 5} afirmações sobre o tema da campanha para os participantes julgarem se é Verdadeiro ou Falso.
Retorne um array JSON no formato:
[
  {
    "statement": "Texto da afirmação",
    "isTrue": true,
    "explanation": "Explicação instrutiva e concisa de 1 frase justificando o porquê."
  },
  ...
]`,

    complete_phrase: `Gere exatamente ${count || 4} frases com lacuna (use exatamente ___ para a lacuna) e 4 opções de resposta para cada frase.
Retorne um array JSON no formato:
[
  {
    "sentence": "Frase com a lacuna ___ no meio ou no fim.",
    "missingWord": "Palavra Correta",
    "options": ["Palavra Correta", "Opção Errada 1", "Opção Errada 2", "Opção Errada 3"]
  },
  ...
]`,

    correct_order: `Gere um procedimento ou sequência de ${count || 4} passos na ordem correta para os participantes organizarem.
Retorne um objeto JSON no formato:
{
  "title": "Título do Procedimento ou Processo",
  "steps": [
    "Passo 1 inicial",
    "Passo 2 subsequente",
    "Passo 3 seguinte",
    "Passo 4 finalização"
  ]
}`,

    connect_pairs: `Gere exatamente ${count || 4} pares de associação entre duas colunas (ex: Situação/Risco e Solução/Proteção).
Retorne um array JSON no formato:
[
  { "left": "Item da Esquerda 1", "right": "Item Correspondente da Direita 1" },
  ...
]`,

    speed_trivia: `Gere exatamente ${count || 5} perguntas relâmpago de agilidade com 4 opções curtas.
Retorne um array JSON no formato:
[
  {
    "question": "Pergunta rápida?",
    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correct": 0
  },
  ...
]`,

    spot_error: `Gere um cenário de inspeção com exatamente ${count || 4} irregularidades/riscos identificáveis.
Retorne um objeto JSON no formato:
{
  "scenarioTitle": "Título do Cenário de Inspeção",
  "hazards": [
    { "name": "Nome do Risco 1", "description": "Descrição sucinta do impacto" },
    ...
  ]
}`,
  };

  const specificPrompt = gamePrompts[gameId] || 'Gere conteúdo relevante para o jogo em formato JSON.';

  const systemPrompt = `Você é um especialista criativo em ativações promocionais para marcas e totens interativos.
Crie o conteúdo para o jogo solicitado considerando o seguinte contexto:
- Cliente/Marca: ${context.clientName || 'Geral'}
- Nome da Campanha: ${context.campaignName || 'Campanha Promocional'}
- Descrição da Ação: ${context.description || 'Ativação em evento ou estande'}
- Estilo Visual: ${context.themeName || 'Moderno'}
${context.userPrompt ? `- Instruções adicionais do usuário: ${context.userPrompt}` : ''}

IMPORTANTE: Responda ESTRITAMENTE em formato JSON válido, sem comentários, sem markdown em volta (sem \`\`\`json), contendo apenas o objeto ou array solicitado.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${specificPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API Gemini (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Nenhuma resposta gerada pela IA.');
  }

  try {
    // Parse clean JSON
    return JSON.parse(text);
  } catch (err) {
    // Fallback attempt to strip backticks
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  }
}

/**
 * Generates a themed promotional image directly with Google Gemini (gemini-2.5-flash-image)
 * Automatically uploads to Supabase Storage for reliable totem kiosk caching.
 */
export async function generateImageWithAI(
  userPrompt: string,
  context?: Partial<CampaignAIContext>,
  apiKey?: string
): Promise<string> {
  const effectiveKey = await getEffectiveGeminiKey(apiKey);
  if (!effectiveKey) {
    throw new Error('Chave da API Gemini não configurada. Configure em Configurações do Hub.');
  }

  // 1. Build high quality commercial prompt for Gemini Image Generator
  const promptText = `Generate a realistic, high quality, commercial advertising illustration or photography for an interactive totem kiosk quiz question.
Theme / Subject: "${userPrompt}"
Brand / Context: ${context?.clientName || 'General'} - ${context?.campaignName || 'Campaign'}
Style: Bright, pristine, corporate commercial quality, photorealistic or sleek 3D studio render. Clean lighting, 4k. No text, no watermark, no dark or gothic elements.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${effectiveKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro ao gerar imagem com Gemini (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const inlinePart = data.candidates?.[0]?.content?.parts?.find(
    (p: any) => p.inlineData && p.inlineData.data
  );

  if (!inlinePart?.inlineData?.data) {
    throw new Error('O Gemini não retornou dados de imagem para este enunciado.');
  }

  const mimeType = inlinePart.inlineData.mimeType || 'image/png';
  const base64Data = inlinePart.inlineData.data;
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  // 2. Upload to Supabase Storage for permanent public URL
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';
    const fileName = `quiz_gemini_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = `quiz_images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.SPLASHES)
      .upload(filePath, blob, { contentType: mimeType, upsert: true });

    if (!uploadError) {
      const { data: publicData } = supabase.storage
        .from(BUCKETS.SPLASHES)
        .getPublicUrl(filePath);

      if (publicData?.publicUrl) {
        return publicData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Could not upload image to Supabase, returning data URL:', err);
  }

  return dataUrl;
}

