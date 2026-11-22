import React, { useState } from 'react';

export default function AiAssistantSidebar({ currentOrder, messages, onPostAiSummary }) {
  const [loading, setLoading] = useState(false);
  const [aiBrief, setAiBrief] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/summarize-revisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: currentOrder?.orderId,
          messages: messages.map((m) => ({ text: m.text, role: m.role })),
        }),
      });
      const data = await res.json();
      setAiBrief(data);
      if (onPostAiSummary) {
        onPostAiSummary(data);
      }
    } catch (e) {
      console.error('Failed to summarize revisions:', e);
    } finally {
      setLoading(false);
    }
  };

  const copyBrief = () => {
    if (!aiBrief) return;
    const text = `The Chapter Co. — Illustrator Brief for ${aiBrief.bookTitle} (${aiBrief.orderId})\n\nSummary: ${aiBrief.summary}\n\nAction Items:\n${(aiBrief.actionItems || []).map((item, i) => `${i + 1}. [Spread ${item.spread} - ${item.category} (${item.priority})]: ${item.action}`).join('\n')}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="right-sidebar">
      {/* ChapterBot AI Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-linen)', background: 'var(--gold-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#d4a34b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
            }}
          >
            ✨
          </div>
          <div>
            <h3 style={{ fontSize: '15px', color: '#684a0c', fontWeight: '600' }}>ChapterBot Studio AI</h3>
            <p style={{ fontSize: '11px', color: '#926a19' }}>Real-time design brief &amp; proof tracker</p>
          </div>
        </div>

        <button
          onClick={generateSummary}
          disabled={loading}
          style={{
            marginTop: '14px',
            width: '100%',
            padding: '10px 14px',
            background: '#875d16',
            color: 'white',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12.5px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Analyzing Client Chat...' : '✨ Generate Illustrator Action Brief'}
        </button>
      </div>

      {/* AI Action Brief Content */}
      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {aiBrief ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Executive Brief
              </span>
              <button
                onClick={copyBrief}
                style={{
                  fontSize: '11px',
                  color: 'var(--brand-terracotta)',
                  fontWeight: '600',
                  background: 'transparent',
                }}
              >
                {copied ? '✓ Copied!' : '📋 Copy Brief'}
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-ink)', lineHeight: '1.45' }}>
              {aiBrief.summary}
            </p>

            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Action Items for Illustration Team
              </span>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {aiBrief.actionItems?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#ffffff',
                      border: '1px solid var(--border-linen)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '12px', color: 'var(--brand-terracotta)' }}>
                        Spread {item.spread} • {item.category}
                      </strong>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: item.priority === 'Urgent' ? '#fde8e8' : '#f5eedf',
                          color: item.priority === 'Urgent' ? '#c81e1e' : '#8f681a',
                          fontWeight: '600',
                        }}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-ink)', lineHeight: '1.4' }}>
                      {item.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '30px 10px' }}>
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>🎨</p>
            <p style={{ fontWeight: '500', color: 'var(--text-ink)', marginBottom: '4px' }}>No active brief generated</p>
            <p style={{ fontSize: '12px', lineHeight: '1.4' }}>
              Click <strong>Generate Illustrator Action Brief</strong> above to let ChapterBot parse chat revisions into a studio spec.
            </p>
          </div>
        )}

        {/* Studio Print Specs Card */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-linen)' }}>
          <h4 style={{ fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Print &amp; Bind Specifications
          </h4>
          <ul style={{ fontSize: '12px', color: 'var(--text-ink)', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none' }}>
            <li>📖 <strong>Paper:</strong> 220 GSM Natural Archival Matte</li>
            <li>🎨 <strong>Inks:</strong> 8-color Lucia PRO Pigment</li>
            <li>🧵 <strong>Binding:</strong> Smyth-sewn layflat linen hardcover</li>
            <li>📍 <strong>Studio:</strong> The Chapter Co. Bengaluru Craft Atelier</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
