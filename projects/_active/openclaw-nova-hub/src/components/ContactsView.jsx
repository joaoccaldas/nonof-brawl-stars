import { useState, useEffect } from 'react';

const ContactsView = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/contacts.json')
      .then(res => res.json())
      .then(data => {
        setContacts(data.contacts);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load contacts:', err);
        setLoading(false);
      });
  }, []);

  const filteredContacts = contacts.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'family') return ['spouse', 'child', 'family'].includes(c.role);
    if (filter === 'work') return c.role === 'work';
    if (filter === 'friends') return c.role === 'friend';
    return true;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'self': return '👤';
      case 'spouse': return '💑';
      case 'child': return '👶';
      case 'family': return '👥';
      case 'work': return '💼';
      case 'friend': return '🤝';
      default: return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'self': return 'text-cyan-400';
      case 'spouse': return 'text-pink-400';
      case 'child': return 'text-green-400';
      case 'family': return 'text-yellow-400';
      case 'work': return 'text-blue-400';
      case 'friend': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-green-400 font-mono">
        <div className="animate-pulse">[ LOADING CONTACTS... ]</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6 border-b border-green-800 pb-4">
        <h2 className="text-xl font-bold text-green-400 font-mono mb-2">
          [ CONTACTS DATABASE ]
        </h2>
        <div className="text-sm text-green-600 font-mono">
          {contacts.length} contacts extracted from knowledge graph
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'family', 'work', 'friends'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs font-mono border transition-all ${
              filter === f
                ? 'bg-green-600 text-black border-green-400'
                : 'bg-black text-green-400 border-green-800 hover:border-green-600'
            }`}
          >
            [{f.toUpperCase()}]
          </button>
        ))}
      </div>

      {/* Contacts grid */}
      <div className="grid gap-4">
        {filteredContacts.map(contact => (
          <div
            key={contact.id}
            className="border border-green-800 p-4 bg-black/50 hover:border-green-600 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getRoleIcon(contact.role)}</span>
                <div>
                  <h3 className={`text-lg font-bold font-mono ${getRoleColor(contact.role)}`}>
                    {contact.name}
                  </h3>
                  <div className="text-xs text-green-600 font-mono uppercase tracking-wider">
                    {contact.role} {contact.relationship && `• ${contact.relationship}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-700 font-mono">
                  {contact.mentions_in_graph} mentions
                </div>
                <div className="text-xs text-green-800 font-mono">
                  since {contact.first_seen}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm font-mono">
              {contact.birthdate && (
                <div className="text-green-500">
                  <span className="text-green-700">BORN:</span> {contact.birthdate} (age {contact.age})
                </div>
              )}
              
              {contact.phone && (
                <div className="text-green-500">
                  <span className="text-green-700">PHONE:</span> {contact.phone}
                </div>
              )}

              {contact.location && (
                <div className="text-green-500">
                  <span className="text-green-700">LOC:</span> {contact.location}
                  {contact.previous_location && ` (was: ${contact.previous_location})`}
                </div>
              )}

              {contact.company && (
                <div className="text-green-500">
                  <span className="text-green-700">WORK:</span> {contact.title} @ {contact.company}
                </div>
              )}

              {contact.activities && contact.activities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {contact.activities.map(act => (
                    <span key={act} className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5">
                      {act}
                    </span>
                  ))}
                </div>
              )}

              {contact.projects && contact.projects.length > 0 && (
                <div className="mt-2">
                  <span className="text-green-700 text-xs">PROJECTS:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contact.projects.map(proj => (
                      <span key={proj} className="text-xs border border-green-800 text-green-500 px-2 py-0.5">
                        {proj}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Family links */}
              {contact.family && (
                <div className="mt-2 pt-2 border-t border-green-900/50 text-xs">
                  {contact.family.spouse && (
                    <div className="text-green-600">
                      spouse: {contacts.find(c => c.id === contact.family.spouse)?.name || contact.family.spouse}
                    </div>
                  )}
                  {contact.family.children && (
                    <div className="text-green-600">
                      children: {contact.family.children.map(c => contacts.find(x => x.id === c)?.name || c).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-green-900 text-xs text-green-700 font-mono">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-green-400 text-lg">{contacts.filter(c => c.role === 'self').length}</div>
            <div>SELF</div>
          </div>
          <div>
            <div className="text-green-400 text-lg">{contacts.filter(c => ['spouse', 'child', 'family'].includes(c.role)).length}</div>
            <div>FAMILY</div>
          </div>
          <div>
            <div className="text-green-400 text-lg">{contacts.filter(c => c.role === 'work').length}</div>
            <div>WORK</div>
          </div>
          <div>
            <div className="text-green-400 text-lg">{contacts.filter(c => c.role === 'friend').length}</div>
            <div>FRIENDS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsView;
