import React from 'react';

export default function OrderSidebar({ order, onSelectSpread, onOpenApprovalModal }) {
  if (!order) return null;

  const milestones = [
    { step: 1, label: 'Story & Photos Submitted', done: order.statusStep >= 1 },
    { step: 2, label: 'Character Illustration', done: order.statusStep >= 2 },
    { step: 3, label: 'Spread Proofing & Feedback', done: order.statusStep >= 3, active: order.statusStep === 3 },
    { step: 4, label: 'Fine Art Print & Binding', done: order.statusStep >= 4 },
    { step: 5, label: 'Dispatched to Doorstep', done: order.statusStep >= 5 },
  ];

  const approvedCount = order.approvedSpreads?.length || 0;
  const totalSpreads = order.spreadsCount || 6;
  const progressPercent = Math.round((approvedCount / totalSpreads) * 100);

  return (
    <aside className="left-sidebar">
      {/* Book Cover & Title Card */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-linen)' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <img
            src={order.previewCover}
            alt={order.bookTitle}
            style={{
              width: '64px',
              height: '84px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid #d5cbba',
            }}
          />
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                color: 'var(--brand-terracotta)',
                letterSpacing: '0.04em',
              }}
            >
              {order.bookType}
            </span>
            <h3
              style={{
                fontSize: '17px',
                color: 'var(--text-ink)',
                marginTop: '2px',
                lineHeight: '1.25',
              }}
            >
              {order.bookTitle}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Client: <strong>{order.clientName}</strong>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Spread Sign-off</span>
            <span style={{ fontWeight: '600', color: 'var(--sage-green)' }}>
              {approvedCount} of {totalSpreads} Approved ({progressPercent}%)
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '7px',
              background: '#eee7db',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #386b52, #5a9675)',
                transition: 'width 0.4s ease',
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Production Milestone Timeline */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-linen)' }}>
        <h4 style={{ fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Studio Milestones
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {milestones.map((m) => (
            <div key={m.step} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: m.done
                    ? 'var(--sage-bg)'
                    : m.active
                    ? 'var(--brand-terracotta-light)'
                    : '#eee8dd',
                  color: m.done
                    ? 'var(--sage-green)'
                    : m.active
                    ? 'var(--brand-terracotta)'
                    : '#a89c8f',
                  border: m.active ? '1.5px solid var(--brand-terracotta)' : 'none',
                }}
              >
                {m.done ? '✓' : m.step}
              </div>
              <span
                style={{
                  fontSize: '12.5px',
                  fontWeight: m.active ? '600' : '400',
                  color: m.active ? 'var(--text-ink)' : m.done ? 'var(--text-muted)' : 'var(--text-light)',
                }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Draft Spreads Gallery */}
      <div style={{ padding: '20px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Hand-Painted Spreads
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to inspect</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {order.activeDrafts?.map((draft) => (
            <div
              key={draft.spreadNum}
              onClick={() => onSelectSpread(draft)}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-linen)',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-terracotta)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-linen)')}
            >
              <img
                src={draft.imageUrl}
                alt={draft.title}
                style={{
                  width: '60px',
                  height: '45px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-ink)' }}>
                    Spread {draft.spreadNum}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: draft.status === 'approved' ? 'var(--sage-bg)' : 'var(--gold-bg)',
                      color: draft.status === 'approved' ? 'var(--sage-green)' : '#9c6c19',
                      fontWeight: '600',
                    }}
                  >
                    {draft.status === 'approved' ? 'Approved' : 'Reviewing'}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {draft.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
