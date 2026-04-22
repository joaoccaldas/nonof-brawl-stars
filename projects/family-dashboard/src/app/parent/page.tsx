'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMembers, getUpcomingEvents, detectConflicts, Member, Event } from '@/lib/db';

export default function ParentView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [conflicts, setConflicts] = useState<Array<{ event1: Event; event2: Event }>>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ calendar: string; handball: string }>({
    calendar: 'Never synced',
    handball: 'Never synced'
  });

  useEffect(() => {
    const loadedMembers = getMembers();
    setMembers(loadedMembers);
    
    const loadedEvents = getUpcomingEvents(14);
    setEvents(loadedEvents);
    
    // Check conflicts for today
    const today = new Date().toISOString().split('T')[0];
    const todaysConflicts = detectConflicts(today);
    setConflicts(todaysConflicts);
  }, []);

  const handleSyncCalendar = () => {
    setSyncStatus(prev => ({ ...prev, calendar: 'Syncing...' }));
    setTimeout(() => {
      setSyncStatus(prev => ({ ...prev, calendar: `Last synced: ${new Date().toLocaleTimeString()}` }));
    }, 1500);
  };

  const handleSyncHandball = () => {
    setSyncStatus(prev => ({ ...prev, handball: 'Syncing...' }));
    setTimeout(() => {
      setSyncStatus(prev => ({ ...prev, handball: `Last synced: ${new Date().toLocaleTimeString()}` }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg">
                👨‍💼
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Parent Control
                </h1>
                <p className="text-xs text-slate-400">Manage family schedule</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
              >
                🏠 Family
              </Link>
              <Link
                href="/kid"
                className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
              >
                👦 Kids
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Alerts */}
        {conflicts.length > 0 && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-400">⚠️</span>
              <h3 className="font-semibold text-amber-400">Schedule Conflicts Detected</h3>
            </div>
            {conflicts.map((conflict, i) => (
              <p key={i} className="text-sm text-amber-300/80">
                {conflict.event1.title} overlaps with {conflict.event2.title}
              </p>
            ))}
          </div>
        )}

        {/* Sync Controls */}
        <section className="mb-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <h2 className="text-lg font-semibold mb-4 text-slate-300">Data Sync</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">📅 Google Calendar</span>
                <button 
                  onClick={handleSyncCalendar}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                >
                  Sync Now
                </button>
              </div>
              <p className="text-xs text-slate-500">{syncStatus.calendar}</p>
            </div>
            
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">🏐 Handball Schedules</span>
                <button 
                  onClick={handleSyncHandball}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                >
                  Sync Now
                </button>
              </div>
              <p className="text-xs text-slate-500">{syncStatus.handball}</p>
            </div>
          </div>
        </section>

        {/* Full Agenda */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-300">Full Agenda</h2>
            <button 
              onClick={() => setShowAddEvent(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Event
            </button>
          </div>
          
          <div className="space-y-2">
            {events.length === 0 ? (
              <p className="text-slate-500 italic p-4 bg-slate-800/30 rounded-xl">No upcoming events</p>
            ) : (
              events.map((event, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors"
                >
                  <div className="text-center min-w-[80px]">
                    <p className="text-xs text-slate-500">
                      {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm font-mono text-slate-400">
                      {new Date(event.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-slate-200">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-slate-500">{event.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        event.category === 'sport' ? 'bg-emerald-500/20 text-emerald-400' :
                        event.category === 'school' ? 'bg-blue-500/20 text-blue-400' :
                        event.category === 'work' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {event.category}
                      </span>
                      <span className="text-xs text-slate-600">
                        Source: {event.source}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {event.member_ids.map((mid, mi) => {
                      const member = members.find(m => m.id === mid);
                      return member ? (
                        <div
                          key={mi}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: member.color }}
                          title={member.name}
                        >
                          {member.name[0]}
                        </div>
                      ) : null;
                    })}
                  </div>
                  
                  <div className="flex gap-1">
                    <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors" title="Edit">
                      ✏️
                    </button>
                    <button className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Member Filter */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-slate-300">Filter by Family Member</h2>
          <div className="flex gap-3">
            {members.map(member => (
              <button
                key={member.id}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name[0]}
                </div>
                <span className="text-sm text-slate-300">{member.name}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Add Event Modal Placeholder */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Event</h3>
            <p className="text-sm text-slate-400 mb-4">Form coming in next iteration...</p>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowAddEvent(false)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddEvent(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
