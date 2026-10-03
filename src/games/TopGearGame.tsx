import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { BaseGameProps } from '../types';
import { ArrowLeft, ArrowRight, Gauge, Trophy, AlertTriangle, Shield, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useActiveGamePalette } from '../context/GameLayoutContext';
import { TopGearCustomConfig } from '../types/gameContent';

interface TopGearGameProps extends BaseGameProps {
  customContent?: TopGearCustomConfig;
}

interface TrafficCar {
  id: number;
  lane: number; // 0, 1, 2
  z: number; // 1000 (horizon) down to -100 (past player)
  speed: number;
  color: string;
  passed?: boolean;
}

interface RoadsideObject {
  id: number;
  type: 'tree' | 'sign' | 'viaduct';
  side: -1 | 1; // -1 left, 1 right
  z: number;
  text?: string;
}

const CAR_COLORS = [
  '#DC2626', // Vermelho Top Gear
  '#F59E0B', // Amarelo Turbo
  '#2563EB', // Azul Elétrico
  '#10B981', // Verde Esmeralda
  '#9333EA', // Roxo Cyber
  '#06B6D4', // Ciano Neon
  '#E11D48', // Rosa Corrida
  '#1E293B', // Preto Noturno
];

export const TopGearGame: React.FC<TopGearGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#DC2626',
    theme,
    customBgStyle,
    campaignName,
    clientName,
    splashImageUrl,
    isLight,
    themeMode,
    totalTimeLimit,
    gameLayout,
    palette,
    layoutColorHue,
    customContent,
  } = props;

  const { activeLayout, layoutDef, layoutPrimary, layoutSecondary, layoutGlow, isLightMode } = useActiveGamePalette({
    palette,
    layoutColorHue,
    isLight,
    themeMode,
    theme,
    themePrimary,
    gameLayout,
  });

  const duration = totalTimeLimit && totalTimeLimit > 0 ? totalTimeLimit : 45;
  const initialSpeed = customContent?.initialSpeed || 120;
  const maxSpeed = customContent?.maxSpeed || 240;
  const playerCarColor = customContent?.carColor || '#DC2626';
  const trackName = customContent?.trackName || 'Autódromo Top Gear';

  const [timeLeft, setTimeLeft] = useState(duration);
  const [lane, setLane] = useState<number>(1); // 0: Left, 1: Center, 2: Right
  const [speed, setSpeed] = useState<number>(initialSpeed);
  const [distance, setDistance] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [dodgedCount, setDodgedCount] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [invincible, setInvincible] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<number>(0);
  const [recentDodgeToast, setRecentDodgeToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // References for mutable animation loop
  const stateRef = useRef({
    lane: 1,
    playerX: 0, // -1 to 1 interpolation
    targetX: 0,
    speed: initialSpeed,
    distance: 0,
    score: 0,
    combo: 1,
    dodgedCount: 0,
    invincibleUntil: 0,
    curve: 0,
    curveTarget: 0,
    curveTimer: 0,
    traffic: [] as TrafficCar[],
    roadside: [] as RoadsideObject[],
    nextTrafficId: 1,
    nextRoadsideId: 1,
    finishZ: 9999, // When <= 1000, finish line is approaching
    crossingFinish: false,
    gameOver: false,
  });

  // Sync stateRef lane with component lane
  useEffect(() => {
    stateRef.current.lane = lane;
    const targetMap = [-0.62, 0, 0.62];
    stateRef.current.targetX = targetMap[lane];
  }, [lane]);

  // Handle lane change
  const moveLeft = useCallback(() => {
    if (stateRef.current.gameOver) return;
    setLane((prev) => {
      const next = Math.max(0, prev - 1);
      if (next !== prev) sound.playClick();
      return next;
    });
  }, []);

  const moveRight = useCallback(() => {
    if (stateRef.current.gameOver) return;
    setLane((prev) => {
      const next = Math.min(2, prev + 1);
      if (next !== prev) sound.playClick();
      return next;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveRight();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight]);

  // Countdown timer & finish line synchronization
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);

        // When 4 seconds remain, spawn finish line at horizon
        if (next <= 4 && stateRef.current.finishZ > 1000 && !stateRef.current.crossingFinish) {
          stateRef.current.finishZ = 1000;
        }

        if (next === 0 && !stateRef.current.crossingFinish) {
          // Time expired, finish race
          finishRace();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  const finishRace = useCallback(() => {
    if (stateRef.current.gameOver) return;
    stateRef.current.gameOver = true;
    setGameOver(true);
    setGameWon(true);
    sound.playFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  // Main 60fps Game Loop & Canvas 3D Painter
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const state = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Progressive Acceleration
      if (!state.gameOver) {
        const speedRatio = Math.min(1, state.distance / 2500);
        const targetSpeed = initialSpeed + (maxSpeed - initialSpeed) * speedRatio;
        state.speed = Math.min(maxSpeed, state.speed + (targetSpeed - state.speed) * dt * 0.5);
        state.distance += (state.speed * 1000 / 3600) * dt;

        // Player smooth lane interpolation
        state.playerX += (state.targetX - state.playerX) * Math.min(1, dt * 14);

        // Dynamic Curve progression (alternating straight, left curve, right curve)
        state.curveTimer += dt;
        if (state.curveTimer > 7) {
          state.curveTimer = 0;
          const curveTypes = [0, 85, -85, 0, 110, -110];
          state.curveTarget = curveTypes[Math.floor(Math.random() * curveTypes.length)];
        }
        state.curve += (state.curveTarget - state.curve) * dt * 0.8;

        // Spawn traffic cars
        if (Math.random() < dt * 0.95 && state.traffic.length < 5 && state.finishZ > 300) {
          const spawnLane = Math.floor(Math.random() * 3);
          const laneOccupied = state.traffic.some(t => t.lane === spawnLane && t.z > 800);
          if (!laneOccupied) {
            state.traffic.push({
              id: state.nextTrafficId++,
              lane: spawnLane,
              z: 1000,
              speed: state.speed * 0.55 + Math.random() * 20,
              color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
            });
          }
        }

        // Spawn roadside scenery (trees, signs, viaducts)
        if (Math.random() < dt * 1.8 && state.roadside.length < 8) {
          const isViaduct = Math.random() < 0.12;
          const isSign = Math.random() < 0.25;
          state.roadside.push({
            id: state.nextRoadsideId++,
            type: isViaduct ? 'viaduct' : isSign ? 'sign' : 'tree',
            side: Math.random() < 0.5 ? -1 : 1,
            z: 1000,
            text: isSign ? (Math.random() < 0.5 ? '240 KM/H' : 'CURVA ➔') : undefined,
          });
        }

        // Move Traffic
        for (let i = state.traffic.length - 1; i >= 0; i--) {
          const car = state.traffic[i];
          const relativeSpeed = state.speed - car.speed + 40;
          car.z -= relativeSpeed * dt * 1.8;

          // Check Collision
          const isInvulnerable = now < state.invincibleUntil;
          if (car.z < 120 && car.z > 10 && car.lane === state.lane && !isInvulnerable) {
            // CRASH!
            sound.playError();
            state.invincibleUntil = now + 1600;
            state.speed = Math.max(initialSpeed * 0.7, state.speed - 50);
            state.combo = 1;
            setCombo(1);
            setScreenShake(14);
            setTimeout(() => setScreenShake(0), 400);
          }

          // Check Dodge Success
          if (car.z < 0 && !car.passed) {
            car.passed = true;
            sound.playClick();
            state.dodgedCount += 1;
            const points = 120 * state.combo;
            state.score += points;
            state.combo = Math.min(8, state.combo + 1);
            setCombo(state.combo);
            setScore(state.score);
            setDodgedCount(state.dodgedCount);
            setRecentDodgeToast(`+${points} Desvio!`);
            setTimeout(() => setRecentDodgeToast(null), 900);
          }

          if (car.z < -100) {
            state.traffic.splice(i, 1);
          }
        }

        // Move Roadside objects
        for (let i = state.roadside.length - 1; i >= 0; i--) {
          const obj = state.roadside[i];
          obj.z -= state.speed * dt * 1.8;
          if (obj.z < -100) {
            state.roadside.splice(i, 1);
          }
        }

        // Move Finish Line (synchronized)
        if (state.finishZ <= 1000) {
          state.finishZ -= state.speed * dt * 1.8;
          if (state.finishZ <= 50 && !state.crossingFinish) {
            state.crossingFinish = true;
            finishRace();
          }
        }
      }

      // Sync React states
      setSpeed(Math.round(state.speed));
      setDistance(Math.round(state.distance));
      setInvincible(now < state.invincibleUntil);

      // ==========================================
      // CANVAS RENDERING
      // ==========================================
      ctx.clearRect(0, 0, width, height);

      // Camera Horizon position
      const horizonY = height * 0.44;
      const horizonX = width / 2 + state.curve;

      // 1. SKY GRADIENT (Retro Twilight / Cyberpunk Sunset)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#090A15');
      skyGrad.addColorStop(0.5, '#1E1B4B');
      skyGrad.addColorStop(0.85, '#4C1D95');
      skyGrad.addColorStop(1, '#831843');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Retro Distant Sun / Horizon Glow
      const sunGrad = ctx.createRadialGradient(horizonX, horizonY, 5, horizonX, horizonY, 140);
      sunGrad.addColorStop(0, 'rgba(251, 146, 60, 0.7)');
      sunGrad.addColorStop(0.4, 'rgba(236, 72, 153, 0.4)');
      sunGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(horizonX, horizonY, 140, 0, Math.PI * 2);
      ctx.fill();

      // 2. PARALLAX CITY SKYLINE
      const cityParallaxX = -state.curve * 0.25;
      const bldgWidth = 32;
      const bldgCount = Math.ceil(width / bldgWidth) + 4;
      ctx.fillStyle = '#0F0E26';
      for (let i = 0; i < bldgCount; i++) {
        const bx = i * bldgWidth + (cityParallaxX % bldgWidth) - bldgWidth;
        const bHeight = 40 + ((i * 37) % 55);
        ctx.fillRect(bx, horizonY - bHeight, bldgWidth - 2, bHeight);

        // Lit windows
        ctx.fillStyle = i % 3 === 0 ? '#FDE047' : i % 2 === 0 ? '#38BDF8' : '#F472B6';
        for (let wy = horizonY - bHeight + 8; wy < horizonY - 6; wy += 10) {
          if ((i + wy) % 5 !== 0) {
            ctx.fillRect(bx + 6, wy, 4, 4);
            ctx.fillRect(bx + 16, wy, 4, 4);
          }
        }
        ctx.fillStyle = '#0F0E26';
      }

      // 3. TERRAIN / GRASS
      const grassGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      grassGrad.addColorStop(0, '#064E3B');
      grassGrad.addColorStop(1, '#022C22');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // 4. ROAD PERSPECTIVE POLYGON
      const roadTopWidth = width * 0.12;
      const roadBottomWidth = width * 0.88;
      const roadTopLeft = horizonX - roadTopWidth / 2;
      const roadTopRight = horizonX + roadTopWidth / 2;
      const roadBottomLeft = width / 2 - roadBottomWidth / 2;
      const roadBottomRight = width / 2 + roadBottomWidth / 2;

      // Asphalt base
      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.moveTo(roadTopLeft, horizonY);
      ctx.lineTo(roadTopRight, horizonY);
      ctx.lineTo(roadBottomRight, height);
      ctx.lineTo(roadBottomLeft, height);
      ctx.closePath();
      ctx.fill();

      // Road Stripes & Rumble Curbs (Zebras vermelhas e brancas)
      const stripeOffset = (state.distance * 1.5) % 40;
      const segments = 24;
      for (let i = 0; i < segments; i++) {
        const segProgress1 = Math.pow(i / segments, 2.2);
        const segProgress2 = Math.pow((i + 1) / segments, 2.2);

        const y1 = horizonY + (height - horizonY) * segProgress1;
        const y2 = horizonY + (height - horizonY) * segProgress2;

        const w1 = roadTopWidth + (roadBottomWidth - roadTopWidth) * segProgress1;
        const w2 = roadTopWidth + (roadBottomWidth - roadTopWidth) * segProgress2;

        const x1 = horizonX + (width / 2 - horizonX) * segProgress1;
        const x2 = horizonX + (width / 2 - horizonX) * segProgress2;

        const isRed = (i + Math.floor(stripeOffset / 8)) % 2 === 0;
        ctx.fillStyle = isRed ? '#DC2626' : '#FAFAFA';

        // Left rumble strip
        const curbWidth1 = 6 + 18 * segProgress1;
        const curbWidth2 = 6 + 18 * segProgress2;
        ctx.beginPath();
        ctx.moveTo(x1 - w1 / 2, y1);
        ctx.lineTo(x1 - w1 / 2 + curbWidth1, y1);
        ctx.lineTo(x2 - w2 / 2 + curbWidth2, y2);
        ctx.lineTo(x2 - w2 / 2, y2);
        ctx.fill();

        // Right rumble strip
        ctx.beginPath();
        ctx.moveTo(x1 + w1 / 2 - curbWidth1, y1);
        ctx.lineTo(x1 + w1 / 2, y1);
        ctx.lineTo(x2 + w2 / 2, y2);
        ctx.lineTo(x2 + w2 / 2 - curbWidth2, y2);
        ctx.fill();

        // 3 Lane Dividers (Dashed lines between lanes 0-1 and 1-2)
        if (i % 2 === (Math.floor(stripeOffset / 10) % 2)) {
          ctx.fillStyle = '#FFFFFF';
          const lw1 = 1 + 5 * segProgress1;
          const lw2 = 1 + 5 * segProgress2;

          // Lane Divider 1 (Left / Center)
          const div1_x1 = x1 - w1 / 6;
          const div1_x2 = x2 - w2 / 6;
          ctx.beginPath();
          ctx.moveTo(div1_x1 - lw1 / 2, y1);
          ctx.lineTo(div1_x1 + lw1 / 2, y1);
          ctx.lineTo(div1_x2 + lw2 / 2, y2);
          ctx.lineTo(div1_x2 - lw2 / 2, y2);
          ctx.fill();

          // Lane Divider 2 (Center / Right)
          const div2_x1 = x1 + w1 / 6;
          const div2_x2 = x2 + w2 / 6;
          ctx.beginPath();
          ctx.moveTo(div2_x1 - lw1 / 2, y1);
          ctx.lineTo(div2_x1 + lw1 / 2, y1);
          ctx.lineTo(div2_x2 + lw2 / 2, y2);
          ctx.lineTo(div2_x2 - lw2 / 2, y2);
          ctx.fill();
        }
      }

      // Helper function: Convert Road (Lane, Z) to Screen (X, Y, Scale)
      const projectRoad = (roadLane: number, z: number) => {
        const factor = Math.max(0, Math.min(1, 1 - z / 1000));
        const persp = Math.pow(factor, 2.4);

        const curY = horizonY + (height - horizonY) * persp;
        const curRoadWidth = roadTopWidth + (roadBottomWidth - roadTopWidth) * persp;
        const curRoadCenterX = horizonX + (width / 2 - horizonX) * persp;

        // Lane offsets: -1/3 for lane 0, 0 for lane 1, +1/3 for lane 2
        const laneOffsetNormalized = (roadLane - 1) * (1 / 3);
        const curX = curRoadCenterX + curRoadWidth * laneOffsetNormalized;
        const scale = 0.12 + 0.88 * persp;

        return { x: curX, y: curY, scale, width: curRoadWidth, centerX: curRoadCenterX, persp };
      };

      // Scene rendering items with unified Z-sorting (back-to-front depth order)
      const sceneItems: { z: number; draw: () => void }[] = [];

      // 5. PREPARE ROADSIDE OBJECTS (Trees, Signs, Viaducts)
      state.roadside.forEach((obj) => {
        if (obj.z < 0 || obj.z > 1000) return;

        sceneItems.push({
          z: obj.z,
          draw: () => {
            const { y, scale, width: rWidth, centerX } = projectRoad(1, obj.z);

            if (obj.type === 'viaduct') {
              // TALL, SYMMETRICAL OVERHEAD HIGHWAY GANTRY / VIADUCT
              const clearanceH = 140 * scale; // plenty of headroom for cars to pass under
              const beamH = 42 * scale;
              const beamY = y - clearanceH - beamH;
              const totalSpan = rWidth * 1.32; // spans across all 3 lanes and both shoulders
              const beamLeft = centerX - totalSpan / 2;
              const pillarW = Math.max(5, 14 * scale);

              // Pillars symmetrically anchored on left and right grass shoulders
              const leftPillarX = centerX - rWidth * 0.58 - pillarW / 2;
              const rightPillarX = centerX + rWidth * 0.58 - pillarW / 2;
              const pillarHeight = y - beamY;

              // Pillar soft ground shadows
              ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
              ctx.beginPath();
              ctx.ellipse(leftPillarX + pillarW / 2, y, pillarW * 1.2, 4 * scale, 0, 0, Math.PI * 2);
              ctx.ellipse(rightPillarX + pillarW / 2, y, pillarW * 1.2, 4 * scale, 0, 0, Math.PI * 2);
              ctx.fill();

              // Steel Support Pillars
              ctx.fillStyle = '#334155';
              ctx.fillRect(leftPillarX, beamY, pillarW, pillarHeight);
              ctx.fillRect(rightPillarX, beamY, pillarW, pillarHeight);

              // Metallic pillar highlights
              ctx.fillStyle = '#64748B';
              ctx.fillRect(leftPillarX + 2 * scale, beamY, pillarW * 0.35, pillarHeight);
              ctx.fillRect(rightPillarX + 2 * scale, beamY, pillarW * 0.35, pillarHeight);

              // Pillar concrete foundations
              ctx.fillStyle = '#1E293B';
              ctx.fillRect(leftPillarX - 2 * scale, y - 8 * scale, pillarW + 4 * scale, 8 * scale);
              ctx.fillRect(rightPillarX - 2 * scale, y - 8 * scale, pillarW + 4 * scale, 8 * scale);

              // Main Overhead Beam Structure (Gantry)
              ctx.fillStyle = '#1E293B';
              ctx.fillRect(beamLeft, beamY, totalSpan, beamH);

              // Top and bottom metallic edge trims
              ctx.fillStyle = '#94A3B8';
              ctx.fillRect(beamLeft, beamY, totalSpan, Math.max(2, 4 * scale));
              ctx.fillRect(beamLeft, beamY + beamH - Math.max(2, 4 * scale), totalSpan, Math.max(2, 4 * scale));

              // Treliça metálica (Truss diagonal struts)
              ctx.strokeStyle = '#475569';
              ctx.lineWidth = Math.max(1, 2 * scale);
              const trussStep = Math.max(16, 40 * scale);
              ctx.beginPath();
              for (let tx = beamLeft; tx < beamLeft + totalSpan; tx += trussStep) {
                ctx.moveTo(tx, beamY);
                ctx.lineTo(tx + trussStep, beamY + beamH);
                ctx.moveTo(tx + trussStep, beamY);
                ctx.lineTo(tx, beamY + beamH);
              }
              ctx.stroke();

              // Highway Signboard mounted on the Gantry (Placa Rodoviária)
              const signW = rWidth * 0.72;
              const signH = beamH * 0.82;
              const signX = centerX - signW / 2;
              const signY = beamY + (beamH - signH) / 2;

              // Sign green background
              ctx.fillStyle = '#047857';
              ctx.fillRect(signX, signY, signW, signH);

              // White reflective border
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = Math.max(1.5, 2.5 * scale);
              ctx.strokeRect(signX, signY, signW, signH);

              // Sign text
              ctx.fillStyle = '#FFFFFF';
              ctx.font = `black ${Math.max(7, Math.floor(13 * scale))}px Outfit, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              const gantryText = obj.text || (scale > 0.4 ? 'AUTÓDROMO ➔' : 'TOP GEAR BR');
              ctx.fillText(gantryText, centerX - 18 * scale, signY + signH / 2);

              // Speed limit circular plate (120 km/h)
              if (scale > 0.3) {
                const badgeR = Math.max(6, 11 * scale);
                const badgeX = signX + signW - badgeR - 6 * scale;
                const badgeY = signY + signH / 2;

                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#DC2626';
                ctx.lineWidth = Math.max(1.5, 3 * scale);
                ctx.beginPath();
                ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
                ctx.stroke();

                ctx.fillStyle = '#000000';
                ctx.font = `bold ${Math.max(5, Math.floor(8 * scale))}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('120', badgeX, badgeY);
              }
            } else if (obj.type === 'tree') {
              // Tree on grass shoulder
              const objX = centerX + obj.side * (rWidth * 0.58 + 32 * scale);
              const trunkW = Math.max(3, 8 * scale);
              const trunkH = 65 * scale;
              ctx.fillStyle = '#78350F';
              ctx.fillRect(objX - trunkW / 2, y - trunkH, trunkW, trunkH);

              // Foliage
              ctx.fillStyle = '#059669';
              ctx.beginPath();
              ctx.arc(objX, y - trunkH - 14 * scale, 28 * scale, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#10B981';
              ctx.beginPath();
              ctx.arc(objX, y - trunkH - 22 * scale, 20 * scale, 0, Math.PI * 2);
              ctx.fill();
            } else if (obj.type === 'sign') {
              // Ground-mounted roadside sign
              const objX = centerX + obj.side * (rWidth * 0.58 + 22 * scale);
              const signW = 46 * scale;
              const signH = 32 * scale;
              const signPoleH = 55 * scale;

              ctx.fillStyle = '#64748B';
              ctx.fillRect(objX - 2.5 * scale, y - signPoleH, 5 * scale, signPoleH);

              ctx.fillStyle = '#1D4ED8';
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = Math.max(1, 2 * scale);
              ctx.fillRect(objX - signW / 2, y - signPoleH - signH, signW, signH);
              ctx.strokeRect(objX - signW / 2, y - signPoleH - signH, signW, signH);

              ctx.fillStyle = '#FFFFFF';
              ctx.font = `black ${Math.max(6, Math.floor(10 * scale))}px Outfit, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(obj.text || 'SPEED', objX, y - signPoleH - signH / 2);
            }
          },
        });
      });

      // 6. PREPARE FINISH LINE (Linha de Chegada Sincronizada)
      if (state.finishZ <= 1000 && state.finishZ >= 0) {
        sceneItems.push({
          z: state.finishZ,
          draw: () => {
            const factor = Math.max(0, Math.min(1, 1 - state.finishZ / 1000));
            const persp = Math.pow(factor, 2.4);
            const fY = horizonY + (height - horizonY) * persp;
            const fWidth = roadTopWidth + (roadBottomWidth - roadTopWidth) * persp;
            const fCenterX = horizonX + (width / 2 - horizonX) * persp;

            // Checkered line on the ground
            const checkCount = 14;
            const checkW = fWidth / checkCount;
            const checkH = Math.max(4, 16 * persp);
            for (let c = 0; c < checkCount; c++) {
              ctx.fillStyle = c % 2 === 0 ? '#FFFFFF' : '#000000';
              ctx.fillRect(fCenterX - fWidth / 2 + c * checkW, fY - checkH / 2, checkW, checkH);
            }

            // Finish Overhead Gantry Banner
            const gantryH = 45 * persp;
            const gantryY = fY - 80 * persp;
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(fCenterX - fWidth * 0.55, gantryY, fWidth * 1.1, gantryH);
            ctx.fillStyle = '#F59E0B';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2 * persp;
            ctx.strokeRect(fCenterX - fWidth * 0.55, gantryY, fWidth * 1.1, gantryH);

            // Banner Text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `black ${Math.max(8, Math.floor(18 * persp))}px Outfit, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('🏁 CHEGADA / FINISH 🏁', fCenterX, gantryY + gantryH * 0.65);
          },
        });
      }

      // 7. PREPARE TRAFFIC CARS (Top Gear style)
      state.traffic.forEach((car) => {
        if (car.z < 0 || car.z > 1000) return;
        sceneItems.push({
          z: car.z,
          draw: () => {
            const { x, y, scale } = projectRoad(car.lane, car.z);

            const carW = 68 * scale;
            const carH = 38 * scale;

            // Shadow under traffic car
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.beginPath();
            ctx.ellipse(x, y + carH * 0.38, carW * 0.55, carH * 0.22, 0, 0, Math.PI * 2);
            ctx.fill();

            // Car Body
            ctx.fillStyle = car.color;
            ctx.beginPath();
            ctx.roundRect(x - carW / 2, y - carH / 2, carW, carH, 6 * scale);
            ctx.fill();

            // Rear Windshield
            ctx.fillStyle = '#0F172A';
            ctx.fillRect(x - carW * 0.35, y - carH * 0.35, carW * 0.7, carH * 0.35);

            // Roof
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x - carW * 0.3, y - carH * 0.45, carW * 0.6, carH * 0.15);

            // Taillights
            ctx.fillStyle = '#EF4444';
            ctx.shadowColor = '#EF4444';
            ctx.shadowBlur = 8 * scale;
            ctx.fillRect(x - carW * 0.44, y + carH * 0.05, 10 * scale, 8 * scale);
            ctx.fillRect(x + carW * 0.44 - 10 * scale, y + carH * 0.05, 10 * scale, 8 * scale);
            ctx.shadowBlur = 0;

            // License Plate
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x - 8 * scale, y + carH * 0.1, 16 * scale, 6 * scale);
          },
        });
      });

      // RENDER ALL 3D SCENE OBJECTS IN PROPER DEPTH ORDER (Furthest to Nearest)
      sceneItems.sort((a, b) => b.z - a.z);
      sceneItems.forEach((item) => item.draw());

      // 8. PLAYER'S CAR & AUTOMATIC HEADLIGHTS
      const playerPersp = 0.94;
      const playerY = horizonY + (height - horizonY) * playerPersp;
      const curRoadW = roadTopWidth + (roadBottomWidth - roadTopWidth) * playerPersp;
      const curRoadCenterX = horizonX + (width / 2 - horizonX) * playerPersp;

      // Player X position calculated from interpolated state.playerX
      const playerX = curRoadCenterX + curRoadW * (state.playerX / 3);

      // A) AUTOMATIC HEADLIGHTS ILLUMINATION CONE ON ASPHALT (Smooth progressive fade to transparent)
      const headlightBeamH = height * 0.45;
      const beamTopY = playerY - headlightBeamH;

      // Vertical linear gradient fading gradually to 0% opacity with no hard cut
      const beamGrad = ctx.createLinearGradient(0, playerY - 10, 0, beamTopY);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      beamGrad.addColorStop(0.20, 'rgba(254, 240, 138, 0.28)');
      beamGrad.addColorStop(0.45, 'rgba(254, 240, 138, 0.14)');
      beamGrad.addColorStop(0.70, 'rgba(254, 240, 138, 0.05)');
      beamGrad.addColorStop(0.88, 'rgba(254, 240, 138, 0.01)');
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(playerX - 26, playerY - 10);
      ctx.lineTo(playerX + 26, playerY - 10);
      ctx.lineTo(playerX + curRoadW * 0.42, beamTopY + 24);
      // Soft parabolic top apex so light dissipates naturally without any flat line
      ctx.quadraticCurveTo(playerX, beamTopY - 20, playerX - curRoadW * 0.42, beamTopY + 24);
      ctx.closePath();
      ctx.fill();

      // Front Headlight bulbs glow on car bumper
      const bulbGlowL = ctx.createRadialGradient(playerX - 22, playerY - 10, 1, playerX - 22, playerY - 10, 12);
      bulbGlowL.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      bulbGlowL.addColorStop(0.5, 'rgba(254, 240, 138, 0.45)');
      bulbGlowL.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = bulbGlowL;
      ctx.beginPath();
      ctx.arc(playerX - 22, playerY - 10, 12, 0, Math.PI * 2);
      ctx.fill();

      const bulbGlowR = ctx.createRadialGradient(playerX + 22, playerY - 10, 1, playerX + 22, playerY - 10, 12);
      bulbGlowR.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      bulbGlowR.addColorStop(0.5, 'rgba(254, 240, 138, 0.45)');
      bulbGlowR.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = bulbGlowR;
      ctx.beginPath();
      ctx.arc(playerX + 22, playerY - 10, 12, 0, Math.PI * 2);
      ctx.fill();

      // B) PLAYER CAR BODY (Retro Sports Car with Spoiler & Details)
      const pCarW = 86;
      const pCarH = 46;

      // Invincible blinking
      const isInv = now < state.invincibleUntil;
      const blink = isInv && Math.floor(now / 100) % 2 === 0;

      if (!blink) {
        // Shadow under car
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.ellipse(playerX, playerY + pCarH * 0.4, pCarW * 0.55, pCarH * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rear Tires
        ctx.fillStyle = '#09090B';
        ctx.fillRect(playerX - pCarW * 0.52, playerY + pCarH * 0.05, 14, 22);
        ctx.fillRect(playerX + pCarW * 0.52 - 14, playerY + pCarH * 0.05, 14, 22);

        // Main Car Body
        const bodyGrad = ctx.createLinearGradient(playerX - pCarW / 2, playerY, playerX + pCarW / 2, playerY);
        bodyGrad.addColorStop(0, playerCarColor);
        bodyGrad.addColorStop(0.5, '#FFFFFF44');
        bodyGrad.addColorStop(1, playerCarColor);

        ctx.fillStyle = playerCarColor;
        ctx.beginPath();
        ctx.roundRect(playerX - pCarW / 2, playerY - pCarH / 2, pCarW, pCarH, 10);
        ctx.fill();

        // Shimmer shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(playerX - pCarW * 0.35, playerY - pCarH * 0.45, pCarW * 0.7, 4);

        // Rear Windshield Glass
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.roundRect(playerX - pCarW * 0.34, playerY - pCarH * 0.36, pCarW * 0.68, pCarH * 0.34, 4);
        ctx.fill();

        // Rear Spoiler (Aerofólio Top Gear)
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(playerX - pCarW * 0.48, playerY - pCarH * 0.55, pCarW * 0.96, 6);
        ctx.fillRect(playerX - pCarW * 0.35, playerY - pCarH * 0.5, 6, 8);
        ctx.fillRect(playerX + pCarW * 0.35 - 6, playerY - pCarH * 0.5, 6, 8);

        // Dual Taillights (Glowing Red)
        ctx.fillStyle = '#EF4444';
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 15;
        ctx.fillRect(playerX - pCarW * 0.44, playerY + 4, 16, 10);
        ctx.fillRect(playerX + pCarW * 0.44 - 16, playerY + 4, 16, 10);
        ctx.shadowBlur = 0;

        // Exhaust tips with blue flame at high speed
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(playerX - 22, playerY + pCarH * 0.38, 8, 4);
        ctx.fillRect(playerX + 14, playerY + pCarH * 0.38, 8, 4);

        if (state.speed > 180 && Math.random() < 0.6) {
          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.arc(playerX - 18, playerY + pCarH * 0.46, 4 + Math.random() * 4, 0, Math.PI * 2);
          ctx.arc(playerX + 18, playerY + pCarH * 0.46, 4 + Math.random() * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [duration, initialSpeed, maxSpeed, playerCarColor, finishRace]);

  // Restart match
  const restart = () => {
    setTimeLeft(duration);
    setLane(1);
    setSpeed(initialSpeed);
    setDistance(0);
    setScore(0);
    setCombo(1);
    setDodgedCount(0);
    setGameOver(false);
    setGameWon(false);
    setInvincible(false);

    stateRef.current = {
      lane: 1,
      playerX: 0,
      targetX: 0,
      speed: initialSpeed,
      distance: 0,
      score: 0,
      combo: 1,
      dodgedCount: 0,
      invincibleUntil: 0,
      curve: 0,
      curveTarget: 0,
      curveTimer: 0,
      traffic: [],
      roadside: [],
      nextTrafficId: 1,
      nextRoadsideId: 1,
      finishZ: 9999,
      crossingFinish: false,
      gameOver: false,
    };
  };

  const gear = speed < 130 ? 1 : speed < 160 ? 2 : speed < 190 ? 3 : speed < 220 ? 4 : 5;

  return (
    <GameContainer
      title={trackName}
      category="Precisão & Coordenação"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      correctAnswers={dodgedCount}
      customScoreLabel="Pontos"
      themePrimary={layoutPrimary}
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
      isLight={isLightMode}
      themeMode={isLightMode ? 'light' : 'dark'}
      gameLayout={activeLayout}
      palette={palette}
      layoutColorHue={layoutColorHue}
    >
      <div 
        className={`relative w-full h-full flex flex-col justify-between overflow-hidden select-none ${
          screenShake > 0 ? 'animate-pulse' : ''
        }`}
      >
        {/* TOP HUD: Speedometer, Gear, Distance & Combo */}
        <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
          {/* Speedometer Card */}
          <div
            className={`px-4 py-2.5 rounded-2xl ${layoutDef.cardClass} backdrop-blur-md border shadow-2xl flex items-center gap-3`}
            style={{
              borderColor: `${layoutPrimary}88`,
              boxShadow: `0 0 25px ${layoutGlow}`,
            }}
          >
            <Gauge className="w-6 h-6 animate-pulse" style={{ color: layoutPrimary }} />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Velocidade
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight drop-shadow">
                  {speed}
                </span>
                <span className="text-xs font-bold text-amber-400 font-mono">KM/H</span>
              </div>
            </div>
            {/* Gear badge */}
            <div className="ml-2 px-2.5 py-1 rounded-xl bg-white/10 border border-white/20 text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Marcha</span>
              <span className="text-sm font-black font-mono text-emerald-400">{gear}ª</span>
            </div>
          </div>

          {/* Toast Notification */}
          {recentDodgeToast && (
            <div className="animate-bounce px-4 py-2 rounded-2xl bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-xl flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{recentDodgeToast}</span>
            </div>
          )}

          {/* Right Stats: Distance & Combo */}
          <div className="flex items-center gap-2">
            <div
              className={`px-3.5 py-2 rounded-2xl ${layoutDef.cardClass} border backdrop-blur-md hidden sm:flex flex-col`}
              style={{ borderColor: `${layoutPrimary}44` }}
            >
              <span className="text-[9px] font-black uppercase text-slate-400">Distância</span>
              <span className="text-sm font-black font-mono text-white">
                {distance} <small className="text-[10px] text-slate-400">m</small>
              </span>
            </div>

            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${
                combo > 1
                  ? 'text-white shadow-lg scale-105 animate-pulse'
                  : 'bg-white/10 text-slate-300 border border-white/10'
              }`}
              style={
                combo > 1
                  ? {
                      background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                      boxShadow: `0 4px 20px ${layoutGlow}`,
                    }
                  : undefined
              }
            >
              <Flame className="w-4 h-4 fill-current" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider font-mono">
                {combo}x Combo
              </span>
            </div>
          </div>
        </div>

        {/* CANVAS RETRO 3D ROAD */}
        <div className="relative w-full flex-1 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={900}
            height={600}
            className="w-full h-full object-cover"
          />

          {/* Invincibility Shield Banner */}
          {invincible && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500/80 backdrop-blur-sm text-black font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1 animate-pulse">
              <Shield className="w-3.5 h-3.5" />
              <span>Escudo Protetor Ativo</span>
            </div>
          )}
        </div>

        {/* BIG RESPONSIVE TOUCH CONTROLS (ESQUERDA ⬅️ / DIREITA ➡️) */}
        <div className="relative z-30 w-full max-w-2xl mx-auto p-3 sm:p-5 grid grid-cols-2 gap-4 pb-4">
          {/* LEFT BUTTON */}
          <button
            type="button"
            onClick={moveLeft}
            disabled={lane === 0 || gameOver}
            className={`py-5 sm:py-6 px-4 rounded-3xl font-black text-lg sm:text-2xl uppercase tracking-wider shadow-xl flex items-center justify-center gap-3 transition-all duration-100 select-none active:scale-95 ${
              layoutDef.buttonClass
            } ${
              lane === 0
                ? 'opacity-40 pointer-events-none bg-slate-800 text-slate-500 border-slate-700'
                : 'text-white border-2 hover:scale-[1.02]'
            }`}
            style={
              lane > 0
                ? {
                    background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                    borderColor: `${layoutPrimary}aa`,
                    boxShadow: `0 8px 30px ${layoutGlow}`,
                  }
                : undefined
            }
          >
            <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
            <span>ESQUERDA</span>
          </button>

          {/* RIGHT BUTTON */}
          <button
            type="button"
            onClick={moveRight}
            disabled={lane === 2 || gameOver}
            className={`py-5 sm:py-6 px-4 rounded-3xl font-black text-lg sm:text-2xl uppercase tracking-wider shadow-xl flex items-center justify-center gap-3 transition-all duration-100 select-none active:scale-95 ${
              layoutDef.buttonClass
            } ${
              lane === 2
                ? 'opacity-40 pointer-events-none bg-slate-800 text-slate-500 border-slate-700'
                : 'text-white border-2 hover:scale-[1.02]'
            }`}
            style={
              lane < 2
                ? {
                    background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                    borderColor: `${layoutPrimary}aa`,
                    boxShadow: `0 8px 30px ${layoutGlow}`,
                  }
                : undefined
            }
          >
            <span>DIREITA</span>
            <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
          </button>
        </div>

        {/* Victory Celebration Modal Overlay */}
        {gameWon && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
            <div
              className={`p-6 sm:p-8 rounded-3xl max-w-md w-full ${layoutDef.cardClass} border-2 text-center shadow-2xl flex flex-col items-center gap-4`}
              style={{
                borderColor: layoutPrimary,
                boxShadow: `0 0 50px ${layoutGlow}`,
              }}
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center shadow-xl animate-bounce"
                style={{
                  background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                }}
              >
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Chegada Conquistada!
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  Linha de Chegada Cruzada!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Você completou o circuito desviando dos veículos com reflexos de piloto profissional!
                </p>
              </div>

              {/* Stats Box */}
              <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/10 border border-white/10 text-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Distância</span>
                  <p className="text-base font-black text-amber-400 font-mono">{distance}m</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Desvios</span>
                  <p className="text-base font-black text-cyan-400 font-mono">{dodgedCount}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Pontuação</span>
                  <p className="text-base font-black text-emerald-400 font-mono">{score}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={restart}
                className={`w-full py-4 px-6 rounded-2xl font-black text-base text-white shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all ${layoutDef.buttonClass}`}
                style={{
                  background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                  boxShadow: `0 4px 25px ${layoutGlow}`,
                }}
              >
                <span>Correr Novamente</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </GameContainer>
  );
};
