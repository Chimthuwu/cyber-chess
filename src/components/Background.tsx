import React, { useEffect, useRef } from 'react';

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Deep Space Gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#020205');
      skyGradient.addColorStop(0.5, '#0a0a1a');
      skyGradient.addColorStop(1, '#050508');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Synthwave Sun (Horizon)
      const sunY = canvas.height * 0.55;
      const sunRadius = Math.min(canvas.width, canvas.height) * 0.25;
      
      const sunGradient = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
      sunGradient.addColorStop(0, '#ff00ff');
      sunGradient.addColorStop(0.5, '#ff0080');
      sunGradient.addColorStop(1, '#ffaa00');
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, sunY, sunRadius, 0, Math.PI, true);
      ctx.fillStyle = sunGradient;
      ctx.shadowBlur = 100;
      ctx.shadowColor = '#ff00ff';
      ctx.fill();
      
      // Sun segments (retro lines)
      ctx.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 12; i++) {
        const h = 2 + i * 1.5;
        const y = sunY - sunRadius + (i * (sunRadius / 10));
        if (y < sunY) {
          ctx.fillRect(canvas.width / 2 - sunRadius, y, sunRadius * 2, h);
        }
      }
      ctx.restore();

      // 3. Horizon Glow
      const horizonGlow = ctx.createLinearGradient(0, sunY - 50, 0, sunY + 50);
      horizonGlow.addColorStop(0, 'transparent');
      horizonGlow.addColorStop(0.5, 'rgba(0, 243, 255, 0.2)');
      horizonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, sunY - 50, canvas.width, 100);

      // 4. Moving Perspective Grid
      const gridY = sunY;
      const gridHeight = canvas.height - gridY;
      const gridSpeed = (time * 150) % 100;
      
      ctx.save();
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 1;
      
      // Horizontal lines (moving)
      for (let i = 0; i < 15; i++) {
        const pos = (i * 40 + gridSpeed) / 600;
        const y = gridY + (Math.pow(pos, 2.5) * gridHeight);
        if (y > gridY && y < canvas.height) {
          ctx.globalAlpha = Math.pow(pos, 1.5) * 0.4;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Vertical lines (perspective)
      const centerX = canvas.width / 2;
      const numLines = 20;
      for (let i = -numLines; i <= numLines; i++) {
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.moveTo(centerX + (i * 40), gridY);
        ctx.lineTo(centerX + (i * 800), canvas.height);
        ctx.stroke();
      }
      ctx.restore();

      // 5. Floating Digital Particles
      particles.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.globalAlpha = p.opacity * (Math.sin(time * 2 + p.x) * 0.5 + 0.5);
        ctx.fillStyle = i % 2 === 0 ? '#00f3ff' : '#ff00ff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none opacity-60"
    />
  );
};

export default Background;
