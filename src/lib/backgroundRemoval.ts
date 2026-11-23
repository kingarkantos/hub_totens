/**
 * Utilitário client-side para remoção de fundo sólido (ex: fundo branco ou chroma-key)
 * e geração de PNG com transparência real (canal alfa), bordas suavizadas e recorte automático.
 */

export interface BackgroundRemovalOptions {
  /** Tolerância de distância de cor para o flood-fill inicial a partir das bordas (padrão: 46) */
  tolerance?: number;
  /** Faixa de suavização (feathering/anti-aliasing) nas bordas do objeto (padrão: 28) */
  feather?: number;
  /** Se verdadeiro, também remove buracos internos fechados exatamente da cor do fundo (padrão: true) */
  removeInnerHoles?: boolean;
  /** Tamanho quadrado final em pixels para o ícone recortado (padrão: 512) */
  outputSize?: number;
  /** Margem interna proporcional (0 a 0.25) ao redor do ícone recortado (padrão: 0.06) */
  paddingRatio?: number;
}

export interface BackgroundRemovalResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Carrega uma imagem a partir de Data URL, URL HTTP ou Blob.
 */
function loadImageElement(source: string | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let objectUrl: string | null = null;

    if (typeof source === 'string') {
      if (!source.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.src = source;
    } else {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error(`Falha ao carregar imagem para remoção de fundo: ${String(err)}`));
    };
  });
}

/**
 * Distância perceptual ponderada entre duas cores RGB (0..~765).
 */
function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const rMean = (r1 + r2) * 0.5;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  // Fórmula redmean (excelente separação perceptual)
  const weightR = 2 + rMean / 256;
  const weightG = 4;
  const weightB = 2 + (255 - rMean) / 256;
  return Math.sqrt(weightR * dr * dr + weightG * dg * dg + weightB * db * db) / 3;
}

/**
 * Detecta a cor dominante de fundo amostrando as 4 bordas e cantos da imagem.
 */
function detectBorderBackgroundColor(
  data: Uint8ClampedArray,
  width: number,
  height: number
): { r: number; g: number; b: number; alreadyTransparentRatio: number } {
  const samples: Array<[number, number, number]> = [];
  let transparentCount = 0;
  let totalChecked = 0;

  const samplePixel = (x: number, y: number) => {
    const idx = (y * width + x) * 4;
    totalChecked++;
    if (data[idx + 3] < 32) {
      transparentCount++;
      return;
    }
    samples.push([data[idx], data[idx + 1], data[idx + 2]]);
  };

  // Amostra todas as bordas (topo, base, esquerda, direita) com passo adaptativo
  const stepX = Math.max(1, Math.floor(width / 80));
  const stepY = Math.max(1, Math.floor(height / 80));

  for (let x = 0; x < width; x += stepX) {
    samplePixel(x, 0);
    samplePixel(x, Math.min(height - 1, 2));
    samplePixel(x, height - 1);
    samplePixel(x, Math.max(0, height - 3));
  }
  for (let y = 0; y < height; y += stepY) {
    samplePixel(0, y);
    samplePixel(Math.min(width - 1, 2), y);
    samplePixel(width - 1, y);
    samplePixel(Math.max(0, width - 3), y);
  }

  // Reforça peso nos 4 cantos
  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [3, 3],
    [Math.max(0, width - 4), 3],
    [3, Math.max(0, height - 4)],
    [Math.max(0, width - 4), Math.max(0, height - 4)],
  ];
  for (const [cx, cy] of corners) {
    for (let k = 0; k < 4; k++) {
      samplePixel(cx, cy);
    }
  }

  const alreadyTransparentRatio = totalChecked > 0 ? transparentCount / totalChecked : 0;

  if (samples.length === 0) {
    return { r: 255, g: 255, b: 255, alreadyTransparentRatio };
  }

  // Agrupa em buckets quantizados (step 12) para achar a moda (cor mais frequente da borda)
  const buckets = new Map<string, { count: number; sumR: number; sumG: number; sumB: number }>();
  for (const [r, g, b] of samples) {
    const key = `${Math.round(r / 12)}_${Math.round(g / 12)}_${Math.round(b / 12)}`;
    const entry = buckets.get(key);
    if (entry) {
      entry.count++;
      entry.sumR += r;
      entry.sumG += g;
      entry.sumB += b;
    } else {
      buckets.set(key, { count: 1, sumR: r, sumG: g, sumB: b });
    }
  }

  let best = { count: 0, sumR: 255, sumG: 255, sumB: 255 };
  for (const entry of buckets.values()) {
    if (entry.count > best.count) {
      best = entry;
    }
  }

  return {
    r: Math.round(best.sumR / best.count),
    g: Math.round(best.sumG / best.count),
    b: Math.round(best.sumB / best.count),
    alreadyTransparentRatio,
  };
}

/**
 * Remove o fundo sólido de uma imagem e retorna um PNG quadrado com fundo transparente,
 * bordas anti-serrilhadas, remoção de halo e auto-recorte centralizado.
 */
