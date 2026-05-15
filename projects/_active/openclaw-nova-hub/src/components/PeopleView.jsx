import { useState, useEffect, useMemo } from 'react';

// Dynamic initials will be used instead of hardcoded emojis

const PRIORITY_COLORS = {
  high: 'border-fuchsia-500/50 bg-fuchsia-500/10',
  medium: 'border-emerald-500/50 bg-emerald-500/10',
  low: 'border-white/20 bg-white/5'
};

export default function PeopleView({ onClose }) {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/contacts.json')
      .then(r => r.json())
      .then(data => {
        setContacts(data.contacts || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredContacts = useMemo(() => {
    let result = contacts;
    
    if (filter === 'high') result = result.filter(c => c.priority === 'high');
    if (filter === 'discovered') result = result.filter(c => c.tags.includes('discovered'));
    if (filter === 'family') result = result.filter(c => c.tags.includes('family'));
    if (filter === 'work') result = result.filter(c => c.tags.includes('miele') || c.tags.includes('work'));
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(s) ||
        c.role.toLowerCase().includes(s) ||
        c.tags.some(t => t.toLowerCase().includes(s))
      );
    }
    
    return result;
  }, [contacts, filter, search]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-nova-200/50">
          <div className="w-6 h-6 border-2 border-synapse-cyan/30 border-t-synapse-cyan rounded-full animate-spin" />
          <span>Loading contacts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <span className="text-lg">👥</span>
          </div>
          <div>
            <h2 className="text-base font-medium text-nova-50">People</h2>
            <p className="text-xs text-nova-200/40">{contacts.length} contacts · {contacts.filter(c => c.priority === 'high').length} priority</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-sm text-nova-200/50 hover:text-nova-100 transition-colors"
          >
            Close
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All', count: contacts.length },
          { id: 'high', label: 'Priority', count: contacts.filter(c => c.priority === 'high').length },
          { id: 'family', label: 'Family', count: contacts.filter(c => c.tags.includes('family')).length },
          { id: 'work', label: 'Work', count: contacts.filter(c => c.tags.includes('work') || c.tags.includes('miele')).length }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
              filter === f.id 
                ? 'bg-synapse-cyan/20 border border-synapse-cyan/40 text-synapse-cyan' 
                : 'bg-white/5 border border-white/10 text-nova-200/60 hover:bg-white/10'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-nova-100 placeholder:text-nova-200/30 focus:border-synapse-cyan/50 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-nova-200/40 hover:text-nova-100"
          >
            ×
          </button>
        )}
      </div>

      {/* Contact Grid */}
      <div className="flex-1 overflow-y-auto space-y-2 -mx-2 px-2">
        {filteredContacts.slice(0, 50).map(contact => (
          <button
            key={contact.name}
            onClick={() => setSelectedContact(contact)}
            className={`w-full text-left rounded-xl border ${PRIORITY_COLORS[contact.priority] || PRIORITY_COLORS.low} p-3 hover:scale-[1.01] transition-transform`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm font-semibold tracking-wider shrink-0 text-nova-100 uppercase">
                {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-nova-50 truncate">{contact.name}</span>
                  {contact.priority === 'high' && <span className="text-[10px] text-fuchsia-400">★</span>}
                </div>
                <p className="text-xs text-nova-200/50 capitalize">{contact.role}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {contact.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-nova-200/60 capitalize">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-nova-200/30 mt-1">
                  {contact.mentionCount} mention{contact.mentionCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </button>
        ))}
        
        {filteredContacts.length > 50 && (
          <p className="text-center text-xs text-nova-200/30 py-2">
            +{filteredContacts.length - 50} more contacts
          </p>
        )}
        
        {filteredContacts.length === 0 && (
          <div className="text-center py-8 text-nova-200/40">
            No contacts found
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedContact(null)}
        >
          <div 
            className="w-full max-w-md rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-lg font-semibold tracking-wider text-nova-100 uppercase">
                {selectedContact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <h3 className="font-medium text-nova-50 text-lg">{selectedContact.name}</h3>
                <p className="text-sm text-nova-200/50 capitalize">{selectedContact.role}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {selectedContact.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-nova-200/70 capitalize">
                  {tag}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-nova-200/40 mb-2">Recent mentions ({selectedContact.mentionCount} total)</p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedContact.mentions.slice(0, 5).map((m, i) => (
                    <div key={i} className="text-xs bg-white/5 rounded-lg p-2">
                      <p className="text-synapse-cyan/80 mb-1">{m.file}</p>
                      {m.context && <p className="text-nova-200/60 truncate">...{m.context.slice(0, 100)}...</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedContact(null)}
              className="mt-4 w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
