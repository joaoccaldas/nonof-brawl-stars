import { useEffect, useRef } from 'react';

/**
 * Starfield — a slow drifting particle background with depth parallax.
 * Canvas is pointer-events:none and pinned at the bottom z-index.
 */
export default function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let stars = [];
    let raf = 0;
    let dpr = Math.min(2, window.devicePixelRatio || 1);

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = seedStars();
    }

    function seedStars() {
      const density = Math.round((width * height) / 7000); // ~290 stars at 1440x900
      const out = [];
      for (let i = 0; i < density; i++) {
        const depth = Math.random(); // 0..1
        out.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.3 + depth * 1.6,
          a: 0.2 + depth * 0.6,
          vx: (Math.random() - 0.5) * 0.03 * (1 + depth),
          vy: (Math.random() - 0.5) * 0.03 * (1 + depth),
          tw: Math.random() * Math.PI * 2,
          depth
        });
      }
      return out;
    }

    function tick(t) {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -2) s.x = width + 2;
        if (s.x > width + 2) s.x = -2;
        if (s.y < -2) s.y = height + 2;
        if (s.y > height + 2) s.y = -2;
        const twinkle = 0.6 + 0.4 * Math.sin(t * 0.0009 + s.tw);
        const a = s.a * twinkle;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        const tint = s.depth > 0.8
          ? `rgba(164, 91, 255, ${a})`
          : s.depth > 0.55
          ? `rgba(141, 183, 255, ${a})`
          : `rgba(220, 230, 255, ${a * 0.8})`;
        ctx.fillStyle = tint;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
