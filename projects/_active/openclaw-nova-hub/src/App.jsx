import { useState, Component, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProjects } from './lib/useProjects.js';
import { useSecondBrain } from './lib/useSecondBrain.js';
import Starfield from './components/Starfield.jsx';
import Header from './components/Header.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import EntityModal from './components/EntityModal.jsx';
import IframeView from './components/IframeView.jsx';
import DashboardExplorer from './components/DashboardExplorer.jsx';
import NexusGraph from './components/NexusGraph.jsx';
import PeopleView from './components/PeopleView.jsx';
import PersonalArchive from './components/PersonalArchive.jsx';
import VoiceChat from './components/VoiceChat.jsx';
import MissionControlSidebar from './components/MissionControlSidebar.jsx';
import SystemsTelemetrySidebar from './components/SystemsTelemetrySidebar.jsx';
import CommandConsole from './components/CommandConsole.jsx';
import useLiveNovaState from './hooks/useLiveNovaState.js';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Canvas crash:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-3xl glass p-8 text-center">
          <div className="text-red-300 text-lg font-semibold mb-2">Visualization crashed</div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-synapse-cyan/20 text-synapse-cyan text-sm hover:bg-synapse-cyan/30 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { data, novaState: staticNovaState, loading, error, lastFetch } = useProjects();
  const { entities: secondBrainEntities } = useSecondBrain();
  const { novaState: liveNovaState } = useLiveNovaState(staticNovaState);
  
  const novaState = liveNovaState || staticNovaState;
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [activeView, setActiveView] = useState('nexus');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [activeIframe, setActiveIframe] = useState(null);

  const handleNavigate = (viewId) => {
    setActiveView(viewId);
    setActiveIframe(null);
    setLeftSidebarOpen(false);
  };

  const handleOpenDashboard = (dash) => {
    if (dash.type === 'html') {
      setActiveIframe(dash);
      setActiveView('iframe');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.shiftKey && e.key === 'K') {
          e.preventDefault();
          setConsoleOpen(true);
        } else if (e.key === 'k') {
          e.preventDefault();
          setPaletteOpen(true);
        } else if (e.key === '1') {
          e.preventDefault();
          setLeftSidebarOpen(prev => !prev);
        } else if (e.key === '2') {
          e.preventDefault();
          setRightSidebarOpen(prev => !prev);
        } else if (e.key === 'v') {
          e.preventDefault();
          setVoiceChatOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePaletteSelect = (item) => {
    if (item.type === 'entity') {
      setSelectedEntity(item.data);
    } else if (item.type === 'dashboard' && item.data?.url) {
      // If it's a dashboard, we can try to open it
      window.open(item.data.url, '_blank');
    } else if (item.type === 'project') {
      // Default to navigating to the explorer view for this project
      setActiveView('explorer');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Starfield />

      {/* Menu Button - All screen sizes */}
      <button
        onClick={() => setLeftSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-3 rounded-full"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5 text-synapse-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Systems Button - All screen sizes */}
      <button
        onClick={() => setRightSidebarOpen(true)}
        className="fixed top-4 right-4 z-50 p-3 rounded-full"
        aria-label="Open systems"
      >
        <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <MissionControlSidebar
        isOpen={leftSidebarOpen}
        onClose={() => setLeftSidebarOpen(false)}
        onNavigate={handleNavigate}
        activeView={activeView}
        projects={data?.projects ?? []}
        queueItems={novaState?.nova?.openLoops ?? []}
      />
      
      <SystemsTelemetrySidebar
        isOpen={rightSidebarOpen}
        onClose={() => setRightSidebarOpen(false)}
      />

      <CommandPalette 
        isOpen={paletteOpen} 
        onClose={() => setPaletteOpen(false)} 
        projects={data?.projects ?? []}
        secondBrain={secondBrainEntities}
        onSelect={handlePaletteSelect}
      />
      
      <EntityModal 
        isOpen={!!selectedEntity} 
        entity={selectedEntity} 
        onClose={() => setSelectedEntity(null)} 
      />
      
      <CommandConsole 
        isOpen={consoleOpen} 
        onClose={() => setConsoleOpen(false)} 
      />
      
      <VoiceChat 
        isOpen={voiceChatOpen} 
        onClose={() => setVoiceChatOpen(false)} 
      />

      <main className="relative z-10 min-h-screen flex flex-col">
        <Header data={data} lastFetch={lastFetch} />

        {error && (
          <div className="mx-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Data load error: {error}. Run <code className="font-mono text-[11px]">npm run scan</code> to refresh.
          </div>
        )}

        {loading && !data && (
          <div className="flex-1 grid place-items-center">
            <div className="text-nova-200/60 text-sm">Loading neural map...</div>
          </div>
        )}

        {data && (
          <div className="flex-1 p-4 md:p-6">
            <ErrorBoundary>
              {activeView === 'explorer' && (
                <DashboardExplorer 
                  projects={data.projects} 
                  onOpenDashboard={handleOpenDashboard} 
                />
              )}
              {activeView === 'iframe' && activeIframe && (
                <IframeView 
                  dash={activeIframe} 
                  onClose={() => setActiveView('explorer')} 
                />
              )}
              { activeView === 'nexus' && (
                <NexusGraph />
              )}
              {activeView === 'people' && (
                <PeopleView projects={data.projects} />
              )}
              {activeView === 'archive' && (
                <PersonalArchive projects={data.projects} />
              )}
            </ErrorBoundary>
          </div>
        )}
      </main>
    </div>
  );
}
