import { useEffect, useState } from 'react';

export default function HolographicDepth() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[80]">
      {/* Mouse-following glow */}
      <div 
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
          left: `calc(50% + ${mousePos.x * 100}px)`,
          top: `calc(50% + ${mousePos.y * 100}px)`,
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.3s ease-out, top 0.3s ease-out'
        }}
      />
      
      {/* Depth layers */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at ${50 + mousePos.x * 5}% ${50 + mousePos.y * 5}%, 
              rgba(6, 182, 212, 0.05) 0%, 
              transparent 50%
            )
          `,
          transition: 'background 0.5s ease-out'
        }}
      />
      
      {/* Subtle grid for depth perception */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          transform: `perspective(1000px) rotateX(${mousePos.y * 2}deg) rotateY(${-mousePos.x * 2}deg)`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease-out'
        }}
      />
    </div>
  );
}
