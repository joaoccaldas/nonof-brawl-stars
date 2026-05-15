import { useMemo } from 'react';

/**
 * DashboardExplorer — shows all sub-dashboards from all projects in one view.
 * Provides quick access to coin collection, space portfolio, Godot games, etc.
 */
export default function DashboardExplorer({ projects, onOpenDashboard }) {
  // Collect ALL dashboards across all projects
  const dashboards = useMemo(() => {
    const all = [];
    for (const p of projects) {
      for (const dash of p.subDashboards ?? []) {
        all.push({
          ...dash,
          projectId: p.id,
          projectName: p.name,
          projectDomain: p.domain,
          projectDomainColor: p.domainColor
        });
      }
    }
    // Sort by project name
    return all.sort((a, b) => a.projectName.localeCompare(b.projectName));
  }, [projects]);

  if (dashboards.length === 0) {
    return null;
  }

  const getIcon = (type) => {
    switch (type) {
      case 'godot':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z" />
          </svg>
        );
      case 'html':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
          </svg>
        );
      case 'folder':
      default:
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        );
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'godot': return 'Game';
      case 'html': return 'Dashboard';
      case 'folder': return 'App';
      default: return 'App';
    }
  };

  const handleClick = (dash) => {
    onOpenDashboard?.(dash);
    
    if (dash.type === 'godot') {
      window.open(`vscode://file/${dash.absolute}`, '_blank');
    } else if (dash.type === 'folder') {
      window.open(`vscode://file/${dash.absolute}`, '_blank');
    }
    // HTML files are handled by the parent component (App.jsx) via onOpenDashboard
  };

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-nova-50 font-display tracking-tight">
          Dashboards
        </h2>
        <span className="text-xs text-nova-200/60">
          {dashboards.length} apps across {projects.filter(p => p.subDashboards?.length).length} projects
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {dashboards.map((dash, i) => (
          <button
            key={`${dash.projectId}-${dash.label}-${i}`}
            onClick={() => handleClick(dash)}
            className="group relative flex flex-col items-start p-4 rounded-2xl glass hover:bg-white/[0.06] transition-colors text-left"
          >
            {/* Domain color indicator */}
            <div
              className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
              style={{ background: dash.projectDomainColor }}
            />

            {/* Icon */}
            <div className="mt-1 mb-2 text-nova-200/70 group-hover:text-nova-50 transition-colors">
              {getIcon(dash.type)}
            </div>

            {/* Label */}
            <div className="text-sm font-medium text-nova-50 truncate w-full">
              {dash.label}
            </div>

            {/* Project name */}
            <div className="text-[10px] text-nova-200/50 truncate w-full mt-0.5">
              {dash.projectName}
            </div>

            {/* Type badge */}
            <div className="mt-2 flex items-center justify-between w-full">
              <div className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.05] text-nova-200/60">
                {getTypeLabel(dash.type)}
              </div>
              {dash.type !== 'html' && (
                <div className="text-[8px] text-nova-200/40 truncate ml-2" title={`Requires VS Code URI Handler. Path: ${dash.absolute}`}>
                  VS Code ↗
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}