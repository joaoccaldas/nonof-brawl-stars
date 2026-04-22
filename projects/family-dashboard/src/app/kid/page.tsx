'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMembers, getUpcomingEvents, getMemberSchedule, Member, Event } from '@/lib/db';

export default function KidView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedKid, setSelectedKid] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<(Event | any)[]>([]);
  const [nextGame, setNextGame] = useState<{ days: number; title: string } | null>(null);

  useEffect(() => {
    const loadedMembers = getMembers().filter(m => m.role === 'kid');
    setMembers(loadedMembers);
    
    if (loadedMembers.length > 0) {
      setSelectedKid(loadedMembers[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedKid) {
      const kidSchedule = getMemberSchedule(selectedKid, 14);
      setSchedule(kidSchedule);
      
      // Find next handball game
      const games = kidSchedule.filter((s: any) => 
        s.category === 'sport' || s.activity_name?.toLowerCase().includes('handball')
      );
      
      if (games.length > 0) {
        const next = games[0];
        const isActivity = 'scheduled_date' in next;
        const nextDate = isActivity ? (next as any).scheduled_date : (next as any).start_time;
        const nextTitle = isActivity ? (next as any).activity_name : (next as any).title;
        const daysUntil = Math.ceil(
          (new Date(nextDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        setNextGame({
          days: daysUntil,
          title: nextTitle || 'Game'
        });
      }
    }
  }, [selectedKid]);

  const getKidEmoji = (name: string) => {
    if (name.toLowerCase().includes('lukas')) return '⚽';
    if (name.toLowerCase().includes('noah')) return '🏐';
    return '👦';
  };

  const getKidColor = (name: string) => {
    if (name.toLowerCase().includes('lukas')) return 'from-green-500 to-emerald-600';
    if (name.toLowerCase().includes('noah')) return 'from-amber-500 to-orange-600';
    return 'from-blue-500 to-purple-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Fun Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center text-2xl animate-pulse">
                🌟
              </div>
              <div>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  My Schedule
                </h1>
                <p className="text-xs text-white/60">All your fun stuff in one place!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                🏠 Home
              </Link>
              <Link
                href="/parent"
                className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                👨‍💼 Parent
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Kid Selector */}
        <section className="mb-8">
          <div className="flex justify-center gap-4">
            {members.map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedKid(member.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  selectedKid === member.id
                    ? 'bg-white/20 border-white/50 scale-110'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getKidColor(member.name)} flex items-center justify-center text-3xl shadow-lg`}>
                  {getKidEmoji(member.name)}
                </div>
                <span className="font-bold text-lg">{member.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Next Game Countdown */}
        {nextGame && (
          <section className="mb-8">
            <div className="bg-gradient-to-r from-yellow-500/20 to-pink-500/20 rounded-2xl p-6 border border-yellow-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-300 mb-1">Next game in</p>
                  <p className="text-4xl font-bold text-white">
                    {nextGame.days === 0 ? 'TODAY! 🎉' : nextGame.days === 1 ? '1 day' : `${nextGame.days} days`}
                  </p>
                  <p className="text-sm text-white/70 mt-1">{nextGame.title}</p>
                </div>
                <div className="text-6xl">{nextGame.days <= 1 ? '🔥' : nextGame.days <= 3 ? '⚡' : '📅'}</div>
              </div>
            </div>
          </section>
        )}

        {/* Today's Schedule */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📅</span> Today
          </h2>
          
          <div className="space-y-3">
            {schedule.filter((s: any) => {
              const date = new Date(s.start_time || s.scheduled_date);
              return date.toDateString() === new Date().toDateString();
            }).length === 0 ? (
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                <p className="text-4xl mb-2">🎮</p>
                <p className="text-white/60">No plans today — time to play!</p>
              </div>
            ) : (
              schedule
                .filter((s: any) => {
                  const date = new Date(s.start_time || s.scheduled_date);
                  return date.toDateString() === new Date().toDateString();
                })
                .map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/20"
                  >
                    <div className="text-3xl">
                      {item.category === 'sport' || item.activity_name?.includes('handball') ? '🏐' :
                       item.category === 'school' ? '📚' :
                       item.category === 'family' ? '👨‍👩‍👦' : '📌'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">{item.title || item.activity_name}</p>
                      <p className="text-white/60 text-sm">
                        {new Date(item.start_time || item.scheduled_date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>

        {/* Coming Up */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🚀</span> Coming Up
          </h2>
          
          <div className="space-y-3">
            {schedule
              .filter((s: any) => {
                const date = new Date(s.start_time || s.scheduled_date);
                return date > new Date() && date.toDateString() !== new Date().toDateString();
              })
              .slice(0, 5)
              .map((item: any, i: number) => {
                const date = new Date(item.start_time || item.scheduled_date);
                const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold">{daysUntil}d</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.title || item.activity_name}</p>
                      <p className="text-xs text-white/50">
                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-2xl">
                      {item.category === 'sport' || item.activity_name?.includes('handball') ? '🏐' :
                       item.category === 'school' ? '📚' :
                       item.category === 'family' ? '👨‍👩‍👦' : '📌'}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Fun Stats */}
        <section className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30 text-center">
            <p className="text-3xl mb-1">🏆</p>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-white/60">Games played</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 text-center">
            <p className="text-3xl mb-1">⭐</p>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-white/60">Goals scored</p>
          </div>
        </section>
      </main>
    </div>
  );
}
