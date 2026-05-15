import { motion } from 'framer-motion';

export default function TechLoader({ text = "Loading" }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hexagon spinner */}
      <div className="relative w-16 h-16">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* Outer hex */}
          <motion.polygon
            points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
            fill="none"
            stroke="url(#hexGradient)"
            strokeWidth="2"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: '50px 50px' }}
          />
          
          {/* Inner hex */}
          <motion.polygon
            points="50,20 80,35 80,65 50,80 20,65 20,35"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1"
            strokeOpacity="0.5"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: '50px 50px' }}
          />
        </svg>
        
        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 bg-synapse-cyan rounded-full"
          style={{ marginLeft: '-4px', marginTop: '-4px' }}
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      
      {/* Typewriter text */}
      <TypewriterText text={text} />
    </div>
  );
}

function TypewriterText({ text }) {
  const chars = text.split('');
  
  return (
    <div className="flex items-center gap-1">
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="text-xs text-synapse-cyan font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
      <motion.span
        className="text-xs text-synapse-cyan"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        _
      </motion.span>
    </div>
  );
}
