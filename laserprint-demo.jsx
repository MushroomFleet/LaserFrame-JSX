import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// LASER PRINT HOLOGRAM EFFECT DEMO
// Retro sci-fi UI construction effect inspired by Syndicate Wars
// ============================================================

const LaserBeam = ({ 
  originX, 
  originY, 
  targetX, 
  targetY, 
  color = '#00f0ff',
  duration = 150,
  delay = 0,
  onComplete,
  thickness = 2
}) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setVisible(true);
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(elapsed / duration, 1);
        setProgress(newProgress);
        
        if (newProgress < 1) {
          requestAnimationFrame(animate);
        } else {
          onComplete?.();
        }
      };
      
      requestAnimationFrame(animate);
    }, delay);
    
    return () => clearTimeout(startTimer);
  }, [delay, duration, onComplete]);
  
  if (!visible) return null;
  
  const currentX = originX + (targetX - originX) * progress;
  const currentY = originY + (targetY - originY) * progress;
  
  return (
    <g style={{ filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color})` }}>
      <line
        x1={originX}
        y1={originY}
        x2={currentX}
        y2={currentY}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
      <line
        x1={originX}
        y1={originY}
        x2={currentX}
        y2={currentY}
        stroke="#ffffff"
        strokeWidth={thickness * 0.4}
        strokeLinecap="round"
        opacity={0.8}
      />
      {progress > 0 && (
        <circle
          cx={currentX}
          cy={currentY}
          r={4}
          fill={color}
          opacity={0.9}
        />
      )}
    </g>
  );
};

const HologramPanel = ({
  x,
  y,
  width,
  height,
  originX,
  originY,
  color = '#00f0ff',
  delay = 0,
  speed = 1,
  onPrintComplete,
  title,
  children
}) => {
  const [phase, setPhase] = useState(0);
  const [edges, setEdges] = useState([]);
  const [fillOpacity, setFillOpacity] = useState(0);
  const [showContent, setShowContent] = useState(false);
  
  const corners = [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height }
  ];
  
  useEffect(() => {
    const timer = setTimeout(() => setPhase(1), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  const handleBeamComplete = useCallback((cornerIndex) => {
    setEdges(prev => [...prev, cornerIndex]);
    setPhase(p => p + 1);
  }, []);
  
  useEffect(() => {
    if (phase >= 5 && !showContent) {
      let startTime = Date.now();
      const animateFill = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / 300, 1);
        setFillOpacity(progress * 0.15);
        if (progress < 1) {
          requestAnimationFrame(animateFill);
        } else {
          setShowContent(true);
          onPrintComplete?.();
        }
      };
      requestAnimationFrame(animateFill);
    }
  }, [phase, showContent, onPrintComplete]);
  
  return (
    <g>
      {corners.map((corner, i) => (
        phase === i + 1 && (
          <LaserBeam
            key={`beam-${i}`}
            originX={originX}
            originY={originY}
            targetX={corner.x}
            targetY={corner.y}
            color={color}
            duration={80 / speed}
            onComplete={() => handleBeamComplete(i)}
          />
        )
      ))}
      
      {edges.map((edgeIndex) => {
        const start = corners[edgeIndex];
        const end = corners[(edgeIndex + 1) % 4];
        return (
          <g key={`edge-${edgeIndex}`}>
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={color}
              strokeWidth={2}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
            <rect
              x={start.x - 3}
              y={start.y - 3}
              width={6}
              height={6}
              fill={color}
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </g>
        );
      })}
      
      {phase >= 5 && (
        <>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={color}
            opacity={fillOpacity}
          />
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="none"
            stroke={color}
            strokeWidth={2}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
          {corners.map((corner, i) => (
            <rect
              key={i}
              x={corner.x - 4}
              y={corner.y - 4}
              width={8}
              height={8}
              fill={color}
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          ))}
        </>
      )}
      
      {showContent && title && (
        <text
          x={x + 12}
          y={y + 22}
          fill={color}
          fontSize={14}
          fontFamily="'Courier New', monospace"
          fontWeight="bold"
          style={{ 
            filter: `drop-shadow(0 0 4px ${color})`,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          {title}
        </text>
      )}
      
      {showContent && children && (
        <foreignObject
          x={x + 8}
          y={y + (title ? 32 : 8)}
          width={width - 16}
          height={height - (title ? 40 : 16)}
        >
          <div
            style={{
              color: color,
              fontFamily: "'Courier New', monospace",
              fontSize: 11,
              lineHeight: 1.5,
              opacity: 0.9
            }}
          >
            {children}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default function LaserPrintDemo() {
  const [activeTab, setActiveTab] = useState('briefing');
  const [key, setKey] = useState(0);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setKey(k => k + 1);
  };
  
  const originX = 450;
  const originY = 275;
  
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #030108 0%, #0a0620 50%, #050210 100%)',
      minHeight: '100vh',
      padding: 20,
      fontFamily: "'Courier New', monospace"
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes expandRing {
          0% { r: 12; opacity: 0.5; }
          100% { r: 36; opacity: 0; }
        }
        .tab-btn {
          background: transparent;
          border: 2px solid #00f0ff40;
          color: #00f0ff;
          padding: 10px 20px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .tab-btn:hover {
          background: #00f0ff15;
          border-color: #00f0ff;
          box-shadow: 0 0 20px #00f0ff40;
        }
        .tab-btn.active {
          background: #00f0ff20;
          border-color: #00f0ff;
          box-shadow: 0 0 30px #00f0ff50, inset 0 0 20px #00f0ff20;
        }
      `}</style>
      
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ 
          color: '#00f0ff',
          fontSize: 28,
          fontWeight: 'bold',
          letterSpacing: '0.3em',
          textShadow: '0 0 30px #00f0ff80, 0 0 60px #00f0ff40',
          margin: 0
        }}>
          SYNDICATE TERMINAL
        </h1>
        <div style={{
          color: '#8800ff',
          fontSize: 10,
          letterSpacing: '0.5em',
          marginTop: 8,
          opacity: 0.8
        }}>
          HOLOGRAPHIC INTERFACE v2.4.7
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
        {['briefing', 'equipment', 'cryovat'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          position: 'relative',
          width: 900,
          height: 550,
          backgroundColor: '#0a0612',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(0, 240, 255, 0.1), inset 0 0 120px rgba(136, 0, 255, 0.05)'
        }}>
          {/* Scanlines */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.15) 2px, rgba(0, 0, 0, 0.15) 4px)`,
            pointerEvents: 'none',
            zIndex: 1000
          }} />
          
          {/* Ambient glow */}
          <div style={{
            position: 'absolute',
            left: originX - 100,
            top: originY - 100,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          
          <svg key={key} width={900} height={550} style={{ position: 'absolute', zIndex: 10 }}>
            {/* Origin point */}
            <circle
              cx={originX}
              cy={originY}
              r={6}
              fill="#00f0ff"
              style={{ filter: 'drop-shadow(0 0 12px #00f0ff)', animation: 'pulse 1s ease-in-out infinite' }}
            />
            <circle
              cx={originX}
              cy={originY}
              r={12}
              fill="none"
              stroke="#00f0ff"
              strokeWidth={1}
              opacity={0.5}
            >
              <animate attributeName="r" values="12;36;12" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            
            {activeTab === 'briefing' && (
              <>
                <HologramPanel
                  x={30} y={30} width={380} height={180}
                  originX={originX} originY={originY}
                  color="#00f0ff" delay={0} speed={1.5}
                  title="Mission Briefing"
                >
                  <div style={{ padding: '4px 0' }}>
                    <div style={{ marginBottom: 6, color: '#ff00ff' }}>► PRIORITY: ALPHA</div>
                    <div style={{ marginBottom: 6 }}>Target: Professor Klein</div>
                    <div style={{ marginBottom: 6 }}>Location: Sector 7-G Industrial</div>
                    <div style={{ opacity: 0.7 }}>Objective: Extract subject before rival syndicate intercepts.</div>
                  </div>
                </HologramPanel>
                
                <HologramPanel
                  x={30} y={230} width={380} height={290}
                  originX={originX} originY={originY}
                  color="#8800ff" delay={500} speed={1.5}
                  title="Zone Map"
                >
                  <svg width="360" height="220" style={{ marginTop: 4 }}>
                    {[...Array(8)].map((_, i) => (
                      <g key={i}>
                        <line x1={0} y1={i * 27.5} x2={360} y2={i * 27.5} stroke="#8800ff" strokeWidth={0.5} opacity={0.3} />
                        <line x1={i * 45} y1={0} x2={i * 45} y2={220} stroke="#8800ff" strokeWidth={0.5} opacity={0.3} />
                      </g>
                    ))}
                    <rect x={50} y={30} width={60} height={40} fill="none" stroke="#00f0ff" strokeWidth={1} opacity={0.6} />
                    <rect x={150} y={50} width={80} height={60} fill="none" stroke="#00f0ff" strokeWidth={1} opacity={0.6} />
                    <rect x={260} y={20} width={50} height={80} fill="none" stroke="#00f0ff" strokeWidth={1} opacity={0.6} />
                    <rect x={80} y={120} width={100} height={50} fill="none" stroke="#00f0ff" strokeWidth={1} opacity={0.6} />
                    <rect x={200} y={140} width={70} height={60} fill="none" stroke="#00f0ff" strokeWidth={1} opacity={0.6} />
                    <circle cx={240} cy={170} r={12} fill="none" stroke="#ff0066" strokeWidth={2}>
                      <animate attributeName="r" values="12;16;12" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <text x={255} y={175} fill="#ff0066" fontSize={9}>TARGET</text>
                    <polygon points="100,180 95,190 105,190" fill="#00ff66" />
                    <polygon points="180,100 175,110 185,110" fill="#00ff66" />
                  </svg>
                </HologramPanel>
                
                <HologramPanel
                  x={440} y={30} width={430} height={490}
                  originX={originX} originY={originY}
                  color="#00f0ff" delay={900} speed={1.5}
                  title="Intel Feed"
                >
                  <div style={{ padding: '4px 0' }}>
                    {[
                      { time: '[12:47:23]', type: 'INTERCEPT', color: '#ffcc00', msg: 'Enemy patrol detected in grid 4-C. Recommend alternate route via maintenance tunnels.' },
                      { time: '[12:44:51]', type: 'ALERT', color: '#ff00ff', msg: 'Rival syndicate "EuroCorp" agents confirmed in sector. Armed response authorized.' },
                      { time: '[12:42:08]', type: 'UPDATE', color: '#00ff66', msg: 'Target confirmed at research facility. Security level: moderate. Window: 15 minutes.' },
                      { time: '[12:38:00]', type: 'MISSION START', color: '#00f0ff', msg: 'Agents deployed. Comm channel open. Good hunting, operatives.' }
                    ].map((item, i) => (
                      <div key={i} style={{ borderBottom: '1px solid #00f0ff30', paddingBottom: 10, marginBottom: 10 }}>
                        <div style={{ color: item.color, marginBottom: 4 }}>{item.time} {item.type}</div>
                        <div style={{ opacity: 0.8 }}>{item.msg}</div>
                      </div>
                    ))}
                  </div>
                </HologramPanel>
              </>
            )}
            
            {activeTab === 'equipment' && (
              <>
                <HologramPanel
                  x={30} y={30} width={240} height={490}
                  originX={originX} originY={originY}
                  color="#00f0ff" delay={0} speed={1.5}
                  title="Agent Roster"
                >
                  <div style={{ padding: '4px 0' }}>
                    {['SHOKAT', 'MENDEZ', 'YAKOVLEV', 'CHEN'].map((agent, i) => (
                      <div key={agent} style={{ padding: '10px 4px', borderBottom: '1px solid #00f0ff30', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, border: '2px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{i + 1}</div>
                        <div>
                          <div style={{ marginBottom: 2 }}>{agent}</div>
                          <div style={{ fontSize: 9, opacity: 0.6 }}>COMBAT READY</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </HologramPanel>
                
                <HologramPanel
                  x={300} y={30} width={270} height={280}
                  originX={originX} originY={originY}
                  color="#ff00ff" delay={500} speed={1.5}
                  title="Armoury"
                >
                  <div style={{ padding: '4px 0' }}>
                    {[
                      { name: 'UZI SMG', icon: '⌐', eq: true },
                      { name: 'MINIGUN', icon: '╦', eq: true },
                      { name: 'PERSUADERTRON', icon: '◎', eq: true },
                      { name: 'MEDIKIT', icon: '+', eq: false },
                      { name: 'EXPLOSIVES', icon: '◆', eq: false }
                    ].map((item, i) => (
                      <div key={item.name} style={{ padding: '8px 4px', borderBottom: '1px solid #ff00ff30', display: 'flex', alignItems: 'center', gap: 10, opacity: item.eq ? 1 : 0.5 }}>
                        <div style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</div>
                        <div>{item.name}</div>
                        {item.eq && <div style={{ marginLeft: 'auto', color: '#00ff66', fontSize: 9 }}>EQUIPPED</div>}
                      </div>
                    ))}
                  </div>
                </HologramPanel>
                
                <HologramPanel
                  x={300} y={330} width={270} height={190}
                  originX={originX} originY={originY}
                  color="#ffcc00" delay={800} speed={1.5}
                  title="Modifications"
                >
                  <div style={{ padding: '4px 0', color: '#ffcc00' }}>
                    <div style={{ marginBottom: 8 }}>► CYBERNETIC LEGS v3</div>
                    <div style={{ marginBottom: 8 }}>► NEURAL ENHANCER</div>
                    <div style={{ opacity: 0.5 }}>► CHEST HARDENING [LOCKED]</div>
                  </div>
                </HologramPanel>
                
                <HologramPanel
                  x={600} y={30} width={270} height={150}
                  originX={originX} originY={originY}
                  color="#00ff66" delay={600} speed={1.5}
                  title="Budget"
                >
                  <div style={{ padding: '12px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, color: '#00ff66', textShadow: '0 0 20px #00ff66' }}>50,000</div>
                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 6 }}>CREDITS AVAILABLE</div>
                  </div>
                </HologramPanel>
              </>
            )}
            
            {activeTab === 'cryovat' && (
              <>
                <HologramPanel
                  x={30} y={30} width={500} height={180}
                  originX={originX} originY={originY}
                  color="#00f0ff" delay={0} speed={1.5}
                  title="Cryogenic Storage"
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '4px 0' }}>
                    {['SHOKAT', 'MENDEZ', 'YAKOVLEV', 'CHEN'].map((agent) => (
                      <div key={agent} style={{ border: '1px solid #00f0ff', padding: 8, textAlign: 'center', background: '#00f0ff10' }}>
                        <div style={{ width: '100%', height: 50, border: '1px solid #00f0ff40', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#00f0ff40' }}>◉</div>
                        <div style={{ fontSize: 9 }}>{agent}</div>
                      </div>
                    ))}
                  </div>
                </HologramPanel>
                
                <HologramPanel
                  x={30} y={230} width={280} height={290}
                  originX={originX} originY={originY}
                  color="#00ff66" delay={500} speed={1.5}
                  title="Vital Statistics"
                >
                  <div style={{ padding: '8px 0' }}>
                    {[
                      { label: 'HEALTH', value: 85, color: '#00ff66' },
                      { label: 'STAMINA', value: 92, color: '#00f0ff' },
                      { label: 'ADRENALINE', value: 40, color: '#ff00ff' },
                      { label: 'NEURAL SYNC', value: 78, color: '#ffcc00' }
                    ].map(stat => (
                      <div key={stat.label} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 10 }}>
                          <span>{stat.label}</span>
                          <span style={{ color: stat.color }}>{stat.value}%</span>
                        </div>
                        <div style={{ height: 6, background: '#ffffff10', border: `1px solid ${stat.color}40` }}>
                          <div style={{ height: '100%', width: `${stat.value}%`, background: stat.color, boxShadow: `0 0 10px ${stat.color}` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </HologramPanel>
                
                <HologramPanel
                  x={340} y={230} width={530} height={290}
                  originX={originX} originY={originY}
                  color="#ff00ff" delay={800} speed={1.5}
                  title="Enhancement Queue"
                >
                  <div style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
                    <div style={{ flex: 1, border: '1px solid #ff00ff40', padding: 10 }}>
                      <div style={{ color: '#ff00ff', marginBottom: 6, fontSize: 10 }}>IN PROGRESS</div>
                      <div style={{ fontSize: 12 }}>ARM CYBERNETICS v2</div>
                      <div style={{ marginTop: 6, height: 4, background: '#ffffff10' }}>
                        <div style={{ height: '100%', width: '67%', background: '#ff00ff' }} />
                      </div>
                      <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>67% COMPLETE - 2:34 REMAINING</div>
                    </div>
                    <div style={{ flex: 1, border: '1px solid #ff00ff20', padding: 10, opacity: 0.6 }}>
                      <div style={{ color: '#ff00ff40', marginBottom: 6, fontSize: 10 }}>QUEUED</div>
                      <div style={{ fontSize: 12 }}>OCULAR IMPLANT</div>
                      <div style={{ fontSize: 9, opacity: 0.6, marginTop: 8 }}>COST: 15,000 CREDITS</div>
                    </div>
                  </div>
                </HologramPanel>
                
                <HologramPanel
                  x={560} y={30} width={310} height={180}
                  originX={originX} originY={originY}
                  color="#ffcc00" delay={400} speed={1.5}
                  title="Agent: Shokat"
                >
                  <div style={{ padding: '4px 0', color: '#ffcc00' }}>
                    <div style={{ marginBottom: 6 }}>CLASS: ASSAULT SPECIALIST</div>
                    <div style={{ marginBottom: 6 }}>MISSIONS: 47 COMPLETED</div>
                    <div style={{ marginBottom: 6 }}>KILLS: 312</div>
                    <div style={{ opacity: 0.7 }}>STATUS: COMBAT READY</div>
                  </div>
                </HologramPanel>
              </>
            )}
          </svg>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 20, color: '#00f0ff40', fontSize: 9, letterSpacing: '0.3em' }}>
        CLICK TABS TO REPLAY LASER CONSTRUCTION EFFECT
      </div>
    </div>
  );
}
