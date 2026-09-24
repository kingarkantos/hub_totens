import React, { useEffect, useRef } from 'react';

export type BackgroundEffectId =
  | 'none'
  | 'matrix'
  | 'stars'
  | 'rain'
  | 'nanotech'
  | 'fireflies'
  | 'cyber_grid'
  | 'bubbles'
  | 'eco_leaves'
  | 'confetti'
  | 'snow'
  | 'fire_embers'
  | 'water_caustics'
  | 'bokeh'
  | 'hologram_cubes'
  | 'lightning_energy'
  | 'cosmic_dust'
  | 'sakura_petals';

export interface BackgroundEffectDefinition {
  id: BackgroundEffectId;
  name: string;
  tagline: string;
  icon: string;
  description: string;
}

export const BACKGROUND_EFFECTS: BackgroundEffectDefinition[] = [
  {
    id: 'none',
    name: 'Nenhum',
    tagline: 'Fundo Limpo',
    icon: '🚫',
    description: 'Sem efeitos sobrepostos, exibindo apenas a imagem ou gradiente base.',
  },
  {
    id: 'eco_leaves',
    name: 'Folhas Eco & Natureza',
    tagline: 'Sustentabilidade & Verde',
    icon: '🍃',
    description: 'Folhas verdes orgânicas flutuando e caindo suavemente com rotação e brisa natural.',
  },
  {
    id: 'fire_embers',
    name: 'Brasas & Fagulhas',
    tagline: 'Fogo & Calor Dinâmico',
    icon: '🔥',
    description: 'Fagulhas incandescentes e brasas subindo do rodapé com cintilação e aura ardente.',
  },
  {
    id: 'confetti',
    name: 'Confetes Festivos',
    tagline: 'Celebração & Cores',
    icon: '🎊',
    description: 'Chuva de confetes coloridos em queda espiralada com rotação 3D para celebrações.',
  },
  {
    id: 'snow',
    name: 'Flocos de Neve',
    tagline: 'Inverno & Cristal',
    icon: '❄️',
    description: 'Flocos de neve cristalinos e partículas suaves caindo graciosamente pelo cenário.',
  },
  {
    id: 'water_caustics',
    name: 'Ondas & Fluido Aquático',
    tagline: 'Reflexos Subaquáticos',
    icon: '🌊',
    description: 'Ondulações líquidas luminosas com reflexos caústicos e bolhas sutis de profundidade.',
  },
  {
    id: 'bokeh',
    name: 'Luzes Bokeh & Halos',
    tagline: 'Fotografia & Cinema',
    icon: '🔮',
    description: 'Grandes círculos de luz suave e desfocada flutuando com pulsação e transição cromática.',
  },
  {
    id: 'hologram_cubes',
    name: 'Cubos Holográficos 3D',
    tagline: 'Tech & Visor Futurista',
    icon: '🧊',
    description: 'Cubos geométricos em aramado translúcido girando em perspectiva tridimensional.',
  },
  {
    id: 'lightning_energy',
    name: 'Raios & Energia Plasma',
    tagline: 'Alta Tensão & Elétrico',
    icon: '⚡',
    description: 'Descargas de raios elétricos ramificados e faíscas de alta voltagem intermitentes.',
  },
  {
    id: 'cosmic_dust',
    name: 'Poeira Cósmica & Galáxia',
    tagline: 'Espaço & Nebulosa',
    icon: '🌌',
    description: 'Nuvem de poeira estelar cintilante e nebulosas violeta e ciano em deriva cósmica.',
  },
  {
    id: 'sakura_petals',
    name: 'Pétalas de Primavera',
    tagline: 'Flor de Cerejeira & Zen',
    icon: '🌸',
    description: 'Pétalas rosadas delicadas flutuando ao vento com movimentos suaves e elegantes.',
  },
  {
    id: 'matrix',
    name: 'Chuva Matrix',
    tagline: 'Código Digital Verde',
    icon: '💻',
    description: 'Cascata vertical de caracteres e código binário verde estilo Matrix.',
  },
  {
    id: 'stars',
    name: 'Céu Estrelado',
    tagline: 'Estrelas & Meteoros',
    icon: '✨',
    description: 'Céu noturno com estrelas cintilantes e estrelas cadentes que cruzam a tela.',
  },
  {
    id: 'nanotech',
    name: 'Nanotecnologia',
    tagline: 'Teia de Nós & Plexus',
    icon: '🧬',
    description: 'Partículas nanotecnológicas interconectadas por feixes luminosos dinâmicos.',
  },
  {
    id: 'rain',
    name: 'Chuva Cyber',
    tagline: 'Gotas Luminosas',
    icon: '🌧️',
    description: 'Gotas de chuva caindo em velocidade suave com reflexos neon.',
  },
  {
    id: 'fireflies',
    name: 'Vaga-lumes',
    tagline: 'Luzes Douradas',
    icon: '🌟',
    description: 'Pontos de luz orgânicos e esferas douradas flutuando suavemente.',
  },
  {
    id: 'cyber_grid',
    name: 'Synthwave Grid',
    tagline: 'Malha 3D Retro',
    icon: '🌐',
    description: 'Grade de perspectiva tridimensional retrô futurista neon no horizonte.',
  },
  {
    id: 'bubbles',
    name: 'Bolhas Toon',
    tagline: 'Bolhas Flutuantes',
    icon: '🫧',
    description: 'Bolhas cartoon translúcidas que sobem suavemente pela tela.',
  },
];

