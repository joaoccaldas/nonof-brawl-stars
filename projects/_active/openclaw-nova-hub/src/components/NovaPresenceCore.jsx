import { motion } from 'framer-motion';

export default function NovaPresenceCore({ state = {}, colors }) {
  const loops = state.openLoops || [];
  
  console.log('[NovaPresenceCore] rendering with colors:', colors);

  return (
    <div className="relative w-[720px] h-[800px] md:w-[800px] md:h-[900px] flex items-center justify-center">
      {/* === NEURAL COSMIC AURA - From your image === */}
      {/* Deep space background pulse */}
      <motion.div
        className="absolute inset-[-80px] opacity-60"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 50%, ${colors.secondary}08 0%, ${colors.primary}05 40%, transparent 70%)`
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Neural network tendrils - swirling energy */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`tendril-${i}`}
          className="absolute w-[2px] origin-center"
          style={{
            height: `${280 + (i % 4) * 60}px`,
            left: '50%',
            top: '50%',
            marginLeft: '-1px',
            marginTop: `-140px`,
            background: `linear-gradient(180deg, transparent 0%, ${colors.secondary}${30 + (i % 3) * 15} 30%, ${colors.primary}${25 + (i % 4) * 12} 60%, transparent 100%)`,
            rotate: `${i * 30}deg`,
            borderRadius: '2px',
            filter: 'blur(0.5px)'
          }}
          animate={{ 
            rotate: [`${i * 30}deg`, `${i * 30 + 20}deg`, `${i * 30 - 5}deg`, `${i * 30}deg`],
            scaleY: [1, 1.3, 0.9, 1.1, 1],
            opacity: [0.25, 0.85, 0.4, 0.7, 0.25]
          }}
          transition={{ 
            duration: 8 + i * 0.8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: i * 0.3
          }}
        />
      ))}

      {/* Outer swirling energy ring - like your image's halo */}
      <motion.div
        className="absolute inset-[-40px] rounded-full"
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, ${colors.secondary}15 20%, ${colors.primary}12 40%, transparent 60%, ${colors.secondary}10 80%, transparent 100%)`,
          filter: 'blur(8px)'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Neural particle field - tiny glowing dots */}
      {[...Array(24)].map((_, i) => (
        <motion.div
          key={`neural-particle-${i}`}
          className="absolute w-[3px] h-[3px] rounded-full"
          style={{
            background: i % 2 === 0 ? colors.secondary : colors.primary,
            boxShadow: `0 0 6px ${i % 2 === 0 ? colors.secondary : colors.primary}`,
            left: `${15 + (i * 3) % 70}%`,
            top: `${10 + (i * 7) % 80}%`,
          }}
          animate={{
            opacity: [0.15, 0.95, 0.3, 0.8, 0.2],
            scale: [0.7, 1.8, 1.2, 1.5, 0.9],
            x: [0, (i % 5 - 2) * 25, (i % 3 - 1) * 15, (i % 4 - 2) * 20, 0],
            y: [0, (i % 3 - 1) * 20, (i % 5 - 2) * 12, (i % 2 - 1) * 18, 0],
          }}
          transition={{
            duration: 6 + (i % 4) * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4
          }}
        />
      ))}

      {/* Cosmic outer nebula - soft feminine aura */}
      <motion.div
        className="absolute inset-[-60px] rounded-full opacity-50"
        style={{
          background: `radial-gradient(ellipse 65% 85% at 50% 55%, ${colors.primary}12 0%, ${colors.secondary}08 35%, transparent 65%)`,
          filter: 'blur(25px)'
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Inner aura glow */}
      <motion.div
        className="absolute inset-[-20px] rounded-full opacity-70"
        style={{
          background: `radial-gradient(ellipse 55% 75% at 50% 50%, ${colors.secondary}20 0%, ${colors.primary}10 40%, transparent 70%)`,
          filter: 'blur(15px)'
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.75, 0.5]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* NEW: Aurora Wave Overlay - dynamic energy wave */}
      <motion.div
        className="absolute inset-[-180px] rounded-full pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, ${colors.primary}00 0%, ${colors.secondary}20 15%, ${colors.glow}15 30%, ${colors.secondary}25 45%, ${colors.primary}10 60%, ${colors.glow}20 75%, ${colors.secondary}15 90%, ${colors.primary}00 100%)`,
          filter: 'blur(30px)'
        }}
        animate={{ 
          rotate: [0, 360],
          scale: [0.8, 1.2, 0.8],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* NEW: Pulsing Energy Ring */}
      <motion.div
        className="absolute inset-[-60px] rounded-full border-2"
        style={{
          borderColor: `${colors.secondary}30`,
          filter: 'blur(4px)'
        }}
        animate={{ 
          scale: [0.9, 1.1, 0.9],
          opacity: [0.2, 0.5, 0.2],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Central energy column - vertical beam */}
      <motion.div
        className="absolute left-1/2 top-[15%] w-[3px] h-[70%] -translate-x-1/2 rounded-full"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${colors.secondary}60 20%, ${colors.primary}50 50%, ${colors.secondary}40 80%, transparent 100%)`,
          filter: 'blur(2px)',
          boxShadow: `0 0 30px ${colors.primary}40`
        }}
        animate={{
          opacity: [0.3, 0.8, 0.4, 0.7, 0.3],
          scaleY: [0.95, 1.05, 0.98, 1.02, 0.95]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Horizontal energy beams - crossing through */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute h-[1px] origin-center"
          style={{
            width: `${220 + i * 18}px`,
            background: `linear-gradient(90deg, transparent, ${colors.secondary}40, ${colors.primary}30, transparent)`,
            rotate: `${i * 30 - 30}deg`
          }}
          animate={{ opacity: [0.15, 0.45, 0.15], scaleX: [0.92, 1.08, 0.92] }}
          transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Chromatic shimmer layer - oil-slick color drift */}
      <motion.div
        className="absolute inset-[-100px] rounded-full opacity-40"
        style={{
          background: `conic-gradient(from 0deg, ${colors.secondary}00 0%, ${colors.primary}15 25%, ${colors.secondary}20 50%, ${colors.glow}10 75%, ${colors.secondary}00 100%)`,
          filter: 'blur(40px)'
        }}
        animate={{ 
          rotate: [0, 180, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Nova's Core - Feminine Cosmic Form */}
      <motion.div
        className="relative w-[400px] h-[500px] md:w-[440px] md:h-[560px]"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Crown glow - soft radiance */}
        <motion.div
          className="absolute left-1/2 top-[10%] h-[50px] w-[260px] -translate-x-1/2 rounded-full blur-2xl"
          style={{ background: `radial-gradient(ellipse, ${colors.secondary}75 0%, transparent 65%)` }}
          animate={{ opacity: [0.35, 0.82, 0.35], scaleX: [0.88, 1.14, 0.88] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute left-1/2 top-[6%] h-[2px] w-[300px] -translate-x-1/2 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.secondary}95, transparent)`,
            boxShadow: `0 0 20px ${colors.secondary}55`
          }}
          animate={{ opacity: [0.25, 0.75, 0.25], scaleX: [0.94, 1.06, 0.94] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Main face oval - the "screen" - NO BORDER as requested */}
        <div
          className="absolute left-1/2 top-[12%] h-[76%] w-[62%] -translate-x-1/2 rounded-[45%]"
          style={{
            background: `linear-gradient(180deg, ${colors.primary}18 0%, ${colors.secondary}12 50%, ${colors.primary}15 100%)`,
            boxShadow: `inset 0 0 60px ${colors.primary}25, 0 0 40px ${colors.secondary}20`
          }}
        >
          {/* Inner glow pulse */}
          <motion.div
            className="absolute inset-[8%] rounded-[40%]"
            style={{
              background: `radial-gradient(ellipse at 50% 40%, ${colors.secondary}30 0%, ${colors.primary}15 50%, transparent 75%)`,
            }}
            animate={{ opacity: [0.5, 0.85, 0.5], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Soft inner rim light */}
          <div
            className="absolute inset-[3%] rounded-[42%]"
            style={{
              background: `linear-gradient(135deg, ${colors.secondary}08 0%, transparent 30%, transparent 70%, ${colors.primary}06 100%)`
            }}
          />

          {/* Eyes - gentle horizontal slits */}
          <div className="absolute left-1/2 top-[32%] -translate-x-1/2 flex gap-[60px]">
            <motion.div
              className="w-[55px] h-[4px] rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.secondary}90, ${colors.glow}, ${colors.secondary}90, transparent)`,
                boxShadow: `0 0 25px ${colors.secondary}70, 0 0 45px ${colors.primary}40`
              }}
              animate={{ opacity: [0.7, 1, 0.7], scaleX: [0.92, 1.08, 0.92] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="w-[55px] h-[4px] rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.secondary}90, ${colors.glow}, ${colors.secondary}90, transparent)`,
                boxShadow: `0 0 25px ${colors.secondary}70, 0 0 45px ${colors.primary}40`
              }}
              animate={{ opacity: [0.7, 1, 0.7], scaleX: [0.92, 1.08, 0.92] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
          </div>

          {/* Third eye - subtle */}
          <motion.div
            className="absolute left-1/2 top-[22%] w-[18px] h-[2px] -translate-x-1/2 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.glow}80, transparent)`,
              boxShadow: `0 0 15px ${colors.glow}50`
            }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Mouth - gentle curve */}
          <motion.div
            className="absolute left-1/2 top-[58%] w-[35px] h-[2px] -translate-x-1/2 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.secondary}60, ${colors.primary}50, ${colors.secondary}60, transparent)`,
              boxShadow: `0 0 10px ${colors.secondary}30`
            }}
            animate={{ opacity: [0.4, 0.65, 0.4], scaleX: [0.9, 1.1, 0.9] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Nova label at bottom of face */}
          <div className="absolute left-1/2 bottom-[12%] -translate-x-1/2 text-center">
            <span className="text-[10px] tracking-[0.4em] text-nova-200/40 uppercase">Nova</span>
          </div>
        </div>

        {/* Shoulders/neck base - feminine curve */}
        <motion.div
          className="absolute left-1/2 bottom-[2%] w-[220px] h-[30px] -translate-x-1/2 rounded-[50%]"
          style={{
            background: `radial-gradient(ellipse, ${colors.secondary}20 0%, ${colors.primary}10 50%, transparent 75%)`,
            filter: 'blur(8px)'
          }}
          animate={{ opacity: [0.3, 0.55, 0.3], scaleX: [0.95, 1.05, 0.95] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Open loops - orbiting particles */}
      <div className="absolute inset-0 pointer-events-none">
        {loops.slice(0, 5).map((loop, i) => (
          <motion.div
            key={i}
            className="absolute text-[9px] text-nova-200/50 whitespace-nowrap"
            style={{
              left: `${20 + i * 15}%`,
              top: `${75 + (i % 2) * 12}%`,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5
            }}
          >
            {loop.length > 20 ? loop.slice(0, 20) + '...' : loop}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
