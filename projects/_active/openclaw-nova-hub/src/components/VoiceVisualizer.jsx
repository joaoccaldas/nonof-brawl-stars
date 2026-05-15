import { useEffect, useRef } from 'react';

export function VoiceVisualizer({ isActive, isSpeaking }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isActive && !isSpeaking) {
        // Idle state - subtle pulse
        phase += 0.02;
        const radius = 30 + Math.sin(phase) * 5;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)'; // synapse-cyan
        ctx.lineWidth = 2;
        ctx.stroke();
        
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // Active/Speaking state - animated rings
      phase += 0.05;
      const numRings = isSpeaking ? 5 : 3;
      
      for (let i = 0; i < numRings; i++) {
        const offset = (i * Math.PI * 2) / numRings + phase;
        const radius = 20 + i * 15 + (isSpeaking ? Math.sin(phase * 2 + i) * 10 : 0);
        const alpha = isSpeaking ? 0.6 - i * 0.1 : 0.4 - i * 0.1;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(0, radius), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${Math.max(0, alpha)})`;
        ctx.lineWidth = isSpeaking ? 3 : 2;
        ctx.stroke();
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, isSpeaking ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = isSpeaking ? 'rgba(6, 182, 212, 1)' : 'rgba(6, 182, 212, 0.7)';
      ctx.fill();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={120}
      className="rounded-full"
    />
  );
}
