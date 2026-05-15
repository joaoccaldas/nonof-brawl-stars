import { motion } from 'framer-motion';

export default function HUDBrackets() {
  const cornerSize = 40;
  const lineThickness = 2;

  return (
    <div className="fixed inset-0 pointer-events-none z-[90]">
      {/* Top Left */}
      <div className="absolute top-4 left-4" style={{ width: cornerSize, height: cornerSize }}>
        <motion.div
          className="absolute top-0 left-0 bg-synapse-cyan/60"
          style={{ width: cornerSize * 0.6, height: lineThickness }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-0 left-0 bg-synapse-cyan/60"
          style={{ width: lineThickness, height: cornerSize * 0.6 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
        />
      </div>

      {/* Top Right */}
      <div className="absolute top-4 right-4" style={{ width: cornerSize, height: cornerSize }}>
        <motion.div
          className="absolute top-0 right-0 bg-synapse-cyan/60"
          style={{ width: cornerSize * 0.6, height: lineThickness }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
        <motion.div
          className="absolute top-0 right-0 bg-synapse-cyan/60"
          style={{ width: lineThickness, height: cornerSize * 0.6 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
        />
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-4 left-4" style={{ width: cornerSize, height: cornerSize }}>
        <motion.div
          className="absolute bottom-0 left-0 bg-synapse-cyan/60"
          style={{ width: cornerSize * 0.6, height: lineThickness }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-0 left-0 bg-synapse-cyan/60"
          style={{ width: lineThickness, height: cornerSize * 0.6 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        />
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-4 right-4" style={{ width: cornerSize, height: cornerSize }}>
        <motion.div
          className="absolute bottom-0 right-0 bg-synapse-cyan/60"
          style={{ width: cornerSize * 0.6, height: lineThickness }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
        />
        <motion.div
          className="absolute bottom-0 right-0 bg-synapse-cyan/60"
          style={{ width: lineThickness, height: cornerSize * 0.6 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
        />
      </div>

      {/* Center targeting reticle (subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="w-20 h-20 border border-synapse-cyan/20 rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    </div>
  );
}
