import React from 'react';

export default function SpreadModal({ spread, onClose, onApprove }) {
  if (!spread) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 25, 23, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          maxWidth: '840px',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-linen)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-ink)' }}>
              Spread {spread.spreadNum}: {spread.title}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Hand-painted digital gouache proof • The Chapter Co. Studio
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              fontSize: '20px',
              color: 'var(--text-muted)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: '#f2ece4',
            }}
          >
            ✕
          </button>
        </div>

        {/* Spread High-Res Image */}
        <div style={{ flex: 1, overflow: 'auto', background: '#1c1917', display: 'flex', justifyContent: 'center' }}>
          <img
            src={spread.imageUrl}
            alt={spread.title}
            style={{ maxWidth: '100%', maxHeight: '550px', objectFit: 'contain' }}
          />
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-linen)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-parchment)',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status: </span>
            <strong
              style={{
                color: spread.status === 'approved' ? 'var(--sage-green)' : '#9c6c19',
                fontSize: '13px',
              }}
            >
              {spread.status === 'approved' ? 'Approved for Archival Print' : 'Pending Client Feedback'}
            </strong>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-linen)',
                background: '#ffffff',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              Back to Chat
            </button>
            <button
              onClick={() => {
                onApprove(spread.spreadNum);
                onClose();
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--sage-green)',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span>✅ Approve Spread {spread.spreadNum}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
