import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Search,
  ShieldCheck,
  ShieldAlert,
  ArrowUp,
  ArrowRight,
  Wrench,
  Sparkles,
  Droplets,
  Hand,
  Flame,
  Eye,
} from 'lucide-react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { BaseGameProps } from '../types';
import { TrafficXrayScenario } from '../types/gameContent';
import { DEFAULT_TRAFFIC_XRAY_SCENARIOS } from '../lib/trafficXrayScenarios';
import { useActiveGamePalette } from '../context/GameLayoutContext';

interface TrafficXrayGameProps extends BaseGameProps {
  customContent?: any;
}

interface InspectionRecord {
  scenarioId: string;
  title: string;
  correct: boolean;
  action: 'released' | 'retained';
  expectedRegular: boolean;
  foundCount: number;
  totalHotspots: number;
  lesson: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeScenarios(customContent: any): TrafficXrayScenario[] {
  let raw: any[] = [];
  if (Array.isArray(customContent) && customContent.length > 0) {
    raw = customContent;
  } else if (customContent?.scenarios && Array.isArray(customContent.scenarios) && customContent.scenarios.length > 0) {
    raw = customContent.scenarios;
  } else if (typeof customContent === 'string') {
    try {
      const parsed = JSON.parse(customContent);
      if (Array.isArray(parsed)) raw = parsed;
      else if (Array.isArray(parsed?.scenarios)) raw = parsed.scenarios;
    } catch {
      // fallback
    }
  }

  if (!raw || raw.length === 0) {
    return DEFAULT_TRAFFIC_XRAY_SCENARIOS;
  }

  return raw.map((item, idx) => {
    const hotspots = Array.isArray(item.hotspots)
      ? item.hotspots.map((h: any, hIdx: number) => ({
          id: h.id || `hs_${idx}_${hIdx}`,
          label: h.label || 'Irregularidade',
          explanation: h.explanation || 'Infração de segurança no trânsito.',
          x: typeof h.x === 'number' ? h.x : Number(h.x) || 50,
          y: typeof h.y === 'number' ? h.y : Number(h.y) || 50,
          radius: typeof h.radius === 'number' ? h.radius : Number(h.radius) || 14,
          severity: h.severity === 'medium' ? 'medium' : 'high',
        }))
      : [];

    const isRegular = Boolean(item.isRegular) || hotspots.length === 0;
    const interactionType: TrafficXrayScenario['interactionType'] =
      item.interactionType === 'scratch_glass' ||
      item.interactionType === 'xray_scanner' ||
      item.interactionType === 'tire_gauge' ||
      item.interactionType === 'direct_tap'
        ? item.interactionType
        : 'direct_tap';

    return {
      id: item.id || `custom_xray_${idx + 1}`,
      title: item.title || `Veículo #${idx + 1}`,
      vehicleType: item.vehicleType || 'car',
      plate: item.plate || `BLZ-${1010 + idx}`,
      imageUrl: item.imageUrl || '/games/traffic-xray/01_celular_vidro.jpg',
      interactionType,
      instruction:
        item.instruction ||
        (interactionType === 'scratch_glass'
          ? 'Arraste o dedo para limpar o vidro embaçado e verifique!'
          : interactionType === 'xray_scanner'
          ? 'Arraste o Scanner Raio-X sobre o veículo para encontrar falhas!'
          : interactionType === 'tire_gauge'
          ? 'Arraste o calibrador até o ponto suspeito para diagnosticar!'
          : 'Toque diretamente na irregularidade ou libere se estiver tudo certo!'),
      isRegular,
      regularFeedback:
        item.regularFeedback ||
        'Veículo 100% regularizado! Equipamentos e condutor em conformidade com a segurança.',
      hotspots: isRegular ? [] : hotspots,
      fogArea:
        item.fogArea ||
        (interactionType === 'scratch_glass'
          ? { x: 55, y: 42, width: 64, height: 26 }
          : undefined),
      toolLabel: item.toolLabel || 'Calibrador / Testador',
    };
  });
}

export const TrafficXrayGame: React.FC<TrafficXrayGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#06B6D4',
    theme,
    customBgStyle,
    campaignName,
    clientName,
    splashImageUrl,
    customContent,
    isLight,
    themeMode,
    gameLayout,
    palette,
    layoutColorHue,
    timeLimit,
    totalTimeLimit,
    orderMode = 'random',
    questionsCount,
  } = props;

  const { activeLayout, layoutPrimary, layoutSecondary, layoutGlow, isLightMode } = useActiveGamePalette({
    palette,
    layoutColorHue,
    isLight,
    themeMode,
    theme,
    themePrimary,
    gameLayout,
  });

  const allScenarios = useMemo(() => normalizeScenarios(customContent), [customContent]);

  const buildSessionDeck = useCallback(() => {
    const ordered = orderMode === 'ordered' ? [...allScenarios] : shuffleArray(allScenarios);
    if (questionsCount && questionsCount > 0 && questionsCount < ordered.length) {
      return ordered.slice(0, questionsCount);
    }
    return ordered;
  }, [allScenarios, orderMode, questionsCount]);

  const initialTime = totalTimeLimit && totalTimeLimit > 0 ? totalTimeLimit : timeLimit && timeLimit > 0 ? timeLimit : 60;

  const [deck, setDeck] = useState<TrafficXrayScenario[]>(() => buildSessionDeck());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Estado por veículo
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [missTap, setMissTap] = useState<{ x: number; y: number; id: number } | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; tone: 'info' | 'warn' | 'success' } | null>(null);
  const [decisionStamp, setDecisionStamp] = useState<{
    kind: 'released_ok' | 'retained_ok' | 'wrong_release' | 'wrong_retain';
    title: string;
    subtitle: string;
  } | null>(null);
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [totalHotspotsFound, setTotalHotspotsFound] = useState(0);

  // Estados específicos das interações táteis
  const [fogProgress, setFogProgress] = useState(0); // 0..100
  const [glassCleaned, setGlassCleaned] = useState(false);
  const [scannerPos, setScannerPos] = useState<{ x: number; y: number }>({ x: 50, y: 74 });
  const [isDraggingScanner, setIsDraggingScanner] = useState(false);
  const [scannerDetectedId, setScannerDetectedId] = useState<string | null>(null);
  const [toolPos, setToolPos] = useState<{ x: number; y: number }>({ x: 82, y: 84 });
  const [isDraggingTool, setIsDraggingTool] = useState(false);
  const [toolReading, setToolReading] = useState(0); // 0..100

  // Swipe estilo Papers, Please (arrastar para cima = Liberar, arrastar para o lado = Reter)
  const [swipeOffset, setSwipeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSwipingCard, setIsSwipingCard] = useState(false);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScratchingRef = useRef(false);
  const scratchedCellsRef = useRef<Set<string>>(new Set());
  const nextTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const currentScenario = deck[currentIndex] || deck[0];

  // Reconstroi deck se as configs externas mudarem antes de jogar
  useEffect(() => {
    setDeck(buildSessionDeck());
    setCurrentIndex(0);
  }, [buildSessionDeck]);

  // Limpa timers ao desmontar
  useEffect(() => {
    return () => {
      if (nextTimerRef.current) window.clearTimeout(nextTimerRef.current);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((text: string, tone: 'info' | 'warn' | 'success' = 'info') => {
    setToastMsg({ text, tone });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 2200);
  }, []);

  // Reseta estado interativo ao trocar de veículo
  useEffect(() => {
    setFoundIds([]);
    setMissTap(null);
    setDecisionStamp(null);
    setFogProgress(0);
    setGlassCleaned(false);
    scratchedCellsRef.current = new Set();
    setScannerPos({ x: 50, y: 74 });
    setIsDraggingScanner(false);
    setScannerDetectedId(null);
    setToolPos({ x: 82, y: 84 });
    setIsDraggingTool(false);
    setToolReading(0);
    setSwipeOffset({ x: 0, y: 0 });
    setIsSwipingCard(false);
  }, [currentIndex, deck]);

  // Inicializa o canvas de vidro embaçado para cenários `scratch_glass`
  useEffect(() => {
    if (!currentScenario || currentScenario.interactionType !== 'scratch_glass' || glassCleaned) return;
    const canvas = fogCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 360;
    const H = 480;
    canvas.width = W;
    canvas.height = H;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);

    const fog = currentScenario.fogArea || { x: 55, y: 42, width: 66, height: 28 };
    const fx = ((fog.x - fog.width / 2) / 100) * W;
    const fy = ((fog.y - fog.height / 2) / 100) * H;
    const fw = (fog.width / 100) * W;
    const fh = (fog.height / 100) * H;

    // Desenha camada densa de vapor / condensação sobre a área do vidro
    ctx.save();
    const grad = ctx.createRadialGradient(
      fx + fw / 2,
      fy + fh / 2,
      Math.min(fw, fh) * 0.15,
      fx + fw / 2,
      fy + fh / 2,
      Math.max(fw, fh) * 0.72
    );
    grad.addColorStop(0, 'rgba(226, 238, 248, 0.96)');
    grad.addColorStop(0.75, 'rgba(203, 222, 238, 0.92)');
    grad.addColorStop(1, 'rgba(186, 208, 228, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(fx - 14, fy - 14, fw + 28, fh + 28, 28);
    ctx.fill();

    // Camada interna mais opaca exatamente sobre o para-brisa para esconder o interior até raspar
    ctx.fillStyle = 'rgba(218, 232, 244, 0.93)';
    ctx.beginPath();
    ctx.roundRect(fx, fy, fw, fh, 20);
    ctx.fill();

    // Gotículas sutis de condensação no vidro
    for (let i = 0; i < 65; i++) {
      const dx = fx + Math.random() * fw;
      const dy = fy + Math.random() * fh;
      const dr = 1.5 + Math.random() * 4.5;
      ctx.beginPath();
      ctx.arc(dx, dy, dr, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.45)' : 'rgba(148,178,204,0.35)';
      ctx.fill();
    }

    // Dica desenhada no vapor
    ctx.fillStyle = 'rgba(51, 65, 85, 0.72)';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💧 ARRASTE PARA LIMPAR O VIDRO', fx + fw / 2, fy + fh / 2 + 5);
    ctx.restore();
  }, [currentScenario, glassCleaned]);

  // Cronômetro regressivo de 60 segundos
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timeLeft, gameOver]);

  // Helper: converte clientX/clientY para % (0..100) dentro do palco da imagem
  const getStagePercent = useCallback((clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return { x: 50, y: 50 };
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  }, []);

  // Marca uma infração encontrada
  const registerHotspotFound = useCallback(
    (hotspotId: string) => {
      if (!currentScenario || decisionStamp) return;
      setFoundIds((prev) => {
        if (prev.includes(hotspotId)) return prev;
        const hotspot = currentScenario.hotspots.find((h) => h.id === hotspotId);
        sound.playSuccess();
        setScore((s) => s + 120);
        setTotalHotspotsFound((c) => c + 1);
        if (hotspot) {
          const remaining = currentScenario.hotspots.length - (prev.length + 1);
          showToast(
            remaining > 0
              ? `Infração marcada: ${hotspot.label}! Falta ${remaining}.`
              : `✓ ${hotspot.label}! Agora deslize para o lado ou toque em RETER.`,
            'success'
          );
        }
        return [...prev, hotspotId];
      });
    },
    [currentScenario, decisionStamp, showToast]
  );

  // Checa se um ponto (x%, y%) acerta algum hotspot ainda não encontrado
  const findMatchingHotspot = useCallback(
    (xPct: number, yPct: number, extraMargin = 0) => {
      if (!currentScenario) return null;
      for (const h of currentScenario.hotspots) {
        if (foundIds.includes(h.id)) continue;
        // Aspect ratio 3:4 -> normalizamos distância considerando largura vs altura
        const dx = xPct - h.x;
        const dy = (yPct - h.y) * (4 / 3);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= h.radius + extraMargin) {
          return h;
        }
      }
      return null;
    },
    [currentScenario, foundIds]
  );

  // Raspa o vidro embaçado
  const scratchAt = useCallback(
    (xPct: number, yPct: number) => {
      if (!currentScenario || currentScenario.interactionType !== 'scratch_glass' || glassCleaned) return;
      const canvas = fogCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cx = (xPct / 100) * canvas.width;
      const cy = (yPct / 100) * canvas.height;

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      const brushGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 38);
      brushGrad.addColorStop(0, 'rgba(0,0,0,1)');
      brushGrad.addColorStop(0.65, 'rgba(0,0,0,0.85)');
      brushGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = brushGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const fog = currentScenario.fogArea || { x: 55, y: 42, width: 66, height: 28 };
      const minX = fog.x - fog.width / 2;
      const maxX = fog.x + fog.width / 2;
      const minY = fog.y - fog.height / 2;
      const maxY = fog.y + fog.height / 2;

      if (xPct >= minX - 6 && xPct <= maxX + 6 && yPct >= minY - 6 && yPct <= maxY + 6) {
        // Mapeia células 6x4 dentro da área do vidro
        const gx = Math.floor(((xPct - minX) / Math.max(1, fog.width)) * 6);
        const gy = Math.floor(((yPct - minY) / Math.max(1, fog.height)) * 4);
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const nx = gx + ox;
            const ny = gy + oy;
            if (nx >= 0 && nx < 6 && ny >= 0 && ny < 4) {
              scratchedCellsRef.current.add(`${nx}_${ny}`);
            }
          }
        }
        const pct = Math.min(100, Math.round((scratchedCellsRef.current.size / 24) * 100));
        setFogProgress(pct);
        if (pct >= 58) {
          setGlassCleaned(true);
          sound.playClick();
          showToast(
            currentScenario.isRegular
              ? 'Vidro limpo! Confira o motorista e decida se libera ou retém.'
              : 'Vidro limpo! Toque na irregularidade encontrada!',
            'info'
          );
        }
      }
    },
    [currentScenario, glassCleaned, showToast]
  );

  // Detecção contínua do Scanner Raio-X quando está sobre um hotspot
  useEffect(() => {
    if (!currentScenario || currentScenario.interactionType !== 'xray_scanner' || decisionStamp) return;
    const hit = findMatchingHotspot(scannerPos.x, scannerPos.y, 4);
    setScannerDetectedId(hit ? hit.id : null);
  }, [scannerPos, currentScenario, findMatchingHotspot, decisionStamp]);

  // Leitura progressiva do Calibrador / Testador quando posicionado sobre o ponto
  useEffect(() => {
    if (!currentScenario || currentScenario.interactionType !== 'tire_gauge' || decisionStamp) return;
    const hit = findMatchingHotspot(toolPos.x, toolPos.y, 6);
    if (!hit) {
      setToolReading(0);
      return;
    }
    const interval = window.setInterval(() => {
      setToolReading((prev) => {
        const next = prev + 20;
        if (next >= 100) {
          window.clearInterval(interval);
          registerHotspotFound(hit.id);
          return 100;
        }
        return next;
      });
    }, 70);
    return () => window.clearInterval(interval);
  }, [toolPos, currentScenario, findMatchingHotspot, registerHotspotFound, decisionStamp]);

  // Avança para o próximo veículo ou finaliza a partida
  const advanceToNext = useCallback(() => {
    if (currentIndex + 1 >= deck.length) {
      setGameOver(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, deck.length]);

  // Decisão final para o veículo atual: LIBERAR (↑) ou RETER (←/→)
  const handleDecision = useCallback(
    (action: 'released' | 'retained') => {
      if (!currentScenario || decisionStamp || gameOver) return;

      // Se é vidro embaçado e ainda não limpou nada, pede para limpar primeiro!
      if (currentScenario.interactionType === 'scratch_glass' && !glassCleaned && fogProgress < 35) {
        sound.playError();
        showToast('Limpe o vidro embaçado com o dedo antes de decidir!', 'warn');
        setSwipeOffset({ x: 0, y: 0 });
        return;
      }

      const totalHs = currentScenario.hotspots.length;
      const allFound = foundIds.length >= totalHs;

      // Se o jogador quer RETER um veículo irregular mas ainda não marcou os erros na imagem
      if (action === 'retained' && !currentScenario.isRegular && !allFound) {
        sound.playError();
        const missing = totalHs - foundIds.length;
        const verb =
          currentScenario.interactionType === 'tire_gauge'
            ? `Arraste o ${currentScenario.toolLabel || 'calibrador'} até o defeito`
            : currentScenario.interactionType === 'xray_scanner'
            ? 'Passe o Scanner Raio-X e marque a falha'
            : `Toque na${missing > 1 ? 's' : ''} ${missing} irregularidade${missing > 1 ? 's' : ''} na imagem`;
        showToast(`${verb} antes de reter!`, 'warn');
        setSwipeOffset({ x: 0, y: 0 });
        return;
      }

      let isCorrect = false;
      let stampKind: 'released_ok' | 'retained_ok' | 'wrong_release' | 'wrong_retain' = 'released_ok';
      let stampTitle = '';
      let stampSub = '';

      if (action === 'released') {
        if (currentScenario.isRegular) {
          isCorrect = true;
          stampKind = 'released_ok';
          stampTitle = 'LIBERADO ✓';
          stampSub = currentScenario.regularFeedback || 'Veículo 100% regularizado!';
        } else {
          isCorrect = false;
          stampKind = 'wrong_release';
          stampTitle = 'INFRAÇÃO PASSOU!';
          stampSub = currentScenario.hotspots.map((h) => h.label).join(' • ');
        }
      } else {
        // action === 'retained'
        if (!currentScenario.isRegular) {
          isCorrect = true;
          stampKind = 'retained_ok';
          stampTitle = 'RETIDO P/ ORIENTAÇÃO ✓';
          stampSub = currentScenario.hotspots[0]?.explanation || 'Irregularidade identificada com precisão!';
        } else {
          isCorrect = false;
          stampKind = 'wrong_retain';
          stampTitle = 'VEÍCULO REGULAR!';
          stampSub = currentScenario.regularFeedback || 'Não havia infrações neste veículo. Ele deveria ser liberado!';
        }
      }

      if (isCorrect) {
        sound.playSuccess();
        const nextStreak = streak + 1;
        const comboBonus = nextStreak >= 2 ? nextStreak * 40 : 0;
        setScore((s) => s + 250 + comboBonus);
        setStreak(nextStreak);
        setBestStreak((b) => Math.max(b, nextStreak));
      } else {
        sound.playError();
        setScore((s) => Math.max(0, s - 75));
        setStreak(0);
      }

      const lesson = currentScenario.isRegular
        ? currentScenario.regularFeedback || 'Veículo regularizado.'
        : currentScenario.hotspots.map((h) => `${h.label}: ${h.explanation}`).join(' ');

      setRecords((prev) => [
        ...prev,
        {
          scenarioId: currentScenario.id,
          title: currentScenario.title,
          correct: isCorrect,
          action,
          expectedRegular: currentScenario.isRegular,
          foundCount: foundIds.length,
          totalHotspots: totalHs,
          lesson,
        },
      ]);

      setDecisionStamp({ kind: stampKind, title: stampTitle, subtitle: stampSub });
      setSwipeOffset({ x: 0, y: 0 });

      if (nextTimerRef.current) window.clearTimeout(nextTimerRef.current);
      nextTimerRef.current = window.setTimeout(() => {
        advanceToNext();
      }, isCorrect ? 1450 : 2200);
    },
    [
      currentScenario,
      decisionStamp,
      gameOver,
      glassCleaned,
      fogProgress,
      foundIds,
      streak,
      showToast,
      advanceToNext,
    ]
  );

  // Handlers de interação no palco da imagem
  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!currentScenario || decisionStamp || gameOver) return;
    const { x, y } = getStagePercent(e.clientX, e.clientY);

    if (currentScenario.interactionType === 'scratch_glass' && !glassCleaned) {
      isScratchingRef.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      scratchAt(x, y);
      return;
    }

    if (currentScenario.interactionType === 'xray_scanner') {
      setIsDraggingScanner(true);
      setScannerPos({ x, y });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      const hit = findMatchingHotspot(x, y, 3);
      if (hit) {
        registerHotspotFound(hit.id);
      }
      return;
    }

    if (currentScenario.interactionType === 'tire_gauge') {
      // Se o jogador clicar direto no erro com o calibrador ainda longe, lembra de arrastar ou aproxima
      const distToTool = Math.hypot(x - toolPos.x, y - toolPos.y);
      if (distToTool <= 18) {
        setIsDraggingTool(true);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }
      // Se clicou longe da ferramenta, move suavemente a ferramenta se clicou no ponto suspeito ou avisa
      const hit = findMatchingHotspot(x, y, 4);
      if (hit) {
        setToolPos({ x, y });
        setIsDraggingTool(true);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }
      // Caso contrário, inicia gesto de swipe do card
      swipeStartRef.current = { x: e.clientX, y: e.clientY };
      setIsSwipingCard(true);
      return;
    }

    // Modo direct_tap (ou scratch_glass após limpar vidro)
    const hit = findMatchingHotspot(x, y, 3);
    if (hit) {
      registerHotspotFound(hit.id);
      return;
    }

    // Inicia possível swipe (se soltar sem arrastar, trata como toque fora)
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
    setIsSwipingCard(true);
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!currentScenario || decisionStamp || gameOver) return;

    if (isScratchingRef.current && currentScenario.interactionType === 'scratch_glass' && !glassCleaned) {
      const { x, y } = getStagePercent(e.clientX, e.clientY);
      scratchAt(x, y);
      return;
    }

    if (isDraggingScanner && currentScenario.interactionType === 'xray_scanner') {
      const { x, y } = getStagePercent(e.clientX, e.clientY);
      setScannerPos({ x, y });
      return;
    }

    if (isDraggingTool && currentScenario.interactionType === 'tire_gauge') {
      const { x, y } = getStagePercent(e.clientX, e.clientY);
      setToolPos({ x, y });
      return;
    }

    if (isSwipingCard && swipeStartRef.current) {
      const dx = e.clientX - swipeStartRef.current.x;
      const dy = e.clientY - swipeStartRef.current.y;
      setSwipeOffset({ x: dx, y: dy });
    }
  };

  const handleStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScratchingRef.current) {
      isScratchingRef.current = false;
      return;
    }

    if (isDraggingScanner) {
      setIsDraggingScanner(false);
      const { x, y } = getStagePercent(e.clientX, e.clientY);
      const hit = findMatchingHotspot(x, y, 4);
      if (hit) {
        registerHotspotFound(hit.id);
      }
      return;
    }

    if (isDraggingTool) {
      setIsDraggingTool(false);
      const { x, y } = getStagePercent(e.clientX, e.clientY);
      const hit = findMatchingHotspot(x, y, 6);
      if (hit) {
        registerHotspotFound(hit.id);
      }
      return;
    }

    if (isSwipingCard && swipeStartRef.current) {
      const dx = e.clientX - swipeStartRef.current.x;
      const dy = e.clientY - swipeStartRef.current.y;
      swipeStartRef.current = null;
      setIsSwipingCard(false);

      // Gesto para CIMA -> LIBERAR
      if (dy < -72 && Math.abs(dy) > Math.abs(dx)) {
        handleDecision('released');
        return;
      }
      // Gesto para o LADO (esquerda ou direita) -> RETER
      if (Math.abs(dx) > 78 && Math.abs(dx) > Math.abs(dy)) {
        handleDecision('retained');
        return;
      }

      setSwipeOffset({ x: 0, y: 0 });

      // Foi um toque parado (não um arrasto) fora dos erros
      if (Math.hypot(dx, dy) < 14 && currentScenario && !decisionStamp) {
        const { x, y } = getStagePercent(e.clientX, e.clientY);
        if (!currentScenario.isRegular && foundIds.length < currentScenario.hotspots.length) {
          sound.playError();
          setScore((s) => Math.max(0, s - 25));
          setMissTap({ x, y, id: Date.now() });
          window.setTimeout(() => setMissTap(null), 650);
        } else if (currentScenario.isRegular) {
          showToast('Tudo certo aqui! Deslize para CIMA ou toque em LIBERAR.', 'info');
        }
      }
    }
  };

  const restart = () => {
    if (nextTimerRef.current) window.clearTimeout(nextTimerRef.current);
    setDeck(buildSessionDeck());
    setCurrentIndex(0);
    setTimeLeft(initialTime);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setRecords([]);
    setTotalHotspotsFound(0);
    setDecisionStamp(null);
    setGameOver(false);
  };

  const totalInspected = records.length;
  const correctDecisions = records.filter((r) => r.correct).length;
  const accuracyPct = totalInspected > 0 ? Math.round((correctDecisions / totalInspected) * 100) : 0;

  const feedbackTitle = useMemo(() => {
    if (totalInspected === 0) return 'Blitz Encerrada!';
    if (accuracyPct >= 90 && correctDecisions >= 3) return 'Inspetor Exemplar!';
    if (accuracyPct >= 70) return 'Ótima Fiscalização!';
    if (accuracyPct >= 45) return 'Boa Atenção na Blitz!';
    return 'Continue Treinando o Olhar!';
  }, [accuracyPct, correctDecisions, totalInspected]);

  const feedbackSubtitle = useMemo(() => {
    if (totalInspected === 0) {
      return 'O tempo acabou antes de concluir a primeira inspeção. Tente novamente!';
    }
    return `Você inspecionou ${totalInspected} ${totalInspected === 1 ? 'veículo' : 'veículos'}, acertou ${correctDecisions} ${correctDecisions === 1 ? 'decisão' : 'decisões'} (${accuracyPct}%) e flagrou ${totalHotspotsFound} ${totalHotspotsFound === 1 ? 'irregularidade' : 'irregularidades'}!`;
  }, [totalInspected, correctDecisions, accuracyPct, totalHotspotsFound]);

  const reportContent = (
    <div
      className={`w-full rounded-2xl border-2 p-3.5 sm:p-4 shadow-lg text-left space-y-3 ${
        isLightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-white/15 text-white'
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs font-black uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Relatório da Blitz Educativa</span>
        </span>
        <span className="font-mono text-emerald-400">{accuracyPct}% precisão</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <div className="text-[10px] uppercase font-bold text-slate-400">Veículos</div>
          <div className="text-lg font-black text-cyan-300 font-mono">
            {totalInspected}/{deck.length}
          </div>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <div className="text-[10px] uppercase font-bold text-slate-400">Infrações</div>
          <div className="text-lg font-black text-amber-300 font-mono">{totalHotspotsFound}</div>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <div className="text-[10px] uppercase font-bold text-slate-400">Combo Máx.</div>
          <div className="text-lg font-black text-emerald-300 font-mono">{bestStreak}x</div>
        </div>
      </div>

      {records.length > 0 && (
        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
          {records.map((rec, i) => (
            <div
              key={`${rec.scenarioId}_${i}`}
              className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-xs ${
                rec.correct
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <div className="min-w-0">
                <div className="font-bold truncate">{rec.title}</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {rec.expectedRegular ? 'Veículo Regular (Liberar)' : `${rec.foundCount}/${rec.totalHotspots} infração(ões)`}
                </div>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                  rec.correct ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {rec.correct ? '✓ Correto' : '✕ Atenção'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const interactionBadge = useMemo(() => {
    if (!currentScenario) return { icon: Hand, label: 'Toque Direto', color: 'text-amber-300 bg-amber-500/20 border-amber-400/40' };
    switch (currentScenario.interactionType) {
      case 'scratch_glass':
        return { icon: Droplets, label: glassCleaned ? 'Vidro Limpo ✓' : 'Limpar Vidro', color: 'text-sky-300 bg-sky-500/20 border-sky-400/40' };
      case 'xray_scanner':
        return { icon: Search, label: 'Scanner Raio-X', color: 'text-cyan-300 bg-cyan-500/20 border-cyan-400/40' };
      case 'tire_gauge':
        return { icon: Wrench, label: currentScenario.toolLabel || 'Calibrador', color: 'text-orange-300 bg-orange-500/20 border-orange-400/40' };
      default:
        return { icon: Hand, label: 'Inspeção Tátil', color: 'text-amber-300 bg-amber-500/20 border-amber-400/40' };
    }
  }, [currentScenario, glassCleaned]);

  const BadgeIcon = interactionBadge.icon;
  const totalHs = currentScenario?.hotspots.length || 0;
  const allIrregularitiesFound = !currentScenario?.isRegular && totalHs > 0 && foundIds.length >= totalHs;

  // Prévia visual do gesto swipe
  const swipePreview =
    swipeOffset.y < -36 && Math.abs(swipeOffset.y) > Math.abs(swipeOffset.x)
      ? 'release'
      : Math.abs(swipeOffset.x) > 42 && Math.abs(swipeOffset.x) > Math.abs(swipeOffset.y)
      ? 'retain'
      : null;

  return (
    <GameContainer
      title="Raio-X do Perigo"
      category="Segurança no Trânsito"
      score={score}
      timeRemaining={timeLeft}
      totalTime={initialTime}
      gameOver={gameOver}
      gameWon={accuracyPct >= 70 && correctDecisions >= 2}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      gameType="action"
      customFeedbackTitle={feedbackTitle}
      customFeedbackSubtitle={feedbackSubtitle}
      gameOverCustomContent={reportContent}
      themePrimary={layoutPrimary}
      theme={theme}
      isLight={isLightMode}
      themeMode={themeMode}
      gameLayout={activeLayout}
      palette={palette}
      layoutColorHue={layoutColorHue}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
    >
      {currentScenario && (
        <div className="w-full max-w-[470px] mx-auto flex-1 flex flex-col items-center justify-between gap-2 sm:gap-2.5 py-1 px-2 select-none overflow-hidden">
          {/* Cabeçalho da Prancheta de Blitz (Estilo Papers, Please) */}
          <div
            style={{ borderColor: `${layoutPrimary}55` }}
            className="w-full rounded-2xl bg-slate-950/85 backdrop-blur-md border-2 px-3 py-2 shadow-xl flex flex-col gap-1.5 shrink-0"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/15 font-mono text-[10px] sm:text-xs font-black text-cyan-300 shrink-0">
                  #{currentIndex + 1}/{deck.length}
                </span>
                <span className="text-xs sm:text-sm font-black text-white truncate">
                  {currentScenario.title}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {streak >= 2 && (
                  <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-black animate-pulse">
                    <Flame className="w-3 h-3" /> {streak}x
                  </span>
                )}
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase ${interactionBadge.color}`}
                >
                  <BadgeIcon className="w-3 h-3" />
                  <span>{interactionBadge.label}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs">
              <span className="text-slate-200 font-semibold leading-tight flex-1">
                {currentScenario.instruction}
              </span>
              {!currentScenario.isRegular ? (
                <span
                  className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-black shrink-0 border ${
                    allIrregularitiesFound
                      ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-400/50 text-rose-200'
                  }`}
                >
                  {foundIds.length}/{totalHs} {totalHs === 1 ? 'erro' : 'erros'}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-lg font-mono text-[10px] font-black shrink-0 bg-slate-800 border border-white/15 text-slate-300">
                  Inspeção
                </span>
              )}
            </div>
          </div>

          {/* Palco Vertical da Imagem Interativa (3:4) */}
          <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
            <div
              ref={stageRef}
              onPointerDown={handleStagePointerDown}
              onPointerMove={handleStagePointerMove}
              onPointerUp={handleStagePointerUp}
              onPointerCancel={handleStagePointerUp}
              style={{
                transform: `translate(${swipeOffset.x * 0.45}px, ${swipeOffset.y * 0.45}px) rotate(${swipeOffset.x * 0.03}deg)`,
                transition: isSwipingCard ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                borderColor: allIrregularitiesFound
                  ? '#f59e0b'
                  : swipePreview === 'release'
                  ? '#10b981'
                  : swipePreview === 'retain'
                  ? '#ef4444'
                  : `${layoutPrimary}77`,
                boxShadow: `0 12px 38px ${layoutGlow}`,
              }}
              className="relative h-full max-h-full aspect-[3/4] max-w-full rounded-3xl border-[3px] overflow-hidden bg-slate-950 touch-none select-none cursor-crosshair"
            >
              {/* Imagem Vertical do Cenário */}
              <img
                src={currentScenario.imageUrl}
                alt={currentScenario.title}
                draggable={false}
                className="w-full h-full object-cover pointer-events-none select-none"
              />

              {/* Moldura sutil de visor técnico da Blitz */}
              <div className="pointer-events-none absolute inset-0 border border-white/10 rounded-3xl" />
              <div className="pointer-events-none absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/65 border border-white/20 text-[10px] font-mono font-bold text-cyan-300 backdrop-blur-xs flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>PLACA: {currentScenario.plate || 'BLZ-2026'}</span>
              </div>

              {/* INTERAÇÃO 1: Camada Canvas de Vidro Embaçado */}
              {currentScenario.interactionType === 'scratch_glass' && !glassCleaned && (
                <>
                  <canvas
                    ref={fogCanvasRef}
                    className="absolute inset-0 w-full h-full z-20 touch-none cursor-grab active:cursor-grabbing"
                  />
                  <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-slate-950/85 border border-sky-400/60 text-sky-200 text-[11px] font-black flex items-center gap-1.5 shadow-lg">
                    <Droplets className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
                    <span>Limpando vidro: {fogProgress}%</span>
                  </div>
                </>
              )}

              {/* INTERAÇÃO 2: Lupa / Scanner Raio-X Arrastável */}
              {currentScenario.interactionType === 'xray_scanner' && !decisionStamp && (
                <div
                  style={{
                    left: `${scannerPos.x}%`,
                    top: `${scannerPos.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`pointer-events-none absolute z-30 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[3px] flex flex-col items-center justify-center transition-colors duration-150 ${
                    scannerDetectedId
                      ? 'border-rose-400 bg-rose-500/25 shadow-[0_0_30px_rgba(244,63,94,0.85)]'
                      : 'border-cyan-300 bg-cyan-400/15 shadow-[0_0_24px_rgba(34,211,238,0.65)]'
                  }`}
                >
                  {/* Grade de Raio-X */}
                  <div
                    className="absolute inset-1 rounded-full opacity-40"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.5) 1px, transparent 1px)',
                      backgroundSize: '14px 14px',
                    }}
                  />
                  <div
                    className={`w-full h-0.5 ${
                      scannerDetectedId ? 'bg-rose-400' : 'bg-cyan-300'
                    } shadow-[0_0_10px_currentColor] animate-pulse`}
                  />
                  <span
                    className={`mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black uppercase ${
                      scannerDetectedId
                        ? 'bg-rose-600 text-white animate-bounce'
                        : 'bg-slate-950/80 text-cyan-200'
                    }`}
                  >
                    {scannerDetectedId ? '⚠ ANOMALIA!' : 'RAIO-X'}
                  </span>
                </div>
              )}

              {/* INTERAÇÃO 3: Calibrador / Testador Arrastável */}
              {currentScenario.interactionType === 'tire_gauge' && !decisionStamp && (
                <div
                  style={{
                    left: `${toolPos.x}%`,
                    top: `${toolPos.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`pointer-events-none absolute z-30 flex flex-col items-center transition-transform ${
                    isDraggingTool ? 'scale-110' : 'animate-bounce'
                  }`}
                >
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md ${
                      toolReading > 0
                        ? 'bg-rose-600/90 border-amber-300 text-white shadow-[0_0_26px_rgba(244,63,94,0.8)]'
                        : 'bg-slate-950/90 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                    }`}
                  >
                    <Wrench className="w-6 h-6 sm:w-7 sm:h-7" />
                    <span className="text-[9px] font-black uppercase mt-0.5">
                      {toolReading > 0 ? `${toolReading}%` : 'ARRASTE'}
                    </span>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-black/80 border border-amber-400/50 text-[9px] font-black text-amber-200 whitespace-nowrap">
                    {currentScenario.toolLabel || 'Calibrador'}
                  </span>
                </div>
              )}

              {/* Marcadores de Infrações Já Encontradas (ou reveladas se liberou errado!) */}
              {currentScenario.hotspots.map((h) => {
                const isFound = foundIds.includes(h.id);
                const revealOnMiss = decisionStamp?.kind === 'wrong_release' && !isFound;
                if (!isFound && !revealOnMiss) return null;

                return (
                  <div
                    key={h.id}
                    style={{
                      left: `${h.x}%`,
                      top: `${h.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="pointer-events-none absolute z-30 flex flex-col items-center animate-in zoom-in-75 duration-200"
                  >
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 flex items-center justify-center shadow-xl ${
                        isFound
                          ? 'border-amber-300 bg-rose-600/35 shadow-[0_0_24px_rgba(244,63,94,0.85)]'
                          : 'border-rose-500 bg-rose-600/45 animate-ping'
                      }`}
                    >
                      <AlertTriangle className="w-6 h-6 text-amber-200 drop-shadow-md" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-black shadow-lg border border-white/40 whitespace-nowrap max-w-[200px] truncate">
                      {isFound ? `✓ ${h.label}` : `✕ ${h.label}`}
                    </span>
                  </div>
                );
              })}

              {/* Feedback de Toque Fora */}
              {missTap && (
                <div
                  key={missTap.id}
                  style={{ left: `${missTap.x}%`, top: `${missTap.y}%`, transform: 'translate(-50%, -50%)' }}
                  className="pointer-events-none absolute z-30 px-2 py-1 rounded-full bg-slate-950/90 border border-rose-400/70 text-rose-300 text-[10px] font-black animate-ping"
                >
                  ✕ Nada aqui
                </div>
              )}

              {/* Prévia do Carimbo durante Swipe */}
              {swipePreview && !decisionStamp && (
                <div
                  className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center backdrop-blur-[1px] ${
                    swipePreview === 'release' ? 'bg-emerald-500/25' : 'bg-rose-600/25'
                  }`}
                >
                  <div
                    className={`px-5 py-2.5 rounded-2xl border-4 font-black text-xl sm:text-2xl uppercase tracking-widest -rotate-6 shadow-2xl ${
                      swipePreview === 'release'
                        ? 'bg-emerald-600/95 border-emerald-200 text-white'
                        : 'bg-rose-600/95 border-amber-200 text-white'
                    }`}
                  >
                    {swipePreview === 'release' ? '↑ LIBERAR' : '→ RETER'}
                  </div>
                </div>
              )}

              {/* Toast rápido no rodapé da imagem */}
              {toastMsg && !decisionStamp && (
                <div className="pointer-events-none absolute bottom-3 inset-x-3 z-40 flex justify-center">
                  <div
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black text-center shadow-xl border backdrop-blur-md ${
                      toastMsg.tone === 'success'
                        ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                        : toastMsg.tone === 'warn'
                        ? 'bg-amber-950/90 border-amber-400 text-amber-200'
                        : 'bg-slate-950/90 border-cyan-400 text-cyan-200'
                    }`}
                  >
                    {toastMsg.text}
                  </div>
                </div>
              )}

              {/* Carimbo Final Estilo Papers, Please após decisão */}
              {decisionStamp && (
                <div className="absolute inset-0 z-40 bg-slate-950/65 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-200">
                  <div
                    className={`px-5 py-2.5 rounded-2xl border-4 font-black text-lg sm:text-2xl uppercase tracking-wider -rotate-3 shadow-2xl mb-3 ${
                      decisionStamp.kind === 'released_ok' || decisionStamp.kind === 'retained_ok'
                        ? 'bg-emerald-600 border-emerald-200 text-white'
                        : 'bg-rose-600 border-rose-200 text-white'
                    }`}
                  >
                    {decisionStamp.title}
                  </div>
                  <div className="max-w-[92%] px-3.5 py-2.5 rounded-2xl bg-slate-900/95 border border-white/20 text-xs sm:text-sm font-bold text-slate-100 leading-snug shadow-xl">
                    {decisionStamp.subtitle}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barra Inferior de Decisão (Deslizar ↑ Liberar | Deslizar → Reter) */}
          <div className="w-full grid grid-cols-2 gap-2.5 shrink-0 pb-0.5">
            <button
              type="button"
              disabled={Boolean(decisionStamp)}
              onClick={() => handleDecision('released')}
              className={`py-2.5 sm:py-3 px-3 rounded-2xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg disabled:opacity-50 ${
                !allIrregularitiesFound
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-300 text-white'
                  : 'bg-slate-900/80 border-slate-600 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <div className="text-left leading-tight">
                <div className="uppercase tracking-wide">Liberar</div>
                <div className="text-[9px] font-bold opacity-85">Deslize ↑ (Regular)</div>
              </div>
            </button>

            <button
              type="button"
              disabled={Boolean(decisionStamp)}
              onClick={() => handleDecision('retained')}
              style={
                allIrregularitiesFound
                  ? {
                      background: `linear-gradient(135deg, #dc2626, #f59e0b)`,
                      boxShadow: `0 0 24px rgba(245, 158, 11, 0.65)`,
                    }
                  : undefined
              }
              className={`py-2.5 sm:py-3 px-3 rounded-2xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg disabled:opacity-50 ${
                allIrregularitiesFound
                  ? 'border-amber-200 text-white animate-pulse'
                  : 'bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600 border-rose-400/80 text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <div className="text-left leading-tight">
                <div className="uppercase tracking-wide flex items-center gap-1">
                  <span>Reter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div className="text-[9px] font-bold opacity-85">Deslize → (Orientar)</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </GameContainer>
  );
};
