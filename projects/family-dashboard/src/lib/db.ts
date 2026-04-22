// Family Dashboard Data Layer
// Uses JSON storage for browser compatibility
// TODO: Replace with actual SQLite on server-side API routes

// Types
export interface Member {
  id: number;
  name: string;
  role: 'parent' | 'kid';
  color: string;
  avatar_url?: string;
  created_at: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  member_ids: number[];
  category: 'school' | 'sport' | 'family' | 'work' | 'health' | 'other';
  source: 'manual' | 'calendar' | 'handball';
  external_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  name: string;
  type: 'handball' | 'soccer' | 'school' | 'other';
  team_name?: string;
  schedule_pattern?: string;
  location?: string;
  member_id: number;
  external_source?: string;
  external_id?: string;
  created_at: string;
}

export interface ActivityInstance {
  id: number;
  activity_id: number;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  notes?: string;
}

export interface Reminder {
  id: number;
  event_id?: number;
  activity_instance_id?: number;
  remind_at: string;
  type: 'push' | 'email';
  status: 'pending' | 'sent' | 'dismissed';
  created_at: string;
}

// In-memory storage (will persist to localStorage)
let members: Member[] = [];
let events: Event[] = [];
let activities: Activity[] = [];
let activityInstances: ActivityInstance[] = [];
let reminders: Reminder[] = [];
let initialized = false;

// Initialize with seed data
function seedData() {
  const now = new Date().toISOString();
  
  // Seed family members
  members = [
    { id: 1, name: 'João', role: 'parent', color: '#3b82f6', created_at: now },
    { id: 2, name: 'Linn', role: 'parent', color: '#ec4899', created_at: now },
    { id: 3, name: 'Lukas', role: 'kid', color: '#22c55e', created_at: now },
    { id: 4, name: 'Noah', role: 'kid', color: '#f59e0b', created_at: now },
  ];
  
  // Seed some sample events
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  events = [
    {
      id: 1,
      title: 'Lukas Handball Practice',
      description: 'P2014 Svart team practice',
      start_time: tomorrow.toISOString(),
      end_time: new Date(tomorrow.getTime() + 90 * 60000).toISOString(),
      member_ids: [3],
      category: 'sport',
      source: 'manual',
      created_at: now,
      updated_at: now
    },
    {
      id: 2,
      title: 'Family Dinner',
      description: 'Indian food night!',
      start_time: new Date(tomorrow.getTime() + 5 * 60 * 60000).toISOString(),
      member_ids: [1, 2, 3, 4],
      category: 'family',
      source: 'manual',
      created_at: now,
      updated_at: now
    }
  ];
  
  // Seed activities
  activities = [
    {
      id: 1,
      name: 'Handball Practice',
      type: 'handball',
      team_name: 'P2014 Svart',
      location: 'Hässelby SK',
      member_id: 3,
      external_source: 'handballskanalen',
      created_at: now
    },
    {
      id: 2,
      name: 'Handball Practice',
      type: 'handball',
      team_name: 'P2017',
      location: 'Hässelby SK',
      member_id: 4,
      external_source: 'handballskanalen',
      created_at: now
    }
  ];
  
  // Seed some activity instances
  activityInstances = [
    {
      id: 1,
      activity_id: 1,
      scheduled_date: tomorrow.toISOString().split('T')[0],
      start_time: '18:00',
      end_time: '19:30',
      location: 'Hässelby SK',
      status: 'scheduled'
    }
  ];
  
  saveToStorage();
}

function saveToStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('family-dashboard-data', JSON.stringify({
      members, events, activities, activityInstances, reminders
    }));
  }
}

function loadFromStorage() {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('family-dashboard-data');
    if (data) {
      const parsed = JSON.parse(data);
      members = parsed.members || members;
      events = parsed.events || events;
      activities = parsed.activities || activities;
      activityInstances = parsed.activityInstances || activityInstances;
      reminders = parsed.reminders || reminders;
    }
  }
}

export function initDB() {
  if (initialized) return;
  
  loadFromStorage();
  
  if (members.length === 0) {
    seedData();
  }
  
  initialized = true;
}

// Member operations
export function getMembers(): Member[] {
  initDB();
  return members;
}

export function addMember(member: Omit<Member, 'id' | 'created_at'>): Member {
  initDB();
  const newMember: Member = {
    ...member,
    id: Math.max(0, ...members.map(m => m.id)) + 1,
    created_at: new Date().toISOString()
  };
  members.push(newMember);
  saveToStorage();
  return newMember;
}

