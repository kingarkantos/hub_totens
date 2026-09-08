import { GAME_CONTENT_SCHEMAS } from '../types/gameContent';

export function parseCSVToRows(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Regex to handle quoted commas if present
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let c of lines[i]) {
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    values.push(current.trim());

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
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

  switch (gameId) {
    case 'wheel':
      return rows.map((r) => ({
        label: r.label || r['nome'] || 'Prêmio',
        score: parseInt(r.score || r['pontos'] || '200', 10),
        color: r.color || r['cor'] || '#DC2626',
      }));

    case 'quiz':
      return rows.map((r) => {
        const correctLetter = (r.correct_option || r['correta'] || 'A').toUpperCase();
        let correctIdx = 0;
        if (correctLetter === 'B' || correctLetter === '1') correctIdx = 1;
        if (correctLetter === 'C' || correctLetter === '2') correctIdx = 2;
        if (correctLetter === 'D' || correctLetter === '3') correctIdx = 3;

        return {
          question: r.question || r['pergunta'] || 'Pergunta sem título',
          options: [
            r.option_a || r['alternativa_a'] || 'Opção A',
            r.option_b || r['alternativa_b'] || 'Opção B',
            r.option_c || r['alternativa_c'] || 'Opção C',
            r.option_d || r['alternativa_d'] || 'Opção D',
          ],
          correct: correctIdx,
        };
      });

    case 'target':
      return rows.map((r) => ({
        name: r.name || r['alvo'] || 'Alvo',
        symbol: r.symbol || r['simbolo'] || '🎯',
        points: parseInt(r.points || r['pontos'] || '100', 10),
        isBonus: (r.is_bonus || r['bonus'] || '').toLowerCase() === 'true',
      }));

    case 'memory':
      return rows.map((r) => ({
        symbol: r.symbol || r['simbolo'] || '🚗',
        label: r.label || r['nome'] || 'Item',
      }));

    case 'catcher':
      return rows.map((r) => {
        let type: 'gift' | 'star' | 'hazard' = 'gift';
        const rawType = (r.type || r['tipo'] || '').toLowerCase();
        if (rawType === 'star' || rawType === 'estrela') type = 'star';
        if (rawType === 'hazard' || rawType === 'bomba' || rawType === 'obstaculo') type = 'hazard';

        return {
          name: r.name || r['item'] || 'Item',
          symbol: r.symbol || r['simbolo'] || (type === 'hazard' ? '💣' : '🎁'),
          points: parseInt(r.points || r['pontos'] || '150', 10),
          type,
        };
      });

    case 'speed':
      const firstRow = rows[0];
      return {
        vehicleName: firstRow.vehicle_name || firstRow['veiculo'] || 'Super Máquina',
        category: firstRow.category || firstRow['categoria'] || 'Esportivo',
        targetKmh: parseInt(firstRow.target_kmh || firstRow['velocidade'] || '100', 10),
        flavorText: firstRow.flavor_text || firstRow['frase'] || 'Acelere ao máximo!',
      };

    case 'safe':
      const safeRow = rows[0];
      return {
        secretCode: (safeRow.secret_code || safeRow['codigo'] || '375').slice(0, 3),
        prizeName: safeRow.prize_name || safeRow['premio'] || 'Brinde Especial do Cofre',
        hints: [
          safeRow.hint_1 || safeRow['dica_1'] || 'Número ímpar',
          safeRow.hint_2 || safeRow['dica_2'] || 'Maior que 5',
          safeRow.hint_3 || safeRow['dica_3'] || 'Menor que 8',
        ],
      };

    case 'genius':
      return rows.map((r, idx) => ({
        id: parseInt(r.pad_id || String(idx), 10),
        name: r.name || r['botao'] || `Pilar ${idx + 1}`,
        color: r.color || r['cor'] || 'Azul',
        symbol: r.symbol || r['simbolo'] || '⚡',
      }));

    case 'puzzle':
      const pRow = rows[0];
      return {
        puzzleTitle: pRow.puzzle_title || pRow['titulo'] || 'Quebra-Cabeça da Marca',
        pieceLabels: [
          pRow.piece_1 || '1',
          pRow.piece_2 || '2',
          pRow.piece_3 || '3',
          pRow.piece_4 || '4',
          pRow.piece_5 || '5',
          pRow.piece_6 || '6',
          pRow.piece_7 || '7',
          pRow.piece_8 || '8',
        ],
      };

    case 'balloon':
      return rows.map((r) => ({
        name: r.name || r['balao'] || 'Balão Oficial',
        color: r.color || r['cor'] || '#EF4444',
        points: parseInt(r.points || r['pontos'] || '100', 10),
        isGold: (r.is_gold || r['ouro'] || '').toLowerCase() === 'true',
      }));

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
