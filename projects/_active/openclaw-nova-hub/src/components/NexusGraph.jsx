import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_COLORS = {
  'project': '#ffb547', // Mission gold
  'contact': '#8cff66', // Human green
  'file': '#46e0ff',    // Asset blue
  'knowledge': '#a45bff' // Concept violet
};

const STATUS_COLORS = {
  active: '#8cff66',
  prototyping: '#46e0ff',
  validating: '#ffb547',
  paused: '#ff5bd8',
  captured: '#a45bff',
  completed: '#5a92ff',
  archived: '#7a819e',
  discarded: '#ff6b6b',
  unknown: '#a0a6bd'
};

export default function NexusGraph() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const fgRef = useRef();

  useEffect(() => {
    fetch('/nexus-data.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Nexus load failed:', err);
        setLoading(false);
      });
  }, []);

  const getNodeObject = useCallback((node) => {
    const color = TYPE_COLORS[node.type] || '#ffffff';
    const isHovered = hoverNode === node;
    const isSelected = selectedNode === node;
    
    const group = new THREE.Group();

    // Size based on importance
    let size = node.val || 5;
    if (isHovered || isSelected) size *= 1.4;

    // 1. Core Mesh
    let geometry;
    if (node.type === 'contact') {
      geometry = new THREE.SphereGeometry(size, 12, 12); // Reduced segments
    } else if (node.type === 'project') {
      geometry = new THREE.IcosahedronGeometry(size, 1); // Reduced detail
    } else if (node.type === 'file') {
      geometry = new THREE.BoxGeometry(size * 1.2, size * 1.2, size * 1.2);
    } else {
      geometry = new THREE.OctahedronGeometry(size);
    }

    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: isHovered || isSelected ? 2.5 : 0.6,
      transparent: true,
      opacity: 0.9,
      shininess: 100
    });

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // 2. Halo/Glow
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(size * 2, 8, 8), // Minimal segments
      new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: isHovered || isSelected ? 0.3 : 0.05,
        blending: THREE.AdditiveBlending
      })
    );
    group.add(halo);

    // 3. Label - Only render if high priority or hovered/selected to save performance
    const shouldShowLabel = isHovered || isSelected || (node.type === 'project' && node.val > 15) || (node.type === 'contact' && node.priority === 'high');
    
    if (shouldShowLabel) {
      const label = new SpriteText(node.name);
      label.color = '#ffffff';
      label.textHeight = (isHovered || isSelected) ? 8 : 5;
      label.position.set(0, size + 12, 0);
      label.backgroundColor = 'rgba(10, 12, 20, 0.8)';
      label.padding = 2;
      label.borderRadius = 4;
      group.add(label);
    }

    return group;
  }, [hoverNode, selectedNode]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    
    // Smooth camera transition
    const distance = 100;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node, 
      1200
    );
  };

  if (loading) return (
    <div className="w-full h-[750px] grid place-items-center bg-[#05070a] rounded-3xl overflow-hidden border border-white/5">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-synapse-cyan/30 border-t-synapse-cyan rounded-full animate-spin mx-auto mb-6" />
        <div className="text-nova-200 font-mono uppercase tracking-[0.4em] text-sm animate-pulse">Initializing Command Interface...</div>
      </div>
    </div>
  );

  // Add Atmospheric Fog
  useEffect(() => {
    if (!fgRef.current) return;
    const scene = fgRef.current.scene();
    scene.fog = new THREE.FogExp2(0x030408, 0.002);
  }, [loading]);

  return (
    <div className="w-full h-[800px] rounded-3xl overflow-hidden glass border border-white/10 relative">
      {/* HUD Header */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h2 className="text-3xl font-black text-white font-display tracking-tighter flex items-center gap-4">
           <div className="w-3 h-3 rounded-full bg-synapse-cyan animate-pulse shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
           MISSION CONTROL
        </h2>
        <p className="text-[10px] text-nova-400 font-mono uppercase tracking-[0.4em] mt-2">
           Unified Project & Personnel Topology
        </p>
      </div>

      {/* Type Legend */}
      <div className="absolute top-8 right-8 z-10 flex flex-col gap-3 items-end">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-3">
            <span className="text-[9px] uppercase tracking-[0.2em] text-nova-400 font-bold">{type}</span>
            <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ background: color, boxShadow: `0 0 10px ${color}66` }} />
          </div>
        ))}
      </div>

      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        backgroundColor="rgba(3, 4, 8, 1)"
        nodeThreeObject={getNodeObject}
        onNodeHover={setHoverNode}
        onNodeClick={handleNodeClick}
        
        // Organic Link Visuals
        linkCurvature={0.25}
        linkCurveResolution={16}
        linkWidth={link => link.type === 'involvement' ? 1.5 : 0.4}
        linkDashArray={link => link.type === 'involvement' ? [4, 2] : null}
        linkColor={link => {
          if (link.type === 'involvement') return '#8cff6666'; // Glowing green for people
          if (link.type === 'bridge') return '#ffffff88';      // Glowing white for thoughts
          if (link.type === 'containment') return '#ffb54722'; // Dimm mission link
          return 'rgba(255, 255, 255, 0.05)';
        }}
        linkDirectionalParticles={link => link.type === 'involvement' || link.type === 'bridge' ? 4 : 0}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={() => '#ffffff'}
      />

      {/* Control Board Overlay */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute right-6 top-24 bottom-6 w-80 glass rounded-2xl border border-white/10 p-6 z-20 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] uppercase tracking-widest text-nova-400" style={{ color: TYPE_COLORS[selectedNode.type] }}>
                {selectedNode.type}
              </span>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-nova-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{selectedNode.name}</h3>
            
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {selectedNode.type === 'project' && (
                <>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-nova-400">Status</div>
                    <div className="text-sm text-nova-100 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: selectedNode.data?.statusColor }} />
                      {selectedNode.data?.status}
                    </div>
                  </div>
                  {selectedNode.data?.oneLiner && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase tracking-widest text-nova-400">Description</div>
                      <div className="text-xs text-nova-200 leading-relaxed italic">"{selectedNode.data.oneLiner}"</div>
                    </div>
                  )}
                  {selectedNode.data?.nextStep && (
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <div className="text-[9px] uppercase tracking-widest text-amber-500 mb-1">Next Action</div>
                      <div className="text-xs text-nova-100">{selectedNode.data.nextStep}</div>
                    </div>
                  )}
                  <div className="pt-4 flex flex-col gap-2">
                    <button className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/5 text-xs text-nova-100 transition-colors flex items-center justify-center gap-2">
                      Open Mission Folder ↗
                    </button>
                    {selectedNode.data?.subDashboards?.length > 0 && (
                      <button className="w-full py-2.5 rounded-xl bg-synapse-cyan/10 hover:bg-synapse-cyan/20 border border-synapse-cyan/20 text-xs text-synapse-cyan transition-colors">
                        Launch Dashboard
                      </button>
                    )}
                  </div>
                </>
              )}

              {selectedNode.type === 'contact' && (
                <>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-nova-400">Role</div>
                    <div className="text-sm text-nova-100">{selectedNode.role}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-nova-400">Communication</div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-[10px] text-green-400 transition-colors">
                        WhatsApp
                      </button>
                      <button className="flex-1 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-[10px] text-blue-400 transition-colors">
                        Email
                      </button>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="text-[10px] uppercase tracking-widest text-nova-400 mb-2">Recent Context</div>
                    <div className="text-[10px] text-nova-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                      "Last seen in discussion about Nova Hub architecture..."
                    </div>
                  </div>
                </>
              )}

              {selectedNode.type === 'file' && (
                <>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-nova-400">Project</div>
                    <div className="text-sm text-nova-100">{selectedNode.project}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-nova-400">Footprint</div>
                    <div className="text-sm text-nova-100">{(selectedNode.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <div className="pt-4">
                    <button className="w-full py-2.5 rounded-xl bg-synapse-cyan/10 hover:bg-synapse-cyan/20 border border-synapse-cyan/20 text-xs text-synapse-cyan transition-colors">
                      Open in IDE
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .glass {
          background: rgba(10, 12, 20, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