// Event operations
export function getUpcomingEvents(days: number = 7): Event[] {
  initDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  
  return events
    .filter(e => new Date(e.start_time) >= new Date() && new Date(e.start_time) <= cutoff)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

export function getEventsForDate(date: string): Event[] {
  initDB();
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  return events
    .filter(e => {
      const eventDate = new Date(e.start_time);
      return eventDate >= new Date(date) && eventDate < nextDay;
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

export function addEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Event {
  initDB();
  const now = new Date().toISOString();
  const newEvent: Event = {
    ...event,
    id: Math.max(0, ...events.map(e => e.id)) + 1,
    created_at: now,
    updated_at: now
  };
  events.push(newEvent);
  saveToStorage();
  return newEvent;
}

export function getMemberSchedule(memberId: number, days: number = 7): (Event | (ActivityInstance & { activity_name?: string }))[] {
  initDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  
  // Get events where member is involved
  const memberEvents = events.filter(e => 
    e.member_ids.includes(memberId) &&
    new Date(e.start_time) >= new Date() &&
    new Date(e.start_time) <= cutoff
  );
  
  // Get activity instances for this member
  const memberActivities = activities.filter(a => a.member_id === memberId);
  const memberActivityIds = memberActivities.map(a => a.id);
  
  const instances = activityInstances
    .filter(ai => 
      memberActivityIds.includes(ai.activity_id) &&
      new Date(ai.scheduled_date) >= new Date() &&
      new Date(ai.scheduled_date) <= cutoff &&
      ai.status === 'scheduled'
    )
    .map(ai => {
      const activity = activities.find(a => a.id === ai.activity_id);
      return { ...ai, activity_name: activity?.name };
    });
  
  return [...memberEvents, ...instances].sort((a, b) => {
    const dateA = new Date((a as any).start_time || (a as any).scheduled_date);
    const dateB = new Date((b as any).start_time || (b as any).scheduled_date);
    return dateA.getTime() - dateB.getTime();
  });
}

// Activity operations
export function addActivity(activity: Omit<Activity, 'id' | 'created_at'>): Activity {
  initDB();
  const newActivity: Activity = {
    ...activity,
    id: Math.max(0, ...activities.map(a => a.id)) + 1,
    created_at: new Date().toISOString()
  };
  activities.push(newActivity);
  saveToStorage();
  return newActivity;
}

export function addActivityInstance(instance: Omit<ActivityInstance, 'id'>): ActivityInstance {
  initDB();
  const newInstance: ActivityInstance = {
    ...instance,
    id: Math.max(0, ...activityInstances.map(ai => ai.id)) + 1
  };
  activityInstances.push(newInstance);
  saveToStorage();
  return newInstance;
}

// Calendar sync placeholder
export function syncFromCalendar(calendarEvents: any[]): Event[] {
  initDB();
  const newEvents: Event[] = [];
  
  for (const calEvent of calendarEvents) {
    // Check if already exists
    const existing = events.find(e => e.external_id === calEvent.id);
    if (existing) continue;
    
    const event = addEvent({
      title: calEvent.summary || 'Untitled',
      description: calEvent.description,
      start_time: calEvent.start?.dateTime || calEvent.start?.date,
      end_time: calEvent.end?.dateTime || calEvent.end?.date,
      member_ids: [], // TODO: Map to family members
      category: 'family',
      source: 'calendar',
      external_id: calEvent.id
    });
    
    newEvents.push(event);
  }
  
  return newEvents;
}

// Handball sync placeholder
export function syncFromHandballAPI(games: any[]): ActivityInstance[] {
  initDB();
  // TODO: Implement handball API integration
  console.log('Handball games:', games);
  return [];
}

// Conflict detection
export function detectConflicts(date: string): Array<{ event1: Event; event2: Event }> {
  initDB();
  const dayEvents = getEventsForDate(date);
  const conflicts = [];
  
  for (let i = 0; i < dayEvents.length; i++) {
    for (let j = i + 1; j < dayEvents.length; j++) {
      const e1 = dayEvents[i];
      const e2 = dayEvents[j];
      
      // Check overlap
      const start1 = new Date(e1.start_time).getTime();
      const end1 = e1.end_time ? new Date(e1.end_time).getTime() : start1 + 3600000;
      const start2 = new Date(e2.start_time).getTime();
      const end2 = e2.end_time ? new Date(e2.end_time).getTime() : start2 + 3600000;
      
      if (start1 < end2 && start2 < end1) {
        conflicts.push({ event1: e1, event2: e2 });
      }
    }
  }
  
  return conflicts;
}
