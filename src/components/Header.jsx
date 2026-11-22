import React from 'react';

export default function Header({ currentOrder, role, onToggleRole, connectionStatus, orders, onSelectOrder }) {
  return (
    <header className="app-header">
      <div className="brand-badge">
        <div className="brand-logo-img">
          <span>📖</span>
        </div>
        <div>
          <div className="brand-title">the Chapter Co.</div>
          <div className="brand-subtitle">ChapterChat Studio • Powered by Nexconn Chat SDK</div>
        </div>
      </div>

      <div className="header-actions">
        {/* Order Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Order:</span>
          <select
            value={currentOrder?.orderId || ''}
            onChange={(e) => {
              const selected = orders.find((o) => o.orderId === e.target.value);
              if (selected) onSelectOrder(selected);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-linen)',
              background: 'var(--bg-parchment)',
              fontSize: '13px',
              fontWeight: '500',
              color: 'var(--text-ink)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {orders.map((o) => (
              <option key={o.orderId} value={o.orderId}>
                {o.bookTitle} ({o.orderId})
              </option>
            ))}
          </select>
        </div>

        {/* Role Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card-subtle)',
            padding: '3px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-linen)',
          }}
        >
          <button
            onClick={() => onToggleRole('client')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: '600',
              background: role === 'client' ? 'var(--brand-terracotta)' : 'transparent',
              color: role === 'client' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            Client View
          </button>
          <button
            onClick={() => onToggleRole('designer')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: '600',
              background: role === 'designer' ? 'var(--brand-terracotta)' : 'transparent',
              color: role === 'designer' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            Lead Illustrator
          </button>
        </div>

        {/* Nexconn Real-time Connection Status */}
        <div className={`status-pill ${connectionStatus === 'connected' ? 'green' : 'gold'}`}>
          <span className="status-dot"></span>
          <span>{connectionStatus === 'connected' ? 'Nexconn Edge: Live' : 'Connecting SDK...'}</span>
        </div>
      </div>
    </header>
  );
}