interface BackgroundEffectOverlayProps {
  effect?: BackgroundEffectId;
  className?: string;
}

export const BackgroundEffectOverlay: React.FC<BackgroundEffectOverlayProps> = ({
  effect = 'none',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (effect === 'none' || effect === 'cyber_grid') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const getCanvasDimensions = () => {
      const parent = canvas.parentElement;
      return {
        w: parent ? parent.clientWidth : window.innerWidth,
        h: parent ? parent.clientHeight : window.innerHeight,
      };
    };

    let { w: width, h: height } = getCanvasDimensions();
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      if (!canvas) return;
      const dims = getCanvasDimensions();
      width = canvas.width = dims.w;
      height = canvas.height = dims.h;
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 1. ECO LEAVES (Folhas Verdes em Queda Suave)
    // ==========================================
    if (effect === 'eco_leaves') {
      const leafCount = Math.min(35, Math.max(12, Math.floor(width / 35)));
      const colors = ['#22c55e', '#16a34a', '#4ade80', '#15803d', '#84cc16'];
      const leaves = Array.from({ length: leafCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 12 + 10,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.04,
        vy: Math.random() * 1.2 + 0.8,
        vx: Math.random() * 0.8 - 0.4,
        swaySpeed: Math.random() * 0.03 + 0.015,
        swayAmp: Math.random() * 25 + 15,
        swayPhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));

      const renderLeaves = () => {
        ctx.clearRect(0, 0, width, height);

        for (const l of leaves) {
          l.swayPhase += l.swaySpeed;
          l.y += l.vy;
          l.x += l.vx + Math.sin(l.swayPhase) * 0.8;
          l.angle += l.angularSpeed;

          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.angle);

          // Draw realistic stylized leaf
          ctx.beginPath();
          ctx.moveTo(0, -l.size);
          ctx.bezierCurveTo(l.size * 0.7, -l.size * 0.4, l.size * 0.7, l.size * 0.4, 0, l.size);
          ctx.bezierCurveTo(-l.size * 0.7, l.size * 0.4, -l.size * 0.7, -l.size * 0.4, 0, -l.size);
          ctx.fillStyle = l.color;
          ctx.globalAlpha = 0.75;
          ctx.fill();

          // Central leaf vein
          ctx.beginPath();
          ctx.moveTo(0, -l.size * 0.8);
          ctx.lineTo(0, l.size * 0.8);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.restore();

          if (l.y > height + 40) {
            l.y = -30;
            l.x = Math.random() * width;
          }
        }

        animationId = requestAnimationFrame(renderLeaves);
      };

      renderLeaves();
    }

    // ==========================================
    // 2. FIRE EMBERS (Brasas e Fagulhas Subindo)
    // ==========================================
    else if (effect === 'fire_embers') {
      const emberCount = Math.min(65, Math.max(25, Math.floor(width / 20)));
      const embers = Array.from({ length: emberCount }, () => ({
        x: Math.random() * width,
        y: height + Math.random() * 50,
        radius: Math.random() * 3 + 1,
        vy: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.9,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.05 + 0.02,
        life: Math.random() * 0.8 + 0.2,
        color: ['#ffffff', '#fef08a', '#fde047', '#f97316', '#ef4444'][Math.floor(Math.random() * 5)],
      }));

      const renderEmbers = () => {
        ctx.clearRect(0, 0, width, height);

        for (const e of embers) {
          e.y -= e.vy;
          e.wobble += e.wobbleSpeed;
          e.x += Math.sin(e.wobble) * 0.6 + e.vx;
          e.life -= 0.003;

          const alpha = Math.max(0, e.life);
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
          ctx.fillStyle = e.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#ea580c';
          ctx.globalAlpha = alpha;
          ctx.fill();

          if (e.y < -20 || e.life <= 0) {
            e.y = height + Math.random() * 30;
            e.x = Math.random() * width;
            e.life = Math.random() * 0.8 + 0.4;
          }
        }

        animationId = requestAnimationFrame(renderEmbers);
      };

      renderEmbers();
    }

    // ==========================================
    // 3. CONFETTI (Chuva de Confetes Festivos)
    // ==========================================
    else if (effect === 'confetti') {
      const confettiColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'];
      const pieceCount = Math.min(50, Math.max(20, Math.floor(width / 25)));
      const pieces = Array.from({ length: pieceCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height - height,
        w: Math.random() * 8 + 6,
        h: Math.random() * 12 + 8,
        vy: Math.random() * 2 + 1.2,
        vx: (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        tilt: Math.random() * Math.PI,
        tiltSpeed: Math.random() * 0.06 + 0.03,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      }));

      const renderConfetti = () => {
        ctx.clearRect(0, 0, width, height);

        for (const p of pieces) {
          p.y += p.vy;
          p.x += p.vx;
          p.rotation += p.rotSpeed;
          p.tilt += p.tiltSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(1, Math.cos(p.tilt));

          ctx.beginPath();
          ctx.rect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.85;
          ctx.fill();
          ctx.restore();

          if (p.y > height + 30) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        }

        animationId = requestAnimationFrame(renderConfetti);
      };

      renderConfetti();
    }

    // ==========================================
    // 4. SNOW (Flocos de Neve Cristalinos)
    // ==========================================
    else if (effect === 'snow') {
      const flakeCount = Math.min(75, Math.max(30, Math.floor(width / 18)));
      const flakes = Array.from({ length: flakeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        vy: Math.random() * 1 + 0.6,
        swaySpeed: Math.random() * 0.03 + 0.01,
        swayPhase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.6 + 0.4,
      }));

      const renderSnow = () => {
        ctx.clearRect(0, 0, width, height);

        for (const f of flakes) {
          f.swayPhase += f.swaySpeed;
          f.y += f.vy;
          f.x += Math.sin(f.swayPhase) * 0.5;

          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ffffff';
          ctx.fill();

          if (f.y > height + 10) {
            f.y = -10;
            f.x = Math.random() * width;
          }
        }

        animationId = requestAnimationFrame(renderSnow);
      };

      renderSnow();
    }

    // ==========================================
    // 5. WATER CAUSTICS (Ondulações Subaquáticas)
    // ==========================================
    else if (effect === 'water_caustics') {
      let t = 0;
      const renderWater = () => {
        ctx.clearRect(0, 0, width, height);
        t += 0.02;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 2.5;

        for (let wave = 0; wave < 4; wave++) {
          ctx.beginPath();
          const baseOffset = wave * (height / 3.5);
          for (let x = 0; x <= width; x += 20) {
            const y = baseOffset + Math.sin(x * 0.015 + t + wave) * 20 + Math.cos(x * 0.025 - t * 0.8) * 15;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        animationId = requestAnimationFrame(renderWater);
      };

      renderWater();
    }

    // ==========================================
    // 6. BOKEH LIGHTS (Halos Fotográficos Desfocados)
    // ==========================================
    else if (effect === 'bokeh') {
      const orbCount = Math.min(25, Math.max(10, Math.floor(width / 50)));
      const colors = ['rgba(236, 72, 153, 0.25)', 'rgba(59, 130, 246, 0.25)', 'rgba(245, 158, 11, 0.25)', 'rgba(168, 85, 247, 0.25)'];
      const orbs = Array.from({ length: orbCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 45 + 25,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        pulse: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));

      const renderBokeh = () => {
        ctx.clearRect(0, 0, width, height);

        for (const o of orbs) {
          o.x += o.vx;
          o.y += o.vy;
          o.pulse += 0.02;
          const currentRadius = o.radius + Math.sin(o.pulse) * 8;

          ctx.beginPath();
          ctx.arc(o.x, o.y, Math.max(5, currentRadius), 0, Math.PI * 2);
          ctx.fillStyle = o.color;
          ctx.fill();

          if (o.x < -60) o.x = width + 60;
          if (o.x > width + 60) o.x = -60;
          if (o.y < -60) o.y = height + 60;
          if (o.y > height + 60) o.y = -60;
        }

        animationId = requestAnimationFrame(renderBokeh);
      };

      renderBokeh();
    }

    // ==========================================
    // 7. HOLOGRAM CUBES 3D (Cubos em Aramado 3D)
    // ==========================================
    else if (effect === 'hologram_cubes') {
      const cubeCount = Math.min(18, Math.max(8, Math.floor(width / 60)));
      const cubes = Array.from({ length: cubeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 24 + 18,
        vy: -Math.random() * 0.6 - 0.3,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
      }));

      const renderCubes = () => {
        ctx.clearRect(0, 0, width, height);

        for (const c of cubes) {
          c.y += c.vy;
          c.rot += c.rotSpeed;

          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate(c.rot);

          ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-c.size / 2, -c.size / 2, c.size, c.size);

          // Isometric cross lines
          ctx.beginPath();
          ctx.moveTo(-c.size / 2, -c.size / 2);
          ctx.lineTo(c.size / 2, c.size / 2);
          ctx.moveTo(c.size / 2, -c.size / 2);
          ctx.lineTo(-c.size / 2, c.size / 2);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
          ctx.stroke();

          ctx.restore();

          if (c.y < -50) {
            c.y = height + 40;
            c.x = Math.random() * width;
          }
        }

        animationId = requestAnimationFrame(renderCubes);
      };

      renderCubes();
    }

    // ==========================================
    // 8. LIGHTNING ENERGY (Raios & Descargas Elétricas)
    // ==========================================
    else if (effect === 'lightning_energy') {
      let strikeTimer = 0;
      let activeBolts: Array<{ segments: Array<{ x: number; y: number }>; alpha: number }> = [];

      const createBolt = () => {
        const startX = Math.random() * width;
        let curX = startX;
        let curY = 0;
        const segments = [{ x: curX, y: curY }];

        while (curY < height) {
          curX += (Math.random() - 0.5) * 45;
          curY += Math.random() * 35 + 20;
          segments.push({ x: curX, y: curY });
        }
        activeBolts.push({ segments, alpha: 1 });
      };

      const renderLightning = () => {
        ctx.clearRect(0, 0, width, height);
        strikeTimer++;

        if (strikeTimer % 110 === 0 && Math.random() > 0.3) {
          createBolt();
        }

        activeBolts = activeBolts.filter((b) => b.alpha > 0);
        for (const b of activeBolts) {
          ctx.beginPath();
          ctx.moveTo(b.segments[0].x, b.segments[0].y);
          for (let i = 1; i < b.segments.length; i++) {
            ctx.lineTo(b.segments[i].x, b.segments[i].y);
          }
          ctx.strokeStyle = `rgba(168, 85, 247, ${b.alpha})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#c084fc';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // White electric core
          ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          b.alpha -= 0.05;
        }

        animationId = requestAnimationFrame(renderLightning);
      };

      renderLightning();
    }

    // ==========================================
    // 9. COSMIC DUST (Poeira Cósmica & Galáxia)
    // ==========================================
    else if (effect === 'cosmic_dust') {
      const dustCount = Math.min(80, Math.max(35, Math.floor(width / 15)));
      const dust = Array.from({ length: dustCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.4 + 0.1,
        color: ['#c084fc', '#38bdf8', '#f472b6', '#e0e7ff'][Math.floor(Math.random() * 4)],
      }));

      const renderCosmic = () => {
        ctx.clearRect(0, 0, width, height);

        for (const d of dust) {
          d.y -= d.speed;
          d.x += Math.sin(d.y * 0.01) * 0.3;

          ctx.beginPath();
          ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
          ctx.fillStyle = d.color;
          ctx.globalAlpha = d.alpha;
          ctx.shadowBlur = 8;
          ctx.shadowColor = d.color;
          ctx.fill();

          if (d.y < -10) {
            d.y = height + 10;
            d.x = Math.random() * width;
          }
        }

        animationId = requestAnimationFrame(renderCosmic);
      };

      renderCosmic();
    }

    // ==========================================
    // 10. SAKURA PETALS (Pétalas de Flor de Cerejeira)
    // ==========================================
    else if (effect === 'sakura_petals') {
      const petalCount = Math.min(40, Math.max(15, Math.floor(width / 30)));
      const petals = Array.from({ length: petalCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 10 + 8,
        vy: Math.random() * 1.2 + 0.8,
        vx: Math.random() * 1 + 0.2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        swaySpeed: Math.random() * 0.03 + 0.02,
        swayPhase: Math.random() * Math.PI * 2,
      }));

      const renderSakura = () => {
        ctx.clearRect(0, 0, width, height);

        for (const p of petals) {
          p.swayPhase += p.swaySpeed;
          p.y += p.vy;
          p.x += p.vx + Math.sin(p.swayPhase) * 1.2;
          p.rot += p.rotSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);

          // Delicate petal shape
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.8, -p.size * 0.3, p.size * 0.3, p.size * 0.7);
          ctx.quadraticCurveTo(0, p.size, -p.size * 0.3, p.size * 0.7);
          ctx.quadraticCurveTo(-p.size * 0.8, -p.size * 0.3, 0, -p.size);
          ctx.fillStyle = '#f472b6';
          ctx.globalAlpha = 0.75;
          ctx.fill();

          ctx.restore();

          if (p.y > height + 25) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        }

        animationId = requestAnimationFrame(renderSakura);
      };

      renderSakura();
    }

    // ==========================================
    // EFFECT: MATRIX DIGITAL RAIN
    // ==========================================
    else if (effect === 'matrix') {
      const fontSize = 16;
      const columns = Math.floor(width / fontSize);
      const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));
      const chars = '0123456789ABCDEF$#@%&*+-=<>日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';

      const renderMatrix = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = chars.charAt(Math.floor(Math.random() * chars.length));
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          ctx.fillStyle = '#bbf7d0';
          ctx.fillText(char, x, y);

          ctx.fillStyle = '#10b981';
          ctx.fillText(chars.charAt(Math.floor(Math.random() * chars.length)), x, y - fontSize);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }

        animationId = requestAnimationFrame(renderMatrix);
      };

      ctx.clearRect(0, 0, width, height);
      renderMatrix();
    }

    // ==========================================
    // EFFECT: STARS & SHOOTING METEORS
    // ==========================================
    else if (effect === 'stars') {
      const starCount = Math.min(120, Math.floor((width * height) / 8000));
      const stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
      }));

      interface Meteor {
        x: number;
        y: number;
        length: number;
        speed: number;
        alpha: number;
        angle: number;
      }
      let meteors: Meteor[] = [];

      const spawnMeteor = () => {
        meteors.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.3,
          length: Math.random() * 80 + 50,
          speed: Math.random() * 10 + 12,
          alpha: 1,
          angle: Math.PI / 4,
        });
      };

      let meteorTimer = 0;

      const renderStars = () => {
        ctx.clearRect(0, 0, width, height);

        for (const star of stars) {
          star.alpha += star.speed;
          if (star.alpha > 1 || star.alpha < 0.1) {
            star.speed = -star.speed;
          }

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.alpha)})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#93c5fd';
          ctx.fill();
        }

        meteorTimer++;
        if (meteorTimer % 180 === 0 && Math.random() > 0.3) {
          spawnMeteor();
        }

        meteors = meteors.filter((m) => m.alpha > 0);
        for (const m of meteors) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          const endX = m.x - Math.cos(m.angle) * m.length;
          const endY = m.y - Math.sin(m.angle) * m.length;
          const gradient = ctx.createLinearGradient(m.x, m.y, endX, endY);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
          gradient.addColorStop(0.3, `rgba(147, 197, 253, ${m.alpha * 0.7})`);
          gradient.addColorStop(1, 'transparent');
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2.5;
          ctx.lineTo(endX, endY);
          ctx.stroke();
          ctx.restore();

          m.x += Math.cos(m.angle) * m.speed;
          m.y += Math.sin(m.angle) * m.speed;
          m.alpha -= 0.015;
        }

        animationId = requestAnimationFrame(renderStars);
      };

      renderStars();
    }

    // ==========================================
    // EFFECT: NANOTECH PLEXUS NETWORK
    // ==========================================
    else if (effect === 'nanotech') {
      const nodeCount = Math.min(55, Math.floor(width / 30));
      const nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        radius: Math.random() * 2 + 1.5,
      }));

      const maxDistance = 140;

      const renderNanotech = () => {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i];
          a.x += a.vx;
          a.y += a.vy;

          if (a.x < 0 || a.x > width) a.vx = -a.vx;
          if (a.y < 0 || a.y > height) a.vy = -a.vy;

          ctx.beginPath();
          ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#0284c7';
          ctx.fill();

          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);

            if (dist < maxDistance) {
              const alpha = (1 - dist / maxDistance) * 0.45;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        animationId = requestAnimationFrame(renderNanotech);
      };

      renderNanotech();
    }

    // ==========================================
    // EFFECT: CYBER RAIN (Gotas Luminosas)
    // ==========================================
    else if (effect === 'rain') {
      const dropCount = Math.min(90, Math.floor(width / 15));
      const rainDrops = Array.from({ length: dropCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 25 + 15,
        speed: Math.random() * 12 + 10,
        alpha: Math.random() * 0.4 + 0.3,
      }));

      const renderRain = () => {
        ctx.clearRect(0, 0, width, height);

        ctx.lineWidth = 1.5;
        for (const drop of rainDrops) {
          drop.y += drop.speed;
          if (drop.y > height) {
            drop.y = -drop.length;
            drop.x = Math.random() * width;
          }

          const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(1, `rgba(56, 189, 248, ${drop.alpha})`);

          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x, drop.y + drop.length);
          ctx.strokeStyle = gradient;
          ctx.stroke();
        }

        animationId = requestAnimationFrame(renderRain);
      };

      renderRain();
    }

    // ==========================================
    // EFFECT: FIREFLIES (Vaga-lumes Orgânicos)
    // ==========================================
    else if (effect === 'fireflies') {
      const flyCount = Math.min(45, Math.floor(width / 25));
      const fireflies = Array.from({ length: flyCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1.5,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.05 + 0.02,
      }));

      const renderFireflies = () => {
        ctx.clearRect(0, 0, width, height);

        for (const f of fireflies) {
          f.x += f.vx;
          f.y += f.vy;
          f.pulse += f.pulseSpeed;

          if (f.x < 0 || f.x > width) f.vx = -f.vx;
          if (f.y < 0 || f.y > height) f.vy = -f.vy;

          const glowAlpha = (Math.sin(f.pulse) + 1) / 2;

          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius * (glowAlpha * 0.5 + 0.8), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(250, 204, 21, ${glowAlpha * 0.8 + 0.2})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#facc15';
          ctx.fill();
        }

        animationId = requestAnimationFrame(renderFireflies);
      };

      renderFireflies();
    }

    // ==========================================
    // EFFECT: BUBBLES (Bolhas Cartoon Flutuantes)
    // ==========================================
    else if (effect === 'bubbles') {
      const bubbleCount = Math.min(30, Math.floor(width / 35));
      const bubbles = Array.from({ length: bubbleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height + height,
        radius: Math.random() * 18 + 8,
        speed: Math.random() * 1.5 + 0.8,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.04 + 0.02,
        color: ['rgba(56, 189, 248, 0.35)', 'rgba(236, 72, 153, 0.3)', 'rgba(251, 191, 36, 0.35)', 'rgba(168, 85, 247, 0.35)'][Math.floor(Math.random() * 4)],
      }));

      const renderBubbles = () => {
        ctx.clearRect(0, 0, width, height);

        for (const b of bubbles) {
          b.y -= b.speed;
          b.wobble += b.wobbleSpeed;
          const wobbleX = b.x + Math.sin(b.wobble) * 20;

          ctx.beginPath();
          ctx.arc(wobbleX, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // Bubble highlight reflection
          ctx.beginPath();
          ctx.arc(wobbleX - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();

          if (b.y < -50) {
            b.y = height + 50;
            b.x = Math.random() * width;
          }
        }

        animationId = requestAnimationFrame(renderBubbles);
      };

      renderBubbles();
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [effect]);

  if (effect === 'none') return null;

  if (effect === 'cyber_grid') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-5 overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-pink-950/40" />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(236, 72, 153, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(236, 72, 153, 0.5) 1px, transparent 1px)',
            backgroundSize: '60px 40px',
            transform: 'perspective(400px) rotateX(65deg) scale(1.5)',
            transformOrigin: 'bottom center',
          }}
        />
        <div className="absolute inset-x-0 bottom-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee]" />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-5 w-full h-full ${className}`}
    />
  );
};
