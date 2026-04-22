'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMembers, getUpcomingEvents, Member, Event } from '@/lib/db';

export default function FamilyView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [today] = useState(new Date());

  useEffect(() => {
    // Load family members and events
    const loadedMembers = getMembers();
    setMembers(loadedMembers);
    
    const loadedEvents = getUpcomingEvents(7);
    setEvents(loadedEvents);
  }, []);

  const getDaysOfWeek = () => {
    const days = [];
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDateNum = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => {
      const eventDate = new Date(e.start_time).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const days = getDaysOfWeek();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg">
                🏠
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Caldas Family
                </h1>
                <p className="text-xs text-slate-400">
                  {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/parent"
                className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
              >
                👨‍💼 Parent
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
        {/* Family Members */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-slate-300">Who&apos;s Home</h2>
          <div className="flex gap-4">
            {members.map(member => (
              <div
                key={member.id}
                className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: member.color + '20', border: `2px solid ${member.color}` }}
                >
                  {member.name[0]}
                </div>
                <div>
                  <p className="font-medium text-slate-200">{member.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Weekly Calendar Grid */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-300">This Week</h2>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>🌤️</span>
              <span>Stockholm</span>
              <span className="text-cyan-400">12°C</span>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={i}
                  className={`min-h-[120px] p-3 rounded-xl border transition-all ${
                    isToday(day)
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600'
                  }`}
                >
                  <div className={`text-center mb-2 ${isToday(day) ? 'text-cyan-400' : 'text-slate-400'}`}>
                    <p className="text-xs font-medium">{formatDayName(day)}</p>
                    <p className={`text-lg font-bold ${isToday(day) ? 'text-white' : ''}`}>
                      {formatDateNum(day)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event, ei) => (
                      <div
                        key={ei}
                        className="px-2 py-1 text-xs rounded bg-slate-700/50 text-slate-300 truncate"
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-slate-500 text-center">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Today&apos;s Summary */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-slate-300">Today&apos;s Schedule</h2>
          <div className="space-y-3">
            {getEventsForDay(today).length === 0 ? (
              <p className="text-slate-500 italic">No events scheduled for today</p>
            ) : (
              getEventsForDay(today).map((event, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                >
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm text-slate-400">
                      {new Date(event.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-200">{event.title}</p>
                    <p className="text-sm text-slate-500">{event.description}</p>
                  </div>
                  <div className="flex -space-x-2">
                    {event.member_ids.slice(0, 3).map((mid, mi) => {
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
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <p className="text-2xl font-bold text-cyan-400">{events.length}</p>
            <p className="text-sm text-slate-500">Events this week</p>
          </div>
          <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <p className="text-2xl font-bold text-emerald-400">2</p>
            <p className="text-sm text-slate-500">Handball games</p>
          </div>
          <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <p className="text-2xl font-bold text-purple-400">0</p>
            <p className="text-sm text-slate-500">Conflicts</p>
          </div>
        </section>
      </main>
    </div>
  );
}