export async function removeSolidBackgroundToPngBlob(
  imageSource: string | Blob,
  options: BackgroundRemovalOptions = {}
): Promise<BackgroundRemovalResult> {
  const {
    tolerance = 44,
    feather = 26,
    removeInnerHoles = true,
    outputSize = 512,
    paddingRatio = 0.06,
  } = options;

  const img = await loadImageElement(imageSource);

  // Limita a resolução de trabalho para performance instantânea mantendo ótima qualidade
  const maxWorkDim = 768;
  const scale = Math.min(1, maxWorkDim / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
  const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
  const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));

  const workCanvas = document.createElement('canvas');
  workCanvas.width = width;
  workCanvas.height = height;
  const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Contexto 2D indisponível no navegador.');
  }

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const totalPixels = width * height;

  const { r: bgR, g: bgG, b: bgB, alreadyTransparentRatio } = detectBorderBackgroundColor(data, width, height);

  // Se a imagem já tiver transparência predominante nas bordas (> 65%), apenas recortamos e normalizamos!
  if (alreadyTransparentRatio < 0.65) {
    // 0 = não visitado/objeto, 1 = fundo confirmado (conectado à borda)
    const bgMask = new Uint8Array(totalPixels);
    const queue = new Int32Array(totalPixels);
    let qHead = 0;
    let qTail = 0;

    const enqueueIfBg = (x: number, y: number, tol: number) => {
      const pIdx = y * width + x;
      if (bgMask[pIdx]) return;
      const dIdx = pIdx * 4;
      if (data[dIdx + 3] < 20) {
        bgMask[pIdx] = 1;
        queue[qTail++] = pIdx;
        return;
      }
      const dist = colorDistance(data[dIdx], data[dIdx + 1], data[dIdx + 2], bgR, bgG, bgB);
      if (dist <= tol) {
        bgMask[pIdx] = 1;
        queue[qTail++] = pIdx;
      }
    };

    // Semeia todas as 4 bordas
    for (let x = 0; x < width; x++) {
      enqueueIfBg(x, 0, tolerance);
      enqueueIfBg(x, height - 1, tolerance);
    }
    for (let y = 1; y < height - 1; y++) {
      enqueueIfBg(0, y, tolerance);
      enqueueIfBg(width - 1, y, tolerance);
    }

    // BFS 4-vizinhos com verificação de cor global + continuidade local para evitar vazar no objeto
    const localStepLimit = 28;
    const expandedTolerance = tolerance + 10;

    while (qHead < qTail) {
      const curr = queue[qHead++];
      const cx = curr % width;
      const cy = (curr - cx) / width;
      const cOff = curr * 4;
      const cr = data[cOff];
      const cg = data[cOff + 1];
      const cb = data[cOff + 2];

      const neighbors = [
        cx > 0 ? curr - 1 : -1,
        cx < width - 1 ? curr + 1 : -1,
        cy > 0 ? curr - width : -1,
        cy < height - 1 ? curr + width : -1,
      ];

      for (let n = 0; n < 4; n++) {
        const nIdx = neighbors[n];
        if (nIdx < 0 || bgMask[nIdx]) continue;
        const nOff = nIdx * 4;
        if (data[nOff + 3] < 20) {
          bgMask[nIdx] = 1;
          queue[qTail++] = nIdx;
          continue;
        }
        const nr = data[nOff];
        const ng = data[nOff + 1];
        const nb = data[nOff + 2];

        const distBg = colorDistance(nr, ng, nb, bgR, bgG, bgB);
        if (distBg <= tolerance) {
          bgMask[nIdx] = 1;
          queue[qTail++] = nIdx;
        } else if (distBg <= expandedTolerance) {
          // Captura gradientes muito suaves no fundo, mas apenas se for contíguo ao pixel anterior
          const distLocal = colorDistance(nr, ng, nb, cr, cg, cb);
          if (distLocal <= localStepLimit) {
            bgMask[nIdx] = 1;
            queue[qTail++] = nIdx;
          }
        }
      }
    }

    // Passo opcional: remover buracos internos fechados (ex: alças de troféus, anéis, volantes)
    // Apenas se forem componentes conexos suficientemente grandes e muito próximos à cor exata do fundo
    if (removeInnerHoles) {
      const innerVisited = new Uint8Array(totalPixels);
      const strictHoleTol = Math.min(18, Math.max(10, Math.round(tolerance * 0.35)));
      const minHolePixels = Math.max(24, Math.round(totalPixels * 0.0012));
      const compQueue = new Int32Array(totalPixels);

      for (let i = 0; i < totalPixels; i++) {
        if (bgMask[i] || innerVisited[i]) continue;
        const off = i * 4;
        if (data[off + 3] < 20) continue;
        const dist = colorDistance(data[off], data[off + 1], data[off + 2], bgR, bgG, bgB);
        if (dist > strictHoleTol) continue;

        // BFS para mapear componente interno candidato
        let head = 0;
        let tail = 0;
        innerVisited[i] = 1;
        compQueue[tail++] = i;

        while (head < tail) {
          const curr = compQueue[head++];
          const cx = curr % width;
          const cy = (curr - cx) / width;

          const neighbors = [
            cx > 0 ? curr - 1 : -1,
            cx < width - 1 ? curr + 1 : -1,
            cy > 0 ? curr - width : -1,
            cy < height - 1 ? curr + width : -1,
          ];
          for (let n = 0; n < 4; n++) {
            const nIdx = neighbors[n];
            if (nIdx < 0 || bgMask[nIdx] || innerVisited[nIdx]) continue;
            const nOff = nIdx * 4;
            const nDist = colorDistance(data[nOff], data[nOff + 1], data[nOff + 2], bgR, bgG, bgB);
            if (nDist <= strictHoleTol) {
              innerVisited[nIdx] = 1;
              compQueue[tail++] = nIdx;
            }
          }
        }

        // Se o furo interno for maior que minHolePixels (evita apagar brilhos especulares/olhos)
        if (tail >= minHolePixels) {
          for (let k = 0; k < tail; k++) {
            bgMask[compQueue[k]] = 1;
          }
        }
      }
    }

    // Zera alfa de todos os pixels de fundo confirmados
    for (let i = 0; i < totalPixels; i++) {
      if (bgMask[i]) {
        data[i * 4 + 3] = 0;
      }
    }

    // Suavização de bordas (anti-aliasing + remoção de halo / color decontamination) em anel de 2px
    const isNearBg = new Uint8Array(totalPixels);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (bgMask[idx]) continue;
        // Verifica vizinhança 8-conectada
        if (
          bgMask[idx - 1] ||
          bgMask[idx + 1] ||
          bgMask[idx - width] ||
          bgMask[idx + width] ||
          bgMask[idx - width - 1] ||
          bgMask[idx - width + 1] ||
          bgMask[idx + width - 1] ||
          bgMask[idx + width + 1]
        ) {
          isNearBg[idx] = 1;
        }
      }
    }

    // Segundo anel (1px para dentro) para suavizar halos sutis
    const isSecondRing = new Uint8Array(totalPixels);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (bgMask[idx] || isNearBg[idx]) continue;
        if (isNearBg[idx - 1] || isNearBg[idx + 1] || isNearBg[idx - width] || isNearBg[idx + width]) {
          isSecondRing[idx] = 1;
        }
      }
    }

    const featherMax = tolerance + feather;
    for (let i = 0; i < totalPixels; i++) {
      if (!isNearBg[i] && !isSecondRing[i]) continue;
      const off = i * 4;
      const r = data[off];
      const g = data[off + 1];
      const b = data[off + 2];
      const origA = data[off + 3];
      if (origA === 0) continue;

      const dist = colorDistance(r, g, b, bgR, bgG, bgB);
      if (dist < featherMax) {
        const ratio = Math.max(0, Math.min(1, (dist - tolerance * 0.65) / Math.max(1, featherMax - tolerance * 0.65)));
        const easedAlpha = isNearBg[i] ? Math.pow(ratio, 1.15) : Math.max(0.45, ratio);
        const newAlpha = Math.round(origA * easedAlpha);
        data[off + 3] = newAlpha;

        // Descontaminação de cor (remove o halo da cor de fundo nos pixels semitransparentes)
        if (easedAlpha > 0.08 && easedAlpha < 0.98) {
          const inv = 1 / Math.max(0.28, easedAlpha);
          data[off] = Math.max(0, Math.min(255, Math.round((r - bgR * (1 - easedAlpha)) * inv)));
          data[off + 1] = Math.max(0, Math.min(255, Math.round((g - bgG * (1 - easedAlpha)) * inv)));
          data[off + 2] = Math.max(0, Math.min(255, Math.round((b - bgB * (1 - easedAlpha)) * inv)));
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Auto-Trim: encontra bounding box dos pixels visíveis (alpha > 16)
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Fallback de segurança caso a imagem inteira tenha sido apagada (ex: objeto totalmente branco sem borda)
  if (maxX <= minX || maxY <= minY) {
    minX = 0;
    minY = 0;
    maxX = width - 1;
    maxY = height - 1;
    ctx.drawImage(img, 0, 0, width, height);
  }

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  // Renderiza centralizado em canvas quadrado com padding limpo
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = outputSize;
  finalCanvas.height = outputSize;
  const finalCtx = finalCanvas.getContext('2d');
  if (!finalCtx) {
    throw new Error('Contexto 2D final indisponível.');
  }

  const usableSize = Math.round(outputSize * (1 - paddingRatio * 2));
  const fitScale = Math.min(usableSize / cropW, usableSize / cropH);
  const drawW = Math.round(cropW * fitScale);
  const drawH = Math.round(cropH * fitScale);
  const drawX = Math.round((outputSize - drawW) / 2);
  const drawY = Math.round((outputSize - drawH) / 2);

  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(workCanvas, minX, minY, cropW, cropH, drawX, drawY, drawW, drawH);

  const dataUrl = finalCanvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve, reject) => {
    finalCanvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Falha ao converter imagem recortada para PNG.'));
    }, 'image/png');
  });

  return {
    blob,
    dataUrl,
    width: outputSize,
    height: outputSize,
  };
}
