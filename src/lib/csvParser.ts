import { GAME_CONTENT_SCHEMAS } from '../types/gameContent';

/**
 * Robust CSV row parser supporting:
 * - UTF-8 BOM removal (common in Excel)
 * - Auto-detection of delimiter (semicolon ;, comma ,, or tab \t)
 * - Escaped quotes ("") and quoted strings containing delimiters
 * - Normalized header keys (accents removed, lowercased, trimmed)
 * - Positional indexing fallbacks
 */
export function parseCSVToRows(text: string): Record<string, string>[] {
  if (!text) return [];

  // 1. Remove UTF-8 BOM if present
  let cleanText = text.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  const rawLines = cleanText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (rawLines.length < 2) return [];

  // 2. Auto-detect delimiter: check first line for ; vs , vs \t
  const firstLine = rawLines[0];
  const countChar = (str: string, ch: string) => {
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '"') inQuotes = !inQuotes;
      else if (str[i] === ch && !inQuotes) count++;
    }
    return count;
  };

  const semiCount = countChar(firstLine, ';');
  const commaCount = countChar(firstLine, ',');
  const tabCount = countChar(firstLine, '\t');

  let delimiter = ',';
  if (semiCount > commaCount && semiCount >= tabCount) {
    delimiter = ';';
  } else if (tabCount > commaCount && tabCount > semiCount) {
    delimiter = '\t';
  }

  // 3. Helper to split a line respecting quotes
  const splitLine = (line: string, delim: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === delim && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    values.push(current.trim());
    return values;
  };

  // 4. Helper to normalize header keys
  const normalizeKey = (k: string) => {
    return k
      .replace(/^["']|["']$/g, '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents: afirmação -> afirmacao
      .replace(/[\s-]+/g, '_');
  };

  const rawHeaders = splitLine(rawLines[0], delimiter);
  const headers = rawHeaders.map(normalizeKey);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < rawLines.length; i++) {
    const rawValues = splitLine(rawLines[i], delimiter);
    // Ignore lines that are entirely empty
    if (rawValues.length === 1 && !rawValues[0]) continue;

    const rowObj: Record<string, string> = {};
    const cleanValues = rawValues.map((v) => {
      let val = v.trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      return val.trim();
    });

    headers.forEach((h, idx) => {
      rowObj[h] = cleanValues[idx] ?? '';
    });

    // Also attach numbered column fallbacks: _col0, _col1, _col2...
    cleanValues.forEach((val, idx) => {
      rowObj[`_col${idx}`] = val;
    });

    rows.push(rowObj);
  }

  return rows;
}

