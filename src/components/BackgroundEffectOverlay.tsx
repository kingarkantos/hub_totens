import React, { useEffect, useRef } from 'react';

export type BackgroundEffectId =
  | 'none'
  | 'matrix'
  | 'stars'
  | 'rain'
  | 'nanotech'
  | 'fireflies'
  | 'cyber_grid'
  | 'bubbles';

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
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // EFFECT 1: MATRIX DIGITAL RAIN
    if (effect === 'matrix') {
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

          // Head of the drop is white-green, tail is emerald green
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

    // EFFECT 2: STARS & SHOOTING METEORS
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

        // Draw twinkling stars
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

        // Spawn occasional meteor
        meteorTimer++;
        if (meteorTimer % 180 === 0 && Math.random() > 0.3) {
          spawnMeteor();
        }

        // Draw meteors
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

    // EFFECT 3: NANOTECH PLEXUS NETWORK
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

        // Update positions
        for (const node of nodes) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;

          // Draw node
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#22d3ee';
          ctx.fill();
        }

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDistance) {
              const alpha = (1 - dist / maxDistance) * 0.35;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
              ctx.lineWidth = 1.2;
              ctx.stroke();
            }
          }
        }

        animationId = requestAnimationFrame(renderNanotech);
      };

      renderNanotech();
    }

    // EFFECT 4: CYBER RAIN
    else if (effect === 'rain') {
      const dropCount = Math.min(90, Math.floor(width / 15));
      const drops = Array.from({ length: dropCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 25 + 15,
        speed: Math.random() * 12 + 14,
        alpha: Math.random() * 0.5 + 0.2,
      }));

      const renderRain = () => {
        ctx.clearRect(0, 0, width, height);

        for (const drop of drops) {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.length);
          ctx.strokeStyle = `rgba(56, 189, 248, ${drop.alpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= 2;

          if (drop.y > height) {
            drop.y = -drop.length;
            drop.x = Math.random() * width;
          }
        }

        animationId = requestAnimationFrame(renderRain);
      };

      renderRain();
    }

    // EFFECT 5: FIREFLIES / GOLDEN ORBS
    else if (effect === 'fireflies') {
      const count = 45;
      const flies = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 2,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.8 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
      }));

      const renderFlies = () => {
        ctx.clearRect(0, 0, width, height);

        for (const fly of flies) {
          fly.angle += (Math.random() - 0.5) * 0.2;
          fly.x += Math.cos(fly.angle) * fly.speed;
          fly.y += Math.sin(fly.angle) * fly.speed;

          if (fly.x < -20) fly.x = width + 20;
          if (fly.x > width + 20) fly.x = -20;
          if (fly.y < -20) fly.y = height + 20;
          if (fly.y > height + 20) fly.y = -20;

          fly.alpha += fly.pulseSpeed;
          if (fly.alpha > 0.9 || fly.alpha < 0.15) {
            fly.pulseSpeed = -fly.pulseSpeed;
          }

          ctx.beginPath();
          ctx.arc(fly.x, fly.y, fly.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 191, 36, ${Math.abs(fly.alpha)})`;
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#f59e0b';
          ctx.fill();
        }

        animationId = requestAnimationFrame(renderFlies);
      };

      renderFlies();
    }

    // EFFECT 6: CARTOON BUBBLES
    else if (effect === 'bubbles') {
      const count = 35;
      const bubbles = Array.from({ length: count }, () => ({
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

          // Highlight
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
        {/* Synthwave 3D Perspective Grid */}
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
