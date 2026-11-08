import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Phone, ShieldCheck, Plus, Trash2, Heart,
  CheckCircle2, BellRing, MapPin, Radio
} from 'lucide-react';
import { INITIAL_TRUSTED_CONTACTS } from '../../data/mockData';

export function SafetyCentreScreen() {
  const [contacts, setContacts] = useState(INITIAL_TRUSTED_CONTACTS);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Press-and-hold SOS state
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100%
  const [sosTriggered, setSosTriggered] = useState(false);

  useEffect(() => {
    let timer;
    if (isHolding && !sosTriggered) {
      timer = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setSosTriggered(true);
            return 100;
          }
          return prev + 5; // Takes ~2 seconds to fill
        });
      }, 100);
    } else if (!isHolding && !sosTriggered) {
      setHoldProgress(0);
    }
    return () => clearInterval(timer);
  }, [isHolding, sosTriggered]);

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    const newContact = {
      id: `tc-${Date.now()}`,
      name: newContactName,
      phone: newContactPhone,
      relationship: newContactRelation || 'Friend',
      isSosRecipient: true
    };
    setContacts([...contacts, newContact]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
    setShowAddForm(false);
  };

  const handleRemoveContact = (id) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <div className="screen-scroll-body">
      {/* Header */}
      <div>
        <span className="badge-gold">Safety & SOS</span>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
          Emergency Assistance
        </h2>
        <p style={{ fontSize: '0.76rem', color: 'var(--color-cream-muted)' }}>
          One-tap distress signal with live GPS coordinates sent to your trusted contacts.
        </p>
      </div>

      {/* SOS Trigger Button Card */}
      <div style={{
        background: '#191518',
        border: '1px solid rgba(214, 69, 69, 0.35)', borderRadius: 'var(--radius-md)', padding: '24px 16px',
        textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <span style={{
            fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em',
            fontWeight: 700, color: 'var(--color-crimson)'
          }}>
            Emergency SOS Signal
          </span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-cream)', marginTop: '2px' }}>
            Press & Hold to Trigger SOS
          </h3>
          <p style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)', maxWidth: '300px', margin: '4px auto 0' }}>
            Sends an emergency SMS with your live GPS location to your trusted contacts immediately.
          </p>
        </div>

        {/* Tactile SOS Button with Radial Progress */}
        <div style={{ position: 'relative', width: '140px', height: '140px' }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '140px', height: '140px', transform: 'rotate(-90deg)' }}>
            <circle
              cx="70"
              cy="70"
              r="62"
              stroke="rgba(239, 68, 68, 0.2)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="70"
              cy="70"
              r="62"
              stroke="#EF4444"
              strokeWidth="8"
              fill="none"
              strokeDasharray={390}
              strokeDashoffset={390 - (390 * holdProgress) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>

          <button
            onMouseDown={() => setIsHolding(true)}
            onMouseUp={() => setIsHolding(false)}
            onTouchStart={() => setIsHolding(true)}
            onTouchEnd={() => setIsHolding(false)}
            style={{
              position: 'absolute', top: '14px', left: '14px',
              width: '112px', height: '112px', borderRadius: '50%',
              background: sosTriggered ? '#10B981' : '#D64545',
              border: '3px solid rgba(255, 255, 255, 0.2)',
              color: '#fff', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              transform: isHolding ? 'scale(0.96)' : 'scale(1)',
              transition: 'transform 0.15s ease'
            }}
          >
            {sosTriggered ? (
              <>
                <CheckCircle2 size={32} />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, marginTop: '2px' }}>SENT</span>
              </>
            ) : (
              <>
                <AlertTriangle size={32} />
                <span style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.05em' }}>SOS</span>
                <span style={{ fontSize: '0.62rem', opacity: 0.85 }}>HOLD 2S</span>
              </>
            )}
          </button>
        </div>

        {/* SOS Triggered Alert Box */}
        {sosTriggered && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981',
            borderRadius: '10px', padding: '12px', width: '100%', textAlign: 'left',
            display: 'flex', flexDirection: 'column', gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981' }}>
              <Radio size={16} />
              <strong style={{ fontSize: '0.86rem' }}>Emergency Alert Dispatched!</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)' }}>
              SMS with Google Maps location sent to:
            </p>
            <ul style={{ fontSize: '0.74rem', color: 'var(--color-cream)', paddingLeft: '16px' }}>
              {contacts.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong> ({c.relationship}) — {c.phone}
                </li>
              ))}
            </ul>
            <button
              onClick={() => { setSosTriggered(false); setHoldProgress(0); }}
              style={{
                alignSelf: 'flex-start', marginTop: '6px', background: 'transparent',
                border: '1px solid #10B981', color: '#10B981', borderRadius: '4px',
                padding: '4px 10px', fontSize: '0.72rem', cursor: 'pointer'
              }}
            >
              Reset SOS Status
            </button>
          </div>
        )}
      </div>

      {/* Trusted Emergency Contacts */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800 }}>Trusted Emergency Contacts</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>
              Notified instantly when SOS is pressed or trip is shared.
            </p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            <Plus size={14} />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAddContact} style={{
            background: 'rgba(0,0,0,0.25)', border: '1px solid var(--color-ink-border)',
            borderRadius: '8px', padding: '12px', marginBottom: '14px', display: 'flex',
            flexDirection: 'column', gap: '10px'
          }}>
            <input
              type="text"
              placeholder="Full Name (e.g., Mom, Aryan)"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              style={{
                background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
                borderRadius: '6px', padding: '8px', color: 'var(--color-cream)', fontSize: '0.8rem', outline: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Phone Number (+91 98765 XXXXX)"
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
              style={{
                background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
                borderRadius: '6px', padding: '8px', color: 'var(--color-cream)', fontSize: '0.8rem', outline: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Relationship (e.g. Sibling, Roommate)"
              value={newContactRelation}
              onChange={(e) => setNewContactRelation(e.target.value)}
              style={{
                background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
                borderRadius: '6px', padding: '8px', color: 'var(--color-cream)', fontSize: '0.8rem', outline: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-cream-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem', width: 'auto' }}>
                Save Contact
              </button>
            </div>
          </form>
        )}

        {/* Contacts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {contacts.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
                borderRadius: '8px', padding: '10px 12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(232, 163, 61, 0.15)', color: 'var(--color-amber)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem'
                }}>
                  {c.name.charAt(0)}
                </div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: 'var(--color-cream)' }}>{c.name}</strong>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>
                    {c.relationship} · {c.phone}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-teal" style={{ fontSize: '0.65rem' }}>SOS Recipient</span>
                <button
                  onClick={() => handleRemoveContact(c.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-cream-muted)', cursor: 'pointer' }}
                  title="Remove Contact"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsible Drinking & BAC Tips */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-amber)' }}>
          <Heart size={18} />
          <strong style={{ fontSize: '0.88rem' }}>Responsible Drinking Guidelines</strong>
        </div>
        <ul style={{ fontSize: '0.76rem', color: 'var(--color-cream-muted)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li>Always plan your safe ride home in advance using your included ₹150 ride voucher.</li>
          <li>Never operate any motor vehicle after consuming alcohol (BAC limit in India: 0.03%).</li>
          <li>Alternate every alcoholic beverage with a glass of water or electrolyte mixer.</li>
          <li>Never consume alcohol on an empty stomach.</li>
        </ul>
      </div>
    </div>
  );
}