export function parseGameCSV(gameId: string, csvText: string): any {
  const rows = parseCSVToRows(csvText);
  if (rows.length === 0) {
    throw new Error('O arquivo CSV está vazio ou contém apenas o cabeçalho.');
  }

  // Helper to extract first non-empty value among list of candidate keys, with positional fallback
  const getVal = (r: Record<string, string>, keys: string[], colIndex?: number): string => {
    for (const k of keys) {
      const normalized = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s-]+/g, '_');
      if (r[normalized] !== undefined && r[normalized] !== '') {
        return r[normalized];
      }
    }
    if (colIndex !== undefined && r[`_col${colIndex}`] !== undefined && r[`_col${colIndex}`] !== '') {
      return r[`_col${colIndex}`];
    }
    return '';
  };

  switch (gameId) {
    case 'wheel':
      return rows.map((r, idx) => ({
        label: getVal(r, ['label', 'nome', 'premio', 'titulo', 'item'], 0) || `Prêmio ${idx + 1}`,
        score: parseInt(getVal(r, ['score', 'pontos', 'valor'], 1) || '200', 10) || 200,
        color: getVal(r, ['color', 'cor', 'hex'], 2) || '#DC2626',
      }));

    case 'quiz':
      return rows.map((r, idx) => {
        const question = getVal(r, ['question', 'pergunta', 'questao', 'titulo'], 0) || `Pergunta #${idx + 1}`;
        const optA = getVal(r, ['option_a', 'alternativa_a', 'opcao_a', 'a'], 1) || 'Opção A';
        const optB = getVal(r, ['option_b', 'alternativa_b', 'opcao_b', 'b'], 2) || 'Opção B';
        const optC = getVal(r, ['option_c', 'alternativa_c', 'opcao_c', 'c'], 3) || 'Opção C';
        const optD = getVal(r, ['option_d', 'alternativa_d', 'opcao_d', 'd'], 4) || 'Opção D';

        const correctRaw = getVal(r, ['correct_option', 'correta', 'resposta', 'gabarito'], 5).toUpperCase().trim();
        let correctIdx = 0;
        if (correctRaw === 'B' || correctRaw === '2') correctIdx = 1;
        else if (correctRaw === 'C' || correctRaw === '3') correctIdx = 2;
        else if (correctRaw === 'D' || correctRaw === '4') correctIdx = 3;
        else if (correctRaw === optB.toUpperCase()) correctIdx = 1;
        else if (correctRaw === optC.toUpperCase()) correctIdx = 2;
        else if (correctRaw === optD.toUpperCase()) correctIdx = 3;

        const imageUrl = getVal(r, ['image_url', 'imagem', 'image', 'foto', 'url_imagem'], 6);

        return {
          question,
          options: [optA, optB, optC, optD],
          correct: correctIdx,
          imageUrl: imageUrl || undefined,
        };
      });

    case 'target':
      return rows.map((r, idx) => {
        const name = getVal(r, ['name', 'alvo', 'nome', 'titulo'], 0) || `Alvo ${idx + 1}`;
        const symbol = getVal(r, ['symbol', 'simbolo', 'emoji', 'icone'], 1) || '🎯';
        const points = parseInt(getVal(r, ['points', 'pontos', 'valor'], 2) || '100', 10) || 100;
        const bonusRaw = getVal(r, ['is_bonus', 'bonus'], 3).toLowerCase();
        const isBonus = bonusRaw === 'true' || bonusRaw === 'sim' || bonusRaw === '1' || bonusRaw === 's';
        return { name, symbol, points, isBonus };
      });

    case 'memory':
      return rows.map((r, idx) => ({
        symbol: getVal(r, ['symbol', 'simbolo', 'emoji', 'icone'], 0) || '🚗',
        label: getVal(r, ['label', 'nome', 'item', 'titulo'], 1) || `Item ${idx + 1}`,
      }));

    case 'catcher':
      return rows.map((r, idx) => {
        let type: 'gift' | 'star' | 'hazard' = 'gift';
        const rawType = getVal(r, ['type', 'tipo', 'categoria'], 3).toLowerCase();
        if (rawType === 'star' || rawType === 'estrela') type = 'star';
        if (rawType === 'hazard' || rawType === 'bomba' || rawType === 'obstaculo' || rawType === 'perigo') type = 'hazard';

        const name = getVal(r, ['name', 'item', 'nome'], 0) || `Item ${idx + 1}`;
        const symbol = getVal(r, ['symbol', 'simbolo', 'emoji'], 1) || (type === 'hazard' ? '💣' : type === 'star' ? '⭐' : '🎁');
        const points = parseInt(getVal(r, ['points', 'pontos', 'valor'], 2) || '150', 10) || 150;

        return { name, symbol, points, type };
      });

    case 'speed':
      const firstRow = rows[0];
      return {
        vehicleName: getVal(firstRow, ['vehicle_name', 'veiculo', 'nome'], 0) || 'Super Máquina',
        category: getVal(firstRow, ['category', 'categoria', 'tipo'], 1) || 'Esportivo',
        targetKmh: parseInt(getVal(firstRow, ['target_kmh', 'velocidade', 'kmh'], 2) || '100', 10) || 100,
        flavorText: getVal(firstRow, ['flavor_text', 'frase', 'descricao'], 3) || 'Acelere ao máximo!',
      };

    case 'safe':
      const safeRow = rows[0];
      return {
        secretCode: (getVal(safeRow, ['secret_code', 'codigo', 'senha'], 0) || '375').slice(0, 3),
        prizeName: getVal(safeRow, ['prize_name', 'premio', 'brinde'], 1) || 'Brinde Especial do Cofre',
        hints: [
          getVal(safeRow, ['hint_1', 'dica_1', 'dica1'], 2) || 'Número ímpar',
          getVal(safeRow, ['hint_2', 'dica_2', 'dica2'], 3) || 'Maior que 5',
          getVal(safeRow, ['hint_3', 'dica_3', 'dica3'], 4) || 'Menor que 8',
        ],
      };

    case 'genius':
      return rows.map((r, idx) => ({
        id: parseInt(getVal(r, ['pad_id', 'id'], 0) || String(idx), 10),
        name: getVal(r, ['name', 'botao', 'nome', 'pilar'], 1) || `Pilar ${idx + 1}`,
        color: getVal(r, ['color', 'cor', 'hex'], 2) || '#3B82F6',
        symbol: getVal(r, ['symbol', 'simbolo', 'emoji'], 3) || '⚡',
      }));

    case 'puzzle':
      const pRow = rows[0];
      return {
        puzzleTitle: getVal(pRow, ['puzzle_title', 'titulo', 'nome'], 0) || 'Quebra-Cabeça da Marca',
        pieceLabels: [
          getVal(pRow, ['piece_1', 'peca_1', 'peca1'], 1) || '1',
          getVal(pRow, ['piece_2', 'peca_2', 'peca2'], 2) || '2',
          getVal(pRow, ['piece_3', 'peca_3', 'peca3'], 3) || '3',
          getVal(pRow, ['piece_4', 'peca_4', 'peca4'], 4) || '4',
          getVal(pRow, ['piece_5', 'peca_5', 'peca5'], 5) || '5',
          getVal(pRow, ['piece_6', 'peca_6', 'peca6'], 6) || '6',
          getVal(pRow, ['piece_7', 'peca_7', 'peca7'], 7) || '7',
          getVal(pRow, ['piece_8', 'peca_8', 'peca8'], 8) || '8',
        ],
      };

    case 'balloon':
      return rows.map((r, idx) => {
        const name = getVal(r, ['name', 'balao', 'nome'], 0) || `Balão #${idx + 1}`;
        const color = getVal(r, ['color', 'cor'], 1) || '#EF4444';
        const points = parseInt(getVal(r, ['points', 'pontos'], 2) || '100', 10) || 100;
        const goldRaw = getVal(r, ['is_gold', 'ouro', 'dourado'], 3).toLowerCase();
        const isGold = goldRaw === 'true' || goldRaw === 'sim' || goldRaw === '1' || goldRaw === 's';
        return { name, color, points, isGold };
      });

    case 'wordsearch':
      return {
        theme: getVal(rows[0], ['theme', 'tema', 'titulo'], 0) || 'Segurança e Normas',
        words: rows.map((r) => getVal(r, ['word', 'palavra', 'termo'], 0).toUpperCase().trim()).filter(Boolean),
      };

    case 'hangman':
      return rows.map((r, idx) => ({
        word: (getVal(r, ['word', 'palavra', 'termo'], 0) || `ITEM${idx + 1}`).toUpperCase().trim(),
        clue: getVal(r, ['clue', 'dica', 'pista'], 1) || 'Dica temática',
        category: getVal(r, ['category', 'categoria', 'tema'], 2) || 'Segurança',
      }));

    case 'truefalse':
      return rows.map((r, idx) => {
        const statement = getVal(r, ['statement', 'afirmacao', 'pergunta', 'frase', 'texto', 'item'], 0) || `Afirmação #${idx + 1}`;
        const rawTrue = getVal(r, ['is_true', 'verdadeiro', 'resposta', 'gabarito', 'correto', 'resultado'], 1).toLowerCase().trim();
        const isTrue = rawTrue === 'true' || rawTrue === 'verdadeiro' || rawTrue === 'v' || rawTrue === 'sim' || rawTrue === 's' || rawTrue === '1' || rawTrue === 'correto';
        const explanation = getVal(r, ['explanation', 'explicacao', 'justificativa', 'motivo', 'feedback'], 2) || (isTrue ? 'Correto!' : 'Falso!');
        return {
          statement,
          isTrue,
          explanation,
        };
      });

    case 'complete_phrase':
      return rows.map((r, idx) => {
        const sentence = getVal(r, ['sentence', 'frase', 'texto'], 0) || `Complete a frase #${idx + 1}: ___`;
        const missingWord = getVal(r, ['missing_word', 'palavra_correta', 'palavra', 'resposta', 'lacuna'], 1) || 'Palavra';
        const opt2 = getVal(r, ['opt_2', 'opcao_2', 'alternativa_b', 'distrator_1'], 2) || 'Opção 2';
        const opt3 = getVal(r, ['opt_3', 'opcao_3', 'alternativa_c', 'distrator_2'], 3) || 'Opção 3';
        const opt4 = getVal(r, ['opt_4', 'opcao_4', 'alternativa_d', 'distrator_3'], 4) || 'Opção 4';
        return {
          sentence,
          missingWord,
          options: [missingWord, opt2, opt3, opt4],
        };
      });

    case 'correct_order':
      const cRow = rows[0] || {};
      return {
        title: getVal(cRow, ['title', 'titulo', 'nome'], 0) || 'Procedimento de Segurança',
        steps: [
          getVal(cRow, ['step_1', 'passo_1', 'passo1'], 1) || 'Passo 1',
          getVal(cRow, ['step_2', 'passo_2', 'passo2'], 2) || 'Passo 2',
          getVal(cRow, ['step_3', 'passo_3', 'passo3'], 3) || 'Passo 3',
          getVal(cRow, ['step_4', 'passo_4', 'passo4'], 4) || 'Passo 4',
        ].filter(Boolean),
      };

    case 'connect_pairs':
      return rows.map((r, idx) => ({
        left: getVal(r, ['left_item', 'left', 'esquerda', 'item_a', 'coluna_a'], 0) || `Item A${idx + 1}`,
        right: getVal(r, ['right_item', 'right', 'direita', 'item_b', 'coluna_b'], 1) || `Item B${idx + 1}`,
      }));

    case 'speed_trivia':
      return rows.map((r, idx) => {
        const question = getVal(r, ['question', 'pergunta', 'questao'], 0) || `Pergunta Relâmpago #${idx + 1}`;
        const correct = getVal(r, ['correct_option', 'correta', 'resposta', 'gabarito'], 1) || 'Resposta Correta';
        const opt2 = getVal(r, ['opt_2', 'opcao_2', 'alternativa_b'], 2) || 'Opção B';
        const opt3 = getVal(r, ['opt_3', 'opcao_3', 'alternativa_c'], 3) || 'Opção C';
        const opt4 = getVal(r, ['opt_4', 'opcao_4', 'alternativa_d'], 4) || 'Opção D';
        return {
          question,
          options: [correct, opt2, opt3, opt4],
          correct: 0,
        };
      });

    case 'spot_error':
      const sRow = rows[0] || {};
      return {
        scenarioTitle: getVal(sRow, ['scenario_title', 'titulo', 'cenario'], 0) || 'Inspeção de Segurança',
        hazards: [
          { name: getVal(sRow, ['hazard_1', 'irregularidade_1', 'risco_1'], 1) || 'Irregularidade 1', description: 'Risco de acidente operacional' },
          { name: getVal(sRow, ['hazard_2', 'irregularidade_2', 'risco_2'], 2) || 'Irregularidade 2', description: 'Não conformidade com norma técnica' },
          { name: getVal(sRow, ['hazard_3', 'irregularidade_3', 'risco_3'], 3) || 'Irregularidade 3', description: 'Avaria em equipamento ou instalação' },
        ],
      };

    default:
      return rows;
  }
}

export function downloadSampleCsv(gameId: string) {
  const meta = GAME_CONTENT_SCHEMAS[gameId];
  if (!meta) return;

  const blob = new Blob([meta.sampleCsv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `modelo_${gameId}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
